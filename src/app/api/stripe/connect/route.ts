import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createConnectAccount,
  createAccountLink,
  getConnectAccount,
  createLoginLink,
} from "@/lib/stripe";

/**
 * POST /api/stripe/connect
 * Start Stripe Connect onboarding for a teacher
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Verify user is a teacher
    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Seuls les enseignants peuvent connecter Stripe" },
        { status: 403 },
      );
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Profil enseignant non trouve" },
        { status: 404 },
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    let stripeAccountId = teacherProfile.stripeAccountId;

    // If teacher already has a Stripe account, create a new onboarding link
    if (stripeAccountId) {
      const account = await getConnectAccount(stripeAccountId);

      // If already fully onboarded, return error
      if (account.details_submitted && account.charges_enabled) {
        return NextResponse.json(
          { error: "Compte Stripe deja configure" },
          { status: 400 },
        );
      }

      // Create new account link for incomplete onboarding
      const accountLink = await createAccountLink(
        stripeAccountId,
        `${baseUrl}/api/stripe/connect?refresh=true`,
        `${baseUrl}/api/stripe/connect/callback`,
      );

      return NextResponse.json({ url: accountLink.url });
    }

    // Create new Stripe Connect account
    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        { error: "Email requis pour Stripe" },
        { status: 400 },
      );
    }

    const account = await createConnectAccount(session.user.id, email);
    stripeAccountId = account.id;

    // Save Stripe account ID to teacher profile
    await prisma.teacherProfile.update({
      where: { userId: session.user.id },
      data: {
        stripeAccountId,
        stripeOnboarded: false,
      },
    });

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      stripeAccountId,
      `${baseUrl}/api/stripe/connect?refresh=true`,
      `${baseUrl}/api/stripe/connect/callback`,
    );

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la configuration Stripe" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/stripe/connect
 * Check Stripe Connect status or handle refresh
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Check if this is a refresh request (user returned from Stripe without completing)
    const { searchParams } = new URL(req.url);
    const isRefresh = searchParams.get("refresh") === "true";

    if (isRefresh) {
      // Redirect to POST to create a new account link
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return NextResponse.redirect(
        `${baseUrl}/teacher/dashboard?stripe_refresh=true`,
      );
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        accountId: null,
        dashboardUrl: null,
      });
    }

    if (!teacherProfile.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        accountId: null,
        dashboardUrl: null,
      });
    }

    // Get account status from Stripe
    const account = await getConnectAccount(teacherProfile.stripeAccountId);
    const isOnboarded = account.details_submitted && account.charges_enabled;

    // Update local status if needed
    if (isOnboarded !== teacherProfile.stripeOnboarded) {
      await prisma.teacherProfile.update({
        where: { userId: session.user.id },
        data: { stripeOnboarded: isOnboarded },
      });
    }

    // Get dashboard URL if onboarded
    let dashboardUrl: string | null = null;
    if (isOnboarded) {
      const loginLink = await createLoginLink(teacherProfile.stripeAccountId);
      dashboardUrl = loginLink.url;
    }

    return NextResponse.json({
      connected: true,
      onboarded: isOnboarded,
      accountId: teacherProfile.stripeAccountId,
      dashboardUrl,
    });
  } catch (error) {
    console.error("Stripe Connect status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la verification du statut Stripe" },
      { status: 500 },
    );
  }
}
