import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const trackSchema = z.object({
  notificationId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId } = trackSchema.parse(body);

    // Only update if not already clicked (click has higher priority)
    await prisma.pushNotificationLog.updateMany({
      where: {
        id: notificationId,
        clickedAt: null,
      },
      data: {
        status: "dismissed",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Silently fail for tracking
    console.error("Track dismiss error:", error);
    return NextResponse.json({ success: false });
  }
}
