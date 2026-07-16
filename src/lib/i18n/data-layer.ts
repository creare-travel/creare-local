import { DEFAULT_SITE_LOCALE, type SiteLocale } from './config';
import { buildLocalizedStrapiPath } from '@/lib/strapi';

export function canUseEnglishFallback(locale: SiteLocale): boolean {
  return locale === DEFAULT_SITE_LOCALE;
}

export function buildLocaleAwareStrapiPath(path: string, locale: SiteLocale): string {
  return buildLocalizedStrapiPath(path, locale);
}
