import prisma from "~~/server/utils/prisma.ts";
import { getCurrentUserId } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const currentUserId = await getCurrentUserId(event);
    const id = getRouterParam(event, "id")!;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id },
    });
    if (!friendRequest)
      throw createError({
        statusCode: 404,
        statusMessage: "Friend request not found",
      });
    if (friendRequest.receiverId !== currentUserId)
      throw createError({
        statusCode: 403,
        statusMessage: "Not your request to accept",
      });
    if (friendRequest.status !== "PENDING")
      throw createError({
        statusCode: 409,
        statusMessage: "Request already resolved",
      });

    return await prisma.friendRequest.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Accept friend request failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
