import { baseEmailTemplate } from "./base";
import type { AlertType } from "@prisma/client";

interface InactivityAlertData {
  parentName: string;
  childName: string;
  daysSinceActivity: number;
  courses: string[];
  dashboardUrl: string;
}

interface LowQuizScoreAlertData {
  parentName: string;
  childName: string;
  score: number;
  lessonTitle: string;
  courseTitle: string;
  dashboardUrl: string;
  aiTutorUrl: string;
}

interface MilestoneAlertData {
  parentName: string;
  childName: string;
  chapterTitle: string;
  courseTitle: string;
  lessonsCompleted: number;
  dashboardUrl: string;
}

export function inactivityAlertEmail(data: InactivityAlertData): string {
  const coursesHtml =
    data.courses.length > 0
      ? data.courses
          .map((c) => `<li style="margin-bottom: 4px;">${c}</li>`)
          .join("")
      : "";

  const content = `
    <h1 style="color: #f59e0b;">${data.childName} n'a pas etudie depuis ${data.daysSinceActivity} jours</h1>
    <p>Bonjour ${data.parentName},</p>
    <p>
      Nous avons remarque que <strong>${data.childName}</strong> n'a pas accede a ses cours
      depuis <strong>${data.daysSinceActivity} jours</strong>.
    </p>

    ${
      coursesHtml
        ? `
    <div class="highlight" style="background: #fef3c7; border-left-color: #f59e0b;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #d97706;">Cours en attente</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${coursesHtml}
      </ul>
    </div>
    `
        : ""
    }

    <p>
      Un petit rappel ou quelques mots d'encouragement peuvent faire toute la difference !
      L'apprentissage regulier, meme 15 minutes par jour, est plus efficace que de longues sessions espacees.
    </p>

    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" class="button">
        Voir la progression de ${data.childName}
      </a>
    </p>

    <div class="highlight" style="background: #f0fdf4; border-left-color: #10b981;">
      <p style="margin: 0; color: #374151;">
        <strong>Conseil :</strong> Essayez de creer une routine d'apprentissage quotidienne,
        par exemple apres les devoirs ou avant le diner.
      </p>
    </div>
  `;

  return baseEmailTemplate(content);
}

export function inactivityAlertText(data: InactivityAlertData): string {
  return `
${data.childName} n'a pas etudie depuis ${data.daysSinceActivity} jours

Bonjour ${data.parentName},

Nous avons remarque que ${data.childName} n'a pas accede a ses cours depuis ${data.daysSinceActivity} jours.

${data.courses.length > 0 ? `Cours en attente:\n${data.courses.map((c) => `- ${c}`).join("\n")}` : ""}

Un petit rappel ou quelques mots d'encouragement peuvent faire toute la difference !
L'apprentissage regulier, meme 15 minutes par jour, est plus efficace que de longues sessions espacees.

Voir la progression: ${data.dashboardUrl}

Conseil: Essayez de creer une routine d'apprentissage quotidienne, par exemple apres les devoirs ou avant le diner.

---
Schoolaris - La plateforme d'apprentissage personnalise
  `.trim();
}

export function lowQuizScoreAlertEmail(data: LowQuizScoreAlertData): string {
  const scoreColor =
    data.score < 30 ? "#ef4444" : data.score < 50 ? "#f59e0b" : "#f59e0b";

  const content = `
    <h1 style="color: ${scoreColor};">${data.childName} a besoin d'aide</h1>
    <p>Bonjour ${data.parentName},</p>
    <p>
      <strong>${data.childName}</strong> a obtenu <strong style="color: ${scoreColor};">${data.score}%</strong>
      au quiz de la lecon "<strong>${data.lessonTitle}</strong>" du cours "${data.courseTitle}".
    </p>

    <div class="highlight" style="background: #fef3c7; border-left-color: #f59e0b;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #d97706;">Ce que cela signifie</h3>
      <p style="margin: 0; color: #374151;">
        ${data.childName} semble avoir des difficultes avec cette lecon.
        Pas de panique ! C'est tout a fait normal de ne pas tout comprendre du premier coup.
      </p>
    </div>

    <div class="highlight" style="background: #f0fdf4; border-left-color: #10b981;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #10b981;">Notre solution</h3>
      <p style="margin: 0; color: #374151;">
        L'<strong>Assistant IA Schoolaris</strong> peut aider ${data.childName} a mieux comprendre
        cette lecon avec des explications personnalisees et des exercices adaptes.
      </p>
    </div>

    <p style="text-align: center;">
      <a href="${data.aiTutorUrl}" class="button" style="margin-right: 8px;">
        Utiliser l'Assistant IA
      </a>
    </p>
    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" style="color: #6b7280; font-size: 14px;">
        Voir le tableau de bord
      </a>
    </p>

    <p class="muted" style="text-align: center; margin-top: 24px;">
      L'apprentissage est un processus. Chaque erreur est une opportunite de progresser !
    </p>
  `;

  return baseEmailTemplate(content);
}

