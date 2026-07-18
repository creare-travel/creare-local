import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { cache } from 'react';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import {
  buildLocaleOwnedMetadata,
  buildMetadataAlternates,
  canonicalUrl,
  buildOpenGraph,
  buildRouteCanonicalAlternates,
  buildTwitterCard,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '@/lib/seo';
import { buildCanonicalUrl, buildInsightDetailGraph } from '@/lib/schema-builder';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';
import { filterPublicExperiences, isPublicInsightRecord } from '@/lib/canonical-gates';
import { getInsightBySlug, isCanonicalCulturalWorldSlug, type Insight } from '@/data/insights';
import { buildCinematicBlurDataUrl } from '@/lib/lqip';
import { canUseEnglishFallback } from '@/lib/i18n/data-layer';
import { DEFAULT_SITE_LOCALE, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocalizedRouteTarget, localizePathname } from '@/lib/i18n/pathname';

interface Props {
  params: Promise<{ slug: string }>;
}

interface StrapiInsight {
  id: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: unknown;
  visibility_status?: string | null;
  publishedAt?: string | null;
  seo_title?: string;
  seo_description?: string;
  cover_image?: StrapiImage | null;
  destination?: {
    name?: string;
    slug?: string;
  } | null;
  experiences?: StrapiExperience[];
}

interface StrapiImage {
  url?: string;
  alternativeText?: string;
  formats?: {
    large?: { url?: string };
    medium?: { url?: string };
    small?: { url?: string };
  };
}

interface ResolvedInsight extends StrapiInsight {
  source: 'strapi' | 'static';
  relatedEssays?: string[];
}

interface StrapiExperience {
  id: number;
  slug?: string;
  title?: string;
  short_description?: string;
  category?: string;
  duration?: string;
  location_label?: string;
  visibility_status?: string | null;
  publishedAt?: string | null;
  cover_image?: {
    url?: string;
    alternativeText?: string;
  } | null;
  destination?: {
    id?: number;
    slug?: string;
    name?: string;
  } | null;
}

function flattenItem<T>(raw: Record<string, unknown>): T {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: raw.id, ...(raw.attributes as object) } as T;
  }

  return raw as T;
}

function normalizeRelationArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === 'object' ? flattenItem<T>(item as Record<string, unknown>) : item
    ) as T[];
  }

  if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown[] }).data)) {
    return ((value as { data: unknown[] }).data ?? []).map((item) =>
      item && typeof item === 'object' ? flattenItem<T>(item as Record<string, unknown>) : item
    ) as T[];
  }

  return [];
}

function normalizeSingleRelation<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object') return null;

  if ('data' in (value as Record<string, unknown>)) {
    const data = (value as { data?: unknown }).data;
    if (!data || Array.isArray(data) || typeof data !== 'object') return null;
    return flattenItem<T>(data as Record<string, unknown>);
  }

  return flattenItem<T>(value as Record<string, unknown>);
}

function normalizeMediaItem<T>(value: unknown): T | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'object'
      ? flattenItem<T>(first as Record<string, unknown>)
      : null;
  }

  if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown[] }).data)) {
    const first = (value as { data?: unknown[] }).data?.[0];
    return first && typeof first === 'object'
      ? flattenItem<T>(first as Record<string, unknown>)
      : null;
  }

  return normalizeSingleRelation<T>(value);
}

const IMAGE_FALLBACK = '/assets/images/creare-image-placeholder.jpg';

function stripBrandSuffix(title?: string | null): string | undefined {
  return title?.replace(/\s+—\s+Creare$/i, '').trim() || undefined;
}

function buildInsightNotFoundMetadata(locale: SiteLocale): Metadata {
  if (locale === DEFAULT_SITE_LOCALE) {
    return { title: 'Not Found' };
  }

  return {
    title: { absolute: '404' },
    robots: { index: false, follow: false },
  };
}

function getInsightMetadataImageUrl(insight: Pick<ResolvedInsight, 'cover_image'>): string {
  const rawUrl =
    insight.cover_image?.formats?.large?.url ??
    insight.cover_image?.formats?.medium?.url ??
    insight.cover_image?.formats?.small?.url ??
    insight.cover_image?.url;

  return rawUrl ? resolveImageUrl(rawUrl) : DEFAULT_OG_IMAGE;
}

