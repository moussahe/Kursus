"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  MessageSquare,
  Settings,
  GraduationCap,
  Flame,
  Star,
  Award,
  ClipboardList,
  Brain,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-foreground">Schoolaris</span>
      </div>

      {/* Gamification Stats */}
      <div className="border-b px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">
              Niv. {child.level}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5">
            <span className="text-sm font-semibold text-violet-700">
              {child.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">
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
                  ? "bg-violet-100 text-violet-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-violet-600" : "text-muted-foreground",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-3">
          <Avatar className="h-10 w-10 ring-2 ring-violet-200">
            <AvatarImage
              src={child.avatarUrl ?? undefined}
              alt={child.firstName}
            />
            <AvatarFallback className="bg-violet-100 text-violet-600 font-semibold">
              {child.firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-foreground truncate">
              {child.firstName} {child.lastName}
            </p>
            <p className="text-xs text-muted-foreground">Élève</p>
          </div>
        </div>
        {/* Back to Parent Dashboard */}
        <Link
          href="/parent"
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour espace parent
        </Link>
      </div>
    </aside>
  );
}
