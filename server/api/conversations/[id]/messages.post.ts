import pusher from "~~/server/utils/pusher"
import { serializeMessage } from "~~/server/utils/serializeMessage"

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  let text: string | undefined
  let file: { data: Buffer; type?: string } | undefined
  let audioFile: { data: Buffer; type?: string } | undefined
  let audioDurationSeconds: number | null = null

  if ((getHeader(event, 'content-type') ?? '').startsWith('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    text = parts?.find((p) => p.name === 'text')?.data.toString()
    file = parts?.find((p) => p.name === 'image')
    audioFile = parts?.find((p) => p.name === 'audio')
    const audioDurationPart = parts?.find((p) => p.name === 'audioDurationSeconds')
    if (audioDurationPart) {
      const durationValue = audioDurationPart.data.toString()
      const parsedDuration = Number(durationValue)
      if (
        !durationValue.trim() ||
        !Number.isInteger(parsedDuration) ||
        parsedDuration < 1 ||
        parsedDuration > 120
      ) {
        throw createError({ statusCode: 400, statusMessage: 'Audio duration must be between 1 and 120 seconds' })
      }
      audioDurationSeconds = parsedDuration
    }
  } else {
    text = (await readBody<{ text?: string }>(event))?.text
  }

  const body = text?.trim() || null
  if (!body && !file && !audioFile) throw createError({ statusCode: 400, statusMessage: 'Message is empty' })

  if (file) {
    if (!file.type?.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only images are allowed' })
    }
    if (file.data.length > 5 * 1024 * 1024) {
      throw createError({ statusCode: 413, statusMessage: 'Image must be under 5MB' })
    }
  }

  if (audioFile) {
    if (!audioFile.type?.startsWith('audio/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only audio files are allowed' })
    }
    if (audioFile.data.length > 5 * 1024 * 1024) {
      throw createError({ statusCode: 413, statusMessage: 'Audio must be under 5MB' })
    }
    if (audioDurationSeconds === null) {
      throw createError({ statusCode: 400, statusMessage: 'Audio duration must be between 1 and 120 seconds' })
    }
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, users: { some: { id: user.id } } },
    select: { id: true, users: { select: { id: true } } },
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

  let audio: string | null = null
  if (audioFile) {
    try {
      audio = await uploadAudio(audioFile.data)
    } catch (err) {
      console.error('Cloudinary audio upload failed:', err)
      throw createError({ statusCode: 502, statusMessage: 'Audio upload failed' })
    }
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { body, image, audio, audioDurationSeconds, conversationId: id, senderId: user.id },
    }),
    prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    }),
  ])

  try {
    const otherUserIds = conversation.users
      .map((member) => member.id)
      .filter((memberId) => memberId !== user.id)
    const serializedMessage = serializeMessage(message, user.id)
    await pusher.trigger(`private-conversation-${id}`, 'message:new', serializedMessage)

    const preview = message.body ?? (message.image ? 'Sent a photo' : message.audio ? 'Sent a voice message' : '')
    const time = timeAgo(message.createdAt)
    for (const otherUserId of otherUserIds) {
      const unread = await prisma.message.count({
        where: {
          conversationId: id,
          senderId: { not: otherUserId },
          readAt: null,
        },
      })
      await pusher.trigger(`private-user-${otherUserId}`, 'conversation:updated', {
        id,
        preview,
        time,
        unread,
      })
    }
  } catch (err) {
    console.error('Pusher trigger failed:', err)
  }

  return serializeMessage(message, user.id)
})