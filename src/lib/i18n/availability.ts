import {
  DEFAULT_SITE_LOCALE,
  LOCALE_REGISTRY,
  SUPPORTED_SITE_LOCALES,
  type LocaleKey,
  type SiteLocale,
} from './config';

export type LocaleAvailability = Readonly<Partial<Record<LocaleKey, boolean>>>;

export function getActiveAvailableLocales(availability: LocaleAvailability): SiteLocale[] {
  return SUPPORTED_SITE_LOCALES.filter((locale) => availability[locale] === true);
}

export function createLocaleAvailability(locales: readonly LocaleKey[]): LocaleAvailability {
  return Object.fromEntries(locales.map((locale) => [locale, true])) as LocaleAvailability;
}

export function getAvailableLocaleHreflangs(
  availability: LocaleAvailability
): Array<{ locale: SiteLocale; hreflang: string }> {
  return getActiveAvailableLocales(availability).map((locale) => ({
    locale,
    hreflang: LOCALE_REGISTRY[locale].hreflang,
  }));
}

export function hasDefaultLocale(availability: LocaleAvailability): boolean {
  return availability[DEFAULT_SITE_LOCALE] === true;
}

export function isLocalizedRecordPublished(
  record:
    | {
        publishedAt?: string | null;
      }
    | null
    | undefined
): boolean {
  return Boolean(record?.publishedAt);
}

export async function resolveActiveLocaleAvailability(
  probe: (locale: SiteLocale) => Promise<boolean>
): Promise<SiteLocale[]> {
  const results = await Promise.all(
    SUPPORTED_SITE_LOCALES.map(async (locale) => ({ locale, available: await probe(locale) }))
  );

  return results.filter((result) => result.available).map((result) => result.locale);
}
