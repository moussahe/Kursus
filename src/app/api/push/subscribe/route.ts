import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  childId: z.string().cuid().optional(),
  userAgent: z.string().optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  browserName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const validated = subscribeSchema.parse(body);

    // If childId provided, verify it belongs to the user
    if (validated.childId) {
      const child = await prisma.child.findFirst({
        where: {
          id: validated.childId,
          parentId: session.user.id,
        },
      });

      if (!child) {
        return NextResponse.json(
          { error: "Enfant non trouve" },
          { status: 404 },
        );
      }
    }

    // Upsert subscription (update if same endpoint exists)
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: validated.endpoint,
        },
      },
      update: {
        p256dh: validated.keys.p256dh,
        auth: validated.keys.auth,
        childId: validated.childId,
        userAgent: validated.userAgent,
        deviceType: validated.deviceType,
        browserName: validated.browserName,
        isActive: true,
        failedCount: 0,
        lastUsedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint: validated.endpoint,
        p256dh: validated.keys.p256dh,
        auth: validated.keys.auth,
        childId: validated.childId,
        userAgent: validated.userAgent,
        deviceType: validated.deviceType,
        browserName: validated.browserName,
      },
    });

    // Ensure notification preferences exist
    await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = z.object({ endpoint: z.string() }).parse(body);

    await prisma.pushSubscription.updateMany({
      where: {
        userId: session.user.id,
        endpoint,
      },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
