"use client";

import { useState, useCallback, useMemo } from "react";
import type { QuizQuestion, AdaptiveQuizState } from "@/types/quiz";

interface UseAdaptiveQuizOptions {
  questions: QuizQuestion[];
  initialDifficulty?: "easy" | "medium" | "hard";
  streakThreshold?: number; // Number of consecutive correct/wrong to change difficulty
}

interface UseAdaptiveQuizReturn {
  adaptiveState: AdaptiveQuizState;
  currentDifficulty: "easy" | "medium" | "hard";
  suggestedNextDifficulty: "easy" | "medium" | "hard";
  recordAnswer: (
    isCorrect: boolean,
    difficulty?: "easy" | "medium" | "hard",
  ) => void;
  reset: () => void;
  stats: {
    totalAnswered: number;
    correctCount: number;
    accuracy: number;
    difficultyBreakdown: Record<
      "easy" | "medium" | "hard",
      { total: number; correct: number }
    >;
    currentStreak: number;
    bestStreak: number;
    improvementSuggestion: string;
  };
}

export function useAdaptiveQuiz({
  initialDifficulty = "medium",
  streakThreshold = 2,
}: UseAdaptiveQuizOptions): UseAdaptiveQuizReturn {
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveQuizState>({
    currentDifficulty: initialDifficulty,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    questionsAnswered: 0,
    performanceHistory: [],
  });

  const calculateNextDifficulty = useCallback(
    (state: AdaptiveQuizState): "easy" | "medium" | "hard" => {
      // Move up after streak of correct answers
      if (state.consecutiveCorrect >= streakThreshold) {
        if (state.currentDifficulty === "easy") return "medium";
        if (state.currentDifficulty === "medium") return "hard";
      }

      // Move down after streak of wrong answers
      if (state.consecutiveWrong >= streakThreshold) {
        if (state.currentDifficulty === "hard") return "medium";
        if (state.currentDifficulty === "medium") return "easy";
      }

      return state.currentDifficulty;
    },
    [streakThreshold],
  );

  const recordAnswer = useCallback(
    (isCorrect: boolean, difficulty?: "easy" | "medium" | "hard") => {
      setAdaptiveState((prev) => {
        const newState: AdaptiveQuizState = {
          ...prev,
          questionsAnswered: prev.questionsAnswered + 1,
          consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0,
          consecutiveWrong: isCorrect ? 0 : prev.consecutiveWrong + 1,
          performanceHistory: [
            ...prev.performanceHistory,
            {
              difficulty: difficulty || prev.currentDifficulty,
              correct: isCorrect,
            },
          ],
        };

        // Update difficulty based on performance
        newState.currentDifficulty = calculateNextDifficulty(newState);

        return newState;
      });
    },
    [calculateNextDifficulty],
  );

  const reset = useCallback(() => {
    setAdaptiveState({
      currentDifficulty: initialDifficulty,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      questionsAnswered: 0,
      performanceHistory: [],
    });
  }, [initialDifficulty]);

  const stats = useMemo(() => {
    const { performanceHistory } = adaptiveState;
    const totalAnswered = performanceHistory.length;
    const correctCount = performanceHistory.filter((h) => h.correct).length;
    const accuracy =
      totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    // Difficulty breakdown
    const difficultyBreakdown: Record<
      "easy" | "medium" | "hard",
      { total: number; correct: number }
    > = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    };

    performanceHistory.forEach((h) => {
      difficultyBreakdown[h.difficulty].total++;
      if (h.correct) {
        difficultyBreakdown[h.difficulty].correct++;
      }
    });

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = performanceHistory.length - 1; i >= 0; i--) {
      if (performanceHistory[i].correct) {
        if (i === performanceHistory.length - 1) {
          currentStreak++;
        }
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        if (i === performanceHistory.length - 1) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    // Improvement suggestion
    let improvementSuggestion = "";
    if (accuracy >= 90) {
      improvementSuggestion = "Excellent ! Tu maitrises ce sujet.";
    } else if (accuracy >= 70) {
      improvementSuggestion =
        "Tres bien ! Continue a t'entrainer pour atteindre l'excellence.";
    } else if (accuracy >= 50) {
      improvementSuggestion =
        "Pas mal ! Revois les concepts ou tu as eu des difficultes.";
    } else {
      improvementSuggestion =
        "Continue a t'entrainer. N'hesite pas a relire la lecon.";
    }

    // Add specific feedback based on difficulty breakdown
    const easyAccuracy =
      difficultyBreakdown.easy.total > 0
        ? (difficultyBreakdown.easy.correct / difficultyBreakdown.easy.total) *
          100
        : 100;
    const mediumAccuracy =
      difficultyBreakdown.medium.total > 0
        ? (difficultyBreakdown.medium.correct /
            difficultyBreakdown.medium.total) *
          100
        : 100;

    if (easyAccuracy < 70 && difficultyBreakdown.easy.total > 0) {
      improvementSuggestion += " Concentre-toi d'abord sur les bases.";
    } else if (mediumAccuracy < 50 && difficultyBreakdown.medium.total > 2) {
      improvementSuggestion +=
        " Les questions intermediaires necessitent plus de pratique.";
    }

    return {
      totalAnswered,
      correctCount,
      accuracy,
      difficultyBreakdown,
      currentStreak,
      bestStreak,
      improvementSuggestion,
    };
  }, [adaptiveState]);

  const suggestedNextDifficulty = useMemo(
    () => calculateNextDifficulty(adaptiveState),
    [adaptiveState, calculateNextDifficulty],
  );

  return {
    adaptiveState,
    currentDifficulty: adaptiveState.currentDifficulty,
    suggestedNextDifficulty,
    recordAnswer,
    reset,
    stats,
  };
}
