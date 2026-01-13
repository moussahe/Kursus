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
  updateSessionSchema,
  rateSessionSchema,
} from "@/lib/validations/live-session";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// GET /api/live-sessions/[sessionId] - Get session details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { sessionId } = await params;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            teacherProfile: {
              select: {
                headline: true,
                avatarUrl: true,
                averageRating: true,
                specialties: true,
              },
            },
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gradeLevel: true,
            avatarUrl: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!liveSession) {
      return notFound("Session non trouvee");
    }

    // Check authorization
    const isTeacher = liveSession.teacherId === session.user.id;
    const isParent = liveSession.parentId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isTeacher && !isParent && !isAdmin) {
      return forbidden("Acces non autorise a cette session");
    }

    return NextResponse.json(liveSession);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/live-sessions/[sessionId] - Update session (teacher notes, status, etc.)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { sessionId } = await params;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!liveSession) {
      return notFound("Session non trouvee");
    }

    // Check authorization
    const isTeacher = liveSession.teacherId === session.user.id;
    const isParent = liveSession.parentId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    const body = await req.json();

    // Handle parent rating
    if (
      isParent &&
      (body.rating !== undefined || body.parentFeedback !== undefined)
    ) {
      const validated = rateSessionSchema.parse(body);

      if (liveSession.status !== "COMPLETED") {
        return forbidden("Vous ne pouvez noter qu'une session terminee");
      }

      const updated = await prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          rating: validated.rating,
          parentFeedback: validated.parentFeedback,
        },
      });

      return NextResponse.json(updated);
    }

    // Handle teacher updates
    if (isTeacher || isAdmin) {
      const validated = updateSessionSchema.parse(body);

      const updateData: Record<string, unknown> = {};

      if (validated.teacherNotes !== undefined) {
        updateData.teacherNotes = validated.teacherNotes;
      }

      if (validated.status !== undefined) {
        updateData.status = validated.status;

        if (validated.status === "IN_PROGRESS") {
          updateData.startedAt = new Date();
        } else if (validated.status === "COMPLETED") {
          updateData.endedAt = new Date();
        } else if (validated.status === "CANCELLED") {
          updateData.cancelledAt = new Date();
          updateData.cancellationReason = validated.cancellationReason || null;
        }
      }

      const updated = await prisma.liveSession.update({
        where: { id: sessionId },
        data: updateData,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          child: {
            select: {
              id: true,
              firstName: true,
              gradeLevel: true,
            },
          },
        },
      });

      return NextResponse.json(updated);
    }

    return forbidden("Vous n'avez pas la permission de modifier cette session");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/live-sessions/[sessionId] - Cancel session
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { sessionId } = await params;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!liveSession) {
      return notFound("Session non trouvee");
    }

    // Check authorization
    const isTeacher = liveSession.teacherId === session.user.id;
    const isParent = liveSession.parentId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isTeacher && !isParent && !isAdmin) {
      return forbidden("Vous n'avez pas la permission d'annuler cette session");
    }

    // Can only cancel scheduled sessions
    if (liveSession.status !== "SCHEDULED") {
      return forbidden("Seules les sessions programmees peuvent etre annulees");
    }

    // Get cancellation reason from request body
    let cancellationReason = "Annule par ";
    if (isParent) {
      cancellationReason += "le parent";
    } else if (isTeacher) {
      cancellationReason += "le professeur";
    } else {
      cancellationReason += "l'administrateur";
    }

    try {
      const body = await req.json();
      if (body.reason) {
        cancellationReason = body.reason;
      }
    } catch {
      // No body provided, use default reason
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
