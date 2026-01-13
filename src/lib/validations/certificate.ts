import { z } from "zod";

// Certificate generation schema
export const generateCertificateSchema = z.object({
  childId: z.string().cuid("ID d'enfant invalide"),
  courseId: z.string().cuid("ID de cours invalide"),
});

// Certificate verification schema
export const verifyCertificateSchema = z.object({
  verificationCode: z.string().min(1, "Code de verification requis"),
});

// Types
export type GenerateCertificateInput = z.infer<
  typeof generateCertificateSchema
>;
export type VerifyCertificateInput = z.infer<typeof verifyCertificateSchema>;
