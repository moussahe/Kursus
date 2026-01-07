"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParentSidebarProps {
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
  { name: "Mes Achats", href: "/parent/purchases", icon: ShoppingBag },
  { name: "Parametres", href: "/parent/settings", icon: Settings },
];

export function ParentSidebar({ user }: ParentSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/parent") {
      return pathname === "/parent";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Schoolaris</span>
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

      {/* Browse Courses Link */}
      <div className="border-t px-4 py-4">
        <Link
          href="/courses"
          className="flex items-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <BookOpen className="h-5 w-5" />
          Parcourir les cours
        </Link>
      </div>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <Avatar className="h-10 w-10">
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
    </aside>
  );
}
