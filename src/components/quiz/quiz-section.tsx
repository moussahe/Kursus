"use client";

import { useState } from "react";
import { Brain, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LessonQuiz } from "@/components/student/lesson-quiz";
import { AdaptiveQuizPlayer } from "./adaptive-quiz-player";

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string | null;
  points: number;
}

interface QuizSectionProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    passingScore: number;
    questions: QuizQuestion[];
  };
  lessonId: string;
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  childId: string;
  previousScore: number | null;
}

type QuizMode = "classic" | "adaptive";

export function QuizSection({
  quiz,
  lessonId,
  lessonTitle,
  subject,
  gradeLevel,
  childId,
  previousScore,
}: QuizSectionProps) {
  const [mode, setMode] = useState<QuizMode>("classic");
  const [showModeSelector, setShowModeSelector] = useState(true);

  // Mode selector
  if (showModeSelector) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
          Choisis ton type de quiz
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Classic Quiz */}
          <button
            onClick={() => {
              setMode("classic");
              setShowModeSelector(false);
            }}
            className={cn(
              "flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all hover:border-blue-300 hover:bg-blue-50",
              mode === "classic"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200",
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
              <ListChecks className="h-7 w-7 text-blue-600" />
            </div>
            <h4 className="mt-4 font-semibold text-gray-900">Quiz Classique</h4>
            <p className="mt-2 text-sm text-gray-500">
              {quiz.questions.length} questions fixes basees sur la lecon
            </p>
            {previousScore !== null && (
              <div className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Score precedent: {previousScore}%
              </div>
            )}
          </button>

          {/* Adaptive Quiz */}
          <button
            onClick={() => {
              setMode("adaptive");
              setShowModeSelector(false);
            }}
            className={cn(
              "flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all hover:border-violet-300 hover:bg-violet-50",
              mode === "adaptive"
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200",
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h4 className="mt-4 font-semibold text-gray-900">
              Quiz Adaptatif IA
            </h4>
            <p className="mt-2 text-sm text-gray-500">
              L&apos;IA genere des questions adaptees a ton niveau
            </p>
            <div className="mt-3 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
              Nouveau!
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Show selected quiz mode
  return (
    <div className="space-y-4">
      {/* Mode indicator with back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModeSelector(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Changer de mode
        </Button>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
            mode === "adaptive"
              ? "bg-violet-100 text-violet-700"
              : "bg-blue-100 text-blue-700",
          )}
        >
          {mode === "adaptive" ? (
            <>
              <Brain className="h-3 w-3" />
              Quiz Adaptatif IA
            </>
          ) : (
            <>
              <ListChecks className="h-3 w-3" />
              Quiz Classique
            </>
          )}
        </div>
      </div>

      {/* Quiz Component */}
      {mode === "classic" ? (
        <LessonQuiz
          quiz={quiz}
          lessonId={lessonId}
          childId={childId}
          previousScore={previousScore}
        />
      ) : (
        <AdaptiveQuizPlayer
          lessonId={lessonId}
          childId={childId}
          lessonTitle={lessonTitle}
          subject={subject}
          gradeLevel={gradeLevel}
        />
      )}
    </div>
  );
}
