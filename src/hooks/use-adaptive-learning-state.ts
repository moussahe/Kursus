"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PersistentAdaptiveState,
  AdaptiveLearningContext,
} from "@/types/quiz";

interface AdaptiveStateResponse {
  exists: boolean;
  state: PersistentAdaptiveState;
}

interface UpdateStateResponse {
  success: boolean;
  state: {
    currentDifficulty: string;
    masteryLevel: number;
    totalSessions: number;
    currentStreak: number;
    bestStreak: number;
    accuracy: number;
  };
}

interface SessionAnswer {
  difficulty: "easy" | "medium" | "hard";
  correct: boolean;
}

interface UpdateStateParams {
  context: AdaptiveLearningContext;
  answers: SessionAnswer[];
  finalDifficulty: "easy" | "medium" | "hard";
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

// Fetch adaptive learning state
async function fetchAdaptiveState(
  context: AdaptiveLearningContext,
): Promise<AdaptiveStateResponse> {
  const params = new URLSearchParams({
    childId: context.childId,
    subject: context.subject,
    gradeLevel: context.gradeLevel,
  });

  const response = await fetch(`/api/adaptive-learning?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch adaptive state");
  }

  return response.json();
}

// Update adaptive learning state
async function updateAdaptiveState(
  params: UpdateStateParams,
): Promise<UpdateStateResponse> {
  const response = await fetch("/api/adaptive-learning", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      childId: params.context.childId,
      subject: params.context.subject,
      gradeLevel: params.context.gradeLevel,
      answers: params.answers,
      finalDifficulty: params.finalDifficulty,
      consecutiveCorrect: params.consecutiveCorrect,
      consecutiveWrong: params.consecutiveWrong,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update adaptive state");
  }

  return response.json();
}

// Hook to fetch and manage adaptive learning state
export function useAdaptiveLearningState(
  context: AdaptiveLearningContext | null,
) {
  const queryClient = useQueryClient();

  const queryKey = context
    ? [
        "adaptive-learning-state",
        context.childId,
        context.subject,
        context.gradeLevel,
      ]
    : null;

  // Query for fetching state
  const query = useQuery({
    queryKey: queryKey!,
    queryFn: () => fetchAdaptiveState(context!),
    enabled: !!context,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });

  // Mutation for updating state
  const mutation = useMutation({
    mutationFn: updateAdaptiveState,
    onSuccess: () => {
      // Invalidate and refetch
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  // Helper function to save session results
  const saveSessionResults = async (
    answers: SessionAnswer[],
    finalDifficulty: "easy" | "medium" | "hard",
    consecutiveCorrect: number,
    consecutiveWrong: number,
  ) => {
    if (!context) return null;

    return mutation.mutateAsync({
      context,
      answers,
      finalDifficulty,
      consecutiveCorrect,
      consecutiveWrong,
    });
  };

  return {
    // State data
    state: query.data?.state ?? null,
    exists: query.data?.exists ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Save function
    saveSessionResults,
    isSaving: mutation.isPending,
    saveError: mutation.error,

    // Computed values for easy access
    initialDifficulty: (query.data?.state?.currentDifficulty ?? "medium") as
      | "easy"
      | "medium"
      | "hard",
    masteryLevel: query.data?.state?.masteryLevel ?? 0,
    totalSessions: query.data?.state?.totalSessions ?? 0,
    bestStreak: query.data?.state?.bestStreak ?? 0,
    accuracy:
      query.data?.state?.totalQuestionsAnswered &&
      query.data.state.totalQuestionsAnswered > 0
        ? Math.round(
            (query.data.state.totalCorrect /
              query.data.state.totalQuestionsAnswered) *
              100,
          )
        : 0,
  };
}

// Hook to get mastery summary for a child across all subjects
export function useChildMasterySummary(childId: string | null) {
  return useQuery({
    queryKey: ["child-mastery-summary", childId],
    queryFn: async () => {
      if (!childId) return null;

      const response = await fetch(
        `/api/adaptive-learning/summary?childId=${childId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch mastery summary");
      }

      return response.json();
    },
    enabled: !!childId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
