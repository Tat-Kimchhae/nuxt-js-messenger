export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { q } = getQuery(event) as { q?: string };
  const search = q?.trim();

  const conversations = await prisma.conversation.findMany({
    where: {
      users: { some: { id: user.id } },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          {
            messages: {
              some: { body: { contains: search, mode: "insensitive" } },
            },
          },
          {
            users: {
              some: {
                id: { not: user.id },
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        ],
      }),
    },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, image: true, createdAt: true },
      },
    },
  });

  const toPerson = (
    member: (typeof conversations)[number]["users"][number],
  ) => {
    const fullName =
      [member.firstName, member.lastName].filter(Boolean).join(" ") ||
      member.username;
    return {
      id: member.id,
      name: fullName,
      username: member.username,
      avatarUrl: member.avatarUrl,
      initials: fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      color: stringToColor(member.id),
    };
  };

  return conversations.map((conversation) => {
    const members = conversation.users.map(toPerson);
    const otherMembers = members.filter((member) => member.id !== user.id);
    const lastMessage = conversation.messages[0];
    const kind = conversation.isGroup ? "group" : "direct";

    return {
      id: conversation.id,
      kind,
      title:
        kind === "direct"
          ? (otherMembers[0]?.name ?? "Unknown")
          : (conversation.name ??
            otherMembers.map((member) => member.name).join(", ")),
      // Component uses members[0] for direct chats, so put the other person first
      members: kind === "direct" ? otherMembers : members,
      preview:
        lastMessage?.body ??
        (lastMessage?.image ? "Sent a photo" : "No messages yet"),
      lastMessageAt: conversation.lastMessageAt,
      unread: 0, // no read tracking in the schema yet
      accent: stringToColor(conversation.id),
    };
  });
});
