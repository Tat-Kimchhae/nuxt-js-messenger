export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const currentUserId = session.user.id;

  const { q: searchQuery } = getQuery(event);
  const searchText = typeof searchQuery === "string" ? searchQuery.trim() : "";

  const buildSearchFilter = (relation: "sender" | "receiver") => ({
    [relation]: {
      OR: [
        { firstName: { contains: searchText, mode: "insensitive" as const } },
        { lastName: { contains: searchText, mode: "insensitive" as const } },
        { username: { contains: searchText, mode: "insensitive" as const } },
      ],
    },
  });

  const acceptedFriendRequests = await prisma.friendRequest.findMany({
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
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
        },
      },
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    status: true,
    data: acceptedFriendRequests.map((friendRequest) => {
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
  };
});
