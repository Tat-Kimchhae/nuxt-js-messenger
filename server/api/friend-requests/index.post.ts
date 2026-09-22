import prisma from "~~/server/utils/prisma.ts";
import { getCurrentUserId } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const senderId = await getCurrentUserId(event);
    const { receiverId } = await readBody<{ receiverId: string }>(event);

    if (!receiverId) {
      throw createError({
        statusCode: 400,
        statusMessage: "receiverId is required",
      });
    }
    if (receiverId === senderId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot send a friend request to yourself",
      });
    }

    // index.post.ts — replace the existingRequest block
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "ACCEPTED") {
        throw createError({
          statusCode: 409,
          statusMessage: "Already friends",
        });
      }
      if (existingRequest.status === "PENDING") {
        throw createError({
          statusCode: 409,
          statusMessage: "Request already pending",
        });
      }
      // DECLINED — allow retry, flip sender/receiver back to current direction
      return await prisma.friendRequest.update({
        where: { id: existingRequest.id },
        data: { senderId, receiverId, status: "PENDING" },
      });
    }

    return await prisma.friendRequest.create({
      data: { senderId, receiverId },
    });
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Send friend request failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
