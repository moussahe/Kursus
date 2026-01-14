import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const userId = session.user.id;

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    // Get all courses for this teacher
    const courses = await prisma.course.findMany({
      where: { authorId: userId },
      include: {
        _count: {
          select: {
            purchases: { where: { status: "COMPLETED" } },
            reviews: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { totalStudents: "desc" },
    });

    // Get monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const purchases = await prisma.purchase.findMany({
      where: {
        course: { authorId: userId },
        status: "COMPLETED",
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        teacherRevenue: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group purchases by month
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aou",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      const monthPurchases = purchases.filter((p) => {
        const pDate = new Date(p.createdAt);
        return (
          pDate.getFullYear() === date.getFullYear() &&
          pDate.getMonth() === date.getMonth()
        );
      });

      const revenue = monthPurchases.reduce(
        (sum, p) => sum + p.teacherRevenue,
        0,
      );
      monthlyRevenue.push({ month: monthLabel, revenue });
    }

    // Group students by month (enrollments)
    const allPurchases = await prisma.purchase.findMany({
      where: {
        course: { authorId: userId },
        status: "COMPLETED",
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthlyStudents: { month: string; students: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      const monthPurchases = allPurchases.filter((p) => {
        const pDate = new Date(p.createdAt);
        return (
          pDate.getFullYear() === date.getFullYear() &&
          pDate.getMonth() === date.getMonth()
        );
      });

      monthlyStudents.push({
        month: monthLabel,
        students: monthPurchases.length,
      });
    }

    // Get recent sales with details
    const recentSales = await prisma.purchase.findMany({
      where: {
        course: { authorId: userId },
        status: "COMPLETED",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate top performing courses
    const topCourses = courses
      .filter((c) => c.isPublished)
      .map((course) => ({
        id: course.id,
        title: course.title,
        students: course._count.purchases,
        revenue: course._count.purchases * course.price * 0.7, // 70% teacher share
        rating:
          course.reviews.length > 0
            ? course.reviews.reduce((sum, r) => sum + r.rating, 0) /
              course.reviews.length
            : 0,
        reviewCount: course._count.reviews,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate totals
    const totalRevenue = teacherProfile?.totalRevenue ?? 0;
    const totalStudents = teacherProfile?.totalStudents ?? 0;
    const averageRating = teacherProfile?.averageRating ?? 0;

    // Calculate real conversion rate from course views
    const courseIds = courses.map((c) => c.id);

    const [totalViews, uniqueViewersResult] = await Promise.all([
      prisma.courseView.count({
        where: { courseId: { in: courseIds } },
      }),
      prisma.courseView.groupBy({
        by: ["viewerId", "sessionId"],
        where: { courseId: { in: courseIds } },
        _count: true,
      }),
    ]);

    const uniqueViewers = uniqueViewersResult.length;
    const conversionRate =
      uniqueViewers > 0
        ? parseFloat(((totalStudents / uniqueViewers) * 100).toFixed(2))
        : 0;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalStudents,
        averageRating,
        conversionRate,
        totalViews,
        uniqueViewers,
      },
      monthlyRevenue,
      monthlyStudents,
      topCourses,
      recentSales: recentSales.map((sale) => ({
        id: sale.id,
        userName: sale.user.name ?? "Utilisateur",
        userEmail: sale.user.email ?? "",
        userImage: sale.user.image,
        courseTitle: sale.course.title,
        amount: sale.teacherRevenue,
        date: sale.createdAt,
      })),
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des analytiques" },
      { status: 500 },
    );
  }
}
