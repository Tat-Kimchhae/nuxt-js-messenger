import type { Person } from "~~/types/person";

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);

    // Support both ?q= and ?search=
    const query = getQuery(event);
    const search = ((query.q ?? query.search) as string | undefined)?.trim();

    const existingRelations = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      select: { senderId: true, receiverId: true },
    });

    const excludedIds = new Set<string>([user.id]);
    existingRelations.forEach((r) => {
      excludedIds.add(r.senderId);
      excludedIds.add(r.receiverId);
    });

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 10,
      // Optional: order by relevance / newest / etc.
      // orderBy: { createdAt: "desc" },
    });

    return {
      status: true,
      data: suggestions.map(
        (u): Person => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          initials:
            `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase(),
          color: stringToColor(u.id),
          username: `@${u.username}`.trim(),
          avatarUrl: u.avatarUrl,
          online: false,
        }),
      ),
    };
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Get failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 75%)`;
}
