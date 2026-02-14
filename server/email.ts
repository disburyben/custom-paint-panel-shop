import nodemailer from "nodemailer";
import { generateQuoteConfirmationHTML, generateAdminNotificationHTML } from "./emailTemplate";
import { ENV } from "./_core/env";

// Create reusable transporter using GoDaddy SMTP
function createTransporter() {
  if (!ENV.smtpUser || !ENV.smtpPass) {
    console.warn("⚠️  SMTP credentials not configured. Emails will be logged to console only.");
    return null;
  }

  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465, // true for 465, false for 587
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
  });
}

const transporter = createTransporter();

interface QuoteConfirmationData {
  customerName: string;
  customerEmail: string;
  quoteId: number;
  vehicleType: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: string | null;
  serviceType: string;
  description?: string | null;
}

/**
 * Send quote confirmation email to customer
 */
export async function sendQuoteConfirmationEmail(
  data: QuoteConfirmationData
): Promise<void> {
  try {
    const emailHtml = generateQuoteConfirmationHTML(data);
    const subject = `Quote Request Received - Reference #${data.quoteId}`;

    if (transporter) {
      await transporter.sendMail({
        from: `"Caspers Paintworks" <${ENV.smtpUser}>`,
        to: data.customerEmail,
        subject,
        html: emailHtml,
      });
      console.log(`✅ Confirmation email sent to ${data.customerEmail}`);
    } else {
      // Fallback: log to console when SMTP isn't configured
      console.log("=== QUOTE CONFIRMATION EMAIL (console only — SMTP not configured) ===");
      console.log(`To: ${data.customerEmail}`);
      console.log(`Subject: ${subject}`);
      console.log("=== END EMAIL ===");
    }
  } catch (error) {
    console.error("❌ Failed to send quote confirmation email:", error);
    // Don't throw - we don't want email failures to block quote submission
  }
}

interface AdminNotificationData {
  quoteId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  vehicleType: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: string | null;
  serviceType: string;
  description?: string | null;
  fileCount: number;
}

/**
 * Send admin notification email when a new quote is submitted
 */
export async function sendAdminNotificationEmail(
  data: AdminNotificationData
): Promise<void> {
  try {
    const dashboardUrl = ENV.isProduction
      ? "https://casperspaintworks.com.au/admin"
      : "http://localhost:3001/admin";

    const emailHtml = generateAdminNotificationHTML({
      ...data,
      submittedAt: new Date(),
      dashboardUrl,
    });

    const adminEmail = "enquiries@casperspaintworks.com.au";
    const subject = `🚨 New Quote Request #${data.quoteId} - ${data.customerName}`;

    if (transporter) {
      await transporter.sendMail({
        from: `"Caspers Paintworks" <${ENV.smtpUser}>`,
        to: adminEmail,
        subject,
        html: emailHtml,
      });
      console.log(`✅ Admin notification email sent to ${adminEmail}`);
    } else {
      // Fallback: log to console when SMTP isn't configured
      console.log("=== ADMIN NOTIFICATION EMAIL (console only — SMTP not configured) ===");
      console.log(`To: ${adminEmail}`);
      console.log(`Subject: ${subject}`);
      console.log("=== END EMAIL ===");
    }
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error);
    // Don't throw - we don't want email failures to block quote submission
  }
}
