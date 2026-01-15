"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  Loader2,
  Zap,
  RefreshCw,
  Brain,
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { XP_REWARDS } from "@/lib/gamification";
import { useAdaptiveLearningState } from "@/hooks/use-adaptive-learning-state";
import { QuizQuestionHelp } from "./quiz-question-help";

type Difficulty = "easy" | "medium" | "hard";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AdaptiveQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: Difficulty;
  points: number;
}

interface AdaptationInfo {
  previousDifficulty: Difficulty;
  currentDifficulty: Difficulty;
  difficultyChanged: boolean;
  reason: string | null;
}

interface RealtimeAdaptiveQuizProps {
  lessonId: string;
  childId: string;
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  totalQuestions?: number;
  onComplete?: (result: QuizResult) => void;
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  feedback?: AIFeedback;
  xpEarned?: number;
}

interface AIFeedback {
  summary: string;
  encouragement: string;
  areasToReview: string[];
  nextSteps: string;
  difficultyRecommendation: Difficulty;
}

type QuizPhase =
  | "intro"
  | "loading"
  | "playing"
  | "transition"
  | "submitting"
  | "results";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string; icon: typeof Target }
> = {
  easy: {
    label: "Facile",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    icon: Target,
  },
  medium: {
    label: "Moyen",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    icon: Target,
  },
  hard: {
    label: "Difficile",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: Target,
  },
};

