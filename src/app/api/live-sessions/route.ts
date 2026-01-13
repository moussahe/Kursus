import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-error";
import {
  bookSessionSchema,
  sessionQuerySchema,
} from "@/lib/validations/live-session";
import {
  calculateSessionPrice,
  LIVE_SESSION_PRICING,
} from "@/types/live-session";
import { Prisma } from "@prisma/client";

// Generate unique room name for video sessions
function generateRoomName(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sch-${timestamp}-${random}`;
}

// GET /api/live-sessions - List sessions (filtered by role)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = sessionQuerySchema.parse(Object.fromEntries(searchParams));
    const { status, teacherId, childId, from, to, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: Prisma.LiveSessionWhereInput = {};

    if (session.user.role === "TEACHER") {
      // Teachers see their own sessions
      where.teacherId = session.user.id;
    } else if (session.user.role === "PARENT") {
      // Parents see sessions they booked
      where.parentId = session.user.id;
    } else if (session.user.role !== "ADMIN") {
      return forbidden("Acces non autorise");
    }

    // Apply filters
    if (status) {
      where.status = status;
    }
    if (teacherId && session.user.role === "ADMIN") {
      where.teacherId = teacherId;
    }
    if (childId) {
      where.childId = childId;
    }
    if (from) {
      where.scheduledAt = {
        ...((where.scheduledAt as object) || {}),
        gte: new Date(from),
      };
    }
    if (to) {
      where.scheduledAt = {
        ...((where.scheduledAt as object) || {}),
        lte: new Date(to),
      };
    }

    const [sessions, total] = await prisma.$transaction([
      prisma.liveSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: "asc" },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              image: true,
              teacherProfile: {
                select: {
                  headline: true,
                  avatarUrl: true,
                  averageRating: true,
                },
              },
            },
          },
          child: {
            select: {
              id: true,
              firstName: true,
              gradeLevel: true,
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
      }),
      prisma.liveSession.count({ where }),
    ]);

    return NextResponse.json({
      data: sessions,
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

// POST /api/live-sessions - Book a new session (PARENT only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "PARENT" && session.user.role !== "ADMIN") {
      return forbidden("Seuls les parents peuvent reserver des sessions");
    }

    const body = await req.json();
    const validated = bookSessionSchema.parse(body);

    // Verify the child belongs to the parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return badRequest("Enfant non trouve ou non autorise");
    }

    // Verify the teacher exists and is available
    const teacher = await prisma.user.findFirst({
      where: {
        id: validated.teacherId,
        role: "TEACHER",
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!teacher) {
      return badRequest("Professeur non trouve");
    }

    // Check if the slot is available (no existing session at the same time)
    const scheduledAt = new Date(validated.scheduledAt);
    const endTime = new Date(
      scheduledAt.getTime() + validated.duration * 60000,
    );

    const conflictingSession = await prisma.liveSession.findFirst({
      where: {
        teacherId: validated.teacherId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        OR: [
          {
            // New session starts during existing session
            scheduledAt: { lte: scheduledAt },
            AND: {
              scheduledAt: {
                gt: new Date(
                  scheduledAt.getTime() - validated.duration * 60000,
                ),
              },
            },
          },
          {
            // New session ends during existing session
            scheduledAt: { lt: endTime, gte: scheduledAt },
          },
        ],
      },
    });

    if (conflictingSession) {
      return badRequest("Ce creneau n'est plus disponible");
    }

    // Check teacher availability for this day/time
    const dayOfWeek = scheduledAt.getDay();
    const timeString = `${scheduledAt.getHours().toString().padStart(2, "0")}:${scheduledAt.getMinutes().toString().padStart(2, "0")}`;

    const availability = await prisma.teacherAvailability.findFirst({
      where: {
        teacherId: validated.teacherId,
        dayOfWeek,
        isActive: true,
        startTime: { lte: timeString },
        endTime: { gt: timeString },
      },
    });

    if (!availability) {
      return badRequest("Le professeur n'est pas disponible a ce moment");
    }

    // Calculate pricing
    const pricing = calculateSessionPrice(
      validated.duration,
      LIVE_SESSION_PRICING.DEFAULT_PRICE_PER_HOUR,
    );

    // Generate room name
    const roomName = generateRoomName();

    // Create the session
    const liveSession = await prisma.liveSession.create({
      data: {
        teacherId: validated.teacherId,
        parentId: session.user.id,
        childId: validated.childId,
        subject: validated.subject,
        gradeLevel: child.gradeLevel,
        title: validated.title,
        description: validated.description,
        scheduledAt,
        duration: validated.duration,
        status: "SCHEDULED",
        roomName,
        price: pricing.price,
        platformFee: pricing.platformFee,
        teacherRevenue: pricing.teacherRevenue,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            image: true,
            teacherProfile: {
              select: {
                headline: true,
                avatarUrl: true,
              },
            },
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

    return NextResponse.json(liveSession, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
