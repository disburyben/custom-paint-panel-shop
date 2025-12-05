import { generateQuoteConfirmationHTML } from "./emailTemplate";

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
