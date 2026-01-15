import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        teacherProfile: {
          select: {
            headline: true,
            bio: true,
            avatarUrl: true,
            stripeAccountId: true,
            stripeOnboarded: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      headline: user.teacherProfile?.headline ?? null,
      bio: user.teacherProfile?.bio ?? null,
      avatarUrl: user.teacherProfile?.avatarUrl ?? user.image ?? null,
      stripeConnected: !!user.teacherProfile?.stripeAccountId,
      stripeOnboarded: user.teacherProfile?.stripeOnboarded ?? false,
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation du profil" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    // Update user name if provided
    if (validated.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validated.name },
      });
    }

    // Update or create teacher profile
    const teacherProfile = await prisma.teacherProfile.upsert({
      where: { userId: session.user.id },
      update: {
        headline: validated.headline,
        bio: validated.bio,
        avatarUrl: validated.avatarUrl || null,
      },
      create: {
        userId: session.user.id,
        slug: session.user.id, // Use user ID as initial slug
        headline: validated.headline,
        bio: validated.bio,
        avatarUrl: validated.avatarUrl || null,
      },
    });

    // Get updated user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      id: user?.id,
      name: user?.name,
      email: user?.email,
      image: user?.image,
      headline: teacherProfile.headline,
      bio: teacherProfile.bio,
      avatarUrl: teacherProfile.avatarUrl ?? user?.image ?? null,
      stripeConnected: !!teacherProfile.stripeAccountId,
      stripeOnboarded: teacherProfile.stripeOnboarded,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Profile PATCH Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise a jour du profil" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    // Check if teacher has any courses with active students
    const activeCourses = await prisma.course.findFirst({
      where: {
        authorId: session.user.id,
        isPublished: true,
        purchases: {
          some: {
            status: "COMPLETED",
          },
        },
      },
    });

    if (activeCourses) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer le compte. Vous avez des cours actifs avec des étudiants inscrits.",
        },
        { status: 400 },
      );
    }

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile DELETE Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 },
    );
  }
}
