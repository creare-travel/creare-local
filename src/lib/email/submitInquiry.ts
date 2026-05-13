import sgMail from '@sendgrid/mail';
import { getMailConfig } from '@/lib/email/config';
import type { InquirySubmissionInput } from '@/lib/inquiry';

export async function submitInquiry(input: InquirySubmissionInput): Promise<void> {
  const mailConfig = getMailConfig();

  if (!mailConfig.ok) {
    throw new Error(mailConfig.error);
  }

  const { name, email, message, intent, experience_slug } = input;
  const intentLine = intent ? `Intent: ${intent}\n` : '';
  const slugLine = experience_slug ? `Experience: ${experience_slug}\n` : '';

  const ownerText = `New inquiry received via CREARE.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\n${intentLine}${slugLine}Message:\n${message.trim()}`;
  const userText = `${name.trim()},\n\nThank you.\n\nYour inquiry has been received and is being reviewed.\n\nWe will respond personally.\n\nCREARE`;

  sgMail.setApiKey(mailConfig.config.apiKey);

  await Promise.all([
    sgMail.send({
      to: mailConfig.config.toEmail,
      from: mailConfig.config.fromEmail,
      subject: 'New Inquiry — CREARE',
      text: ownerText,
    }),
    sgMail.send({
      to: email.trim(),
      from: mailConfig.config.fromEmail,
      subject: 'Your inquiry has been received — CREARE',
      text: userText,
    }),
  ]);
}
