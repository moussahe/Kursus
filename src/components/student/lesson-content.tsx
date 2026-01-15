"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/(dashboard)/student/actions";
import { XP_REWARDS } from "@/lib/gamification";
import { sanitizeHtml } from "@/lib/sanitize";

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
    contentType: string;
    videoUrl: string | null;
  };
  childId: string;
  isCompleted: boolean;
}

export function LessonContent({
  lesson,
  childId,
  isCompleted: initialCompleted,
}: LessonContentProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const handleMarkComplete = () => {
    startTransition(async () => {
      const result = await markLessonComplete(lesson.id, childId);
      if (result.success) {
        setIsCompleted(true);
        if (result.xpEarned) {
          setXpEarned(result.xpEarned);
          setTimeout(() => setXpEarned(null), 3000);
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Video Content */}
      {lesson.contentType === "VIDEO" && lesson.videoUrl && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              src={lesson.videoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Text Content */}
      {lesson.content && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div
            className="prose prose-violet max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
          />
        </div>
      )}

      {/* Mark Complete Button */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Leçon terminée !</span>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-900">
                  Tu as fini cette lecon ?
                </p>
                <p className="text-sm text-gray-500">
                  Marque-la comme terminée pour gagner{" "}
                  <span className="font-medium text-violet-600">
                    +{XP_REWARDS.LESSON_COMPLETED} XP
                  </span>
                </p>
              </div>
            )}
          </div>

          {!isCompleted && (
            <Button
              onClick={handleMarkComplete}
              disabled={isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? (
                "Chargement..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Marquer comme terminée
                </>
              )}
            </Button>
          )}
        </div>

        {/* XP Animation */}
        {xpEarned && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white animate-in fade-in slide-in-from-bottom-4">
            <Zap className="h-5 w-5" />
            <span className="text-lg font-bold">+{xpEarned} XP gagnes !</span>
          </div>
        )}
      </div>
    </div>
  );
}
