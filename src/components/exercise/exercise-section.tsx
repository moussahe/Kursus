"use client";

import { useState } from "react";
import { Dumbbell, Sparkles } from "lucide-react";
import { ExercisePlayer } from "./exercise-player";

interface ExerciseSectionProps {
  lessonId: string;
  lessonTitle: string;
  subject: string;
  childId: string;
}

export function ExerciseSection({
  lessonId,
  lessonTitle,
  subject,
  childId,
}: ExerciseSectionProps) {
  const [showExercises, setShowExercises] = useState(false);

  if (!showExercises) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Exercices Generatifs IA
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Entraine-toi avec des exercices varies generes par l&apos;IA
          </p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3 w-3" />
            Illimite
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowExercises(true)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              Commencer les exercices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back option */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowExercises(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          <Dumbbell className="h-3 w-3" />
          Exercices IA
        </div>
      </div>

      {/* Exercise Player */}
      <ExercisePlayer
        lessonId={lessonId}
        childId={childId}
        lessonTitle={lessonTitle}
        subject={subject}
        onComplete={() => {
          // Could track completion or show a success message
        }}
      />
    </div>
  );
}
