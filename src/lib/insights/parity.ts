import { insights, type CanonicalCulturalWorldSlug, type Insight } from '@/data/insights';
import { DEFAULT_SITE_LOCALE, type SiteLocale } from '@/lib/i18n/config';

export const PRIVATE_LIFE_INSIGHT_SLUG = 'private-life-of-istanbul';

export const INSIGHT_EDITORIAL_ORDER_SLUGS = [
  'private-experiences-istanbul-what-access-really-means',
  PRIVATE_LIFE_INSIGHT_SLUG,
  'cappadocia-without-balloons-a-different-kind-of-silence',
  'bodrum-beyond-the-coast-where-the-aegean-slows-down',
  'private-experiences-bodrum-beyond-the-marina',
  'bodrum-without-beach-clubs-a-different-rhythm',
  'cappadocia-at-first-light',
  'cappadocia-without-tours-moving-outside-the-routes',
  'private-experiences-cappadocia-silence-space-access',
  'istanbul-without-the-crowds-where-the-city-still-breathes',
  'what-makes-an-experience-truly-private',
  'what-exclusive-travel-actually-means',
  'why-most-luxury-travel-is-actually-mass-tourism',
  'the-aegean-as-a-cultural-argument',
  'bodrum-beyond-the-marina',
  'private-experiences-aegean-what-cannot-be-booked',
] as const;

export const FEATURED_INSIGHT_SLUGS = [
  'private-experiences-istanbul-what-access-really-means',
  PRIVATE_LIFE_INSIGHT_SLUG,
  'cappadocia-without-balloons-a-different-kind-of-silence',
  'bodrum-beyond-the-coast-where-the-aegean-slows-down',
] as const;

export const CULTURAL_WORLD_INSIGHT_SLUGS = [
  'private-experiences-bodrum-beyond-the-marina',
  'cappadocia-at-first-light',
  'cappadocia-without-tours-moving-outside-the-routes',
  'bodrum-without-beach-clubs-a-different-rhythm',
  'istanbul-without-the-crowds-where-the-city-still-breathes',
  'private-experiences-cappadocia-silence-space-access',
] as const;

export const EDITORIAL_INSIGHT_SLUGS = [
  'what-makes-an-experience-truly-private',
  'what-exclusive-travel-actually-means',
  'why-most-luxury-travel-is-actually-mass-tourism',
  'the-aegean-as-a-cultural-argument',
] as const;

export interface StaticInsightIdentity {
  slug: string;
  location: Insight['location'];
  culturalWorldSlug?: CanonicalCulturalWorldSlug;
  relatedExperienceSlugs: readonly string[];
  relatedInsightSlugs: readonly string[];
}

const identityBySlug = new Map<string, StaticInsightIdentity>(
  insights.map((insight) => [
    insight.slug,
    {
      slug: insight.slug,
      location: insight.location,
      culturalWorldSlug: insight.culturalWorldSlug,
      relatedExperienceSlugs: insight.relatedExperiences,
      relatedInsightSlugs: insight.relatedEssays ?? [],
    },
  ])
);

const migratedInsightSlugs = new Set(
  insights.map((insight) => insight.slug).filter((slug) => slug !== PRIVATE_LIFE_INSIGHT_SLUG)
);

const locationLabels: Record<SiteLocale, Record<Insight['location'], string>> = {
  en: {
    istanbul: 'Istanbul',
    bodrum: 'Bodrum',
    cappadocia: 'Cappadocia',
    aegean: 'Aegean',
  },
  tr: {
    istanbul: 'İstanbul',
    bodrum: 'Bodrum',
    cappadocia: 'Kapadokya',
    aegean: 'Ege',
  },
};

export function getStaticInsightIdentity(slug: string): StaticInsightIdentity | undefined {
  return identityBySlug.get(slug);
}

export function isMigratedStaticInsightSlug(slug: string): boolean {
  return migratedInsightSlugs.has(slug);
}

export function canUseStaticInsightIdentity(slug: string, locale: SiteLocale): boolean {
  return locale === DEFAULT_SITE_LOCALE || isMigratedStaticInsightSlug(slug);
}

export function getInsightIdentityLocationLabel(
  slug: string,
  locale: SiteLocale
): string | undefined {
  if (!canUseStaticInsightIdentity(slug, locale)) return undefined;
  const identity = getStaticInsightIdentity(slug);
  return identity ? locationLabels[locale][identity.location] : undefined;
}

export function getCulturalWorldLabel(
  slug: CanonicalCulturalWorldSlug,
  locale: SiteLocale
): string {
  return locationLabels[locale][slug];
}

export function getInsightIdentityDestination(
  slug: string,
  locale: SiteLocale
): { slug: CanonicalCulturalWorldSlug; name: string } | null {
  if (!canUseStaticInsightIdentity(slug, locale)) return null;
  const culturalWorldSlug = getStaticInsightIdentity(slug)?.culturalWorldSlug;
  if (!culturalWorldSlug) return null;

  return {
    slug: culturalWorldSlug,
    name: getCulturalWorldLabel(culturalWorldSlug, locale),
  };
}

export function selectItemsBySlugOrder<T extends { slug?: string }>(
  slugs: readonly string[],
  items: readonly T[]
): T[] {
  const bySlug = new Map(
    items
      .filter((item): item is T & { slug: string } => Boolean(item.slug))
      .map((item) => [item.slug, item])
  );

  return [...new Set(slugs)].flatMap((slug) => {
    const item = bySlug.get(slug);
    return item ? [item] : [];
  });
}

export function orderInsightItems<T extends { slug: string }>(items: readonly T[]): T[] {
  const deduplicated = new Map<string, T>();
  items.forEach((item) => deduplicated.set(item.slug, item));

  const knownItems = selectItemsBySlugOrder(INSIGHT_EDITORIAL_ORDER_SLUGS, [
    ...deduplicated.values(),
  ]);
  const knownSlugs = new Set<string>(INSIGHT_EDITORIAL_ORDER_SLUGS);
  const unknownItems = [...deduplicated.values()].filter((item) => !knownSlugs.has(item.slug));

  return [...knownItems, ...unknownItems];
}

export function orderInsightItemsForLocale<T extends { slug: string }>(
  items: readonly T[],
  locale: SiteLocale
): T[] {
  return locale === DEFAULT_SITE_LOCALE ? [...items] : orderInsightItems(items);
}

export function getRelatedEssaysSectionAriaLabel(
  locale: SiteLocale,
  localizedLabel: string
): string {
  return locale === DEFAULT_SITE_LOCALE ? 'Related essays' : localizedLabel;
}

export function getRelatedEssayLinkAriaLabel(
  locale: SiteLocale,
  title: string,
  localizedReadLabel: string
): string {
  return locale === DEFAULT_SITE_LOCALE
    ? `Read related essay: ${title}`
    : `${localizedReadLabel}: ${title}`;
}
