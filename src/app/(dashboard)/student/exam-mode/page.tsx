import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamSession } from "@/components/exam";

async function getChildData(childId: string) {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: {
      id: true,
      firstName: true,
      gradeLevel: true,
      xp: true,
      level: true,
    },
  });

  return child;
}

function ExamModeSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

async function ExamModeContent({ childId }: { childId: string }) {
  const child = await getChildData(childId);

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">Erreur de chargement des donnees.</p>
      </div>
    );
  }

  // Check if exam mode is available for this grade
  const isBrevetGrade = child.gradeLevel === "TROISIEME";
  const isBacGrade =
    child.gradeLevel === "PREMIERE" || child.gradeLevel === "TERMINALE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/student">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Mode Revision Examen
            </h1>
            <p className="text-sm text-gray-500">
              Entraine-toi dans les conditions reelles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>{child.xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {isBrevetGrade
                  ? "Preparation au Brevet"
                  : isBacGrade
                    ? "Preparation au Baccalaureat"
                    : "Entrainement Personnalise"}
              </h2>
              <p className="text-sm text-amber-100">
                Questions generees par IA • Correction detaillee • Conseils
                personnalises
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Chronometre</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Adaptatif</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Programme officiel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">Format Officiel</h3>
          <p className="mt-1 text-sm text-gray-500">
            Questions au format exact des examens nationaux francais
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">Correction IA</h3>
          <p className="mt-1 text-sm text-gray-500">
            Feedback detaille avec explications pedagogiques
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Trophy className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">Gagne des XP</h3>
          <p className="mt-1 text-sm text-gray-500">
            Jusqu&apos;a 150 XP bonus pour un score parfait!
          </p>
        </div>
      </div>

      {/* Exam Session Component */}
      <ExamSession
        childId={child.id}
        childGrade={child.gradeLevel}
        onComplete={(result) => {
          // Result is handled in component, could add analytics here
          console.log("Exam completed:", result.percentage);
        }}
      />

      {/* Tips */}
      <div className="rounded-2xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Conseils pour reussir</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-amber-500" />
            <span>
              <strong>Gere ton temps:</strong> Ne reste pas bloque sur une
              question, passe a la suivante et reviens si tu as le temps.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 text-blue-500" />
            <span>
              <strong>Lis bien l&apos;enonce:</strong> Prends le temps de
              comprendre ce qui est demande avant de repondre.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 text-emerald-500" />
            <span>
              <strong>Verifie tes réponses:</strong> Si tu as le temps, relis
              tes réponses avant de terminer.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default async function ExamModePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const selectedChildId = cookieStore.get("selectedChildId")?.value;

  let childId = selectedChildId;
  if (!childId) {
    const firstChild = await prisma.child.findFirst({
      where: { parentId: session.user.id },
      select: { id: true },
    });
    childId = firstChild?.id;
  }

  if (!childId) {
    redirect("/parent/children?message=add_child_first");
  }

  return (
    <Suspense fallback={<ExamModeSkeleton />}>
      <ExamModeContent childId={childId} />
    </Suspense>
  );
}
