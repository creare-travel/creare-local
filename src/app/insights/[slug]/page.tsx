import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  canonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '@/lib/seo';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';
import { getInsightBySlug } from '@/data/insights';
import { getExperienceBySlug } from '@/lib/experiences';

interface Props {
  params: Promise<{ slug: string }>;
}

interface StrapiInsight {
  id: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: unknown;
  seo_title?: string;
  seo_description?: string;
  cover_image?: {
    url?: string;
    alternativeText?: string;
  } | null;
  destination?: {
    name?: string;
    slug?: string;
  } | null;
  experiences?: StrapiExperience[];
}

interface ResolvedInsight extends StrapiInsight {
  source: 'strapi' | 'static';
}

interface StrapiExperience {
  id: number;
  slug?: string;
  title?: string;
  short_description?: string;
  category?: string;
  duration?: string;
  location_label?: string;
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

const IMAGE_FALLBACK = '/assets/images/no_image.png';
const LEGACY_ISTANBUL_INSIGHT_SLUG = 'the-private-life-of-istanbul';
const CANONICAL_ISTANBUL_INSIGHT_SLUG = 'private-life-of-istanbul';
const canonicalInsightSlug = (slug: string | undefined): string | undefined =>
  slug === LEGACY_ISTANBUL_INSIGHT_SLUG ? CANONICAL_ISTANBUL_INSIGHT_SLUG : slug;

async function fetchInsight(slug: string): Promise<StrapiInsight | null> {
  if (!slug) return null;
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      populate: '*',
    });
    const path = `/api/insights?${params.toString()}`;
    const json = await fetchStrapi(path);
    const items = json?.data;
    if (!items || items.length === 0) return null;
    const raw = items[0];
    return raw?.attributes ? { id: raw.id, ...raw.attributes } : raw;
  } catch (error) {
    console.error('Failed to fetch insight detail from Strapi.', {
      route: `/insights/${slug}`,
      strapiPath: `/api/insights?filters[slug][$eq]=${slug}&populate=*`,
      error,
    });
    return null;
  }
}

function buildStaticInsight(slug: string): ResolvedInsight | null {
  const insight = getInsightBySlug(slug);
  if (!insight) return null;

  const relatedExperiences = insight.relatedExperiences
    .map((experienceSlug, index) => {
      const experience = getExperienceBySlug(experienceSlug);
      if (!experience) return null;

      return {
        id: index + 1,
        slug: experience.slug,
        title: experience.title,
        short_description: experience.intro,
        category: experience.category,
        duration: experience.duration,
        location_label: experience.location,
      } satisfies StrapiExperience;
    })
    .filter(Boolean) as StrapiExperience[];

  return {
    id: 0,
    source: 'static',
    slug: insight.slug,
    title: insight.title,
    excerpt: insight.description,
    content: insight.content,
    experiences: relatedExperiences,
    destination: insight.location
      ? {
          slug: insight.culturalWorldSlug,
          name: insight.location.charAt(0).toUpperCase() + insight.location.slice(1),
        }
      : null,
  };
}

