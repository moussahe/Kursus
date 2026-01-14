import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const trackSchema = z.object({
  notificationId: z.string().cuid(),
  action: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId } = trackSchema.parse(body);

    await prisma.pushNotificationLog.update({
      where: { id: notificationId },
      data: {
        status: "clicked",
        clickedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Silently fail for tracking
    console.error("Track click error:", error);
    return NextResponse.json({ success: false });
  }
}
