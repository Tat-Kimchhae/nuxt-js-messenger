import { serializeConversation } from "~~/server/utils/serializeConversation";

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const requestBody = await readBody<{ friendId?: unknown }>(event);
    const friendId = requestBody?.friendId;

    if (typeof friendId !== "string" || !friendId.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "friendId must be a non-empty string",
      });
    }
    const validatedFriendId = friendId.trim();
    if (validatedFriendId === user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "You cannot start a conversation with yourself",
      });
    }

    const acceptedFriendRequest = await prisma.friendRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: user.id, receiverId: validatedFriendId },
          { senderId: validatedFriendId, receiverId: user.id },
        ],
      },
      select: { id: true },
    });
    if (!acceptedFriendRequest) {
      throw createError({
        statusCode: 403,
        statusMessage: "You can only message friends",
      });
    }

    const conversationInclude = {
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
        orderBy: { createdAt: "desc" as const },
        take: 1,
        select: { body: true, image: true, audio: true },
      },
      _count: {
        select: {
          messages: {
            where: { senderId: { not: user.id }, readAt: null },
          },
        },
      },
    } as const;
    const directConversationFilter = {
      OR: [{ isGroup: false }, { isGroup: null }],
    };
    const conversationWhere = {
      AND: [
        directConversationFilter,
        { users: { some: { id: user.id } } },
        { users: { some: { id: validatedFriendId } } },
      ],
    };

    const conversation = await prisma.$transaction(async (transaction) => {
      const existingConversation = await transaction.conversation.findFirst({
        where: conversationWhere,
        include: conversationInclude,
      });
      if (existingConversation) return existingConversation;

      return transaction.conversation.create({
        data: {
          isGroup: false,
          users: { connect: [{ id: user.id }, { id: validatedFriendId }] },
        },
        include: conversationInclude,
      });
    });

    return serializeConversation(
      conversation,
      user.id,
      conversation._count.messages,
    );
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error("Create conversation failed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
