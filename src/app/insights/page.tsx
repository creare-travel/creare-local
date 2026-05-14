import Link from 'next/link';
import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import { insights } from '@/data/insights';
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
    const normalized = items.map(normalizeInsight).filter(Boolean) as NormalizedInsight[];
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

function InsightsList({
  items,
}: {
  items: {
    slug: string;
    title: string;
    excerpt?: string;
    coverImageUrl?: string;
    destinationName?: string | null;
  }[];
}) {
  if (!items.length) return null;
  return (
    <ol className="space-y-10" aria-label="Insights articles">
      {items.map((insight, index) => (
        <li key={insight.slug}>
          <Link
            href={`/insights/${insight.slug}`}
            className="group block"
            aria-label={`Read: ${insight.title}`}
          >
            {insight.coverImageUrl && (
              <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden">
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
            {insight.destinationName && (
              <p className="font-body text-xs tracking-[0.14em] uppercase text-white/26 mb-2">
                {insight.destinationName}
              </p>
            )}
            <h2 className="motion-link font-display text-lg sm:text-xl font-light text-white group-hover:text-white/70 mb-2 leading-snug">
              {insight.title}
            </h2>
            {insight.excerpt && (
              <p className="font-body text-sm text-white/50 leading-relaxed mb-3">
                {insight.excerpt}
              </p>
            )}
            <span className="motion-link font-body text-xs tracking-[0.12em] uppercase text-white/26 group-hover:text-white/60">
              Read →
            </span>
          </Link>
          <div className="border-t border-white/4 mt-12" />
        </li>
      ))}
    </ol>
  );
}

export default async function InsightsPage() {
  const strapiInsights = await fetchStrapiInsights();

  // Determine which data source to use
  // 1. Strapi data (if available)
  // 2. Static fallback data
  // 3. Render nothing if both empty
  const staticFallback = insights.map((insight) => ({
    slug: insight.slug,
    title: insight.title,
    excerpt: insight.description,
    coverImageUrl: undefined,
    coverImage: undefined,
    destinationName: insight.location
      ? insight.location.charAt(0).toUpperCase() + insight.location.slice(1)
      : null,
  }));

  const displayItems = strapiInsights ?? (staticFallback.length ? staticFallback : null);
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
    items:
      displayItems?.map((insight) => ({
        title: insight.title,
        slug: insight.slug,
        url: buildCanonicalUrl(`/insights/${insight.slug}`),
        description: insight.excerpt,
        image: insight.coverImage,
      })) ?? [],
  });

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-24">
      <JsonLd id="insights-list-jsonld" schema={insightsSchema} />
      <div className="max-w-2xl mx-auto px-6 sm:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.16em] uppercase text-white/32 mb-6">
            Insights
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-wide text-white leading-snug mb-6">
            On Culture, Access, and the Art of the Private Encounter
          </h1>
          <p className="font-body text-sm leading-relaxed text-white/60 max-w-lg">
            These are not travel guides. They are arguments — for depth over surface, for
            relationship over transaction, for the kind of access that cannot be listed or
            purchased.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/6 mb-14" />

        {/* Article list */}
        {displayItems ? <InsightsList items={displayItems} /> : null}
      </div>
    </main>
  );
}
