import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateWeeklyReport } from "@/lib/services/alert-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const report = await generateWeeklyReport(session.user.id);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
