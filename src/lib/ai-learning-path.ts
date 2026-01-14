import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import type { LearningPath } from "@prisma/client";

interface ChildPerformance {
  childId: string;
  childName: string;
  gradeLevel: string;
  completedLessons: number;
  totalLessons: number;
  averageQuizScore: number | null;
  strongSubjects: string[];
  weakSubjects: string[];
  recentActivity: {
    lessonTitle: string;
    courseName: string;
    subject: string;
    quizScore: number | null;
    isCompleted: boolean;
  }[];
  currentStreak: number;
  studyTimeThisWeek: number; // minutes
}

interface LearningPathRecommendation {
  summary: string;
  focusAreas: {
    subject: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }[];
  weeklyGoals: string[];
  suggestedLessons: {
    lessonId: string;
    lessonTitle: string;
    courseTitle: string;
    reason: string;
  }[];
  motivationalMessage: string;
  estimatedTimePerDay: number; // minutes
}

// Gather comprehensive performance data for a child
export async function gatherChildPerformance(
  childId: string,
): Promise<ChildPerformance | null> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      progress: {
        include: {
          lesson: {
            include: {
              chapter: {
                include: { course: true },
              },
            },
          },
        },
        orderBy: { lastAccessedAt: "desc" },
      },
      purchases: {
        where: { status: "COMPLETED" },
        include: {
          course: {
            include: {
              chapters: {
                include: {
                  lessons: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!child) return null;

  // Calculate completed lessons
  const completedLessons = child.progress.filter((p) => p.isCompleted).length;

  // Calculate total lessons from purchased courses
  const totalLessons = child.purchases.reduce(
    (sum, p) =>
      sum + p.course.chapters.reduce((s, ch) => s + ch.lessons.length, 0),
    0,
  );

  // Calculate average quiz score
  const quizScores = child.progress
    .filter((p) => p.quizScore !== null)
    .map((p) => p.quizScore as number);
  const averageQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

  // Analyze subjects performance
  const subjectScores: Record<string, { total: number; count: number }> = {};
  child.progress.forEach((p) => {
    if (p.quizScore !== null) {
      const subject = p.lesson.chapter.course.subject;
      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, count: 0 };
      }
      subjectScores[subject].total += p.quizScore;
      subjectScores[subject].count += 1;
    }
  });

  const subjectAverages = Object.entries(subjectScores)
    .map(([subject, data]) => ({
      subject,
      average: data.total / data.count,
    }))
    .sort((a, b) => b.average - a.average);

  const strongSubjects = subjectAverages
    .filter((s) => s.average >= 75)
    .slice(0, 3)
    .map((s) => s.subject);

  const weakSubjects = subjectAverages
    .filter((s) => s.average < 60)
    .slice(0, 3)
    .map((s) => s.subject);

  // Recent activity (last 7 days)
  const recentActivity = child.progress
    .filter((p) => p.lastAccessedAt >= sevenDaysAgo)
    .slice(0, 10)
    .map((p) => ({
      lessonTitle: p.lesson.title,
      courseName: p.lesson.chapter.course.title,
      subject: p.lesson.chapter.course.subject,
      quizScore: p.quizScore,
      isCompleted: p.isCompleted,
    }));

  // Study time this week (estimate based on progress count * 15 min average)
  const studyTimeThisWeek =
    child.progress.filter((p) => p.lastAccessedAt >= sevenDaysAgo).length * 15;

  return {
    childId: child.id,
    childName: child.firstName,
    gradeLevel: child.gradeLevel,
    completedLessons,
    totalLessons,
    averageQuizScore,
    strongSubjects,
    weakSubjects,
    recentActivity,
    currentStreak: child.currentStreak,
    studyTimeThisWeek,
  };
}

// Generate AI-powered learning path recommendations
export async function generateLearningPath(
  childId: string,
): Promise<LearningPathRecommendation | null> {
  const performance = await gatherChildPerformance(childId);

  if (!performance) return null;

  // Get available lessons that haven't been completed
  const availableLessons = await prisma.lesson.findMany({
    where: {
      isPublished: true,
      chapter: {
        isPublished: true,
        course: {
          purchases: {
            some: {
              childId,
              status: "COMPLETED",
            },
          },
        },
      },
      NOT: {
        progress: {
          some: {
            childId,
            isCompleted: true,
          },
        },
      },
    },
    include: {
      chapter: {
        include: { course: true },
      },
    },
    take: 20,
  });

  // Build context for AI
  const contextPrompt = `Tu es un conseiller pedagogique expert pour un eleve de niveau ${formatGradeLevel(performance.gradeLevel)}.

PROFIL DE L'ELEVE:
- Prenom: ${performance.childName}
- Lecons completees: ${performance.completedLessons}/${performance.totalLessons}
- Score moyen aux quiz: ${performance.averageQuizScore !== null ? `${performance.averageQuizScore}%` : "Pas encore de quiz"}
- Serie actuelle: ${performance.currentStreak} jours
- Temps d'etude cette semaine: ${performance.studyTimeThisWeek} minutes

MATIERES FORTES: ${performance.strongSubjects.length > 0 ? performance.strongSubjects.join(", ") : "A determiner"}
MATIERES A AMELIORER: ${performance.weakSubjects.length > 0 ? performance.weakSubjects.join(", ") : "A determiner"}

ACTIVITE RECENTE:
${performance.recentActivity.map((a) => `- ${a.lessonTitle} (${a.courseName}): ${a.isCompleted ? "Termine" : "En cours"}${a.quizScore !== null ? `, Score: ${a.quizScore}%` : ""}`).join("\n")}

LECONS DISPONIBLES NON TERMINEES:
${availableLessons.map((l) => `- [${l.id}] ${l.title} (${l.chapter.course.title} - ${l.chapter.course.subject})`).join("\n")}

Genere un parcours d'apprentissage personnalise pour cette semaine. Reponds en JSON avec cette structure exacte:
{
  "summary": "Resume en 2-3 phrases du plan d'apprentissage",
  "focusAreas": [
    {"subject": "MATIERE", "reason": "Pourquoi se concentrer sur cette matiere", "priority": "high|medium|low"}
  ],
  "weeklyGoals": ["Objectif 1", "Objectif 2", "Objectif 3"],
  "suggestedLessons": [
    {"lessonId": "ID", "lessonTitle": "Titre", "courseTitle": "Cours", "reason": "Pourquoi cette lecon"}
  ],
  "motivationalMessage": "Message d'encouragement personnalise",
  "estimatedTimePerDay": 30
}

Important:
- Adapte le contenu au niveau scolaire
- Sois encourageant et positif
- Suggere 3-5 lecons maximum
- Les IDs de lecons doivent correspondre a ceux fournis
- Le temps estime doit etre realiste (15-45 min/jour)`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: contextPrompt }],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response");
      return null;
    }

    const recommendation = JSON.parse(
      jsonMatch[0],
    ) as LearningPathRecommendation;

    // Validate suggested lessons exist
    const validLessonIds = new Set(availableLessons.map((l) => l.id));
    recommendation.suggestedLessons = recommendation.suggestedLessons.filter(
      (l) => validLessonIds.has(l.lessonId),
    );

    return recommendation;
  } catch (error) {
    console.error("Error generating learning path:", error);
    return null;
  }
}

