import type {User} from "@prisma/client";

export const sanitizeUser = (user: User) => {
  const {hashedPassword, ...sanitized} = user;

  return sanitized;
};