"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createTopicSchema,
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from "@/lib/validations/forum";

const formSchema = createTopicSchema;
type FormData = z.infer<typeof formSchema>;

interface CreateTopicFormProps {
  children: React.ReactNode;
  userRole: string;
  children_?: Array<{
    id: string;
    firstName: string;
    gradeLevel: string;
  }>;
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

const subjectLabels: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

const subjects = Object.keys(subjectLabels);
const gradeLevels = Object.keys(gradeLevelLabels);

export function CreateTopicForm({
  children,
  userRole,
  children_,
}: CreateTopicFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "GENERAL",
    },
  });

  const selectedCategory = watch("category");

  // Filter categories based on user role
  const availableCategories = Object.entries(FORUM_CATEGORY_LABELS).filter(
    ([category]) => {
      if (category === "ANNOUNCEMENTS" && userRole !== "ADMIN") return false;
      if (
        category === "TEACHER_LOUNGE" &&
        userRole !== "TEACHER" &&
        userRole !== "ADMIN"
      )
        return false;
      return true;
    },
  ) as [ForumCategory, string][];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la creation");
      }

      const topic = await response.json();
      toast.success("Sujet cree", {
        description: "Votre sujet a ete publie avec succes.",
      });
      reset();
      setOpen(false);
      router.push(`/community/${topic.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau sujet</DialogTitle>
          <DialogDescription>
            Posez votre question ou partagez vos idees avec la communaute
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categorie</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setValue("category", value as ForumCategory)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une categorie" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Resumez votre question ou sujet"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              placeholder="Decrivez votre question ou partagez vos reflexions..."
              rows={6}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Optional filters row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Matiere (optionnel)</Label>
              <Select
                onValueChange={(value) =>
                  setValue("subject", value as FormData["subject"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les matieres" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subjectLabels[subject]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Level */}
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Niveau (optionnel)</Label>
              <Select
                onValueChange={(value) =>
                  setValue("gradeLevel", value as FormData["gradeLevel"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {gradeLevelLabels[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Child selector (for parents) */}
          {userRole === "PARENT" && children_ && children_.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="childId">Poster au nom de (optionnel)</Label>
              <Select
                onValueChange={(value) =>
                  setValue("childId", value === "none" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Poster en votre nom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Poster en votre nom</SelectItem>
                  {children_.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName} ({gradeLevelLabels[child.gradeLevel]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Publier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
