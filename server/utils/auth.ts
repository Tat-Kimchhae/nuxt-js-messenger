import type { User } from "@prisma/client";
import type { H3Event } from "h3";

export const sanitizeUser = (user: User) => {
  const { hashedPassword, ...sanitized } = user;

  return sanitized;
};

export const generateUsername = async (firstName: string) => {
  const base = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let username = base;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    suffix++;
    username = `${base}${suffix}`;
  }
  return username;
};

export async function getCurrentUserId(event: H3Event): Promise<string> {
  const { user } = await requireUserSession(event);
  return user.id;
}
