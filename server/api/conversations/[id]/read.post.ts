import pusher from "~~/server/utils/pusher";

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

  const readAt = new Date();
  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt },
  });

  try {
    await pusher.trigger(`private-conversation-${id}`, "messages:read", {
      readerId: user.id,
      readAt,
    });
  } catch (err) {
    console.error("Pusher trigger failed:", err);
  }

  return { status: true };
});
