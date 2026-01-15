import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Clock, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardProgressPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect parents to their dashboard
  if (session.user.role === "PARENT") {
    redirect("/parent");
  }

  // Mock stats for now
  const stats = {
    totalXP: 1250,
    streak: 7,
    coursesCompleted: 2,
    totalTimeSpent: 480, // minutes
    weeklyGoal: 300,
    weeklyProgress: 210,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Ma Progression</h1>
          <p className="text-gray-600">
            Suivez vos statistiques et votre progression.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                XP Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="h-8 w-8 text-amber-500" />
                <span className="text-3xl font-bold">{stats.totalXP}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Serie en cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <span className="text-3xl font-bold">{stats.streak} jours</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Cours termines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-8 w-8 text-emerald-500" />
                <span className="text-3xl font-bold">
                  {stats.coursesCompleted}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Temps total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-blue-500" />
                <span className="text-3xl font-bold">
                  {Math.floor(stats.totalTimeSpent / 60)}h
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Goal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Objectif hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {stats.weeklyProgress} / {stats.weeklyGoal} minutes
                </span>
                <span className="font-medium">
                  {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
                </span>
              </div>
              <Progress
                value={(stats.weeklyProgress / stats.weeklyGoal) * 100}
                className="h-3"
              />
              <p className="text-sm text-gray-500">
                Plus que {stats.weeklyGoal - stats.weeklyProgress} minutes pour
                atteindre votre objectif cette semaine !
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activity placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Activite recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Votre activité apparaitra ici</p>
              <p className="text-sm">
                Commencez un cours pour voir votre progression
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
