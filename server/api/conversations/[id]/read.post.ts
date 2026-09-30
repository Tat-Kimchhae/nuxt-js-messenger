export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, "id")!;

  const conversation = await prisma.conversation.findFirst({
    where: { id, users: { some: { id: user.id } } },
    select: { id: true },
  });
  if (!conversation)
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
    });

  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return { status: true };
});
