import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import {
  formatGradeLevel,
  formatSubject,
  formatCertificateDate,
  formatDuration,
} from "@/lib/certificate-utils";

// GET /api/certificates/[certificateId]/pdf - Generate printable certificate HTML
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorized();
    }

    const { certificateId } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        child: {
          select: {
            parentId: true,
          },
        },
      },
    });

    if (!certificate) {
      return notFound("Certificat non trouve");
    }

    // Verify ownership
    if (certificate.child.parentId !== session.user.id) {
      return forbidden("Acces non autorise a ce certificat");
    }

    // Generate HTML certificate
    const html = generateCertificateHTML(certificate);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="certificat-${certificate.certificateNumber}.html"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

interface CertificateData {
  certificateNumber: string;
  childName: string;
  courseName: string;
  teacherName: string;
  gradeLevel: string;
  subject: string;
  completionDate: Date;
  totalLessons: number;
  lessonsCompleted: number;
  averageQuizScore: number | null;
  totalTimeSpent: number;
  verificationCode: string;
}

function generateCertificateHTML(certificate: CertificateData): string {
  const formattedDate = formatCertificateDate(certificate.completionDate);
  const formattedGrade = formatGradeLevel(certificate.gradeLevel);
  const formattedSubject = formatSubject(certificate.subject);
  const formattedDuration = formatDuration(certificate.totalTimeSpent);
  const quizScore =
    certificate.averageQuizScore !== null
      ? `${Math.round(certificate.averageQuizScore)}%`
      : "N/A";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificat - ${certificate.courseName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .certificate {
      width: 297mm;
      height: 210mm;
      max-width: 100%;
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: hidden;
    }

    .border-decoration {
      position: absolute;
      inset: 12px;
      border: 3px solid #667eea;
      border-radius: 12px;
      pointer-events: none;
    }

    .border-decoration::before {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .corner-decoration {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 3px solid #667eea;
    }

    .corner-tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
    .corner-tr { top: 20px; right: 20px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 20px; left: 20px; border-right: none; border-top: none; }
    .corner-br { bottom: 20px; right: 20px; border-left: none; border-top: none; }

    .content {
      padding: 50px 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .logo span {
      color: #764ba2;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #1f2937;
      margin-top: 20px;
      letter-spacing: 2px;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-top: 8px;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .certifies {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .completion-text {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .course-name {
      font-size: 24px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 24px;
    }

    .details {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 16px;
      padding: 16px 32px;
      background: #f9fafb;
      border-radius: 12px;
    }

    .detail-item {
      text-align: center;
    }

    .detail-label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
      padding-top: 20px;
    }

    .signature-block {
      text-align: center;
    }

    .signature-line {
      width: 180px;
      height: 1px;
      background: #d1d5db;
      margin-bottom: 8px;
    }

    .signature-label {
      font-size: 12px;
      color: #6b7280;
    }

    .certificate-info {
      text-align: right;
      font-size: 11px;
      color: #9ca3af;
    }

    .certificate-number {
      font-weight: 600;
      color: #6b7280;
    }

    .verification {
      margin-top: 4px;
    }

    .seal {
      position: absolute;
      bottom: 60px;
      right: 100px;
      width: 100px;
      height: 100px;
      border: 3px solid #667eea;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
    }

    .seal-text {
      font-size: 9px;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .seal-icon {
      font-size: 28px;
      margin: 4px 0;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .certificate {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-decoration"></div>
    <div class="corner-decoration corner-tl"></div>
    <div class="corner-decoration corner-tr"></div>
    <div class="corner-decoration corner-bl"></div>
    <div class="corner-decoration corner-br"></div>

    <div class="content">
      <div class="header">
        <div class="logo">School<span>aris</span></div>
        <div class="subtitle">Plateforme Educative</div>
        <h1 class="title">CERTIFICAT DE COMPLETION</h1>
      </div>

      <div class="main-content">
        <p class="certifies">Ceci certifie que</p>
        <h2 class="student-name">${certificate.childName}</h2>
        <p class="completion-text">a complete avec succes le cours</p>
        <h3 class="course-name">${certificate.courseName}</h3>

        <div class="details">
          <div class="detail-item">
            <div class="detail-label">Niveau</div>
            <div class="detail-value">${formattedGrade}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Matiere</div>
            <div class="detail-value">${formattedSubject}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Lecons</div>
            <div class="detail-value">${certificate.lessonsCompleted}/${certificate.totalLessons}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Score Quiz</div>
            <div class="detail-value">${quizScore}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Temps</div>
            <div class="detail-value">${formattedDuration}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">${certificate.teacherName}</div>
          <div class="signature-label" style="color: #9ca3af; font-size: 10px;">Enseignant</div>
        </div>

        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">Schoolaris</div>
          <div class="signature-label" style="color: #9ca3af; font-size: 10px;">Direction</div>
        </div>

        <div class="certificate-info">
          <div class="certificate-number">${certificate.certificateNumber}</div>
          <div>Delivre le ${formattedDate}</div>
          <div class="verification">Code: ${certificate.verificationCode}</div>
        </div>
      </div>
    </div>

    <div class="seal">
      <span class="seal-text">Certifie</span>
      <span class="seal-icon">🎓</span>
      <span class="seal-text">Schoolaris</span>
    </div>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>`;
}
