import prisma from "~~/server/utils/prisma.ts";
import { registerSchema } from "~/validation/auth";
import { generateUsername } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const { firstName, lastName, email, password } = await readValidatedBody(
    event,
    (body) => registerSchema.parse(body),
  ).catch((err) => {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: err.issues ?? err,
    });
  });

  try {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        username: await generateUsername(firstName),
      },
    });

    const sanitizedUser = sanitizeUser(user);
    if (sanitizedUser) {
      await setUserSession(event, {
        user: sanitizedUser,
      });
    }

    return {
      success: true,
      message: "Account created successfully!",
      user: sanitizedUser,
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      console.log(err.meta?.target);
      throw createError({
        statusCode: 409,
        statusMessage: "User already exists",
      });
    }

    console.error("Register failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});
