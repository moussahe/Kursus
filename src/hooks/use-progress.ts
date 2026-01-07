"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LessonProgress {
  id: string;
  lessonId: string;
  childId: string;
  isCompleted: boolean;
  completedAt?: string | null;
  watchTime?: number;
}

interface CourseProgress {
  courseId: string;
  childId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  lastLessonId?: string;
  lastAccessedAt?: string;
}

// Fetch progress for a course
export function useCourseProgress(courseId: string, childId: string) {
  return useQuery<CourseProgress>({
    queryKey: ["progress", courseId, childId],
    queryFn: async () => {
      const res = await fetch(
        `/api/progress?courseId=${courseId}&childId=${childId}`,
      );
      if (!res.ok)
        throw new Error("Erreur lors du chargement de la progression");
      return res.json();
    },
    enabled: !!courseId && !!childId,
  });
}

// Fetch lesson progress
export function useLessonProgress(lessonId: string, childId: string) {
  return useQuery<LessonProgress | null>({
    queryKey: ["lesson-progress", lessonId, childId],
    queryFn: async () => {
      const res = await fetch(
        `/api/progress/lesson?lessonId=${lessonId}&childId=${childId}`,
      );
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Erreur lors du chargement");
      }
      return res.json();
    },
    enabled: !!lessonId && !!childId,
  });
}

// Mark lesson as completed
export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      childId,
      isCompleted = true,
    }: {
      lessonId: string;
      childId: string;
      isCompleted?: boolean;
    }) => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, childId, isCompleted }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise a jour");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-progress", variables.lessonId, variables.childId],
      });
      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["child", variables.childId],
      });
    },
  });
}

// Update watch time
export function useUpdateWatchTime() {
  return useMutation({
    mutationFn: async ({
      lessonId,
      childId,
      watchTime,
    }: {
      lessonId: string;
      childId: string;
      watchTime: number;
    }) => {
      const res = await fetch("/api/progress/watch-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, childId, watchTime }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur");
      }
      return res.json();
    },
  });
}
