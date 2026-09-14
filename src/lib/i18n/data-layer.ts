import { DEFAULT_SITE_LOCALE, type LocaleKey } from './config';
import { buildLocalizedStrapiPath } from '@/lib/strapi';

export function canUseEnglishFallback(locale: LocaleKey): boolean {
  return locale === DEFAULT_SITE_LOCALE;
}

export function buildLocaleAwareStrapiPath(path: string, locale: LocaleKey): string {
  return buildLocalizedStrapiPath(path, locale);
}
