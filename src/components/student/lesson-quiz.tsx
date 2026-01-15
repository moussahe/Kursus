"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Trophy,
  Zap,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { submitQuizScore } from "@/app/(dashboard)/student/actions";
import { XP_REWARDS } from "@/lib/gamification";

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

interface LessonQuizProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    passingScore: number;
    questions: QuizQuestion[];
  };
  lessonId: string;
  childId: string;
  previousScore: number | null;
}

export function LessonQuiz({
  quiz,
  lessonId,
  childId,
  previousScore,
}: LessonQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(previousScore);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [quizStarted, setQuizStarted] = useState(false);

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleSelectAnswer = (optionId: string) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: optionId,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    for (const q of quiz.questions) {
      const selectedId = selectedAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) {
        correct++;
      }
    }
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResults(true);

      // Submit score to server
      startTransition(async () => {
        const result = await submitQuizScore(lessonId, childId, finalScore);
        if (result.xpEarned) {
          setXpEarned(result.xpEarned);
        }
      });
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setXpEarned(null);
    setQuizStarted(true);
  };

  const selectedAnswer = selectedAnswers[question?.id];

  // Show previous score if quiz not started
  if (!quizStarted && previousScore !== null) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
              <p className="text-sm text-gray-500">
                {totalQuestions} questions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "rounded-xl px-4 py-2",
                previousScore >= quiz.passingScore
                  ? "bg-emerald-100"
                  : "bg-orange-100",
              )}
            >
              <p className="text-xs text-gray-500">Score precedent</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  previousScore >= quiz.passingScore
                    ? "text-emerald-700"
                    : "text-orange-700",
                )}
              >
                {previousScore}%
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setQuizStarted(true)}
          variant="outline"
          className="mt-4 w-full gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refaire le quiz
        </Button>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="mt-2 text-gray-500">{quiz.description}</p>
          )}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>{totalQuestions} questions</span>
            <span>Score minimum: {quiz.passingScore}%</span>
          </div>
          <div className="mt-4 rounded-lg bg-violet-50 p-3">
            <p className="text-sm text-violet-700">
              <Zap className="mr-1 inline h-4 w-4" />
              Gagne jusqu&apos;a{" "}
              <span className="font-semibold">
                +{XP_REWARDS.QUIZ_PERFECT} XP
              </span>{" "}
              avec un score parfait !
            </p>
          </div>
          <Button
            onClick={() => setQuizStarted(true)}
            className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Commencer le quiz
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && score !== null) {
    const passed = score >= quiz.passingScore;
    const isPerfect = score === 100;

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
            {isPerfect ? "Parfait !" : passed ? "Bravo !" : "Continue !"}
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
              {score}%
            </p>
          </div>

          <p className="mt-4 text-gray-500">
            {passed
              ? "Tu as reussi ce quiz !"
              : `Tu as besoin de ${quiz.passingScore}% pour reussir.`}
          </p>

          {/* XP Earned */}
          {xpEarned && xpEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-white">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">+{xpEarned} XP</span>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refaire
            </Button>
          </div>
        </div>

        {/* Review Answers */}
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-gray-900">Revue des réponses</h4>
          {quiz.questions.map((q, idx) => {
            const selectedId = selectedAnswers[q.id];
            const correctOption = q.options.find((o) => o.isCorrect);
            const isCorrect = selectedId === correctOption?.id;

            return (
              <div
                key={q.id}
                className={cn(
                  "rounded-xl border p-4",
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white",
                      isCorrect ? "bg-emerald-500" : "bg-red-500",
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{q.question}</p>
                    <p className="mt-2 text-sm">
                      <span className="text-gray-500">Ta réponse: </span>
                      <span
                        className={cn(
                          "font-medium",
                          isCorrect ? "text-emerald-700" : "text-red-700",
                        )}
                      >
                        {q.options.find((o) => o.id === selectedId)?.text ||
                          "Non repondu"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm">
                        <span className="text-gray-500">Bonne réponse: </span>
                        <span className="font-medium text-emerald-700">
                          {correctOption?.text}
                        </span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-sm text-gray-600">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz question screen
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Question {currentQuestion + 1} sur {totalQuestions}
          </span>
          <span>
            {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900">
          {question.question}
        </h4>

        {/* Options */}
        <div className="mt-4 space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300",
                    )}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-medium",
                      isSelected ? "text-blue-700" : "text-gray-700",
                    )}
                  >
                    {option.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || isPending}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? (
              "Chargement..."
            ) : isLastQuestion ? (
              <>
                Voir les resultats
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
