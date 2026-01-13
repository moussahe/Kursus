"use client";

import { cn } from "@/lib/utils";
import {
  Award,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatGradeLevel,
  formatSubject,
  formatCertificateDate,
  formatDuration,
} from "@/lib/certificate-utils";
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

interface CertificateCardProps {
  certificate: Certificate;
  className?: string;
  compact?: boolean;
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
}

const subjectColors: Record<string, string> = {
  MATHEMATIQUES: "from-blue-500 to-indigo-600",
  FRANCAIS: "from-amber-500 to-orange-600",
  HISTOIRE_GEO: "from-emerald-500 to-teal-600",
  SCIENCES: "from-cyan-500 to-blue-600",
  ANGLAIS: "from-rose-500 to-pink-600",
  PHYSIQUE_CHIMIE: "from-violet-500 to-purple-600",
  SVT: "from-green-500 to-emerald-600",
  PHILOSOPHIE: "from-slate-500 to-gray-600",
  ESPAGNOL: "from-red-500 to-rose-600",
  ALLEMAND: "from-yellow-500 to-amber-600",
  SES: "from-fuchsia-500 to-pink-600",
  NSI: "from-indigo-500 to-blue-600",
};

export function CertificateCard({
  certificate,
  className,
  compact = false,
  onDownload,
  onShare,
}: CertificateCardProps) {
  const gradientClass =
    subjectColors[certificate.subject] || "from-gray-500 to-slate-600";
  const completionDate =
    typeof certificate.completionDate === "string"
      ? new Date(certificate.completionDate)
      : certificate.completionDate;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
          className,
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
            gradientClass,
          )}
        >
          <Award className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {certificate.courseName}
          </p>
          <p className="text-xs text-gray-500">
            {formatCertificateDate(completionDate)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload?.(certificate)}
          title="Telecharger le certificat"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-md transition-all hover:shadow-lg",
        className,
      )}
    >
      {/* Header with gradient */}
      <div className={cn("bg-gradient-to-br p-6 text-white", gradientClass)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">
                Certificat de completion
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{certificate.courseName}</h3>
            <p className="text-sm opacity-90">{certificate.childName}</p>
          </div>
          <div className="text-right text-sm opacity-80">
            <p>{certificate.certificateNumber}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {certificate.lessonsCompleted}/{certificate.totalLessons}
            </p>
            <p className="text-xs text-gray-500">Lecons</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 mb-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {certificate.averageQuizScore !== null
                ? `${Math.round(certificate.averageQuizScore)}%`
                : "N/A"}
            </p>
            <p className="text-xs text-gray-500">Score Quiz</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 mb-2">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatDuration(certificate.totalTimeSpent)}
            </p>
            <p className="text-xs text-gray-500">Temps</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="flex items-center gap-2 text-gray-500">
              <BookOpen className="h-4 w-4" />
              Matiere
            </span>
            <span className="font-medium text-gray-900">
              {formatSubject(certificate.subject)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="flex items-center gap-2 text-gray-500">
              <GraduationCap className="h-4 w-4" />
              Niveau
            </span>
            <span className="font-medium text-gray-900">
              {formatGradeLevel(certificate.gradeLevel)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              Date
            </span>
            <span className="font-medium text-gray-900">
              {formatCertificateDate(completionDate)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500">Enseignant</span>
            <span className="font-medium text-gray-900">
              {certificate.teacherName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onDownload?.(certificate)}
          >
            <Download className="h-4 w-4 mr-2" />
            Telecharger PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onShare?.(certificate)}
            title="Partager le certificat"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {certificate.verificationUrl && (
            <Button variant="outline" asChild title="Verifier le certificat">
              <a
                href={certificate.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Verification code */}
        <div className="text-center text-xs text-gray-400 pt-2">
          Code de verification: {certificate.verificationCode}
        </div>
      </div>
    </div>
  );
}
