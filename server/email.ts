import { generateQuoteConfirmationHTML, generateAdminNotificationHTML } from "./emailTemplate";
import { ENV } from "./_core/env";

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

    // Log the email (in production, this would use an email service like SendGrid, Resend, etc.)
    console.log("=== QUOTE CONFIRMATION EMAIL ===");
    console.log(`To: ${data.customerEmail}`);
    console.log(`Subject: Quote Request Received - Reference #${data.quoteId}`);
    console.log("HTML Body:");
    console.log(emailHtml);
    console.log("=== END EMAIL ===");

    // TODO: In production, integrate with an email service:
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Caspers Paintworks <quotes@casperspaintworks.com.au>',
    //   to: data.customerEmail,
    //   subject: `Quote Request Received - Reference #${data.quoteId}`,
    //   html: emailHtml,
    // });
  } catch (error) {
    console.error("Failed to send quote confirmation email:", error);
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
    // Construct dashboard URL (use production URL or localhost for dev)
    const dashboardUrl = ENV.isProduction 
      ? "https://your-domain.com/admin" 
      : "http://localhost:3000/admin";

    const emailHtml = generateAdminNotificationHTML({
      ...data,
      submittedAt: new Date(),
      dashboardUrl,
    });

    // TODO: Replace with your admin email address
    const adminEmail = "admin@casperspaintworks.com.au";

    // Log the email (in production, this would use an email service)
    console.log("=== ADMIN NOTIFICATION EMAIL ===");
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: 🚨 New Quote Request #${data.quoteId} - ${data.customerName}`);
    console.log("HTML Body:");
    console.log(emailHtml);
    console.log("=== END EMAIL ===");

    // TODO: In production, integrate with an email service:
    // await resend.emails.send({
    //   from: 'Caspers Paintworks <noreply@casperspaintworks.com.au>',
    //   to: adminEmail,
    //   subject: `🚨 New Quote Request #${data.quoteId} - ${data.customerName}`,
    //   html: emailHtml,
    // });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
    // Don't throw - we don't want email failures to block quote submission
  }
}


// ============================================
// CONTACT FORM EMAILS
// ============================================

interface ContactConfirmationEmailData {
  name: string;
  email: string;
  subject: string;
}

/**
 * Send confirmation email to user after contact form submission
 */
export async function sendContactConfirmationEmail(
  data: ContactConfirmationEmailData
): Promise<void> {
  try {
    const confirmationHtml = `
      <h2>Thank You for Contacting Us!</h2>
      <p>Hi ${data.name},</p>
      <p>We have received your message with the subject: <strong>"${data.subject}"</strong></p>
      <p>Our team will review your inquiry and get back to you as soon as possible.</p>
      <p>Best regards,<br/>Caspers Paintworks Team</p>
    `;

    console.log("=== CONTACT CONFIRMATION EMAIL ===");
    console.log(`To: ${data.email}`);
    console.log(`Subject: Thank you for contacting Caspers Paintworks`);
    console.log("HTML Body:");
    console.log(confirmationHtml);
    console.log("=== END EMAIL ===");
  } catch (error) {
    console.error("Failed to send contact confirmation email:", error);
  }
}

interface ContactNotificationEmailData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

/**
 * Send notification email to admin when contact form is submitted
 */
export async function sendContactNotificationEmail(
  data: ContactNotificationEmailData
): Promise<void> {
  try {
    const adminEmail = "admin@casperspaintworks.com.au";
    
    const notificationHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
      <p><strong>Subject:</strong> ${data.subject}</p>
      <h3>Message:</h3>
      <p>${data.message.replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><em>Submitted on ${new Date().toLocaleString()}</em></p>
    `;

    console.log("=== CONTACT NOTIFICATION EMAIL ===");
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: New Contact: ${data.subject}`);
    console.log("HTML Body:");
    console.log(notificationHtml);
    console.log("=== END EMAIL ===");
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
  }
}
