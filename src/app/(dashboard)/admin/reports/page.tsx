import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type {
  ReportStatus,
  ReportType,
  ReportTargetType,
  Prisma,
} from "@prisma/client";
import {
  Flag,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  MessageSquare,
  BookOpen,
  User,
  FileText,
  AlertOctagon,
  Ban,
  Copyright,
  Info,
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
import { ReportsFilters } from "./reports-filters";
import { ReportActions } from "./report-actions";

export const metadata = {
  title: "Signalements | Admin Kursus",
  description: "Gerez les signalements de contenu et utilisateurs",
};

interface SearchParams {
  status?: string;
  type?: string;
  priority?: string;
  page?: string;
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "En attente",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Search,
  },
  RESOLVED: {
    label: "Resolu",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle,
  },
  DISMISSED: {
    label: "Rejete",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    icon: XCircle,
  },
  ESCALATED: {
    label: "Escalade",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: AlertTriangle,
  },
};

const TYPE_CONFIG: Record<
  ReportType,
  { label: string; icon: React.ElementType; color: string }
> = {
  INAPPROPRIATE_CONTENT: {
    label: "Contenu inapproprie",
    icon: AlertOctagon,
    color: "text-red-600",
  },
  SPAM: {
    label: "Spam",
    icon: Ban,
    color: "text-amber-600",
  },
  HARASSMENT: {
    label: "Harcelement",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  MISINFORMATION: {
    label: "Desinformation",
    icon: Info,
    color: "text-orange-600",
  },
  COPYRIGHT: {
    label: "Droits d'auteur",
    icon: Copyright,
    color: "text-blue-600",
  },
  SAFETY_CONCERN: {
    label: "Securite enfant",
    icon: Shield,
    color: "text-red-700",
  },
  OTHER: {
    label: "Autre",
    icon: Flag,
    color: "text-gray-600",
  },
};

const TARGET_CONFIG: Record<
  ReportTargetType,
  { label: string; icon: React.ElementType }
> = {
  COURSE: { label: "Cours", icon: BookOpen },
  LESSON: { label: "Leçon", icon: FileText },
  REVIEW: { label: "Avis", icon: MessageSquare },
  FORUM_TOPIC: { label: "Sujet forum", icon: MessageSquare },
  FORUM_REPLY: { label: "Reponse forum", icon: MessageSquare },
  USER: { label: "Utilisateur", icon: User },
  LIVE_SESSION: { label: "Session live", icon: MessageSquare },
};

const PRIORITY_CONFIG = {
  LOW: {
    label: "Faible",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
  MEDIUM: {
    label: "Moyen",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  HIGH: {
    label: "Urgent",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const VALID_STATUSES: ReportStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
  "ESCALATED",
];

const VALID_TYPES: ReportType[] = [
  "INAPPROPRIATE_CONTENT",
  "SPAM",
  "HARASSMENT",
  "MISINFORMATION",
  "COPYRIGHT",
  "SAFETY_CONCERN",
  "OTHER",
];

function isValidStatus(value: string): value is ReportStatus {
  return VALID_STATUSES.includes(value as ReportStatus);
}

function isValidType(value: string): value is ReportType {
  return VALID_TYPES.includes(value as ReportType);
}

async function getReportsData(searchParams: SearchParams) {
  const status = searchParams.status;
  const type = searchParams.type;
  const priority = searchParams.priority;
  const page = parseInt(searchParams.page || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: Prisma.ReportWhereInput = {
    ...(status && status !== "all" && isValidStatus(status) ? { status } : {}),
    ...(type && type !== "all" && isValidType(type) ? { type } : {}),
    ...(priority && priority !== "all"
      ? { priority: priority as "LOW" | "MEDIUM" | "HIGH" }
      : {}),
  };

  const [reports, total, stats] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
    prisma.$transaction([
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.report.count({ where: { priority: "HIGH", status: "PENDING" } }),
      prisma.report.count({
        where: { type: "SAFETY_CONCERN", status: "PENDING" },
      }),
    ]),
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: stats[0],
      pending: stats[1],
      underReview: stats[2],
      urgentPending: stats[3],
      safetyPending: stats[4],
    },
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  highlight,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-0 shadow-sm",
        highlight ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-card",
      )}
    >
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

function ReportsSkeleton() {
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

async function ReportsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { reports, pagination, stats } = await getReportsData(searchParams);

  return (
    <div className="space-y-6">
      {/* Warning Banner for Safety Concerns */}
      {stats.safetyPending > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <Shield className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">
              {stats.safetyPending} signalement(s) de securite enfant en attente
            </p>
            <p className="text-sm opacity-90">
              Ces signalements doivent etre traites en priorite absolue.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total"
          value={stats.total}
          icon={Flag}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          title="En cours"
          value={stats.underReview}
          icon={Search}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Urgents"
          value={stats.urgentPending}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          highlight={stats.urgentPending > 0}
        />
        <StatCard
          title="Securite enfant"
          value={stats.safetyPending}
          icon={Shield}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          highlight={stats.safetyPending > 0}
        />
      </div>

      {/* Filters */}
      <ReportsFilters
        currentStatus={searchParams.status || "all"}
        currentType={searchParams.type || "all"}
        currentPriority={searchParams.priority || "all"}
      />

      {/* Reports List */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-muted-foreground" />
            Signalements ({pagination.total})
          </CardTitle>
          <CardDescription>
            Examinez et traitez les signalements des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
              <p className="mt-4 text-lg font-medium">Aucun signalement</p>
              <p className="mt-1 text-muted-foreground">
                Tous les signalements ont ete traites
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {reports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status];
                const typeConfig = TYPE_CONFIG[report.type];
                const targetConfig = TARGET_CONFIG[report.targetType];
                const priorityConfig = PRIORITY_CONFIG[report.priority];
                const StatusIcon = statusConfig.icon;
                const TypeIcon = typeConfig.icon;
                const TargetIcon = targetConfig.icon;
                const reporterInitials = report.reporter.name
                  ? report.reporter.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?";

                return (
                  <div
                    key={report.id}
                    className={cn(
                      "flex flex-col gap-4 p-4 hover:bg-muted/30 transition-colors lg:flex-row lg:items-start lg:justify-between",
                      report.type === "SAFETY_CONCERN" &&
                        report.status === "PENDING" &&
                        "bg-red-50/50 dark:bg-red-900/10",
                    )}
                  >
                    {/* Report Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("text-xs", statusConfig.color)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={cn("text-xs", priorityConfig.color)}>
                          {priorityConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <TypeIcon
                            className={cn("mr-1 h-3 w-3", typeConfig.color)}
                          />
                          {typeConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <TargetIcon className="mr-1 h-3 w-3" />
                          {targetConfig.label}
                        </Badge>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-foreground line-clamp-2">
                        {report.reason}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {/* Reporter */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={report.reporter.image ?? undefined}
                              alt={report.reporter.name ?? "Reporter"}
                            />
                            <AvatarFallback className="text-[10px]">
                              {reporterInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            Signale par {report.reporter.name || "Anonyme"}
                          </span>
                        </div>
                        <span className="text-muted-foreground/50">|</span>
                        <span>
                          {formatDistanceToNow(report.createdAt, {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                        {report.assignedAdmin && (
                          <>
                            <span className="text-muted-foreground/50">|</span>
                            <span>Assigne a {report.assignedAdmin.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <ReportActions
                        reportId={report.id}
                        currentStatus={report.status}
                        targetType={report.targetType}
                        targetId={report.targetId}
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
                {pagination.total} signalements)
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <a
                    href={`/admin/reports?page=${pagination.page - 1}&status=${searchParams.status || "all"}&type=${searchParams.type || "all"}&priority=${searchParams.priority || "all"}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Precedent
                  </a>
                )}
                {pagination.page < pagination.totalPages && (
                  <a
                    href={`/admin/reports?page=${pagination.page + 1}&status=${searchParams.status || "all"}&type=${searchParams.type || "all"}&priority=${searchParams.priority || "all"}`}
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

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Signalements
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerez les signalements de contenu et les problèmes de securite
        </p>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
