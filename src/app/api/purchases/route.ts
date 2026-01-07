import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, badRequest } from "@/lib/api-error";
import {
  checkoutSchema,
  purchaseQuerySchema,
} from "@/lib/validations/purchase";
import {
  createCheckoutSession,
  calculatePlatformFee,
  calculateTeacherRevenue,
} from "@/lib/stripe";

// GET /api/purchases - List user's purchases
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = purchaseQuerySchema.parse(Object.fromEntries(searchParams));

    const { childId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      userId: string;
      childId?: string;
      status?: "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";
    } = {
      userId: session.user.id,
    };

    if (childId) {
      where.childId = childId;
    }

    if (status) {
      where.status = status;
    }

    const [purchases, total] = await prisma.$transaction([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              subtitle: true,
              imageUrl: true,
              gradeLevel: true,
              subject: true,
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gradeLevel: true,
            },
          },
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    return NextResponse.json({
      data: purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/purchases - Create purchase (initiate Stripe checkout)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId, isPublished: true },
      include: {
        author: {
          include: {
            teacherProfile: true,
          },
        },
      },
    });

    if (!course) {
      return badRequest("Cours non trouve ou non publie");
    }

    // Check if user already purchased this course
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: validated.courseId,
        status: { in: ["PENDING", "COMPLETED"] },
      },
    });

    if (existingPurchase) {
      if (existingPurchase.status === "COMPLETED") {
        return badRequest("Vous avez deja achete ce cours");
      }
      // Return existing pending session
      return NextResponse.json({
        purchaseId: existingPurchase.id,
        message: "Un achat est deja en cours",
      });
    }

    // Verify child belongs to user if provided
    if (validated.childId) {
      const child = await prisma.child.findFirst({
        where: {
          id: validated.childId,
          parentId: session.user.id,
        },
      });

      if (!child) {
        return badRequest("Enfant non trouve");
      }
    }

    // Check if teacher has Stripe Connect setup
    const teacherStripeAccountId =
      course.author.teacherProfile?.stripeAccountId;

    if (!teacherStripeAccountId) {
      return badRequest(
        "Ce cours ne peut pas encore etre achete (enseignant non configure)",
      );
    }

    // Calculate fees
    const platformFee = calculatePlatformFee(course.price);
    const teacherRevenue = calculateTeacherRevenue(course.price);

    // Create pending purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        childId: validated.childId,
        courseId: course.id,
        amount: course.price,
        platformFee,
        teacherRevenue,
        status: "PENDING",
      },
    });

    // Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      courseId: course.id,
      courseTitle: course.title,
      coursePrice: course.price,
      buyerId: session.user.id,
      childId: validated.childId,
      teacherStripeAccountId,
      successUrl: `${baseUrl}/dashboard/purchases?success=true&purchaseId=${purchase.id}`,
      cancelUrl: `${baseUrl}/courses/${course.slug}?canceled=true`,
    });

    // Update purchase with Stripe payment intent
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        stripePaymentIntentId: checkoutSession.payment_intent as string,
      },
    });

    return NextResponse.json({
      purchaseId: purchase.id,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
