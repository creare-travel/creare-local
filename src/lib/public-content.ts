export const PUBLIC_CONTENT_LOCALE = 'tr-TR';

export const PUBLIC_SITE_LANG = 'tr-TR';

export const PUBLIC_UI_LOCALE = 'tr';

export const USE_PUBLIC_STATIC_ENGLISH_FALLBACKS = false;

export function shouldUsePublicStaticEnglishFallbacks() {
  return USE_PUBLIC_STATIC_ENGLISH_FALLBACKS;
}

export function isTurkishPublicLaunch() {
  return PUBLIC_CONTENT_LOCALE === 'tr-TR';
}

export function logPublicContentIssue(context: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'development') return;

  console.warn(`[public-content] ${context}`, {
    locale: PUBLIC_CONTENT_LOCALE,
    ...(details ?? {}),
  });
}
