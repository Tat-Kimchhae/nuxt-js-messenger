export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const currentUserId = session.user.id;

  const { q: searchQuery, cursor, limit } = getQuery(event);
  const searchText = typeof searchQuery === "string" ? searchQuery.trim() : "";
  const cursorId = typeof cursor === "string" && cursor ? cursor : undefined;
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const buildSearchFilter = (relation: "sender" | "receiver") => ({
    [relation]: {
      OR: [
        { firstName: { contains: searchText, mode: "insensitive" as const } },
        { lastName: { contains: searchText, mode: "insensitive" as const } },
        { username: { contains: searchText, mode: "insensitive" as const } },
      ],
    },
  });

  const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    avatarUrl: true,
  };

  const rows = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        {
          senderId: currentUserId,
          ...(searchText && buildSearchFilter("receiver")),
        },
        {
          receiverId: currentUserId,
          ...(searchText && buildSearchFilter("sender")),
        },
      ],
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: take + 1, // fetch one extra to detect next page
    ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
  });

  const hasMore = rows.length > take;
  const page = hasMore ? rows.slice(0, take) : rows;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return {
    status: true,
    data: page.map((friendRequest) => {
      const friendUser =
        friendRequest.senderId === currentUserId
          ? friendRequest.receiver
          : friendRequest.sender;

      return {
        id: friendUser.id,
        name: `${friendUser.firstName} ${friendUser.lastName}`.trim(),
        username: friendUser.username,
        avatarUrl: friendUser.avatarUrl,
        initials:
          `${friendUser.firstName?.[0] ?? ""}${friendUser.lastName?.[0] ?? ""}`.toUpperCase(),
        color: stringToColor(friendUser.id),
      };
    }),
    pagination: {
      nextCursor,
      hasMore,
      limit: take,
    },
  };
});