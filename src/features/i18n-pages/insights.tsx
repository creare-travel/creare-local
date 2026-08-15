import Link from 'next/link';
import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import { insights, isCanonicalCulturalWorldSlug } from '@/data/insights';
import { filterPublicInsights } from '@/lib/canonical-gates';
import { isRenderableEditorialImage, type EditorialImageLike } from '@/lib/editorial-image';
import {
  buildMetadataAlternates,
  buildOpenGraph,
  buildTwitterCard,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '@/lib/seo';
import { buildCanonicalUrl, buildInsightListingGraph } from '@/lib/schema-builder';
import { canUseEnglishFallback } from '@/lib/i18n/data-layer';
import { DEFAULT_SITE_LOCALE, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizePathname } from '@/lib/i18n/pathname';
import {
  CULTURAL_WORLD_INSIGHT_SLUGS,
  EDITORIAL_INSIGHT_SLUGS,
  FEATURED_INSIGHT_SLUGS,
  getCulturalWorldLabel,
  getInsightIdentityDestination,
  orderInsightItemsForLocale,
} from '@/lib/insights/parity';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const canonicalInsightSlug = (slug: string | undefined): string | undefined =>
  slug === 'the-private-life-of-istanbul' ? 'private-life-of-istanbul' : slug;

const insightsTitle = 'Insights';
const insightsDescription =
  'Editorial perspectives on private cultural encounters across Turkey — Istanbul, Bodrum, Cappadocia, and the Aegean coast.';

export const metadata: Metadata = {
  title: insightsTitle,
  description: insightsDescription,
  alternates: buildMetadataAlternates('/insights'),
  openGraph: buildOpenGraph({
    title: insightsTitle,
    description: insightsDescription,
    path: '/insights',
  }),
  twitter: buildTwitterCard({
    title: insightsTitle,
    description: insightsDescription,
    image: DEFAULT_OG_IMAGE,
    imageAlt: DEFAULT_OG_IMAGE_ALT,
  }),
};

interface InsightCoverImage extends EditorialImageLike {
  alternativeText?: string;
}

interface StrapiMediaEntity {
  id?: number;
  attributes?: InsightCoverImage;
}

interface StrapiInsight {
  id: number;
  attributes?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    cover_image?: {
      data?: StrapiMediaEntity | StrapiMediaEntity[];
    };
    destination?: {
      data?: {
        attributes?: {
          name?: string;
          slug?: string;
        };
      };
    };
  };
  // flat format (Strapi v5)
  title?: string;
  slug?: string;
  excerpt?: string;
  visibility_status?: string;
  publishedAt?: string | null;
  cover_image?: InsightCoverImage | InsightCoverImage[] | null;
  destination?: {
    name?: string;
    slug?: string;
  } | null;
}

interface NormalizedInsight {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  coverImage?: {
    url?: string;
    alternativeText?: string;
  };
  destinationName: string | null;
  culturalWorldSlug?: CulturalWorldGroupKey;
}

type InsightSectionKey = 'featured' | 'cultural-world' | 'editorial' | 'archive';
type CulturalWorldGroupKey = 'bodrum' | 'cappadocia' | 'istanbul';

const SECTION_INTROS: Record<
  InsightSectionKey,
  { eyebrow: string; title: string; description: string }
> = {
  featured: {
    eyebrow: 'Featured Essays',
    title: 'The essays that speak most directly.',
    description:
      'These pieces define CREARE most directly: place intelligence, private cultural access, and the difference between surface travel and meaningful encounter.',
  },
  'cultural-world': {
    eyebrow: 'Cultural World Essays',
    title: 'Istanbul, Bodrum, and Cappadocia, read closely.',
    description:
      'These essays belong to the worlds themselves. They clarify how geography, memory, ritual, and access combine into a coherent cultural logic.',
  },
  editorial: {
    eyebrow: 'Editorial Essays',
    title: 'Essays on privacy, rarity, and cultural attention.',
    description:
      'These texts extend beyond one destination and sharpen CREARE’s editorial position on access, permission, and the social architecture of meaningful travel.',
  },
  archive: {
    eyebrow: 'Further Reading',
    title: 'Further essays in the collection.',
    description:
      'These pieces extend the editorial conversation and remain fully part of the library, even when they sit outside the first reading path.',
  },
};

const CULTURAL_WORLD_GROUP_ORDER: CulturalWorldGroupKey[] = ['bodrum', 'cappadocia', 'istanbul'];

