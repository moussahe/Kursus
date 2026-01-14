import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { GradeLevel } from "@prisma/client";

const querySchema = z.object({
  period: z.enum(["weekly", "monthly", "all_time"]).default("weekly"),
  gradeLevel: z.nativeEnum(GradeLevel).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  childId: z.string().cuid().optional(),
});

export type LeaderboardEntry = {
  rank: number;
  childId: string;
  firstName: string;
  avatarUrl: string | null;
  gradeLevel: GradeLevel;
  xp: number;
  level: number;
  currentStreak: number;
  isCurrentUser: boolean;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  totalParticipants: number;
  period: "weekly" | "monthly" | "all_time";
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      period: searchParams.get("period") || "weekly",
      gradeLevel: searchParams.get("gradeLevel") || undefined,
      limit: searchParams.get("limit") || 10,
      childId: searchParams.get("childId") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametres invalides", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { period, gradeLevel, limit, childId } = parsed.data;

    // Get the requesting user's children to mark them in the leaderboard
    const userChildren = await prisma.child.findMany({
      where: { parentId: session.user.id },
      select: { id: true },
    });
    const userChildIds = new Set(userChildren.map((c) => c.id));

    // Build date filter based on period
    let dateFilter: { lastActivityAt?: { gte: Date } } = {};
    const now = new Date();

    if (period === "weekly") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastActivityAt: { gte: weekAgo } };
    } else if (period === "monthly") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { lastActivityAt: { gte: monthAgo } };
    }
    // all_time has no date filter

    // Build grade level filter
    const gradeLevelFilter = gradeLevel ? { gradeLevel } : {};

    // Get leaderboard data - children ordered by XP
    const children = await prisma.child.findMany({
      where: {
        ...dateFilter,
        ...gradeLevelFilter,
        xp: { gt: 0 }, // Only include children with XP
      },
      select: {
        id: true,
        firstName: true,
        avatarUrl: true,
        gradeLevel: true,
        xp: true,
        level: true,
        currentStreak: true,
      },
      orderBy: [{ xp: "desc" }, { level: "desc" }, { currentStreak: "desc" }],
      take: limit,
    });

    // Get total count for stats
    const totalParticipants = await prisma.child.count({
      where: {
        ...dateFilter,
        ...gradeLevelFilter,
        xp: { gt: 0 },
      },
    });

    // Format leaderboard entries
    const leaderboard: LeaderboardEntry[] = children.map((child, index) => ({
      rank: index + 1,
      childId: child.id,
      firstName: child.firstName,
      avatarUrl: child.avatarUrl,
      gradeLevel: child.gradeLevel,
      xp: child.xp,
      level: child.level,
      currentStreak: child.currentStreak,
      isCurrentUser: userChildIds.has(child.id),
    }));

    // Find current user's child rank if not in top list
    let currentUserRank: LeaderboardEntry | null = null;

    if (childId && userChildIds.has(childId)) {
      const existingInList = leaderboard.find((e) => e.childId === childId);

      if (existingInList) {
        currentUserRank = existingInList;
      } else {
        // Find the child's rank
        const child = await prisma.child.findUnique({
          where: { id: childId },
          select: {
            id: true,
            firstName: true,
            avatarUrl: true,
            gradeLevel: true,
            xp: true,
            level: true,
            currentStreak: true,
          },
        });

        if (child && child.xp > 0) {
          // Count how many children have more XP
          const rank = await prisma.child.count({
            where: {
              ...dateFilter,
              ...gradeLevelFilter,
              xp: { gt: child.xp },
            },
          });

          currentUserRank = {
            rank: rank + 1,
            childId: child.id,
            firstName: child.firstName,
            avatarUrl: child.avatarUrl,
            gradeLevel: child.gradeLevel,
            xp: child.xp,
            level: child.level,
            currentStreak: child.currentStreak,
            isCurrentUser: true,
          };
        }
      }
    }

    const response: LeaderboardResponse = {
      leaderboard,
      currentUserRank,
      totalParticipants,
      period,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Leaderboard API Error]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
