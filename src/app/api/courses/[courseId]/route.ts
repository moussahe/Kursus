import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { updateCourseSchema } from "@/lib/validations/course";

type RouteParams = {
  params: Promise<{ courseId: string }>;
};

// GET /api/courses/[courseId] - Get course details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const session = await auth();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            teacherProfile: {
              select: {
                slug: true,
                headline: true,
                bio: true,
                isVerified: true,
                totalStudents: true,
                totalCourses: true,
                averageRating: true,
              },
            },
          },
        },
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            lessons: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                description: true,
                contentType: true,
                duration: true,
                position: true,
                isFreePreview: true,
              },
            },
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return notFound("Cours non trouve");
    }

    // Check if user can view unpublished course
    const isOwner = session?.user?.id === course.authorId;
    const isAdmin = session?.user?.role === "ADMIN";

    if (!course.isPublished && !isOwner && !isAdmin) {
      return notFound("Cours non trouve");
    }

    return NextResponse.json(course);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/courses/[courseId] - Update course
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    // Check ownership or admin
    const isOwner = session.user.id === course.authorId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return forbidden("Vous ne pouvez pas modifier ce cours");
    }

    const body = await req.json();
    const validated = updateCourseSchema.parse(body);

    // Handle publishing
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.isPublished === true) {
      updateData.publishedAt = new Date();
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/courses/[courseId] - Soft delete course
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    // Check ownership or admin
    const isOwner = session.user.id === course.authorId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return forbidden("Vous ne pouvez pas supprimer ce cours");
    }

    // Soft delete by unpublishing
    await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });

    return NextResponse.json({ message: "Cours supprime avec succes" });
  } catch (error) {
    return handleApiError(error);
  }
}
