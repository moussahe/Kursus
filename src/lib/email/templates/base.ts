// Base email template with Kursus branding
export function baseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kursus</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      padding: 32px;
      text-align: center;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 32px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      padding: 24px 32px;
      background: #f9fafb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
    h1 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 700;
    }
    p {
      margin: 0 0 16px;
      line-height: 1.6;
    }
    .highlight {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    .muted {
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <a href="${process.env.NEXTAUTH_URL || "https://kursus.fr"}" class="logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m4 6 8-4 8 4"/>
              <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/>
              <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
              <path d="M18 5v17"/>
              <path d="m4 6 8 4 8-4"/>
              <path d="M12 10v12"/>
            </svg>
          </div>
          <span class="logo-text">Kursus</span>
        </a>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>
          Kursus - La plateforme d'apprentissage personnalise<br>
          <a href="${process.env.NEXTAUTH_URL || "https://kursus.fr"}">kursus.fr</a>
        </p>
        <p class="muted" style="margin-top: 16px;">
          Vous recevez cet email car vous etes inscrit sur Kursus.<br>
          <a href="${process.env.NEXTAUTH_URL || "https://kursus.fr"}/dashboard/settings">Gerer vos preferences</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
