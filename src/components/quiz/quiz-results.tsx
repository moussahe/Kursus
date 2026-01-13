"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  RotateCcw,
  TrendingUp,
  Award,
  Star,
  Sparkles,
} from "lucide-react";
import type { Quiz, QuizResult, AdaptiveQuizState } from "@/types/quiz";

interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz;
  selectedAnswers: Record<string, string>;
  onRetry: () => void;
  adaptiveState?: AdaptiveQuizState;
}

export function QuizResults({
  result,
  quiz,
  selectedAnswers,
  onRetry,
  adaptiveState,
}: QuizResultsProps) {
  const { passed, percentage, correctCount, totalQuestions, feedback } = result;

  // Calculate performance level
  const getPerformanceLevel = () => {
    if (percentage >= 90)
      return {
        label: "Excellent",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      };
    if (percentage >= 75)
      return { label: "Tres bien", color: "text-blue-600", bg: "bg-blue-50" };
    if (percentage >= 60)
      return { label: "Bien", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "A ameliorer", color: "text-red-600", bg: "bg-red-50" };
  };

  const performance = getPerformanceLevel();

  // Calculate stars (1-5)
  const starCount = Math.max(1, Math.min(5, Math.ceil(percentage / 20)));

  return (
    <div className="space-y-6">
      {/* Result Header */}
      <div
        className={cn(
          "rounded-2xl p-8 text-center",
          passed
            ? "bg-gradient-to-br from-emerald-50 to-teal-50"
            : "bg-gradient-to-br from-orange-50 to-amber-50",
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-24 w-24 items-center justify-center rounded-full",
            passed ? "bg-emerald-100" : "bg-orange-100",
          )}
        >
          {passed ? (
            <Trophy className="h-12 w-12 text-emerald-500" />
          ) : (
            <Target className="h-12 w-12 text-orange-500" />
          )}
        </div>

        <h3 className="mt-4 text-2xl font-bold text-gray-900">
          {passed ? "Felicitations !" : "Presque !"}
        </h3>

        {/* Stars */}
        <div className="mt-3 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-6 w-6",
                i < starCount
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200",
              )}
            />
          ))}
        </div>

        {/* Score */}
        <div className="mt-6">
          <div className="text-5xl font-bold text-gray-900">{percentage}%</div>
          <p className="mt-2 text-gray-600">
            {correctCount} sur {totalQuestions} bonnes reponses
          </p>
        </div>

        {/* Performance Badge */}
        <div
          className={cn(
            "mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2",
            performance.bg,
          )}
        >
          <Award className={cn("h-4 w-4", performance.color)} />
          <span className={cn("font-medium", performance.color)}>
            {performance.label}
          </span>
        </div>

        {/* Pass/Fail Message */}
        <p className="mt-4 text-gray-600">
          {passed
            ? "Tu as reussi le quiz ! Continue comme ca."
            : `Il te faut ${quiz.passingScore}% pour reussir. N'abandonne pas !`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {correctCount}
          </div>
          <p className="text-xs text-gray-500">Correctes</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <XCircle className="mx-auto h-6 w-6 text-red-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {totalQuestions - correctCount}
          </div>
          <p className="text-xs text-gray-500">Incorrectes</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Target className="mx-auto h-6 w-6 text-blue-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {quiz.passingScore}%
          </div>
          <p className="text-xs text-gray-500">Objectif</p>
        </div>
      </div>

      {/* Score Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Ton score</span>
          <span className="text-sm text-gray-500">
            {quiz.passingScore}% requis
          </span>
        </div>
        <div className="relative">
          <Progress value={percentage} className="h-4" />
          <div
            className="absolute top-0 h-4 w-0.5 bg-gray-400"
            style={{ left: `${quiz.passingScore}%` }}
          />
        </div>
      </div>

      {/* Adaptive Mode Stats */}
      {adaptiveState && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">Mode Adaptatif</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-emerald-700">Niveau atteint:</span>
              <span className="ml-2 font-medium text-emerald-900 capitalize">
                {adaptiveState.currentDifficulty}
              </span>
            </div>
            <div>
              <span className="text-emerald-700">Serie max:</span>
              <span className="ml-2 font-medium text-emerald-900">
                {Math.max(
                  ...adaptiveState.performanceHistory.reduce(
                    (acc, curr) => {
                      if (curr.correct) {
                        acc.push((acc[acc.length - 1] || 0) + 1);
                      } else {
                        acc.push(0);
                      }
                      return acc;
                    },
                    [0] as number[],
                  ),
                )}{" "}
                correctes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">
              Conseil personnalise
            </h4>
          </div>
          <p className="text-sm text-blue-800">{feedback}</p>
        </div>
      )}

      {/* Review Answers */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Revue des reponses</h4>
        {quiz.questions.map((question, index) => {
          const selectedOption = selectedAnswers[question.id];
          const correctOption = question.options.find((o) => o.isCorrect);
          const isCorrect = selectedOption === correctOption?.id;

          return (
            <div
              key={question.id}
              className={cn(
                "rounded-xl border p-4",
                isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isCorrect
                      ? "bg-emerald-200 text-emerald-700"
                      : "bg-red-200 text-red-700",
                  )}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {question.question}
                  </p>

                  <div className="mt-3 space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                          option.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : option.id === selectedOption
                              ? "bg-red-100 text-red-700"
                              : "bg-white text-gray-600",
                        )}
                      >
                        {option.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : option.id === selectedOption ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <span className="ml-auto text-xs font-medium">
                            Bonne reponse
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <p className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        Explication:
                      </span>{" "}
                      {question.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!passed && (
          <Button
            onClick={onRetry}
            className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600"
            size="lg"
          >
            <RotateCcw className="h-4 w-4" />
            Reessayer
          </Button>
        )}
        {passed && (
          <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="font-medium text-emerald-700">
              Quiz termine avec succes !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
