import { notFound } from 'next/navigation';
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

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Strapi types ──────────────────────────────────────────────────────────────

interface StrapiRichTextNode {
  type: string;
  children?: StrapiRichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface StrapiDestination {
  id: number;
  slug?: string;
  name?: string;
  highlight?: string;
  short_description?: string;
  description?: StrapiRichTextNode[] | string;
  cover_image?: {
    url?: string;
    alternativeText?: string;
  } | null;
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

interface StrapiInsight {
  id: number;
  slug?: string;
  title?: string;
  excerpt?: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveImageUrl(url?: string | null): string {
  if (!url) return IMAGE_FALLBACK;
  return mediaUrl(url);
}

function flattenItem<T>(raw: Record<string, unknown>): T {
  // Support Strapi v4 (attributes) and v5 (flat)
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: raw.id, ...(raw.attributes as object) } as T;
  }
  return raw as T;
}

// ── Fetch functions ───────────────────────────────────────────────────────────

async function fetchDestination(slug: string): Promise<StrapiDestination | null> {
  if (!slug) return null;
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      populate: '*',
    });
    const json = await fetchStrapi(`/api/destinations?${params.toString()}`);
    const items: Record<string, unknown>[] = json?.data ?? [];
    if (!items.length) return null;
    return flattenItem<StrapiDestination>(items[0]);
  } catch (error) {
    console.error(`Failed to fetch destination detail for slug "${slug}".`, error);
    return null;
  }
}

async function fetchExperiencesForDestination(slug: string): Promise<StrapiExperience[]> {
  try {
    const json = await fetchStrapi('/api/experiences?populate=destination&pagination[limit]=20');
    const items: Record<string, unknown>[] = json?.data ?? [];
    const all = items.map((r) => flattenItem<StrapiExperience>(r));
    return all.filter(
      (e) =>
        e.destination?.slug === slug ||
        (e.destination?.name ?? '').toLowerCase() === slug.toLowerCase()
    );
  } catch (error) {
    console.error(`Failed to fetch destination experiences for slug "${slug}".`, error);
    return [];
  }
}

async function fetchInsightsForDestination(slug: string): Promise<StrapiInsight[]> {
  try {
    const json = await fetchStrapi('/api/insights?populate=destination&pagination[limit]=20');
    const items: Record<string, unknown>[] = json?.data ?? [];
    const all = items.map((r) => flattenItem<StrapiInsight>(r));
    return all.filter(
      (i) =>
        i.destination?.slug === slug ||
        (i.destination?.name ?? '').toLowerCase() === slug.toLowerCase()
    );
  } catch (error) {
    console.error(`Failed to fetch destination insights for slug "${slug}".`, error);
    return [];
  }
}

// ── Rich text renderer ────────────────────────────────────────────────────────

function renderRichText(nodes: StrapiRichTextNode[]): React.ReactNode {
  return nodes.map((node, i) => {
    if (node.type === 'paragraph') {
      return (
        <p key={i} className="font-body text-sm text-white/60 leading-loose mb-5">
          {node.children ? renderRichText(node.children) : null}
        </p>
      );
    }
    if (node.type === 'heading') {
      return (
        <h3 key={i} className="font-display font-light text-white text-xl mb-4 mt-8">
          {node.children ? renderRichText(node.children) : null}
        </h3>
      );
    }
    if (node.type === 'list') {
      return (
        <ul key={i} className="space-y-2 mb-5 pl-4">
          {node.children ? renderRichText(node.children) : null}
        </ul>
      );
    }
    if (node.type === 'list-item') {
      return (
        <li key={i} className="font-body text-sm text-white/60 leading-relaxed list-disc">
          {node.children ? renderRichText(node.children) : null}
        </li>
      );
    }
    if (node.type === 'text') {
      let content: React.ReactNode = node.text ?? '';
      if (node.bold)
        content = (
          <strong key={i} className="text-white/80">
            {content}
          </strong>
        );
      if (node.italic) content = <em key={i}>{content}</em>;
      if (node.underline) content = <u key={i}>{content}</u>;
      return content;
    }
    if (node.children) return renderRichText(node.children);
    return null;
  });
}

function renderDescriptionString(content: string): React.ReactNode {
  const paragraphs = content
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;
  return (
    <div className="space-y-5">
      {paragraphs.map((p, i) => (
        <p key={i} className="font-body text-sm text-white/60 leading-loose">
          {p}
        </p>
      ))}
    </div>
  );
}

