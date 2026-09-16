import type {User} from "@prisma/client";

export const sanitizeUser = (user: User) => {
    if (!user) return null;

    delete user.hashedPassword;

    return user;
}