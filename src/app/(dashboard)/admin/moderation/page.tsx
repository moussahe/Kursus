import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { ModerationStatus, Prisma } from "@prisma/client";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Star,
  Users,
  MessageSquare,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ModerationFilters } from "./moderation-filters";
import { ModerationActions } from "./moderation-actions";

export const metadata = {
  title: "Moderation | Admin Schoolaris",
  description: "Moderez et validez les cours de la plateforme",
};

interface SearchParams {
  status?: string;
  page?: string;
}

const STATUS_CONFIG: Record<
  ModerationStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING_REVIEW: {
    label: "En attente",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  APPROVED: {
    label: "Approuve",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejete",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  CHANGES_REQUESTED: {
    label: "Modifications demandees",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: AlertTriangle,
  },
};

const SUBJECT_LABELS: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

const GRADE_LABELS: Record<string, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "2nde",
  PREMIERE: "1ere",
  TERMINALE: "Terminale",
};

const VALID_STATUSES: ModerationStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
];

function isValidStatus(value: string): value is ModerationStatus {
  return VALID_STATUSES.includes(value as ModerationStatus);
}

async function getModerationData(searchParams: SearchParams) {
  const status = searchParams.status;
  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ContentModerationWhereInput = {
    ...(status && status !== "all" && isValidStatus(status) ? { status } : {}),
  };

  const [moderations, total, stats] = await Promise.all([
    prisma.contentModeration.findMany({
      where,
      include: {
        course: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                teacherProfile: {
                  select: { isVerified: true },
                },
              },
            },
            _count: {
              select: {
                chapters: true,
                purchases: true,
                reviews: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contentModeration.count({ where }),
    prisma.$transaction([
      prisma.contentModeration.count(),
      prisma.contentModeration.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.contentModeration.count({ where: { status: "APPROVED" } }),
      prisma.contentModeration.count({ where: { status: "REJECTED" } }),
      prisma.contentModeration.count({
        where: { status: "CHANGES_REQUESTED" },
      }),
    ]),
  ]);

  return {
    moderations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: stats[0],
      pending: stats[1],
      approved: stats[2],
      rejected: stats[3],
      changesRequested: stats[4],
    },
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("rounded-xl p-3", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ModerationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

async function ModerationContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { moderations, pagination, stats } =
    await getModerationData(searchParams);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total"
          value={stats.total}
          icon={FileText}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          title="Approuves"
          value={stats.approved}
          icon={CheckCircle}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          title="Rejetes"
          value={stats.rejected}
          icon={XCircle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
        <StatCard
          title="Modifications"
          value={stats.changesRequested}
          icon={AlertTriangle}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      {/* Filters */}
      <ModerationFilters currentStatus={searchParams.status || "all"} />

      {/* Moderation Queue */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            File de moderation ({pagination.total})
          </CardTitle>
          <CardDescription>
            Examinez et validez les cours avant publication
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {moderations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
              <p className="mt-4 text-lg font-medium">Tout est en ordre!</p>
              <p className="mt-1 text-muted-foreground">
                Aucun cours en attente de moderation
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {moderations.map((moderation) => {
                const statusConfig = STATUS_CONFIG[moderation.status];
                const StatusIcon = statusConfig.icon;
                const authorInitials = moderation.course.author.name
                  ? moderation.course.author.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?";

                return (
                  <div
                    key={moderation.id}
                    className="flex flex-col gap-4 p-4 hover:bg-muted/30 transition-colors lg:flex-row lg:items-center lg:justify-between"
                  >
                    {/* Course Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Course Image */}
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        {moderation.course.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={moderation.course.imageUrl}
                            alt={moderation.course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {moderation.course.title}
                          </h3>
                          <Badge className={cn("text-xs", statusConfig.color)}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {SUBJECT_LABELS[moderation.course.subject] ||
                              moderation.course.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {GRADE_LABELS[moderation.course.gradeLevel] ||
                              moderation.course.gradeLevel}
                          </Badge>
                          <span>{formatCurrency(moderation.course.price)}</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>
                            {moderation.course._count.chapters} chapitres
                          </span>
                        </div>

                        {/* Author */}
                        <div className="mt-2 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={moderation.course.author.image ?? undefined}
                              alt={moderation.course.author.name ?? "Author"}
                            />
                            <AvatarFallback className="text-xs">
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Par {moderation.course.author.name || "Inconnu"}
                          </span>
                          {moderation.course.author.teacherProfile
                            ?.isVerified && (
                            <Badge
                              variant="outline"
                              className="text-xs text-emerald-600 border-emerald-200"
                            >
                              Verifie
                            </Badge>
                          )}
                        </div>

                        {/* Submission time */}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Soumis{" "}
                          {formatDistanceToNow(moderation.submittedAt, {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col items-center">
                          <p className="flex items-center gap-1 font-semibold">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {moderation.course.totalStudents}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Élèves
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="flex items-center gap-1 font-semibold">
                            <Star className="h-3 w-3 text-amber-500" />
                            {moderation.course.averageRating.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Note</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="flex items-center gap-1 font-semibold">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            {moderation.course._count.reviews}
                          </p>
                          <p className="text-xs text-muted-foreground">Avis</p>
                        </div>
                      </div>

                      <ModerationActions
                        moderationId={moderation.id}
                        courseId={moderation.course.id}
                        courseSlug={moderation.course.slug}
                        currentStatus={moderation.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages} (
                {pagination.total} elements)
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <a
                    href={`/admin/moderation?page=${pagination.page - 1}&status=${searchParams.status || "all"}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Precedent
                  </a>
                )}
                {pagination.page < pagination.totalPages && (
                  <a
                    href={`/admin/moderation?page=${pagination.page + 1}&status=${searchParams.status || "all"}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Suivant
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Moderation du contenu
        </h1>
        <p className="mt-1 text-muted-foreground">
          Validez les cours avant publication sur la plateforme
        </p>
      </div>

      <Suspense fallback={<ModerationSkeleton />}>
        <ModerationContent searchParams={params} />
      </Suspense>
    </div>
  );
}
