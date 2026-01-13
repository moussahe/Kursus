import { z } from "zod";

// Teacher availability schema
export const teacherAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm requis"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm requis"),
  isActive: z.boolean().default(true),
  timezone: z.string().default("Europe/Paris"),
});

export const updateAvailabilitySchema = z.array(teacherAvailabilitySchema);

// Book session schema
export const bookSessionSchema = z.object({
  teacherId: z.string().cuid("ID professeur invalide"),
  childId: z.string().cuid("ID enfant invalide"),
  subject: z.enum([
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
  ]),
  scheduledAt: z.string().datetime("Date et heure invalides"),
  duration: z.number().min(30).max(120).default(60),
  title: z.string().min(5, "Titre trop court").max(200),
  description: z.string().max(2000).optional(),
});

// Update session schema (for teacher notes, cancellation, etc.)
export const updateSessionSchema = z.object({
  teacherNotes: z.string().max(5000).optional(),
  status: z
    .enum(["IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  cancellationReason: z.string().max(500).optional(),
});

// Rate session schema (for parents)
export const rateSessionSchema = z.object({
  rating: z.number().min(1).max(5),
  parentFeedback: z.string().max(2000).optional(),
});

// Query sessions schema
export const sessionQuerySchema = z.object({
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  teacherId: z.string().cuid().optional(),
  childId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

// Available slots query schema
export const availableSlotsQuerySchema = z.object({
  teacherId: z.string().cuid().optional(),
  subject: z
    .enum([
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
    ])
    .optional(),
  gradeLevel: z
    .enum([
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
    ])
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD requis")
    .optional(),
  days: z.coerce.number().min(1).max(30).default(7), // Number of days to look ahead
});

export type TeacherAvailabilityInput = z.infer<
  typeof teacherAvailabilitySchema
>;
export type BookSessionInput = z.infer<typeof bookSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type RateSessionInput = z.infer<typeof rateSessionSchema>;
export type SessionQueryInput = z.infer<typeof sessionQuerySchema>;
export type AvailableSlotsQueryInput = z.infer<
  typeof availableSlotsQuerySchema
>;
