export type Locale = 'en' | 'tr' | 'ru' | 'zh';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
  { code: 'ru', label: 'RU' },
  { code: 'zh', label: 'ZH' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'creare_locale';

/**
 * Hreflang-ready language alternates structure.
 * Extend this when multilingual routes are activated.
 *
 * Supported routes: /en, /tr, /ru, /zh
 */
export const HREFLANG_ALTERNATES: Record<Locale, string> = {
  en: 'en',
  tr: 'tr',
  ru: 'ru',
  zh: 'zh',
};
