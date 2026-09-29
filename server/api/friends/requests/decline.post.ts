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

    const { count } = await prisma.friendRequest.updateMany({
      where: { id: requestId, receiverId: user.id, status: "PENDING" },
      data: { status: "DECLINED" },
    });
    if (!count) {
      throw createError({
        statusCode: 404,
        statusMessage: "Request not found",
      });
    }

    return { status: true };
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Decline friend request failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
