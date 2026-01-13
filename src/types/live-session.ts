// Live Session Types

export type LiveSessionStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "09:00" format
  endTime: string; // "17:00" format
  isActive: boolean;
  timezone: string;
}

export interface LiveSession {
  id: string;
  teacherId: string;
  parentId: string;
  childId: string;
  subject: string;
  gradeLevel: string;
  title: string;
  description?: string | null;
  scheduledAt: Date;
  duration: number;
  status: LiveSessionStatus;
  roomUrl?: string | null;
  roomName?: string | null;
  price: number;
  platformFee: number;
  teacherRevenue: number;
  teacherNotes?: string | null;
  parentFeedback?: string | null;
  rating?: number | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveSessionWithDetails extends LiveSession {
  teacher: {
    id: string;
    name: string | null;
    image: string | null;
    teacherProfile?: {
      headline: string | null;
      avatarUrl: string | null;
      averageRating: number;
      specialties: string[];
    } | null;
  };
  child: {
    id: string;
    firstName: string;
    gradeLevel: string;
  };
}

export interface AvailableSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teacherId: string;
  teacherName: string;
  teacherImage?: string | null;
  teacherRating?: number;
  price: number; // in cents
}

export interface BookSessionRequest {
  teacherId: string;
  childId: string;
  subject: string;
  scheduledAt: string; // ISO date string
  duration: number;
  title: string;
  description?: string;
}

export interface TeacherSessionPrice {
  teacherId: string;
  subject: string;
  pricePerHour: number; // in cents
}

// Default pricing for live sessions
export const LIVE_SESSION_PRICING = {
  DEFAULT_PRICE_PER_HOUR: 3500, // 35 EUR per hour
  PLATFORM_FEE_PERCENT: 30, // 30% commission
  MIN_DURATION: 30, // 30 minutes minimum
  MAX_DURATION: 120, // 2 hours maximum
} as const;

// Calculate pricing for a session
export function calculateSessionPrice(
  durationMinutes: number,
  pricePerHour: number = LIVE_SESSION_PRICING.DEFAULT_PRICE_PER_HOUR,
) {
  const price = Math.round((pricePerHour / 60) * durationMinutes);
  const platformFee = Math.round(
    price * (LIVE_SESSION_PRICING.PLATFORM_FEE_PERCENT / 100),
  );
  const teacherRevenue = price - platformFee;

  return {
    price,
    platformFee,
    teacherRevenue,
  };
}

// Day of week helpers
export const DAYS_OF_WEEK = [
  { value: 0, label: "Dimanche" },
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
] as const;

// Time slot generation
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 60,
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  const endMinutes = endHour * 60 + endMin;

  while (currentHour * 60 + currentMin < endMinutes) {
    slots.push(
      `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`,
    );
    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}