export type InsightDetailMetadataItem = Pick<
  ResolvedInsight,
  'title' | 'excerpt' | 'seo_title' | 'seo_description' | 'cover_image'
>;

export function buildLocalizedInsightDetailMetadata({
  locale,
  slug,
  insight,
}: {
  locale: SiteLocale;
  slug: string;
  insight: InsightDetailMetadataItem;
}): Metadata {
  const title = stripBrandSuffix(insight.seo_title || insight.title) || 'Not Found';
  const description = insight.seo_description || insight.excerpt || '';
  const imageUrl = getInsightMetadataImageUrl(insight);

  return buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: {
      family: 'insight-detail',
      locale,
      slug,
    },
    title: insight.seo_title || insight.title,
    description,
    image: imageUrl,
    imageAlt: insight.cover_image?.alternativeText ?? title,
    type: 'article',
    titleMode: insight.seo_title ? 'absolute' : 'templated',
  });
}
const MAX_RELATED_ESSAYS = 4;
const LEGACY_ISTANBUL_INSIGHT_SLUG = 'the-private-life-of-istanbul';
const CANONICAL_ISTANBUL_INSIGHT_SLUG = 'private-life-of-istanbul';
const canonicalInsightSlug = (slug: string | undefined): string | undefined =>
  slug === LEGACY_ISTANBUL_INSIGHT_SLUG ? CANONICAL_ISTANBUL_INSIGHT_SLUG : slug;

async function fetchInsight(slug: string, locale: SiteLocale): Promise<StrapiInsight | null> {
  if (!slug) return null;
  const params = new URLSearchParams();
  params.set('filters[slug][$eq]', slug);
  params.set('populate[cover_image]', 'true');
  params.set('populate[experiences][populate][cover_image]', 'true');
  params.set('populate[experiences][populate][destination]', 'true');
  const path = `/api/insights?${params.toString()}`;

  try {
    const json = await fetchStrapi(path, { locale });
    const items = json?.data;
    if (!items || items.length === 0) return null;
    const raw = items[0];
    const insight = raw?.attributes ? { id: raw.id, ...raw.attributes } : raw;
    if (!isPublicInsightRecord(insight)) return null;

    return {
      ...insight,
      cover_image: normalizeMediaItem<StrapiImage>(insight.cover_image),
      destination: normalizeSingleRelation<NonNullable<StrapiInsight['destination']>>(
        insight.destination
      ),
      experiences: normalizeRelationArray<StrapiExperience>(insight.experiences).map(
        (experience) => ({
          ...experience,
          cover_image: normalizeSingleRelation<NonNullable<StrapiExperience['cover_image']>>(
            experience.cover_image
          ),
          destination: normalizeSingleRelation<NonNullable<StrapiExperience['destination']>>(
            experience.destination
          ),
        })
      ),
    };
  } catch (error) {
    console.error('Failed to fetch insight detail from Strapi.', {
      route: `/insights/${slug}`,
      strapiPath: path,
      error,
    });
    return null;
  }
}

async function fetchExperiencesBySlugs(
  slugs: string[],
  locale: SiteLocale
): Promise<StrapiExperience[]> {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  if (uniqueSlugs.length === 0) return [];

  const params = new URLSearchParams();
  uniqueSlugs.forEach((slug, index) => params.set(`filters[slug][$in][${index}]`, slug));
  params.set('filters[visibility_status][$eqi]', 'active');
  params.set('fields[0]', 'slug');
  params.set('fields[1]', 'title');
  params.set('fields[2]', 'short_description');
  params.set('fields[3]', 'category');
  params.set('fields[4]', 'duration');
  params.set('fields[5]', 'location_label');
  params.set('fields[6]', 'visibility_status');
  params.set('fields[7]', 'publishedAt');
  params.set('populate[cover_image]', 'true');
  params.set('populate[destination]', 'true');
  params.set('pagination[pageSize]', String(uniqueSlugs.length));

  try {
    const json = await fetchStrapi(`/api/experiences?${params.toString()}`, { locale });
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
    const entries: [string, StrapiExperience][] = filterPublicExperiences(
      items.map((item) => flattenItem<StrapiExperience>(item))
    )
      .map((experience) => {
        const normalizedExperience: StrapiExperience = {
          ...experience,
          cover_image: normalizeSingleRelation<NonNullable<StrapiExperience['cover_image']>>(
            experience.cover_image
          ),
          destination: normalizeSingleRelation<NonNullable<StrapiExperience['destination']>>(
            experience.destination
          ),
        };

        return experience.slug
          ? ([experience.slug, normalizedExperience] as [string, StrapiExperience])
          : null;
      })
      .filter((entry): entry is [string, StrapiExperience] => Boolean(entry));
    const bySlug = new Map(entries);

    return uniqueSlugs
      .map((slug) => bySlug.get(slug))
      .filter((experience): experience is StrapiExperience => Boolean(experience));
  } catch (error) {
    console.error('Failed to fetch fallback related experiences from Strapi.', {
      route: '/insights/[slug]',
      slugs: uniqueSlugs,
      error,
    });
    return [];
  }
}

