"use client";

import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface ChildCardProps {
  child: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
    gradeLevel: string;
    _count?: {
      progresses: number;
    };
  };
  coursesCount?: number;
  overallProgress?: number;
  onEdit?: (childId: string) => void;
  onDelete?: (childId: string) => void;
}

export function ChildCard({
  child,
  coursesCount = 0,
  overallProgress = 0,
  onEdit,
  onDelete,
}: ChildCardProps) {
  const initials =
    `${child.firstName.charAt(0)}${child.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={child.avatarUrl || undefined}
                alt={child.firstName}
              />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {child.firstName} {child.lastName || ""}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {gradeLevelLabels[child.gradeLevel] || child.gradeLevel}
              </Badge>
            </div>
          </div>

          {/* Actions menu */}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(child.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(child.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span>{coursesCount} cours</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>{Math.round(overallProgress)}% complete</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression globale</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* View details link */}
        <Link
          href={`/parent/children/${child.id}`}
          className="block w-full text-center py-2 rounded-xl bg-emerald-50 text-emerald-600 font-medium text-sm hover:bg-emerald-100 transition-colors"
        >
          Voir les details
        </Link>
      </CardContent>
    </Card>
  );
}
