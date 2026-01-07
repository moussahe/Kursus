"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateChildInput,
  UpdateChildInput,
} from "@/lib/validations/child";

interface Child {
  id: string;
  firstName: string;
  lastName?: string | null;
  avatarUrl?: string | null;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    progresses: number;
  };
}

interface ChildWithProgress extends Child {
  progresses: Array<{
    id: string;
    lessonId: string;
    isCompleted: boolean;
    completedAt?: string | null;
  }>;
  courseProgress?: Array<{
    courseId: string;
    courseTitle: string;
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  }>;
}

// Fetch parent's children
export function useChildren() {
  return useQuery<Child[]>({
    queryKey: ["children"],
    queryFn: async () => {
      const res = await fetch("/api/children");
      if (!res.ok) throw new Error("Erreur lors du chargement des enfants");
      return res.json();
    },
  });
}

// Fetch single child with progress
export function useChild(childId: string) {
  return useQuery<ChildWithProgress>({
    queryKey: ["child", childId],
    queryFn: async () => {
      const res = await fetch(`/api/children/${childId}`);
      if (!res.ok) throw new Error("Enfant non trouve");
      return res.json();
    },
    enabled: !!childId,
  });
}

// Create child mutation
export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChildInput) => {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de l'ajout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

// Update child mutation
export function useUpdateChild(childId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateChildInput) => {
      const res = await fetch(`/api/children/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise a jour");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

// Delete child mutation
export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childId: string) => {
      const res = await fetch(`/api/children/${childId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}