function buildStaticInsight(slug: string, locale: SiteLocale): ResolvedInsight | null {
  if (!canUseEnglishFallback(locale)) return null;

  const insight = getInsightBySlug(slug, locale);
  if (!insight) return null;

  const staticDestination =
    insight.location &&
    insight.culturalWorldSlug &&
    isCanonicalCulturalWorldSlug(insight.culturalWorldSlug)
      ? {
          slug: insight.culturalWorldSlug,
          name: insight.location.charAt(0).toUpperCase() + insight.location.slice(1),
        }
      : null;

  return {
    id: 0,
    source: 'static',
    slug: insight.slug,
    title: insight.title,
    excerpt: insight.description,
    content: insight.content,
    relatedEssays: insight.relatedEssays,
    experiences: [],
    destination: staticDestination,
  };
}

const resolveInsight = cache(async function resolveInsight(
  slug: string,
  locale: SiteLocale
): Promise<ResolvedInsight | null> {
  const strapiInsight = await fetchInsight(slug, locale);
  const staticInsight = buildStaticInsight(slug, locale);

  const normalizedStrapiDestination =
    strapiInsight?.destination?.slug && isCanonicalCulturalWorldSlug(strapiInsight.destination.slug)
      ? strapiInsight.destination
      : null;

  if (strapiInsight) {
    const strapiExperiences = normalizeRelationArray<StrapiExperience>(
      strapiInsight.experiences
    ).map((experience) => ({
      ...experience,
      cover_image: normalizeSingleRelation<NonNullable<StrapiExperience['cover_image']>>(
        experience.cover_image
      ),
      destination: normalizeSingleRelation<NonNullable<StrapiExperience['destination']>>(
        experience.destination
      ),
    }));

    return {
      ...staticInsight,
      ...strapiInsight,
      title: strapiInsight.title || staticInsight?.title,
      slug: strapiInsight.slug || staticInsight?.slug,
      excerpt: strapiInsight.excerpt || staticInsight?.excerpt,
      content: strapiInsight.content || staticInsight?.content,
      destination: normalizedStrapiDestination || staticInsight?.destination || null,
      experiences:
        strapiExperiences.length > 0 ? strapiExperiences : (staticInsight?.experiences ?? []),
      source: 'strapi',
    };
  }

  if (staticInsight) {
    const staticExperiences = await fetchExperiencesBySlugs(
      getInsightBySlug(slug, locale)?.relatedExperiences ?? [],
      locale
    );

    return {
      ...staticInsight,
      experiences: staticExperiences,
    };
  }

  return staticInsight;
});

interface RelatedEssayReference {
  slug: string;
  title: string;
  excerpt: string;
  location: Insight['location'];
}

function buildRelatedEssayReferences(
  relatedEssaySlugs: string[] | undefined,
  currentSlug: string,
  locale: SiteLocale
): RelatedEssayReference[] {
  if (!canUseEnglishFallback(locale)) return [];
  if (!relatedEssaySlugs?.length) return [];

  const seen = new Set<string>();

  return relatedEssaySlugs
    .map((slug) => getInsightBySlug(slug, locale))
    .filter((essay): essay is Insight => Boolean(essay))
    .filter((essay) => essay.slug !== currentSlug)
    .filter((essay) => {
      if (seen.has(essay.slug)) return false;
      seen.add(essay.slug);
      return true;
    })
    .slice(0, MAX_RELATED_ESSAYS)
    .map((essay) => ({
      slug: essay.slug,
      title: essay.title,
      excerpt: essay.description,
      location: essay.location,
    }));
}

