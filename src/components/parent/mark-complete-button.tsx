"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface MarkCompleteButtonProps {
  lessonId: string;
  childId: string;
}

export function MarkCompleteButton({
  lessonId,
  childId,
}: MarkCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMarkComplete = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            childId,
            isCompleted: true,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Une erreur est survenue");
        }

        toast.success("Leçon marquee comme terminée !");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue",
        );
      }
    });
  };

  return (
    <Button
      onClick={handleMarkComplete}
      disabled={isPending}
      className="gap-2 bg-emerald-500 hover:bg-emerald-600"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Marquer comme termine
    </Button>
  );
}
