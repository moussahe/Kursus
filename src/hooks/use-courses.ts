"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/lib/validations/course";

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  gradeLevel: string;
  subject: string;
  isPublished: boolean;
  totalStudents: number;
  totalLessons: number;
  totalDuration: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CourseFilters {
  niveau?: string;
  matiere?: string;
  prix?: string;
  tri?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// Fetch published courses (public)
export function usePublicCourses(filters: CourseFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return useQuery<PaginatedResponse<Course>>({
    queryKey: ["courses", "public", filters],
    queryFn: async () => {
      const res = await fetch(`/api/courses?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des cours");
      return res.json();
    },
  });
}

// Fetch teacher's own courses
export function useTeacherCourses(filters: CourseFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return useQuery<PaginatedResponse<Course>>({
    queryKey: ["courses", "teacher", filters],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/courses?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des cours");
      return res.json();
    },
  });
}

// Fetch single course by ID
export function useCourse(courseId: string) {
  return useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Cours non trouve");
      return res.json();
    },
    enabled: !!courseId,
  });
}

// Create course mutation
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseInput) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la creation");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher"] });
    },
  });
}

// Update course mutation
export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCourseInput) => {
      const res = await fetch(`/api/courses/${courseId}`, {
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
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher"] });
    },
  });
}

// Delete course mutation
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher"] });
    },
  });
}

// Toggle publish status
export function useTogglePublish(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isPublished: boolean) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la publication");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher"] });
    },
  });
}