export async function generateInsightDetailMetadata({
  locale = DEFAULT_SITE_LOCALE,
  params,
}: Props & { locale?: SiteLocale }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = canonicalInsightSlug(slug) ?? slug;
  const insight = await resolveInsight(canonicalSlug, locale);

  if (!insight) {
    return buildInsightNotFoundMetadata(locale);
  }

  // SEO fallbacks: seo_title || title, seo_description || excerpt
  const title = stripBrandSuffix(insight.seo_title || insight.title) || 'Not Found';
  const description = insight.seo_description || insight.excerpt || '';
  const alternates =
    locale === DEFAULT_SITE_LOCALE
      ? buildMetadataAlternates(`/insights/${canonicalSlug}`)
      : buildRouteCanonicalAlternates({
          family: 'insight-detail',
          locale,
          slug: canonicalSlug,
        });

  if (locale !== DEFAULT_SITE_LOCALE) {
    return buildLocalizedInsightDetailMetadata({
      locale,
      slug: canonicalSlug,
      insight,
    });
  }

  return {
    title,
    description,
    alternates,
    openGraph: buildOpenGraph({
      title,
      description,
      path: `/insights/${canonicalSlug}`,
      type: 'article',
    }),
    twitter: buildTwitterCard({
      title,
      description,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_OG_IMAGE_ALT,
    }),
  };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return generateInsightDetailMetadata(props);
}

function resolveImageUrl(url?: string | null): string {
  if (!url) return IMAGE_FALLBACK;
  return mediaUrl(url);
}

function extractTextFromNode(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return node.trim();

  if (Array.isArray(node)) {
    return node
      .map((item) => extractTextFromNode(item))
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  if (typeof node === 'object') {
    const record = node as {
      text?: unknown;
      value?: unknown;
      content?: unknown;
      body?: unknown;
      children?: unknown;
    };

    const direct = [record.text, record.value, record.content, record.body]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .find(Boolean);

    if (direct) return direct;

    return extractTextFromNode(record.children);
  }

  return '';
}

function renderRichText(content: unknown): React.ReactNode {
  if (!content) return null;

  let paragraphs: string[] = [];

  if (typeof content === 'string') {
    // Split on double newlines for paragraph boundaries; avoid random splits
    paragraphs = content
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);
  } else if (Array.isArray(content)) {
    paragraphs = content
      .map((block) => extractTextFromNode(block))
      .map((text) => text.trim())
      .filter(Boolean);
  } else if (typeof content === 'object') {
    const text = extractTextFromNode(content).trim();
    paragraphs = text ? [text] : [];
  }

  if (paragraphs.length === 0) return null;

  // First paragraph as intro, remaining as body
  const [intro, ...body] = paragraphs;

  return (
    <>
      <div className="mb-10">
        <p className="font-body text-base leading-loose text-white/80">{intro}</p>
      </div>
      {body.length > 0 && (
        <article className="space-y-7">
          {body.map((paragraph, index) => (
            <p key={index} className="font-body text-sm leading-loose text-white/60">
              {paragraph}
            </p>
          ))}
        </article>
      )}
    </>
  );
}

