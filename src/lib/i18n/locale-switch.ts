import { DEFAULT_SITE_LOCALE, isSiteLocale, type SiteLocale } from './config';
import {
  getLocaleFromPathname,
  hasDuplicateLocalePrefix,
  localizePathname,
  normalizePathname,
  stripLocalePrefix,
} from './pathname';
import {
  EXPERIENCE_CATEGORY_ROUTES,
  getStaticRoutePolicy,
  isRouteAvailableForLocale,
} from './static-routes';

export type LocaleSwitchFamily = 'cultural-worlds' | 'experiences' | 'insights';

export type LocaleSwitchRouteKind =
  | 'home'
  | 'listing'
  | 'detail'
  | 'category'
  | 'static'
  | 'unknown';

export interface LocalizedRouteClassification {
  currentLocale: SiteLocale;
  family: LocaleSwitchFamily | null;
  kind: LocaleSwitchRouteKind;
  normalizedPathname: string;
  slug: string | null;
  unprefixedPathname: string;
}

export interface LocaleSwitchPlan {
  candidatePath: string | null;
  classification: LocalizedRouteClassification;
  fallbackPath: string;
  preserveUrlState: boolean;
  requiresProbe: boolean;
  targetLocale: SiteLocale;
}

export interface LocaleSwitchResolution {
  plan: LocaleSwitchPlan;
  targetPath: string;
  usedFallback: boolean;
}

type RouteProbe = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Pick<Response, 'ok' | 'status' | 'url'>>;

const ROUTE_FAMILIES = new Set<LocaleSwitchFamily>(['cultural-worlds', 'experiences', 'insights']);

const EXPERIENCE_CATEGORY_PATHS = new Set<string>(EXPERIENCE_CATEGORY_ROUTES);

const LISTING_PATHS = new Set(['/cultural-worlds', '/experiences', '/insights']);

function normalizeSearch(search?: string): string {
  if (!search) return '';
  return search.startsWith('?') ? search : `?${search}`;
}

function normalizeHash(hash?: string): string {
  if (!hash) return '';
  return hash.startsWith('#') ? hash : `#${hash}`;
}

function joinPathWithState(pathname: string, search?: string, hash?: string): string {
  return `${pathname}${normalizeSearch(search)}${normalizeHash(hash)}`;
}

function isSafeInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith('/') && !pathname.startsWith('//') && !/^[a-z][a-z0-9+.-]*:/i.test(pathname)
  );
}

function normalizeSlugSegment(slug: string): string | null {
  if (!slug) return null;

  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
}

function buildFamilyPath(family: LocaleSwitchFamily, slug: string, locale: SiteLocale): string {
  return localizePathname(`/${family}/${slug}`, locale);
}

function getFamilyListingPath(family: LocaleSwitchFamily, locale: SiteLocale): string {
  return localizePathname(`/${family}`, locale);
}

export function classifyLocalizedRoute(pathname: string): LocalizedRouteClassification {
  const normalizedPathname = normalizePathname(pathname);

  if (!isSafeInternalPath(normalizedPathname)) {
    return {
      currentLocale: DEFAULT_SITE_LOCALE,
      family: null,
      kind: 'unknown',
      normalizedPathname: '/',
      slug: null,
      unprefixedPathname: '/',
    };
  }

  const currentLocale = getLocaleFromPathname(normalizedPathname);
  const unprefixedPathname = stripLocalePrefix(normalizedPathname);
  const segments = unprefixedPathname.split('/').filter(Boolean);
  const family = ROUTE_FAMILIES.has(segments[0] as LocaleSwitchFamily)
    ? (segments[0] as LocaleSwitchFamily)
    : null;

  if (unprefixedPathname === '/') {
    return {
      currentLocale,
      family: null,
      kind: 'home',
      normalizedPathname,
      slug: null,
      unprefixedPathname,
    };
  }

  if (LISTING_PATHS.has(unprefixedPathname)) {
    return {
      currentLocale,
      family,
      kind: 'listing',
      normalizedPathname,
      slug: null,
      unprefixedPathname,
    };
  }

  if (EXPERIENCE_CATEGORY_PATHS.has(unprefixedPathname)) {
    return {
      currentLocale,
      family: 'experiences',
      kind: 'category',
      normalizedPathname,
      slug: segments[1] ?? null,
      unprefixedPathname,
    };
  }

  if (getStaticRoutePolicy(unprefixedPathname)) {
    return {
      currentLocale,
      family: null,
      kind: 'static',
      normalizedPathname,
      slug: null,
      unprefixedPathname,
    };
  }

  if (family && segments.length === 2) {
    return {
      currentLocale,
      family,
      kind: 'detail',
      normalizedPathname,
      slug: normalizeSlugSegment(segments[1]),
      unprefixedPathname,
    };
  }

  return {
    currentLocale,
    family: null,
    kind: 'unknown',
    normalizedPathname,
    slug: null,
    unprefixedPathname,
  };
}

