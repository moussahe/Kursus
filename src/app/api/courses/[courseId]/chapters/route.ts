import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { createChapterSchema } from "@/lib/validations/course";

type RouteParams = {
  params: Promise<{ courseId: string }>;
};

// GET /api/courses/[courseId]/chapters - List chapters with lessons
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const session = await auth();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true, isPublished: true },
    });

    if (!course) {
      return notFound("Cours non trouve");
    }

    const isOwner = session?.user?.id === course.authorId;
    const isAdmin = session?.user?.role === "ADMIN";

    // If not owner/admin, only show published chapters
    const where =
      isOwner || isAdmin ? { courseId } : { courseId, isPublished: true };

    const chapters = await prisma.chapter.findMany({
      where,
      orderBy: { position: "asc" },
      include: {
        lessons: {
          where: isOwner || isAdmin ? {} : { isPublished: true },
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
        },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/courses/[courseId]/chapters - Create chapter
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });

    if (!course) {
      return notFound("Cours non trouve");
    }

    if (session.user.id !== course.authorId && session.user.role !== "ADMIN") {
      return forbidden("Vous ne pouvez pas modifier ce cours");
    }

    const body = await req.json();
    const validated = createChapterSchema.parse(body);

    // Get the next position if not provided
    let position = validated.position;
    if (position === undefined) {
      const lastChapter = await prisma.chapter.findFirst({
        where: { courseId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = (lastChapter?.position ?? -1) + 1;
    }

    const chapter = await prisma.chapter.create({
      data: {
        title: validated.title,
        description: validated.description,
        position,
        courseId,
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
