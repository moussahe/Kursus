import { describe, it, expect } from "vitest";
import { calculateNextDifficulty, AdaptiveQuizState } from "./quiz";

describe("calculateNextDifficulty", () => {
  const baseState: AdaptiveQuizState = {
    currentDifficulty: "medium",
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    questionsAnswered: 0,
    performanceHistory: [],
  };

  describe("difficulty increase", () => {
    it("increases from easy to medium after 2 consecutive correct", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "easy",
        consecutiveCorrect: 2,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("increases from medium to hard after 2 consecutive correct", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "medium",
        consecutiveCorrect: 2,
      };
      expect(calculateNextDifficulty(state)).toBe("hard");
    });

    it("stays at hard even with more consecutive correct", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "hard",
        consecutiveCorrect: 5,
      };
      expect(calculateNextDifficulty(state)).toBe("hard");
    });

    it("increases with exactly 2 consecutive correct", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "easy",
        consecutiveCorrect: 2,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("does not increase with only 1 consecutive correct", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "easy",
        consecutiveCorrect: 1,
      };
      expect(calculateNextDifficulty(state)).toBe("easy");
    });
  });

  describe("difficulty decrease", () => {
    it("decreases from hard to medium after 2 consecutive wrong", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "hard",
        consecutiveWrong: 2,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("decreases from medium to easy after 2 consecutive wrong", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "medium",
        consecutiveWrong: 2,
      };
      expect(calculateNextDifficulty(state)).toBe("easy");
    });

    it("stays at easy even with more consecutive wrong", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "easy",
        consecutiveWrong: 5,
      };
      expect(calculateNextDifficulty(state)).toBe("easy");
    });

    it("does not decrease with only 1 consecutive wrong", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "hard",
        consecutiveWrong: 1,
      };
      expect(calculateNextDifficulty(state)).toBe("hard");
    });
  });

  describe("no change scenarios", () => {
    it("stays at current difficulty with 0 consecutive", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "medium",
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("stays at current difficulty with mixed results", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "medium",
        consecutiveCorrect: 1,
        consecutiveWrong: 1,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("prioritizes increase over decrease when both thresholds met", () => {
      // Edge case: both consecutiveCorrect and consecutiveWrong >= 2
      // (shouldn't happen in normal flow, but testing the code path)
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "medium",
        consecutiveCorrect: 2,
        consecutiveWrong: 2,
      };
      // Code checks correct first, so it should increase
      expect(calculateNextDifficulty(state)).toBe("hard");
    });
  });

  describe("edge cases", () => {
    it("handles high consecutive correct counts", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "easy",
        consecutiveCorrect: 100,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("handles high consecutive wrong counts", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "hard",
        consecutiveWrong: 100,
      };
      expect(calculateNextDifficulty(state)).toBe("medium");
    });

    it("works with populated performance history", () => {
      const state: AdaptiveQuizState = {
        ...baseState,
        currentDifficulty: "medium",
        consecutiveCorrect: 2,
        questionsAnswered: 10,
        performanceHistory: [
          { difficulty: "easy", correct: true },
          { difficulty: "medium", correct: false },
          { difficulty: "medium", correct: true },
        ],
      };
      expect(calculateNextDifficulty(state)).toBe("hard");
    });
  });
});
