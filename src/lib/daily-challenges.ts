import { prisma } from "@/lib/prisma";
import { DailyChallengeType, Subject } from "@prisma/client";
import { addXP } from "@/lib/gamification";

// Challenge templates with French content
const CHALLENGE_TEMPLATES: {
  type: DailyChallengeType;
  title: string;
  description: string;
  targetValue: number;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  bonusXp: number;
  encouragement: string;
  completionMessage: string;
}[] = [
  // EASY challenges
  {
    type: "LESSON",
    title: "Premiere Leçon",
    description: "Complete 1 lecon aujourd'hui",
    targetValue: 1,
    difficulty: "easy",
    xpReward: 30,
    bonusXp: 10,
    encouragement: "Une lecon, c'est tout ce qu'il te faut pour progresser !",
    completionMessage: "Bravo ! Tu as termine ta lecon du jour !",
  },
  {
    type: "QUIZ",
    title: "Quiz Express",
    description: "Complete 1 quiz avec au moins 60%",
    targetValue: 1,
    difficulty: "easy",
    xpReward: 35,
    bonusXp: 15,
    encouragement: "Un quiz rapide pour tester tes connaissances !",
    completionMessage: "Super ! Tu as reussi ton quiz du jour !",
  },
  {
    type: "AI_QUESTIONS",
    title: "Curieux du Jour",
    description: "Pose 2 questions a l'assistant IA",
    targetValue: 2,
    difficulty: "easy",
    xpReward: 25,
    bonusXp: 10,
    encouragement:
      "L'IA est la pour t'aider, n'hesite pas a poser des questions !",
    completionMessage: "Genial ! Ta curiosite est recompensee !",
  },
  {
    type: "TIME_SPENT",
    title: "10 Minutes d'Etude",
    description: "Etudie pendant au moins 10 minutes",
    targetValue: 10,
    difficulty: "easy",
    xpReward: 30,
    bonusXp: 10,
    encouragement: "10 minutes, c'est le temps d'un episode !",
    completionMessage: "Excellent ! Tu as bien travaille aujourd'hui !",
  },

  // MEDIUM challenges
  {
    type: "LESSON",
    title: "Double Leçon",
    description: "Complete 2 leçons aujourd'hui",
    targetValue: 2,
    difficulty: "medium",
    xpReward: 60,
    bonusXp: 20,
    encouragement: "Deux leçons pour doubler tes connaissances !",
    completionMessage: "Impressionnant ! Deux leçons en une journee !",
  },
  {
    type: "QUIZ",
    title: "Champion des Quiz",
    description: "Complete 2 quiz avec au moins 70%",
    targetValue: 2,
    difficulty: "medium",
    xpReward: 70,
    bonusXp: 25,
    encouragement: "Montre ce que tu sais en reussissant deux quiz !",
    completionMessage: "Tu es un vrai champion des quiz !",
  },
  {
    type: "PERFECT_QUIZ",
    title: "Perfectionniste",
    description: "Obtiens 100% a un quiz",
    targetValue: 1,
    difficulty: "medium",
    xpReward: 100,
    bonusXp: 50,
    encouragement: "Vise la perfection, tu peux y arriver !",
    completionMessage: "Parfait ! Tu as obtenu 100% !",
  },
  {
    type: "TIME_SPENT",
    title: "Demi-heure d'Effort",
    description: "Etudie pendant au moins 30 minutes",
    targetValue: 30,
    difficulty: "medium",
    xpReward: 75,
    bonusXp: 25,
    encouragement: "30 minutes d'etude font toute la difference !",
    completionMessage: "Super concentration ! 30 minutes bien investies !",
  },
  {
    type: "AI_QUESTIONS",
    title: "Explorateur Curieux",
    description: "Pose 5 questions a l'assistant IA",
    targetValue: 5,
    difficulty: "medium",
    xpReward: 50,
    bonusXp: 20,
    encouragement: "Plus tu poses de questions, plus tu apprends !",
    completionMessage: "Ta curiosite est sans limite !",
  },
  {
    type: "REVIEW",
    title: "Revision Express",
    description: "Complete 3 revisions",
    targetValue: 3,
    difficulty: "medium",
    xpReward: 60,
    bonusXp: 20,
    encouragement: "La repetition est la cle de la memorisation !",
    completionMessage: "Tes revisions portent leurs fruits !",
  },

  // HARD challenges
  {
    type: "LESSON",
    title: "Marathon d'Apprentissage",
    description: "Complete 3 leçons aujourd'hui",
    targetValue: 3,
    difficulty: "hard",
    xpReward: 120,
    bonusXp: 40,
    encouragement: "Un vrai marathon pour les plus motives !",
    completionMessage: "Incroyable ! Trois leçons en un jour !",
  },
  {
    type: "QUIZ",
    title: "Maitre des Quiz",
    description: "Complete 3 quiz avec au moins 80%",
    targetValue: 3,
    difficulty: "hard",
    xpReward: 150,
    bonusXp: 50,
    encouragement: "Prouve que tu maitrises tes cours !",
    completionMessage: "Tu es un veritable maitre des quiz !",
  },
  {
    type: "PERFECT_QUIZ",
    title: "Double Perfection",
    description: "Obtiens 100% a 2 quiz",
    targetValue: 2,
    difficulty: "hard",
    xpReward: 200,
    bonusXp: 75,
    encouragement: "La perfection en double, c'est le defi ultime !",
    completionMessage: "Double perfection atteinte ! Tu es exceptionnel !",
  },
  {
    type: "TIME_SPENT",
    title: "Une Heure de Travail",
    description: "Etudie pendant au moins 60 minutes",
    targetValue: 60,
    difficulty: "hard",
    xpReward: 150,
    bonusXp: 50,
    encouragement: "Une heure complete d'apprentissage intensif !",
    completionMessage: "Une heure de pur effort ! Bravo !",
  },
  {
    type: "STREAK",
    title: "Gardien de la Flamme",
    description: "Maintiens ta serie d'etude aujourd'hui",
    targetValue: 1,
    difficulty: "easy",
    xpReward: 40,
    bonusXp: 15,
    encouragement: "Ne laisse pas ta flamme s'eteindre !",
    completionMessage: "Ta serie continue ! Continue comme ca !",
  },
];

