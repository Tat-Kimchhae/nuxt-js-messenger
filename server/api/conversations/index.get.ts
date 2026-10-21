import { serializeConversation } from "~~/server/utils/serializeConversation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { q } = getQuery(event) as { q?: string };
  const search = q?.trim();

  const conversations = await prisma.conversation.findMany({
    where: {
      users: { some: { id: user.id } },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          {
            messages: {
              some: { body: { contains: search, mode: "insensitive" } },
            },
          },
          {
            users: {
              some: {
                id: { not: user.id },
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        ],
      }),
    },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, image: true, audio: true, createdAt: true },
      },
      _count: {
        select: {
          messages: {
            where: { senderId: { not: user.id }, readAt: null },
          },
        },
      },
    },
  });

  return conversations.map((conversation) =>
    serializeConversation(
      conversation,
      user.id,
      conversation._count.messages,
    ),
  );
});
