import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validations/password";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  role: z.enum(["PARENT", "TEACHER"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe deja" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Return with onboarding flag for parents
    return NextResponse.json(
      {
        ...user,
        needsOnboarding: validated.role === "PARENT",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation du compte" },
      { status: 500 },
    );
  }
}
