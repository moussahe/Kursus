import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/api-error";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// In a production environment, you would use a video service like Daily.co
// This is a simplified version that generates room URLs
function generateRoomUrl(roomName: string): string {
  // In production, this would call Daily.co API to create a room
  // Example: https://api.daily.co/v1/rooms
  // For now, we'll generate a URL that can be used with a video component
  const baseUrl = process.env.DAILY_DOMAIN || "https://schoolaris.daily.co";
  return `${baseUrl}/${roomName}`;
}

// GET /api/live-sessions/[sessionId]/room - Get or create room for session
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
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    if (!liveSession) {
      return notFound("Session non trouvee");
    }

    // Check authorization - only teacher, parent, or admin can access
    const isTeacher = liveSession.teacherId === session.user.id;
    const isParent = liveSession.parentId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isTeacher && !isParent && !isAdmin) {
      return forbidden("Acces non autorise a cette session");
    }

    // Check session status
    if (liveSession.status === "CANCELLED") {
      return badRequest("Cette session a ete annulee");
    }

    if (liveSession.status === "COMPLETED") {
      return badRequest("Cette session est terminee");
    }

    // Check if session is within joinable window (15 min before to end)
    const now = new Date();
    const sessionStart = new Date(liveSession.scheduledAt);
    const sessionEnd = new Date(
      sessionStart.getTime() + liveSession.duration * 60000,
    );
    const joinableFrom = new Date(sessionStart.getTime() - 15 * 60000); // 15 min before

    if (now < joinableFrom) {
      const minutesUntilJoinable = Math.ceil(
        (joinableFrom.getTime() - now.getTime()) / 60000,
      );
      return badRequest(
        `La salle sera accessible dans ${minutesUntilJoinable} minutes`,
      );
    }

    if (now > sessionEnd) {
      return badRequest("Cette session est terminee");
    }

    // Generate or get room URL
    let roomUrl = liveSession.roomUrl;
    if (!roomUrl && liveSession.roomName) {
      roomUrl = generateRoomUrl(liveSession.roomName);

      // Update session with room URL
      await prisma.liveSession.update({
        where: { id: sessionId },
        data: { roomUrl },
      });
    }

    // If session should start and hasn't, mark as in progress
    if (liveSession.status === "SCHEDULED" && now >= sessionStart) {
      await prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          status: "IN_PROGRESS",
          startedAt: now,
        },
      });
    }

    // Return room info with user role
    return NextResponse.json({
      roomUrl,
      roomName: liveSession.roomName,
      sessionId: liveSession.id,
      title: liveSession.title,
      subject: liveSession.subject,
      duration: liveSession.duration,
      scheduledAt: liveSession.scheduledAt,
      status: liveSession.status,
      userRole: isTeacher ? "teacher" : isParent ? "parent" : "admin",
      teacher: {
        name: liveSession.teacher.name,
      },
      child: {
        firstName: liveSession.child.firstName,
      },
      // For video component configuration
      config: {
        startAudioOff: false,
        startVideoOff: false,
        showLeaveButton: true,
        showFullscreenButton: true,
        showParticipantsBar: true,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/live-sessions/[sessionId]/room - End session
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    // Only teacher can end the session
    if (
      liveSession.teacherId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return forbidden("Seul le professeur peut terminer la session");
    }

    if (liveSession.status !== "IN_PROGRESS") {
      return badRequest("La session n'est pas en cours");
    }

    // End the session
    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Session terminee",
      session: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
