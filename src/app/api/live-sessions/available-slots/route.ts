import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized } from "@/lib/api-error";
import { availableSlotsQuerySchema } from "@/lib/validations/live-session";
import {
  LIVE_SESSION_PRICING,
  generateTimeSlots,
  type AvailableSlot,
} from "@/types/live-session";
import { Prisma } from "@prisma/client";

// GET /api/live-sessions/available-slots - Get available booking slots
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = availableSlotsQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    const { teacherId, subject, date, days } = query;

    // Calculate date range
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    // Build teacher filter
    const teacherWhere: Prisma.UserWhereInput = {
      role: "TEACHER",
      teacherProfile: {
        isVerified: true,
      },
    };

    if (teacherId) {
      teacherWhere.id = teacherId;
    }

    if (subject) {
      teacherWhere.teacherProfile = {
        ...(teacherWhere.teacherProfile as object),
        specialties: { has: subject },
      };
    }

    // Get teachers matching criteria
    const teachers = await prisma.user.findMany({
      where: teacherWhere,
      include: {
        teacherProfile: {
          select: {
            averageRating: true,
            specialties: true,
          },
        },
      },
    });

    if (teachers.length === 0) {
      return NextResponse.json({
        slots: [],
        message: "Aucun professeur disponible",
      });
    }

    const teacherIds = teachers.map((t) => t.id);

    // Get availability for these teachers
    const availabilities = await prisma.teacherAvailability.findMany({
      where: {
        teacherId: { in: teacherIds },
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Get existing sessions in the date range to exclude
    const existingSessions = await prisma.liveSession.findMany({
      where: {
        teacherId: { in: teacherIds },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        scheduledAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        teacherId: true,
        scheduledAt: true,
        duration: true,
      },
    });

    // Build available slots
    const slots: AvailableSlot[] = [];

    // Iterate through each day in the range
    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split("T")[0];

      // Find teachers available on this day
      const dayAvailabilities = availabilities.filter(
        (a) => a.dayOfWeek === dayOfWeek,
      );

      for (const availability of dayAvailabilities) {
        const teacher = teachers.find((t) => t.id === availability.teacherId);
        if (!teacher) continue;

        // Generate time slots for this availability
        const timeSlots = generateTimeSlots(
          availability.startTime,
          availability.endTime,
          60,
        );

        for (const timeSlot of timeSlots) {
          // Create datetime for this slot
          const [hours, minutes] = timeSlot.split(":").map(Number);
          const slotDateTime = new Date(currentDate);
          slotDateTime.setHours(hours, minutes, 0, 0);

          // Skip past times
          if (slotDateTime <= new Date()) continue;

          // Check if slot conflicts with existing session
          const hasConflict = existingSessions.some((session) => {
            if (session.teacherId !== availability.teacherId) return false;
            const sessionEnd = new Date(
              session.scheduledAt.getTime() + session.duration * 60000,
            );
            const slotEnd = new Date(slotDateTime.getTime() + 60 * 60000);
            return slotDateTime < sessionEnd && slotEnd > session.scheduledAt;
          });

          if (!hasConflict) {
            const endTimeSlot = new Date(slotDateTime.getTime() + 60 * 60000);
            const endTimeStr = `${endTimeSlot.getHours().toString().padStart(2, "0")}:${endTimeSlot.getMinutes().toString().padStart(2, "0")}`;

            slots.push({
              date: dateStr,
              startTime: timeSlot,
              endTime: endTimeStr,
              teacherId: teacher.id,
              teacherName: teacher.name || "Professeur",
              teacherImage: teacher.image,
              teacherRating: teacher.teacherProfile?.averageRating,
              price: LIVE_SESSION_PRICING.DEFAULT_PRICE_PER_HOUR,
            });
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort by date and time
    slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return NextResponse.json({
      slots,
      total: slots.length,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
