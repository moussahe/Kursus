import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { TeacherHeader } from "@/components/teacher/teacher-header";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <TeacherSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="lg:pl-64">
        <TeacherHeader user={session.user} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
