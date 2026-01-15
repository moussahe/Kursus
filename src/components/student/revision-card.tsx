"use client";

import { useState, useCallback, useEffect } from "react";
import type { WeakArea, GradeLevel, Subject } from "@prisma/client";
import {
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  ChevronRight,
  HelpCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const subjectLabels: Record<Subject, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geographie",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

interface RevisionCardProps {
  cardId: string;
  childId: string;
  gradeLevel: GradeLevel;
  weakArea: WeakArea;
  cardStats: {
    repetitions: number;
    easeFactor: number;
    totalReviews: number;
    successfulReviews: number;
  };
  onComplete: (wasCorrect: boolean, xpEarned: number) => void;
}

interface QuestionData {
  question: string;
  expectedAnswer: string;
}

interface ReviewResult {
  evaluation: {
    quality: number;
    isCorrect: boolean;
    feedback: string;
  };
  scheduling: {
    newInterval: number;
    nextReviewAt: string;
    isMastered: boolean;
  };
  encouragement: string;
}

type CardState = "loading" | "answering" | "submitting" | "result";

export function RevisionCard({
  cardId,
  childId,
  weakArea,
  cardStats,
  onComplete,
}: RevisionCardProps) {
  const [state, setState] = useState<CardState>("loading");
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);

  // Load question on mount
  useEffect(() => {
    async function loadQuestion() {
      try {
        const res = await fetch(
          `/api/spaced-repetition/review?cardId=${cardId}`,
        );
        if (!res.ok) {
          throw new Error("Failed to load question");
        }
        const data = await res.json();
        setQuestionData({
          question: data.question,
          expectedAnswer: data.expectedAnswer,
        });
        setState("answering");
        setStartTime(Date.now());
      } catch {
        setError("Impossible de charger la question. Reessaie.");
        setState("answering");
      }
    }
    loadQuestion();
  }, [cardId]);

  const handleSubmit = useCallback(async () => {
    if (!questionData || !answer.trim()) return;

    setState("submitting");
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      const res = await fetch("/api/spaced-repetition/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          childId,
          question: questionData.question,
          expectedAnswer: questionData.expectedAnswer,
          childAnswer: answer,
          timeSpent,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = (await res.json()) as ReviewResult;
      setResult(data);
      setState("result");
    } catch {
      setError("Erreur lors de la soumission. Reessaie.");
      setState("answering");
    }
  }, [cardId, childId, questionData, answer, startTime]);

  const handleNext = useCallback(() => {
    if (!result) return;
    // XP: 10 for correct, 5 for attempt
    const xp = result.evaluation.isCorrect ? 10 : 5;
    onComplete(result.evaluation.isCorrect, xp);
  }, [result, onComplete]);

  // Loading state
  if (state === "loading") {
    return (
      <Card className="rounded-2xl border-0 bg-white shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="mt-4 text-gray-500">Chargement de la question...</p>
        </CardContent>
      </Card>
    );
  }

  // Error fallback
  if (error && !questionData) {
    return (
      <Card className="rounded-2xl border-0 bg-white shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <XCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-gray-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Recharger
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Result state
  if (state === "result" && result) {
    const isCorrect = result.evaluation.isCorrect;
    const isMastered = result.scheduling.isMastered;

    return (
      <Card
        className={cn(
          "rounded-2xl border-0 shadow-lg transition-all",
          isCorrect
            ? "bg-gradient-to-br from-emerald-50 to-teal-50"
            : "bg-gradient-to-br from-amber-50 to-orange-50",
        )}
      >
        <CardContent className="p-6">
          {/* Result Header */}
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <XCircle className="h-6 w-6 text-amber-600" />
              </div>
            )}
            <div>
              <h3
                className={cn(
                  "text-lg font-bold",
                  isCorrect ? "text-emerald-700" : "text-amber-700",
                )}
              >
                {isCorrect ? "Bien joue !" : "Pas tout a fait..."}
              </h3>
              <p className="text-sm text-gray-600">
                {result.evaluation.feedback}
              </p>
            </div>
          </div>

          {/* Mastery badge */}
          {isMastered && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-100 p-3">
              <Zap className="h-5 w-5 text-violet-600" />
              <span className="font-medium text-violet-700">
                Concept maitrise ! Retire de tes revisions.
              </span>
            </div>
          )}

          {/* Answer comparison */}
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/50 p-3">
              <p className="text-xs font-medium text-gray-500">Ta réponse</p>
              <p className="mt-1 text-gray-700">{answer}</p>
            </div>
            {!isCorrect && questionData && (
              <div className="rounded-xl bg-white/50 p-3">
                <p className="text-xs font-medium text-gray-500">
                  Reponse attendue
                </p>
                <p className="mt-1 text-gray-700">
                  {questionData.expectedAnswer}
                </p>
              </div>
            )}
          </div>

          {/* Scheduling info */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/50 p-3">
            <span className="text-sm text-gray-600">Prochaine revision</span>
            <span className="font-medium text-gray-900">
              {result.scheduling.newInterval === 1
                ? "Demain"
                : `Dans ${result.scheduling.newInterval} jours`}
            </span>
          </div>

          {/* XP earned */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-gray-700">
              +{isCorrect ? 10 : 5} XP
            </span>
          </div>

          {/* Next button */}
          <Button
            className="mt-6 w-full bg-violet-600 hover:bg-violet-700"
            onClick={handleNext}
          >
            Continuer
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Answering state
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        {/* Topic badge */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
            {subjectLabels[weakArea.subject]}
          </span>
          <span className="text-xs text-gray-500">
            {weakArea.category || "Comprehension"}
          </span>
        </div>

        {/* Topic title */}
        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          {weakArea.topic}
        </h3>

        {/* Question */}
        <div className="mt-4 rounded-xl bg-violet-50 p-4">
          <p className="font-medium text-gray-800">
            {questionData?.question || "Chargement..."}
          </p>
        </div>

        {/* Hint toggle */}
        {questionData && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600"
          >
            <HelpCircle className="h-3 w-3" />
            {showHint ? "Cacher l'indice" : "Voir un indice"}
          </button>
        )}

        {showHint && questionData && (
          <div className="mt-2 rounded-lg bg-amber-50 p-2">
            <p className="text-xs text-amber-700">
              Indice: La réponse concerne &quot;{weakArea.topic}&quot;...
            </p>
          </div>
        )}

        {/* Answer input */}
        <div className="mt-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ecris ta réponse ici..."
            className="min-h-[100px] resize-none rounded-xl border-gray-200"
            disabled={state === "submitting"}
          />
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            Revisions: {cardStats.totalReviews} ({cardStats.successfulReviews}{" "}
            reussies)
          </span>
          <span>
            Difficulte:{" "}
            {cardStats.easeFactor < 2
              ? "Difficile"
              : cardStats.easeFactor < 2.3
                ? "Moyen"
                : "Facile"}
          </span>
        </div>

        {/* Submit button */}
        <Button
          className="mt-4 w-full bg-violet-600 hover:bg-violet-700"
          onClick={handleSubmit}
          disabled={!answer.trim() || state === "submitting"}
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluation...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Envoyer ma réponse
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
