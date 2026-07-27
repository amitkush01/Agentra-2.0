import nodemailer from 'nodemailer';

export const ADMIN_NOTIFICATION_EMAIL = 'amitstm444@gmail.com';

export interface EmailPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export async function sendContactNotificationEmail(payload: EmailPayload) {
  try {
    const { name, email, company, message } = payload;

    // SMTP Transporter configuration (supports process.env or Gmail default fallback)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'agentra.notifications@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || ''
      }
    });

    const mailOptions = {
      from: `"Agentra Contact Portal" <${process.env.GMAIL_USER || 'notifications@agentra.ai'}>`,
      to: ADMIN_NOTIFICATION_EMAIL,
      replyTo: email,
      subject: `📩 New Contact Message from ${name} (${email})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #0f172a; color: #ffffff;">
          <h2 style="color: #f59e0b; margin-bottom: 20px;">📩 New Agentra Contact Inquiry</h2>
          <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
          <p style="margin-bottom: 10px;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
          <p style="margin-bottom: 10px;"><strong>Company:</strong> ${company || 'N/A'}</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
          <p style="margin-bottom: 10px;"><strong>Message Content:</strong></p>
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #f8fafc;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">This notification was automatically sent to <strong>${ADMIN_NOTIFICATION_EMAIL}</strong> from Agentra AI Backend.</p>
        </div>
      `
    };

    if (process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Contact notification email successfully dispatched to ${ADMIN_NOTIFICATION_EMAIL}`);
    } else {
      console.log(`[Mailer Log] Contact message received for ${ADMIN_NOTIFICATION_EMAIL}:`, {
        target: ADMIN_NOTIFICATION_EMAIL,
        from: `${name} <${email}>`,
        message
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[Mailer Error] Failed to dispatch notification email:', error);
    // Don't crash API response
    return { success: false, error };
  }
}
