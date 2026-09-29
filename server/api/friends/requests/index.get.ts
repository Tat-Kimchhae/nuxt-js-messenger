import { stringToColor } from "~~/server/utils/auth";
import { timeAgo } from "~~/server/utils/timeAgo";
import type { Person } from "~~/types/person";

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const type = getQuery(event).type === "sent" ? "sent" : "received";

    const select = {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatarUrl: true,
    };

    const rows = await prisma.friendRequest.findMany({
      where: {
        status: "PENDING",
        ...(type === "sent" ? { senderId: user.id } : { receiverId: user.id }),
      },
      include: {
        sender: { select },
        receiver: { select },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = rows.map((r) => {
      const other = type === "sent" ? r.receiver : r.sender;
      const person: Person = {
        id: other.id,
        name: `${other.firstName} ${other.lastName}`.trim(),
        username: other.username,
        avatarUrl: other.avatarUrl,
        initials:
          `${other.firstName?.[0] ?? ""}${other.lastName?.[0] ?? ""}`.toUpperCase(),
        color: stringToColor(other.id),
      };

      return { id: r.id, person, time: timeAgo(r.createdAt) };
    });

    return { status: true, data };
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("List friend requests failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
