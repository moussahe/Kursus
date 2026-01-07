import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { updateLessonSchema } from "@/lib/validations/course";

type RouteParams = {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
};

// Helper to check access
async function checkLessonAccess(
  courseId: string,
  chapterId: string,
  lessonId: string,
  userId?: string,
  role?: string,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { authorId: true, isPublished: true },
  });

  if (!course) {
    return { error: "course_not_found" };
  }

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { id: true, isPublished: true },
  });

  if (!chapter) {
    return { error: "chapter_not_found" };
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, chapterId },
  });

  if (!lesson) {
    return { error: "lesson_not_found" };
  }

  const isOwner = userId === course.authorId;
  const isAdmin = role === "ADMIN";

  return { course, chapter, lesson, isOwner, isAdmin };
}

// GET /api/courses/[courseId]/chapters/[chapterId]/lessons/[lessonId]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId, lessonId } = await params;
    const session = await auth();

    const check = await checkLessonAccess(
      courseId,
      chapterId,
      lessonId,
      session?.user?.id,
      session?.user?.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "chapter_not_found") {
      return notFound("Chapitre non trouve");
    }
    if (check.error === "lesson_not_found") {
      return notFound("Lecon non trouvee");
    }

    const { lesson, isOwner, isAdmin } = check;

    // Check if user can access the content
    if (!isOwner && !isAdmin) {
      // Check if free preview
      if (lesson!.isFreePreview) {
        return NextResponse.json(lesson);
      }

      // Check if user has purchased the course
      if (!session?.user) {
        // Return lesson metadata without content
        return NextResponse.json({
          id: lesson!.id,
          title: lesson!.title,
          description: lesson!.description,
          contentType: lesson!.contentType,
          duration: lesson!.duration,
          isFreePreview: lesson!.isFreePreview,
          requiresPurchase: true,
        });
      }

      const purchase = await prisma.purchase.findFirst({
        where: {
          courseId,
          userId: session.user.id,
          status: "COMPLETED",
        },
      });

      if (!purchase) {
        return NextResponse.json({
          id: lesson!.id,
          title: lesson!.title,
          description: lesson!.description,
          contentType: lesson!.contentType,
          duration: lesson!.duration,
          isFreePreview: lesson!.isFreePreview,
          requiresPurchase: true,
        });
      }
    }

    // Full access - include content, quiz info, resources
    const fullLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quizzes: {
          include: {
            questions: {
              orderBy: { position: "asc" },
            },
          },
        },
        resources: true,
      },
    });

    return NextResponse.json(fullLesson);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/courses/[courseId]/chapters/[chapterId]/lessons/[lessonId]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId, lessonId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkLessonAccess(
      courseId,
      chapterId,
      lessonId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "chapter_not_found") {
      return notFound("Chapitre non trouve");
    }
    if (check.error === "lesson_not_found") {
      return notFound("Lecon non trouvee");
    }

    if (!check.isOwner && !check.isAdmin) {
      return forbidden("Vous ne pouvez pas modifier cette lecon");
    }

    const body = await req.json();
    const validated = updateLessonSchema.parse(body);

    // Track duration change for course stats
    const oldDuration = check.lesson!.duration || 0;
    const newDuration = validated.duration ?? oldDuration;
    const durationDiff = newDuration - oldDuration;

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: validated,
    });

    // Update course duration if changed
    if (durationDiff !== 0) {
      await prisma.course.update({
        where: { id: courseId },
        data: {
          totalDuration: { increment: durationDiff },
        },
      });
    }

    return NextResponse.json(updatedLesson);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/courses/[courseId]/chapters/[chapterId]/lessons/[lessonId]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId, lessonId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkLessonAccess(
      courseId,
      chapterId,
      lessonId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "chapter_not_found") {
      return notFound("Chapitre non trouve");
    }
    if (check.error === "lesson_not_found") {
      return notFound("Lecon non trouvee");
    }

    if (!check.isOwner && !check.isAdmin) {
      return forbidden("Vous ne pouvez pas supprimer cette lecon");
    }

    const lessonDuration = check.lesson!.duration || 0;

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    // Update course stats
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: { decrement: 1 },
        totalDuration: { decrement: lessonDuration },
      },
    });

    return NextResponse.json({ message: "Lecon supprimee avec succes" });
  } catch (error) {
    return handleApiError(error);
  }
}
