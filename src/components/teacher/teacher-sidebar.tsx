"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Kursus Brand Colors
const KURSUS = {
  orange: "#ff6d38",
  lime: "#c7ff69",
  purple: "#7a78ff",
};

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
    name: "Mes etudiants",
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
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--kursus-border)] px-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: KURSUS.orange }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-[var(--kursus-text)]">
          Kursus
        </span>
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
                  ? "bg-[#ff6d38]/10 text-[#ff6d38]"
                  : "text-[var(--kursus-text-muted)] hover:bg-[var(--kursus-bg)] hover:text-[var(--kursus-text)]",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-[#ff6d38]"
                    : "text-[var(--kursus-text-muted)]",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--kursus-border)] p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-[var(--kursus-text-muted)] hover:bg-[var(--kursus-bg)] hover:text-[var(--kursus-text)]"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          Deconnexion
        </Button>
      </div>
    </aside>
  );
}
