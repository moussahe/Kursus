import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConnectAccount } from "@/lib/stripe";

/**
 * GET /api/stripe/connect/callback
 * Handle return from Stripe Connect onboarding
 */
export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await auth();
    if (!session?.user) {
      return NextResponse.redirect(`${baseUrl}/login?error=session_expired`);
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile?.stripeAccountId) {
      return NextResponse.redirect(
        `${baseUrl}/teacher/dashboard?stripe_error=no_account`,
      );
    }

    // Verify account status with Stripe
    const account = await getConnectAccount(teacherProfile.stripeAccountId);
    const isOnboarded = account.details_submitted && account.charges_enabled;

    // Update teacher profile status
    await prisma.teacherProfile.update({
      where: { userId: session.user.id },
      data: { stripeOnboarded: isOnboarded },
    });

    // Redirect based on status
    if (isOnboarded) {
      return NextResponse.redirect(
        `${baseUrl}/teacher/dashboard?stripe_success=true`,
      );
    } else {
      // Onboarding not complete
      return NextResponse.redirect(
        `${baseUrl}/teacher/dashboard?stripe_pending=true`,
      );
    }
  } catch (error) {
    console.error("Stripe Connect callback error:", error);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/teacher/dashboard?stripe_error=unknown`,
    );
  }
}
