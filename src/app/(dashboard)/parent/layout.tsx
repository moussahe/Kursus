import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ParentSidebar } from "@/components/parent/parent-sidebar";
import { ParentHeader } from "@/components/parent/parent-header";
import { ParentMobileNav } from "@/components/parent/parent-mobile-nav";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "PARENT") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <ParentSidebar user={session.user} />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <ParentHeader user={session.user} />

        {/* Mobile Navigation */}
        <ParentMobileNav user={session.user} />

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