export function RealtimeAdaptiveQuiz({
  lessonId,
  childId,
  lessonTitle,
  subject,
  gradeLevel,
  totalQuestions = 5,
  onComplete,
}: RealtimeAdaptiveQuizProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentQuestion, setCurrentQuestion] =
    useState<AdaptiveQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] =
    useState<Difficulty>("medium");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time session tracking
  const [sessionPerformance, setSessionPerformance] = useState({
    totalAnswered: 0,
    correctCount: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    answeredQuestions: [] as string[],
    difficultyHistory: [] as Difficulty[],
    earnedPoints: 0,
    totalPossiblePoints: 0,
    answers: [] as Array<{
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      difficulty: Difficulty;
      points: number;
    }>,
  });

  // Difficulty transition animation
  const [adaptationInfo, setAdaptationInfo] = useState<AdaptationInfo | null>(
    null,
  );
  const [showTransition, setShowTransition] = useState(false);

  const startTimeRef = useRef<number>(0);

  // Persistent adaptive learning state
  const {
    state: persistentState,
    isLoading: isLoadingState,
    initialDifficulty,
    masteryLevel,
    totalSessions,
    bestStreak: historicalBestStreak,
    accuracy: historicalAccuracy,
    saveSessionResults,
  } = useAdaptiveLearningState({
    childId,
    subject,
    gradeLevel,
  });

  // Initialize difficulty from persistent state
  useEffect(() => {
    if (persistentState && phase === "intro") {
      setCurrentDifficulty(initialDifficulty);
    }
  }, [persistentState, initialDifficulty, phase]);

  // Fetch next question with real-time adaptation
  const fetchNextQuestion = useCallback(async () => {
    try {
      const response = await fetch("/api/quizzes/adaptive/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          childId,
          currentDifficulty,
          sessionPerformance: {
            totalAnswered: sessionPerformance.totalAnswered,
            correctCount: sessionPerformance.correctCount,
            consecutiveCorrect: sessionPerformance.consecutiveCorrect,
            consecutiveWrong: sessionPerformance.consecutiveWrong,
            answeredQuestions: sessionPerformance.answeredQuestions,
            difficultyHistory: sessionPerformance.difficultyHistory,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }

      const data = await response.json();

      // Handle difficulty adaptation
      if (data.adaptation.difficultyChanged) {
        setAdaptationInfo(data.adaptation);
        setShowTransition(true);
        setPhase("transition");

        // Show transition for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setCurrentDifficulty(data.adaptation.currentDifficulty);
        setShowTransition(false);
      }

      setCurrentQuestion(data.question);
      setQuestionNumber(data.context.questionNumber);
      setPhase("playing");

      return data.question;
    } catch (err) {
      console.error("Error fetching next question:", err);
      throw err;
    }
  }, [lessonId, childId, currentDifficulty, sessionPerformance]);

  // Start quiz
  const handleStart = useCallback(async () => {
    setPhase("loading");
    setError(null);
    startTimeRef.current = Date.now();

    // Reset session performance
    setSessionPerformance({
      totalAnswered: 0,
      correctCount: 0,
      consecutiveCorrect: persistentState?.consecutiveCorrect || 0,
      consecutiveWrong: persistentState?.consecutiveWrong || 0,
      answeredQuestions: [],
      difficultyHistory: [],
      earnedPoints: 0,
      totalPossiblePoints: 0,
      answers: [],
    });

    try {
      await fetchNextQuestion();
    } catch {
      setError("Impossible de charger les questions. Reessayez.");
      setPhase("intro");
    }
  }, [fetchNextQuestion, persistentState]);

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      if (showExplanation) return;
      setSelectedAnswer(optionId);
    },
    [showExplanation],
  );

  // Check answer and show explanation
  const handleCheckAnswer = useCallback(() => {
    if (!currentQuestion || !selectedAnswer) return;

    const correctOption = currentQuestion.options.find((o) => o.isCorrect);
    const isCorrect = selectedAnswer === correctOption?.id;
    const selectedText =
      currentQuestion.options.find((o) => o.id === selectedAnswer)?.text || "";

    setShowExplanation(true);

    // Update session performance
    setSessionPerformance((prev) => ({
      ...prev,
      totalAnswered: prev.totalAnswered + 1,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0,
      consecutiveWrong: isCorrect ? 0 : prev.consecutiveWrong + 1,
      answeredQuestions: [...prev.answeredQuestions, currentQuestion.question],
      difficultyHistory: [
        ...prev.difficultyHistory,
        currentQuestion.difficulty,
      ],
      earnedPoints: isCorrect
        ? prev.earnedPoints + currentQuestion.points
        : prev.earnedPoints,
      totalPossiblePoints: prev.totalPossiblePoints + currentQuestion.points,
      answers: [
        ...prev.answers,
        {
          question: currentQuestion.question,
          selectedAnswer: selectedText,
          correctAnswer: correctOption?.text || "",
          isCorrect,
          difficulty: currentQuestion.difficulty,
          points: isCorrect ? currentQuestion.points : 0,
        },
      ],
    }));
  }, [currentQuestion, selectedAnswer]);

  // Finish quiz - defined before handleNext to avoid circular dependency
  const handleFinish = useCallback(async () => {
    setPhase("submitting");

    const percentage =
      sessionPerformance.totalPossiblePoints > 0
        ? Math.round(
            (sessionPerformance.earnedPoints /
              sessionPerformance.totalPossiblePoints) *
              100,
          )
        : 0;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Save adaptive learning state
    const sessionAnswersForPersistence = sessionPerformance.answers.map(
      (a) => ({
        difficulty: a.difficulty,
        correct: a.isCorrect,
      }),
    );

    try {
      await saveSessionResults(
        sessionAnswersForPersistence,
        currentDifficulty,
        sessionPerformance.consecutiveCorrect,
        sessionPerformance.consecutiveWrong,
      );
    } catch (err) {
      console.error("Failed to save adaptive state:", err);
    }

    // Submit to server
    try {
      const response = await fetch("/api/quizzes/adaptive/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          childId,
          score: percentage,
          correctCount: sessionPerformance.correctCount,
          totalQuestions: sessionPerformance.totalAnswered,
          timeSpent,
          questions: sessionPerformance.answers.map((a) => ({
            question: a.question,
            selectedAnswer: a.selectedAnswer,
            correctAnswer: a.correctAnswer,
            isCorrect: a.isCorrect,
          })),
        }),
      });

      const data = await response.json();

      const quizResult: QuizResult = {
        score: sessionPerformance.earnedPoints,
        totalPoints: sessionPerformance.totalPossiblePoints,
        percentage,
        correctCount: sessionPerformance.correctCount,
        totalQuestions: sessionPerformance.totalAnswered,
        feedback: data.feedback,
        xpEarned: data.xpEarned,
      };

      setResult(quizResult);
      setPhase("results");
      onComplete?.(quizResult);
    } catch {
      const quizResult: QuizResult = {
        score: sessionPerformance.earnedPoints,
        totalPoints: sessionPerformance.totalPossiblePoints,
        percentage,
        correctCount: sessionPerformance.correctCount,
        totalQuestions: sessionPerformance.totalAnswered,
      };

      setResult(quizResult);
      setPhase("results");
      onComplete?.(quizResult);
    }
  }, [
    sessionPerformance,
    currentDifficulty,
    lessonId,
    childId,
    onComplete,
    saveSessionResults,
  ]);

  // Move to next question or finish
  const handleNext = useCallback(async () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setAdaptationInfo(null);

    if (sessionPerformance.totalAnswered >= totalQuestions) {
      // Finish quiz
      handleFinish();
    } else {
      // Fetch next question
      setPhase("loading");
      try {
        await fetchNextQuestion();
      } catch {
        console.error("Failed to fetch next question");
        handleFinish();
      }
    }
  }, [
    sessionPerformance.totalAnswered,
    totalQuestions,
    fetchNextQuestion,
    handleFinish,
  ]);

  // Retry quiz
  const handleRetry = useCallback(() => {
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setSelectedAnswer(null);
    setResult(null);
    setAdaptationInfo(null);
    if (persistentState) {
      setCurrentDifficulty(initialDifficulty);
    } else {
      setCurrentDifficulty("medium");
    }
    setPhase("intro");
  }, [persistentState, initialDifficulty]);

  // Intro Screen
  if (phase === "intro") {
    const hasPreviousProgress = totalSessions > 0;
    const difficultyLabel = DIFFICULTY_CONFIG[initialDifficulty].label;

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Quiz Adaptatif Temps Reel
          </h3>
          <p className="mt-2 text-gray-500">
            La difficulte s&apos;adapte apres chaque réponse!
          </p>

          {/* Real-time adaptation highlight */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2">
            <Zap className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">
              Adaptation en temps reel
            </span>
          </div>

          {isLoadingState ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de ta progression...
            </div>
          ) : hasPreviousProgress ? (
            <div className="mt-4 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4">
              <p className="mb-3 text-sm font-medium text-violet-800">
                Ta progression en {subject}
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-white/80 p-2">
                  <Award className="mx-auto h-4 w-4 text-amber-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {masteryLevel}%
                  </p>
                  <p className="text-xs text-gray-500">Maitrise</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">
                  <Target className="mx-auto h-4 w-4 text-violet-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {historicalAccuracy}%
                  </p>
                  <p className="text-xs text-gray-500">Precision</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">
                  <Flame className="mx-auto h-4 w-4 text-orange-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {historicalBestStreak}
                  </p>
                  <p className="text-xs text-gray-500">Record</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {totalSessions}
                  </p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-violet-600">
                Niveau recommande:{" "}
                <span className="font-semibold">{difficultyLabel}</span>
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Sparkles className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-1 font-medium text-emerald-700">
                  Personnalise
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <TrendingUp className="mx-auto h-5 w-5 text-amber-600" />
                <p className="mt-1 font-medium text-amber-700">Temps reel</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3">
                <Target className="mx-auto h-5 w-5 text-violet-600" />
                <p className="mt-1 font-medium text-violet-700">
                  {totalQuestions} questions
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-violet-50 p-3">
            <p className="text-sm text-violet-700">
              <Zap className="mr-1 inline h-4 w-4" />
              Gagne jusqu&apos;a{" "}
              <span className="font-semibold">
                +{XP_REWARDS.QUIZ_PERFECT} XP
              </span>{" "}
              avec un score parfait!
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={isLoadingState}
            className="mt-6 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            size="lg"
          >
            {hasPreviousProgress
              ? "Continuer l'entrainement"
              : "Commencer le quiz"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Difficulty Transition Screen
  if (phase === "transition" && adaptationInfo && showTransition) {
    const isLevelUp =
      (adaptationInfo.previousDifficulty === "easy" &&
        adaptationInfo.currentDifficulty === "medium") ||
      (adaptationInfo.previousDifficulty === "medium" &&
        adaptationInfo.currentDifficulty === "hard");

    const prevConfig = DIFFICULTY_CONFIG[adaptationInfo.previousDifficulty];
    const newConfig = DIFFICULTY_CONFIG[adaptationInfo.currentDifficulty];

    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full",
              isLevelUp
                ? "bg-gradient-to-br from-emerald-400 to-green-500"
                : "bg-gradient-to-br from-amber-400 to-orange-500",
            )}
          >
            {isLevelUp ? (
              <ArrowUp className="h-10 w-10 text-white animate-bounce" />
            ) : (
              <ArrowDown className="h-10 w-10 text-white animate-bounce" />
            )}
          </div>

          <h3 className="mt-4 text-xl font-bold text-gray-900">
            {isLevelUp ? "Niveau superieur!" : "Ajustement"}
          </h3>

          <div className="mt-4 flex items-center gap-4">
            <div
              className={cn(
                "rounded-lg px-4 py-2",
                prevConfig.bgColor,
                "opacity-50",
              )}
            >
              <span className={cn("font-medium", prevConfig.color)}>
                {prevConfig.label}
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div
              className={cn(
                "rounded-lg px-4 py-2 ring-2 ring-offset-2",
                newConfig.bgColor,
                isLevelUp ? "ring-emerald-500" : "ring-amber-500",
              )}
            >
              <span className={cn("font-semibold", newConfig.color)}>
                {newConfig.label}
              </span>
            </div>
          </div>

          {adaptationInfo.reason && (
            <p className="mt-4 text-center text-sm text-gray-600">
              {adaptationInfo.reason}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement de la prochaine question...
          </div>
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
            <div className="h-16 w-16 rounded-full border-4 border-violet-100" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-violet-600" />
          </div>
          <p className="mt-4 font-medium text-gray-900">
            {questionNumber === 0
              ? "Generation de la premiere question..."
              : "Generation de la question suivante..."}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            L&apos;IA adapte la difficulte en temps reel
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
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="mt-4 font-medium text-gray-900">
            Calcul de ton score...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            L&apos;IA analyse tes réponses
          </p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (phase === "results" && result) {
    const passed = result.percentage >= 70;
    const isPerfect = result.percentage === 100;

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
              <XCircle className="h-10 w-10 text-orange-600" />
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            {isPerfect ? "Parfait!" : passed ? "Bravo!" : "Continue!"}
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
              {result.percentage}%
            </p>
          </div>

          <p className="mt-2 text-gray-500">
            {result.correctCount}/{result.totalQuestions} questions correctes
          </p>

          {/* XP Earned */}
          {result.xpEarned && result.xpEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-white">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">+{result.xpEarned} XP</span>
            </div>
          )}

          {/* Difficulty journey */}
          {sessionPerformance.difficultyHistory.length > 0 && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Parcours de difficulte
              </p>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {sessionPerformance.difficultyHistory.map((diff, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-3 w-3 rounded-full",
                      diff === "easy"
                        ? "bg-emerald-400"
                        : diff === "medium"
                          ? "bg-amber-400"
                          : "bg-red-400",
                    )}
                    title={DIFFICULTY_CONFIG[diff].label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Feedback */}
          {result.feedback && (
            <div className="mt-6 space-y-4 text-left">
              <div className="rounded-xl bg-violet-50 p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 shrink-0 text-violet-600" />
                  <div>
                    <p className="font-medium text-violet-800">Analyse IA</p>
                    <p className="mt-1 text-sm text-violet-700">
                      {result.feedback.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">
                  <Sparkles className="mr-1 inline h-4 w-4" />
                  {result.feedback.encouragement}
                </p>
              </div>

              {result.feedback.areasToReview.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium text-amber-800">A revoir:</p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {result.feedback.areasToReview.map((area, idx) => (
                      <li key={idx}>• {area}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  <Lightbulb className="mr-1 inline h-4 w-4" />
                  <span className="font-medium">Conseil:</span>{" "}
                  {result.feedback.nextSteps}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Prochaine difficulte recommandee:</span>
                <span
                  className={cn(
                    "font-medium",
                    DIFFICULTY_CONFIG[result.feedback.difficultyRecommendation]
                      .color,
                  )}
                >
                  {
                    DIFFICULTY_CONFIG[result.feedback.difficultyRecommendation]
                      .label
                  }
                </span>
                {result.feedback.difficultyRecommendation === "hard" && (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                )}
                {result.feedback.difficultyRecommendation === "easy" && (
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          )}

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
  if (!currentQuestion) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
          <p className="mt-4 text-gray-500">Chargement de la question...</p>
        </div>
      </div>
    );
  }

  const difficultyInfo = DIFFICULTY_CONFIG[currentQuestion.difficulty];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <Brain className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{lessonTitle}</p>
            <p className="text-xs text-gray-500">{subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          {sessionPerformance.consecutiveCorrect >= 2 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium text-orange-600">
                {sessionPerformance.consecutiveCorrect}
              </span>
            </div>
          )}

          {/* AI Help Button */}
          {!showExplanation && (
            <QuizQuestionHelp
              questionText={currentQuestion.question}
              options={currentQuestion.options}
              subject={subject}
              gradeLevel={gradeLevel}
              lessonTitle={lessonTitle}
              difficulty={currentQuestion.difficulty}
              childId={childId}
              variant="icon"
            />
          )}

          {/* Difficulty badge */}
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
              difficultyInfo.bgColor,
              difficultyInfo.color,
            )}
          >
            <difficultyInfo.icon className="h-3 w-3" />
            {difficultyInfo.label}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Question {questionNumber} sur {totalQuestions}
          </span>
          <span>{currentQuestion.points} pts</span>
        </div>
        <Progress
          value={(questionNumber / totalQuestions) * 100}
          className="mt-2 h-2"
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900">
          {currentQuestion.question}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectOption = option.isCorrect;

          let optionStyle =
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          if (showExplanation) {
            if (isCorrectOption) {
              optionStyle = "border-emerald-500 bg-emerald-50";
            } else if (isSelected && !isCorrectOption) {
              optionStyle = "border-red-500 bg-red-50";
            }
          } else if (isSelected) {
            optionStyle = "border-violet-500 bg-violet-50";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showExplanation}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                optionStyle,
                showExplanation && "cursor-default",
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  showExplanation && isCorrectOption
                    ? "border-emerald-500 bg-emerald-500"
                    : showExplanation && isSelected && !isCorrectOption
                      ? "border-red-500 bg-red-500"
                      : isSelected
                        ? "border-violet-500 bg-violet-500"
                        : "border-gray-300",
                )}
              >
                {showExplanation && isCorrectOption && (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                )}
                {showExplanation && isSelected && !isCorrectOption && (
                  <XCircle className="h-4 w-4 text-white" />
                )}
                {!showExplanation && isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <span
                className={cn(
                  "text-gray-700",
                  showExplanation &&
                    isCorrectOption &&
                    "text-emerald-700 font-medium",
                  showExplanation &&
                    isSelected &&
                    !isCorrectOption &&
                    "text-red-700",
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && currentQuestion.explanation && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">Explication</p>
          <p className="mt-1 text-sm text-blue-700">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        {!showExplanation && selectedAnswer && (
          <Button
            onClick={handleCheckAnswer}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Verifier
          </Button>
        )}

        {showExplanation && (
          <Button
            onClick={handleNext}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {questionNumber >= totalQuestions
              ? "Voir les resultats"
              : "Suivant"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
