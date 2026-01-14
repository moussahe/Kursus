import { Resend } from "resend";

// Lazy-initialize Resend client to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Schoolaris <noreply@schoolaris.fr>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const client = getResendClient();

  if (!client) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email send");
    console.log("[Email] Would send:", {
      to: options.to,
      subject: options.subject,
    });
    return { success: true, data: null };
  }

  try {
    const data = await client.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    console.log("[Email] Sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { success: false, error };
  }
}

export { getResendClient as resend };

// Re-export all email templates
export {
  baseEmailTemplate,
  purchaseConfirmationEmail,
  purchaseConfirmationText,
  passwordResetEmail,
  passwordResetText,
  weeklyReportEmail,
  weeklyReportText,
  courseApprovedEmail,
  courseApprovedText,
  courseRejectedEmail,
  courseRejectedText,
  courseChangesRequestedEmail,
  courseChangesRequestedText,
} from "./email/index";
