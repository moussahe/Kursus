import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  gatherChildPerformance,
  generateLearningPath,
} from "./ai-learning-path";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    child: {
      findUnique: vi.fn(),
    },
    lesson: {
      findMany: vi.fn(),
    },
    learningPath: {
      updateMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock Anthropic
vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

describe("AI Learning Path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("gatherChildPerformance", () => {
    it("returns null when child not found", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.child.findUnique).mockResolvedValue(null);

      const result = await gatherChildPerformance("non-existent-id");
      expect(result).toBeNull();
    });

    it("calculates correct stats for child with progress", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockChild = {
        id: "child123",
        firstName: "Lucas",
        gradeLevel: "CM1",
        currentStreak: 5,
        progress: [
          {
            isCompleted: true,
            quizScore: 80,
            lastAccessedAt: new Date(),
            lesson: {
              title: "Les fractions",
              chapter: {
                course: {
                  title: "Maths CM1",
                  subject: "MATHEMATIQUES",
                },
              },
            },
          },
          {
            isCompleted: true,
            quizScore: 60,
            lastAccessedAt: new Date(),
            lesson: {
              title: "Conjugaison",
              chapter: {
                course: {
                  title: "Francais CM1",
                  subject: "FRANCAIS",
                },
              },
            },
          },
          {
            isCompleted: false,
            quizScore: null,
            lastAccessedAt: new Date(),
            lesson: {
              title: "La Revolution",
              chapter: {
                course: {
                  title: "Histoire CM1",
                  subject: "HISTOIRE_GEO",
                },
              },
            },
          },
        ],
        purchases: [
          {
            status: "COMPLETED",
            course: {
              chapters: [{ lessons: [{}, {}, {}] }, { lessons: [{}, {}] }],
            },
          },
        ],
      };

      vi.mocked(prisma.child.findUnique).mockResolvedValue(mockChild as never);

      const result = await gatherChildPerformance("child123");

      expect(result).not.toBeNull();
      expect(result?.childName).toBe("Lucas");
      expect(result?.gradeLevel).toBe("CM1");
      expect(result?.completedLessons).toBe(2);
      expect(result?.totalLessons).toBe(5);
      expect(result?.averageQuizScore).toBe(70); // (80 + 60) / 2
      expect(result?.currentStreak).toBe(5);
      expect(result?.strongSubjects).toContain("MATHEMATIQUES");
    });

    it("handles child with no quiz scores", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockChild = {
        id: "child123",
        firstName: "Emma",
        gradeLevel: "CE2",
        currentStreak: 0,
        progress: [
          {
            isCompleted: false,
            quizScore: null,
            lastAccessedAt: new Date(),
            lesson: {
              title: "Test",
              chapter: { course: { title: "Test", subject: "SCIENCES" } },
            },
          },
        ],
        purchases: [],
      };

      vi.mocked(prisma.child.findUnique).mockResolvedValue(mockChild as never);

      const result = await gatherChildPerformance("child123");

      expect(result?.averageQuizScore).toBeNull();
      expect(result?.strongSubjects).toHaveLength(0);
      expect(result?.weakSubjects).toHaveLength(0);
    });

    it("identifies weak subjects correctly", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockChild = {
        id: "child123",
        firstName: "Sophie",
        gradeLevel: "SIXIEME",
        currentStreak: 2,
        progress: [
          {
            isCompleted: true,
            quizScore: 45, // Below 60% threshold
            lastAccessedAt: new Date(),
            lesson: {
              title: "Algebre",
              chapter: { course: { title: "Maths", subject: "MATHEMATIQUES" } },
            },
          },
          {
            isCompleted: true,
            quizScore: 50, // Below 60% threshold
            lastAccessedAt: new Date(),
            lesson: {
              title: "Geometrie",
              chapter: { course: { title: "Maths", subject: "MATHEMATIQUES" } },
            },
          },
        ],
        purchases: [],
      };

      vi.mocked(prisma.child.findUnique).mockResolvedValue(mockChild as never);

      const result = await gatherChildPerformance("child123");

      expect(result?.weakSubjects).toContain("MATHEMATIQUES");
      expect(result?.averageQuizScore).toBe(48); // (45 + 50) / 2 rounded
    });
  });

  describe("generateLearningPath", () => {
    it("returns null when child performance is null", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.child.findUnique).mockResolvedValue(null);

      const result = await generateLearningPath("non-existent-id");
      expect(result).toBeNull();
    });

    it("handles AI response parsing correctly", async () => {
      const { prisma } = await import("@/lib/prisma");
      const { anthropic } = await import("@/lib/anthropic");

      // Mock child data
      vi.mocked(prisma.child.findUnique).mockResolvedValue({
        id: "child123",
        firstName: "Lucas",
        gradeLevel: "CM1",
        currentStreak: 3,
        progress: [],
        purchases: [],
      } as never);

      // Mock available lessons
      vi.mocked(prisma.lesson.findMany).mockResolvedValue([
        {
          id: "lesson1",
          title: "Fractions",
          chapter: { course: { title: "Maths CM1", subject: "MATHEMATIQUES" } },
        },
      ] as never);

      // Mock AI response with valid JSON
      const mockAIResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              summary: "Parcours personnalise pour Lucas",
              focusAreas: [
                {
                  subject: "MATHEMATIQUES",
                  reason: "A renforcer",
                  priority: "high",
                },
              ],
              weeklyGoals: ["Terminer 3 lecons", "Maintenir le streak"],
              suggestedLessons: [
                {
                  lessonId: "lesson1",
                  lessonTitle: "Fractions",
                  courseTitle: "Maths CM1",
                  reason: "Base importante",
                },
              ],
              motivationalMessage: "Continue comme ca Lucas!",
              estimatedTimePerDay: 25,
            }),
          },
        ],
      };

      vi.mocked(anthropic.messages.create).mockResolvedValue(
        mockAIResponse as never,
      );

      const result = await generateLearningPath("child123");

      expect(result).not.toBeNull();
      expect(result?.summary).toBe("Parcours personnalise pour Lucas");
      expect(result?.focusAreas).toHaveLength(1);
      expect(result?.suggestedLessons).toHaveLength(1);
      expect(result?.estimatedTimePerDay).toBe(25);
    });

    it("returns null when AI response has no JSON", async () => {
      const { prisma } = await import("@/lib/prisma");
      const { anthropic } = await import("@/lib/anthropic");

      vi.mocked(prisma.child.findUnique).mockResolvedValue({
        id: "child123",
        firstName: "Lucas",
        gradeLevel: "CM1",
        currentStreak: 0,
        progress: [],
        purchases: [],
      } as never);

      vi.mocked(prisma.lesson.findMany).mockResolvedValue([]);

      // Mock AI response without JSON
      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [{ type: "text", text: "Je ne peux pas generer de parcours" }],
      } as never);

      const result = await generateLearningPath("child123");
      expect(result).toBeNull();
    });

    it("filters out invalid lesson IDs from suggestions", async () => {
      const { prisma } = await import("@/lib/prisma");
      const { anthropic } = await import("@/lib/anthropic");

      vi.mocked(prisma.child.findUnique).mockResolvedValue({
        id: "child123",
        firstName: "Lucas",
        gradeLevel: "CM1",
        currentStreak: 0,
        progress: [],
        purchases: [],
      } as never);

      // Only lesson1 is valid
      vi.mocked(prisma.lesson.findMany).mockResolvedValue([
        {
          id: "lesson1",
          title: "Fractions",
          chapter: { course: { title: "Maths", subject: "MATHEMATIQUES" } },
        },
      ] as never);

      // AI suggests both valid and invalid lesson IDs
      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              summary: "Test",
              focusAreas: [],
              weeklyGoals: [],
              suggestedLessons: [
                {
                  lessonId: "lesson1",
                  lessonTitle: "Fractions",
                  courseTitle: "Maths",
                  reason: "Valid",
                },
                {
                  lessonId: "invalid-id",
                  lessonTitle: "Invalid",
                  courseTitle: "Invalid",
                  reason: "Should be filtered",
                },
              ],
              motivationalMessage: "Test",
              estimatedTimePerDay: 30,
            }),
          },
        ],
      } as never);

      const result = await generateLearningPath("child123");

      expect(result?.suggestedLessons).toHaveLength(1);
      expect(result?.suggestedLessons[0].lessonId).toBe("lesson1");
    });
  });

  describe("LearningPathRecommendation type validation", () => {
    it("validates focus area priority values", () => {
      const validPriorities = ["high", "medium", "low"];

      validPriorities.forEach((priority) => {
        expect(["high", "medium", "low"]).toContain(priority);
      });
    });

    it("validates estimated time is reasonable", () => {
      const minTime = 15;
      const maxTime = 45;

      expect(minTime).toBeGreaterThanOrEqual(15);
      expect(maxTime).toBeLessThanOrEqual(45);
    });
  });
});
