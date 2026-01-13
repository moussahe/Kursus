"use client";

import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { CertificateCard } from "./certificate-card";
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

interface CertificateListProps {
  certificates: Certificate[];
  className?: string;
  compact?: boolean;
  emptyMessage?: string;
}

export function CertificateList({
  certificates,
  className,
  compact = false,
  emptyMessage = "Aucun certificat pour le moment",
}: CertificateListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (certificate: Certificate) => {
    setDownloadingId(certificate.id);
    try {
      // Generate and download PDF
      const response = await fetch(`/api/certificates/${certificate.id}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la generation du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificat-${certificate.certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Certificat telecharge !");
    } catch {
      toast.error("Impossible de telecharger le certificat");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = async (certificate: Certificate) => {
    const shareUrl =
      certificate.verificationUrl ||
      `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;

    const shareData = {
      title: `Certificat - ${certificate.courseName}`,
      text: `${certificate.childName} a obtenu un certificat de completion pour le cours "${certificate.courseName}" sur Schoolaris !`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Certificat partage !");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Erreur lors du partage");
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Lien copie dans le presse-papiers !");
      } catch {
        toast.error("Impossible de copier le lien");
      }
    }
  };

  if (certificates.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border bg-white py-12 text-gray-400",
          className,
        )}
      >
        <Award className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
        <p className="text-xs mt-1 max-w-xs text-center">
          Complete des cours pour obtenir des certificats !
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        compact ? "space-y-2" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {certificates.map((certificate) => (
        <div key={certificate.id} className="relative">
          {downloadingId === certificate.id && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <CertificateCard
            certificate={certificate}
            compact={compact}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>
      ))}
    </div>
  );
}
