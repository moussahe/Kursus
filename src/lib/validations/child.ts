import { z } from "zod";
import { gradeLevelEnum } from "./course";

// Child schemas
export const createChildSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prenom doit contenir au moins 2 caracteres")
    .max(50, "Le prenom ne peut pas depasser 50 caracteres"),
  lastName: z
    .string()
    .max(50, "Le nom ne peut pas depasser 50 caracteres")
    .optional(),
  gradeLevel: gradeLevelEnum,
  avatarUrl: z.string().url("URL d'avatar invalide").optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
});

export const updateChildSchema = createChildSchema.partial();

// Progress schema
export const markProgressSchema = z.object({
  lessonId: z.string().cuid("ID de lecon invalide"),
  childId: z.string().cuid("ID d'enfant invalide"),
  isCompleted: z.boolean().default(true),
});

// Types
export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
export type MarkProgressInput = z.infer<typeof markProgressSchema>;
