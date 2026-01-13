import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, notFound } from "@/lib/api-error";
import { verifyCertificateSchema } from "@/lib/validations/certificate";

// GET /api/certificates/verify?code=XXXX - Verify a certificate (public endpoint)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    const validated = verifyCertificateSchema.parse({
      verificationCode: code,
    });

    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: validated.verificationCode },
      select: {
        id: true,
        certificateNumber: true,
        childName: true,
        courseName: true,
        teacherName: true,
        gradeLevel: true,
        subject: true,
        completionDate: true,
        totalLessons: true,
        lessonsCompleted: true,
        averageQuizScore: true,
        totalTimeSpent: true,
        createdAt: true,
      },
    });

    if (!certificate) {
      return notFound("Certificat non trouve ou code invalide");
    }

    return NextResponse.json({
      valid: true,
      certificate,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
