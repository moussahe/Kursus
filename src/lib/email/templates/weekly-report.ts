import { baseEmailTemplate } from "./base";

interface WeeklyReportData {
  parentName: string;
  childName: string;
  weekRange: string;
  stats: {
    lessonsCompleted: number;
    quizzesCompleted: number;
    averageScore: number;
    timeSpentMinutes: number;
    xpEarned?: number;
  };
  highlights: string[];
  areasToImprove: string[];
  recommendations: string[];
  dashboardUrl: string;
}

export function weeklyReportEmail(data: WeeklyReportData): string {
  const hours = Math.floor(data.stats.timeSpentMinutes / 60);
  const minutes = data.stats.timeSpentMinutes % 60;
  const timeSpent = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  const highlightsHtml =
    data.highlights.length > 0
      ? data.highlights
          .map((h) => `<li style="margin-bottom: 8px;">${h}</li>`)
          .join("")
      : "<li>Continue comme ca !</li>";

  const areasHtml =
    data.areasToImprove.length > 0
      ? data.areasToImprove
          .map((a) => `<li style="margin-bottom: 8px;">${a}</li>`)
          .join("")
      : "<li>Aucun point faible identifie cette semaine</li>";

  const recommendationsHtml =
    data.recommendations.length > 0
      ? data.recommendations
          .map((r) => `<li style="margin-bottom: 8px;">${r}</li>`)
          .join("")
      : "";

  const content = `
    <h1>Rapport hebdomadaire de ${data.childName}</h1>
    <p>Bonjour ${data.parentName},</p>
    <p>
      Voici le resume de la semaine d'apprentissage de ${data.childName}
      pour la periode du ${data.weekRange}.
    </p>

    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h2 style="margin: 0 0 16px; font-size: 18px;">Statistiques de la semaine</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280;">Leçons completees</span>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
            ${data.stats.lessonsCompleted}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280;">Quiz realises</span>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
            ${data.stats.quizzesCompleted}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280;">Score moyen</span>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: ${data.stats.averageScore >= 70 ? "#10b981" : data.stats.averageScore >= 50 ? "#f59e0b" : "#ef4444"};">
            ${data.stats.averageScore}%
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280;">Temps d'etude</span>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
            ${timeSpent}
          </td>
        </tr>
        ${
          data.stats.xpEarned
            ? `
        <tr>
          <td style="padding: 8px 0;">
            <span style="color: #6b7280;">XP gagnes</span>
          </td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #8b5cf6;">
            +${data.stats.xpEarned} XP
          </td>
        </tr>
        `
            : ""
        }
      </table>
    </div>

    <div class="highlight" style="background: #f0fdf4; border-left-color: #10b981;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #10b981;">Points forts</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${highlightsHtml}
      </ul>
    </div>

    <div class="highlight" style="background: #fef3c7; border-left-color: #f59e0b;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #d97706;">A ameliorer</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${areasHtml}
      </ul>
    </div>

    ${
      recommendationsHtml
        ? `
    <div class="highlight" style="background: #eff6ff; border-left-color: #3b82f6;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #2563eb;">Nos recommandations</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${recommendationsHtml}
      </ul>
    </div>
    `
        : ""
    }

    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" class="button">
        Voir le tableau de bord complet
      </a>
    </p>

    <p class="muted" style="text-align: center;">
      Merci de faire confiance a Kursus pour l'apprentissage de ${data.childName} !
    </p>
  `;

  return baseEmailTemplate(content);
}

export function weeklyReportText(data: WeeklyReportData): string {
  const hours = Math.floor(data.stats.timeSpentMinutes / 60);
  const minutes = data.stats.timeSpentMinutes % 60;
  const timeSpent = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  return `
Rapport hebdomadaire de ${data.childName}

Bonjour ${data.parentName},

Voici le resume de la semaine d'apprentissage de ${data.childName}
pour la periode du ${data.weekRange}.

STATISTIQUES
- Leçons completees: ${data.stats.lessonsCompleted}
- Quiz realises: ${data.stats.quizzesCompleted}
- Score moyen: ${data.stats.averageScore}%
- Temps d'etude: ${timeSpent}
${data.stats.xpEarned ? `- XP gagnes: +${data.stats.xpEarned} XP` : ""}

POINTS FORTS
${data.highlights.length > 0 ? data.highlights.map((h) => `- ${h}`).join("\n") : "- Continue comme ca !"}

A AMELIORER
${data.areasToImprove.length > 0 ? data.areasToImprove.map((a) => `- ${a}`).join("\n") : "- Aucun point faible identifie cette semaine"}

${
  data.recommendations.length > 0
    ? `NOS RECOMMANDATIONS
${data.recommendations.map((r) => `- ${r}`).join("\n")}`
    : ""
}

Voir le tableau de bord: ${data.dashboardUrl}

---
Kursus - La plateforme d'apprentissage personnalise
  `.trim();
}