// ── SEO ───────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await fetchDestination(slug);

  if (!destination) {
    return { title: `Not Found — ${SITE_NAME}` };
  }

  const title = destination.name
    ? `${destination.name} — ${SITE_NAME}`
    : `Destination — ${SITE_NAME}`;
  const description = destination.short_description || destination.highlight || '';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(`/cultural-worlds/${slug}`),
    },
    openGraph: buildOpenGraph({
      title,
      description,
      path: `/cultural-worlds/${slug}`,
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) notFound();

  const [destination, experiences, insightsList] = await Promise.all([
    fetchDestination(slug),
    fetchExperiencesForDestination(slug),
    fetchInsightsForDestination(slug),
  ]);

  if (!destination || !destination.slug) notFound();

  const coverImageUrl = resolveImageUrl(destination.cover_image?.url);
  const coverImageAlt =
    destination.cover_image?.alternativeText || destination.name || 'Destination cover';

  const hasDescription =
    destination.description &&
    (typeof destination.description === 'string'
      ? destination.description.trim().length > 0
      : destination.description.length > 0);

  const hasExperiences = experiences.length > 0;
  const hasInsights = insightsList.length > 0;

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      {/* ── HERO ── */}
      <div className="relative w-full h-[70vh] min-h-[480px] max-h-[700px] overflow-hidden">
        <Image
          src={coverImageUrl}
          alt={coverImageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          unoptimized={coverImageUrl.startsWith('http://localhost')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 pb-16">
            {destination.name && (
              <h1
                className="font-display font-light text-white leading-tight mb-4"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
              >
                {destination.name}
              </h1>
            )}
            {destination.highlight && (
              <p className="font-body text-sm sm:text-base text-white/60 leading-relaxed max-w-xl">
                {destination.highlight}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10">
        {/* Breadcrumb */}
        <nav className="mt-12 mb-12" aria-label="Breadcrumb">
          <Link
            href="/cultural-worlds"
            className="font-body text-xs tracking-[0.18em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300"
          >
            ← Destinations
          </Link>
        </nav>

        {/* ── INTRO ── */}
        {destination.short_description && (
          <section className="mb-14">
            <p className="font-body text-base sm:text-lg leading-loose text-white/80">
              {destination.short_description}
            </p>
          </section>
        )}

        {/* ── BODY (rich text description) ── */}
        {hasDescription && (
          <>
            <div className="border-t border-white/10 mb-12" />
            <section className="mb-16">
              {typeof destination.description === 'string'
                ? renderDescriptionString(destination.description)
                : renderRichText(destination.description as StrapiRichTextNode[])}
            </section>
          </>
        )}

        {/* ── EXPERIENCES SECTION ── */}
        {hasExperiences && (
          <>
            <div className="border-t border-white/10 mb-12" />
            <section className="mb-16">
              <p className="font-body text-xs tracking-[0.22em] uppercase text-white/30 mb-8">
                Experiences
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {experiences.map((exp) => {
                  const expCover = resolveImageUrl(exp.cover_image?.url);
                  const expAlt = exp.cover_image?.alternativeText || exp.title || 'Experience';
                  const expSlug = exp.slug;
                  if (!expSlug) return null;
                  return (
                    <Link
                      key={exp.id}
                      href={`/experiences/${expSlug}`}
                      className="group block"
                      aria-label={`View experience: ${exp.title}`}
                    >
                      {/* Image */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden mb-4">
                        <Image
                          src={expCover}
                          alt={expAlt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 50vw"
                          unoptimized={expCover.startsWith('http://localhost')}
                        />
                        {exp.category && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="font-body text-[0.55rem] tracking-[0.28em] text-white uppercase bg-black/60 backdrop-blur-sm px-3 py-1.5">
                              {exp.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      {(exp.location_label || exp.duration) && (
                        <div className="flex items-center gap-3 mb-2">
                          {exp.location_label && (
                            <span className="font-body text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">
                              {exp.location_label}
                            </span>
                          )}
                          {exp.location_label && exp.duration && (
                            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                          )}
                          {exp.duration && (
                            <span className="font-body text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">
                              {exp.duration}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      {exp.title && (
                        <h3
                          className="font-display font-light text-white leading-snug mb-2 group-hover:text-white/70 transition-colors duration-300"
                          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                        >
                          {exp.title}
                        </h3>
                      )}

                      {/* Excerpt */}
                      {exp.short_description && (
                        <p className="font-body text-sm text-white/50 leading-relaxed line-clamp-2 mb-3">
                          {exp.short_description}
                        </p>
                      )}

                      <span className="font-body text-[0.6rem] tracking-[0.28em] text-white/40 uppercase group-hover:text-white/70 transition-colors duration-300">
                        EXPLORE →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* ── INSIGHTS SECTION ── */}
        {hasInsights && (
          <>
            <div className="border-t border-white/10 mb-12" />
            <section className="mb-16">
              <p className="font-body text-xs tracking-[0.22em] uppercase text-white/30 mb-8">
                Insights
              </p>
              <ol className="space-y-10" aria-label="Related insights">
                {insightsList.map((insight) => {
                  const insCover = resolveImageUrl(insight.cover_image?.url);
                  const insAlt = insight.cover_image?.alternativeText || insight.title || 'Insight';
                  const insSlug = insight.slug;
                  if (!insSlug) return null;
                  return (
                    <li key={insight.id}>
                      <Link
                        href={`/insights/${insSlug}`}
                        className="group block"
                        aria-label={`Read: ${insight.title}`}
                      >
                        <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden">
                          <Image
                            src={insCover}
                            alt={insAlt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 672px"
                            unoptimized={insCover.startsWith('http://localhost')}
                          />
                        </div>
                        {destination.name && (
                          <p className="font-body text-xs tracking-[0.18em] uppercase text-white/30 mb-2">
                            {destination.name}
                          </p>
                        )}
                        {insight.title && (
                          <h2 className="font-display text-lg sm:text-xl font-light text-white group-hover:text-white/70 transition-colors duration-300 mb-2 leading-snug">
                            {insight.title}
                          </h2>
                        )}
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
                  );
                })}
              </ol>
            </section>
          </>
        )}

        {/* ── FOOTER CTA ── */}
        <div className="border-t border-white/10 pt-10">
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
    </main>
  );
}
