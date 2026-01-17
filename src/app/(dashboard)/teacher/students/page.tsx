import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentInsightsDashboard } from "@/components/teacher/student-insights-dashboard";

export const metadata = {
  title: "Mes Étudiants | Kursus",
  description:
    "Suivez la progression de vos étudiants et obtenez des insights IA personnalises",
};

export default async function TeacherStudentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Mes Étudiants
        </h1>
        <p className="mt-1 text-gray-500">
          Suivez la progression de vos étudiants et obtenez des insights IA
          personnalises
        </p>
      </div>

      <StudentInsightsDashboard />
    </div>
  );
}
