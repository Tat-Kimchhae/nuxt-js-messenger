export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  let text: string | undefined
  let file: { data: Buffer; type?: string } | undefined

  if ((getHeader(event, 'content-type') ?? '').startsWith('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    text = parts?.find((p) => p.name === 'text')?.data.toString()
    file = parts?.find((p) => p.name === 'image')
  } else {
    text = (await readBody<{ text?: string }>(event))?.text
  }

  const body = text?.trim() || null
  if (!body && !file) throw createError({ statusCode: 400, statusMessage: 'Message is empty' })

  if (file) {
    if (!file.type?.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only images are allowed' })
    }
    if (file.data.length > 5 * 1024 * 1024) {
      throw createError({ statusCode: 413, statusMessage: 'Image must be under 5MB' })
    }
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, users: { some: { id: user.id } } },
    select: { id: true },
  })
  if (!conversation) throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })

  let image: string | null = null
  if (file) {
    try {
      image = await uploadImage(file.data)
    } catch (err) {
      console.error('Cloudinary upload failed:', err)
      throw createError({ statusCode: 502, statusMessage: 'Image upload failed' })
    }
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { body, image, conversationId: id, senderId: user.id },
    }),
    prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    }),
  ])

  return {
    id: message.id,
    senderId: 'me',
    text: message.body ?? '',
    image: message.image,
    createdAt: message.createdAt,
    read: false,
  }
})