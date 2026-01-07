import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { updateChildSchema } from "@/lib/validations/child";

type RouteParams = {
  params: Promise<{ childId: string }>;
};

// Helper to check child ownership
async function checkChildOwnership(
  childId: string,
  userId: string,
  role: string,
) {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });

  if (!child) {
    return { error: "not_found" };
  }

  if (child.parentId !== userId && role !== "ADMIN") {
    return { error: "forbidden" };
  }

  return { child };
}

// GET /api/children/[childId] - Get child details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { childId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkChildOwnership(
      childId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "not_found") {
      return notFound("Enfant non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas voir cet enfant");
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        purchases: {
          where: { status: "COMPLETED" },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                gradeLevel: true,
                subject: true,
                totalLessons: true,
                author: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        progress: {
          where: { isCompleted: true },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                chapter: {
                  select: {
                    id: true,
                    title: true,
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate progress per course
    const coursesWithProgress = await Promise.all(
      child!.purchases.map(async (purchase) => {
        const totalLessons = await prisma.lesson.count({
          where: {
            chapter: {
              courseId: purchase.courseId,
            },
          },
        });

        const completedLessons = child!.progress.filter(
          (p) => p.lesson.chapter.courseId === purchase.courseId,
        ).length;

        return {
          ...purchase.course,
          totalLessons,
          completedLessons,
          progressPercent:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
        };
      }),
    );

    return NextResponse.json({
      id: child!.id,
      firstName: child!.firstName,
      lastName: child!.lastName,
      avatarUrl: child!.avatarUrl,
      gradeLevel: child!.gradeLevel,
      createdAt: child!.createdAt,
      updatedAt: child!.updatedAt,
      courses: coursesWithProgress,
      recentProgress: child!.progress.slice(0, 10),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/children/[childId] - Update child
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { childId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkChildOwnership(
      childId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "not_found") {
      return notFound("Enfant non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas modifier cet enfant");
    }

    const body = await req.json();
    const validated = updateChildSchema.parse(body);

    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: validated,
    });

    return NextResponse.json(updatedChild);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/children/[childId] - Delete child
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { childId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkChildOwnership(
      childId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "not_found") {
      return notFound("Enfant non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas supprimer cet enfant");
    }

    await prisma.child.delete({
      where: { id: childId },
    });

    return NextResponse.json({ message: "Enfant supprime avec succes" });
  } catch (error) {
    return handleApiError(error);
  }
}
