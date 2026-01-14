"use client";

import { useState, useCallback } from "react";
import { HelpCircle, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface QuizOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

interface QuizQuestionHelpProps {
  questionText: string;
  options: QuizOption[];
  subject: string;
  gradeLevel: string;
  lessonTitle: string;
  lessonContent?: string;
  difficulty?: "easy" | "medium" | "hard";
  childId: string;
  className?: string;
  variant?: "button" | "icon";
}

export function QuizQuestionHelp({
  questionText,
  options,
  subject,
  gradeLevel,
  lessonTitle,
  lessonContent,
  difficulty,
  childId,
  className,
  variant = "button",
}: QuizQuestionHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHelp = useCallback(async () => {
    if (helpText) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/quiz-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          questionText,
          options: options.map((o) => ({ text: o.text })),
          subject,
          gradeLevel,
          lessonTitle,
          lessonContent,
          difficulty,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur de chargement");
      }

      const data = await response.json();
      setHelpText(data.help);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [
    childId,
    questionText,
    options,
    subject,
    gradeLevel,
    lessonTitle,
    lessonContent,
    difficulty,
    helpText,
  ]);

  const handleClick = () => {
    if (helpText) {
      setIsOpen(true);
    } else {
      fetchHelp();
    }
  };

  return (
    <>
      {variant === "button" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "gap-1.5 text-violet-600 hover:bg-violet-50 hover:text-violet-700",
            className,
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HelpCircle className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Aide IA</span>
        </Button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            "bg-violet-100 text-violet-600 hover:bg-violet-200",
            isLoading && "cursor-wait opacity-70",
            className,
          )}
          title="Demander de l'aide a l'IA"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HelpCircle className="h-4 w-4" />
          )}
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Aide de ton tuteur IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question context */}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">Question</p>
              <p className="mt-1 text-sm text-gray-700">{questionText}</p>
            </div>

            {/* AI Help */}
            {error ? (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchHelp}
                  className="mt-2"
                >
                  Reessayer
                </Button>
              </div>
            ) : helpText ? (
              <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {helpText}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                <p className="mt-2 text-sm text-gray-500">
                  Je reflechis a comment t&apos;aider...
                </p>
              </div>
            )}

            {/* Encouragement */}
            {helpText && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">
                  <span className="font-medium">Conseil:</span> Utilise ces
                  indices pour trouver la reponse par toi-meme. C&apos;est comme
                  ca que tu apprendras le mieux !
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
