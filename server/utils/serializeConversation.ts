import { stringToColor } from "~~/server/utils/auth";
import { timeAgo } from "~~/server/utils/timeAgo";

type ConversationMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  avatarUrl: string | null;
};

type ConversationToSerialize = {
  id: string;
  isGroup: boolean | null;
  name: string | null;
  users: ConversationMember[];
  messages: {
    body: string | null;
    image: string | null;
    audio: string | null;
  }[];
  lastMessageAt: Date | string;
};

export function serializeConversation(
  conversation: ConversationToSerialize,
  viewerId: string,
  unreadCount: number,
) {
  const members = conversation.users.map((member) => {
    const name =
      [member.firstName, member.lastName].filter(Boolean).join(" ") ||
      member.username;
    return {
      id: member.id,
      name,
      username: member.username,
      avatarUrl: member.avatarUrl,
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      color: stringToColor(member.id),
    };
  });
  const otherMembers = members.filter((member) => member.id !== viewerId);
  const isGroup = conversation.isGroup === true;
  const lastMessage = conversation.messages[0];

  return {
    id: conversation.id,
    kind: isGroup ? "group" : "direct",
    title: isGroup
      ? (conversation.name ?? otherMembers.map((member) => member.name).join(", "))
      : (otherMembers[0]?.name ?? "Unknown"),
    members: isGroup ? members : otherMembers,
    preview:
      lastMessage?.body ??
      (lastMessage?.image
        ? "Sent a photo"
        : lastMessage?.audio
          ? "Sent a voice message"
          : "No messages yet"),
    time: timeAgo(conversation.lastMessageAt),
    unread: unreadCount,
    accent: stringToColor(conversation.id),
  };
}
