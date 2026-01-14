import { z } from "zod";

/**
 * Password validation schema following security best practices:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caracteres")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractere special (!@#$%^&*)");

/**
 * Password confirmation schema for forms
 */
export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

/**
 * Password requirements for display in UI
 */
export const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, label: "Au moins 8 caracteres" },
  { regex: /[A-Z]/, label: "Au moins une majuscule" },
  { regex: /[a-z]/, label: "Au moins une minuscule" },
  { regex: /[0-9]/, label: "Au moins un chiffre" },
  { regex: /[^A-Za-z0-9]/, label: "Au moins un caractere special" },
];

/**
 * Check password strength (for UI indicators)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Faible", color: "red" };
  if (score <= 4) return { score, label: "Moyen", color: "amber" };
  return { score, label: "Fort", color: "green" };
}
