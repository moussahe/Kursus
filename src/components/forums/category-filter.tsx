"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  MessageCircle,
  HelpCircle,
  Lightbulb,
  FileText,
  Users,
  GraduationCap,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FORUM_CATEGORY_LABELS,
  FORUM_CATEGORY_DESCRIPTIONS,
  type ForumCategory,
} from "@/lib/validations/forum";

const categoryIcons: Record<ForumCategory, React.ReactNode> = {
  GENERAL: <MessageCircle className="h-4 w-4" />,
  HOMEWORK_HELP: <HelpCircle className="h-4 w-4" />,
  STUDY_TIPS: <Lightbulb className="h-4 w-4" />,
  EXAM_PREP: <FileText className="h-4 w-4" />,
  PARENT_CORNER: <Users className="h-4 w-4" />,
  TEACHER_LOUNGE: <GraduationCap className="h-4 w-4" />,
  ANNOUNCEMENTS: <Megaphone className="h-4 w-4" />,
};

const categories: ForumCategory[] = [
  "GENERAL",
  "HOMEWORK_HELP",
  "STUDY_TIPS",
  "EXAM_PREP",
  "PARENT_CORNER",
  "TEACHER_LOUNGE",
  "ANNOUNCEMENTS",
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") as ForumCategory | null;

  const handleCategoryChange = useCallback(
    (category: ForumCategory | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.push(`/community?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-2">
        Categories
      </h3>
      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal",
            !currentCategory && "bg-muted",
          )}
          onClick={() => handleCategoryChange(null)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Toutes les discussions
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal",
              currentCategory === category && "bg-muted",
            )}
            onClick={() => handleCategoryChange(category)}
            title={FORUM_CATEGORY_DESCRIPTIONS[category]}
          >
            {categoryIcons[category]}
            <span className="ml-2">{FORUM_CATEGORY_LABELS[category]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
