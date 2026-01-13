"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Loader2,
  Zap,
  RefreshCw,
  Dumbbell,
  Target,
  GripVertical,
  Type,
  ArrowLeftRight,
  ListOrdered,
  Calculator,
  HelpCircle,
} from "lucide-react";
import type {
  ExerciseType,
  Difficulty,
  GeneratedExercise,
  ExerciseResult,
} from "@/types/exercise";

interface ExercisePlayerProps {
  lessonId: string;
  childId: string;
  lessonTitle: string;
  subject: string;
  onComplete?: (results: ExerciseSessionResult) => void;
}

interface ExerciseSessionResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  totalExercises: number;
  xpEarned: number;
  results: ExerciseResult[];
}

type Phase = "intro" | "loading" | "playing" | "submitting" | "results";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string }
> = {
  easy: {
    label: "Facile",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  medium: { label: "Moyen", color: "text-amber-600", bgColor: "bg-amber-100" },
  hard: { label: "Difficile", color: "text-red-600", bgColor: "bg-red-100" },
};

const EXERCISE_TYPE_ICONS: Record<ExerciseType, typeof Type> = {
  FILL_IN_BLANK: Type,
  MATCHING: ArrowLeftRight,
  ORDERING: ListOrdered,
  SHORT_ANSWER: Type,
  TRUE_FALSE: HelpCircle,
  CALCULATION: Calculator,
};

interface ExerciseWithId extends GeneratedExercise {
  id: string;
}

export function ExercisePlayer({
  lessonId,
  childId,
  lessonTitle,
  subject,
  onComplete,
}: ExercisePlayerProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [exercises, setExercises] = useState<ExerciseWithId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<unknown>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(
    null,
  );
  const [sessionResults, setSessionResults] = useState<ExerciseResult[]>([]);
  const [finalResult, setFinalResult] = useState<ExerciseSessionResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const exerciseStartTimeRef = useRef<number>(0);

  const currentExercise = exercises[currentIndex];

  // Fetch exercises from API
  const fetchExercises = useCallback(
    async (difficulty: Difficulty) => {
      const response = await fetch("/api/exercises/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          childId,
          difficulty,
          count: 3,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();
      return data.exercises as ExerciseWithId[];
    },
    [lessonId, childId],
  );

  // Start exercises
  const handleStart = useCallback(async () => {
    setPhase("loading");
    setError(null);
    startTimeRef.current = Date.now();
    exerciseStartTimeRef.current = Date.now();

    try {
      const generatedExercises = await fetchExercises("medium");
      setExercises(generatedExercises);
      setPhase("playing");
    } catch {
      setError("Impossible de charger les exercices. Reessayez.");
      setPhase("intro");
    }
  }, [fetchExercises]);

  // Submit answer and get feedback
  const handleSubmit = useCallback(async () => {
    if (!currentExercise || userAnswer === null) return;

    setPhase("submitting");
    const timeSpent = Math.round(
      (Date.now() - exerciseStartTimeRef.current) / 1000,
    );

    try {
      const response = await fetch("/api/exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: currentExercise.id,
          childId,
          answer: userAnswer,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit exercise");
      }

      const data = await response.json();

      const result: ExerciseResult = {
        isCorrect: data.isCorrect,
        score: data.score,
        maxScore: data.maxScore,
        feedback: data.feedback,
        explanation: data.explanation,
        xpEarned: data.xpEarned || 0,
      };

      setCurrentResult(result);
      setSessionResults((prev) => [...prev, result]);
      setShowFeedback(true);
      setPhase("playing");
    } catch {
      setError("Erreur lors de la soumission. Reessayez.");
      setPhase("playing");
    }
  }, [currentExercise, userAnswer, childId]);

  // Move to next exercise or show results
  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= exercises.length) {
      // Calculate final results
      const allResults = sessionResults;
      const totalScore = allResults.reduce((sum, r) => sum + r.score, 0);
      const maxScore = allResults.reduce((sum, r) => sum + r.maxScore, 0);
      const correctCount = allResults.filter((r) => r.isCorrect).length;
      const xpEarned = allResults.reduce((sum, r) => sum + r.xpEarned, 0);

      const result: ExerciseSessionResult = {
        totalScore,
        maxScore,
        percentage:
          maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
        correctCount,
        totalExercises: allResults.length,
        xpEarned,
        results: allResults,
      };

      setFinalResult(result);
      setPhase("results");
      onComplete?.(result);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer(null);
      setCurrentResult(null);
      setShowFeedback(false);
      exerciseStartTimeRef.current = Date.now();
    }
  }, [currentIndex, exercises.length, sessionResults, onComplete]);

  // Retry session
  const handleRetry = useCallback(() => {
    setExercises([]);
    setCurrentIndex(0);
    setUserAnswer(null);
    setCurrentResult(null);
    setSessionResults([]);
    setFinalResult(null);
    setShowFeedback(false);
    setPhase("intro");
  }, []);

  // Intro Screen
  if (phase === "intro") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Exercices Interactifs
          </h3>
          <p className="mt-2 text-gray-500">
            L&apos;IA genere des exercices varies adaptes a ton niveau
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-blue-50 p-3">
              <Type className="mx-auto h-5 w-5 text-blue-600" />
              <p className="mt-1 font-medium text-blue-700">Texte a trous</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <ArrowLeftRight className="mx-auto h-5 w-5 text-indigo-600" />
              <p className="mt-1 font-medium text-indigo-700">Appariement</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-3">
              <ListOrdered className="mx-auto h-5 w-5 text-violet-600" />
              <p className="mt-1 font-medium text-violet-700">Ordre</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              <Zap className="mr-1 inline h-4 w-4" />
              Gagne des <span className="font-semibold">XP</span> pour chaque
              exercice reussi!
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            onClick={handleStart}
            className="mt-6 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            Commencer les exercices
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (phase === "loading") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-100" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="mt-4 font-medium text-gray-900">
            Generation des exercices...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            L&apos;IA prepare des exercices personnalises
          </p>
        </div>
      </div>
    );
  }

  // Submitting Screen
  if (phase === "submitting") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 font-medium text-gray-900">
            Verification de ta reponse...
          </p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (phase === "results" && finalResult) {
    const passed = finalResult.percentage >= 70;
    const isPerfect = finalResult.percentage === 100;

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
              isPerfect
                ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                : passed
                  ? "bg-emerald-100"
                  : "bg-orange-100",
            )}
          >
            {isPerfect ? (
              <Trophy className="h-10 w-10 text-white" />
            ) : passed ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            ) : (
              <Target className="h-10 w-10 text-orange-600" />
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            {isPerfect
              ? "Parfait!"
              : passed
                ? "Bien joue!"
                : "Continue tes efforts!"}
          </h3>

          <div
            className={cn(
              "mx-auto mt-4 w-32 rounded-xl py-3",
              passed ? "bg-emerald-100" : "bg-orange-100",
            )}
          >
            <p
              className={cn(
                "text-3xl font-bold",
                passed ? "text-emerald-700" : "text-orange-700",
              )}
            >
              {finalResult.percentage}%
            </p>
          </div>

          <p className="mt-2 text-gray-500">
            {finalResult.correctCount}/{finalResult.totalExercises} exercices
            reussis
          </p>

          {/* XP Earned */}
          {finalResult.xpEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">+{finalResult.xpEarned} XP</span>
            </div>
          )}

          {/* Individual Results */}
          <div className="mt-6 space-y-2">
            {finalResult.results.map((result, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between rounded-lg p-3",
                  result.isCorrect ? "bg-emerald-50" : "bg-orange-50",
                )}
              >
                <div className="flex items-center gap-2">
                  {result.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <span className="text-sm font-medium">
                    Exercice {idx + 1}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    result.isCorrect ? "text-emerald-600" : "text-orange-600",
                  )}
                >
                  {result.score}/{result.maxScore} pts
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refaire
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (!currentExercise) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-500">Chargement de l&apos;exercice...</p>
        </div>
      </div>
    );
  }

  const difficultyInfo = DIFFICULTY_CONFIG[currentExercise.difficulty];
  const ExerciseIcon = EXERCISE_TYPE_ICONS[currentExercise.type];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <ExerciseIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{lessonTitle}</p>
            <p className="text-xs text-gray-500">{subject}</p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
            difficultyInfo.bgColor,
            difficultyInfo.color,
          )}
        >
          <Target className="h-3 w-3" />
          {difficultyInfo.label}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Exercice {currentIndex + 1} sur {exercises.length}
          </span>
          <span>{currentExercise.points} pts</span>
        </div>
        <Progress
          value={((currentIndex + 1) / exercises.length) * 100}
          className="mt-2 h-2"
        />
      </div>

      {/* Exercise Content */}
      <ExerciseRenderer
        exercise={currentExercise}
        userAnswer={userAnswer}
        onAnswerChange={setUserAnswer}
        showFeedback={showFeedback}
        result={currentResult}
      />

      {/* Feedback */}
      {showFeedback && currentResult && (
        <div
          className={cn(
            "mt-6 rounded-xl border p-4",
            currentResult.isCorrect
              ? "border-emerald-200 bg-emerald-50"
              : "border-orange-200 bg-orange-50",
          )}
        >
          <div className="flex items-start gap-3">
            {currentResult.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-orange-600" />
            )}
            <div>
              <p
                className={cn(
                  "font-medium",
                  currentResult.isCorrect
                    ? "text-emerald-800"
                    : "text-orange-800",
                )}
              >
                {currentResult.isCorrect ? "Correct!" : "Pas tout a fait..."}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm",
                  currentResult.isCorrect
                    ? "text-emerald-700"
                    : "text-orange-700",
                )}
              >
                {currentResult.feedback}
              </p>
              {currentResult.explanation && !currentResult.isCorrect && (
                <p className="mt-2 text-sm text-gray-600">
                  {currentResult.explanation}
                </p>
              )}
              {currentResult.xpEarned > 0 && (
                <p className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600">
                  <Zap className="h-4 w-4" />+{currentResult.xpEarned} XP
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        {!showFeedback && userAnswer !== null && (
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Verifier
          </Button>
        )}

        {showFeedback && (
          <Button
            onClick={handleNext}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {currentIndex + 1 >= exercises.length
              ? "Voir les resultats"
              : "Suivant"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Exercise Renderer Component
interface ExerciseRendererProps {
  exercise: GeneratedExercise;
  userAnswer: unknown;
  onAnswerChange: (answer: unknown) => void;
  showFeedback: boolean;
  result: ExerciseResult | null;
}

function ExerciseRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  showFeedback,
}: ExerciseRendererProps) {
  const content = exercise.content;

  return (
    <div className="space-y-4">
      {/* Question/Instructions */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900">
          {content.question}
        </h4>
        <p className="mt-1 text-sm text-gray-500">{content.instructions}</p>
      </div>

      {/* Exercise Type Specific Content */}
      {exercise.type === "FILL_IN_BLANK" && (
        <FillInBlankExercise
          content={
            content as {
              text: string;
              blanks: Array<{ id: string; hint?: string }>;
            }
          }
          userAnswer={userAnswer as Record<string, string> | null}
          onAnswerChange={onAnswerChange}
          disabled={showFeedback}
        />
      )}

      {exercise.type === "MATCHING" && (
        <MatchingExercise
          content={
            content as {
              leftItems: Array<{ id: string; text: string }>;
              rightItems: Array<{ id: string; text: string }>;
            }
          }
          userAnswer={userAnswer as Record<string, string> | null}
          onAnswerChange={onAnswerChange}
          disabled={showFeedback}
        />
      )}

      {exercise.type === "ORDERING" && (
        <OrderingExercise
          content={content as { items: Array<{ id: string; text: string }> }}
          userAnswer={userAnswer as string[] | null}
          onAnswerChange={onAnswerChange}
          disabled={showFeedback}
        />
      )}

      {exercise.type === "TRUE_FALSE" && (
        <TrueFalseExercise
          content={
            content as {
              statements: Array<{ id: string; text: string }>;
            }
          }
          userAnswer={userAnswer as Record<string, boolean> | null}
          onAnswerChange={onAnswerChange}
          disabled={showFeedback}
        />
      )}

      {exercise.type === "CALCULATION" && (
        <CalculationExercise
          content={content as { problem: string; unit?: string }}
          userAnswer={userAnswer as number | null}
          onAnswerChange={onAnswerChange}
          disabled={showFeedback}
        />
      )}
    </div>
  );
}

// Fill in the Blank Exercise
function FillInBlankExercise({
  content,
  userAnswer,
  onAnswerChange,
  disabled,
}: {
  content: { text: string; blanks: Array<{ id: string; hint?: string }> };
  userAnswer: Record<string, string> | null;
  onAnswerChange: (answer: Record<string, string>) => void;
  disabled: boolean;
}) {
  const answers = userAnswer || {};

  // Parse text and replace blanks with inputs
  const parts = content.text.split(/(\{\{blank_\d+\}\})/);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4 text-gray-700 leading-relaxed">
        {parts.map((part, idx) => {
          const match = part.match(/\{\{(blank_\d+)\}\}/);
          if (match) {
            const blankId = match[1];
            const blank = content.blanks.find((b) => b.id === blankId);
            return (
              <input
                key={idx}
                type="text"
                value={answers[blankId] || ""}
                onChange={(e) =>
                  onAnswerChange({ ...answers, [blankId]: e.target.value })
                }
                disabled={disabled}
                placeholder={blank?.hint || "..."}
                className={cn(
                  "mx-1 inline-block w-32 rounded border-2 border-blue-300 bg-white px-2 py-1 text-center font-medium focus:border-blue-500 focus:outline-none",
                  disabled && "bg-gray-100",
                )}
              />
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    </div>
  );
}

// Matching Exercise
function MatchingExercise({
  content,
  userAnswer,
  onAnswerChange,
  disabled,
}: {
  content: {
    leftItems: Array<{ id: string; text: string }>;
    rightItems: Array<{ id: string; text: string }>;
  };
  userAnswer: Record<string, string> | null;
  onAnswerChange: (answer: Record<string, string>) => void;
  disabled: boolean;
}) {
  const answers = userAnswer || {};

  return (
    <div className="space-y-3">
      {content.leftItems.map((leftItem) => (
        <div
          key={leftItem.id}
          className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
        >
          <div className="flex-1 font-medium text-gray-700">
            {leftItem.text}
          </div>
          <ArrowLeftRight className="h-4 w-4 text-gray-400" />
          <select
            value={answers[leftItem.id] || ""}
            onChange={(e) =>
              onAnswerChange({ ...answers, [leftItem.id]: e.target.value })
            }
            disabled={disabled}
            className={cn(
              "flex-1 rounded-lg border-2 border-gray-300 bg-white p-2 focus:border-blue-500 focus:outline-none",
              disabled && "bg-gray-100",
            )}
          >
            <option value="">Choisir...</option>
            {content.rightItems.map((rightItem) => (
              <option key={rightItem.id} value={rightItem.id}>
                {rightItem.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

// Shuffle array deterministically based on item count (for consistent initial state)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use deterministic swap based on index and length
    const j = (i * 7 + shuffled.length) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Ordering Exercise
function OrderingExercise({
  content,
  userAnswer,
  onAnswerChange,
  disabled,
}: {
  content: { items: Array<{ id: string; text: string }> };
  userAnswer: string[] | null;
  onAnswerChange: (answer: string[]) => void;
  disabled: boolean;
}) {
  // Initialize with shuffled items if no answer yet (deterministic shuffle)
  const orderedIds =
    userAnswer || shuffleArray(content.items.map((item) => item.id));

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    const newOrder = [...orderedIds];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    onAnswerChange(newOrder);
  };

  return (
    <div className="space-y-2">
      {orderedIds.map((id, index) => {
        const item = content.items.find((i) => i.id === id);
        if (!item) return null;

        return (
          <div
            key={id}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 bg-white p-3",
              disabled ? "border-gray-200" : "border-gray-300",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {index + 1}
              </span>
              {!disabled && <GripVertical className="h-4 w-4 text-gray-400" />}
            </div>
            <span className="flex-1 font-medium text-gray-700">
              {item.text}
            </span>
            {!disabled && (
              <div className="flex gap-1">
                <button
                  onClick={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                >
                  <span className="text-gray-500">↑</span>
                </button>
                <button
                  onClick={() =>
                    moveItem(index, Math.min(orderedIds.length - 1, index + 1))
                  }
                  disabled={index === orderedIds.length - 1}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                >
                  <span className="text-gray-500">↓</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// True/False Exercise
function TrueFalseExercise({
  content,
  userAnswer,
  onAnswerChange,
  disabled,
}: {
  content: { statements: Array<{ id: string; text: string }> };
  userAnswer: Record<string, boolean> | null;
  onAnswerChange: (answer: Record<string, boolean>) => void;
  disabled: boolean;
}) {
  const answers = userAnswer || {};

  return (
    <div className="space-y-3">
      {content.statements.map((statement) => (
        <div
          key={statement.id}
          className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4"
        >
          <p className="flex-1 text-gray-700">{statement.text}</p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                !disabled &&
                onAnswerChange({ ...answers, [statement.id]: true })
              }
              disabled={disabled}
              className={cn(
                "rounded-lg px-4 py-2 font-medium transition-colors",
                answers[statement.id] === true
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-emerald-600 border-2 border-emerald-200 hover:border-emerald-400",
                disabled && "opacity-60",
              )}
            >
              Vrai
            </button>
            <button
              onClick={() =>
                !disabled &&
                onAnswerChange({ ...answers, [statement.id]: false })
              }
              disabled={disabled}
              className={cn(
                "rounded-lg px-4 py-2 font-medium transition-colors",
                answers[statement.id] === false
                  ? "bg-red-500 text-white"
                  : "bg-white text-red-600 border-2 border-red-200 hover:border-red-400",
                disabled && "opacity-60",
              )}
            >
              Faux
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Calculation Exercise
function CalculationExercise({
  content,
  userAnswer,
  onAnswerChange,
  disabled,
}: {
  content: { problem: string; unit?: string };
  userAnswer: number | null;
  onAnswerChange: (answer: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-6 text-center">
        <p className="text-2xl font-bold text-gray-900">{content.problem}</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <span className="text-gray-500">Reponse:</span>
        <input
          type="number"
          value={userAnswer ?? ""}
          onChange={(e) => onAnswerChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={cn(
            "w-32 rounded-lg border-2 border-blue-300 bg-white px-4 py-2 text-center text-lg font-bold focus:border-blue-500 focus:outline-none",
            disabled && "bg-gray-100",
          )}
          placeholder="?"
        />
        {content.unit && (
          <span className="text-lg font-medium text-gray-600">
            {content.unit}
          </span>
        )}
      </div>
    </div>
  );
}
