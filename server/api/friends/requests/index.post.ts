export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const { receiverId } = await readBody<{ receiverId?: string }>(event);

    if (!receiverId || receiverId === user.id) {
      throw createError({ statusCode: 400, statusMessage: "Invalid receiver" });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });
    if (!receiver) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // block if a pending/accepted request exists in either direction
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: "Request already exists" });
    }

    // unique [senderId, receiverId] -> reuse a previously declined row
    const request = await prisma.friendRequest.upsert({
      where: { senderId_receiverId: { senderId: user.id, receiverId } },
      update: { status: "PENDING", createdAt: new Date() },
      create: { senderId: user.id, receiverId },
    });

    return { status: true, data: { id: request.id } };
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Send friend request failed:", err);
    throw createError({ statusCode: 500, statusMessage: "Something went wrong!" });
  }
});