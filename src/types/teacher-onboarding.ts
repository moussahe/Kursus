import type { Subject, GradeLevel } from "@prisma/client";

export interface TeacherOnboardingData {
  profile: {
    headline: string;
    bio: string;
    specialties: Subject[];
    yearsExperience: number;
  };
  course: {
    title: string;
    description: string;
    subject: Subject;
    gradeLevel: GradeLevel;
    price: number; // in cents
    chapters: GeneratedChapter[];
  };
  stripeConnected: boolean;
}

export interface GeneratedChapter {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedLesson {
  title: string;
  description: string;
  duration: number;
  type: "video" | "text" | "quiz" | "exercise";
}

export type TeacherOnboardingStep =
  | "welcome"
  | "profile"
  | "course-ai"
  | "preview"
  | "complete";
