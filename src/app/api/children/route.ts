import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, forbidden } from "@/lib/api-error";
import { createChildSchema } from "@/lib/validations/child";

// GET /api/children - List parent's children (PARENT only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "PARENT" && session.user.role !== "ADMIN") {
      return forbidden("Seuls les parents peuvent voir leurs enfants");
    }

    const children = await prisma.child.findMany({
      where: { parentId: session.user.id },
      orderBy: { createdAt: "desc" },
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
              },
            },
          },
        },
        progress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                chapterId: true,
              },
            },
          },
        },
      },
    });

    // Add progress stats for each child
    const childrenWithStats = await Promise.all(
      children.map(async (child) => {
        // Calculate overall progress for each purchased course
        const coursesProgress = await Promise.all(
          child.purchases.map(async (purchase) => {
            const totalLessons = await prisma.lesson.count({
              where: {
                chapter: {
                  courseId: purchase.courseId,
                },
              },
            });

            const completedLessons = await prisma.progress.count({
              where: {
                childId: child.id,
                isCompleted: true,
                lesson: {
                  chapter: {
                    courseId: purchase.courseId,
                  },
                },
              },
            });

            return {
              courseId: purchase.courseId,
              course: purchase.course,
              totalLessons,
              completedLessons,
              progressPercent:
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0,
            };
          }),
        );

        return {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          avatarUrl: child.avatarUrl,
          gradeLevel: child.gradeLevel,
          createdAt: child.createdAt,
          coursesProgress,
        };
      }),
    );

    return NextResponse.json(childrenWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/children - Add child
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "PARENT" && session.user.role !== "ADMIN") {
      return forbidden("Seuls les parents peuvent ajouter des enfants");
    }

    const body = await req.json();
    const validated = createChildSchema.parse(body);

    const child = await prisma.child.create({
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        avatarUrl: validated.avatarUrl,
        gradeLevel: validated.gradeLevel,
        parentId: session.user.id,
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
