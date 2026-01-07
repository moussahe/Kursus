import { z } from "zod";

// Grade levels enum
export const gradeLevelEnum = z.enum([
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
]);

// Subjects enum
export const subjectEnum = z.enum([
  "MATHEMATIQUES",
  "FRANCAIS",
  "HISTOIRE_GEO",
  "SCIENCES",
  "ANGLAIS",
  "PHYSIQUE_CHIMIE",
  "SVT",
  "PHILOSOPHIE",
  "ESPAGNOL",
  "ALLEMAND",
  "SES",
  "NSI",
]);

// Content types enum
export const contentTypeEnum = z.enum([
  "VIDEO",
  "TEXT",
  "QUIZ",
  "EXERCISE",
  "DOCUMENT",
]);

// Course schemas
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caracteres")
    .max(100, "Le titre ne peut pas depasser 100 caracteres"),
  subtitle: z
    .string()
    .max(200, "Le sous-titre ne peut pas depasser 200 caracteres")
    .optional(),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caracteres")
    .max(5000, "La description ne peut pas depasser 5000 caracteres")
    .optional(),
  gradeLevel: gradeLevelEnum,
  subject: subjectEnum,
  price: z
    .number()
    .min(0, "Le prix ne peut pas etre negatif")
    .max(100000, "Le prix ne peut pas depasser 1000 EUR"), // Prix en centimes
  imageUrl: z.string().url("URL d'image invalide").optional(),
  previewVideoUrl: z.string().url("URL de video invalide").optional(),
  learningOutcomes: z
    .array(z.string().min(1).max(200))
    .max(10, "Maximum 10 objectifs")
    .optional(),
  requirements: z
    .array(z.string().min(1).max(200))
    .max(10, "Maximum 10 prerequis")
    .optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

// Chapter schemas
export const createChapterSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caracteres")
    .max(100, "Le titre ne peut pas depasser 100 caracteres"),
  description: z
    .string()
    .max(500, "La description ne peut pas depasser 500 caracteres")
    .optional(),
  position: z.number().int().min(0).optional(),
});

export const updateChapterSchema = createChapterSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export const reorderChaptersSchema = z.object({
  chapters: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    }),
  ),
});

// Lesson schemas
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caracteres")
    .max(100, "Le titre ne peut pas depasser 100 caracteres"),
  description: z
    .string()
    .max(1000, "La description ne peut pas depasser 1000 caracteres")
    .optional(),
  contentType: contentTypeEnum,
  videoUrl: z.string().url("URL de video invalide").optional().nullable(),
  content: z.string().optional().nullable(), // For TEXT type
  duration: z.number().int().min(0).optional(), // In seconds
  position: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().optional(),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export const reorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    }),
  ),
});

// Query schemas for filtering
export const courseQuerySchema = z.object({
  niveau: gradeLevelEnum.optional(),
  matiere: subjectEnum.optional(),
  prix: z.coerce.number().min(0).optional(),
  tri: z
    .enum(["recent", "prix-asc", "prix-desc", "note", "populaire"])
    .optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Types
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
