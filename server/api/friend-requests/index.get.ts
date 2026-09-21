import prisma from "~~/server/utils/prisma.ts";
import { getCurrentUserId } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const currentUserId = await getCurrentUserId(event);

    return await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("List friend requests failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
