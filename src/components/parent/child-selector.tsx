"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ChildData {
  id: string;
  firstName: string;
  gradeLevel: string;
  xp: number;
  level: number;
  streak: number;
}

interface ChildSelectorProps {
  childrenList: ChildData[];
  selectedChildId?: string;
  onSelect?: (childId: string) => void;
}

const gradeLevelLabels: Record<string, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "2nde",
  PREMIERE: "1ere",
  TERMINALE: "Terminale",
};

const childColors = [
  { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-500" },
  { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-500" },
  { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-500" },
  { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-500" },
  { bg: "bg-pink-100", text: "text-pink-700", ring: "ring-pink-500" },
];

export function ChildSelector({
  childrenList,
  selectedChildId,
  onSelect,
}: ChildSelectorProps) {
  const [selected, setSelected] = useState(
    selectedChildId || childrenList[0]?.id,
  );

  const handleSelect = (childId: string) => {
    setSelected(childId);
    onSelect?.(childId);
  };

  if (childrenList.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ajoutez votre premier enfant
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par creer un profil pour votre enfant
            </p>
          </div>
          <Link
            href="/parent/children"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Ajouter un enfant
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500">Vos enfants</h2>
        <Link
          href="/parent/children"
          className="text-sm text-emerald-600 hover:text-emerald-700"
        >
          Gerer
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {childrenList.map((child, index) => {
          const colors = childColors[index % childColors.length];
          const isSelected = selected === child.id;

          return (
            <button
              key={child.id}
              onClick={() => handleSelect(child.id)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border-2 p-3 transition-all text-left",
                isSelected
                  ? `border-transparent ring-2 ${colors.ring} bg-gradient-to-r from-gray-50 to-white`
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold",
                  colors.bg,
                  colors.text,
                )}
              >
                {child.firstName.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {child.firstName}
                </p>
                <p className="text-xs text-gray-500">
                  {gradeLevelLabels[child.gradeLevel] || child.gradeLevel}
                </p>

                {/* Stats row */}
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="h-3 w-3 fill-current" />
                    Niv. {child.level}
                  </span>
                  {child.streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <TrendingUp className="h-3 w-3" />
                      {child.streak}j
                    </span>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -right-1 -top-1">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
