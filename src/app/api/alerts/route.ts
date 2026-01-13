import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const getAlertsSchema = z.object({
  childId: z.string().cuid().optional(),
  unreadOnly: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const { childId, unreadOnly, limit } = getAlertsSchema.parse(searchParams);

    const alerts = await prisma.alert.findMany({
      where: {
        parentId: session.user.id,
        ...(childId && { childId }),
        ...(unreadOnly && { isRead: false }),
        isDismissed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ isRead: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    const unreadCount = await prisma.alert.count({
      where: {
        parentId: session.user.id,
        isRead: false,
        isDismissed: false,
      },
    });

    return NextResponse.json({ alerts, unreadCount });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Parametres invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Alerts GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const markReadSchema = z.object({
  alertIds: z.array(z.string().cuid()).min(1).max(100),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const { alertIds } = markReadSchema.parse(body);

    await prisma.alert.updateMany({
      where: {
        id: { in: alertIds },
        parentId: session.user.id,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Alerts PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
