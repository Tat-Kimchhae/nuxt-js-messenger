import prisma from "~~/server/utils/prisma.ts";
import { getCurrentUserId } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const currentUserId = await getCurrentUserId(event);
  const { q } = getQuery<{ q?: string }>(event);

  const related = await prisma.friendRequest.findMany({
    where: { OR: [{ senderId: currentUserId }, { receiverId: currentUserId }] },
    select: { senderId: true, receiverId: true },
  });
  const excludeIds = new Set([currentUserId]);
  related.forEach((r) => {
    excludeIds.add(r.senderId);
    excludeIds.add(r.receiverId);
  });

  return await prisma.user.findMany({
    where: {
      id: { notIn: [...excludeIds] },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
    },
    take: 20,
  });
});
