import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, forbidden } from "@/lib/api-error";
import {
  createCourseSchema,
  courseQuerySchema,
} from "@/lib/validations/course";
import { Prisma } from "@prisma/client";

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .slice(0, 100);
}

// GET /api/courses - List published courses (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = courseQuerySchema.parse(Object.fromEntries(searchParams));

    const { niveau, matiere, prix, tri, q, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CourseWhereInput = {
      isPublished: true,
    };

    if (niveau) {
      where.gradeLevel = niveau;
    }

    if (matiere) {
      where.subject = matiere;
    }

    if (prix !== undefined) {
      if (prix === 0) {
        where.price = 0;
      } else {
        where.price = { lte: prix };
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: "desc" };
    switch (tri) {
      case "populaire":
        orderBy = { totalStudents: "desc" };
        break;
      case "prix-asc":
        orderBy = { price: "asc" };
        break;
      case "prix-desc":
        orderBy = { price: "desc" };
        break;
      case "note":
        orderBy = { averageRating: "desc" };
        break;
      case "recent":
      default:
        orderBy = { publishedAt: "desc" };
    }

    // Execute queries
    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          imageUrl: true,
          gradeLevel: true,
          subject: true,
          price: true,
          totalStudents: true,
          totalLessons: true,
          totalDuration: true,
          averageRating: true,
          reviewCount: true,
          publishedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              teacherProfile: {
                select: {
                  slug: true,
                  headline: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/courses - Create course (TEACHER only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return forbidden("Seuls les enseignants peuvent creer des cours");
    }

    const body = await req.json();
    const validated = createCourseSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validated.title);
    const existingSlug = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await prisma.course.create({
      data: {
        ...validated,
        slug,
        authorId: session.user.id,
        learningOutcomes: validated.learningOutcomes || [],
        requirements: validated.requirements || [],
      },
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

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
