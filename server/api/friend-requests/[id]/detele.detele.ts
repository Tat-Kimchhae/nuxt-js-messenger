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
    if (friendRequest.senderId !== currentUserId)
      throw createError({
        statusCode: 403,
        statusMessage: "Not your request to cancel",
      });
    if (friendRequest.status !== "PENDING")
      throw createError({
        statusCode: 409,
        statusMessage: "Request already resolved",
      });

    return await prisma.friendRequest.delete({ where: { id } });
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Delete friend request failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
