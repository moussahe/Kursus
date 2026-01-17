"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  BookOpen,
  GraduationCap,
  LogOut,
  Play,
  Sparkles,
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
import { signOut } from "next-auth/react";

interface ParentMobileNavProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navigation = [
  { name: "Tableau de bord", href: "/parent", icon: LayoutDashboard },
  { name: "Mes Enfants", href: "/parent/children", icon: Users },
  { name: "Conversations IA", href: "/parent/conversations", icon: Sparkles },
  { name: "Mes Achats", href: "/parent/purchases", icon: ShoppingBag },
  { name: "Parametres", href: "/parent/settings", icon: Settings },
];

export function ParentMobileNav({ user }: ParentMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/parent") {
      return pathname === "/parent";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
      {/* Logo */}
      <Link href="/parent" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground">Kursus</span>
      </Link>

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

          {/* User Info */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={user.image ?? undefined}
                  alt={user.name ?? "User"}
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-600">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-emerald-500" : "text-gray-400",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Espace Apprentissage */}
          <div className="border-t p-4 space-y-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Espace Apprentissage
            </p>
            <Link
              href="/student"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all"
            >
              <Play className="h-5 w-5" />
              Acceder aux cours
              <Sparkles className="ml-auto h-4 w-4 opacity-70" />
            </Link>
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <BookOpen className="h-5 w-5" />
              Acheter des cours
            </Link>
          </div>

          {/* Deconnexion */}
          <div className="border-t p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Se deconnecter
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
