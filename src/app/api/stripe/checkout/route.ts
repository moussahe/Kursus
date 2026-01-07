import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  courseId: z.string().cuid(),
  childId: z.string().cuid().optional(),
});

/**
 * POST /api/stripe/checkout
 * Create a Stripe Checkout Session for course purchase
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = checkoutSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: validated.error.issues },
        { status: 400 },
      );
    }

    const { courseId, childId } = validated.data;

    // Get course with author's teacher profile
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
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    // Verify course is published
    if (!course.isPublished) {
      return NextResponse.json(
        { error: "Ce cours n'est pas disponible a l'achat" },
        { status: 400 },
      );
    }

    // Verify teacher has Stripe Connect configured
    const teacherStripeAccountId =
      course.author.teacherProfile?.stripeAccountId;
    const teacherOnboarded = course.author.teacherProfile?.stripeOnboarded;

    if (!teacherStripeAccountId || !teacherOnboarded) {
      return NextResponse.json(
        { error: "L'enseignant n'a pas configure son compte de paiement" },
        { status: 400 },
      );
    }

    // Check if user already purchased this course
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingPurchase?.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Vous avez deja achete ce cours" },
        { status: 400 },
      );
    }

    // If childId provided, verify it belongs to the user
    if (childId) {
      const child = await prisma.child.findFirst({
        where: {
          id: childId,
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

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      courseId,
      courseTitle: course.title,
      coursePrice: course.price,
      buyerId: session.user.id,
      childId,
      teacherStripeAccountId,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/courses/${course.slug}?checkout_cancelled=true`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Erreur lors de la creation de la session de paiement" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation de la session de paiement" },
      { status: 500 },
    );
  }
}