function formatGradeLevel(level: string): string {
  const levels: Record<string, string> = {
    CP: "CP",
    CE1: "CE1",
    CE2: "CE2",
    CM1: "CM1",
    CM2: "CM2",
    SIXIEME: "6eme",
    CINQUIEME: "5eme",
    QUATRIEME: "4eme",
    TROISIEME: "3eme",
    SECONDE: "Seconde",
    PREMIERE: "Premiere",
    TERMINALE: "Terminale",
  };
  return levels[level] || level;
}

// Store learning path in database
export async function storeLearningPath(
  childId: string,
  recommendation: LearningPathRecommendation,
  options?: {
    performanceSnapshot?: ChildPerformance;
    aiModel?: string;
    generationTimeMs?: number;
  },
): Promise<LearningPath> {
  // Deactivate any existing active learning paths for this child
  await prisma.learningPath.updateMany({
    where: {
      childId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Calculate validity period (1 week from now)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  // Create new learning path
  const learningPath = await prisma.learningPath.create({
    data: {
      childId,
      summary: recommendation.summary,
      focusAreas: recommendation.focusAreas,
      weeklyGoals: recommendation.weeklyGoals,
      suggestedLessons: recommendation.suggestedLessons,
      motivationalMessage: recommendation.motivationalMessage,
      estimatedTimePerDay: recommendation.estimatedTimePerDay,
      performanceSnapshot: options?.performanceSnapshot
        ? JSON.parse(JSON.stringify(options.performanceSnapshot))
        : null,
      aiModel: options?.aiModel ?? "claude-sonnet-4-20250514",
      generationTimeMs: options?.generationTimeMs,
      validUntil,
      isActive: true,
    },
  });

  return learningPath;
}

// Get the active learning path for a child
export async function getActiveLearningPath(
  childId: string,
): Promise<LearningPath | null> {
  const now = new Date();

  return prisma.learningPath.findFirst({
    where: {
      childId,
      isActive: true,
      validUntil: {
        gte: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Get learning path history for a child
export async function getLearningPathHistory(
  childId: string,
  limit = 10,
): Promise<LearningPath[]> {
  return prisma.learningPath.findMany({
    where: {
      childId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

// Update progress on a learning path when a suggested lesson is completed
export async function updateLearningPathProgress(
  childId: string,
  completedLessonId: string,
): Promise<void> {
  const activePath = await getActiveLearningPath(childId);

  if (!activePath) return;

  // Check if the completed lesson is in the suggested lessons
  const suggestedLessons = activePath.suggestedLessons as Array<{
    lessonId: string;
  }>;
  const isInSuggestedLessons = suggestedLessons.some(
    (l) => l.lessonId === completedLessonId,
  );

  if (isInSuggestedLessons) {
    await prisma.learningPath.update({
      where: { id: activePath.id },
      data: {
        lessonsCompleted: {
          increment: 1,
        },
      },
    });
  }
}

// Generate and store a learning path in one operation
export async function generateAndStoreLearningPath(
  childId: string,
): Promise<LearningPath | null> {
  const startTime = Date.now();

  // Gather performance data
  const performance = await gatherChildPerformance(childId);
  if (!performance) return null;

  // Generate the learning path
  const recommendation = await generateLearningPath(childId);
  if (!recommendation) return null;

  const generationTimeMs = Date.now() - startTime;

  // Store in database
  return storeLearningPath(childId, recommendation, {
    performanceSnapshot: performance,
    aiModel: "claude-sonnet-4-20250514",
    generationTimeMs,
  });
}
