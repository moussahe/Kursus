import { baseEmailTemplate } from "./base";

const BASE_URL = process.env.NEXTAUTH_URL || "https://schoolaris.fr";

interface CourseModerationData {
  teacherName: string;
  courseName: string;
  courseId: string;
  feedback?: string;
}

// =====================================================
// COURSE APPROVED
// =====================================================
export function courseApprovedEmail(data: CourseModerationData): string {
  const courseUrl = `${BASE_URL}/courses/${data.courseId}`;
  const dashboardUrl = `${BASE_URL}/teacher/dashboard`;

  const content = `
    <h1>Votre cours est approuve !</h1>
    <p>Bonjour ${data.teacherName},</p>
    <p>
      Excellente nouvelle ! Votre cours <strong>"${data.courseName}"</strong>
      a ete approuve par notre equipe de moderation et est maintenant
      <strong>publie sur Schoolaris</strong>.
    </p>

    <div class="highlight" style="background: #f0fdf4; border-left-color: #10b981;">
      <p style="margin: 0; font-weight: 600; color: #10b981;">Cours publie</p>
      <p style="margin: 8px 0 0;">${data.courseName}</p>
    </div>

    <p>
      Les eleves peuvent desormais decouvrir et s'inscrire a votre cours.
      N'hesitez pas a le partager sur vos reseaux pour maximiser sa visibilite !
    </p>

    <p style="text-align: center;">
      <a href="${courseUrl}" class="button">
        Voir mon cours
      </a>
    </p>

    <p class="muted">
      Suivez les inscriptions et les revenus generes depuis votre
      <a href="${dashboardUrl}">tableau de bord professeur</a>.
    </p>
  `;

  return baseEmailTemplate(content);
}

export function courseApprovedText(data: CourseModerationData): string {
  const courseUrl = `${BASE_URL}/courses/${data.courseId}`;

  return `
Votre cours est approuve !

Bonjour ${data.teacherName},

Excellente nouvelle ! Votre cours "${data.courseName}" a ete approuve par notre equipe de moderation et est maintenant publie sur Schoolaris.

Les eleves peuvent desormais decouvrir et s'inscrire a votre cours.

Voir mon cours: ${courseUrl}

---
Schoolaris - La plateforme d'apprentissage personnalise
  `.trim();
}

// =====================================================
// COURSE REJECTED
// =====================================================
export function courseRejectedEmail(data: CourseModerationData): string {
  const editUrl = `${BASE_URL}/teacher/courses/${data.courseId}/edit`;
  const supportUrl = `${BASE_URL}/support`;

  const content = `
    <h1>Cours non approuve</h1>
    <p>Bonjour ${data.teacherName},</p>
    <p>
      Nous avons examine votre cours <strong>"${data.courseName}"</strong>
      et malheureusement, il ne peut pas etre publie en l'etat.
    </p>

    ${
      data.feedback
        ? `
    <div class="highlight" style="background: #fef2f2; border-left-color: #ef4444;">
      <p style="margin: 0; font-weight: 600; color: #ef4444;">Motif du refus</p>
      <p style="margin: 8px 0 0;">${data.feedback}</p>
    </div>
    `
        : ""
    }

    <p>
      Nous vous encourageons a revoir votre contenu en tenant compte de ces
      remarques. Vous pourrez ensuite soumettre a nouveau votre cours pour
      moderation.
    </p>

    <p style="text-align: center;">
      <a href="${editUrl}" class="button" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
        Modifier mon cours
      </a>
    </p>

    <p class="muted">
      Si vous avez des questions sur cette decision, notre
      <a href="${supportUrl}">equipe support</a> est la pour vous aider.
    </p>
  `;

  return baseEmailTemplate(content);
}

export function courseRejectedText(data: CourseModerationData): string {
  const editUrl = `${BASE_URL}/teacher/courses/${data.courseId}/edit`;

  let text = `
Cours non approuve

Bonjour ${data.teacherName},

Nous avons examine votre cours "${data.courseName}" et malheureusement, il ne peut pas etre publie en l'etat.
`;

  if (data.feedback) {
    text += `
Motif du refus:
${data.feedback}
`;
  }

  text += `
Nous vous encourageons a revoir votre contenu et a soumettre a nouveau votre cours.

Modifier mon cours: ${editUrl}

---
Schoolaris - La plateforme d'apprentissage personnalise
  `;

  return text.trim();
}

// =====================================================
// CHANGES REQUESTED
// =====================================================
export function courseChangesRequestedEmail(
  data: CourseModerationData,
): string {
  const editUrl = `${BASE_URL}/teacher/courses/${data.courseId}/edit`;

  const content = `
    <h1>Modifications demandees</h1>
    <p>Bonjour ${data.teacherName},</p>
    <p>
      Nous avons examine votre cours <strong>"${data.courseName}"</strong>
      et quelques ajustements sont necessaires avant sa publication.
    </p>

    ${
      data.feedback
        ? `
    <div class="highlight" style="background: #fffbeb; border-left-color: #f59e0b;">
      <p style="margin: 0; font-weight: 600; color: #f59e0b;">Modifications demandees</p>
      <p style="margin: 8px 0 0;">${data.feedback}</p>
    </div>
    `
        : ""
    }

    <p>
      Une fois les modifications effectuees, votre cours sera automatiquement
      resoumis pour validation. Notre equipe l'examinera dans les plus brefs delais.
    </p>

    <p style="text-align: center;">
      <a href="${editUrl}" class="button" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        Modifier mon cours
      </a>
    </p>

    <p class="muted">
      Ces retours visent a garantir la meilleure experience possible pour
      vos futurs eleves. Merci de votre comprehension !
    </p>
  `;

  return baseEmailTemplate(content);
}

export function courseChangesRequestedText(data: CourseModerationData): string {
  const editUrl = `${BASE_URL}/teacher/courses/${data.courseId}/edit`;

  let text = `
Modifications demandees

Bonjour ${data.teacherName},

Nous avons examine votre cours "${data.courseName}" et quelques ajustements sont necessaires avant sa publication.
`;

  if (data.feedback) {
    text += `
Modifications demandees:
${data.feedback}
`;
  }

  text += `
Une fois les modifications effectuees, votre cours sera automatiquement resoumis pour validation.

Modifier mon cours: ${editUrl}

---
Schoolaris - La plateforme d'apprentissage personnalise
  `;

  return text.trim();
}
