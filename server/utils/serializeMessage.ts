type MessageRow = {
  id: string;
  body: string | null;
  image: string | null;
  audio: string | null;
  audioDurationSeconds: number | null;
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
    audio: message.audio?.replace(/\.[^/.]+$/, ".mp3") ?? null,
    audioDurationSeconds: message.audioDurationSeconds,
    createdAt: message.createdAt,
    read: mine ? message.readAt !== null : undefined,
  };
}