export function lowQuizScoreAlertText(data: LowQuizScoreAlertData): string {
  return `
${data.childName} a besoin d'aide

Bonjour ${data.parentName},

${data.childName} a obtenu ${data.score}% au quiz de la lecon "${data.lessonTitle}" du cours "${data.courseTitle}".

CE QUE CELA SIGNIFIE
${data.childName} semble avoir des difficultes avec cette lecon. Pas de panique ! C'est tout a fait normal de ne pas tout comprendre du premier coup.

NOTRE SOLUTION
L'Assistant IA Schoolaris peut aider ${data.childName} a mieux comprendre cette lecon avec des explications personnalisees et des exercices adaptes.

Utiliser l'Assistant IA: ${data.aiTutorUrl}
Voir le tableau de bord: ${data.dashboardUrl}

L'apprentissage est un processus. Chaque erreur est une opportunite de progresser !

---
Schoolaris - La plateforme d'apprentissage personnalise
  `.trim();
}

export function milestoneAlertEmail(data: MilestoneAlertData): string {
  const content = `
    <h1 style="color: #10b981;">Felicitations a ${data.childName} !</h1>
    <p>Bonjour ${data.parentName},</p>
    <p>
      Excellente nouvelle ! <strong>${data.childName}</strong> vient de terminer le chapitre
      "<strong>${data.chapterTitle}</strong>" du cours "${data.courseTitle}" !
    </p>

    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h2 style="margin: 0 0 8px; color: #10b981;">${data.lessonsCompleted} leçons completees</h2>
      <p style="margin: 0; color: #374151;">${data.chapterTitle}</p>
    </div>

    <div class="highlight" style="background: #f0fdf4; border-left-color: #10b981;">
      <p style="margin: 0; color: #374151;">
        <strong>Conseil :</strong> Felicitez ${data.childName} pour ses efforts !
        La reconnaissance des progres motive a continuer.
      </p>
    </div>

    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" class="button">
        Voir tous les progres
      </a>
    </p>

    <p class="muted" style="text-align: center;">
      Continuez comme ca, ${data.childName} ! Chaque chapitre termine est une victoire !
    </p>
  `;

  return baseEmailTemplate(content);
}

export function milestoneAlertText(data: MilestoneAlertData): string {
  return `
Felicitations a ${data.childName} !

Bonjour ${data.parentName},

Excellente nouvelle ! ${data.childName} vient de terminer le chapitre "${data.chapterTitle}" du cours "${data.courseTitle}" !

${data.lessonsCompleted} leçons completees

Conseil: Felicitez ${data.childName} pour ses efforts ! La reconnaissance des progres motive a continuer.

Voir tous les progres: ${data.dashboardUrl}

Continuez comme ca, ${data.childName} ! Chaque chapitre termine est une victoire !

---
Schoolaris - La plateforme d'apprentissage personnalise
  `.trim();
}

// Helper to get the appropriate email template based on alert type
export function getAlertEmailTemplate(
  type: AlertType,
  data: Record<string, unknown>,
  parentName: string,
  childName: string,
  baseUrl: string,
): { html: string; text: string; subject: string } | null {
  switch (type) {
    case "INACTIVITY": {
      const inactivityData: InactivityAlertData = {
        parentName,
        childName,
        daysSinceActivity: (data.daysSinceActivity as number) || 3,
        courses: (data.courses as string[]) || [],
        dashboardUrl: `${baseUrl}${data.actionUrl || "/parent"}`,
      };
      return {
        html: inactivityAlertEmail(inactivityData),
        text: inactivityAlertText(inactivityData),
        subject: `${childName} n'a pas etudie depuis ${inactivityData.daysSinceActivity} jours`,
      };
    }
    case "LOW_QUIZ_SCORE": {
      const lowScoreData: LowQuizScoreAlertData = {
        parentName,
        childName,
        score: (data.score as number) || 0,
        lessonTitle: (data.lessonTitle as string) || "une lecon",
        courseTitle: (data.courseTitle as string) || "un cours",
        dashboardUrl: `${baseUrl}${data.actionUrl || "/parent"}`,
        aiTutorUrl: `${baseUrl}/student/ai-tutor`,
      };
      return {
        html: lowQuizScoreAlertEmail(lowScoreData),
        text: lowQuizScoreAlertText(lowScoreData),
        subject: `${childName} a obtenu ${lowScoreData.score}% - Besoin d'aide ?`,
      };
    }
    case "MILESTONE": {
      const milestoneData: MilestoneAlertData = {
        parentName,
        childName,
        chapterTitle: (data.chapterTitle as string) || "un chapitre",
        courseTitle: (data.courseTitle as string) || "un cours",
        lessonsCompleted: (data.lessonsCompleted as number) || 0,
        dashboardUrl: `${baseUrl}${data.actionUrl || "/parent"}`,
      };
      return {
        html: milestoneAlertEmail(milestoneData),
        text: milestoneAlertText(milestoneData),
        subject: `Bravo ! ${childName} a termine "${milestoneData.chapterTitle}"`,
      };
    }
    default:
      return null;
  }
}
