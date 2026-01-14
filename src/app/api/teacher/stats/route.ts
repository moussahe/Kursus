import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, forbidden } from "@/lib/api-error";

// GET /api/teacher/stats - Get teacher dashboard stats
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return forbidden("Acces reserve aux enseignants");
    }

    const teacherId = session.user.id;

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: teacherId },
    });

    // Get all teacher's courses
    const courses = await prisma.course.findMany({
      where: { authorId: teacherId },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        price: true,
        isPublished: true,
        totalStudents: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        publishedAt: true,
      },
    });

    // Get total revenue from completed purchases
    const revenueStats = await prisma.purchase.aggregate({
      where: {
        course: { authorId: teacherId },
        status: "COMPLETED",
      },
      _sum: {
        teacherRevenue: true,
      },
      _count: true,
    });

    // Get unique students count
    const uniqueStudents = await prisma.purchase.findMany({
      where: {
        course: { authorId: teacherId },
        status: "COMPLETED",
      },
      distinct: ["userId"],
      select: { userId: true },
    });

    // Get recent sales (last 10)
    const recentSales = await prisma.purchase.findMany({
      where: {
        course: { authorId: teacherId },
        status: "COMPLETED",
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        child: {
          select: {
            firstName: true,
            gradeLevel: true,
          },
        },
      },
    });

    // Get monthly revenue for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyPurchases = await prisma.purchase.findMany({
      where: {
        course: { authorId: teacherId },
        status: "COMPLETED",
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        teacherRevenue: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};
    monthlyPurchases.forEach((purchase) => {
      const monthKey = purchase.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[monthKey] =
        (monthlyRevenue[monthKey] || 0) + purchase.teacherRevenue;
    });

    // Get average rating across all courses
    const avgRating = await prisma.review.aggregate({
      where: {
        course: { authorId: teacherId },
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        course: { authorId: teacherId },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Get per-course revenue using groupBy
    const courseIds = courses.map((c) => c.id);
    const courseRevenueData = await prisma.purchase.groupBy({
      by: ["courseId"],
      where: {
        courseId: { in: courseIds },
        status: "COMPLETED",
      },
      _sum: {
        teacherRevenue: true,
      },
    });

    // Create a map for quick lookup
    const courseRevenueMap = new Map(
      courseRevenueData.map((r) => [r.courseId, r._sum.teacherRevenue || 0]),
    );

    return NextResponse.json({
      profile: teacherProfile,
      stats: {
        totalRevenue: revenueStats._sum.teacherRevenue || 0,
        totalSales: revenueStats._count,
        totalStudents: uniqueStudents.length,
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.isPublished).length,
        avgRating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count,
      },
      courses: courses.map((course) => ({
        ...course,
        revenue: courseRevenueMap.get(course.id) || 0,
      })),
      recentSales: recentSales.map((sale) => ({
        id: sale.id,
        amount: sale.teacherRevenue,
        createdAt: sale.createdAt,
        course: sale.course,
        buyer: sale.user,
        child: sale.child,
      })),
      monthlyRevenue: Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      recentReviews,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