function resolveFirstInsightCoverImage(item: StrapiInsight): InsightCoverImage | null {
  const attributeImage = item.attributes?.cover_image;
  const attributeImageData = attributeImage?.data;

  if (Array.isArray(attributeImageData)) {
    const first = attributeImageData[0];
    const attrs = first?.attributes;
    if (attrs?.url) {
      return {
        id: first.id,
        name: attrs.name,
        url: attrs.url,
        alternativeText: attrs.alternativeText,
      };
    }
  }

  if (
    attributeImageData &&
    !Array.isArray(attributeImageData) &&
    attributeImageData.attributes?.url
  ) {
    return {
      id: attributeImageData.id,
      name: attributeImageData.attributes.name,
      url: attributeImageData.attributes.url,
      alternativeText: attributeImageData.attributes.alternativeText,
    };
  }

  if (Array.isArray(item.cover_image)) {
    const first = item.cover_image[0];
    if (first?.url) {
      return {
        id: first.id,
        name: first.name,
        url: first.url,
        alternativeText: first.alternativeText,
      };
    }
  }

  if (
    item.cover_image &&
    !Array.isArray(item.cover_image) &&
    typeof item.cover_image === 'object' &&
    item.cover_image.url
  ) {
    return {
      id: item.cover_image.id,
      name: item.cover_image.name,
      url: item.cover_image.url,
      alternativeText: item.cover_image.alternativeText,
    };
  }

  return null;
}

function normalizeInsight(item: StrapiInsight, locale: SiteLocale): NormalizedInsight | null {
  // Support both Strapi v4 (attributes) and v5 (flat)
  const attrs = item.attributes ?? item;
  const slug = canonicalInsightSlug(attrs?.slug);
  const title = attrs?.title;
  if (!slug || !title) return null;

  const excerpt = attrs?.excerpt ?? '';

  const coverCandidate = resolveFirstInsightCoverImage(item);
  const coverImage = isRenderableEditorialImage(coverCandidate) ? coverCandidate : null;

  const cmsDestination = item.attributes?.destination?.data?.attributes ?? item.destination;
  const cmsCulturalWorldSlug = isCanonicalCulturalWorldSlug(cmsDestination?.slug)
    ? cmsDestination.slug
    : undefined;
  const identityDestination = getInsightIdentityDestination(slug, locale);
  const culturalWorldSlug = cmsCulturalWorldSlug ?? identityDestination?.slug;
  const destinationName = cmsDestination?.name ?? identityDestination?.name ?? null;

  return {
    slug,
    title,
    excerpt,
    coverImageUrl: coverImage?.url ? mediaUrl(coverImage.url) : undefined,
    coverImage: coverImage
      ? {
          url: coverImage.url,
          alternativeText: coverImage.alternativeText || title,
        }
      : undefined,
    destinationName,
    culturalWorldSlug,
  };
}

async function fetchStrapiInsights(
  locale: SiteLocale = DEFAULT_SITE_LOCALE
): Promise<NormalizedInsight[] | null> {
  const path = '/api/insights?status=published&populate=*';
  try {
    const json = await fetchStrapi(path, { locale });
    const items: StrapiInsight[] = json?.data ?? [];
    if (!items.length) return null;
    const normalized = filterPublicInsights(items)
      .map((item) => normalizeInsight(item, locale))
      .filter(Boolean) as NormalizedInsight[];
    return normalized.length ? normalized : null;
  } catch (error) {
    console.error('Failed to fetch insights index data from Strapi.', {
      route: '/insights',
      strapiPath: path,
      error,
    });
    return null;
  }
}

function buildStaticInsights(locale: SiteLocale = DEFAULT_SITE_LOCALE): NormalizedInsight[] {
  if (!canUseEnglishFallback(locale)) return [];

  return insights.map((insight) => ({
    slug: insight.slug,
    title: insight.title,
    excerpt: insight.description,
    coverImageUrl: undefined,
    coverImage: undefined,
    destinationName: insight.location
      ? insight.location.charAt(0).toUpperCase() + insight.location.slice(1)
      : null,
    culturalWorldSlug: insight.culturalWorldSlug,
  }));
}