async function resolveInsight(slug: string): Promise<ResolvedInsight | null> {
  const strapiInsight = await fetchInsight(slug);
  if (strapiInsight?.slug && strapiInsight.title) {
    return { ...strapiInsight, source: 'strapi' };
  }

  return buildStaticInsight(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = canonicalInsightSlug(slug) ?? slug;
  const insight = await resolveInsight(canonicalSlug);

  if (!insight) {
    return { title: `Not Found — ${SITE_NAME}` };
  }

  // SEO fallbacks: seo_title || title, seo_description || excerpt
  const title =
    insight.seo_title || insight.title
      ? `${insight.seo_title || insight.title} — ${SITE_NAME}`
      : `Not Found — ${SITE_NAME}`;
  const description = insight.seo_description || insight.excerpt || '';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(`/insights/${canonicalSlug}`),
    },
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
  priority = false,
}: {
  experience: StrapiExperience;
  priority?: boolean;
}) {
  const imageUrl = resolveImageUrl(experience.cover_image?.url);
  const imageAlt = experience.cover_image?.alternativeText || experience.title || 'Experience';
  const location = experience.destination?.name || experience.location_label || '';
  const href = experience.slug ? `/experiences/${experience.slug}` : '#';

  return (
    <Link href={href} className="group block" aria-label={`View ${experience.title}`}>
      {/* Image */}
      <div className="relative w-full overflow-hidden aspect-[4/3] mb-4">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {experience.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="font-body text-[0.55rem] tracking-[0.28em] text-white uppercase bg-black/60 backdrop-blur-sm px-3 py-1.5">
              {experience.category}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      {(location || experience.duration) && (
        <div className="flex items-center gap-3 mb-2">
          {location && (
            <span className="font-body text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">
              {location}
            </span>
          )}
          {location && experience.duration && (
            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
          )}
          {experience.duration && (
            <span className="font-body text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">
              {experience.duration}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      {experience.title && (
        <h3
          className="font-display font-light text-white leading-snug mb-2 group-hover:opacity-70 transition-opacity duration-300"
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

      <span className="font-body text-[0.6rem] tracking-[0.28em] text-white/60 uppercase group-hover:opacity-50 transition-opacity duration-300">
        EXPLORE →
      </span>
    </Link>
  );
}

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params;

  // Slug safety: ensure slug is defined before rendering
  if (!slug) {
    notFound();
  }

  if (slug === LEGACY_ISTANBUL_INSIGHT_SLUG) {
    permanentRedirect(`/insights/${CANONICAL_ISTANBUL_INSIGHT_SLUG}`);
  }

  const insight = await resolveInsight(canonicalInsightSlug(slug) ?? slug);

  if (!insight || !insight.slug) {
    notFound();
  }

  // Image: fallback to no_image.png if cover_image is missing
  const coverImageUrl = resolveImageUrl(insight.cover_image?.url);
  const coverImageAlt = insight.cover_image?.alternativeText || insight.title || 'Insight cover';

  // Destination: safe optional chaining
  const destinationName = insight.destination?.name || '';

  // Use experiences from insight relation directly
  const relatedExperiences: StrapiExperience[] = Array.isArray(insight.experiences)
    ? insight.experiences
    : [];

  const contentNode = renderRichText(insight.content);

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      {/* Hero cover image — always shown (fallback image if missing) */}
      <div className="relative w-full h-[60vh] min-h-[360px] max-h-[600px] overflow-hidden">
        <Image src={coverImageUrl} alt={coverImageAlt} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black" />
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-10 pt-12">
        {/* Breadcrumb */}
        <nav className="mb-12" aria-label="Breadcrumb">
          <Link
            href="/insights"
            className="font-body text-xs tracking-[0.18em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300"
          >
            ← Insights
          </Link>
        </nav>

        {/* Article header */}
        <header className="mb-12">
          {/* Destination: hide gracefully if missing */}
          {destinationName && (
            <p className="font-body text-xs tracking-[0.22em] uppercase text-white/30 mb-4">
              {destinationName}
            </p>
          )}
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
            <div className="border-t border-white/10 mb-12" />
            {contentNode}
          </>
        ) : null}

        {/* CTA */}
        <div className="mt-16 border-t border-white/10 pt-10">
          <p className="font-body text-xs text-white/30 leading-relaxed mb-4">
            Access is not listed. It is composed.
          </p>
          <Link
            href="/contact"
            className="font-body text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-300"
            aria-label="Inquire privately about a CREARE experience"
          >
            Inquire Privately →
          </Link>
        </div>
      </div>

      {/* Related Experiences — only rendered if experiences exist */}
      {relatedExperiences.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-24">
          <div className="border-t border-white/10 pt-16">
            <p className="font-body text-xs tracking-[0.22em] uppercase text-white/30 mb-10">
              Related Experiences
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {relatedExperiences.map((exp, index) => (
                <RelatedExperienceCard key={exp.id} experience={exp} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
