import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const viewSchema = z.object({
  sessionId: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  deviceType: z.string().optional(),
  duration: z.number().optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
});

/**
 * POST /api/courses/[courseId]/views
 * Track a course page view for analytics
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const session = await auth();

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    // Only track views for published courses
    if (!course.isPublished) {
      return NextResponse.json({ success: true }); // Silently ignore unpublished
    }

    const body = await req.json();
    const validated = viewSchema.parse(body);

    // Get user agent from request
    const userAgent = req.headers.get("user-agent");

    // Create the view record
    await prisma.courseView.create({
      data: {
        courseId,
        viewerId: session?.user?.id || null,
        sessionId: validated.sessionId || null,
        referrer: validated.referrer || null,
        utmSource: validated.utmSource || null,
        utmMedium: validated.utmMedium || null,
        utmCampaign: validated.utmCampaign || null,
        userAgent: userAgent || null,
        deviceType: validated.deviceType || null,
        duration: validated.duration || null,
        scrollDepth: validated.scrollDepth || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[CourseViews] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * GET /api/courses/[courseId]/views
 * Get view statistics for a course (teacher only)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    // Get view statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalViews, uniqueViewers, recentViews, purchases] =
      await Promise.all([
        // Total views all time
        prisma.courseView.count({
          where: { courseId },
        }),
        // Unique viewers (by viewerId or sessionId)
        prisma.courseView.groupBy({
          by: ["viewerId", "sessionId"],
          where: { courseId },
          _count: true,
        }),
        // Views in last 30 days
        prisma.courseView.count({
          where: {
            courseId,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        // Purchases for conversion rate
        prisma.purchase.count({
          where: {
            courseId,
            status: "COMPLETED",
          },
        }),
      ]);

    const uniqueCount = uniqueViewers.length;
    const conversionRate =
      uniqueCount > 0 ? ((purchases / uniqueCount) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      totalViews,
      uniqueViewers: uniqueCount,
      recentViews, // Last 30 days
      purchases,
      conversionRate: parseFloat(conversionRate),
    });
  } catch (error) {
    console.error("[CourseViews] GET Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
