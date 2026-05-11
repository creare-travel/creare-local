const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface MailConfig {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
}

export function isValidEmail(value?: string | null): value is string {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

export function getMailConfig(): { ok: true; config: MailConfig } | { ok: false; error: string } {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || process.env.CONTACT_EMAIL?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || process.env.CONTACT_EMAIL?.trim();

  if (!apiKey) {
    return {
      ok: false,
      error: 'Mail service is not configured. Missing SENDGRID_API_KEY.',
    };
  }

  if (!isValidEmail(fromEmail)) {
    return {
      ok: false,
      error: 'Mail service is not configured. Missing valid sender email.',
    };
  }

  if (!isValidEmail(toEmail)) {
    return {
      ok: false,
      error: 'Mail service is not configured. Missing valid recipient email.',
    };
  }

  return {
    ok: true,
    config: {
      apiKey,
      fromEmail,
      toEmail,
    },
  };
}
