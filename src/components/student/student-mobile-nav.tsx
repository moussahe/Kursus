"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  BookOpen,
  Trophy,
  MessageSquare,
  Settings,
  GraduationCap,
  ArrowLeft,
  Flame,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface StudentMobileNavProps {
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
  { name: "Mes Badges", href: "/student/badges", icon: Trophy },
  { name: "Assistant IA", href: "/student/ai-tutor", icon: MessageSquare },
  { name: "Parametres", href: "/student/settings", icon: Settings },
];

export function StudentMobileNav({ child }: StudentMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/student") {
      return pathname === "/student";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
      {/* Logo */}
      <Link href="/student" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground">Schoolaris</span>
      </Link>

      {/* Quick Stats */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-xs font-semibold text-orange-700">
            {child.currentStreak}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-1">
          <Zap className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-semibold text-violet-700">
            {child.xp.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Menu Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          {/* User Info with Gamification */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-violet-200">
                <AvatarImage
                  src={child.avatarUrl ?? undefined}
                  alt={child.firstName}
                />
                <AvatarFallback className="bg-violet-100 text-violet-600 font-semibold">
                  {child.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {child.firstName} {child.lastName}
                </p>
                <p className="text-xs text-gray-500">Élève</p>
              </div>
            </div>

            {/* Gamification Stats */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">
                  Niv. {child.level}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5">
                <Zap className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-semibold text-violet-700">
                  {child.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">
                  {child.currentStreak}j
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-violet-50 text-violet-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-violet-500" : "text-gray-400",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Back to Parent */}
          <div className="border-t p-4">
            <Link
              href="/parent"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
              Retour espace parent
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
