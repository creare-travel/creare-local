import {
  DEFAULT_SITE_LOCALE,
  LOCALE_REGISTRY,
  REGISTERED_LOCALES,
  SUPPORTED_SITE_LOCALES,
  type LocaleKey,
  type SiteLocale,
} from './config';

const PREFIX_TO_LOCALE = new Map<string, LocaleKey>(
  REGISTERED_LOCALES.flatMap((locale) => {
    const prefix = LOCALE_REGISTRY[locale].urlPrefix;
    return prefix ? [[prefix, locale] as const] : [];
  })
);

const ACTIVE_PREFIX_TO_LOCALE = new Map<string, SiteLocale>(
  SUPPORTED_SITE_LOCALES.flatMap((locale) => {
    const prefix = LOCALE_REGISTRY[locale].urlPrefix;
    return prefix ? [[prefix, locale] as const] : [];
  })
);

function normalizeSegments(pathname: string): string[] {
  const withRoot = pathname.trim() || '/';
  const normalized = (withRoot.startsWith('/') ? withRoot : `/${withRoot}`).replace(/\/{2,}/g, '/');
  const withoutTrailingSlash =
    normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;

  return withoutTrailingSlash.split('/').filter(Boolean);
}

export function normalizePathname(pathname: string): string {
  const segments = normalizeSegments(pathname);
  const firstLocale = PREFIX_TO_LOCALE.get(segments[0] ?? '');

  if (!firstLocale) {
    return segments.length === 0 ? '/' : `/${segments.join('/')}`;
  }

  const prefix = LOCALE_REGISTRY[firstLocale].urlPrefix;
  let firstNonLocaleIndex = 1;
  while (segments[firstNonLocaleIndex] === prefix) {
    firstNonLocaleIndex += 1;
  }

  return `/${[prefix, ...segments.slice(firstNonLocaleIndex)].join('/')}`;
}

export function getRegisteredLocaleFromPathname(pathname: string): LocaleKey {
  const firstSegment = normalizePathname(pathname).split('/').filter(Boolean)[0] ?? '';
  return PREFIX_TO_LOCALE.get(firstSegment) ?? DEFAULT_SITE_LOCALE;
}

export function getLocaleFromPathname(pathname: string): SiteLocale {
  const firstSegment = normalizePathname(pathname).split('/').filter(Boolean)[0] ?? '';
  return ACTIVE_PREFIX_TO_LOCALE.get(firstSegment) ?? DEFAULT_SITE_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split('/').filter(Boolean);

  if (!PREFIX_TO_LOCALE.has(segments[0] ?? '')) {
    return normalized;
  }

  const unprefixedSegments = segments.slice(1);
  return unprefixedSegments.length === 0 ? '/' : `/${unprefixedSegments.join('/')}`;
}

export function localizePathname(pathname: string, locale: LocaleKey): string {
  const unprefixedPathname = stripLocalePrefix(pathname);
  const prefix = LOCALE_REGISTRY[locale].urlPrefix;

  if (!prefix) {
    return unprefixedPathname;
  }

  return unprefixedPathname === '/' ? `/${prefix}` : `/${prefix}${unprefixedPathname}`;
}

export function buildLocalizedRouteTarget(
  basePath: string,
  slug: string,
  locale: LocaleKey
): string {
  const normalizedBasePath = stripLocalePrefix(basePath);
  const path = `${normalizedBasePath}/${slug}`.replace(/\/{2,}/g, '/');

  return localizePathname(path, locale);
}

export function isLocalePathname(pathname: string, locale: LocaleKey): boolean {
  return getRegisteredLocaleFromPathname(pathname) === locale;
}

export function hasDuplicateLocalePrefix(pathname: string): boolean {
  const segments = normalizeSegments(pathname);
  const locale = PREFIX_TO_LOCALE.get(segments[0] ?? '');
  return Boolean(locale && segments[1] === LOCALE_REGISTRY[locale].urlPrefix);
}

export function isTurkishPathname(pathname: string): boolean {
  return isLocalePathname(pathname, 'tr');
}
