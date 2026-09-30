import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = forgotPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = validatedData.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, reset link sent" },
        { status: 200 },
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    logger.info("password_reset_requested");
    if (process.env.NODE_ENV === "development") {
      logger.debug("password_reset_link_created", {
        resetUrl: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
      });
    }

    return NextResponse.json(
      { message: "If an account exists, reset link sent" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("forgot_password_failed", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
