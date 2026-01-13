"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  addXP,
  updateStreak,
  checkAndAwardBadges,
  XP_REWARDS,
} from "@/lib/gamification";

export async function markLessonComplete(lessonId: string, childId: string) {
  try {
    // Check if progress exists
    const existingProgress = await prisma.progress.findUnique({
      where: { childId_lessonId: { childId, lessonId } },
    });

    if (existingProgress?.isCompleted) {
      return { success: true, xpEarned: 0 };
    }

    // Check if this is the first lesson ever
    const totalCompletedLessons = await prisma.progress.count({
      where: { childId, isCompleted: true },
    });

    let totalXpEarned = 0;

    // Create or update progress
    await prisma.progress.upsert({
      where: { childId_lessonId: { childId, lessonId } },
      update: {
        isCompleted: true,
        lastAccessedAt: new Date(),
      },
      create: {
        childId,
        lessonId,
        isCompleted: true,
        lastAccessedAt: new Date(),
      },
    });

    // Award XP for lesson completion
    await addXP(childId, XP_REWARDS.LESSON_COMPLETED, "Lecon terminee");
    totalXpEarned += XP_REWARDS.LESSON_COMPLETED;

    // Award bonus XP for first lesson
    if (totalCompletedLessons === 0) {
      await addXP(childId, XP_REWARDS.FIRST_LESSON, "Premiere lecon terminee");
      totalXpEarned += XP_REWARDS.FIRST_LESSON;
    }

    // Update streak
    const streakResult = await updateStreak(childId);
    if (streakResult.streakUpdated && streakResult.currentStreak > 1) {
      await addXP(childId, XP_REWARDS.DAILY_STREAK, "Serie journaliere");
      totalXpEarned += XP_REWARDS.DAILY_STREAK;
    }

    // Check if course is completed
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              include: {
                chapters: {
                  where: { isPublished: true },
                  include: {
                    lessons: { where: { isPublished: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (lesson) {
      const totalCourseLessons = lesson.chapter.course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0,
      );
      const completedCourseLessons = await prisma.progress.count({
        where: {
          childId,
          isCompleted: true,
          lesson: { chapter: { courseId: lesson.chapter.courseId } },
        },
      });

      if (completedCourseLessons === totalCourseLessons) {
        await addXP(childId, XP_REWARDS.COURSE_COMPLETED, "Cours termine");
        totalXpEarned += XP_REWARDS.COURSE_COMPLETED;
      }
    }

    // Check for new badges
    await checkAndAwardBadges(childId);

    revalidatePath("/student");
    revalidatePath(`/student/courses`);

    return { success: true, xpEarned: totalXpEarned };
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    return {
      success: false,
      xpEarned: 0,
      error: "Failed to mark lesson complete",
    };
  }
}

export async function submitQuizScore(
  lessonId: string,
  childId: string,
  score: number,
) {
  try {
    // Get existing progress
    const existingProgress = await prisma.progress.findUnique({
      where: { childId_lessonId: { childId, lessonId } },
    });

    const previousScore = existingProgress?.quizScore;
    const isNewHighScore = !previousScore || score > previousScore;

    // Update progress with quiz score
    await prisma.progress.upsert({
      where: { childId_lessonId: { childId, lessonId } },
      update: {
        quizScore: isNewHighScore ? score : previousScore,
        isCompleted: true,
        lastAccessedAt: new Date(),
      },
      create: {
        childId,
        lessonId,
        quizScore: score,
        isCompleted: true,
        lastAccessedAt: new Date(),
      },
    });

    let totalXpEarned = 0;

    // Only award XP if it's a new high score or first attempt
    if (isNewHighScore) {
      // Award XP based on score
      if (score === 100) {
        await addXP(childId, XP_REWARDS.QUIZ_PERFECT, "Quiz parfait");
        totalXpEarned += XP_REWARDS.QUIZ_PERFECT;
      } else if (score >= 70) {
        await addXP(childId, XP_REWARDS.QUIZ_PASSED, "Quiz reussi");
        totalXpEarned += XP_REWARDS.QUIZ_PASSED;
      }
    }

    // Update streak
    const streakResult = await updateStreak(childId);
    if (streakResult.streakUpdated && streakResult.currentStreak > 1) {
      await addXP(childId, XP_REWARDS.DAILY_STREAK, "Serie journaliere");
      totalXpEarned += XP_REWARDS.DAILY_STREAK;
    }

    // Check for new badges
    await checkAndAwardBadges(childId);

    revalidatePath("/student");
    revalidatePath(`/student/courses`);

    return { success: true, xpEarned: totalXpEarned, isNewHighScore };
  } catch (error) {
    console.error("Error submitting quiz score:", error);
    return {
      success: false,
      xpEarned: 0,
      error: "Failed to submit quiz score",
    };
  }
}

export async function recordAIInteraction(childId: string) {
  try {
    await addXP(childId, XP_REWARDS.AI_CHAT_QUESTION, "Question posee a l'IA");
    await updateStreak(childId);
    revalidatePath("/student");
    return { success: true };
  } catch (error) {
    console.error("Error recording AI interaction:", error);
    return { success: false };
  }
}
