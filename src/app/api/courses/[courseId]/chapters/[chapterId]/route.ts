import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import {
  updateChapterSchema,
  reorderChaptersSchema,
} from "@/lib/validations/course";

type RouteParams = {
  params: Promise<{ courseId: string; chapterId: string }>;
};

// Helper to check course ownership
async function checkCourseOwnership(
  courseId: string,
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

  if (course.authorId !== userId && role !== "ADMIN") {
    return { error: "forbidden" };
  }

  return { course };
}

// PATCH /api/courses/[courseId]/chapters/[chapterId] - Update chapter
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkCourseOwnership(
      courseId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas modifier ce cours");
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return notFound("Chapitre non trouve");
    }

    const body = await req.json();
    const validated = updateChapterSchema.parse(body);

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: validated,
      include: {
        lessons: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/courses/[courseId]/chapters/[chapterId] - Delete chapter
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkCourseOwnership(
      courseId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas modifier ce cours");
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return notFound("Chapitre non trouve");
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({ message: "Chapitre supprime avec succes" });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/courses/[courseId]/chapters/[chapterId] - Reorder chapters
// Note: Using POST with action for reordering
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, chapterId: _chapterId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const check = await checkCourseOwnership(
      courseId,
      session.user.id,
      session.user.role,
    );

    if (check.error === "course_not_found") {
      return notFound("Cours non trouve");
    }
    if (check.error === "forbidden") {
      return forbidden("Vous ne pouvez pas modifier ce cours");
    }

    // Check if this is a reorder request
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action !== "reorder") {
      return NextResponse.json(
        { error: "Action non supportee" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validated = reorderChaptersSchema.parse(body);

    // Update all chapter positions in a transaction
    await prisma.$transaction(
      validated.chapters.map(({ id, position }) =>
        prisma.chapter.updateMany({
          where: { id, courseId },
          data: { position },
        }),
      ),
    );

    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    return handleApiError(error);
  }
}
