import { isValidEmail } from '@/lib/email/config';

export interface InquirySubmissionInput {
  name: string;
  email: string;
  message: string;
  intent?: string;
  experience_slug?: string;
}

export function buildExperienceInquiryHref(experienceSlug: string): string {
  const slug = encodeURIComponent(experienceSlug);
  return `/contact?source=experience&slug=${slug}&exp=${slug}`;
}

export function normalizeInquiryIntent(value?: string | string[] | null): string | undefined {
  if (Array.isArray(value)) {
    const intents = value.map((item) => item.trim()).filter(Boolean);
    return intents.length > 0 ? intents.join(', ') : undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

export function validateInquirySubmission(payload: InquirySubmissionInput): string | null {
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim() === '') {
    return 'Name is required.';
  }

  if (!payload.email || typeof payload.email !== 'string' || payload.email.trim() === '') {
    return 'Email is required.';
  }

  if (!isValidEmail(payload.email)) {
    return 'A valid email address is required.';
  }

  if (!payload.message || typeof payload.message !== 'string' || payload.message.trim() === '') {
    return 'Message is required.';
  }

  return null;
}
