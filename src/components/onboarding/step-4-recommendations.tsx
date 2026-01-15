"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  Check,
  Loader2,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnboardingStep4Props } from "@/types/onboarding";
import {
  SUBJECT_LABELS,
  GRADE_LEVEL_LABELS,
  GOAL_OPTIONS,
} from "@/types/onboarding";

interface RecommendedCourse {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  gradeLevel: string;
  price: number;
  imageUrl: string | null;
  author: { name: string };
  totalStudents: number;
  averageRating: number;
  totalLessons: number;
}

export function OnboardingStep4({
  data,
  onComplete,
  onBack,
  isLoading: isSubmitting,
}: OnboardingStep4Props) {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const params = new URLSearchParams({
          gradeLevel: data.child.gradeLevel || "",
          subjects: data.subjects.join(","),
          limit: "3",
        });

        const response = await fetch(`/api/courses/recommendations?${params}`);
        if (response.ok) {
          const result = await response.json();
          setCourses(result.courses || []);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    }

    fetchRecommendations();
  }, [data.child.gradeLevel, data.subjects]);

  const selectedGoalLabels = data.goals
    .map((goalId) => GOAL_OPTIONS.find((g) => g.id === goalId)?.label)
    .filter(Boolean);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Sparkles className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Parfait ! Voici notre plan
          </h2>
          <p className="text-sm text-gray-600">
            Base sur vos réponses, voici ce que nous recommandons
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <h3 className="mb-3 font-semibold text-gray-900">
          Recapitulatif pour {data.child.firstName}
        </h3>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>
              <strong>Niveau:</strong>{" "}
              {data.child.gradeLevel
                ? GRADE_LEVEL_LABELS[data.child.gradeLevel]
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>
              <strong>Matieres:</strong>{" "}
              {data.subjects.map((s) => SUBJECT_LABELS[s]).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>
              <strong>Objectifs:</strong> {selectedGoalLabels.join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>
              <strong>Temps:</strong> {data.weeklyTime}h/semaine
            </span>
          </div>
        </div>
      </div>

      {/* Course Recommendations */}
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Cours recommandes
        </h3>

        {isLoadingCourses ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">
              Recherche des meilleurs cours...
            </span>
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {course.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      📚
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {course.title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {course.subtitle}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.totalStudents}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.totalLessons} leçons
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    {course.price === 0
                      ? "Gratuit"
                      : `${(course.price / 100).toFixed(0)} EUR`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-6 text-center">
            <p className="text-gray-600">
              Nous cherchons les meilleurs cours pour {data.child.firstName}.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Vous les retrouverez dans votre tableau de bord.
            </p>
          </div>
        )}
      </div>

      {/* What's Next */}
      <div className="mb-6 rounded-xl bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">Prochaines etapes</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
              1
            </span>
            Explorez les cours recommandes
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
              2
            </span>
            {data.child.firstName} commence a apprendre
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
              3
            </span>
            Suivez sa progression depuis votre tableau de bord
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-12 gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={onComplete}
          className="h-12 gap-2 bg-emerald-600 px-8 hover:bg-emerald-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creation du profil...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              C&apos;est parti !
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
