import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  passwordResetEmail,
  passwordResetText,
} from "@/lib/email/templates/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

// Token expires in 1 hour
const TOKEN_EXPIRY_HOURS = 1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "Si un compte existe, un email a ete envoye." },
        { status: 200 },
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Delete any existing tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Create new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "Reinitialisation de votre mot de passe - Kursus",
      html: passwordResetEmail({
        userName: user.name || "Utilisateur",
        resetUrl,
        expiresIn: `${TOKEN_EXPIRY_HOURS} heure${TOKEN_EXPIRY_HOURS > 1 ? "s" : ""}`,
      }),
      text: passwordResetText({
        userName: user.name || "Utilisateur",
        resetUrl,
        expiresIn: `${TOKEN_EXPIRY_HOURS} heure${TOKEN_EXPIRY_HOURS > 1 ? "s" : ""}`,
      }),
    });

    return NextResponse.json(
      { message: "Si un compte existe, un email a ete envoye." },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email invalide", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[ForgotPassword] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
