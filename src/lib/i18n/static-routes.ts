import {
  DEFAULT_SITE_LOCALE,
  SUPPORTED_SITE_LOCALES,
  type LocaleKey,
  type SiteLocale,
} from './config';
import { localizePathname, stripLocalePrefix } from './pathname';

export type PrimaryNavigationKey =
  'culturalWorlds' | 'experiences' | 'insights' | 'philosophy' | 'contact';

export type FooterNavigationKey = PrimaryNavigationKey;
export type LegalNavigationKey = 'privacy' | 'cookies' | 'terms';
export type ExperienceCategoryPath =
  '/experiences/signature' | '/experiences/lab' | '/experiences/black';

export type RouteAvailability =
  | 'available'
  | 'parent-fallback'
  | 'copy-approval-required'
  | 'legal-approval-required'
  | 'locale-inactive'
  | 'unavailable';

export interface PublicRoutePolicy {
  path: string;
  availability: Partial<Record<LocaleKey, RouteAvailability>>;
}

interface NavigationRoute<TKey extends string> extends PublicRoutePolicy {
  key: TKey;
}

const ACTIVE_STATIC_AVAILABILITY = {
  en: 'available',
  tr: 'available',
  zh: 'available',
} as const satisfies Record<LocaleKey, RouteAvailability>;

const ENGLISH_ONLY_AVAILABILITY = {
  en: 'available',
  tr: 'unavailable',
  zh: 'unavailable',
} as const satisfies Record<LocaleKey, RouteAvailability>;

export const PRIMARY_NAVIGATION_ROUTES: ReadonlyArray<NavigationRoute<PrimaryNavigationKey>> = [
  { key: 'culturalWorlds', path: '/cultural-worlds', availability: ACTIVE_STATIC_AVAILABILITY },
  { key: 'experiences', path: '/experiences', availability: ACTIVE_STATIC_AVAILABILITY },
  { key: 'insights', path: '/insights', availability: ACTIVE_STATIC_AVAILABILITY },
  { key: 'philosophy', path: '/philosophy', availability: ACTIVE_STATIC_AVAILABILITY },
  { key: 'contact', path: '/contact', availability: ACTIVE_STATIC_AVAILABILITY },
];

export const FOOTER_NAVIGATION_ROUTES: ReadonlyArray<NavigationRoute<FooterNavigationKey>> =
  PRIMARY_NAVIGATION_ROUTES;

export const LEGAL_NAVIGATION_ROUTES: ReadonlyArray<NavigationRoute<LegalNavigationKey>> = [
  { key: 'privacy', path: '/privacy', availability: ACTIVE_STATIC_AVAILABILITY },
  { key: 'cookies', path: '/cookies', availability: ACTIVE_STATIC_AVAILABILITY },
  { key: 'terms', path: '/terms', availability: ACTIVE_STATIC_AVAILABILITY },
];

export const EXPERIENCE_CATEGORY_ROUTES: ReadonlyArray<ExperienceCategoryPath> = [
  '/experiences/signature',
  '/experiences/lab',
  '/experiences/black',
];

const EXPERIENCE_CATEGORY_POLICIES: PublicRoutePolicy[] = EXPERIENCE_CATEGORY_ROUTES.map(
  (path) => ({
    path,
    availability: ACTIVE_STATIC_AVAILABILITY,
  })
);

const OTHER_STATIC_ROUTE_POLICIES: PublicRoutePolicy[] = [
  { path: '/', availability: ACTIVE_STATIC_AVAILABILITY },
  { path: '/editorial', availability: ENGLISH_ONLY_AVAILABILITY },
  { path: '/stories', availability: ENGLISH_ONLY_AVAILABILITY },
  { path: '/thank-you', availability: ENGLISH_ONLY_AVAILABILITY },
];

export const PUBLIC_STATIC_ROUTE_POLICIES: ReadonlyArray<PublicRoutePolicy> = [
  ...OTHER_STATIC_ROUTE_POLICIES,
  ...PRIMARY_NAVIGATION_ROUTES,
  ...LEGAL_NAVIGATION_ROUTES,
  ...EXPERIENCE_CATEGORY_POLICIES,
];

export function getStaticRoutePolicy(pathname: string): PublicRoutePolicy | undefined {
  const path = stripLocalePrefix(pathname);
  return PUBLIC_STATIC_ROUTE_POLICIES.find((route) => route.path === path);
}

export function getRouteAvailability(
  route: PublicRoutePolicy,
  locale: LocaleKey
): RouteAvailability {
  return (
    route.availability[locale] ?? (locale === DEFAULT_SITE_LOCALE ? 'available' : 'unavailable')
  );
}

export function isRouteAvailableForLocale(route: PublicRoutePolicy, locale: LocaleKey): boolean {
  return getRouteAvailability(route, locale) === 'available';
}

export function isStaticPathAvailableForLocale(pathname: string, locale: LocaleKey): boolean {
  const policy = getStaticRoutePolicy(pathname);
  return Boolean(policy && isRouteAvailableForLocale(policy, locale));
}

export function getAvailableStaticRouteLocales(pathname: string): SiteLocale[] {
  const policy = getStaticRoutePolicy(pathname);
  if (!policy) return [];
  return SUPPORTED_SITE_LOCALES.filter((locale) => isRouteAvailableForLocale(policy, locale));
}

export function getPrimaryNavigationRoutes(locale: SiteLocale) {
  return PRIMARY_NAVIGATION_ROUTES.filter((route) => isRouteAvailableForLocale(route, locale)).map(
    (route) => ({ ...route, href: localizePathname(route.path, locale) })
  );
}

export function getFooterNavigationRoutes(locale: SiteLocale) {
  return FOOTER_NAVIGATION_ROUTES.filter((route) => isRouteAvailableForLocale(route, locale)).map(
    (route) => ({ ...route, href: localizePathname(route.path, locale) })
  );
}

export function getLegalNavigationRoutes(locale: SiteLocale) {
  return LEGAL_NAVIGATION_ROUTES.filter((route) => isRouteAvailableForLocale(route, locale)).map(
    (route) => ({ ...route, href: localizePathname(route.path, locale) })
  );
}

export function getExperienceCategoryTarget(
  path: ExperienceCategoryPath,
  locale: SiteLocale
): string {
  return localizePathname(path, locale);
}

export function getPrivateInquiryHref(locale: SiteLocale, query = ''): string | null {
  const route = PRIMARY_NAVIGATION_ROUTES.find((candidate) => candidate.path === '/contact');
  if (!route || !isRouteAvailableForLocale(route, locale)) return null;
  return `${localizePathname('/contact', locale)}${query}`;
}
