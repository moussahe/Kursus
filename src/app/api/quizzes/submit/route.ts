import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { triggerQuizCompleted, triggerBadgeEarned } from "@/lib/push-triggers";
import {
  awardXP,
  XP_REWARDS,
  checkAndAwardBadges,
  updateStreak,
} from "@/lib/gamification";

// Schema for quiz submission
const submitQuizSchema = z.object({
  quizId: z.string().cuid(),
  lessonId: z.string().cuid(),
  childId: z.string().cuid(),
  answers: z.record(z.string(), z.string()), // questionId -> optionId
  timeSpent: z.number().min(0),
  startedAt: z.string().datetime().optional(), // ISO timestamp when quiz started
});

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // 2. Validation
    const body = await req.json();
    const validated = submitQuizSchema.parse(body);

    // 3. Verify the child belongs to the parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // 4. Get the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: validated.quizId },
      include: {
        questions: true,
        lesson: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouve" }, { status: 404 });
    }

    // 5. Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const answersDetail = quiz.questions.map((question) => {
      totalPoints += question.points;
      const selectedOptionId = validated.answers[question.id];
      const options = question.options as unknown as QuestionOption[];
      const correctOption = options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        selectedOptionId,
        isCorrect,
      };
    });

    const percentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    // 6. Generate AI feedback
    let aiExplanation: string;
    if (percentage >= 90) {
      aiExplanation = `Excellent travail ! Tu maitrises bien ce sujet avec ${correctCount}/${quiz.questions.length} bonnes réponses. Continue comme ca !`;
    } else if (percentage >= 70) {
      aiExplanation = `Tres bien ! Tu as obtenu ${correctCount}/${quiz.questions.length} bonnes réponses. Revois les questions que tu as manquees pour renforcer ta compréhension.`;
    } else if (percentage >= 50) {
      aiExplanation = `Pas mal ! Tu progresses avec ${correctCount}/${quiz.questions.length} bonnes réponses. Je te conseille de relire la lecon et de reessayer le quiz.`;
    } else {
      aiExplanation = `Ne te decourage pas ! Tu as obtenu ${correctCount}/${quiz.questions.length} bonnes réponses. Prends le temps de bien relire la lecon avant de reessayer.`;
    }

    // 7. Calculate XP based on performance
    let xpEarned = 0;
    const isPerfect = percentage === 100;

    if (isPerfect) {
      xpEarned = XP_REWARDS.QUIZ_PERFECT;
    } else if (passed) {
      xpEarned = XP_REWARDS.QUIZ_PASSED;
    } else {
      xpEarned = XP_REWARDS.QUIZ_COMPLETE;
    }

    // 8. Save progress and quiz attempt in a transaction
    const startedAt = validated.startedAt
      ? new Date(validated.startedAt)
      : new Date(Date.now() - validated.timeSpent * 1000);

    await prisma.$transaction([
      // Update progress
      prisma.progress.upsert({
        where: {
          childId_lessonId: {
            childId: validated.childId,
            lessonId: validated.lessonId,
          },
        },
        create: {
          childId: validated.childId,
          lessonId: validated.lessonId,
          quizScore: percentage,
          isCompleted: passed,
          timeSpent: validated.timeSpent,
        },
        update: {
          quizScore: percentage,
          isCompleted: passed,
          timeSpent: {
            increment: validated.timeSpent,
          },
          lastAccessedAt: new Date(),
        },
      }),
      // Create quiz attempt record for history
      prisma.quizAttempt.create({
        data: {
          childId: validated.childId,
          quizId: validated.quizId,
          lessonId: validated.lessonId,
          score: earnedPoints,
          totalPoints,
          percentage,
          passed,
          correctCount,
          totalQuestions: quiz.questions.length,
          answers: answersDetail,
          timeSpent: validated.timeSpent,
          startedAt,
          aiFeedback: aiExplanation,
        },
      }),
    ]);

    // 9. Award XP and update streak
    await awardXP(validated.childId, xpEarned, "Quiz completed");
    await updateStreak(validated.childId);

    // 10. Check for new badges
    const newBadges = await checkAndAwardBadges(validated.childId);

    // 11. Send push notifications (async, don't block response)
    triggerQuizCompleted(
      validated.childId,
      quiz.lesson.title,
      percentage,
    ).catch((err) => console.error("Push notification error:", err));

    // Notify parent about new badges
    for (const badge of newBadges) {
      triggerBadgeEarned(validated.childId, badge.name).catch((err) =>
        console.error("Badge notification error:", err),
      );
    }

    // 12. Create alert for parent if score is low
    if (percentage < 50) {
      await prisma.alert.create({
        data: {
          parentId: session.user.id,
          childId: validated.childId,
          type: "LOW_QUIZ_SCORE",
          priority: "MEDIUM",
          title: `Score faible au quiz`,
          message: `${child.firstName} a obtenu ${percentage}% au quiz de la lecon "${quiz.lesson.title}". Un peu de revision pourrait aider!`,
          metadata: {
            lessonId: validated.lessonId,
            lessonTitle: quiz.lesson.title,
            score: percentage,
            courseTitle: quiz.lesson.chapter.course.title,
          },
          actionUrl: `/parent/children/${validated.childId}`,
        },
      });
    }

    // 13. Return result
    return NextResponse.json({
      success: true,
      result: {
        score: earnedPoints,
        totalPoints,
        percentage,
        passed,
        isPerfect,
        correctCount,
        totalQuestions: quiz.questions.length,
        answers: answersDetail,
        xpEarned,
        newBadges,
      },
      aiExplanation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
