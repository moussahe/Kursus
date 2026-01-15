import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  GraduationCap,
  UserCheck,
  MoreHorizontal,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  UserCog,
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
import { UsersFilters } from "./users-filters";

export const metadata = {
  title: "Gestion des utilisateurs | Admin Schoolaris",
  description: "Gerer les utilisateurs de la plateforme Schoolaris",
};

interface SearchParams {
  role?: string;
  search?: string;
  page?: string;
}

async function getUsersData(searchParams: SearchParams) {
  const role = searchParams.role;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(role && role !== "all"
      ? { role: role as "PARENT" | "TEACHER" | "ADMIN" }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total, stats] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            children: true,
            courses: true,
            purchases: true,
          },
        },
        teacherProfile: {
          select: {
            isVerified: true,
            totalStudents: true,
            totalRevenue: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
    prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: "PARENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: stats[0],
      parents: stats[1],
      teachers: stats[2],
      admins: stats[3],
    },
  };
}

const roleConfig = {
  PARENT: {
    label: "Parent",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Users,
  },
  TEACHER: {
    label: "Enseignant",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: GraduationCap,
  },
  ADMIN: {
    label: "Admin",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: ShieldCheck,
  },
};

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

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

async function UsersContent({ searchParams }: { searchParams: SearchParams }) {
  const { users, pagination, stats } = await getUsersData(searchParams);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total utilisateurs"
          value={stats.total}
          icon={Users}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Parents"
          value={stats.parents}
          icon={UserCheck}
          color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        />
        <StatCard
          title="Enseignants"
          value={stats.teachers}
          icon={GraduationCap}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          title="Administrateurs"
          value={stats.admins}
          icon={Shield}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      {/* Filters */}
      <UsersFilters
        currentRole={searchParams.role || "all"}
        currentSearch={searchParams.search || ""}
      />

      {/* Users Table */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            Utilisateurs ({pagination.total})
          </CardTitle>
          <CardDescription>
            Gerez les comptes utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Aucun utilisateur trouve
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {users.map((user) => {
                const config = roleConfig[user.role];
                const RoleIcon = config.icon;
                const initials = user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?";

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.image ?? undefined}
                          alt={user.name ?? "User"}
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {user.name || "Sans nom"}
                          </p>
                          <Badge className={cn("text-xs", config.color)}>
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                          {user.teacherProfile?.isVerified && (
                            <Badge
                              variant="outline"
                              className="text-xs text-emerald-600 border-emerald-200"
                            >
                              Verifie
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(user.createdAt, {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats based on role */}
                      {user.role === "PARENT" && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">
                              {user._count.children}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Enfants
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">
                              {user._count.purchases}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Achats
                            </p>
                          </div>
                        </div>
                      )}
                      {user.role === "TEACHER" && user.teacherProfile && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">
                              {user._count.courses}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cours
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">
                              {user.teacherProfile.totalStudents}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Élèves
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-emerald-600">
                              {formatCurrency(user.teacherProfile.totalRevenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Revenus
                            </p>
                          </div>
                        </div>
                      )}

                      <button className="rounded-lg p-2 hover:bg-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
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
                {pagination.total} utilisateurs)
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <a
                    href={`/admin/users?page=${pagination.page - 1}&role=${searchParams.role || "all"}&search=${searchParams.search || ""}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Precedent
                  </a>
                )}
                {pagination.page < pagination.totalPages && (
                  <a
                    href={`/admin/users?page=${pagination.page + 1}&role=${searchParams.role || "all"}&search=${searchParams.search || ""}`}
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Gestion des utilisateurs
        </h1>
        <p className="mt-1 text-muted-foreground">
          Visualisez et gerez tous les comptes de la plateforme
        </p>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersContent searchParams={params} />
      </Suspense>
    </div>
  );
}
