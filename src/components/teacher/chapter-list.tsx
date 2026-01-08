"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  FileIcon,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LessonForm } from "./lesson-form";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  duration: number | null;
  position: number;
  isPublished: boolean;
  isFreePreview: boolean;
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  position: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface ChapterListProps {
  courseId: string;
  chapters: Chapter[];
}

const contentTypeIcons: Record<string, React.ElementType> = {
  VIDEO: PlayCircle,
  TEXT: FileText,
  QUIZ: HelpCircle,
  DOCUMENT: FileIcon,
  EXERCISE: HelpCircle,
};

const contentTypeLabels: Record<string, string> = {
  VIDEO: "Video",
  TEXT: "Texte",
  QUIZ: "Quiz",
  DOCUMENT: "Document",
  EXERCISE: "Exercice",
};

export function ChapterList({
  courseId,
  chapters: initialChapters,
}: ChapterListProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(initialChapters.map((c) => c.id)),
  );
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);
  const [addingLessonToChapter, setAddingLessonToChapter] = useState<
    string | null
  >(null);
  const [editingLesson, setEditingLesson] = useState<{
    chapterId: string;
    lesson: Lesson;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  }, []);

  // Chapter CRUD
  const handleAddChapter = async (title: string, description: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error("Erreur lors de la creation");

      const newChapter = await response.json();
      setChapters((prev) => [...prev, { ...newChapter, lessons: [] }]);
      setExpandedChapters((prev) => new Set([...prev, newChapter.id]));
      toast.success("Chapitre cree avec succes");
      setIsAddingChapter(false);
    } catch {
      toast.error("Erreur lors de la creation du chapitre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChapter = async (
    chapter: Chapter,
    title: string,
    description: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la mise a jour");

      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapter.id ? { ...c, title, description } : c,
        ),
      );
      toast.success("Chapitre mis a jour");
      setEditingChapter(null);
    } catch {
      toast.error("Erreur lors de la mise a jour du chapitre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChapter = async (chapter: Chapter) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapter.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
      toast.success("Chapitre supprime");
      setDeletingChapter(null);
    } catch {
      toast.error("Erreur lors de la suppression du chapitre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChapterPublish = async (chapter: Chapter) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !chapter.isPublished }),
        },
      );

      if (!response.ok) throw new Error("Erreur");

      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapter.id ? { ...c, isPublished: !c.isPublished } : c,
        ),
      );
      toast.success(
        chapter.isPublished ? "Chapitre depublie" : "Chapitre publie",
      );
    } catch {
      toast.error("Erreur lors de la mise a jour");
    }
  };

  // Lesson handlers
  const handleLessonCreated = (chapterId: string, lesson: Lesson) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId ? { ...c, lessons: [...c.lessons, lesson] } : c,
      ),
    );
    setAddingLessonToChapter(null);
    toast.success("Lecon creee avec succes");
    router.refresh();
  };

  const handleLessonUpdated = (chapterId: string, lesson: Lesson) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: c.lessons.map((l) => (l.id === lesson.id ? lesson : l)),
            }
          : c,
      ),
    );
    setEditingLesson(null);
    toast.success("Lecon mise a jour");
    router.refresh();
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Erreur");

      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
            : c,
        ),
      );
      toast.success("Lecon supprimee");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contenu du cours</h2>
          <p className="text-sm text-gray-500">
            {chapters.length} chapitre{chapters.length !== 1 && "s"} -{" "}
            {chapters.reduce((acc, c) => acc + c.lessons.length, 0)} lecon
            {chapters.reduce((acc, c) => acc + c.lessons.length, 0) !== 1 &&
              "s"}
          </p>
        </div>
        <Button
          onClick={() => setIsAddingChapter(true)}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un chapitre
        </Button>
      </div>

      {/* Chapters */}
      {chapters.length === 0 ? (
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">
              Aucun chapitre
            </h3>
            <p className="mt-1 text-gray-500">
              Commencez par ajouter un chapitre a votre cours
            </p>
            <Button
              onClick={() => setIsAddingChapter(true)}
              className="mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un chapitre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => {
            const isExpanded = expandedChapters.has(chapter.id);

            return (
              <Card
                key={chapter.id}
                className="rounded-2xl border-0 bg-white shadow-sm overflow-hidden"
              >
                {/* Chapter Header */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    isExpanded && "border-b",
                  )}
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                  <button className="p-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {index + 1}. {chapter.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          chapter.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {chapter.isPublished ? "Publie" : "Brouillon"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {chapter.lessons.length} lecon
                      {chapter.lessons.length !== 1 && "s"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingLessonToChapter(chapter.id);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une lecon
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChapter(chapter);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleChapterPublish(chapter);
                        }}
                      >
                        {chapter.isPublished ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Depublier
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingChapter(chapter);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Lessons */}
                {isExpanded && (
                  <div className="bg-gray-50 p-4">
                    {chapter.lessons.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-sm text-gray-500">
                          Aucune lecon dans ce chapitre
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-xl"
                          onClick={() => setAddingLessonToChapter(chapter.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter une lecon
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson, lessonIndex) => {
                          const LessonIcon =
                            contentTypeIcons[lesson.contentType] || FileText;

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                                <LessonIcon className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {lessonIndex + 1}. {lesson.title}
                                  </span>
                                  {lesson.isFreePreview && (
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                    >
                                      Apercu gratuit
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className={
                                      lesson.isPublished
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-gray-100 text-gray-600"
                                    }
                                  >
                                    {lesson.isPublished
                                      ? "Publie"
                                      : "Brouillon"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>
                                    {contentTypeLabels[lesson.contentType] ||
                                      lesson.contentType}
                                  </span>
                                  {lesson.duration && (
                                    <>
                                      <span>-</span>
                                      <span>{lesson.duration} min</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setEditingLesson({
                                        chapterId: chapter.id,
                                        lesson,
                                      })
                                    }
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleDeleteLesson(chapter.id, lesson.id)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          );
                        })}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => setAddingLessonToChapter(chapter.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter une lecon
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Chapter Dialog */}
      <ChapterDialog
        open={isAddingChapter}
        onOpenChange={setIsAddingChapter}
        onSubmit={handleAddChapter}
        isLoading={isLoading}
        title="Ajouter un chapitre"
      />

      {/* Edit Chapter Dialog */}
      <ChapterDialog
        open={!!editingChapter}
        onOpenChange={(open) => !open && setEditingChapter(null)}
        onSubmit={(title, description) =>
          editingChapter &&
          handleUpdateChapter(editingChapter, title, description)
        }
        isLoading={isLoading}
        title="Modifier le chapitre"
        initialTitle={editingChapter?.title}
        initialDescription={editingChapter?.description ?? ""}
      />

      {/* Delete Chapter Dialog */}
      <Dialog
        open={!!deletingChapter}
        onOpenChange={(open) => !open && setDeletingChapter(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Supprimer le chapitre</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer le chapitre &ldquo;
              {deletingChapter?.title}&rdquo;? Cette action est irreversible et
              supprimera toutes les lecons associees.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingChapter(null)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingChapter && handleDeleteChapter(deletingChapter)
              }
              disabled={isLoading}
              className="rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      {addingLessonToChapter && (
        <LessonForm
          open={true}
          onOpenChange={(open) => !open && setAddingLessonToChapter(null)}
          courseId={courseId}
          chapterId={addingLessonToChapter}
          onSuccess={(lesson) =>
            handleLessonCreated(addingLessonToChapter, lesson)
          }
        />
      )}

      {/* Edit Lesson Dialog */}
      {editingLesson && (
        <LessonForm
          open={true}
          onOpenChange={(open) => !open && setEditingLesson(null)}
          courseId={courseId}
          chapterId={editingLesson.chapterId}
          lesson={editingLesson.lesson}
          onSuccess={(lesson) =>
            handleLessonUpdated(editingLesson.chapterId, lesson)
          }
        />
      )}
    </div>
  );
}

// Chapter Dialog Component
function ChapterDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title,
  initialTitle = "",
  initialDescription = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => void;
  isLoading: boolean;
  title: string;
  initialTitle?: string;
  initialDescription?: string;
}) {
  const [chapterTitle, setChapterTitle] = useState(initialTitle);
  const [chapterDescription, setChapterDescription] =
    useState(initialDescription);

  // Reset form when dialog opens with new initial values
  useState(() => {
    setChapterTitle(initialTitle);
    setChapterDescription(initialDescription);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Ajoutez les details du chapitre ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Titre *</Label>
            <Input
              id="chapter-title"
              placeholder="Ex: Introduction aux fractions"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapter-description">Description</Label>
            <Textarea
              id="chapter-description"
              placeholder="Description du chapitre..."
              value={chapterDescription}
              onChange={(e) => setChapterDescription(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={() => onSubmit(chapterTitle, chapterDescription)}
            disabled={!chapterTitle.trim() || isLoading}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {initialTitle ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
