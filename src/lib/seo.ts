/**
 * Centralized SEO constants for CREARE
 * Use these across all pages for consistency.
 */

export const SITE_URL = 'https://crearetravel.com';
export const SITE_NAME = 'Creare';

/**
 * Default OG image — 1200×630, used as fallback across all pages.
 * Place a real 1200×630 JPG at /public/og/default.jpg for production.
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;
export const DEFAULT_OG_IMAGE_ALT = 'Creare — Private Cultural Experiences Composed as Art';

// Supported languages for hreflang
export const SUPPORTED_LANGUAGES = ['en', 'tr', 'ru', 'zh'];

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
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Build hreflang alternate links for a page.
 */
export function buildHreflangs(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const alternates: Array<{ hrefLang: string; href: string }> = [];

  SUPPORTED_LANGUAGES.forEach((lang) => {
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
