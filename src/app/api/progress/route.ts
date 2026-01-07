import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  badRequest,
  forbidden,
} from "@/lib/api-error";
import { markProgressSchema } from "@/lib/validations/child";

// POST /api/progress - Mark lesson as completed
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const body = await req.json();
    const validated = markProgressSchema.parse(body);

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return forbidden("Enfant non trouve ou non autorise");
    }

    // Get lesson and its course
    const lesson = await prisma.lesson.findUnique({
      where: { id: validated.lessonId },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return badRequest("Lecon non trouvee");
    }

    const courseId = lesson.chapter.courseId;

    // Check if child has access to this course (via purchase)
    const purchase = await prisma.purchase.findFirst({
      where: {
        courseId,
        status: "COMPLETED",
        OR: [
          { userId: session.user.id, childId: null },
          { childId: validated.childId },
        ],
      },
    });

    // Allow free preview lessons without purchase
    if (!purchase && !lesson.isFreePreview) {
      return forbidden("Acces non autorise a cette lecon");
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        childId_lessonId: {
          childId: validated.childId,
          lessonId: validated.lessonId,
        },
      },
      create: {
        childId: validated.childId,
        lessonId: validated.lessonId,
        isCompleted: validated.isCompleted,
        lastAccessedAt: new Date(),
      },
      update: {
        isCompleted: validated.isCompleted,
        lastAccessedAt: new Date(),
      },
    });

    // Calculate overall course progress
    const totalLessons = await prisma.lesson.count({
      where: {
        chapter: {
          courseId,
        },
      },
    });

    const completedLessons = await prisma.progress.count({
      where: {
        childId: validated.childId,
        isCompleted: true,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
    });

    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return NextResponse.json({
      progress,
      courseProgress: {
        courseId,
        totalLessons,
        completedLessons,
        progressPercent,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/progress - Get progress for a child on a course
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    const courseId = searchParams.get("courseId");

    if (!childId || !courseId) {
      return badRequest("childId et courseId sont requis");
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return forbidden("Enfant non trouve ou non autorise");
    }

    // Get all lessons for the course with progress
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
          include: {
            progress: {
              where: { childId },
            },
          },
        },
      },
    });

    // Calculate stats
    let totalLessons = 0;
    let completedLessons = 0;
    let totalTimeSpent = 0;

    const chaptersWithProgress = chapters.map((chapter) => {
      const lessonsWithProgress = chapter.lessons.map((lesson) => {
        totalLessons++;
        const progress = lesson.progress[0];

        if (progress?.isCompleted) {
          completedLessons++;
        }
        if (progress?.timeSpent) {
          totalTimeSpent += progress.timeSpent;
        }

        return {
          id: lesson.id,
          title: lesson.title,
          contentType: lesson.contentType,
          duration: lesson.duration,
          isCompleted: progress?.isCompleted || false,
          lastAccessedAt: progress?.lastAccessedAt,
          timeSpent: progress?.timeSpent || 0,
          quizScore: progress?.quizScore,
        };
      });

      const chapterCompleted = lessonsWithProgress.filter(
        (l) => l.isCompleted,
      ).length;

      return {
        id: chapter.id,
        title: chapter.title,
        totalLessons: lessonsWithProgress.length,
        completedLessons: chapterCompleted,
        progressPercent:
          lessonsWithProgress.length > 0
            ? Math.round((chapterCompleted / lessonsWithProgress.length) * 100)
            : 0,
        lessons: lessonsWithProgress,
      };
    });

    return NextResponse.json({
      courseId,
      childId,
      totalLessons,
      completedLessons,
      progressPercent:
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      totalTimeSpent,
      chapters: chaptersWithProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
