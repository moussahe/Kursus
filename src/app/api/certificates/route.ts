import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-error";
import { generateCertificateSchema } from "@/lib/validations/certificate";
import {
  generateCertificateNumber,
  generateVerificationCode,
} from "@/lib/certificate-utils";

// POST /api/certificates - Generate a certificate for completed course
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const body = await req.json();
    const validated = generateCertificateSchema.parse(body);

    // Verify child belongs to user (for parents)
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return forbidden("Enfant non trouve ou non autorise");
    }

    // Get course with author info
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId },
      include: {
        author: {
          include: {
            teacherProfile: true,
          },
        },
        chapters: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return badRequest("Cours non trouve");
    }

    // Verify child has access to course (purchased)
    const purchase = await prisma.purchase.findFirst({
      where: {
        courseId: validated.courseId,
        status: "COMPLETED",
        OR: [
          { userId: session.user.id, childId: null },
          { childId: validated.childId },
        ],
      },
    });

    if (!purchase) {
      return forbidden("Cours non achete");
    }

    // Calculate total lessons
    const totalLessons = course.chapters.reduce(
      (sum, chapter) => sum + chapter.lessons.length,
      0,
    );

    // Get completed lessons count and stats
    const progressData = await prisma.progress.findMany({
      where: {
        childId: validated.childId,
        isCompleted: true,
        lesson: {
          chapter: {
            courseId: validated.courseId,
          },
        },
      },
      select: {
        quizScore: true,
        timeSpent: true,
      },
    });

    const completedLessons = progressData.length;

    // Require at least 80% completion to generate certificate
    const completionRate = (completedLessons / totalLessons) * 100;
    if (completionRate < 80) {
      return badRequest(
        `Completion insuffisante. ${completedLessons}/${totalLessons} lecons completees (${Math.round(completionRate)}%). Minimum requis: 80%`,
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        childId_courseId: {
          childId: validated.childId,
          courseId: validated.courseId,
        },
      },
    });

    if (existingCertificate) {
      return NextResponse.json(existingCertificate);
    }

    // Calculate average quiz score
    const quizScores = progressData
      .map((p) => p.quizScore)
      .filter((s): s is number => s !== null);
    const averageQuizScore =
      quizScores.length > 0
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : null;

    // Calculate total time spent (convert seconds to minutes)
    const totalTimeSpent = Math.round(
      progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60,
    );

    // Generate certificate
    const certificateNumber = generateCertificateNumber();
    const verificationCode = generateVerificationCode();
    const childFullName = child.lastName
      ? `${child.firstName} ${child.lastName}`
      : child.firstName;
    const teacherName =
      course.author.name || course.author.teacherProfile?.slug || "Enseignant";

    const certificate = await prisma.certificate.create({
      data: {
        childId: validated.childId,
        courseId: validated.courseId,
        certificateNumber,
        childName: childFullName,
        courseName: course.title,
        teacherName,
        gradeLevel: course.gradeLevel,
        subject: course.subject,
        completionDate: new Date(),
        totalLessons,
        lessonsCompleted: completedLessons,
        averageQuizScore,
        totalTimeSpent,
        verificationCode,
        verificationUrl: `${process.env.NEXTAUTH_URL || ""}/certificates/verify/${verificationCode}`,
      },
    });

    // Award XP for course completion (bonus XP)
    await prisma.child.update({
      where: { id: validated.childId },
      data: {
        xp: { increment: 500 }, // Bonus XP for course completion
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/certificates - Get all certificates for a child
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return badRequest("childId est requis");
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

    const certificates = await prisma.certificate.findMany({
      where: { childId },
      orderBy: { completionDate: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    return handleApiError(error);
  }
}
