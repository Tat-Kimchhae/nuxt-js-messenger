export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readBody<{ socket_id?: string; channel_name?: string }>(
    event,
  );
  const socketId = body?.socket_id;
  const channelName = body?.channel_name;

  if (!socketId || !channelName) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing socket_id or channel_name",
    });
  }

  const isUserChannel = channelName === `private-user-${user.id}`;
  const conversationMatch = /^private-conversation-(.+)$/.exec(channelName);

  let allowed = isUserChannel;

  if (!allowed && conversationMatch) {
    const conversationId = conversationMatch[1];
    const membership = await prisma.conversation.findFirst({
      where: { id: conversationId, users: { some: { id: user.id } } },
      select: { id: true },
    });
    allowed = Boolean(membership);
  }

  if (!allowed) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  return pusher.authorizeChannel(socketId, channelName);
});
