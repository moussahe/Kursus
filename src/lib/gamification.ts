import { prisma } from "@/lib/prisma";
import { BadgeCategory } from "@prisma/client";

// XP rewards for different actions
export const XP_REWARDS = {
  LESSON_COMPLETED: 50,
  QUIZ_COMPLETE: 25,
  QUIZ_PASS: 100,
  QUIZ_PASSED: 100,
  QUIZ_PERFECT: 200,
  COURSE_COMPLETED: 500,
  DAILY_STREAK: 25,
  FIRST_LESSON: 100,
  AI_CHAT_QUESTION: 10,
} as const;

// Level thresholds (XP needed for each level)
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  300, // Level 3
  600, // Level 4
  1000, // Level 5
  1500, // Level 6
  2100, // Level 7
  2800, // Level 8
  3600, // Level 9
  4500, // Level 10
  5500, // Level 11
  6600, // Level 12
  7800, // Level 13
  9100, // Level 14
  10500, // Level 15
];

// Calculate level from XP
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Calculate XP needed for next level
export function xpToNextLevel(xp: number): {
  current: number;
  needed: number;
  progress: number;
} {
  const level = calculateLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold =
    LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const progress = Math.min(100, Math.round((current / needed) * 100));

  return { current, needed, progress };
}

// Add XP to a child and update level
// Note: _reason parameter is for future XP history/audit logging
export async function addXP(
  childId: string,
  amount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _reason?: string,
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { xp: true, level: true },
  });

  if (!child) {
    throw new Error("Child not found");
  }

  const newXP = child.xp + amount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > child.level;

  await prisma.child.update({
    where: { id: childId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  });

  return { newXP, newLevel, leveledUp };
}

