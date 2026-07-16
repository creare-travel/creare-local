import { DEFAULT_SITE_LOCALE, type SiteLocale } from './config';

const TURKISH_PREFIX = '/tr';

export function normalizePathname(pathname: string): string {
  const withRoot = pathname.trim() || '/';
  const normalized = (withRoot.startsWith('/') ? withRoot : `/${withRoot}`).replace(/\/{2,}/g, '/');
  const withoutTrailingSlash =
    normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;

  const segments = withoutTrailingSlash.split('/').filter(Boolean);
  if (segments[0] !== 'tr' || segments[1] !== 'tr') {
    return withoutTrailingSlash;
  }

  let firstNonLocaleIndex = 1;
  while (segments[firstNonLocaleIndex] === 'tr') {
    firstNonLocaleIndex += 1;
  }

  const collapsedSegments = [segments[0], ...segments.slice(firstNonLocaleIndex)];
  return `/${collapsedSegments.join('/')}`;
}

export function getLocaleFromPathname(pathname: string): SiteLocale {
  const normalized = normalizePathname(pathname);
  return normalized === TURKISH_PREFIX || normalized.startsWith(`${TURKISH_PREFIX}/`)
    ? 'tr'
    : DEFAULT_SITE_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);

  if (normalized === TURKISH_PREFIX) {
    return '/';
  }

  if (normalized.startsWith(`${TURKISH_PREFIX}/`)) {
    return normalized.slice(TURKISH_PREFIX.length);
  }

  return normalized;
}

export function localizePathname(pathname: string, locale: SiteLocale): string {
  const unprefixedPathname = stripLocalePrefix(pathname);

  if (locale === DEFAULT_SITE_LOCALE) {
    return unprefixedPathname;
  }

  return unprefixedPathname === '/' ? TURKISH_PREFIX : `${TURKISH_PREFIX}${unprefixedPathname}`;
}

export function isTurkishPathname(pathname: string): boolean {
  return getLocaleFromPathname(pathname) === 'tr';
}
