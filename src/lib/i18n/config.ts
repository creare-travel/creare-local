export const LOCALE_REGISTRY = {
  en: {
    key: 'en',
    active: true,
    urlPrefix: '',
    dictionaryKey: 'en',
    strapiLocale: 'en',
    htmlLang: 'en',
    hreflang: 'en',
    ogLocale: 'en_US',
    jsonLdLanguage: 'en',
    direction: 'ltr',
    isDefault: true,
    routeMode: 'default',
  },
  tr: {
    key: 'tr',
    active: true,
    urlPrefix: 'tr',
    dictionaryKey: 'tr',
    strapiLocale: 'tr-TR',
    htmlLang: 'tr',
    hreflang: 'tr',
    ogLocale: 'tr_TR',
    jsonLdLanguage: 'tr-TR',
    direction: 'ltr',
    isDefault: false,
    routeMode: 'compatibility',
  },
  zh: {
    key: 'zh',
    active: true,
    urlPrefix: 'zh',
    dictionaryKey: 'zh',
    strapiLocale: 'zh-CN',
    htmlLang: 'zh-Hans',
    hreflang: 'zh-Hans',
    ogLocale: 'zh_CN',
    jsonLdLanguage: 'zh-Hans',
    direction: 'ltr',
    isDefault: false,
    routeMode: 'generic',
  },
  ru: {
    key: 'ru',
    active: true,
    urlPrefix: 'ru',
    dictionaryKey: 'ru',
    strapiLocale: 'ru-RU',
    htmlLang: 'ru',
    hreflang: 'ru',
    ogLocale: 'ru_RU',
    jsonLdLanguage: 'ru',
    direction: 'ltr',
    isDefault: false,
    routeMode: 'generic',
  },
} as const;

export type LocaleKey = keyof typeof LOCALE_REGISTRY;

export type ActiveLocaleKey = {
  [TKey in LocaleKey]: (typeof LOCALE_REGISTRY)[TKey]['active'] extends true ? TKey : never;
}[LocaleKey];

export type SiteLocale = ActiveLocaleKey;
export type StrapiLocale = (typeof LOCALE_REGISTRY)[LocaleKey]['strapiLocale'];
export type LocaleDirection = (typeof LOCALE_REGISTRY)[LocaleKey]['direction'];
export type LocaleDescriptor = (typeof LOCALE_REGISTRY)[LocaleKey];

export const DEFAULT_SITE_LOCALE = 'en' as const satisfies SiteLocale;

export const REGISTERED_LOCALES = Object.keys(LOCALE_REGISTRY) as LocaleKey[];
export const SUPPORTED_SITE_LOCALES = REGISTERED_LOCALES;
export const ACTIVE_SITE_LOCALES = REGISTERED_LOCALES.filter(
  (locale): locale is SiteLocale => LOCALE_REGISTRY[locale].active
);

export const SITE_TO_STRAPI_LOCALE = Object.fromEntries(
  REGISTERED_LOCALES.map((locale) => [locale, LOCALE_REGISTRY[locale].strapiLocale])
) as { [TKey in LocaleKey]: (typeof LOCALE_REGISTRY)[TKey]['strapiLocale'] };

const LOCALE_LABELS = {
  en: 'English',
  tr: 'Türkçe',
  zh: '简体中文',
  ru: 'Русский',
} as const satisfies Record<LocaleKey, string>;

export const LOCALE_OPTIONS = ACTIVE_SITE_LOCALES.map((code) => ({
  code,
  label: LOCALE_LABELS[code],
})) satisfies readonly { code: SiteLocale; label: string }[];

export const LOCALE_STORAGE_KEY = 'creare_locale';

export type Locale = SiteLocale;
export const DEFAULT_LOCALE = DEFAULT_SITE_LOCALE;
export const LOCALES = LOCALE_OPTIONS;

export function isRegisteredLocale(value: unknown): value is LocaleKey {
  return typeof value === 'string' && value in LOCALE_REGISTRY;
}

export function isSiteLocale(value: unknown): value is SiteLocale {
  return isRegisteredLocale(value) && LOCALE_REGISTRY[value].active;
}

export function getLocaleDescriptor<TKey extends LocaleKey>(
  locale: TKey
): (typeof LOCALE_REGISTRY)[TKey] {
  return LOCALE_REGISTRY[locale];
}

export function getActiveLocaleDescriptors(): LocaleDescriptor[] {
  return ACTIVE_SITE_LOCALES.map((locale) => LOCALE_REGISTRY[locale]);
}

export function getTechnicalRouteLocale(value: unknown): LocaleKey | null {
  if (!isRegisteredLocale(value)) return null;
  return LOCALE_REGISTRY[value].routeMode === 'generic' ? value : null;
}

export function getGenericRouteLocale(value: unknown): SiteLocale | null {
  const locale = getTechnicalRouteLocale(value);
  if (!locale || !LOCALE_REGISTRY[locale].active) return null;
  return locale as SiteLocale;
}

export function getStrapiLocale<TKey extends LocaleKey>(
  locale: TKey
): (typeof LOCALE_REGISTRY)[TKey]['strapiLocale'] {
  return LOCALE_REGISTRY[locale].strapiLocale;
}
