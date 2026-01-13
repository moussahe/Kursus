import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Award } from "lucide-react";
import { CertificateList } from "@/components/certificates/certificate-list";
import { Skeleton } from "@/components/ui/skeleton";

async function getCertificates(childId: string) {
  const certificates = await prisma.certificate.findMany({
    where: { childId },
    orderBy: { completionDate: "desc" },
  });

  return certificates;
}

function CertificatesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

async function CertificatesContent({ childId }: { childId: string }) {
  const certificates = await getCertificates(childId);

  return (
    <CertificateList
      certificates={certificates}
      emptyMessage="Tu n'as pas encore de certificat"
    />
  );
}

export default async function StudentCertificatesPage() {
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

  // Get child info for display
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { firstName: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            Mes Certificats
          </h1>
          <p className="mt-1 text-gray-500">
            Tous les certificats obtenus par {child?.firstName ?? "l'eleve"}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <Award className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">
              Comment obtenir un certificat ?
            </p>
            <p className="mt-1 text-sm text-amber-600">
              Complete au moins 80% des lecons d&apos;un cours pour debloquer
              ton certificat. Les certificats peuvent etre telecharges et
              partages !
            </p>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <Suspense fallback={<CertificatesSkeleton />}>
        <CertificatesContent childId={childId} />
      </Suspense>
    </div>
  );
}
