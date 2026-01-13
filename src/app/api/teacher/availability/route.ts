import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, forbidden } from "@/lib/api-error";
import { updateAvailabilitySchema } from "@/lib/validations/live-session";

// GET /api/teacher/availability - Get teacher's availability
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    // Get teacherId from query param (for viewing another teacher) or use current user
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || session.user.id;

    // If viewing another teacher, check they exist
    if (teacherId !== session.user.id) {
      const teacher = await prisma.user.findFirst({
        where: { id: teacherId, role: "TEACHER" },
      });
      if (!teacher) {
        return NextResponse.json(
          { error: "Professeur non trouve" },
          { status: 404 },
        );
      }
    }

    const availability = await prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(availability);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/teacher/availability - Set teacher's availability (replaces all)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return forbidden(
        "Seuls les professeurs peuvent modifier leur disponibilite",
      );
    }

    const body = await req.json();
    const validated = updateAvailabilitySchema.parse(body);

    // Delete all existing availability and recreate
    await prisma.$transaction([
      prisma.teacherAvailability.deleteMany({
        where: { teacherId: session.user.id },
      }),
      prisma.teacherAvailability.createMany({
        data: validated.map((slot) => ({
          teacherId: session.user.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive,
          timezone: slot.timezone,
        })),
      }),
    ]);

    // Fetch and return the new availability
    const availability = await prisma.teacherAvailability.findMany({
      where: { teacherId: session.user.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(availability);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/teacher/availability - Add a new availability slot
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return forbidden(
        "Seuls les professeurs peuvent modifier leur disponibilite",
      );
    }

    const body = await req.json();
    const validated = updateAvailabilitySchema.element.parse(body);

    const availability = await prisma.teacherAvailability.create({
      data: {
        teacherId: session.user.id,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        isActive: validated.isActive,
        timezone: validated.timezone,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
