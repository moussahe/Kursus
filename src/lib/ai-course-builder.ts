import { anthropic } from "@/lib/anthropic";

export interface GeneratedLesson {
  title: string;
  description: string;
  duration: number; // minutes
  type: "video" | "text" | "quiz" | "exercise";
}

export interface GeneratedChapter {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedCourseStructure {
  title: string;
  subtitle: string;
  description: string;
  learningOutcomes: string[];
  requirements: string[];
  chapters: GeneratedChapter[];
  estimatedDuration: number; // total hours
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface CourseGenerationRequest {
  topic: string;
  subject: string;
  gradeLevel: string;
  targetDuration?: number; // hours
  additionalInstructions?: string;
}

const GRADE_LEVELS: Record<string, string> = {
  CP: "CP (6-7 ans)",
  CE1: "CE1 (7-8 ans)",
  CE2: "CE2 (8-9 ans)",
  CM1: "CM1 (9-10 ans)",
  CM2: "CM2 (10-11 ans)",
  SIXIEME: "6eme (11-12 ans)",
  CINQUIEME: "5eme (12-13 ans)",
  QUATRIEME: "4eme (13-14 ans)",
  TROISIEME: "3eme (14-15 ans)",
  SECONDE: "Seconde (15-16 ans)",
  PREMIERE: "Premiere (16-17 ans)",
  TERMINALE: "Terminale (17-18 ans)",
};

const SUBJECTS: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geographie",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "Sciences de la Vie et de la Terre",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "Sciences Economiques et Sociales",
  NSI: "Numerique et Sciences Informatiques",
};

export async function generateCourseStructure(
  request: CourseGenerationRequest,
): Promise<GeneratedCourseStructure> {
  const gradeLabel = GRADE_LEVELS[request.gradeLevel] || request.gradeLevel;
  const subjectLabel = SUBJECTS[request.subject] || request.subject;
  const targetDuration = request.targetDuration || 10;

  const prompt = `Tu es un expert en pédagogie et en creation de cours pour l'education nationale francaise.

CONTEXTE:
- Sujet du cours: ${request.topic}
- Matiere: ${subjectLabel}
- Niveau: ${gradeLabel}
- Duree cible: environ ${targetDuration} heures de contenu
${request.additionalInstructions ? `- Instructions supplementaires: ${request.additionalInstructions}` : ""}

MISSION:
Cree une structure de cours complete et pedagogiquement solide pour ce sujet.

REGLES PEDAGOGIQUES:
1. Adapte le vocabulaire et la complexite au niveau scolaire
2. Progresse du simple vers le complexe (pédagogie spiralaire)
3. Alterne theorie et pratique
4. Inclus des moments d'evaluation formative
5. Prevois des activités variees (video, lecture, exercices, quiz)
6. Chaque chapitre doit etre autonome mais lie au suivant
7. Les leçons doivent durer entre 10 et 30 minutes maximum

STRUCTURE ATTENDUE (JSON):
{
  "title": "Titre accrocheur du cours",
  "subtitle": "Sous-titre explicatif (1 phrase)",
  "description": "Description complete du cours (3-5 phrases)",
  "learningOutcomes": ["Objectif 1", "Objectif 2", "Objectif 3", "Objectif 4"],
  "requirements": ["Prerequis 1", "Prerequis 2"],
  "chapters": [
    {
      "title": "Titre du chapitre",
      "description": "Description du chapitre (1-2 phrases)",
      "lessons": [
        {
          "title": "Titre de la lecon",
          "description": "Ce que l'eleve va apprendre",
          "duration": 15,
          "type": "video|text|quiz|exercise"
        }
      ]
    }
  ],
  "estimatedDuration": 10,
  "difficulty": "beginner|intermediate|advanced"
}

IMPORTANT:
- Genere entre 4 et 8 chapitres
- Chaque chapitre doit avoir entre 3 et 6 leçons
- Varie les types de leçons (video pour intro, text pour theorie, exercise pour pratique, quiz pour evaluation)
- Le dernier chapitre doit etre un bilan/revision
- Sois creatif dans les titres pour engager les élèves

Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  const structure = JSON.parse(jsonMatch[0]) as GeneratedCourseStructure;

  // Validate and sanitize
  if (
    !structure.title ||
    !structure.chapters ||
    structure.chapters.length === 0
  ) {
    throw new Error("Invalid course structure generated");
  }

  return structure;
}

export async function generateChapterContent(
  courseTitle: string,
  chapterTitle: string,
  gradeLevel: string,
  subject: string,
): Promise<GeneratedChapter> {
  const gradeLabel = GRADE_LEVELS[gradeLevel] || gradeLevel;
  const subjectLabel = SUBJECTS[subject] || subject;

  const prompt = `Tu es un expert en pédagogie. Genere le contenu detaille pour ce chapitre.

COURS: ${courseTitle}
CHAPITRE: ${chapterTitle}
MATIERE: ${subjectLabel}
NIVEAU: ${gradeLabel}

Genere une structure de chapitre avec 4-6 leçons variees.
Reponds en JSON:
{
  "title": "${chapterTitle}",
  "description": "Description pedagogique",
  "lessons": [
    {"title": "...", "description": "...", "duration": 15, "type": "video|text|quiz|exercise"}
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedChapter;
}

export async function generateLessonContent(
  lessonTitle: string,
  lessonType: string,
  courseContext: string,
  gradeLevel: string,
): Promise<string> {
  const gradeLabel = GRADE_LEVELS[gradeLevel] || gradeLevel;

  const typeInstructions: Record<string, string> = {
    video:
      "Ecris un script video pedagogique avec introduction, developpement et conclusion.",
    text: "Ecris un cours structure avec titres, explications claires, exemples et points cles a retenir.",
    quiz: "Genere 5-10 questions QCM avec 4 options chacune et indique la bonne réponse.",
    exercise:
      "Cree des exercices progressifs avec enonces clairs et solutions detaillees.",
  };

  const prompt = `Tu es un expert en pédagogie pour le niveau ${gradeLabel}.

CONTEXTE: ${courseContext}
LECON: ${lessonTitle}
TYPE: ${lessonType}

${typeInstructions[lessonType] || typeInstructions.text}

Adapte le vocabulaire et la complexite au niveau scolaire.
Sois pedagogique, clair et engageant.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
