import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  BookOpen,
  User,
} from "lucide-react";
import {
  formatGradeLevel,
  formatSubject,
  formatCertificateDate,
  formatDuration,
} from "@/lib/certificate-utils";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

async function getCertificate(verificationCode: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode },
    select: {
      id: true,
      certificateNumber: true,
      childName: true,
      courseName: true,
      teacherName: true,
      gradeLevel: true,
      subject: true,
      completionDate: true,
      totalLessons: true,
      lessonsCompleted: true,
      averageQuizScore: true,
      totalTimeSpent: true,
      createdAt: true,
    },
  });

  return certificate;
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { code } = await params;
  const certificate = await getCertificate(code);

  if (!certificate) {
    notFound();
  }

  const formattedDate = formatCertificateDate(certificate.completionDate);
  const formattedGrade = formatGradeLevel(certificate.gradeLevel);
  const formattedSubject = formatSubject(certificate.subject);
  const formattedDuration = formatDuration(certificate.totalTimeSpent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Kursus</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Verification Status */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Certificat verifie</span>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-8 text-white text-center">
              <Award className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">
                Certificat de Completion
              </h1>
              <p className="text-violet-100">{certificate.certificateNumber}</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Student Name */}
              <div className="text-center mb-8">
                <p className="text-gray-500 mb-1">Decerne a</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {certificate.childName}
                </h2>
              </div>

              {/* Course Name */}
              <div className="text-center mb-8">
                <p className="text-gray-500 mb-1">Pour avoir complete</p>
                <h3 className="text-xl font-semibold text-violet-600">
                  {certificate.courseName}
                </h3>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">Matiere</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formattedSubject}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-sm">Niveau</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formattedGrade}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Leçons completees</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {certificate.lessonsCompleted}/{certificate.totalLessons}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Temps d&apos;etude</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formattedDuration}
                  </p>
                </div>
              </div>

              {/* Quiz Score */}
              {certificate.averageQuizScore !== null && (
                <div className="text-center mb-8">
                  <p className="text-gray-500 mb-1">Score moyen aux quiz</p>
                  <p className="text-4xl font-bold text-violet-600">
                    {Math.round(certificate.averageQuizScore)}%
                  </p>
                </div>
              )}

              {/* Footer Info */}
              <div className="border-t pt-6 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Enseignant: {certificate.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Ce certificat a ete delivre par Kursus, plateforme educative en
              ligne.
            </p>
            <p className="mt-1">
              La verification de ce certificat confirme son authenticite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
