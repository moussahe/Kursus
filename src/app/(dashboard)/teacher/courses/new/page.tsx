import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CourseEditor } from "@/components/teacher/course-editor";

export default async function NewCoursePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Creer un nouveau cours
        </h1>
        <p className="mt-1 text-gray-500">
          Remplissez les informations pour creer votre cours
        </p>
      </div>

      <CourseEditor />
    </div>
  );
}
