import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { createLessonSchema } from "@/lib/validations/course";

type RouteParams = {
  params: Promise<{ courseId: string; chapterId: string }>;
};

// Helper to check course and chapter ownership
async function checkOwnership(
  courseId: string,
  chapterId: string,
  userId: string,
  role: string,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { authorId: true },
  });

  if (!course) {
    return { error: "course_not_found" };
  }

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, courseId },
  });

  if (!chapter) {
    return { error: "chapter_not_found" };
  }

  if (course.authorId !== userId && role !== "ADMIN") {
    return { error: "forbidden" };
  }

  return { course, chapter };
}

// GET /api/courses/[courseId]/chapters/[chapterId]/lessons - List lessons
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId } = await params;
    const session = await auth();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true, isPublished: true },
    });

    if (!course) {
      return notFound("Cours non trouve");
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return notFound("Chapitre non trouve");
    }

    const isOwner = session?.user?.id === course.authorId;
    const isAdmin = session?.user?.role === "ADMIN";

    // If not owner/admin, only show published lessons
    const where =
      isOwner || isAdmin ? { chapterId } : { chapterId, isPublished: true };

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { position: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        contentType: true,
        duration: true,
        position: true,
        isFreePreview: true,
        isPublished: true,
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/courses/[courseId]/chapters/[chapterId]/lessons - Create lesson
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkOwnership(
      courseId,
      chapterId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "chapter_not_found") {
      return notFound("Chapitre non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas modifier ce cours");
    }

    const body = await req.json();
    const validated = createLessonSchema.parse(body);

    // Get the next position if not provided
    let position = validated.position;
    if (position === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { chapterId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = (lastLesson?.position ?? -1) + 1;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: validated.title,
        description: validated.description,
        content: validated.content,
        contentType: validated.contentType,
        videoUrl: validated.videoUrl,
        duration: validated.duration,
        position,
        isFreePreview: validated.isFreePreview ?? false,
        chapterId,
      },
    });

    // Update course total lessons count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: { increment: 1 },
        totalDuration: validated.duration
          ? { increment: validated.duration }
          : undefined,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
