export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "id is required" });
    }

    // only the sender can cancel, and only while PENDING
    const { count } = await prisma.friendRequest.deleteMany({
      where: { id, senderId: user.id, status: "PENDING" },
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
    console.error("Cancel friend request failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
