import { baseEmailTemplate } from "./base";

interface PurchaseConfirmationData {
  parentName: string;
  courseName: string;
  teacherName: string;
  price: number;
  childName?: string;
  courseUrl: string;
}

export function purchaseConfirmationEmail(
  data: PurchaseConfirmationData,
): string {
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(data.price / 100);

  const content = `
    <h1>Merci pour votre achat !</h1>
    <p>Bonjour ${data.parentName},</p>
    <p>
      Votre achat a bien ete enregistre. ${data.childName ? `${data.childName} peut` : "Vous pouvez"}
      maintenant acceder au cours et commencer a apprendre !
    </p>

    <div class="highlight">
      <p style="margin: 0; font-weight: 600;">${data.courseName}</p>
      <p style="margin: 4px 0 0; color: #6b7280;">Par ${data.teacherName}</p>
      <p style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #10b981;">${formattedPrice}</p>
    </div>

    <p style="text-align: center;">
      <a href="${data.courseUrl}" class="button">
        Acceder au cours
      </a>
    </p>

    <p class="muted">
      Un recu detaille est disponible dans votre espace "Mes achats" sur la plateforme.
    </p>
  `;

  return baseEmailTemplate(content);
}

export function purchaseConfirmationText(
  data: PurchaseConfirmationData,
): string {
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(data.price / 100);

  return `
Merci pour votre achat !

Bonjour ${data.parentName},

Votre achat a bien ete enregistre. ${data.childName ? `${data.childName} peut` : "Vous pouvez"} maintenant acceder au cours et commencer a apprendre !

Cours: ${data.courseName}
Par: ${data.teacherName}
Prix: ${formattedPrice}

Acceder au cours: ${data.courseUrl}

Un recu detaille est disponible dans votre espace "Mes achats" sur la plateforme.

---
Kursus - La plateforme d'apprentissage personnalise
  `.trim();
}
