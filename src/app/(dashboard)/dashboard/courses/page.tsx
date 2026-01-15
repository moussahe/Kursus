import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardCoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on role
  if (session.user.role === "TEACHER") {
    redirect("/teacher/courses");
  }

  if (session.user.role === "PARENT") {
    redirect("/parent");
  }

  // For students/generic users, show their enrolled courses
  const purchases = await prisma.purchase.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    include: {
      course: {
        include: {
          author: true,
          chapters: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
  });

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
          <h1 className="text-3xl font-bold">Mes Cours</h1>
          <p className="text-gray-600">Retrouvez tous vos cours achetes ici.</p>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun cours pour le moment
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Decouvrez notre catalogue de cours crees par des enseignants
                certifies.
              </p>
              <Link href="/courses">
                <Button>Explorer les cours</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => {
              const course = purchase.course;
              const totalLessons = course.chapters.reduce(
                (acc, ch) => acc + ch.lessons.length,
                0,
              );

              return (
                <Link key={purchase.id} href={`/parent/courses/${course.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Par {course.author.name}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{totalLessons} leçons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.totalDuration}min</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