export function getLocaleFallbackPath(pathname: string, targetLocale: SiteLocale): string {
  if (!isSiteLocale(targetLocale)) {
    throw new Error(`Unsupported locale: ${String(targetLocale)}`);
  }

  const classification = classifyLocalizedRoute(pathname);

  if (classification.kind === 'detail' && classification.family) {
    return getFamilyListingPath(classification.family, targetLocale);
  }

  if (classification.kind === 'category') {
    return getFamilyListingPath('experiences', targetLocale);
  }

  return localizePathname('/', targetLocale);
}

export function buildLocaleSwitchCandidate(
  pathname: string,
  targetLocale: SiteLocale
): string | null {
  if (!isSiteLocale(targetLocale)) {
    throw new Error(`Unsupported locale: ${String(targetLocale)}`);
  }

  const classification = classifyLocalizedRoute(pathname);

  if (classification.kind === 'home') {
    return localizePathname('/', targetLocale);
  }

  if (classification.kind === 'listing') {
    return localizePathname(classification.unprefixedPathname, targetLocale);
  }

  if (classification.kind === 'detail' && classification.family && classification.slug) {
    return buildFamilyPath(classification.family, classification.slug, targetLocale);
  }

  if (classification.kind === 'category') {
    return localizePathname(classification.unprefixedPathname, targetLocale);
  }

  const staticRoute = getStaticRoutePolicy(classification.unprefixedPathname);
  if (
    classification.kind === 'static' &&
    staticRoute &&
    isRouteAvailableForLocale(staticRoute, targetLocale)
  ) {
    return localizePathname(classification.unprefixedPathname, targetLocale);
  }

  return null;
}

export function createLocaleSwitchPlan(
  pathname: string,
  targetLocale: SiteLocale,
  search = '',
  hash = ''
): LocaleSwitchPlan {
  if (!isSiteLocale(targetLocale)) {
    throw new Error(`Unsupported locale: ${String(targetLocale)}`);
  }

  const classification = classifyLocalizedRoute(pathname);
  const candidatePathname = buildLocaleSwitchCandidate(pathname, targetLocale);
  const fallbackPath = getLocaleFallbackPath(pathname, targetLocale);
  const requiresProbe = classification.kind === 'detail' && Boolean(candidatePathname);
  const preserveUrlState = Boolean(candidatePathname);

  return {
    candidatePath: candidatePathname ? joinPathWithState(candidatePathname, search, hash) : null,
    classification,
    fallbackPath,
    preserveUrlState,
    requiresProbe,
    targetLocale,
  };
}

export function finalizeLocaleSwitchTarget(
  plan: LocaleSwitchPlan,
  candidateExists: boolean,
  verifiedCandidatePath?: string | null
): LocaleSwitchResolution {
  const shouldUseCandidate =
    Boolean(plan.candidatePath) && (!plan.requiresProbe || candidateExists);

  if (shouldUseCandidate) {
    return {
      plan,
      targetPath: verifiedCandidatePath ?? plan.candidatePath ?? plan.fallbackPath,
      usedFallback: false,
    };
  }

  return {
    plan,
    targetPath: plan.fallbackPath,
    usedFallback: true,
  };
}

