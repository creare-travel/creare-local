export type SiteLocale = 'en' | 'tr';
export type StrapiLocale = 'en' | 'tr-TR';

export const DEFAULT_SITE_LOCALE = 'en' as const satisfies SiteLocale;

export const SUPPORTED_SITE_LOCALES = ['en', 'tr'] as const satisfies readonly SiteLocale[];

export const SITE_TO_STRAPI_LOCALE = {
  en: 'en',
  tr: 'tr-TR',
} as const satisfies Record<SiteLocale, StrapiLocale>;

export const LOCALE_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
] as const satisfies readonly { code: SiteLocale; label: string }[];

export const LOCALE_STORAGE_KEY = 'creare_locale';

export type Locale = SiteLocale;
export const DEFAULT_LOCALE = DEFAULT_SITE_LOCALE;
export const LOCALES = LOCALE_OPTIONS;

export function isSiteLocale(value: unknown): value is SiteLocale {
  return typeof value === 'string' && (SUPPORTED_SITE_LOCALES as readonly string[]).includes(value);
}

export function getStrapiLocale(locale: SiteLocale): StrapiLocale {
  return SITE_TO_STRAPI_LOCALE[locale];
}
