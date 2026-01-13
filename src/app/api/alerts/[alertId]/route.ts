import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

const updateAlertSchema = z.object({
  isRead: z.boolean().optional(),
  isDismissed: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { alertId } = await params;
    const body = await req.json();
    const data = updateAlertSchema.parse(body);

    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        parentId: session.user.id,
      },
    });

    if (!alert) {
      return NextResponse.json(
        { error: "Alerte non trouvee" },
        { status: 404 },
      );
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Alert PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { alertId } = await params;

    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        parentId: session.user.id,
      },
    });

    if (!alert) {
      return NextResponse.json(
        { error: "Alerte non trouvee" },
        { status: 404 },
      );
    }

    await prisma.alert.update({
      where: { id: alertId },
      data: { isDismissed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Alert DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
