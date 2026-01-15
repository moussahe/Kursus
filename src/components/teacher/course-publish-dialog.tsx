"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  GlobeLock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Chapter {
  id: string;
  title: string;
  isPublished: boolean;
  lessons: {
    id: string;
    title: string;
    isPublished: boolean;
  }[];
}

interface CoursePublishDialogProps {
  courseId: string;
  isPublished: boolean;
  courseTitle: string;
  courseDescription: string | null;
  courseImageUrl: string | null;
  learningOutcomes: string[];
  chapters: Chapter[];
}

interface ValidationResult {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

export function CoursePublishDialog({
  courseId,
  isPublished,
  courseTitle,
  courseDescription,
  courseImageUrl,
  learningOutcomes,
  chapters,
}: CoursePublishDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validations, setValidations] = useState<ValidationResult[]>([]);

  // Run validations when dialog opens
  const runValidations = useCallback(() => {
    const results: ValidationResult[] = [];

    // Check course title
    results.push({
      id: "title",
      label: "Titre du cours",
      status: courseTitle.length >= 5 ? "pass" : "fail",
      message:
        courseTitle.length >= 5
          ? "Titre renseigne"
          : "Le titre doit contenir au moins 5 caracteres",
    });

    // Check description
    results.push({
      id: "description",
      label: "Description",
      status: (courseDescription?.length ?? 0) >= 20 ? "pass" : "fail",
      message:
        (courseDescription?.length ?? 0) >= 20
          ? "Description complete"
          : "La description doit contenir au moins 20 caracteres",
    });

    // Check image
    results.push({
      id: "image",
      label: "Image de couverture",
      status: courseImageUrl ? "pass" : "warning",
      message: courseImageUrl
        ? "Image ajoutee"
        : "Recommande: ajoutez une image pour attirer plus d'élèves",
    });

    // Check learning outcomes
    results.push({
      id: "outcomes",
      label: "Objectifs d'apprentissage",
      status: learningOutcomes.length > 0 ? "pass" : "warning",
      message:
        learningOutcomes.length > 0
          ? `${learningOutcomes.length} objectif(s) defini(s)`
          : "Recommande: definissez ce que les élèves vont apprendre",
    });

    // Check chapters
    const totalChapters = chapters.length;
    const publishedChapters = chapters.filter((c) => c.isPublished).length;
    results.push({
      id: "chapters",
      label: "Chapitres",
      status: totalChapters > 0 ? "pass" : "fail",
      message:
        totalChapters > 0
          ? `${publishedChapters}/${totalChapters} chapitre(s) publie(s)`
          : "Ajoutez au moins un chapitre",
    });

    // Check lessons
    const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);
    const publishedLessons = chapters.reduce(
      (acc, c) => acc + c.lessons.filter((l) => l.isPublished).length,
      0,
    );
    results.push({
      id: "lessons",
      label: "Leçons",
      status: totalLessons > 0 ? "pass" : "fail",
      message:
        totalLessons > 0
          ? `${publishedLessons}/${totalLessons} lecon(s) publiee(s)`
          : "Ajoutez au moins une lecon",
    });

    // Check if at least one chapter has published lessons
    if (totalLessons > 0 && publishedLessons === 0) {
      results.push({
        id: "publishedContent",
        label: "Contenu visible",
        status: "warning",
        message: "Aucune lecon n'est publiee. Les élèves ne verront rien.",
      });
    }

    setValidations(results);
  }, [
    courseTitle,
    courseDescription,
    courseImageUrl,
    learningOutcomes,
    chapters,
  ]);

  useEffect(() => {
    if (open) {
      runValidations();
    }
  }, [open, runValidations]);

  const hasBlockingErrors = validations.some((v) => v.status === "fail");
  const hasWarnings = validations.some((v) => v.status === "warning");

  const handlePublish = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      toast.success(
        isPublished
          ? "Cours depublie avec succes"
          : "Cours publie avec succes! Il est maintenant visible dans le catalogue.",
      );
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: ValidationResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "rounded-xl",
            isPublished
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-emerald-500 hover:bg-emerald-600",
          )}
        >
          {isPublished ? (
            <>
              <GlobeLock className="mr-2 h-4 w-4" />
              Depublier
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Publier
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPublished ? (
              <>
                <GlobeLock className="h-5 w-5 text-amber-500" />
                Depublier le cours
              </>
            ) : (
              <>
                <Globe className="h-5 w-5 text-emerald-500" />
                Publier le cours
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPublished
              ? "Le cours ne sera plus visible dans le catalogue. Les élèves inscrits garderont leur acces."
              : "Verifiez que votre cours est pret avant de le publier."}
          </DialogDescription>
        </DialogHeader>

        {/* Validation Checklist */}
        {!isPublished && (
          <div className="space-y-3 py-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ListChecks className="h-4 w-4" />
              Verification pre-publication
            </h4>
            <div className="space-y-2">
              {validations.map((validation) => (
                <div
                  key={validation.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3",
                    validation.status === "pass" && "bg-emerald-50",
                    validation.status === "fail" && "bg-red-50",
                    validation.status === "warning" && "bg-amber-50",
                  )}
                >
                  {getStatusIcon(validation.status)}
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        validation.status === "pass" && "text-emerald-700",
                        validation.status === "fail" && "text-red-700",
                        validation.status === "warning" && "text-amber-700",
                      )}
                    >
                      {validation.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        validation.status === "pass" && "text-emerald-600",
                        validation.status === "fail" && "text-red-600",
                        validation.status === "warning" && "text-amber-600",
                      )}
                    >
                      {validation.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {hasBlockingErrors && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">
                  Corrigez les erreurs avant de publier
                </p>
                <p className="text-xs text-red-600">
                  Les elements marques en rouge doivent etre completes.
                </p>
              </div>
            )}

            {!hasBlockingErrors && hasWarnings && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-700">
                  Pret a publier avec des recommandations
                </p>
                <p className="text-xs text-amber-600">
                  Les elements en orange sont optionnels mais recommandes.
                </p>
              </div>
            )}

            {!hasBlockingErrors && !hasWarnings && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-medium text-emerald-700">
                  Votre cours est pret a etre publie!
                </p>
                <p className="text-xs text-emerald-600">
                  Tous les criteres sont remplis.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSubmitting || (!isPublished && hasBlockingErrors)}
            className={cn(
              "rounded-xl",
              isPublished
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-emerald-500 hover:bg-emerald-600",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPublished ? "Depublication..." : "Publication..."}
              </>
            ) : isPublished ? (
              <>
                <GlobeLock className="mr-2 h-4 w-4" />
                Confirmer la depublication
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Publier le cours
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
