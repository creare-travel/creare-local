import sgMail from '@sendgrid/mail';
import { getMailConfig } from './config';

interface InquiryData {
  name: string;
  email: string;
  message: string;
  intents?: string[];
}

export async function sendOwnerNotification(data: InquiryData): Promise<void> {
  const { name, email, message, intents } = data;
  const mailConfig = getMailConfig();

  if (!mailConfig.ok) {
    throw new Error(mailConfig.error);
  }

  const intentLine = intents && intents.length > 0 ? `Intent: ${intents.join(', ')}\n` : '';

  const text = `New inquiry received via CREARE.\n\nName: ${name}\nEmail: ${email}\n${intentLine}Message:\n${message}`;

  sgMail.setApiKey(mailConfig.config.apiKey);

  await sgMail.send({
    to: mailConfig.config.toEmail,
    from: mailConfig.config.fromEmail,
    subject: 'New Inquiry — CREARE',
    text,
  });
}

export async function sendUserConfirmation(data: InquiryData): Promise<void> {
  const { name, email } = data;
  const mailConfig = getMailConfig();

  if (!mailConfig.ok) {
    throw new Error(mailConfig.error);
  }

  const text = `${name},\n\nThank you.\n\nYour inquiry has been received and is being reviewed.\n\nWe will respond personally.\n\nCREARE`;

  sgMail.setApiKey(mailConfig.config.apiKey);

  await sgMail.send({
    to: email,
    from: mailConfig.config.fromEmail,
    subject: 'Your inquiry has been received — CREARE',
    text,
  });
}

export async function sendEmail(data: InquiryData): Promise<void> {
  await Promise.all([sendOwnerNotification(data), sendUserConfirmation(data)]);
}
