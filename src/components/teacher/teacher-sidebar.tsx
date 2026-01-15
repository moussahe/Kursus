"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Tableau de bord",
    href: "/teacher",
    icon: LayoutDashboard,
  },
  {
    name: "Mes cours",
    href: "/teacher/courses",
    icon: GraduationCap,
  },
  {
    name: "Mes étudiants",
    href: "/teacher/students",
    icon: Users,
  },
  {
    name: "Analytiques",
    href: "/teacher/analytics",
    icon: BarChart3,
  },
  {
    name: "Parametres",
    href: "/teacher/settings",
    icon: Settings,
  },
];

interface TeacherSidebarProps {
  className?: string;
}

export function TeacherSidebar({ className }: TeacherSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <BookOpen className="h-8 w-8 text-emerald-500" />
        <span className="text-xl font-bold text-foreground">Schoolaris</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/teacher" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
          Deconnexion
        </Button>
      </div>
    </aside>
  );
}
