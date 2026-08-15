import { DEFAULT_SITE_LOCALE, type SiteLocale } from './config';
import { localizePathname } from './pathname';

export type PrimaryNavigationKey =
  | 'culturalWorlds'
  | 'experiences'
  | 'insights'
  | 'philosophy'
  | 'contact';

export type FooterNavigationKey = PrimaryNavigationKey;
export type LegalNavigationKey = 'privacy' | 'cookies' | 'terms';
export type ExperienceCategoryPath =
  | '/experiences/signature'
  | '/experiences/lab'
  | '/experiences/black';

export type TurkishRouteAvailability =
  | 'available'
  | 'parent-fallback'
  | 'copy-approval-required'
  | 'legal-approval-required'
  | 'english-only';

export interface PublicRoutePolicy {
  path: string;
  trAvailability: TurkishRouteAvailability;
}

interface NavigationRoute<TKey extends string> extends PublicRoutePolicy {
  key: TKey;
}

export const PRIMARY_NAVIGATION_ROUTES: ReadonlyArray<NavigationRoute<PrimaryNavigationKey>> = [
  { key: 'culturalWorlds', path: '/cultural-worlds', trAvailability: 'available' },
  { key: 'experiences', path: '/experiences', trAvailability: 'available' },
  { key: 'insights', path: '/insights', trAvailability: 'available' },
  { key: 'philosophy', path: '/philosophy', trAvailability: 'available' },
  { key: 'contact', path: '/contact', trAvailability: 'available' },
];

export const FOOTER_NAVIGATION_ROUTES: ReadonlyArray<NavigationRoute<FooterNavigationKey>> =
  PRIMARY_NAVIGATION_ROUTES;

export const LEGAL_NAVIGATION_ROUTES: ReadonlyArray<NavigationRoute<LegalNavigationKey>> = [
  { key: 'privacy', path: '/privacy', trAvailability: 'available' },
  { key: 'cookies', path: '/cookies', trAvailability: 'available' },
  { key: 'terms', path: '/terms', trAvailability: 'available' },
];

export const EXPERIENCE_CATEGORY_ROUTES: ReadonlyArray<ExperienceCategoryPath> = [
  '/experiences/signature',
  '/experiences/lab',
  '/experiences/black',
];

export function isRouteAvailableForLocale(route: PublicRoutePolicy, locale: SiteLocale): boolean {
  return locale === DEFAULT_SITE_LOCALE || route.trAvailability === 'available';
}

export function getPrimaryNavigationRoutes(locale: SiteLocale) {
  return PRIMARY_NAVIGATION_ROUTES.filter((route) => isRouteAvailableForLocale(route, locale)).map(
    (route) => ({
      ...route,
      href: localizePathname(route.path, locale),
    })
  );
}

export function getFooterNavigationRoutes(locale: SiteLocale) {
  return FOOTER_NAVIGATION_ROUTES.filter((route) => isRouteAvailableForLocale(route, locale)).map(
    (route) => ({
      ...route,
      href: localizePathname(route.path, locale),
    })
  );
}

export function getLegalNavigationRoutes(locale: SiteLocale) {
  return LEGAL_NAVIGATION_ROUTES.filter((route) => isRouteAvailableForLocale(route, locale)).map(
    (route) => ({
      ...route,
      href: localizePathname(route.path, locale),
    })
  );
}

export function getExperienceCategoryTarget(
  path: ExperienceCategoryPath,
  locale: SiteLocale
): string {
  return localizePathname(path, locale);
}

export function getPrivateInquiryHref(locale: SiteLocale, query = ''): string | null {
  return `${localizePathname('/contact', locale)}${query}`;
}
