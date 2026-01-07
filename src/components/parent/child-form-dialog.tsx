"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const childFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prenom doit contenir au moins 2 caracteres")
    .max(50, "Le prenom ne peut pas depasser 50 caracteres"),
  lastName: z
    .string()
    .max(50, "Le nom ne peut pas depasser 50 caracteres")
    .optional(),
  gradeLevel: z.enum([
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "SIXIEME",
    "CINQUIEME",
    "QUATRIEME",
    "TROISIEME",
    "SECONDE",
    "PREMIERE",
    "TERMINALE",
  ]),
  avatarUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

const gradeLevelOptions = [
  { value: "CP", label: "CP" },
  { value: "CE1", label: "CE1" },
  { value: "CE2", label: "CE2" },
  { value: "CM1", label: "CM1" },
  { value: "CM2", label: "CM2" },
  { value: "SIXIEME", label: "6eme" },
  { value: "CINQUIEME", label: "5eme" },
  { value: "QUATRIEME", label: "4eme" },
  { value: "TROISIEME", label: "3eme" },
  { value: "SECONDE", label: "Seconde" },
  { value: "PREMIERE", label: "Premiere" },
  { value: "TERMINALE", label: "Terminale" },
];

interface ChildFormDialogProps {
  mode?: "create" | "edit";
  child?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    gradeLevel: string;
    avatarUrl?: string | null;
  };
  trigger?: React.ReactNode;
}

export function ChildFormDialog({
  mode = "create",
  child,
  trigger,
}: ChildFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: child?.firstName ?? "",
      lastName: child?.lastName ?? "",
      gradeLevel: (child?.gradeLevel as ChildFormValues["gradeLevel"]) ?? "CP",
      avatarUrl: child?.avatarUrl ?? "",
    },
  });

  const onSubmit = (data: ChildFormValues) => {
    startTransition(async () => {
      try {
        const url =
          mode === "create" ? "/api/children" : `/api/children/${child?.id}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName || null,
            gradeLevel: data.gradeLevel,
            avatarUrl: data.avatarUrl || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Une erreur est survenue");
        }

        toast.success(
          mode === "create"
            ? "Enfant ajoute avec succes !"
            : "Enfant modifie avec succes !",
        );
        setOpen(false);
        form.reset();
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue",
        );
      }
    });
  };

  const defaultTrigger =
    mode === "create" ? (
      <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600">
        <Plus className="h-4 w-4" />
        Ajouter un enfant
      </Button>
    ) : (
      <Button variant="outline" size="icon">
        <Pencil className="h-4 w-4" />
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Ajouter un enfant"
              : "Modifier les informations"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Creez un profil pour votre enfant afin de suivre sa progression."
              : "Modifiez les informations de votre enfant."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prenom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Prenom de l'enfant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de famille" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau scolaire *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selectionnez un niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradeLevelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l&apos;avatar (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Ajouter" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