function RelatedExperienceCard({
  experience,
  locale,
  priority = false,
}: {
  experience: StrapiExperience;
  locale: SiteLocale;
  priority?: boolean;
}) {
  const dictionary = getDictionary(locale);
  const imageUrl = resolveImageUrl(experience.cover_image?.url);
  const imageAlt = experience.cover_image?.alternativeText || experience.title || 'Experience';
  const location = experience.destination?.name || experience.location_label || '';
  const href = experience.slug ? localizePathname(`/experiences/${experience.slug}`, locale) : null;

  const card = (
    <>
      {/* Image */}
      <div className="relative w-full overflow-hidden aspect-[4/3] mb-4">
        <AppImage
          src={imageUrl}
          alt={imageAlt}
          fill
          priority={priority}
          atmosphere="dark"
          deliveryProfile="card"
          className="motion-media-drift object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {experience.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="font-body text-[0.55rem] tracking-[0.22em] text-white uppercase bg-black/55 backdrop-blur-sm px-3 py-1.5">
              {experience.category}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      {(location || experience.duration) && (
        <div className="flex items-center gap-3 mb-2">
          {location && (
            <span className="font-body text-[0.6rem] tracking-[0.16em] text-white/32 uppercase">
              {location}
            </span>
          )}
          {location && experience.duration && (
            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
          )}
          {experience.duration && (
            <span className="font-body text-[0.6rem] tracking-[0.16em] text-white/32 uppercase">
              {experience.duration}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      {experience.title && (
        <h3
          className="motion-copy-fade font-display font-light text-white leading-snug mb-2"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
        >
          {experience.title}
        </h3>
      )}

      {/* Excerpt */}
      {experience.short_description && (
        <p className="font-body text-xs text-white/50 leading-relaxed line-clamp-2 mb-3">
          {experience.short_description}
        </p>
      )}

      <span className="motion-copy-fade font-body text-[0.6rem] tracking-[0.2em] text-white/52 uppercase">
        {locale === DEFAULT_SITE_LOCALE ? 'EXPLORE →' : `${dictionary.common.enter} →`}
      </span>
    </>
  );

  return href ? (
    <Link
      href={href}
      className="group block"
      aria-label={`${dictionary.culturalWorlds.viewExperience} ${experience.title}`}
    >
      {card}
    </Link>
  ) : (
    <div className="group block" aria-label={experience.title}>
      {card}
    </div>
  );
}

function RelatedEssayList({
  essays,
  locale,
}: {
  essays: RelatedEssayReference[];
  locale: SiteLocale;
}) {
  if (!essays.length) return null;
  const dictionary = getDictionary(locale);

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 mt-20" aria-label="Related essays">
      <div className="border-t border-white/6 pt-12">
        <p className="font-body text-xs tracking-[0.16em] uppercase text-white/24 mb-8">
          {dictionary.common.relatedEssays}
        </p>
        <div className="space-y-6">
          {essays.map((essay) => (
            <Link
              key={essay.slug}
              href={localizePathname(`/insights/${essay.slug}`, locale)}
              className="group block border-b border-white/6 pb-6 last:border-b-0 last:pb-0"
              aria-label={`Read related essay: ${essay.title}`}
            >
              <p className="font-body text-[0.58rem] tracking-[0.18em] text-white/24 uppercase mb-2">
                {essay.location.charAt(0).toUpperCase() + essay.location.slice(1)}
              </p>
              <h2 className="motion-copy-fade font-display text-xl sm:text-2xl font-light text-white leading-snug mb-2 group-hover:text-white/74 transition-colors duration-300">
                {essay.title}
              </h2>
              <p className="font-body text-sm text-white/48 leading-relaxed mb-2.5">
                {essay.excerpt}
              </p>
              <span className="motion-link font-body text-[0.68rem] tracking-[0.14em] uppercase text-white/28 group-hover:text-white/58 transition-colors duration-300">
                {dictionary.common.read} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function renderInsightDetailPage(slug: string, locale: SiteLocale) {
  const dictionary = getDictionary(locale);
  // Slug safety: ensure slug is defined before rendering
  if (!slug) {
    notFound();
  }

  if (slug === LEGACY_ISTANBUL_INSIGHT_SLUG) {
    permanentRedirect(
      buildLocalizedRouteTarget('/insights', CANONICAL_ISTANBUL_INSIGHT_SLUG, locale)
    );
  }

  const insight = await resolveInsight(canonicalInsightSlug(slug) ?? slug, locale);

  if (!insight || !insight.slug) {
    notFound();
  }

  // Image: fallback to owned placeholder if cover_image is missing
  const coverImageUrl = resolveImageUrl(insight.cover_image?.url);
  const coverImageAlt = insight.cover_image?.alternativeText || insight.title || 'Insight cover';
  const coverBlurDataUrl = buildCinematicBlurDataUrl(coverImageUrl, {
    atmosphere: 'dark',
    profile: 'hero',
  });

  // Destination: safe optional chaining
  const destinationName = insight.destination?.name || '';

  // Use experiences from insight relation directly
  const relatedExperiences: StrapiExperience[] = Array.isArray(insight.experiences)
    ? insight.experiences
    : [];
  const relatedEssays = buildRelatedEssayReferences(insight.relatedEssays, insight.slug, locale);

  const contentNode = renderRichText(insight.content);
  const insightSchema = buildInsightDetailGraph({
    pageId: `${canonicalUrl(`/insights/${insight.slug}`)}#webpage`,
    articleId: `${canonicalUrl(`/insights/${insight.slug}`)}#article`,
    imageId: `${canonicalUrl(`/insights/${insight.slug}`)}#image`,
    breadcrumbId: `${canonicalUrl(`/insights/${insight.slug}`)}#breadcrumbs`,
    path: canonicalUrl(`/insights/${insight.slug}`),
    breadcrumbs: [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Insights', url: buildCanonicalUrl('/insights') },
      {
        name: insight.title,
        url: canonicalUrl(`/insights/${insight.slug}`),
        slugFallback: insight.slug,
      },
    ],
    title: insight.title,
    slug: insight.slug,
    description: insight.seo_description || insight.excerpt || '',
    excerpt: insight.excerpt,
    image: insight.cover_image ?? undefined,
    destinationName,
    destinationSlug: insight.destination?.slug,
    relatedEssays: relatedEssays.map((essay) => ({
      title: essay.title,
      url: canonicalUrl(`/insights/${essay.slug}`),
      description: essay.excerpt,
    })),
    relatedExperiences: relatedExperiences
      .filter((experience) => experience.slug && experience.title)
      .map((experience) => ({
        title: experience.title,
        slug: experience.slug,
        url: canonicalUrl(`/experiences/${experience.slug}`),
        description: experience.short_description,
      })),
  });

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      {locale === DEFAULT_SITE_LOCALE && (
        <JsonLd id="insight-detail-jsonld" schema={insightSchema} />
      )}
      {/* Hero cover image — always shown (fallback image if missing) */}
      <div className="relative w-full h-[60vh] min-h-[360px] max-h-[600px] overflow-hidden">
        <AppImage
          src={coverImageUrl}
          alt={coverImageAlt}
          fill
          priority
          blurDataURL={coverBlurDataUrl}
          atmosphere="dark"
          deliveryProfile="hero"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black" />
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-10 pt-12">
        {/* Breadcrumb */}
        <nav className="mb-12" aria-label="Breadcrumb">
          <Link
            href={localizePathname('/insights', locale)}
            className="font-body text-xs tracking-[0.14em] uppercase text-white/28 hover:text-white/60 transition-colors duration-300"
          >
            {dictionary.insights.backToInsights}
          </Link>
        </nav>

        {/* Article header */}
        <header className="mb-12">
          {/* Destination: hide gracefully if missing */}
          {destinationName &&
            (insight.destination?.slug ? (
              <Link
                href={localizePathname(`/cultural-worlds/${insight.destination.slug}`, locale)}
                className="mb-4 inline-block font-body text-xs uppercase tracking-[0.16em] text-white/26 transition-colors duration-300 hover:text-white/54"
              >
                {destinationName}
              </Link>
            ) : (
              <p className="font-body text-xs tracking-[0.16em] uppercase text-white/26 mb-4">
                {destinationName}
              </p>
            ))}
          {insight.title && (
            <h1 className="font-display text-3xl sm:text-4xl font-light tracking-wide text-white leading-snug mb-6">
              {insight.title}
            </h1>
          )}
          {/* Excerpt: hide gracefully if missing */}
          {insight.excerpt && (
            <p className="font-body text-base leading-relaxed text-white/60">{insight.excerpt}</p>
          )}
        </header>

        {/* Content: only render if present */}
        {contentNode ? (
          <>
            <div className="border-t border-white/6 mb-14" />
            {contentNode}
          </>
        ) : null}
      </div>

      <RelatedEssayList essays={relatedEssays} locale={locale} />

      {/* Related Experiences — only rendered if experiences exist */}
      {relatedExperiences.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-24">
          <div className="border-t border-white/6 pt-18">
            <p className="font-body text-xs tracking-[0.16em] uppercase text-white/24 mb-10">
              {dictionary.common.relatedExperiences}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {relatedExperiences.map((exp, index) => (
                <RelatedExperienceCard
                  key={exp.id}
                  experience={exp}
                  locale={locale}
                  priority={index === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 sm:px-10 mt-20">
        <div className="border-t border-white/6 pt-10">
          <p className="font-body text-xs text-white/30 leading-relaxed mb-4">
            {dictionary.insights.accessNotListed}
          </p>
          <Link
            href="/contact"
            className="font-body text-xs tracking-[0.14em] uppercase text-white/52 hover:text-white transition-colors duration-300"
            aria-label="Inquire privately about a CREARE experience"
          >
            {dictionary.common.contactCreareUpper}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params;
  return renderInsightDetailPage(slug, DEFAULT_SITE_LOCALE);
}
