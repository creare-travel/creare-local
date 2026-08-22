const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface MailConfig {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
}

export class MailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailConfigurationError';
  }
}

export function isValidEmail(value?: string | null): value is string {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

function isCreareSender(value?: string | null): value is string {
  return isValidEmail(value) && value.trim().toLowerCase().endsWith('@crearetravel.com');
}

export function getMailConfig(): MailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || process.env.CONTACT_EMAIL?.trim();

  if (!apiKey) throw new MailConfigurationError('Missing RESEND_API_KEY.');
  if (!isCreareSender(fromEmail)) {
    throw new MailConfigurationError('Missing valid crearetravel.com sender email.');
  }
  if (!isValidEmail(toEmail)) throw new MailConfigurationError('Missing valid recipient email.');

  return { apiKey, fromEmail, toEmail };
}
