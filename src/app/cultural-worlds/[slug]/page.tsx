import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

const SITE_URL = 'https://crearetravel.com';
const FALLBACK_DESCRIPTION =
  'A cultural world composed through editorial destination content, related experiences, and further reading.';
const IMAGE_FALLBACK = '/assets/images/no_image.png';
const canonicalInsightSlug = (slug?: string) =>
  slug === 'the-private-life-of-istanbul' ? 'private-life-of-istanbul' : slug;

interface Props {
  params: Promise<{ slug: string }>;
}

interface StrapiRichTextNode {
  type: string;
  children?: StrapiRichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
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

interface StrapiSection {
  id?: number;
  section_number?: number;
  title?: string;
  body?: StrapiRichTextNode[] | string;
}

interface StrapiExperience {
  id: number;
  slug?: string;
  title?: string;
  short_description?: string;
  category?: string;
  order_index?: number;
}

interface StrapiInsight {
  id: number;
  slug?: string;
  title?: string;
}

interface StrapiDestination {
  id: number;
  slug?: string;
  name?: string;
  visibility_status?: string;
  highlight?: string;
  intro_text?: string;
  meta_title?: string;
  meta_description?: string;
  cover_image?: StrapiImage | null;
  sections?: StrapiSection[] | { data?: Record<string, unknown>[] };
  experiences?: StrapiExperience[] | { data?: Record<string, unknown>[] };
  insights?: StrapiInsight[] | { data?: Record<string, unknown>[] };
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

function resolveImageUrl(image?: StrapiImage | null): string {
  const rawUrl =
    image?.formats?.large?.url ??
    image?.formats?.medium?.url ??
    image?.formats?.small?.url ??
    image?.url;

  return rawUrl ? mediaUrl(rawUrl) : IMAGE_FALLBACK;
}

function renderRichText(nodes: StrapiRichTextNode[]): React.ReactNode {
  return nodes.map((node, index) => {
    if (node.type === 'paragraph') {
      return (
        <p key={index} className="font-body text-sm text-white/65 leading-loose">
          {node.children ? renderRichText(node.children) : null}
        </p>
      );
    }

    if (node.type === 'heading') {
      return (
        <h3 key={index} className="font-display font-light text-white text-xl mb-4 mt-8">
          {node.children ? renderRichText(node.children) : null}
        </h3>
      );
    }

    if (node.type === 'list') {
      return (
        <ul key={index} className="space-y-2 pl-5">
          {node.children ? renderRichText(node.children) : null}
        </ul>
      );
    }

    if (node.type === 'list-item') {
      return (
        <li key={index} className="font-body text-sm text-white/65 leading-relaxed list-disc">
          {node.children ? renderRichText(node.children) : null}
        </li>
      );
    }

    if (node.type === 'text') {
      let content: React.ReactNode = node.text ?? '';
      if (node.bold)
        content = (
          <strong key={index} className="text-white/85">
            {content}
          </strong>
        );
      if (node.italic) content = <em key={index}>{content}</em>;
      if (node.underline) content = <u key={index}>{content}</u>;
      return content;
    }

    if (node.children) return renderRichText(node.children);
    return null;
  });
}

function renderBodyContent(content?: StrapiRichTextNode[] | string) {
  if (!content) return null;

  if (typeof content === 'string') {
    const paragraphs = content
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return (
      <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  if (Array.isArray(content) && content.length > 0) {
    return (
      <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
        {renderRichText(content)}
      </div>
    );
  }

  return null;
}

async function fetchDestination(slug: string): Promise<StrapiDestination | null> {
  if (!slug) return null;

  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: '*',
  });
  const path = `/api/destinations?${params.toString()}`;

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
    if (!items.length) return null;

    const destination = flattenItem<StrapiDestination>(items[0]);

    return {
      ...destination,
      sections: normalizeRelationArray<StrapiSection>(destination.sections),
      experiences: normalizeRelationArray<StrapiExperience>(destination.experiences),
      insights: normalizeRelationArray<StrapiInsight>(destination.insights),
    };
  } catch (error) {
    console.error('Failed to fetch cultural world detail.', {
      route: `/cultural-worlds/${slug}`,
      strapiPath: path,
      error,
    });
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await fetchDestination(slug);

  if (!destination || destination.visibility_status?.toLowerCase() !== 'active') {
    return {
      title: 'Not Found — Cultural World — Creare',
      description: FALLBACK_DESCRIPTION,
      robots: { index: false, follow: false },
    };
  }

  return {
    title:
      destination.meta_title || `${destination.name || 'Destination'} — Cultural World — Creare`,
    description: destination.meta_description || destination.highlight || FALLBACK_DESCRIPTION,
    alternates: {
      canonical: `${SITE_URL}/cultural-worlds/${slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CulturalWorldPage({ params }: Props) {
  const { slug } = await params;
  const destination = await fetchDestination(slug);

  if (!destination || destination.visibility_status?.toLowerCase() !== 'active') {
    notFound();
  }

  const sections = normalizeRelationArray<StrapiSection>(destination.sections)
    .filter((section) => section.title || section.body)
    .sort((a, b) => (a.section_number ?? Infinity) - (b.section_number ?? Infinity));

  const experiences = normalizeRelationArray<StrapiExperience>(destination.experiences)
    .filter((experience) => experience.slug && experience.title)
    .sort((a, b) => (a.order_index ?? Infinity) - (b.order_index ?? Infinity));

  const visibleExperiences = experiences.slice(0, 3);
  const hiddenExperiences = experiences.slice(3);

  const insights = normalizeRelationArray<StrapiInsight>(destination.insights).filter(
    (insight) => insight.slug && insight.title
  );

  const coverImageUrl = resolveImageUrl(destination.cover_image);
  const coverImageAlt =
    destination.cover_image?.alternativeText || destination.name || 'Cultural world cover image';

  return (
    <main className="bg-black min-h-screen">
      <section className="relative w-full h-[90vh] min-h-[620px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={coverImageUrl}
            alt={coverImageAlt}
            fill
            priority
            className="object-cover hero-img-zoom"
            sizes="100vw"
            unoptimized={isLocalAssetUrl(coverImageUrl)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-24 w-full">
          <p className="hero-label text-white/50 font-body text-[0.6rem] tracking-[0.35em] uppercase mb-6">
            Cultural Worlds
          </p>
          <h1
            className="hero-title-lg font-display font-light text-white leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(4rem, 9vw, 9rem)' }}
          >
            {destination.name || 'Destination'}
          </h1>
          {destination.highlight && (
            <p className="hero-subtitle text-white/60 font-body font-light text-base mt-6 max-w-sm leading-relaxed tracking-wide">
              {destination.highlight}
            </p>
          )}
        </div>
      </section>

      <section
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-20"
        aria-labelledby="the-experience"
      >
        <div className="max-w-2xl">
          <p className="text-white/25 font-body text-[0.6rem] tracking-[0.35em] uppercase mb-8">
            The Experience
          </p>
          <h2
            id="the-experience"
            className="font-display font-light text-white leading-tight mb-14"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
          >
            {destination.highlight ||
              'A place revealed through depth, access, and cultural memory.'}
          </h2>
          {destination.intro_text && (
            <div
              className="space-y-10 text-white/60 font-body font-light text-base"
              style={{ lineHeight: '2' }}
            >
              {destination.intro_text
                .split('\n\n')
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}
        </div>
      </section>

      <nav className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="text-white/30 font-body text-xs tracking-[0.15em] uppercase hover:text-white/60 transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <span className="text-white/20 font-body text-xs mx-1">→</span>
          </li>
          <li>
            <Link
              href="/cultural-worlds"
              className="text-white/30 font-body text-xs tracking-[0.15em] uppercase hover:text-white/60 transition-colors"
            >
              Cultural Worlds
            </Link>
          </li>
          <li aria-hidden="true">
            <span className="text-white/20 font-body text-xs mx-1">→</span>
          </li>
          <li>
            <span className="text-white/60 font-body text-xs tracking-[0.15em] uppercase">
              {destination.name || 'Destination'}
            </span>
          </li>
        </ol>
      </nav>

      {sections.map((section, index) => {
        const body = renderBodyContent(section.body);
        if (!body) return null;

        return (
          <React.Fragment key={section.id ?? `${section.section_number ?? 'section'}-${index}`}>
            <section
              className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
              aria-labelledby={`section-${index}`}
            >
              <div className="max-w-3xl">
                <p className="text-white/30 font-body text-xs tracking-[0.25em] uppercase mb-5">
                  {String(section.section_number ?? index + 1).padStart(2, '0')}
                </p>
                {section.title && (
                  <h2
                    id={`section-${index}`}
                    className="font-display font-light text-white leading-tight mb-8"
                    style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
                  >
                    {section.title}
                  </h2>
                )}
                {body}
              </div>
            </section>
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="w-full h-px bg-white/8" />
            </div>
          </React.Fragment>
        );
      })}

      {visibleExperiences.length > 0 && (
        <>
          <section
            className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
            aria-labelledby="destination-experiences"
          >
            <div className="max-w-3xl">
              <h2
                id="destination-experiences"
                className="font-display font-light text-white leading-tight mb-8"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
              >
                Experiences in {destination.name || 'this destination'}
              </h2>
              <div className="space-y-12">
                {visibleExperiences.map((experience) => (
                  <div key={experience.id} className="border-t border-white/8 pt-10">
                    <p className="font-display font-light text-white text-lg leading-snug mb-2">
                      {experience.title}
                    </p>
                    {experience.short_description && (
                      <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                        {experience.short_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      {experience.category && (
                        <span className="text-white/25 font-body text-xs tracking-[0.18em] uppercase">
                          {experience.category}
                        </span>
                      )}
                      <Link
                        href={`/experiences/${experience.slug}`}
                        className="text-white/35 font-body text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
                      >
                        → View Experience
                      </Link>
                    </div>
                  </div>
                ))}

                {hiddenExperiences.length > 0 && (
                  <details className="border-t border-white/8 pt-8">
                    <summary className="list-none cursor-pointer text-white/35 font-body text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors">
                      Show more
                    </summary>
                    <div className="space-y-12 pt-8">
                      {hiddenExperiences.map((experience) => (
                        <div key={experience.id} className="border-t border-white/8 pt-10">
                          <p className="font-display font-light text-white text-lg leading-snug mb-2">
                            {experience.title}
                          </p>
                          {experience.short_description && (
                            <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                              {experience.short_description}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            {experience.category && (
                              <span className="text-white/25 font-body text-xs tracking-[0.18em] uppercase">
                                {experience.category}
                              </span>
                            )}
                            <Link
                              href={`/experiences/${experience.slug}`}
                              className="text-white/35 font-body text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
                            >
                              → View Experience
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </section>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="w-full h-px bg-white/8" />
          </div>
        </>
      )}

      {insights.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-0"
          aria-label="Further reading"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-[0.6rem] tracking-[0.22em] uppercase mb-2">
              Further reading
            </p>
            <div className="space-y-4">
              {insights.map((insight) => (
                <Link
                  key={insight.id}
                  href={`/insights/${canonicalInsightSlug(insight.slug)}`}
                  className="block font-body text-sm text-white/55 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/20"
                >
                  {insight.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 pb-36"
        aria-label="Private inquiry"
      >
        <div className="border border-white/10 p-12 md:p-16 max-w-2xl">
          <p className="text-white/30 font-body text-[0.6rem] tracking-[0.25em] uppercase mb-6">
            By introduction only
          </p>
          <p
            className="font-display font-light text-white/80 leading-relaxed mb-2"
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
          >
            Access is limited.
          </p>
          <p
            className="font-display font-light text-white/50 leading-relaxed mb-3"
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
          >
            Each cultural world is composed through a small number of encounters each season.
          </p>
          <p className="text-white/30 font-body font-light text-sm leading-relaxed mb-10">
            Availability is shaped by access, timing, and cultural permission.
          </p>
          <Link
            href="/contact"
            className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white/70 uppercase border border-white/20 px-8 py-4 hover:border-white/50 hover:text-white transition-all duration-300"
            aria-label={`Begin a private conversation about ${destination.name || 'this destination'}`}
          >
            Begin a Private Conversation →
          </Link>
        </div>
      </section>
    </main>
  );
}
