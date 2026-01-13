import { NextRequest, NextResponse } from "next/server";
import { runAllAlertChecks } from "@/lib/services/alert-service";

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret or admin auth
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const results = await runAllAlertChecks();

    return NextResponse.json({
      success: true,
      alertsCreated: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Alert generation error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
