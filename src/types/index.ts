// Re-export all types
// Add type exports here as they are created

// Auth types are augmented in next-auth.d.ts
export type { Session, User } from "next-auth";

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: unknown;
}

// Grade levels
export type GradeLevel =
  | "CP"
  | "CE1"
  | "CE2"
  | "CM1"
  | "CM2"
  | "SIXIEME"
  | "CINQUIEME"
  | "QUATRIEME"
  | "TROISIEME"
  | "SECONDE"
  | "PREMIERE"
  | "TERMINALE";

// Subjects
export type Subject =
  | "MATHEMATIQUES"
  | "FRANCAIS"
  | "HISTOIRE"
  | "GEOGRAPHIE"
  | "SCIENCES"
  | "ANGLAIS"
  | "PHYSIQUE"
  | "CHIMIE"
  | "SVT"
  | "PHILOSOPHIE";

// User roles
export type UserRole = "STUDENT" | "PARENT" | "TEACHER" | "ADMIN";

// Quiz types
export * from "./quiz";

// Live session types
export * from "./live-session";
