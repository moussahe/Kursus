import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  DollarSign,
  Shield,
  Bell,
  Mail,
  Globe,
  Database,
  Users,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformSettingsForm } from "./platform-settings-form";
import { SecuritySettingsForm } from "./security-settings-form";
import { NotificationSettingsForm } from "./notification-settings-form";

export const metadata = {
  title: "Parametres | Admin Kursus",
  description: "Configuration de la plateforme Kursus",
};

async function getPlatformStats() {
  const [
    totalUsers,
    totalCourses,
    totalPurchases,
    totalRevenue,
    pendingModerations,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.contentModeration.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalUsers,
    totalCourses,
    totalPurchases,
    totalRevenue: totalRevenue._sum.amount || 0,
    pendingModerations,
    pendingReports,
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

async function SettingsContent() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="rounded-2xl border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Etat de la plateforme</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-xl bg-white/20 p-4 text-center">
              <Users className="mx-auto h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs opacity-90">Utilisateurs</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4 text-center">
              <Database className="mx-auto h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
              <p className="text-xs opacity-90">Cours</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4 text-center">
              <CreditCard className="mx-auto h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.totalPurchases}</p>
              <p className="text-xs opacity-90">Ventes</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4 text-center">
              <DollarSign className="mx-auto h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs opacity-90">CA Total</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4 text-center">
              <Shield className="mx-auto h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.pendingModerations}</p>
              <p className="text-xs opacity-90">Moderations</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4 text-center">
              <Bell className="mx-auto h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.pendingReports}</p>
              <p className="text-xs opacity-90">Signalements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Settings */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Parametres de la plateforme
            </CardTitle>
            <CardDescription>Configuration générale de Kursus</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformSettingsForm />
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Securite & RGPD
            </CardTitle>
            <CardDescription>
              Protection des donnees et conformite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SecuritySettingsForm />
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Notifications système
          </CardTitle>
          <CardDescription>
            Configuration des alertes et emails automatiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettingsForm />
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold">Emails</h4>
                <p className="text-sm text-muted-foreground">
                  Configure via Resend
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
                <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="font-semibold">Paiements</h4>
                <p className="text-sm text-muted-foreground">
                  Configure via Stripe
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
                <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold">Base de donnees</h4>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL via Supabase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Parametres
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configuration et parametres de la plateforme
        </p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
