import type {User} from "@prisma/client";
import type { H3Event } from "h3"

export const sanitizeUser = (user: User) => {
  const {hashedPassword, ...sanitized} = user;

  return sanitized;
};

export async function getCurrentUserId(event: H3Event): Promise<string> {
  const { user } = await requireUserSession(event)
  return user.id
}