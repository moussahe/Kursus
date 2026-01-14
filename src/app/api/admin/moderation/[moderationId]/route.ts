import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  sendEmail,
  courseApprovedEmail,
  courseApprovedText,
  courseRejectedEmail,
  courseRejectedText,
  courseChangesRequestedEmail,
  courseChangesRequestedText,
} from "@/lib/email";

const updateModerationSchema = z.object({
  action: z.enum(["approve", "reject", "changes"]),
  feedback: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ moderationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }

    const { moderationId } = await params;
    const body = await req.json();
    const { action, feedback } = updateModerationSchema.parse(body);

    // Get moderation record
    const moderation = await prisma.contentModeration.findUnique({
      where: { id: moderationId },
      include: {
        course: {
          include: {
            author: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    if (!moderation) {
      return NextResponse.json(
        { message: "Moderation non trouvee" },
        { status: 404 },
      );
    }

    // Determine new status based on action
    const statusMap = {
      approve: "APPROVED" as const,
      reject: "REJECTED" as const,
      changes: "CHANGES_REQUESTED" as const,
    };

    const newStatus = statusMap[action];

    // Update moderation record
    const updatedModeration = await prisma.$transaction(async (tx) => {
      // Update moderation
      const updated = await tx.contentModeration.update({
        where: { id: moderationId },
        data: {
          status: newStatus,
          reviewerId: session.user.id,
          reviewedAt: new Date(),
          feedback: feedback || null,
          ...(action === "reject" && { rejectionReason: feedback }),
        },
      });

      // If approved, publish the course
      if (action === "approve") {
        await tx.course.update({
          where: { id: moderation.courseId },
          data: {
            isPublished: true,
            publishedAt: new Date(),
          },
        });
      }

      // If rejected, unpublish the course
      if (action === "reject") {
        await tx.course.update({
          where: { id: moderation.courseId },
          data: {
            isPublished: false,
          },
        });
      }

      return updated;
    });

    // Send email notification to teacher
    if (moderation.course.author.email) {
      const emailData = {
        teacherName: moderation.course.author.name || "Professeur",
        courseName: moderation.course.title,
        courseId: moderation.courseId,
        feedback: feedback || undefined,
      };

      let emailHtml: string;
      let emailText: string;
      let subject: string;

      switch (action) {
        case "approve":
          emailHtml = courseApprovedEmail(emailData);
          emailText = courseApprovedText(emailData);
          subject = `Votre cours "${emailData.courseName}" est publie !`;
          break;
        case "reject":
          emailHtml = courseRejectedEmail(emailData);
          emailText = courseRejectedText(emailData);
          subject = `Cours "${emailData.courseName}" - Decision de moderation`;
          break;
        case "changes":
          emailHtml = courseChangesRequestedEmail(emailData);
          emailText = courseChangesRequestedText(emailData);
          subject = `Modifications demandees pour "${emailData.courseName}"`;
          break;
      }

      // Send email asynchronously (don't block the response)
      sendEmail({
        to: moderation.course.author.email,
        subject,
        html: emailHtml,
        text: emailText,
      }).catch((error) => {
        console.error("[Moderation] Failed to send email notification:", error);
      });
    }

    return NextResponse.json(updatedModeration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Moderation update error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moderationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }

    const { moderationId } = await params;

    const moderation = await prisma.contentModeration.findUnique({
      where: { id: moderationId },
      include: {
        course: {
          include: {
            author: {
              select: { id: true, name: true, email: true, image: true },
            },
            chapters: {
              include: {
                lessons: true,
              },
            },
            _count: {
              select: {
                purchases: true,
                reviews: true,
              },
            },
          },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
    });

    if (!moderation) {
      return NextResponse.json(
        { message: "Moderation non trouvee" },
        { status: 404 },
      );
    }

    return NextResponse.json(moderation);
  } catch (error) {
    console.error("Moderation fetch error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
