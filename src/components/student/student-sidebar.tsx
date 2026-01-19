"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  MessageSquare,
  Settings,
  Flame,
  Star,
  Award,
  ClipboardList,
  Brain,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Kursus Brand Colors
const KURSUS = {
  orange: "#ff9494",
  lime: "#ff9494",
  purple: "#ff9494",
};

interface StudentSidebarProps {
  child: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
    xp: number;
    level: number;
    currentStreak: number;
  };
}

const navigation = [
  { name: "Tableau de bord", href: "/student", icon: LayoutDashboard },
  { name: "Mes Cours", href: "/student/courses", icon: BookOpen },
  { name: "Revision", href: "/student/revision", icon: Brain },
  {
    name: "Historique Quiz",
    href: "/student/quiz-history",
    icon: ClipboardList,
  },
  { name: "Mes Certificats", href: "/student/certificates", icon: Award },
  { name: "Mes Badges", href: "/student/badges", icon: Trophy },
  { name: "Assistant IA", href: "/student/ai-tutor", icon: MessageSquare },
  { name: "Parametres", href: "/student/settings", icon: Settings },
];

export function StudentSidebar({ child }: StudentSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/student") {
      return pathname === "/student";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] lg:flex">
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

      {/* Gamification Stats */}
      <div className="border-b border-[var(--kursus-border)] px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: `${KURSUS.lime}20` }}
          >
            <Star
              className="h-4 w-4"
              style={{ fill: KURSUS.lime, color: KURSUS.lime }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--kursus-lime-text)" }}
            >
              Niv. {child.level}
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: `${KURSUS.purple}20` }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: KURSUS.purple }}
            >
              {child.xp.toLocaleString()} XP
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: `${KURSUS.orange}20` }}
          >
            <Flame className="h-4 w-4" style={{ color: KURSUS.orange }} />
            <span
              className="text-sm font-semibold"
              style={{ color: KURSUS.orange }}
            >
              {child.currentStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-[#ff9494]/10 text-[#ff9494]"
                  : "text-[var(--kursus-text-muted)] hover:bg-[var(--kursus-bg)] hover:text-[var(--kursus-text)]",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-[#ff9494]" : "text-[var(--kursus-text-muted)]",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-[var(--kursus-border)] p-4">
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: `${KURSUS.purple}10` }}
        >
          <Avatar
            className="h-10 w-10"
            style={{ boxShadow: `0 0 0 2px ${KURSUS.purple}40` }}
          >
            <AvatarImage
              src={child.avatarUrl ?? undefined}
              alt={child.firstName}
            />
            <AvatarFallback
              className="font-semibold text-white"
              style={{ background: KURSUS.purple }}
            >
              {child.firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-[var(--kursus-text)] truncate">
              {child.firstName} {child.lastName}
            </p>
            <p className="text-xs text-[var(--kursus-text-muted)]">Eleve</p>
          </div>
        </div>
        {/* Back to Parent Dashboard */}
        <Link
          href="/parent"
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--kursus-text-muted)] transition-colors hover:bg-[var(--kursus-bg)] hover:text-[var(--kursus-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour espace parent
        </Link>
      </div>
    </aside>
  );
}
