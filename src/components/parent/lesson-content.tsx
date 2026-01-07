"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string | null;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: QuizQuestion[];
}

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
    contentType: string;
    videoUrl: string | null;
    quizzes: Quiz[];
    resources: { id: string; title: string; type: string; url: string }[];
  };
  childId?: string;
  currentProgress: {
    isCompleted: boolean;
    quizScore: number | null;
  } | null;
}

export function LessonContent({ lesson, childId }: LessonContentProps) {
  return (
    <div className="space-y-6">
      {/* Video Content */}
      {lesson.contentType === "VIDEO" && lesson.videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {lesson.videoUrl.includes("youtube.com") ||
          lesson.videoUrl.includes("youtu.be") ? (
            <iframe
              src={getYouTubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : lesson.videoUrl.includes("vimeo.com") ? (
            <iframe
              src={getVimeoEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <video src={lesson.videoUrl} controls className="h-full w-full">
              Votre navigateur ne supporte pas la lecture de videos.
            </video>
          )}
        </div>
      )}

      {/* Text Content */}
      {lesson.content && (
        <div
          className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-ol:text-gray-600"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {/* Quiz Content */}
      {lesson.contentType === "QUIZ" && lesson.quizzes.length > 0 && (
        <QuizPlayer
          quiz={lesson.quizzes[0]}
          lessonId={lesson.id}
          childId={childId}
        />
      )}
    </div>
  );
}

function QuizPlayer({
  quiz,
  lessonId,
  childId,
}: {
  quiz: Quiz;
  lessonId: string;
  childId?: string;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    quiz.questions.forEach((question) => {
      total += question.points;
      const selectedOption = selectedAnswers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (selectedOption === correctOption?.id) {
        correct += question.points;
      }
    });

    return Math.round((correct / total) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const score = calculateScore();

    // Save quiz score if childId is provided
    if (childId) {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            childId,
            quizScore: score,
            isCompleted: score >= quiz.passingScore,
          }),
        });
      } catch (error) {
        console.error("Failed to save quiz score:", error);
      }
    }

    setShowResults(true);
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    return (
      <div className="space-y-6">
        {/* Result Header */}
        <div
          className={cn(
            "rounded-2xl p-8 text-center",
            passed ? "bg-emerald-50" : "bg-red-50",
          )}
        >
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
              passed ? "bg-emerald-100" : "bg-red-100",
            )}
          >
            {passed ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            ) : (
              <XCircle className="h-10 w-10 text-red-500" />
            )}
          </div>
          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            {passed ? "Felicitations !" : "Dommage !"}
          </h3>
          <p className="mt-2 text-gray-600">
            Vous avez obtenu <span className="font-bold">{score}%</span>
            {passed
              ? ` - Vous avez reussi le quiz !`
              : ` - Il vous faut ${quiz.passingScore}% pour reussir.`}
          </p>
        </div>

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
                <p className="font-medium text-gray-900">
                  {index + 1}. {question.question}
                </p>
                <div className="mt-2 space-y-2">
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
                      {option.text}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Explication:</span>{" "}
                    {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Retry Button */}
        {!passed && (
          <Button
            onClick={handleRetry}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Reessayer
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
          {quiz.description && (
            <p className="mt-1 text-sm text-gray-500">{quiz.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5">
          <HelpCircle className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Current Question */}
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-lg font-medium text-gray-900">
          {currentQuestion.question}
        </p>
        <div className="mt-4 space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                selectedAnswers[currentQuestion.id] === option.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  selectedAnswers[currentQuestion.id] === option.id
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300",
                )}
              >
                {selectedAnswers[currentQuestion.id] === option.id && (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-gray-700">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Precedent
        </Button>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={
              Object.keys(selectedAnswers).length !== totalQuestions ||
              isSubmitting
            }
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isSubmitting ? "Envoi..." : "Terminer le quiz"}
          </Button>
        ) : (
          <Button
            onClick={() =>
              setCurrentQuestionIndex((i) =>
                Math.min(totalQuestions - 1, i + 1),
              )
            }
            disabled={!selectedAnswers[currentQuestion.id]}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}
