import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { insights } from '@/data/insights';
import {
  canonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '@/lib/seo';
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
  alternates: {
    canonical: canonicalUrl('/insights'),
  },
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

const IMAGE_FALLBACK = '/assets/images/no_image.png';

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
  cover_image?: {
    url?: string;
  } | null;
  destination?: {
    name?: string;
  } | null;
}

interface NormalizedInsight {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  destinationName: string | null;
}

function normalizeInsight(item: StrapiInsight): NormalizedInsight | null {
  // Support both Strapi v4 (attributes) and v5 (flat)
  const attrs = item.attributes ?? item;
  const slug = canonicalInsightSlug(attrs?.slug);
  const title = attrs?.title;
  if (!slug || !title) return null;

  const excerpt = attrs?.excerpt ?? '';

  // cover_image — fallback to no_image.png if missing
  let coverImageUrl: string = IMAGE_FALLBACK;
  if (item.attributes?.cover_image?.data?.attributes?.url) {
    const raw = item.attributes.cover_image.data.attributes.url;
    coverImageUrl = mediaUrl(raw);
  } else if (item.cover_image && typeof item.cover_image === 'object') {
    const ci = item.cover_image as { url?: string };
    if (ci?.url) {
      coverImageUrl = mediaUrl(ci.url);
    }
  }

  // destination.name — safe optional chaining
  const destinationName =
    item.attributes?.destination?.data?.attributes?.name || item.destination?.name || null;

  return { slug, title, excerpt, coverImageUrl, destinationName };
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
                <Image
                  src={insight.coverImageUrl}
                  alt={insight.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}
            {insight.destinationName && (
              <p className="font-body text-xs tracking-[0.18em] uppercase text-white/30 mb-2">
                {insight.destinationName}
              </p>
            )}
            <h2 className="font-display text-lg sm:text-xl font-light text-white group-hover:text-white/70 transition-colors duration-300 mb-2 leading-snug">
              {insight.title}
            </h2>
            {insight.excerpt && (
              <p className="font-body text-sm text-white/50 leading-relaxed mb-3">
                {insight.excerpt}
              </p>
            )}
            <span className="font-body text-xs tracking-[0.15em] uppercase text-white/30 group-hover:text-white/60 transition-colors duration-300">
              Read →
            </span>
          </Link>
          <div className="border-t border-white/5 mt-10" />
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
    destinationName: insight.location
      ? insight.location.charAt(0).toUpperCase() + insight.location.slice(1)
      : null,
  }));

  const displayItems = strapiInsights ?? (staticFallback.length ? staticFallback : null);

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-6 sm:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.22em] uppercase text-white/40 mb-6">
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
        <div className="border-t border-white/10 mb-12" />

        {/* Article list */}
        {displayItems ? <InsightsList items={displayItems} /> : null}
      </div>
    </main>
  );
}
