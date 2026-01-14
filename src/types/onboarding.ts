import type { GradeLevel, Subject } from "@prisma/client";

export type { GradeLevel, Subject };

export interface OnboardingData {
  child: {
    firstName: string;
    gradeLevel: GradeLevel | "";
  };
  subjects: Subject[];
  goals: OnboardingGoal[];
  weeklyTime: number; // hours per week
}

export type OnboardingGoal =
  | "IMPROVE_GRADES"
  | "CATCH_UP"
  | "PREPARE_EXAM"
  | "EXPLORE_SUBJECTS"
  | "HOMEWORK_HELP"
  | "BUILD_CONFIDENCE";

export interface OnboardingStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export interface OnboardingStep4Props {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const GRADE_LEVEL_LABELS: Record<GradeLevel, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "2nde",
  PREMIERE: "1ere",
  TERMINALE: "Terminale",
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
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

export const GOAL_OPTIONS: Array<{
  id: OnboardingGoal;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "IMPROVE_GRADES",
    label: "Ameliorer ses notes",
    description: "Progresser dans les matieres principales",
    icon: "TrendingUp",
  },
  {
    id: "CATCH_UP",
    label: "Rattraper son retard",
    description: "Combler les lacunes accumulees",
    icon: "Target",
  },
  {
    id: "PREPARE_EXAM",
    label: "Preparer un examen",
    description: "Brevet, Bac ou autre examen",
    icon: "Award",
  },
  {
    id: "EXPLORE_SUBJECTS",
    label: "Explorer des matieres",
    description: "Decouvrir et approfondir",
    icon: "Compass",
  },
  {
    id: "HOMEWORK_HELP",
    label: "Aide aux devoirs",
    description: "Accompagnement quotidien",
    icon: "HelpCircle",
  },
  {
    id: "BUILD_CONFIDENCE",
    label: "Prendre confiance",
    description: "Gagner en autonomie",
    icon: "Smile",
  },
];

export const SUBJECTS_BY_GRADE: Record<string, Subject[]> = {
  PRIMAIRE: [
    "MATHEMATIQUES",
    "FRANCAIS",
    "SCIENCES",
    "HISTOIRE_GEO",
    "ANGLAIS",
  ],
  COLLEGE: [
    "MATHEMATIQUES",
    "FRANCAIS",
    "HISTOIRE_GEO",
    "ANGLAIS",
    "SVT",
    "PHYSIQUE_CHIMIE",
    "ESPAGNOL",
    "ALLEMAND",
  ],
  LYCEE: [
    "MATHEMATIQUES",
    "FRANCAIS",
    "HISTOIRE_GEO",
    "ANGLAIS",
    "PHYSIQUE_CHIMIE",
    "SVT",
    "PHILOSOPHIE",
    "SES",
    "NSI",
    "ESPAGNOL",
    "ALLEMAND",
  ],
};

export function getGradeCategory(gradeLevel: GradeLevel | ""): string {
  if (!gradeLevel) return "PRIMAIRE";

  const primaryGrades: GradeLevel[] = ["CP", "CE1", "CE2", "CM1", "CM2"];
  const collegeGrades: GradeLevel[] = [
    "SIXIEME",
    "CINQUIEME",
    "QUATRIEME",
    "TROISIEME",
  ];

  if (primaryGrades.includes(gradeLevel)) return "PRIMAIRE";
  if (collegeGrades.includes(gradeLevel)) return "COLLEGE";
  return "LYCEE";
}