// Subject-specific challenges
const SUBJECT_CHALLENGES: {
  subject: Subject;
  challenges: {
    type: DailyChallengeType;
    title: string;
    description: string;
    targetValue: number;
    difficulty: "easy" | "medium" | "hard";
    xpReward: number;
  }[];
}[] = [
  {
    subject: "MATHEMATIQUES",
    challenges: [
      {
        type: "QUIZ",
        title: "Defi Maths",
        description: "Complete 1 quiz de maths avec 70%+",
        targetValue: 1,
        difficulty: "medium",
        xpReward: 60,
      },
      {
        type: "PERFECT_QUIZ",
        title: "Calcul Mental",
        description: "Obtiens 100% a un quiz de maths",
        targetValue: 1,
        difficulty: "hard",
        xpReward: 120,
      },
    ],
  },
  {
    subject: "FRANCAIS",
    challenges: [
      {
        type: "LESSON",
        title: "Lecture du Jour",
        description: "Complete 1 lecon de francais",
        targetValue: 1,
        difficulty: "easy",
        xpReward: 35,
      },
      {
        type: "QUIZ",
        title: "Maitre des Mots",
        description: "Complete 2 quiz de francais",
        targetValue: 2,
        difficulty: "hard",
        xpReward: 100,
      },
    ],
  },
  {
    subject: "HISTOIRE_GEO",
    challenges: [
      {
        type: "LESSON",
        title: "Explorateur du Passe",
        description: "Complete 1 lecon d'histoire-geo",
        targetValue: 1,
        difficulty: "easy",
        xpReward: 35,
      },
    ],
  },
  {
    subject: "SCIENCES",
    challenges: [
      {
        type: "AI_QUESTIONS",
        title: "Scientifique Curieux",
        description: "Pose 3 questions sur les sciences a l'IA",
        targetValue: 3,
        difficulty: "medium",
        xpReward: 50,
      },
    ],
  },
  {
    subject: "ANGLAIS",
    challenges: [
      {
        type: "LESSON",
        title: "English Time",
        description: "Complete 1 lecon d'anglais",
        targetValue: 1,
        difficulty: "easy",
        xpReward: 35,
      },
    ],
  },
];

/**
 * Get today's date at midnight (Paris timezone)
 */
function getTodayStart(): Date {
  const now = new Date();
  // Use Paris timezone
  const parisTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );
  parisTime.setHours(0, 0, 0, 0);
  return parisTime;
}

/**
 * Get today's end (23:59:59)
 */
