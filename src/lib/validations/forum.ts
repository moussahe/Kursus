import { z } from "zod";

// Forum categories
export const forumCategorySchema = z.enum([
  "GENERAL",
  "HOMEWORK_HELP",
  "STUDY_TIPS",
  "EXAM_PREP",
  "PARENT_CORNER",
  "TEACHER_LOUNGE",
  "ANNOUNCEMENTS",
]);

// Grade levels
export const gradeLevelSchema = z.enum([
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

// Subjects
export const subjectSchema = z.enum([
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

// Create topic schema
export const createTopicSchema = z.object({
  title: z
    .string()
    .min(10, "Le titre doit contenir au moins 10 caracteres")
    .max(200, "Le titre ne peut pas depasser 200 caracteres"),
  content: z
    .string()
    .min(20, "Le contenu doit contenir au moins 20 caracteres")
    .max(10000, "Le contenu ne peut pas depasser 10000 caracteres"),
  category: forumCategorySchema,
  subject: subjectSchema.optional(),
  gradeLevel: gradeLevelSchema.optional(),
  childId: z.string().cuid("ID enfant invalide").optional(),
});

// Update topic schema
export const updateTopicSchema = z.object({
  title: z
    .string()
    .min(10, "Le titre doit contenir au moins 10 caracteres")
    .max(200, "Le titre ne peut pas depasser 200 caracteres")
    .optional(),
  content: z
    .string()
    .min(20, "Le contenu doit contenir au moins 20 caracteres")
    .max(10000, "Le contenu ne peut pas depasser 10000 caracteres")
    .optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isResolved: z.boolean().optional(),
});

// Create reply schema
export const createReplySchema = z.object({
  content: z
    .string()
    .min(5, "La réponse doit contenir au moins 5 caracteres")
    .max(5000, "La réponse ne peut pas depasser 5000 caracteres"),
  parentReplyId: z.string().cuid("ID réponse invalide").optional(),
  childId: z.string().cuid("ID enfant invalide").optional(),
});

// Update reply schema
export const updateReplySchema = z.object({
  content: z
    .string()
    .min(5, "La réponse doit contenir au moins 5 caracteres")
    .max(5000, "La réponse ne peut pas depasser 5000 caracteres")
    .optional(),
  isAccepted: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

// Vote schema
export const voteSchema = z.object({
  value: z.number().min(-1).max(1), // -1 for downvote, 0 to remove, 1 for upvote
});

// Query topics schema
export const topicsQuerySchema = z.object({
  category: forumCategorySchema.optional(),
  subject: subjectSchema.optional(),
  gradeLevel: gradeLevelSchema.optional(),
  authorId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  isPinned: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  isResolved: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sortBy: z.enum(["recent", "popular", "most_replies"]).default("recent"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// Query replies schema
export const repliesQuerySchema = z.object({
  sortBy: z.enum(["oldest", "newest", "best"]).default("oldest"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// Export types
export type ForumCategory = z.infer<typeof forumCategorySchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type UpdateReplyInput = z.infer<typeof updateReplySchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type TopicsQueryInput = z.infer<typeof topicsQuerySchema>;
export type RepliesQueryInput = z.infer<typeof repliesQuerySchema>;

// Category labels for UI
export const FORUM_CATEGORY_LABELS: Record<ForumCategory, string> = {
  GENERAL: "Questions générales",
  HOMEWORK_HELP: "Aide aux devoirs",
  STUDY_TIPS: "Conseils d'etude",
  EXAM_PREP: "Preparation examens",
  PARENT_CORNER: "Espace parents",
  TEACHER_LOUNGE: "Espace enseignants",
  ANNOUNCEMENTS: "Annonces",
};

// Category descriptions
export const FORUM_CATEGORY_DESCRIPTIONS: Record<ForumCategory, string> = {
  GENERAL: "Posez vos questions sur tous les sujets",
  HOMEWORK_HELP: "Demandez de l'aide pour vos devoirs",
  STUDY_TIPS: "Partagez et découvrez des methodes d'etude",
  EXAM_PREP: "Preparez-vous aux examens ensemble",
  PARENT_CORNER: "Discussions entre parents",
  TEACHER_LOUNGE: "Espace reserve aux enseignants",
  ANNOUNCEMENTS: "Annonces officielles de Kursus",
};
