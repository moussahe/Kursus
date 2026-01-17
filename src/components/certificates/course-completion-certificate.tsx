"use client";

import { useState } from "react";
import { Award, Download, Loader2, PartyPopper, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { GradeLevel, Subject } from "@prisma/client";

interface Certificate {
  id: string;
  certificateNumber: string;
  childName: string;
  courseName: string;
  teacherName: string;
  gradeLevel: GradeLevel;
  subject: Subject;
  completionDate: Date | string;
  totalLessons: number;
  lessonsCompleted: number;
  averageQuizScore: number | null;
  totalTimeSpent: number;
  verificationCode: string;
  verificationUrl: string | null;
  pdfUrl: string | null;
}

interface CourseCompletionCertificateProps {
  courseId: string;
  childId: string;
  progress: number;
  existingCertificate?: Certificate | null;
  className?: string;
}

export function CourseCompletionCertificate({
  courseId,
  childId,
  progress,
  existingCertificate,
  className,
}: CourseCompletionCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(
    existingCertificate ?? null,
  );

  const canGenerateCertificate = progress >= 80;

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, childId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la generation");
      }

      const newCertificate = await response.json();
      setCertificate(newCertificate);
      toast.success("Certificat genere avec succes ! +500 XP");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la generation",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    try {
      // Open the printable certificate in a new window
      window.open(`/api/certificates/${certificate.id}/pdf`, "_blank");
      toast.success("Certificat ouvert dans un nouvel onglet");
    } catch {
      toast.error("Impossible de telecharger le certificat");
    }
  };

  const handleShare = async () => {
    if (!certificate) return;

    const shareUrl =
      certificate.verificationUrl ||
      `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;

    const shareData = {
      title: `Certificat - ${certificate.courseName}`,
      text: `J'ai obtenu un certificat pour le cours "${certificate.courseName}" sur Kursus !`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Erreur lors du partage");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Lien copie dans le presse-papiers !");
      } catch {
        toast.error("Impossible de copier le lien");
      }
    }
  };

  // Not eligible for certificate yet
  if (!canGenerateCertificate) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center",
          className,
        )}
      >
        <Award className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 font-medium text-gray-600">Certificat</p>
        <p className="mt-1 text-sm text-gray-400">
          Complete au moins 80% du cours pour obtenir ton certificat
        </p>
        <div className="mt-3">
          <div className="text-xs text-gray-400">
            {Math.round(progress)}% / 80% requis
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gray-400 transition-all"
              style={{ width: `${Math.min((progress / 80) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Certificate already generated
  if (certificate) {
    return (
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6",
          className,
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Award className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">
              Certificat obtenu !
            </p>
            <p className="text-sm text-emerald-600">
              {certificate.certificateNumber}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-white hover:bg-emerald-50"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Telecharger
          </Button>
          <Button
            variant="outline"
            className="bg-white hover:bg-emerald-50"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Eligible but not yet generated
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
          <PartyPopper className="h-6 w-6 text-violet-600" />
        </div>
        <div>
          <p className="font-semibold text-violet-800">Felicitations !</p>
          <p className="text-sm text-violet-600">
            Tu peux maintenant obtenir ton certificat
          </p>
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        onClick={handleGenerateCertificate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generation en cours...
          </>
        ) : (
          <>
            <Award className="h-4 w-4 mr-2" />
            Obtenir mon certificat (+500 XP)
          </>
        )}
      </Button>
    </div>
  );
}
