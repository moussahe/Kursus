import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { GradeLevel, Subject } from "@prisma/client";

const querySchema = z.object({
  gradeLevel: z.string().optional(),
  subjects: z.string().optional(),
  limit: z.coerce.number().min(1).max(10).default(5),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const validated = querySchema.parse({
      gradeLevel: searchParams.get("gradeLevel"),
      subjects: searchParams.get("subjects"),
      limit: searchParams.get("limit"),
    });

    const subjects = validated.subjects
      ? (validated.subjects.split(",") as Subject[])
      : undefined;

    const gradeLevel = validated.gradeLevel as GradeLevel | undefined;

    // Build the where clause
    const where: {
      isPublished: boolean;
      gradeLevel?: GradeLevel;
      subject?: { in: Subject[] };
    } = {
      isPublished: true,
    };

    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    if (subjects && subjects.length > 0) {
      where.subject = { in: subjects };
    }

    // Fetch recommended courses
    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        subtitle: true,
        subject: true,
        gradeLevel: true,
        price: true,
        imageUrl: true,
        totalStudents: true,
        averageRating: true,
        totalLessons: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ averageRating: "desc" }, { totalStudents: "desc" }],
      take: validated.limit,
    });

    // If not enough courses with exact match, get popular courses
    if (courses.length < validated.limit) {
      const additionalCourses = await prisma.course.findMany({
        where: {
          isPublished: true,
          id: { notIn: courses.map((c) => c.id) },
        },
        select: {
          id: true,
          title: true,
          subtitle: true,
          subject: true,
          gradeLevel: true,
          price: true,
          imageUrl: true,
          totalStudents: true,
          averageRating: true,
          totalLessons: true,
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ totalStudents: "desc" }, { averageRating: "desc" }],
        take: validated.limit - courses.length,
      });

      courses.push(...additionalCourses);
    }

    return NextResponse.json({
      courses,
      count: courses.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parametres invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Recommendations error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
