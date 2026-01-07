import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, Eye, Globe, GlobeLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseEditForm } from "@/components/teacher/course-edit-form";
import { ChapterList } from "@/components/teacher/chapter-list";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check ownership
  if (course.authorId !== session.user.id) {
    redirect("/teacher/courses");
  }

  const learningOutcomes = (course.learningOutcomes as string[]) ?? [];
  const requirements = (course.requirements as string[]) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/teacher/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl line-clamp-1">
                {course.title}
              </h1>
              <Badge
                className={
                  course.isPublished
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                }
              >
                {course.isPublished ? (
                  <>
                    <Globe className="mr-1 h-3 w-3" />
                    Publie
                  </>
                ) : (
                  <>
                    <GlobeLock className="mr-1 h-3 w-3" />
                    Brouillon
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Modifiez les details et le contenu de votre cours
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/courses/${course.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Voir le cours
            </Link>
          </Button>
          <CoursePublishButton
            courseId={course.id}
            isPublished={course.isPublished}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="rounded-xl bg-gray-100 p-1">
          <TabsTrigger value="content" className="rounded-lg">
            Contenu
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">
            Parametres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <ChapterList courseId={course.id} chapters={course.chapters} />
        </TabsContent>

        <TabsContent value="settings">
          <CourseEditForm
            course={{
              id: course.id,
              title: course.title,
              subtitle: course.subtitle ?? "",
              description: course.description ?? "",
              subject: course.subject,
              gradeLevel: course.gradeLevel,
              price: course.price / 100, // Convert from cents
              imageUrl: course.imageUrl ?? "",
              learningOutcomes: learningOutcomes.map((v) => ({ value: v })),
              requirements: requirements.map((v) => ({ value: v })),
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Publish button component
function CoursePublishButton({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        const { auth } = await import("@/lib/auth");
        const { prisma } = await import("@/lib/prisma");
        const { revalidatePath } = await import("next/cache");

        const session = await auth();
        if (!session?.user) return;

        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { authorId: true },
        });

        if (course?.authorId !== session.user.id) return;

        await prisma.course.update({
          where: { id: courseId },
          data: {
            isPublished: !isPublished,
            publishedAt: !isPublished ? new Date() : null,
          },
        });

        revalidatePath(`/teacher/courses/${courseId}`);
      }}
    >
      <Button
        type="submit"
        className={`rounded-xl ${
          isPublished
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        {isPublished ? (
          <>
            <GlobeLock className="mr-2 h-4 w-4" />
            Depublier
          </>
        ) : (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Publier
          </>
        )}
      </Button>
    </form>
  );
}
