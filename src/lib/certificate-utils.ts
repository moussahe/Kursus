import { randomBytes } from "crypto";

/**
 * Generate a unique certificate number
 * Format: SCH-YYYY-XXXXXX (e.g., SCH-2024-A3F9K2)
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `SCH-${year}-${random}`;
}

/**
 * Generate a verification code for the certificate
 * Format: 16-character alphanumeric code
 */
export function generateVerificationCode(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}

/**
 * Format grade level for display in French
 */
export function formatGradeLevel(gradeLevel: string): string {
  const gradeLevelMap: Record<string, string> = {
    CP: "CP",
    CE1: "CE1",
    CE2: "CE2",
    CM1: "CM1",
    CM2: "CM2",
    SIXIEME: "6ème",
    CINQUIEME: "5ème",
    QUATRIEME: "4ème",
    TROISIEME: "3ème",
    SECONDE: "2nde",
    PREMIERE: "1ère",
    TERMINALE: "Terminale",
  };
  return gradeLevelMap[gradeLevel] || gradeLevel;
}

/**
 * Format subject for display in French
 */
export function formatSubject(subject: string): string {
  const subjectMap: Record<string, string> = {
    MATHEMATIQUES: "Mathématiques",
    FRANCAIS: "Français",
    HISTOIRE_GEO: "Histoire-Géographie",
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
  return subjectMap[subject] || subject;
}

/**
 * Format date for certificate display
 */
export function formatCertificateDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format duration (minutes to hours and minutes)
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}
