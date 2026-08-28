import { isValidEmail } from '@/lib/email/config';
import type { SiteLocale } from '@/lib/i18n/config';
import { localizePathname } from '@/lib/i18n/pathname';

export const INQUIRY_LIMITS = {
  name: 120,
  email: 254,
  message: 5000,
  experienceSlug: 200,
  pagePath: 500,
} as const;

export const INQUIRY_INTENTS = [
  'private_travel',
  'corporate_brand',
  'cultural_experience',
  'ultra_private_access',
  'long_term_collaboration',
] as const;

export type InquiryIntent = (typeof INQUIRY_INTENTS)[number];

export const INQUIRY_INTENT_LABELS: Record<SiteLocale, Record<InquiryIntent, string>> = {
  en: {
    private_travel: 'Private Travel',
    corporate_brand: 'Corporate & Brand Experience',
    cultural_experience: 'Cultural Experience',
    ultra_private_access: 'Ultra-Private Access',
    long_term_collaboration: 'Long-Term Collaboration',
  },
  tr: {
    private_travel: 'Özel Deneyim Tasarımı',
    corporate_brand: 'Kurumsal ve Marka Deneyimi',
    cultural_experience: 'Kültürel Deneyim',
    ultra_private_access: 'Ultra Özel Erişim',
    long_term_collaboration: 'Uzun Vadeli İş Birliği',
  },
  zh: {
    private_travel: '私人旅行',
    corporate_brand: '企业与品牌体验',
    cultural_experience: '文化体验',
    ultra_private_access: '超私密通达',
    long_term_collaboration: '长期合作',
  },
};

export interface InquirySubmissionInput {
  name: string;
  email: string;
  message: string;
  intent: InquiryIntent[];
  experience_slug?: string;
  locale: SiteLocale;
  page_path: string;
  website?: string;
}

export type InquiryValidationResult =
  { ok: true; data: InquirySubmissionInput } | { ok: false; error: string; honeypot: boolean };

const SITE_LOCALES: readonly SiteLocale[] = ['en', 'tr', 'zh'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKnownIntent(value: unknown): value is InquiryIntent {
  return typeof value === 'string' && INQUIRY_INTENTS.includes(value as InquiryIntent);
}

export function parseInquirySubmission(payload: unknown): InquiryValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, error: 'Invalid request.', honeypot: false };
  }

  const website = typeof payload.website === 'string' ? payload.website.trim() : '';
  if (website) {
    return { ok: false, error: 'Invalid request.', honeypot: true };
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const pagePath = typeof payload.page_path === 'string' ? payload.page_path.trim() : '';
  const experienceSlug =
    typeof payload.experience_slug === 'string' ? payload.experience_slug.trim() : '';

  if (!name) return { ok: false, error: 'Name is required.', honeypot: false };
  if (name.length > INQUIRY_LIMITS.name) {
    return { ok: false, error: 'Name is too long.', honeypot: false };
  }
  if (!email) return { ok: false, error: 'Email is required.', honeypot: false };
  if (email.length > INQUIRY_LIMITS.email || !isValidEmail(email)) {
    return { ok: false, error: 'A valid email address is required.', honeypot: false };
  }
  if (!message) return { ok: false, error: 'Message is required.', honeypot: false };
  if (message.length > INQUIRY_LIMITS.message) {
    return { ok: false, error: 'Message is too long.', honeypot: false };
  }
  if (!SITE_LOCALES.includes(payload.locale as SiteLocale)) {
    return { ok: false, error: 'Invalid locale.', honeypot: false };
  }
  if (!pagePath.startsWith('/') || pagePath.length > INQUIRY_LIMITS.pagePath) {
    return { ok: false, error: 'Invalid page path.', honeypot: false };
  }
  if (experienceSlug.length > INQUIRY_LIMITS.experienceSlug) {
    return { ok: false, error: 'Invalid experience.', honeypot: false };
  }

  const intent = payload.intent === undefined ? [] : payload.intent;
  if (!Array.isArray(intent) || intent.length > INQUIRY_INTENTS.length) {
    return { ok: false, error: 'Invalid inquiry intent.', honeypot: false };
  }
  if (!intent.every(isKnownIntent) || new Set(intent).size !== intent.length) {
    return { ok: false, error: 'Invalid inquiry intent.', honeypot: false };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      message,
      intent,
      experience_slug: experienceSlug || undefined,
      locale: payload.locale as SiteLocale,
      page_path: pagePath,
      website: '',
    },
  };
}

export function generateInquiryReference(now = new Date(), suffix?: string): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  let resolvedSuffix = suffix?.toUpperCase();

  if (!resolvedSuffix || !/^[A-Z0-9]{4}$/.test(resolvedSuffix)) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    resolvedSuffix = Array.from(bytes, (byte) => (byte % 36).toString(36).toUpperCase()).join('');
  }

  return `CRQ-${date}-${resolvedSuffix}`;
}

export function buildExperienceInquiryHref(
  experienceSlug: string,
  locale: SiteLocale = 'en'
): string {
  const slug = encodeURIComponent(experienceSlug);
  return `${localizePathname('/contact', locale)}?source=experience&slug=${slug}&exp=${slug}`;
}
