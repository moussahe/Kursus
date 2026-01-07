import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  constructWebhookEvent,
  calculatePlatformFee,
  calculateTeacherRevenue,
  stripe,
} from "@/lib/stripe";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { courseId, buyerId, childId } = session.metadata || {};

  if (!courseId || !buyerId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  // Get course for pricing info
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      author: {
        include: {
          teacherProfile: true,
        },
      },
    },
  });

  if (!course) {
    console.error("Course not found for purchase:", courseId);
    return;
  }

  const amount = course.price;
  const platformFee = calculatePlatformFee(amount);
  const teacherRevenue = calculateTeacherRevenue(amount);

  // Get payment intent for transfer info
  let stripePaymentIntentId: string | undefined;
  let stripeTransferId: string | undefined;

  if (session.payment_intent) {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;
    stripePaymentIntentId = paymentIntentId;

    // Get transfer ID from payment intent
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.transfer_data?.destination) {
        // The transfer is automatically created by Stripe Connect
        stripeTransferId = paymentIntent.latest_charge as string | undefined;
      }
    } catch (err) {
      console.error("Error retrieving payment intent:", err);
    }
  }

  // Create or update purchase record
  await prisma.purchase.upsert({
    where: {
      userId_courseId: {
        userId: buyerId,
        courseId,
      },
    },
    create: {
      userId: buyerId,
      courseId,
      childId: childId || null,
      amount,
      platformFee,
      teacherRevenue,
      stripePaymentIntentId,
      stripeTransferId,
      status: "COMPLETED",
    },
    update: {
      childId: childId || null,
      amount,
      platformFee,
      teacherRevenue,
      stripePaymentIntentId,
      stripeTransferId,
      status: "COMPLETED",
    },
  });

  // Update course total students
  await prisma.course.update({
    where: { id: courseId },
    data: {
      totalStudents: {
        increment: 1,
      },
    },
  });

  // Update teacher profile stats
  if (course.author.teacherProfile) {
    await prisma.teacherProfile.update({
      where: { id: course.author.teacherProfile.id },
      data: {
        totalStudents: {
          increment: 1,
        },
        totalRevenue: {
          increment: teacherRevenue,
        },
      },
    });
  }

  // TODO: Send confirmation email
  console.log(`Purchase completed: Course ${courseId} by user ${buyerId}`);
}

/**
 * Handle account.updated event for Connect accounts
 */
async function handleAccountUpdated(account: Stripe.Account) {
  const { teacherId } = account.metadata || {};

  // If no teacherId in metadata, try to find by account ID
  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: {
      OR: [{ stripeAccountId: account.id }, { userId: teacherId }],
    },
  });

  if (!teacherProfile) {
    console.log("No teacher profile found for account:", account.id);
    return;
  }

  const isOnboarded = account.details_submitted && account.charges_enabled;

  // Update teacher profile status
  await prisma.teacherProfile.update({
    where: { id: teacherProfile.id },
    data: {
      stripeOnboarded: isOnboarded,
    },
  });

  console.log(
    `Teacher ${teacherProfile.userId} Stripe status updated: onboarded=${isOnboarded}`,
  );
}
