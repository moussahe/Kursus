import { z } from "zod";

// Purchase schemas
export const createPurchaseSchema = z.object({
  courseId: z.string().cuid("ID de cours invalide"),
  childId: z.string().cuid("ID d'enfant invalide").optional(),
});

export const purchaseQuerySchema = z.object({
  childId: z.string().cuid().optional(),
  status: z.enum(["PENDING", "COMPLETED", "REFUNDED", "FAILED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Stripe checkout schema
export const checkoutSchema = z.object({
  courseId: z.string().cuid("ID de cours invalide"),
  childId: z.string().cuid("ID d'enfant invalide").optional(),
});

// Types
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
