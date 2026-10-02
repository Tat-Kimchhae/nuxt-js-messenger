type MessageRow = {
  id: string;
  body: string | null;
  image: string | null;
  senderId: string;
  createdAt: Date;
  readAt: Date | null;
};

export function serializeMessage(message: MessageRow, viewerId: string) {
  const mine = message.senderId === viewerId;
  return {
    id: message.id,
    senderId: mine ? "me" : message.senderId,
    text: message.body ?? "",
    image: message.image,
    createdAt: message.createdAt,
    read: mine ? message.readAt !== null : undefined,
  };
}
