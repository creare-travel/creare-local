import Link from 'next/link';
import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import { insights } from '@/data/insights';
import { filterPublicInsights } from '@/lib/canonical-gates';
import {
  buildMetadataAlternates,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '@/lib/seo';
import { buildCanonicalUrl, buildInsightListingGraph } from '@/lib/schema-builder';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const canonicalInsightSlug = (slug: string | undefined): string | undefined =>
  slug === 'the-private-life-of-istanbul' ? 'private-life-of-istanbul' : slug;

const insightsTitle = `Insights — ${SITE_NAME}`;
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

const IMAGE_FALLBACK = '/assets/images/creare-image-placeholder.jpg';

interface StrapiInsight {
  id: number;
  attributes?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    cover_image?: {
      data?: {
        attributes?: {
          url?: string;
          alternativeText?: string;
        };
      };
    };
    destination?: {
      data?: {
        attributes?: {
          name?: string;
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
  cover_image?:
    | {
        url?: string;
        alternativeText?: string;
      }
    | {
        url?: string;
        alternativeText?: string;
      }[]
    | null;
  destination?: {
    name?: string;
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
}

type InsightSectionKey = 'featured' | 'cultural-world' | 'editorial' | 'archive';
type CulturalWorldGroupKey = 'bodrum' | 'cappadocia' | 'istanbul';

const FEATURED_ESSAY_SLUGS = [
  'private-experiences-istanbul-what-access-really-means',
  'private-life-of-istanbul',
  'cappadocia-without-balloons-a-different-kind-of-silence',
  'bodrum-beyond-the-coast-where-the-aegean-slows-down',
] as const;

const CULTURAL_WORLD_ESSAY_SLUGS = [
  'private-experiences-bodrum-beyond-the-marina',
  'cappadocia-at-first-light',
  'cappadocia-without-tours-moving-outside-the-routes',
  'bodrum-without-beach-clubs-a-different-rhythm',
  'istanbul-without-the-crowds-where-the-city-still-breathes',
  'private-experiences-cappadocia-silence-space-access',
] as const;

const EDITORIAL_ESSAY_SLUGS = [
  'what-makes-an-experience-truly-private',
  'what-exclusive-travel-actually-means',
  'why-most-luxury-travel-is-actually-mass-tourism',
  'the-aegean-as-a-cultural-argument',
] as const;

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

const CULTURAL_WORLD_GROUP_LABELS: Record<CulturalWorldGroupKey, string> = {
  bodrum: 'Bodrum',
  cappadocia: 'Cappadocia',
  istanbul: 'Istanbul',
};

function resolveFirstInsightCoverImage(item: StrapiInsight): {
  url?: string;
  alternativeText?: string;
} | null {
  const attributeImage = item.attributes?.cover_image;

  if (Array.isArray(attributeImage?.data)) {
    const first = attributeImage.data[0];
    const attrs = first?.attributes;
    if (attrs?.url) {
      return {
        url: attrs.url,
        alternativeText: attrs.alternativeText,
      };
    }
  }

  if (attributeImage?.data?.attributes?.url) {
    return {
      url: attributeImage.data.attributes.url,
      alternativeText: attributeImage.data.attributes.alternativeText,
    };
  }

  if (Array.isArray(item.cover_image)) {
    const first = item.cover_image[0];
    if (first?.url) {
      return {
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
      url: item.cover_image.url,
      alternativeText: item.cover_image.alternativeText,
    };
  }

  return null;
}

function normalizeInsight(item: StrapiInsight): NormalizedInsight | null {
  // Support both Strapi v4 (attributes) and v5 (flat)
  const attrs = item.attributes ?? item;
  const slug = canonicalInsightSlug(attrs?.slug);
  const title = attrs?.title;
  if (!slug || !title) return null;

  const excerpt = attrs?.excerpt ?? '';

  // cover_image — fallback to owned placeholder if missing
  const coverImage = resolveFirstInsightCoverImage(item);
  const coverImageUrl = coverImage?.url ? mediaUrl(coverImage.url) : IMAGE_FALLBACK;

  // destination.name — safe optional chaining
  const destinationName =
    item.attributes?.destination?.data?.attributes?.name || item.destination?.name || null;

  return {
    slug,
    title,
    excerpt,
    coverImageUrl,
    coverImage: coverImage
      ? {
          url: coverImage.url,
          alternativeText: coverImage.alternativeText || title,
        }
      : undefined,
    destinationName,
  };
}

async function fetchStrapiInsights(): Promise<NormalizedInsight[] | null> {
  const path = '/api/insights?populate=*';
  try {
    const json = await fetchStrapi(path);
    const items: StrapiInsight[] = json?.data ?? [];
    if (!items.length) return null;
    const normalized = filterPublicInsights(items)
      .map(normalizeInsight)
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

function buildStaticInsights(): NormalizedInsight[] {
  return insights.map((insight) => ({
    slug: insight.slug,
    title: insight.title,
    excerpt: insight.description,
    coverImageUrl: undefined,
    coverImage: undefined,
    destinationName: insight.location
      ? insight.location.charAt(0).toUpperCase() + insight.location.slice(1)
      : null,
  }));
}

function mergeInsights(
  staticItems: NormalizedInsight[],
  strapiItems: NormalizedInsight[] | null
): NormalizedInsight[] {
  const bySlug = new Map(staticItems.map((item) => [item.slug, item]));

  strapiItems?.forEach((item) => {
    const existing = bySlug.get(item.slug);
    bySlug.set(item.slug, {
      ...(existing ?? item),
      ...item,
      excerpt: item.excerpt || existing?.excerpt || '',
      destinationName: item.destinationName ?? existing?.destinationName ?? null,
      coverImageUrl: item.coverImageUrl ?? existing?.coverImageUrl,
      coverImage: item.coverImage ?? existing?.coverImage,
    });
  });

  return staticItems.map((item) => bySlug.get(item.slug) ?? item);
}

function partitionInsights(items: NormalizedInsight[]) {
  const featuredSet = new Set<string>(FEATURED_ESSAY_SLUGS);
  const culturalWorldSet = new Set<string>(CULTURAL_WORLD_ESSAY_SLUGS);
  const editorialSet = new Set<string>(EDITORIAL_ESSAY_SLUGS);

  const pickByOrder = (slugs: readonly string[]) =>
    slugs
      .map((slug) => items.find((item) => item.slug === slug))
      .filter((item): item is NormalizedInsight => Boolean(item));

  const featured = pickByOrder(FEATURED_ESSAY_SLUGS);
  const culturalWorld = pickByOrder(CULTURAL_WORLD_ESSAY_SLUGS);
  const editorial = pickByOrder(EDITORIAL_ESSAY_SLUGS);
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
  showImages?: boolean;
  showDestinationName?: boolean;
}) {
  if (!items.length) return null;
  return (
    <ol className="space-y-5 sm:space-y-6" aria-label="Insights articles">
      {items.map((insight, index) => (
        <li key={insight.slug}>
          <Link
            href={`/insights/${insight.slug}`}
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
              Read →
            </span>
          </Link>
          <div className="border-t border-white/4 mt-7 sm:mt-8" />
        </li>
      ))}
    </ol>
  );
}

function SectionHeading({ section }: { section: InsightSectionKey }) {
  const config = SECTION_INTROS[section];

  return (
    <div className="mb-10 max-w-2xl lg:mb-12">
      <p className="font-body text-[0.72rem] uppercase tracking-[0.18em] text-white/26 mb-3">
        {config.eyebrow}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-light leading-snug text-white">
        {config.title}
      </h2>
    </div>
  );
}

function groupCulturalWorldEssays(items: NormalizedInsight[]) {
  const grouped = new Map<CulturalWorldGroupKey, NormalizedInsight[]>(
    CULTURAL_WORLD_GROUP_ORDER.map((key) => [key, []])
  );

  items.forEach((item) => {
    const key = item.destinationName?.toLowerCase() as CulturalWorldGroupKey | undefined;
    if (!key || !grouped.has(key)) return;
    grouped.get(key)?.push(item);
  });

  return CULTURAL_WORLD_GROUP_ORDER.map((key) => ({
    key,
    label: CULTURAL_WORLD_GROUP_LABELS[key],
    items: grouped.get(key) ?? [],
  })).filter((group) => group.items.length > 0);
}

function CulturalWorldEssayGroups({ items }: { items: NormalizedInsight[] }) {
  const groups = groupCulturalWorldEssays(items);
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
          <CompactInsightsList items={group.items} showDestinationName={false} />
        </section>
      ))}
    </div>
  );
}

function FeaturedEssays({ items }: { items: NormalizedInsight[] }) {
  if (!items.length) return null;

  const [lead, ...supporting] = items;

  return (
    <section aria-labelledby="featured-essays" className="mb-20 lg:mb-24">
      <div className="mb-10 max-w-2xl lg:mb-12">
        <p className="font-body text-[0.72rem] uppercase tracking-[0.18em] text-white/26 mb-3">
          Featured Essays
        </p>
        <h2
          id="featured-essays"
          className="font-display text-3xl sm:text-4xl font-light leading-snug text-white"
        >
          The essays that speak most directly.
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.97fr)] gap-9 xl:gap-12">
        <Link
          href={`/insights/${lead.slug}`}
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
            Read Essay →
          </span>
        </Link>

        {supporting.length > 0 ? (
          <div className="border-t border-white/6 xl:border-t-0 xl:border-l xl:pl-7 xl:border-white/6 pt-7 xl:pt-1">
            <ol className="space-y-6" aria-label="Supporting featured essays">
              {supporting.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/insights/${item.slug}`}
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
                      Read →
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

export default async function InsightsPage() {
  const strapiInsights = await fetchStrapiInsights();

  const staticInsights = buildStaticInsights();
  const displayItems = mergeInsights(staticInsights, strapiInsights);
  const sections = partitionInsights(displayItems);
  const insightsSchema = buildInsightListingGraph({
    pageId: `${buildCanonicalUrl('/insights')}#collection`,
    itemListId: `${buildCanonicalUrl('/insights')}#itemlist`,
    breadcrumbId: `${buildCanonicalUrl('/insights')}#breadcrumbs`,
    path: buildCanonicalUrl('/insights'),
    title: 'Insights',
    description: insightsDescription,
    breadcrumbs: [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Insights', url: buildCanonicalUrl('/insights') },
    ],
    items: displayItems.map((insight) => ({
      title: insight.title,
      slug: insight.slug,
      url: buildCanonicalUrl(`/insights/${insight.slug}`),
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
            Insights
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide text-white leading-[1.08] mb-6">
            Essays on culture, access, and the private encounter
          </h1>
          <p className="font-body text-sm sm:text-base leading-relaxed text-white/60 max-w-2xl">
            These are not travel guides. They are essays that build context before itinerary:
            written for depth over surface, relationship over transaction, and cultural worlds that
            reveal themselves through attention, trust, and time.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/6 mb-16 lg:mb-18" />

        <FeaturedEssays items={sections.featured} />

        {sections.culturalWorld.length > 0 && (
          <section aria-labelledby="cultural-world-essays" className="mb-20 lg:mb-24">
            <SectionHeading section="cultural-world" />
            <CulturalWorldEssayGroups items={sections.culturalWorld} />
          </section>
        )}

        {sections.editorial.length > 0 && (
          <section aria-labelledby="editorial-essays" className="mb-20 lg:mb-24">
            <SectionHeading section="editorial" />
            <CompactInsightsList items={sections.editorial} />
          </section>
        )}

        {sections.archive.length > 0 && (
          <section aria-labelledby="archive-essays">
            <SectionHeading section="archive" />
            <CompactInsightsList items={sections.archive} />
          </section>
        )}
      </div>
    </main>
  );
}
