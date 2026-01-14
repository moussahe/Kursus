import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validations/password";

const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
  token: z.string().min(1, "Token requis"),
  password: passwordSchema,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, password } = resetPasswordSchema.parse(body);

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Lien invalide ou expire" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      });

      return NextResponse.json(
        { error: "Ce lien a expire. Veuillez en demander un nouveau." },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return NextResponse.json(
      { message: "Mot de passe modifie avec succes" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[ResetPassword] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
