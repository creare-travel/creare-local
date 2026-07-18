/**
 * Centralized SEO constants for CREARE
 * Use these across all pages for consistency.
 */
import { DEFAULT_SITE_LOCALE, isSiteLocale, type SiteLocale } from './i18n/config';

export const SITE_URL = 'https://crearetravel.com';
export const SITE_NAME = 'Creare';
export const PRODUCTION_CANONICAL_HOSTNAME = 'crearetravel.com';

export type CanonicalRouteFamily =
  | 'home'
  | 'cultural-worlds'
  | 'cultural-world-detail'
  | 'experiences'
  | 'experience-detail'
  | 'insights'
  | 'insight-detail';

interface RouteCanonicalOptions {
  family: CanonicalRouteFamily;
  locale: SiteLocale;
  slug?: string;
}

/**
 * Default OG image — 1200×630, used as fallback across all pages.
 * Place a real 1200×630 JPG at /public/og/default.jpg for production.
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;
export const DEFAULT_OG_IMAGE_ALT = 'Creare — Private Cultural Experiences Composed as Art';

// Active hreflang foundation for current production. Future locales can be
// added here once locale-specific routes are actually live.
export const ACTIVE_HREFLANGS = ['en'] as const;

export const DEFAULT_METADATA = {
  metadataBase: new URL(SITE_URL),
  siteName: SITE_NAME,
  defaultTitle: 'Creare — Experiences Composed as Art',
  titleTemplate: '%s — Creare',
  defaultDescription:
    'Creare curates private cultural encounters across Turkey and beyond — monastery access, atelier visits, and extraordinary moments for discerning clients.',
};

/**
 * Build a canonical URL from a path segment.
 * @example canonicalUrl('/philosophy') → 'https://crearetravel.com/philosophy'
 */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${normalizeCanonicalPath(path)}`;
}

function normalizeCanonicalPath(path: string): string {
  const rawPath = path.trim();

  if (!rawPath) return '/';
  if (rawPath.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(rawPath)) {
    throw new Error(`Canonical path must be internal: ${path}`);
  }

  const withoutHash = rawPath.split('#')[0] ?? '';
  const withoutQuery = withoutHash.split('?')[0] ?? '';
  const withRoot = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const normalized = withRoot.replace(/\/{2,}/g, '/');
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] === 'tr' && segments[1] === 'tr') {
    throw new Error(`Canonical path cannot contain duplicate Turkish prefix: ${path}`);
  }

  if (segments.length === 0) return '/';

  return `/${segments.join('/')}`;
}

function normalizeSlugSegment(slug: string | undefined, family: CanonicalRouteFamily): string {
  if (!slug) {
    throw new Error(`Canonical slug is required for ${family}`);
  }

  const trimmedSlug = slug.trim();

  if (
    !trimmedSlug ||
    trimmedSlug.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmedSlug) ||
    /[/?#]/.test(trimmedSlug)
  ) {
    throw new Error(`Invalid canonical slug: ${slug}`);
  }

  let decodedSlug: string;

  try {
    decodedSlug = decodeURIComponent(trimmedSlug);
  } catch {
    throw new Error(`Malformed canonical slug: ${slug}`);
  }

  if (!decodedSlug || /[/?#]/.test(decodedSlug)) {
    throw new Error(`Invalid canonical slug: ${slug}`);
  }

  return encodeURIComponent(decodedSlug);
}

function getCanonicalRoutePath({ family, locale, slug }: RouteCanonicalOptions): string {
  if (!isSiteLocale(locale)) {
    throw new Error(`Unsupported canonical locale: ${String(locale)}`);
  }

  const localePrefix = locale === DEFAULT_SITE_LOCALE ? '' : '/tr';

  switch (family) {
    case 'home':
      if (slug) throw new Error('Homepage canonical must not include a slug');
      return locale === DEFAULT_SITE_LOCALE ? '/' : '/tr';
    case 'cultural-worlds':
      if (slug) throw new Error('Cultural worlds listing canonical must not include a slug');
      return `${localePrefix}/cultural-worlds`;
    case 'cultural-world-detail':
      return `${localePrefix}/cultural-worlds/${normalizeSlugSegment(slug, family)}`;
    case 'experiences':
      if (slug) throw new Error('Experiences listing canonical must not include a slug');
      return `${localePrefix}/experiences`;
    case 'experience-detail':
      return `${localePrefix}/experiences/${normalizeSlugSegment(slug, family)}`;
    case 'insights':
      if (slug) throw new Error('Insights listing canonical must not include a slug');
      return `${localePrefix}/insights`;
    case 'insight-detail':
      return `${localePrefix}/insights/${normalizeSlugSegment(slug, family)}`;
    default:
      throw new Error(`Unsupported canonical route family: ${String(family)}`);
  }
}

export function buildRouteCanonicalUrl(options: RouteCanonicalOptions): string {
  return canonicalUrl(getCanonicalRoutePath(options));
}

export function buildRouteCanonicalAlternates(options: RouteCanonicalOptions) {
  return {
    canonical: buildRouteCanonicalUrl(options),
  };
}

/**
 * Build hreflang alternate links for a page.
 */
export function buildHreflangs(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const alternates: Array<{ hrefLang: string; href: string }> = [];

  ACTIVE_HREFLANGS.forEach((lang) => {
    alternates.push({
      hrefLang: lang,
      href: `${SITE_URL}${normalized}`,
    });
  });

  alternates.push({
    hrefLang: 'x-default',
    href: `${SITE_URL}${normalized}`,
  });

  return alternates;
}

export function buildMetadataAlternates(path: string) {
  const canonical = canonicalUrl(path);

  return {
    canonical,
    languages: {
      en: canonical,
      'x-default': canonical,
    },
  };
}

/**
 * Resolve OG image URL — always returns an absolute URL.
 * If a full URL is passed (http/https), it is returned as-is.
 * If a relative path is passed, it is prefixed with SITE_URL.
 * Falls back to DEFAULT_OG_IMAGE.
 */
export function resolveOgImage(imageUrl?: string): string {
  if (!imageUrl) return DEFAULT_OG_IMAGE;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${SITE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

/**
 * Build standard OpenGraph metadata for a page.
 * Always produces 1200×630 images with absolute URLs.
 */
export function buildOpenGraph(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
}) {
  const imageUrl = resolveOgImage(options.image);
  return {
    title: options.title,
    description: options.description,
    url: canonicalUrl(options.path),
    siteName: SITE_NAME,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: options.imageAlt || options.title,
      },
    ],
    type: (options.type ?? 'website') as 'website' | 'article',
  };
}

/**
 * Build Twitter / X card metadata.
 * Uses summary_large_image for all pages (1200×630 compatible).
 */
export function buildTwitterCard(options: {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}) {
  const imageUrl = resolveOgImage(options.image);
  return {
    card: 'summary_large_image' as const,
    title: options.title,
    description: options.description,
    images: [imageUrl],
    ...(options.imageAlt ? { imageAlt: options.imageAlt } : {}),
  };
}

/**
 * Validate that a canonical URL is absolute (not relative).
 */
export function isAbsoluteCanonical(canonical: string): boolean {
  return canonical.startsWith('http://') || canonical.startsWith('https://');
}

/**
 * Ensure canonical URL is absolute.
 */
export function ensureAbsoluteCanonical(path: string): string {
  if (isAbsoluteCanonical(path)) {
    return path;
  }
  return canonicalUrl(path);
}
