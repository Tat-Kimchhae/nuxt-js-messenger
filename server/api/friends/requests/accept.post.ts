export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const { requestId } = await readBody<{ requestId?: string }>(event);

    if (!requestId) {
      throw createError({
        statusCode: 400,
        statusMessage: "requestId is required",
      });
    }

    const conversationId = await prisma.$transaction(async (transaction) => {
      // only the receiver can accept, and only while PENDING
      const { count } = await transaction.friendRequest.updateMany({
        where: { id: requestId, receiverId: user.id, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
      if (!count) {
        throw createError({
          statusCode: 404,
          statusMessage: "Request not found",
        });
      }

      const { senderId } = await transaction.friendRequest.findUniqueOrThrow({
        where: { id: requestId },
        select: { senderId: true },
      });

      const conversation = await transaction.conversation.create({
        data: {
          isGroup: false,
          users: { connect: [{ id: senderId }, { id: user.id }] },
        },
        select: { id: true },
      });

      return conversation.id;
    });

    return { status: true, conversationId };
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Accept friend request failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});