import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Generate invoice number from purchase ID and date
function generateInvoiceNumber(purchaseId: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const shortId = purchaseId.slice(-6).toUpperCase();
  return `SCH-${year}${month}-${shortId}`;
}

// Format grade level to French
function formatGradeLevel(level: string): string {
  const levels: Record<string, string> = {
    CP: "CP",
    CE1: "CE1",
    CE2: "CE2",
    CM1: "CM1",
    CM2: "CM2",
    SIXIEME: "6ème",
    CINQUIEME: "5ème",
    QUATRIEME: "4ème",
    TROISIEME: "3ème",
    SECONDE: "Seconde",
    PREMIERE: "Première",
    TERMINALE: "Terminale",
  };
  return levels[level] || level;
}

// Format subject to French
function formatSubject(subject: string): string {
  const subjects: Record<string, string> = {
    MATHEMATIQUES: "Mathématiques",
    FRANCAIS: "Français",
    HISTOIRE_GEO: "Histoire-Géographie",
    SCIENCES: "Sciences",
    ANGLAIS: "Anglais",
    PHYSIQUE_CHIMIE: "Physique-Chimie",
    SVT: "SVT",
    PHILOSOPHIE: "Philosophie",
    ESPAGNOL: "Espagnol",
    ALLEMAND: "Allemand",
    SES: "SES",
    NSI: "NSI",
  };
  return subjects[subject] || subject;
}

// Generate HTML invoice template
function generateInvoiceHTML(data: {
  invoiceNumber: string;
  purchaseDate: Date;
  buyer: {
    name: string;
    email: string;
  };
  course: {
    title: string;
    gradeLevel: string;
    subject: string;
    author: string;
  };
  child?: {
    firstName: string;
    lastName?: string | null;
  } | null;
  amount: number;
  platformFee: number;
  status: string;
}): string {
  const formattedDate = format(data.purchaseDate, "dd MMMM yyyy", {
    locale: fr,
  });
  const amountHT = data.amount / 1.2; // TVA 20%
  const tva = data.amount - amountHT;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #10b981;
      padding-bottom: 30px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #10b981;
    }
    .logo span {
      color: #1a1a1a;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h1 {
      font-size: 24px;
      color: #10b981;
      margin-bottom: 10px;
    }
    .invoice-info p {
      color: #666;
      font-size: 13px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .party {
      width: 45%;
    }
    .party h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 10px;
    }
    .party p {
      margin-bottom: 5px;
    }
    .party .name {
      font-weight: 600;
      font-size: 16px;
    }
    .details {
      margin-bottom: 40px;
    }
    .details table {
      width: 100%;
      border-collapse: collapse;
    }
    .details th {
      background: #f8f9fa;
      padding: 12px 15px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }
    .details td {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
    }
    .details .description {
      font-weight: 500;
    }
    .details .meta {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .details .amount {
      text-align: right;
      font-weight: 600;
    }
    .totals {
      margin-left: auto;
      width: 300px;
      margin-bottom: 40px;
    }
    .totals table {
      width: 100%;
    }
    .totals td {
      padding: 8px 0;
    }
    .totals .label {
      color: #666;
    }
    .totals .value {
      text-align: right;
      font-weight: 500;
    }
    .totals .total-row td {
      border-top: 2px solid #1a1a1a;
      padding-top: 15px;
      font-size: 18px;
      font-weight: 700;
    }
    .totals .total-row .value {
      color: #10b981;
    }
    .status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status.completed {
      background: #d1fae5;
      color: #047857;
    }
    .status.pending {
      background: #fef3c7;
      color: #b45309;
    }
    .status.refunded {
      background: #e5e7eb;
      color: #374151;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 30px;
      text-align: center;
      color: #888;
      font-size: 12px;
    }
    .footer p {
      margin-bottom: 5px;
    }
    .legal {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 11px;
      color: #666;
    }
    @media print {
      body {
        padding: 20px;
      }
      .invoice {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">
        School<span>aris</span>
      </div>
      <div class="invoice-info">
        <h1>FACTURE</h1>
        <p><strong>N° ${data.invoiceNumber}</strong></p>
        <p>Date : ${formattedDate}</p>
        <p>
          <span class="status ${data.status.toLowerCase()}">${
            data.status === "COMPLETED"
              ? "Payée"
              : data.status === "PENDING"
                ? "En attente"
                : data.status === "REFUNDED"
                  ? "Remboursée"
                  : "Échec"
          }</span>
        </p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>Vendeur</h3>
        <p class="name">Kursus SAS</p>
        <p>123 Avenue de l'Éducation</p>
        <p>75001 Paris, France</p>
        <p>SIRET : 123 456 789 00001</p>
        <p>TVA : FR12345678900</p>
      </div>
      <div class="party">
        <h3>Client</h3>
        <p class="name">${data.buyer.name}</p>
        <p>${data.buyer.email}</p>
        ${data.child ? `<p style="margin-top: 10px; color: #10b981;">Pour : ${data.child.firstName}${data.child.lastName ? " " + data.child.lastName : ""}</p>` : ""}
      </div>
    </div>

    <div class="details">
      <table>
        <thead>
          <tr>
            <th style="width: 60%">Description</th>
            <th>Quantité</th>
            <th style="text-align: right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="description">${data.course.title}</div>
              <div class="meta">
                ${formatSubject(data.course.subject)} • ${formatGradeLevel(data.course.gradeLevel)}<br>
                Créé par ${data.course.author}
              </div>
            </td>
            <td>1</td>
            <td class="amount">${(data.amount / 100).toFixed(2)} €</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals">
      <table>
        <tr>
          <td class="label">Sous-total HT</td>
          <td class="value">${(amountHT / 100).toFixed(2)} €</td>
        </tr>
        <tr>
          <td class="label">TVA (20%)</td>
          <td class="value">${(tva / 100).toFixed(2)} €</td>
        </tr>
        <tr class="total-row">
          <td>Total TTC</td>
          <td class="value">${(data.amount / 100).toFixed(2)} €</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Merci pour votre confiance !</p>
      <p>Pour toute question : support@kursus.fr</p>

      <div class="legal">
        <p><strong>Mentions légales :</strong></p>
        <p>Kursus SAS au capital de 10 000 € - RCS Paris 123 456 789</p>
        <p>Cours numérique - Accès à vie après achat</p>
        <p>En cas de litige, le client peut recourir au médiateur de la consommation.</p>
        <p>Conformément à l'article L. 221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis sur un support immatériel dont l'exécution a commencé avec l'accord du consommateur.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { purchaseId } = await params;

    // Get purchase with all related data
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: {
          select: { name: true, email: true },
        },
        child: {
          select: { firstName: true, lastName: true },
        },
        course: {
          select: {
            title: true,
            gradeLevel: true,
            subject: true,
            author: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat non trouvé" }, { status: 404 });
    }

    // Check authorization - only the buyer can download their invoice
    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(purchase.id, purchase.createdAt),
      purchaseDate: purchase.createdAt,
      buyer: {
        name: purchase.user.name || "Client",
        email: purchase.user.email || "",
      },
      course: {
        title: purchase.course.title,
        gradeLevel: purchase.course.gradeLevel,
        subject: purchase.course.subject,
        author: purchase.course.author.name || "Professeur Kursus",
      },
      child: purchase.child,
      amount: purchase.amount,
      platformFee: purchase.platformFee,
      status: purchase.status,
    };

    // Generate HTML invoice
    const html = generateInvoiceHTML(invoiceData);

    // Return HTML response that can be printed as PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="facture-${invoiceData.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la facture" },
      { status: 500 },
    );
  }
}