function mergeInsights(
  staticItems: NormalizedInsight[],
  strapiItems: NormalizedInsight[] | null,
  locale: SiteLocale
): NormalizedInsight[] {
  const bySlug = new Map(staticItems.map((item) => [item.slug, item]));
  const cmsOnlySlugs: string[] = [];

  strapiItems?.forEach((item) => {
    const existing = bySlug.get(item.slug);
    const merged = {
      ...(existing ?? item),
      ...item,
      excerpt: item.excerpt || existing?.excerpt || '',
      destinationName: item.destinationName ?? existing?.destinationName ?? null,
      culturalWorldSlug: item.culturalWorldSlug ?? existing?.culturalWorldSlug,
      coverImageUrl: item.coverImageUrl ?? existing?.coverImageUrl,
      coverImage: item.coverImage ?? existing?.coverImage,
    };

    if (!existing && !cmsOnlySlugs.includes(item.slug)) {
      cmsOnlySlugs.push(item.slug);
    }

    bySlug.set(item.slug, merged);
  });

  return orderInsightItemsForLocale(
    [
      ...staticItems.map((item) => bySlug.get(item.slug) ?? item),
      ...cmsOnlySlugs.flatMap((slug) => {
        const item = bySlug.get(slug);
        return item ? [item] : [];
      }),
    ],
    locale
  );
}

function partitionInsights(items: NormalizedInsight[]) {
  const featuredSet = new Set<string>(FEATURED_INSIGHT_SLUGS);
  const culturalWorldSet = new Set<string>(CULTURAL_WORLD_INSIGHT_SLUGS);
  const editorialSet = new Set<string>(EDITORIAL_INSIGHT_SLUGS);

  const pickByOrder = (slugs: readonly string[]) =>
    slugs
      .map((slug) => items.find((item) => item.slug === slug))
      .filter((item): item is NormalizedInsight => Boolean(item));

  const featured = pickByOrder(FEATURED_INSIGHT_SLUGS);
  const culturalWorld = pickByOrder(CULTURAL_WORLD_INSIGHT_SLUGS);
  const editorial = pickByOrder(EDITORIAL_INSIGHT_SLUGS);
  const archive = items.filter(
    (item) =>
      !featuredSet.has(item.slug) &&
      !culturalWorldSet.has(item.slug) &&
      !editorialSet.has(item.slug)
  );

  return { featured, culturalWorld, editorial, archive };
}