function getTodayEnd(): Date {
  const end = getTodayStart();
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Generate daily challenges for a child
 * Creates 3 challenges: 1 easy, 1 medium, 1 hard (or subject-specific)
 */
export async function generateDailyChallenges(childId: string): Promise<{
  generated: number;
  challenges: {
    id: string;
    type: DailyChallengeType;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
  }[];
}> {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // Check if challenges already exist for today
  const existingChallenges = await prisma.dailyChallenge.findMany({
    where: {
      childId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  if (existingChallenges.length >= 3) {
    return {
      generated: 0,
      challenges: existingChallenges.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        description: c.description,
        difficulty: c.difficulty,
        xpReward: c.xpReward,
      })),
    };
  }

  // Get child's grade level and recent activity for personalization
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: {
      gradeLevel: true,
      currentStreak: true,
      purchases: {
        where: { status: "COMPLETED" },
        include: { course: { select: { subject: true } } },
      },
    },
  });

  if (!child) {
    throw new Error("Child not found");
  }

  // Get subjects the child is learning
  const subjects = [...new Set(child.purchases.map((p) => p.course.subject))];

  // Select challenges
  const selectedChallenges: typeof CHALLENGE_TEMPLATES = [];
  const existingTypes = new Set(existingChallenges.map((c) => c.type));

  // Pick 1 easy challenge
  const easyChallenges = CHALLENGE_TEMPLATES.filter(
    (c) => c.difficulty === "easy" && !existingTypes.has(c.type),
  );
  if (easyChallenges.length > 0) {
    const randomEasy =
      easyChallenges[Math.floor(Math.random() * easyChallenges.length)];
    selectedChallenges.push(randomEasy);
    existingTypes.add(randomEasy.type);
  }

  // Pick 1 medium challenge (prefer subject-specific if available)
  let mediumPicked = false;
  if (subjects.length > 0 && Math.random() > 0.5) {
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const subjectChallenges = SUBJECT_CHALLENGES.find(
      (sc) => sc.subject === randomSubject,
    )?.challenges.filter(
      (c) => c.difficulty === "medium" && !existingTypes.has(c.type),
    );
    if (subjectChallenges && subjectChallenges.length > 0) {
      const challenge =
        subjectChallenges[Math.floor(Math.random() * subjectChallenges.length)];
      selectedChallenges.push({
        ...challenge,
        bonusXp: 20,
        encouragement: "Un defi specifique a ta matiere !",
        completionMessage: "Tu progresses dans cette matiere !",
      });
      existingTypes.add(challenge.type);
      mediumPicked = true;
    }
  }

  if (!mediumPicked) {
    const mediumChallenges = CHALLENGE_TEMPLATES.filter(
      (c) => c.difficulty === "medium" && !existingTypes.has(c.type),
    );
    if (mediumChallenges.length > 0) {
      const randomMedium =
        mediumChallenges[Math.floor(Math.random() * mediumChallenges.length)];
      selectedChallenges.push(randomMedium);
      existingTypes.add(randomMedium.type);
    }
  }

  // Pick 1 hard challenge
  const hardChallenges = CHALLENGE_TEMPLATES.filter(
    (c) => c.difficulty === "hard" && !existingTypes.has(c.type),
  );
  if (hardChallenges.length > 0) {
    const randomHard =
      hardChallenges[Math.floor(Math.random() * hardChallenges.length)];
    selectedChallenges.push(randomHard);
  }

  // Create challenges in database
  const createdChallenges = await Promise.all(
    selectedChallenges.map((challenge) =>
      prisma.dailyChallenge.create({
        data: {
          childId,
          date: todayStart,
          type: challenge.type,
          title: challenge.title,
          description: challenge.description,
          targetValue: challenge.targetValue,
          difficulty: challenge.difficulty,
          xpReward: challenge.xpReward,
          bonusXp: challenge.bonusXp,
          encouragement: challenge.encouragement,
          completionMessage: challenge.completionMessage,
          expiresAt: todayEnd,
        },
      }),
    ),
  );

  return {
    generated: createdChallenges.length,
    challenges: createdChallenges.map((c) => ({
      id: c.id,
      type: c.type,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      xpReward: c.xpReward,
    })),
  };
}

/**
 * Get today's challenges for a child
 */
