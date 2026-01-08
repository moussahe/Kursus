import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import {
  BookOpen,
  User,
  LogOut,
  GraduationCap,
  BarChart,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const quickActions = [
    {
      icon: GraduationCap,
      title: "Mes Cours",
      description: "Acceder a vos cours et lecons",
      href: "/dashboard/courses" as Route,
    },
    {
      icon: BarChart,
      title: "Ma Progression",
      description: "Voir vos statistiques",
      href: "/dashboard/progress" as Route,
    },
    {
      icon: Settings,
      title: "Parametres",
      description: "Gerer votre compte",
      href: "/dashboard/settings" as Route,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Schoolaris</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">{session.user.name}</span>
            </div>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
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
          <h1 className="text-3xl font-bold">
            Bonjour, {session.user.name?.split(" ")[0]} !
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord Schoolaris.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <action.icon className="mb-2 h-10 w-10 text-blue-600" />
                  <CardTitle>{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity placeholder */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Activite recente</h2>
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Aucune activite recente. Commencez par explorer nos cours !
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
