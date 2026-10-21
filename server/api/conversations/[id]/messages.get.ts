import { serializeMessage } from "~~/server/utils/serializeMessage";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, "id")!;
  const query = getQuery(event);

  const limit = Math.min(Math.max(Number(query.limit) || 30, 1), 100);
  const before = typeof query.before === "string" ? query.before : undefined;

  const conversation = await prisma.conversation.findFirst({
    where: { id, users: { some: { id: user.id } } },
    select: { id: true },
  });
  if (!conversation)
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
    });

  const rows = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1, // one extra to detect more pages
    ...(before ? { cursor: { id: before }, skip: 1 } : {}),
    select: {
      id: true,
      body: true,
      image: true,
      audio: true,
      audioDurationSeconds: true,
      senderId: true,
      createdAt: true,
      readAt: true,
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    messages: page.reverse().map((message) => serializeMessage(message, user.id)),
    nextCursor: hasMore ? page[0].id : null, // oldest id in this page
  };
});