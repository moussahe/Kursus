import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PurchaseCard } from "@/components/parent/purchase-card";
import { PurchaseFilters } from "@/components/parent/purchase-filters";

interface PageProps {
  searchParams: Promise<{
    childId?: string;
    status?: string;
  }>;
}

async function getPurchases(userId: string, childId?: string, status?: string) {
  const whereClause: Record<string, unknown> = {
    userId,
  };

  if (childId) {
    whereClause.childId = childId;
  }

  if (status) {
    whereClause.status = status;
  }

  const purchases = await prisma.purchase.findMany({
    where: whereClause,
    include: {
      course: {
        include: {
          author: {
            select: { name: true },
          },
        },
      },
      child: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return purchases;
}

async function getChildren(userId: string) {
  return prisma.child.findMany({
    where: { parentId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { firstName: "asc" },
  });
}

function PurchasesListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl" />
      ))}
    </div>
  );
}

async function PurchasesList({
  userId,
  childId,
  status,
}: {
  userId: string;
  childId?: string;
  status?: string;
}) {
  const purchases = await getPurchases(userId, childId, status);

  if (purchases.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Aucun achat trouve
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {childId || status
            ? "Aucun achat ne correspond a vos criteres de recherche."
            : "Vous n'avez pas encore effectue d'achat."}
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalSpent = purchases
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total des achats</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {purchases.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Achats completes</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {purchases.filter((p) => p.status === "COMPLETED").length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total depense</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(totalSpent / 100)}
          </p>
        </div>
      </div>

      {/* Purchases List */}
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={{
              ...purchase,
              createdAt: purchase.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default async function PurchasesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const children = await getChildren(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Achats</h1>
          <p className="mt-1 text-gray-500">
            Consultez l&apos;historique de vos achats et telechargez vos
            factures.
          </p>
        </div>
      </div>

      {/* Filters */}
      <PurchaseFilters
        childrenList={children}
        currentChildId={resolvedParams.childId}
        currentStatus={resolvedParams.status}
      />

      {/* Purchases List */}
      <Suspense fallback={<PurchasesListSkeleton />}>
        <PurchasesList
          userId={userId}
          childId={resolvedParams.childId}
          status={resolvedParams.status}
        />
      </Suspense>
    </div>
  );
}
