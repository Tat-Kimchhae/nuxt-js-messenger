import prisma from "~~/server/utils/prisma.ts";
import {loginSchema} from "~/validation/auth";

export default defineEventHandler(async (event) => {
  const {email, password} = await readValidatedBody(
    event,
    (body) => loginSchema.parse(body),
  ).catch((err) => {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: err.issues ?? err,
    });
  });

  try {
    const user = await prisma.user.findUnique({
      where: {email: email.toLowerCase()},
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User does not exist",
      });
    }

    const isValid = user?.hashedPassword ? await verifyPassword(user.hashedPassword, password) : false;
    if (!isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Credentials"
      })
    }

    const sanitizedUser = sanitizeUser(user);
    if (sanitizedUser) {
      await setUserSession(event, {
        user: sanitizedUser,
      });
    }

    return {
      success: true,
      message: "Authentication Successful!",
      user: sanitizedUser,
    };
  } catch (err: any) {
    if (err.statusCode) throw err;
    console.error("Login failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong!",
    });
  }
});