function CompactInsightsList({
  items,
  locale,
  readLabel = 'Read →',
  showImages = false,
  showDestinationName = true,
}: {
  items: {
    slug: string;
    title: string;
    excerpt?: string;
    coverImageUrl?: string;
    destinationName?: string | null;
  }[];
  locale: SiteLocale;
  readLabel?: string;
  showImages?: boolean;
  showDestinationName?: boolean;
}) {
  if (!items.length) return null;
  return (
    <ol className="space-y-5 sm:space-y-6" aria-label="Insights articles">
      {items.map((insight, index) => (
        <li key={insight.slug}>
          <Link
            href={localizePathname(`/insights/${insight.slug}`, locale)}
            className="group block"
            aria-label={`Read: ${insight.title}`}
          >
            {showImages && insight.coverImageUrl && (
              <div className="relative w-full aspect-[16/10] mb-3 overflow-hidden">
                <AppImage
                  src={insight.coverImageUrl}
                  alt={insight.title}
                  fill
                  atmosphere="dark"
                  deliveryProfile="card"
                  className="motion-media-drift object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}
            {showDestinationName && insight.destinationName && (
              <p className="font-body text-xs tracking-[0.14em] uppercase text-white/26 mb-1.5">
                {insight.destinationName}
              </p>
            )}
            <h2 className="motion-link font-display text-lg sm:text-xl font-light text-white group-hover:text-white/70 mb-1.5 leading-snug">
              {insight.title}
            </h2>
            {insight.excerpt && (
              <p className="font-body text-sm text-white/48 leading-relaxed mb-2.5">
                {insight.excerpt}
              </p>
            )}
            <span className="motion-link font-body text-xs tracking-[0.12em] uppercase text-white/26 group-hover:text-white/60">
              {readLabel}
            </span>
          </Link>
          <div className="border-t border-white/4 mt-7 sm:mt-8" />
        </li>
      ))}
    </ol>
  );
}

function SectionHeading({ section, locale }: { section: InsightSectionKey; locale: SiteLocale }) {
  const config = SECTION_INTROS[section];
  const dictionary = getDictionary(locale);
  const localizedEyebrows: Record<InsightSectionKey, string> = {
    featured: dictionary.insights.featuredEssays,
    'cultural-world': dictionary.insights.culturalWorldEssays,
    editorial: dictionary.insights.editorialEssays,
    archive: dictionary.insights.furtherReading,
  };

  return (
    <div className="mb-10 max-w-2xl lg:mb-12">
      <p className="font-body text-[0.72rem] uppercase tracking-[0.18em] text-white/26 mb-3">
        {locale === DEFAULT_SITE_LOCALE ? config.eyebrow : localizedEyebrows[section]}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-light leading-snug text-white">
        {locale === DEFAULT_SITE_LOCALE ? config.title : localizedEyebrows[section]}
      </h2>
    </div>
  );
}

function groupCulturalWorldEssays(items: NormalizedInsight[], locale: SiteLocale) {
  const grouped = new Map<CulturalWorldGroupKey, NormalizedInsight[]>(
    CULTURAL_WORLD_GROUP_ORDER.map((key) => [key, []])
  );

  items.forEach((item) => {
    const key = item.culturalWorldSlug;
    if (!key || !grouped.has(key)) return;
    grouped.get(key)?.push(item);
  });

  return CULTURAL_WORLD_GROUP_ORDER.map((key) => ({
    key,
    label: getCulturalWorldLabel(key, locale),
    items: grouped.get(key) ?? [],
  })).filter((group) => group.items.length > 0);
}

function CulturalWorldEssayGroups({
  items,
  locale,
}: {
  items: NormalizedInsight[];
  locale: SiteLocale;
}) {
  const groups = groupCulturalWorldEssays(items, locale);
  if (!groups.length) return null;

  return (
    <div className="space-y-11 lg:space-y-14">
      {groups.map((group, index) => (
        <section
          key={group.key}
          aria-labelledby={`cultural-world-group-${group.key}`}
          className={index > 0 ? 'pt-1' : undefined}
        >
          <div className="mb-4 sm:mb-5">
            <p
              id={`cultural-world-group-${group.key}`}
              className="font-body text-[0.66rem] uppercase tracking-[0.24em] text-white/24"
            >
              {group.label}
            </p>
          </div>
          <CompactInsightsList
            items={group.items}
            locale={locale}
            readLabel={getDictionary(locale).common.read}
            showDestinationName={false}
          />
        </section>
      ))}
    </div>
  );
}

function FeaturedEssays({ items, locale }: { items: NormalizedInsight[]; locale: SiteLocale }) {
  if (!items.length) return null;

  const [lead, ...supporting] = items;
  const dictionary = getDictionary(locale);

  return (
    <section aria-labelledby="featured-essays" className="mb-20 lg:mb-24">
      <div className="mb-10 max-w-2xl lg:mb-12">
        <p className="font-body text-[0.72rem] uppercase tracking-[0.18em] text-white/26 mb-3">
          {dictionary.insights.featuredEssays}
        </p>
        <h2
          id="featured-essays"
          className="font-display text-3xl sm:text-4xl font-light leading-snug text-white"
        >
          {locale === DEFAULT_SITE_LOCALE
            ? 'The essays that speak most directly.'
            : dictionary.insights.featuredEssays}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.97fr)] gap-9 xl:gap-12">
        <Link
          href={localizePathname(`/insights/${lead.slug}`, locale)}
          className="group block border border-white/6 bg-white/[0.02] p-3"
          aria-label={`Read: ${lead.title}`}
        >
          {lead.coverImageUrl && (
            <div className="relative w-full aspect-[16/10] overflow-hidden mb-4">
              <AppImage
                src={lead.coverImageUrl}
                alt={lead.title}
                fill
                priority
                atmosphere="dark"
                deliveryProfile="card"
                className="motion-media-drift object-cover"
                sizes="(max-width: 1279px) 100vw, 60vw"
              />
            </div>
          )}
          {lead.destinationName && (
            <p className="font-body text-xs tracking-[0.16em] uppercase text-white/26 mb-2.5">
              {lead.destinationName}
            </p>
          )}
          <h3 className="font-display text-[1.65rem] sm:text-[1.8rem] font-light text-white leading-snug mb-3 group-hover:text-white/78 transition-colors duration-300">
            {lead.title}
          </h3>
          {lead.excerpt && (
            <p className="max-w-2xl font-body text-sm leading-relaxed text-white/54 mb-4">
              {lead.excerpt}
            </p>
          )}
          <span className="font-body text-xs tracking-[0.14em] uppercase text-white/34 group-hover:text-white/62 transition-colors duration-300">
            {dictionary.insights.readEssayWithArrow}
          </span>
        </Link>

        {supporting.length > 0 ? (
          <div className="border-t border-white/6 xl:border-t-0 xl:border-l xl:pl-7 xl:border-white/6 pt-7 xl:pt-1">
            <ol className="space-y-6" aria-label="Supporting featured essays">
              {supporting.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={localizePathname(`/insights/${item.slug}`, locale)}
                    className="group block"
                    aria-label={`Read: ${item.title}`}
                  >
                    {item.destinationName && (
                      <p className="font-body text-[0.68rem] tracking-[0.16em] uppercase text-white/24 mb-1.5">
                        {item.destinationName}
                      </p>
                    )}
                    <h3 className="font-display text-lg sm:text-xl font-light text-white leading-snug mb-1.5 group-hover:text-white/76 transition-colors duration-300">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="font-body text-sm leading-relaxed text-white/46 mb-2.5">
                        {item.excerpt}
                      </p>
                    )}
                    <span className="font-body text-[0.68rem] tracking-[0.14em] uppercase text-white/28 group-hover:text-white/58 transition-colors duration-300">
                      {dictionary.common.read} →
                    </span>
                  </Link>
                  <div className="border-t border-white/5 mt-6" />
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export async function renderInsightsPage(locale: SiteLocale = DEFAULT_SITE_LOCALE) {
  const dictionary = getDictionary(locale);
  const strapiInsights = await fetchStrapiInsights(locale);

  const staticInsights = buildStaticInsights(locale);
  const displayItems = mergeInsights(staticInsights, strapiInsights, locale);
  const sections = partitionInsights(displayItems);
  const schemaPath = localizePathname('/insights', locale);
  const schemaUrl = buildCanonicalUrl(schemaPath);
  const schemaTitle = locale === DEFAULT_SITE_LOCALE ? 'Insights' : dictionary.insights.title;
  const schemaDescription =
    locale === DEFAULT_SITE_LOCALE ? insightsDescription : dictionary.insights.subtitle;
  const insightsSchema = buildInsightListingGraph({
    pageId: `${schemaUrl}#collection`,
    itemListId: `${schemaUrl}#itemlist`,
    breadcrumbId: `${schemaUrl}#breadcrumbs`,
    path: schemaUrl,
    title: schemaTitle,
    description: schemaDescription,
    breadcrumbs: [
      {
        name: locale === DEFAULT_SITE_LOCALE ? 'Home' : dictionary.common.home,
        url: buildCanonicalUrl(localizePathname('/', locale)),
      },
      { name: schemaTitle, url: schemaUrl },
    ],
    items: displayItems.map((insight) => ({
      title: insight.title,
      slug: insight.slug,
      url: buildCanonicalUrl(localizePathname(`/insights/${insight.slug}`, locale)),
      description: insight.excerpt,
      image: insight.coverImage,
    })),
  });

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-24">
      <JsonLd id="insights-list-jsonld" schema={insightsSchema} />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16 max-w-3xl lg:mb-20">
          <p className="font-body text-xs tracking-[0.16em] uppercase text-white/32 mb-6">
            {dictionary.insights.title}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide text-white leading-[1.08] mb-6">
            {dictionary.insights.subtitle}
          </h1>
          {locale === DEFAULT_SITE_LOCALE ? (
            <p className="font-body text-sm sm:text-base leading-relaxed text-white/60 max-w-2xl">
              These are not travel guides. They are essays that build context before itinerary:
              written for depth over surface, relationship over transaction, and cultural worlds
              that reveal themselves through attention, trust, and time.
            </p>
          ) : null}
        </div>

        {/* Divider */}
        <div className="border-t border-white/6 mb-16 lg:mb-18" />

        <FeaturedEssays items={sections.featured} locale={locale} />

        {sections.culturalWorld.length > 0 && (
          <section aria-labelledby="cultural-world-essays" className="mb-20 lg:mb-24">
            <SectionHeading section="cultural-world" locale={locale} />
            <CulturalWorldEssayGroups items={sections.culturalWorld} locale={locale} />
          </section>
        )}

        {sections.editorial.length > 0 && (
          <section aria-labelledby="editorial-essays" className="mb-20 lg:mb-24">
            <SectionHeading section="editorial" locale={locale} />
            <CompactInsightsList
              items={sections.editorial}
              locale={locale}
              readLabel={dictionary.common.read}
            />
          </section>
        )}

        {sections.archive.length > 0 && (
          <section aria-labelledby="archive-essays">
            <SectionHeading section="archive" locale={locale} />
            <CompactInsightsList
              items={sections.archive}
              locale={locale}
              readLabel={dictionary.common.read}
            />
          </section>
        )}
      </div>
    </main>
  );
}

export default async function InsightsPage() {
  return renderInsightsPage(DEFAULT_SITE_LOCALE);
}
