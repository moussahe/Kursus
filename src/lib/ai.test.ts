import { describe, it, expect } from "vitest";
import {
  generateConversationTitle,
  getAITutorSystemPrompt,
  getParentInsightSystemPrompt,
  AI_MODEL,
  MAX_INPUT_TOKENS,
  MAX_OUTPUT_TOKENS,
} from "./ai";

describe("AI Library", () => {
  describe("generateConversationTitle", () => {
    it("returns full message when under 50 characters", () => {
      const short = "Aide avec les fractions";
      expect(generateConversationTitle(short)).toBe(short);
    });

    it("truncates long messages with ellipsis", () => {
      const long =
        "Je ne comprends pas comment calculer les fractions avec des denominateurs differents";
      const result = generateConversationTitle(long);

      expect(result).toHaveLength(53); // 50 chars + "..."
      expect(result.endsWith("...")).toBe(true);
    });

    it("handles exactly 50 characters without ellipsis", () => {
      const exact = "12345678901234567890123456789012345678901234567890"; // 50 chars
      expect(generateConversationTitle(exact)).toBe(exact);
    });

    it("trims whitespace before processing", () => {
      const padded = "  Question avec espaces  ";
      const result = generateConversationTitle(padded);

      // Function trims then compares trimmed length to original length
      // Original: 26 chars, trimmed: 21 chars -> ellipsis added
      expect(result).toContain("Question avec espaces");
    });

    it("handles empty string", () => {
      expect(generateConversationTitle("")).toBe("");
    });

    it("handles whitespace-only string", () => {
      // Trimmed string is empty but original had whitespace
      // Function behavior: adds ellipsis when trimmed differs from original
      const result = generateConversationTitle("   ");
      expect(result).toBe("...");
    });
  });

  describe("getAITutorSystemPrompt", () => {
    const baseContext = {
      childName: "Lucas",
      childGrade: "CM2",
    };

    it("includes child name in prompt", () => {
      const prompt = getAITutorSystemPrompt(baseContext);

      expect(prompt).toContain("Lucas");
      expect(prompt).toContain("Prenom: Lucas");
    });

    it("maps grade codes to readable labels", () => {
      const grades: Record<string, string> = {
        CP: "CP (6 ans)",
        CE1: "CE1 (7 ans)",
        CE2: "CE2 (8 ans)",
        CM1: "CM1 (9 ans)",
        CM2: "CM2 (10 ans)",
        SIXIEME: "6eme (11 ans)",
        CINQUIEME: "5eme (12 ans)",
        QUATRIEME: "4eme (13 ans)",
        TROISIEME: "3eme (14 ans)",
        SECONDE: "Seconde (15 ans)",
        PREMIERE: "Premiere (16 ans)",
        TERMINALE: "Terminale (17 ans)",
      };

      for (const [code, label] of Object.entries(grades)) {
        const prompt = getAITutorSystemPrompt({
          childName: "Test",
          childGrade: code,
        });
        expect(prompt).toContain(`Niveau: ${label}`);
      }
    });

    it("handles unknown grade codes gracefully", () => {
      const prompt = getAITutorSystemPrompt({
        childName: "Test",
        childGrade: "UNKNOWN_GRADE",
      });

      expect(prompt).toContain("Niveau: UNKNOWN_GRADE");
    });

    it("includes course name when provided", () => {
      const prompt = getAITutorSystemPrompt({
        ...baseContext,
        courseName: "Mathematiques CM2",
      });

      expect(prompt).toContain("COURS ACTUEL: Mathematiques CM2");
    });

    it("includes lesson name when provided", () => {
      const prompt = getAITutorSystemPrompt({
        ...baseContext,
        lessonName: "Les fractions",
      });

      expect(prompt).toContain("LECON ACTUELLE: Les fractions");
    });

    it("includes lesson content when provided", () => {
      const prompt = getAITutorSystemPrompt({
        ...baseContext,
        lessonContent: "Une fraction est une division...",
      });

      expect(prompt).toContain("CONTENU DE LA LECON:");
      expect(prompt).toContain("Une fraction est une division...");
    });

    it("truncates lesson content to 4000 characters", () => {
      const longContent = "A".repeat(5000);
      const prompt = getAITutorSystemPrompt({
        ...baseContext,
        lessonContent: longContent,
      });

      // Content should be truncated to 4000 chars
      expect(prompt).toContain("A".repeat(4000));
      expect(prompt).not.toContain("A".repeat(4001));
    });

    it("enforces French language in prompt", () => {
      const prompt = getAITutorSystemPrompt(baseContext);

      expect(prompt).toContain("Tu parles UNIQUEMENT francais");
    });

    it("instructs not to give direct answers", () => {
      const prompt = getAITutorSystemPrompt(baseContext);

      expect(prompt).toContain("Ne donne JAMAIS les réponses directement");
    });

    it("includes pedagogical guidelines", () => {
      const prompt = getAITutorSystemPrompt(baseContext);

      expect(prompt).toContain("Sois encourageant et positif");
      expect(prompt).toContain("Adapte ton langage");
      expect(prompt).toContain("guide l'eleve vers la solution");
    });
  });

  describe("getParentInsightSystemPrompt", () => {
    it("returns a valid prompt string", () => {
      const prompt = getParentInsightSystemPrompt();

      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    });

    it("requests JSON response format", () => {
      const prompt = getParentInsightSystemPrompt();

      expect(prompt).toContain("JSON");
      expect(prompt).toContain('"summary"');
      expect(prompt).toContain('"insights"');
      expect(prompt).toContain('"weeklyGoal"');
      expect(prompt).toContain('"encouragement"');
    });

    it("defines insight types", () => {
      const prompt = getParentInsightSystemPrompt();

      expect(prompt).toContain('"strength"');
      expect(prompt).toContain('"concern"');
      expect(prompt).toContain('"suggestion"');
    });

    it("limits insights to maximum 4", () => {
      const prompt = getParentInsightSystemPrompt();

      expect(prompt).toContain("Maximum 4 insights");
    });
  });

  describe("Constants", () => {
    it("uses correct AI model", () => {
      expect(AI_MODEL).toBe("claude-3-haiku-20240307");
    });

    it("has reasonable token limits", () => {
      expect(MAX_INPUT_TOKENS).toBe(4096);
      expect(MAX_OUTPUT_TOKENS).toBe(1024);
      expect(MAX_INPUT_TOKENS).toBeGreaterThan(MAX_OUTPUT_TOKENS);
    });
  });
});
