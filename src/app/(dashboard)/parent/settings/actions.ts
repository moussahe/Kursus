"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";

// ============================================================================
// SCHEMAS
// ============================================================================

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(100),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Minimum 8 caracteres")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[a-z]/, "Au moins une minuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractere special"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const notificationPreferencesSchema = z.object({
  weeklyReportReady: z.boolean(),
  inactivityReminder: z.boolean(),
  newCourseRecommendations: z.boolean().optional(),
  quizCompleted: z.boolean().optional(),
  milestoneReached: z.boolean().optional(),
  lowQuizScore: z.boolean().optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export type ActionResult = {
  success: boolean;
  error?: string;
};

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Met a jour le profil utilisateur (nom)
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autorise" };
    }

    const name = formData.get("name");
    const validated = updateProfileSchema.parse({ name });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: validated.name },
    });

    revalidatePath("/parent/settings");
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("updateProfile error:", error);
    return { success: false, error: "Erreur lors de la mise a jour" };
  }
}

/**
 * Change le mot de passe utilisateur
 */
export async function changePassword(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autorise" };
    }

    const data = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validated = changePasswordSchema.parse(data);

    // Recuperer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return {
        success: false,
        error: "Compte OAuth - utilisez la connexion sociale",
      };
    }

    // Verifier le mot de passe actuel
    const isValid = await bcrypt.compare(
      validated.currentPassword,
      user.password,
    );
    if (!isValid) {
      return { success: false, error: "Mot de passe actuel incorrect" };
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(validated.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("changePassword error:", error);
    return {
      success: false,
      error: "Erreur lors du changement de mot de passe",
    };
  }
}

/**
 * Met a jour les preferences de notification
 */
export async function updateNotificationPreferences(
  preferences: z.infer<typeof notificationPreferencesSchema>,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autorise" };
    }

    const validated = notificationPreferencesSchema.parse(preferences);

    // Upsert les preferences
    await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        weeklyReportReady: validated.weeklyReportReady,
        inactivityReminder: validated.inactivityReminder,
        quizCompleted: validated.quizCompleted ?? true,
        milestoneReached: validated.milestoneReached ?? true,
        lowQuizScore: validated.lowQuizScore ?? true,
      },
      update: {
        weeklyReportReady: validated.weeklyReportReady,
        inactivityReminder: validated.inactivityReminder,
        quizCompleted: validated.quizCompleted,
        milestoneReached: validated.milestoneReached,
        lowQuizScore: validated.lowQuizScore,
      },
    });

    revalidatePath("/parent/settings");
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("updateNotificationPreferences error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise a jour des preferences",
    };
  }
}

/**
 * Supprime le compte utilisateur (anonymisation des donnees personnelles)
 * Conformite RGPD: on anonymise plutot que supprimer pour garder l'integrite des donnees
 */
export async function deleteAccount(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autorise" };
    }

    const confirmation = formData.get("confirmation") as string;
    if (confirmation !== "SUPPRIMER") {
      return {
        success: false,
        error: "Veuillez taper SUPPRIMER pour confirmer",
      };
    }

    const userId = session.user.id;

    // Anonymiser le compte utilisateur (conforme RGPD)
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.schoolaris.fr`,
        name: "Compte supprime",
        image: null,
        password: null,
      },
    });

    // Supprimer les sessions actives
    await prisma.session.deleteMany({
      where: { userId },
    });

    // Supprimer les comptes OAuth lies
    await prisma.account.deleteMany({
      where: { userId },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteAccount error:", error);
    return { success: false, error: "Erreur lors de la suppression du compte" };
  }
}

/**
 * Recupere les preferences de notification de l'utilisateur
 */
export async function getNotificationPreferences() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const prefs = await prisma.notificationPreferences.findUnique({
    where: { userId: session.user.id },
    select: {
      weeklyReportReady: true,
      inactivityReminder: true,
      quizCompleted: true,
      milestoneReached: true,
      lowQuizScore: true,
    },
  });

  // Retourner les valeurs par defaut si pas de preferences enregistrees
  return (
    prefs ?? {
      weeklyReportReady: true,
      inactivityReminder: true,
      quizCompleted: true,
      milestoneReached: true,
      lowQuizScore: true,
    }
  );
}
