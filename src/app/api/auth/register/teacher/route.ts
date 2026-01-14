import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validations/password";

// Subject enum validation
const SubjectEnum = z.enum([
  "MATHEMATIQUES",
  "FRANCAIS",
  "HISTOIRE_GEO",
  "SCIENCES",
  "ANGLAIS",
  "PHYSIQUE_CHIMIE",
  "SVT",
  "PHILOSOPHIE",
  "ESPAGNOL",
  "ALLEMAND",
  "SES",
  "NSI",
]);

const teacherRegisterSchema = z.object({
  name: z.string().min(2, "Minimum 2 caracteres"),
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  headline: z
    .string()
    .min(10, "Minimum 10 caracteres")
    .max(100, "Maximum 100 caracteres"),
  bio: z
    .string()
    .min(50, "Minimum 50 caracteres")
    .max(1000, "Maximum 1000 caracteres"),
  specialties: z.array(SubjectEnum).min(1, "Selectionnez au moins une matiere"),
  yearsExperience: z
    .number()
    .min(0, "L'experience ne peut pas etre negative")
    .max(50, "Maximum 50 ans d'experience"),
});

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

/**
 * Ensure the slug is unique by appending a number if necessary
 */
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingProfile = await prisma.teacherProfile.findUnique({
      where: { slug },
    });

    if (!existingProfile) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = teacherRegisterSchema.parse(body);

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

    // Generate unique slug from name
    const baseSlug = generateSlug(validated.name);
    const slug = await getUniqueSlug(baseSlug);

    // Create user and teacher profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user with TEACHER role
      const newUser = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          password: hashedPassword,
          role: "TEACHER",
        },
      });

      // Create teacher profile
      await tx.teacherProfile.create({
        data: {
          userId: newUser.id,
          slug,
          headline: validated.headline,
          bio: validated.bio,
          specialties: validated.specialties,
          yearsExperience: validated.yearsExperience,
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        slug,
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

    console.error("Teacher registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation du compte" },
      { status: 500 },
    );
  }
}