export async function getTodayChallenges(childId: string) {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // First, ensure challenges exist
  await generateDailyChallenges(childId);

  // Then fetch them
  const challenges = await prisma.dailyChallenge.findMany({
    where: {
      childId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    orderBy: [
      { difficulty: "asc" }, // easy, hard, medium (alphabetically)
      { createdAt: "asc" },
    ],
  });

  // Calculate total potential XP
  const totalXpPotential = challenges.reduce(
    (sum, c) => sum + c.xpReward + c.bonusXp,
    0,
  );
  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const earnedXp = challenges
    .filter((c) => c.xpAwarded)
    .reduce((sum, c) => sum + c.xpReward, 0);

  return {
    challenges,
    stats: {
      total: challenges.length,
      completed: completedCount,
      totalXpPotential,
      earnedXp,
      allCompleted: completedCount === challenges.length,
    },
  };
}

/**
 * Update challenge progress based on action type
 */
export async function updateChallengeProgress(
  childId: string,
  actionType:
    | "lesson_completed"
    | "quiz_completed"
    | "quiz_perfect"
    | "ai_question"
    | "time_spent"
    | "review_completed",
  value: number = 1,
  quizScore?: number,
): Promise<{
  updated: string[];
  completed: {
    id: string;
    title: string;
    xpAwarded: number;
    completionMessage: string | null;
  }[];
}> {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // Map action type to challenge types
  const typeMapping: Record<string, DailyChallengeType[]> = {
    lesson_completed: ["LESSON", "STREAK"],
    quiz_completed: ["QUIZ"],
    quiz_perfect: ["PERFECT_QUIZ", "QUIZ"],
    ai_question: ["AI_QUESTIONS"],
    time_spent: ["TIME_SPENT"],
    review_completed: ["REVIEW"],
  };

  const relevantTypes = typeMapping[actionType] || [];

  // Get relevant challenges
  const challenges = await prisma.dailyChallenge.findMany({
    where: {
      childId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
      type: { in: relevantTypes },
      isCompleted: false,
    },
  });

  const updated: string[] = [];
  const completed: {
    id: string;
    title: string;
    xpAwarded: number;
    completionMessage: string | null;
  }[] = [];

  for (const challenge of challenges) {
    // For quiz challenges, check minimum score requirement
    if (challenge.type === "QUIZ" && quizScore !== undefined) {
      // Skip if quiz score is below 60% for easy, 70% for medium, 80% for hard
      const minScores = { easy: 60, medium: 70, hard: 80 };
      const minScore =
        minScores[challenge.difficulty as keyof typeof minScores] || 70;
      if (quizScore < minScore) {
        continue;
      }
    }

    // For perfect quiz, must be 100%
    if (challenge.type === "PERFECT_QUIZ" && quizScore !== 100) {
      continue;
    }

    const newValue = challenge.currentValue + value;
    const isNowCompleted = newValue >= challenge.targetValue;

    await prisma.dailyChallenge.update({
      where: { id: challenge.id },
      data: {
        currentValue: Math.min(newValue, challenge.targetValue),
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? new Date() : null,
      },
    });

    updated.push(challenge.id);

    if (isNowCompleted && !challenge.xpAwarded) {
      // Award XP
      const xpToAward = challenge.xpReward;
      await addXP(childId, xpToAward, `Daily Challenge: ${challenge.title}`);

      // Mark as awarded
      await prisma.dailyChallenge.update({
        where: { id: challenge.id },
        data: { xpAwarded: true },
      });

      completed.push({
        id: challenge.id,
        title: challenge.title,
        xpAwarded: xpToAward,
        completionMessage: challenge.completionMessage,
      });
    }
  }

  return { updated, completed };
}

/**
 * Get challenge history for a child
 */
export async function getChallengeHistory(
  childId: string,
  days: number = 7,
): Promise<{
  history: {
    date: string;
    challenges: {
      id: string;
      type: DailyChallengeType;
      title: string;
      isCompleted: boolean;
      xpReward: number;
    }[];
    totalXp: number;
    completionRate: number;
  }[];
  stats: {
    totalCompleted: number;
    totalXpEarned: number;
    averageCompletionRate: number;
    currentStreak: number;
  };
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const challenges = await prisma.dailyChallenge.findMany({
    where: {
      childId,
      date: { gte: startDate },
    },
    orderBy: { date: "desc" },
  });

  // Group by date
  const groupedByDate = new Map<
    string,
    {
      date: string;
      challenges: typeof challenges;
    }
  >();

  for (const challenge of challenges) {
    const dateKey = challenge.date.toISOString().split("T")[0];
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, {
        date: dateKey,
        challenges: [],
      });
    }
    groupedByDate.get(dateKey)!.challenges.push(challenge);
  }

  const history = Array.from(groupedByDate.values()).map((day) => {
    const completed = day.challenges.filter((c) => c.isCompleted);
    return {
      date: day.date,
      challenges: day.challenges.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        isCompleted: c.isCompleted,
        xpReward: c.xpReward,
      })),
      totalXp: completed.reduce((sum, c) => sum + c.xpReward, 0),
      completionRate:
        day.challenges.length > 0
          ? Math.round((completed.length / day.challenges.length) * 100)
          : 0,
    };
  });

  // Calculate overall stats
  const allCompleted = challenges.filter((c) => c.isCompleted);
  const totalXpEarned = allCompleted.reduce((sum, c) => sum + c.xpReward, 0);
  const averageCompletionRate =
    history.length > 0
      ? Math.round(
          history.reduce((sum, h) => sum + h.completionRate, 0) /
            history.length,
        )
      : 0;

  // Calculate current streak (consecutive days with all challenges completed)
  let currentStreak = 0;
  for (const day of history) {
    if (day.completionRate === 100) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    history,
    stats: {
      totalCompleted: allCompleted.length,
      totalXpEarned,
      averageCompletionRate,
      currentStreak,
    },
  };
}
