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

export function generateQuoteConfirmationHTML(data: QuoteConfirmationData): string {
  const vehicleInfo = [
    data.vehicleMake,
    data.vehicleModel,
    data.vehicleYear,
  ]
    .filter(Boolean)
    .join(" ") || data.vehicleType;

  const serviceTypeLabels: Record<string, string> = {
    "custom-paint": "Custom Paint",
    "collision-repair": "Collision Repair",
    "restoration": "Classic Restoration",
    "detailing": "Detailing & Protection",
    "paint-correction": "Paint Correction",
  };

  const serviceLabel = serviceTypeLabels[data.serviceType] || data.serviceType;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #f97316;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase;">
                CASPERS PAINTWORKS
              </h1>
              <p style="margin: 8px 0 0 0; color: #cccccc; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
                AUTOMOTIVE REFINISHING
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #f97316; font-size: 24px; font-weight: 700;">
                Quote Request Received
              </h2>
              
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Dear ${data.customerName},
              </p>
              
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Thank you for your interest in Caspers Paintworks! We've successfully received your quote request and our team is excited to help transform your vehicle.
              </p>

              <!-- Quote Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #2a2a2a; border-left: 4px solid #f97316; margin: 30px 0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; color: #f97316; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                      Quote Reference
                    </p>
                    <p style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                      #${data.quoteId}
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 14px; width: 40%;">Vehicle:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${vehicleInfo}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 14px;">Service:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${serviceLabel}</td>
                      </tr>
                      ${data.description ? `
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 14px; vertical-align: top;">Details:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${data.description}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                <strong style="color: #f97316;">What happens next?</strong><br>
                Our team will carefully review your requirements and prepare a detailed quote. You can expect to hear from us within <strong>24-48 hours</strong> during business hours.
              </p>

              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                If you have any questions or need to provide additional information, please don't hesitate to reach out to us at <a href="mailto:enquiries@casperspaintworks.com" style="color: #f97316; text-decoration: none;">enquiries@casperspaintworks.com</a>.
              </p>

              <p style="margin: 30px 0 0 0; line-height: 1.6; font-size: 16px;">
                Best regards,<br>
                <strong style="color: #ffffff;">The Caspers Paintworks Team</strong><br>
                <span style="color: #999999; font-size: 14px;">Para Hills, Adelaide, South Australia</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 30px; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                Taking all Automotive Paintwork Enquiries
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Caspers Paintworks. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
