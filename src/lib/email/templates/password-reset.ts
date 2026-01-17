import { baseEmailTemplate } from "./base";

interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetData): string {
  const content = `
    <h1>Reinitialisation de votre mot de passe</h1>
    <p>Bonjour ${data.userName},</p>
    <p>
      Vous avez demande a reinitialiser votre mot de passe sur Kursus.
      Cliquez sur le bouton ci-dessous pour creer un nouveau mot de passe.
    </p>

    <p style="text-align: center;">
      <a href="${data.resetUrl}" class="button">
        Reinitialiser mon mot de passe
      </a>
    </p>

    <p class="muted">
      Ce lien expire dans ${data.expiresIn}. Si vous n'avez pas demande cette reinitialisation,
      vous pouvez ignorer cet email en toute securite.
    </p>

    <div class="highlight">
      <p style="margin: 0; font-size: 14px;">
        <strong>Conseil securite :</strong> Ne partagez jamais ce lien avec personne.
        L'equipe Kursus ne vous demandera jamais votre mot de passe.
      </p>
    </div>
  `;

  return baseEmailTemplate(content);
}

export function passwordResetText(data: PasswordResetData): string {
  return `
Reinitialisation de votre mot de passe

Bonjour ${data.userName},

Vous avez demande a reinitialiser votre mot de passe sur Kursus.
Cliquez sur le lien ci-dessous pour creer un nouveau mot de passe:

${data.resetUrl}

Ce lien expire dans ${data.expiresIn}. Si vous n'avez pas demande cette reinitialisation,
vous pouvez ignorer cet email en toute securite.

Conseil securite : Ne partagez jamais ce lien avec personne.
L'equipe Kursus ne vous demandera jamais votre mot de passe.

---
Kursus - La plateforme d'apprentissage personnalise
  `.trim();
}
