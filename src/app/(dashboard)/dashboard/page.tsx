import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  User,
  LogOut,
  GraduationCap,
  BarChart,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Kursus Brand Colors
const KURSUS = {
  orange: "#ff6d38",
  lime: "#c7ff69",
  purple: "#7a78ff",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to role-specific dashboard
  if (session.user.role === "PARENT") {
    redirect("/parent");
  }

  if (session.user.role === "TEACHER") {
    redirect("/teacher");
  }

  // For STUDENT role (direct student accounts, not children)
  // they would see their own courses
  const quickActions = [
    {
      icon: GraduationCap,
      title: "Mes Cours",
      description: "Acceder a vos cours et leçons",
      href: "/dashboard/courses",
      color: KURSUS.orange,
    },
    {
      icon: BarChart,
      title: "Ma Progression",
      description: "Voir vos statistiques",
      href: "/dashboard/progress",
      color: KURSUS.purple,
    },
    {
      icon: Settings,
      title: "Parametres",
      description: "Gerer votre compte",
      href: "/dashboard/settings",
      color: KURSUS.lime,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--kursus-bg)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: KURSUS.orange }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--kursus-text)]">
              Kursus
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[var(--kursus-text-muted)]" />
              <span className="text-sm font-medium text-[var(--kursus-text)]">
                {session.user.name}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-[var(--kursus-text-muted)] hover:bg-[var(--kursus-bg)] hover:text-[var(--kursus-text)]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Deconnexion
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--kursus-bg-elevated)] px-3 py-1">
            <Sparkles className="h-4 w-4" style={{ color: KURSUS.orange }} />
            <span className="text-sm text-[var(--kursus-text-muted)]">
              Dashboard Etudiant
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--kursus-text)]">
            Bonjour, {session.user.name?.split(" ")[0]} !
          </h1>
          <p className="text-[var(--kursus-text-muted)]">
            Bienvenue sur votre tableau de bord Kursus.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-6 transition-all hover:border-[var(--kursus-text-muted)]/30 hover:shadow-lg">
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${action.color}20` }}
                >
                  <action.icon
                    className="h-6 w-6"
                    style={{ color: action.color }}
                  />
                </div>
                <h3 className="text-lg font-bold text-[var(--kursus-text)]">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity placeholder */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-[var(--kursus-text)]">
            Activite recente
          </h2>
          <div className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-[var(--kursus-text-muted)]" />
            <p className="text-[var(--kursus-text-muted)]">
              Aucune activité recente. Commencez par explorer nos cours !
            </p>
            <Button
              asChild
              className="mt-4 rounded-xl text-black"
              style={{ background: KURSUS.orange }}
            >
              <Link href="/courses">Explorer les cours</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
