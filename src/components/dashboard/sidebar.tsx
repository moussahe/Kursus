"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
  role: "teacher" | "parent";
}

const teacherNavItems: NavItem[] = [
  { label: "Tableau de bord", href: "/teacher", icon: LayoutDashboard },
  { label: "Mes cours", href: "/teacher/courses", icon: BookOpen },
  { label: "Eleves", href: "/teacher/students", icon: Users },
  { label: "Analytiques", href: "/teacher/analytics", icon: BarChart3 },
  { label: "Parametres", href: "/teacher/settings", icon: Settings },
];

const parentNavItems: NavItem[] = [
  { label: "Tableau de bord", href: "/parent", icon: LayoutDashboard },
  { label: "Mes enfants", href: "/parent/children", icon: Users },
  { label: "Mes achats", href: "/parent/purchases", icon: ShoppingBag },
  { label: "Cours", href: "/parent/courses", icon: BookOpen },
  { label: "Parametres", href: "/parent/settings", icon: Settings },
];

export function DashboardSidebar({ items, role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = role === "teacher" ? teacherNavItems : parentNavItems;
  const finalItems = items.length > 0 ? items : navItems;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">Schoolaris</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {finalItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-emerald-600")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Help section */}
      <div className="border-t p-4">
        <a
          href="mailto:support@schoolaris.fr"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
        >
          <HelpCircle className="h-5 w-5" />
          Aide & Support
        </a>
      </div>
    </aside>
  );
}

export { teacherNavItems, parentNavItems };
export type { NavItem };
