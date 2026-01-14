"use client";

import { useState } from "react";
import { BookOpen, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnboardingStepProps, Subject } from "@/types/onboarding";
import {
  SUBJECT_LABELS,
  SUBJECTS_BY_GRADE,
  getGradeCategory,
} from "@/types/onboarding";

const SUBJECT_ICONS: Record<Subject, string> = {
  MATHEMATIQUES: "➕",
  FRANCAIS: "📝",
  HISTOIRE_GEO: "🌍",
  SCIENCES: "🔬",
  ANGLAIS: "🇬🇧",
  PHYSIQUE_CHIMIE: "⚗️",
  SVT: "🌱",
  PHILOSOPHIE: "💭",
  ESPAGNOL: "🇪🇸",
  ALLEMAND: "🇩🇪",
  SES: "📊",
  NSI: "💻",
};

export function OnboardingStep2({
  data,
  updateData,
  onNext,
  onBack,
}: OnboardingStepProps) {
  const [error, setError] = useState<string | null>(null);

  const gradeCategory = getGradeCategory(data.child.gradeLevel);
  const availableSubjects =
    SUBJECTS_BY_GRADE[gradeCategory] || SUBJECTS_BY_GRADE.PRIMAIRE;

  const toggleSubject = (subject: Subject) => {
    const isSelected = data.subjects.includes(subject);
    const newSubjects = isSelected
      ? data.subjects.filter((s) => s !== subject)
      : [...data.subjects, subject];

    updateData({ subjects: newSubjects });
    if (error) setError(null);
  };

  const handleNext = () => {
    if (data.subjects.length === 0) {
      setError("Selectionnez au moins une matiere");
      return;
    }
    onNext();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Quelles matieres pour {data.child.firstName} ?
          </h2>
          <p className="text-sm text-gray-600">
            Selectionnez les matieres prioritaires (plusieurs choix possibles)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Subject Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {availableSubjects.map((subject) => {
          const isSelected = data.subjects.includes(subject);
          return (
            <button
              key={subject}
              type="button"
              onClick={() => toggleSubject(subject)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-2xl">{SUBJECT_ICONS[subject]}</span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-emerald-700" : "text-gray-700"
                }`}
              >
                {SUBJECT_LABELS[subject]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection Count */}
      <p className="mt-4 text-center text-sm text-gray-500">
        {data.subjects.length} matiere{data.subjects.length !== 1 ? "s" : ""}{" "}
        selectionnee
        {data.subjects.length !== 1 ? "s" : ""}
      </p>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack} className="h-12 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={handleNext}
          className="h-12 gap-2 bg-emerald-600 px-6 hover:bg-emerald-700"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