// Update streak for a child
export async function updateStreak(childId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  streakUpdated: boolean;
}> {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { currentStreak: true, longestStreak: true, lastActivityAt: true },
  });

  if (!child) {
    throw new Error("Child not found");
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = child.lastActivityAt;

  let newStreak = child.currentStreak;
  let streakUpdated = false;

  if (lastActivity) {
    const lastActivityDate = new Date(
      lastActivity.getFullYear(),
      lastActivity.getMonth(),
      lastActivity.getDate(),
    );
    const diffDays = Math.floor(
      (today.getTime() - lastActivityDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (diffDays === 0) {
      // Same day, no change
      streakUpdated = false;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      newStreak = child.currentStreak + 1;
      streakUpdated = true;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
      streakUpdated = true;
    }
  } else {
    // First activity ever
    newStreak = 1;
    streakUpdated = true;
  }

  const newLongestStreak = Math.max(newStreak, child.longestStreak);

  await prisma.child.update({
    where: { id: childId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityAt: now,
    },
  });

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    streakUpdated,
  };
}

// Badge definitions
export const BADGE_DEFINITIONS = [
  // Progress badges
  {
    code: "first_lesson",
    name: "Premier Pas",
    description: "A termine sa premiere lecon",
    category: BadgeCategory.PROGRESS,
    xpReward: 50,
    requirement: { lessonsCompleted: 1 },
  },
  {
    code: "lesson_10",
    name: "Explorateur",
    description: "A termine 10 leçons",
    category: BadgeCategory.PROGRESS,
    xpReward: 100,
    requirement: { lessonsCompleted: 10 },
  },
  {
    code: "lesson_50",
    name: "Aventurier",
    description: "A termine 50 leçons",
    category: BadgeCategory.PROGRESS,
    xpReward: 250,
    requirement: { lessonsCompleted: 50 },
  },
  {
    code: "lesson_100",
    name: "Savant",
    description: "A termine 100 leçons",
    category: BadgeCategory.PROGRESS,
    xpReward: 500,
    requirement: { lessonsCompleted: 100 },
  },
  {
    code: "first_course",
    name: "Diplome",
    description: "A termine son premier cours complet",
    category: BadgeCategory.PROGRESS,
    xpReward: 200,
    requirement: { coursesCompleted: 1 },
  },

  // Streak badges
  {
    code: "streak_3",
    name: "En Route",
    description: "3 jours consecutifs d'etude",
    category: BadgeCategory.STREAK,
    xpReward: 50,
    requirement: { streak: 3 },
  },
  {
    code: "streak_7",
    name: "Regulier",
    description: "7 jours consecutifs d'etude",
    category: BadgeCategory.STREAK,
    xpReward: 100,
    requirement: { streak: 7 },
  },
  {
    code: "streak_30",
    name: "Marathonien",
    description: "30 jours consecutifs d'etude",
    category: BadgeCategory.STREAK,
    xpReward: 500,
    requirement: { streak: 30 },
  },

  // Quiz badges
  {
    code: "quiz_first",
    name: "Testeur",
    description: "A reussi son premier quiz",
    category: BadgeCategory.QUIZ,
    xpReward: 50,
    requirement: { quizzesPassed: 1 },
  },
  {
    code: "quiz_perfect",
    name: "Perfectionniste",
    description: "A obtenu 100% a un quiz",
    category: BadgeCategory.QUIZ,
    xpReward: 150,
    requirement: { perfectQuizzes: 1 },
  },
  {
    code: "quiz_master",
    name: "Maitre des Quiz",
    description: "A obtenu 100% a 10 quiz",
    category: BadgeCategory.QUIZ,
    xpReward: 500,
    requirement: { perfectQuizzes: 10 },
  },

  // Achievement badges
  {
    code: "level_5",
    name: "Apprenti",
    description: "A atteint le niveau 5",
    category: BadgeCategory.ACHIEVEMENT,
    xpReward: 100,
    requirement: { level: 5 },
  },
  {
    code: "level_10",
    name: "Expert",
    description: "A atteint le niveau 10",
    category: BadgeCategory.ACHIEVEMENT,
    xpReward: 250,
    requirement: { level: 10 },
  },
  {
    code: "xp_1000",
    name: "Collectionneur",
    description: "A accumule 1000 XP",
    category: BadgeCategory.ACHIEVEMENT,
    xpReward: 100,
    requirement: { xp: 1000 },
  },
] as const;

// Check and award badges for a child
export async function checkAndAwardBadges(
  childId: string,
): Promise<{ code: string; name: string }[]> {
  const [child, existingBadges, allBadges] = await Promise.all([
    prisma.child.findUnique({
      where: { id: childId },
      select: {
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
      },
    }),
    prisma.childBadge.findMany({
      where: { childId },
      select: { badge: { select: { code: true } } },
    }),
    prisma.badge.findMany(),
  ]);

  if (!child) {
    return [];
  }

  // Get stats for badge checking
  const [lessonsCompleted, coursesCompleted, quizzesPassed, perfectQuizzes] =
    await Promise.all([
      prisma.progress.count({
        where: { childId, isCompleted: true },
      }),
      // Count courses where all lessons are completed
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT c.id) as count
        FROM "Course" c
        JOIN "Chapter" ch ON ch."courseId" = c.id
        JOIN "Lesson" l ON l."chapterId" = ch.id
        JOIN "Progress" p ON p."lessonId" = l.id AND p."childId" = ${childId}
        WHERE p."isCompleted" = true
        GROUP BY c.id
        HAVING COUNT(DISTINCT l.id) = (
          SELECT COUNT(*) FROM "Lesson" l2
          JOIN "Chapter" ch2 ON l2."chapterId" = ch2.id
          WHERE ch2."courseId" = c.id AND l2."isPublished" = true
        )
      `.then((r) => Number(r[0]?.count || 0)),
      prisma.progress.count({
        where: { childId, quizScore: { gte: 70 } },
      }),
      prisma.progress.count({
        where: { childId, quizScore: 100 },
      }),
    ]);

  const existingBadgeCodes = new Set(existingBadges.map((b) => b.badge.code));
  const newBadges: { code: string; name: string }[] = [];

  // Check each badge
  for (const badge of allBadges) {
    if (existingBadgeCodes.has(badge.code)) {
      continue;
    }

    const req = badge.requirement as Record<string, number> | null;
    if (!req) continue;

    let earned = false;

    if (req.lessonsCompleted && lessonsCompleted >= req.lessonsCompleted) {
      earned = true;
    }
    if (req.coursesCompleted && coursesCompleted >= req.coursesCompleted) {
      earned = true;
    }
    if (req.streak && child.longestStreak >= req.streak) {
      earned = true;
    }
    if (req.quizzesPassed && quizzesPassed >= req.quizzesPassed) {
      earned = true;
    }
    if (req.perfectQuizzes && perfectQuizzes >= req.perfectQuizzes) {
      earned = true;
    }
    if (req.level && child.level >= req.level) {
      earned = true;
    }
    if (req.xp && child.xp >= req.xp) {
      earned = true;
    }

    if (earned) {
      await prisma.childBadge.create({
        data: { childId, badgeId: badge.id },
      });

      // Award bonus XP for the badge
      if (badge.xpReward > 0) {
        await addXP(childId, badge.xpReward, `Badge: ${badge.name}`);
      }

      newBadges.push({ code: badge.code, name: badge.name });
    }
  }

  return newBadges;
}

// Get gamification stats for a child
export async function getGamificationStats(childId: string) {
  const [child, badges, recentActivity] = await Promise.all([
    prisma.child.findUnique({
      where: { id: childId },
      select: {
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityAt: true,
      },
    }),
    prisma.childBadge.findMany({
      where: { childId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.progress.count({
      where: {
        childId,
        lastAccessedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  if (!child) {
    return null;
  }

  const levelProgress = xpToNextLevel(child.xp);

  return {
    xp: child.xp,
    level: child.level,
    levelProgress,
    currentStreak: child.currentStreak,
    longestStreak: child.longestStreak,
    lastActivityAt: child.lastActivityAt,
    badges: badges.map((b) => ({
      code: b.badge.code,
      name: b.badge.name,
      description: b.badge.description,
      imageUrl: b.badge.imageUrl,
      category: b.badge.category,
      earnedAt: b.earnedAt,
    })),
    recentActivityCount: recentActivity,
  };
}

// Alias for addXP (for API consistency)
export const awardXP = addXP;
