"use client";

import { useState } from "react";
import {
  ChevronDown,
  PlayCircle,
  FileText,
  HelpCircle,
  Lock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
  isFreePreview: boolean;
  contentType: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

interface CourseChapterListProps {
  chapters: Chapter[];
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="h-4 w-4" />,
  TEXT: <FileText className="h-4 w-4" />,
  QUIZ: <HelpCircle className="h-4 w-4" />,
  EXERCISE: <FileText className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
};

export function CourseChapterList({ chapters }: CourseChapterListProps) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set(chapters.length > 0 ? [chapters[0].id] : []),
  );

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  return (
    <div className="divide-y rounded-lg border">
      {chapters.map((chapter, index) => {
        const isOpen = openChapters.has(chapter.id);
        const chapterDuration = chapter.lessons.reduce(
          (acc, lesson) => acc + (lesson.duration || 0),
          0,
        );

        return (
          <div key={chapter.id}>
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-400 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
                <div>
                  <h3 className="font-medium">
                    Chapitre {index + 1}: {chapter.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {chapter.lessons.length} leçons
                    {chapterDuration > 0 &&
                      ` - ${formatDuration(chapterDuration)}`}
                  </p>
                </div>
              </div>
            </button>

            {/* Lessons */}
            {isOpen && (
              <div className="bg-gray-50 px-4 pb-4">
                <ul className="space-y-1">
                  {chapter.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg bg-white px-4 py-3 border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">
                          {contentTypeIcons[lesson.contentType] || (
                            <FileText className="h-4 w-4" />
                          )}
                        </span>
                        <span className="text-sm">{lesson.title}</span>
                        {lesson.isFreePreview && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <Eye className="h-3 w-3" />
                            Apercu gratuit
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {lesson.duration && (
                          <span>{formatDuration(lesson.duration)}</span>
                        )}
                        {!lesson.isFreePreview && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