export function isSafeSameOriginUrl(value: string, origin: string): boolean {
  if (!value || value.startsWith('//')) return false;

  try {
    return new URL(value, origin).origin === origin;
  } catch {
    return false;
  }
}

export function getSafeSameOriginPath(value: string, origin: string): string | null {
  if (!isSafeSameOriginUrl(value, origin)) return null;

  const url = new URL(value, origin);
  return `${url.pathname}${url.search}`;
}

function isExpectedLocalePath(pathname: string, targetLocale: SiteLocale): boolean {
  return getLocaleFromPathname(pathname) === targetLocale;
}

function isExpectedFamilyPath(pathname: string, expectedFamily: LocaleSwitchFamily): boolean {
  const classification = classifyLocalizedRoute(pathname);
  return classification.kind === 'detail' && classification.family === expectedFamily;
}

function getValidatedRouteProbePath({
  expectedFamily,
  origin,
  targetLocale,
  value,
}: {
  expectedFamily: LocaleSwitchFamily;
  origin: string;
  targetLocale: SiteLocale;
  value: string;
}): string | null {
  if (!isSafeSameOriginUrl(value, origin)) return null;

  const url = new URL(value, origin);

  if (hasDuplicateLocalePrefix(url.pathname)) return null;
  if (!isExpectedLocalePath(url.pathname, targetLocale)) return null;
  if (!isExpectedFamilyPath(url.pathname, expectedFamily)) return null;

  return `${url.pathname}${url.search}`;
}

async function probeRouteExists(
  expectedFamily: LocaleSwitchFamily,
  targetPath: string,
  targetLocale: SiteLocale,
  origin: string,
  signal?: AbortSignal,
  routeProbe: RouteProbe = fetch
): Promise<string | null> {
  if (!isSafeSameOriginUrl(targetPath, origin)) return null;

  const targetUrl = new URL(targetPath, origin);
  const response = await routeProbe(`${targetUrl.pathname}${targetUrl.search}`, {
    cache: 'no-store',
    credentials: 'same-origin',
    method: 'HEAD',
    redirect: 'follow',
    signal,
  });

  if (response.status === 404 || !response.ok) {
    return null;
  }

  const finalUrl = response.url || `${targetUrl.pathname}${targetUrl.search}`;
  return getValidatedRouteProbePath({
    expectedFamily,
    origin,
    targetLocale,
    value: finalUrl,
  });
}

export async function resolveLocaleSwitchTarget({
  hash = '',
  origin,
  pathname,
  routeProbe,
  search = '',
  signal,
  targetLocale,
}: {
  hash?: string;
  origin: string;
  pathname: string;
  routeProbe?: RouteProbe;
  search?: string;
  signal?: AbortSignal;
  targetLocale: SiteLocale;
}): Promise<LocaleSwitchResolution> {
  const plan = createLocaleSwitchPlan(pathname, targetLocale, search, hash);

  if (!plan.requiresProbe || !plan.candidatePath) {
    return finalizeLocaleSwitchTarget(plan, Boolean(plan.candidatePath));
  }

  try {
    if (!plan.classification.family) {
      return finalizeLocaleSwitchTarget(plan, false);
    }

    const verifiedPath = await probeRouteExists(
      plan.classification.family,
      plan.candidatePath,
      targetLocale,
      origin,
      signal,
      routeProbe
    );
    const verifiedTarget = verifiedPath ? `${verifiedPath}${normalizeHash(hash)}` : null;

    return finalizeLocaleSwitchTarget(plan, Boolean(verifiedPath), verifiedTarget);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    return finalizeLocaleSwitchTarget(plan, false);
  }
}
