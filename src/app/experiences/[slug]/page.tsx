import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { experiences } from '@/lib/experiences';
import ExperienceViewTracker from '@/components/experiences/ExperienceViewTracker';
import GallerySection from '@/components/experiences/GallerySection';
import InquireCTA from '@/components/experiences/InquireCTA';
import { buildTwitterCard, SITE_NAME } from '@/lib/seo';
import { fetchStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

const SITE_URL = 'https://crearetravel.com';

// ── Strapi types ──────────────────────────────────────────────────────────────
interface StrapiRichTextNode {
  type: string;
  children?: StrapiRichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

interface StrapiCoverImage {
  url: string;
  alternativeText?: string;
  formats?: {
    large?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    small?: StrapiImageFormat;
  };
}

interface StrapiGalleryImage {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

interface StrapiDestination {
  name?: string;
  slug?: string;
}

interface StrapiExperienceDetail {
  id: number;
  documentId?: string;
  title: string;
  short_description?: string;
  description?: StrapiRichTextNode[] | string;
  intent_level?: string;
  slug?: string;
  cover_image?: StrapiCoverImage;
  gallery?: StrapiGalleryImage[];
  seo_title?: string;
  seo_description?: string;
  // New fields
  category?: string;
  tier?: string;
  location_label?: string;
  destination?: StrapiDestination;
  duration?: string;
  max_guests?: string | number;
  group_size?: string;
  program?: StrapiRichTextNode[] | string;
  audience?: StrapiRichTextNode[] | string;
  cta_enabled?: boolean;
  cta_text?: string;
  geo_experience_type?: string;
  mood?: string;
  audience_segment?: string;
  intensity?: string;
}

type StrapiExperienceResult =
  | { status: 'ok'; item: StrapiExperienceDetail }
  | { status: 'not_found' }
  | { status: 'error'; error: Error };

async function fetchStrapiExperienceBySlug(slug: string): Promise<StrapiExperienceResult> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      populate: '*',
    });

    const json = await fetchStrapi(`/api/experiences?${params.toString()}`);
    const items: StrapiExperienceDetail[] = Array.isArray(json?.data) ? json.data : [];
    const item = items[0];
    if (!item) {
      return { status: 'not_found' };
    }
    return { status: 'ok', item };
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error('Unknown Strapi experience fetch failure');
    console.error(`Failed to fetch experience detail for slug "${slug}".`, normalizedError);
    return { status: 'error', error: normalizedError };
  }
}

function extractTextFromNodes(nodes: StrapiRichTextNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.text ?? '';
      return extractTextFromNodes(node.children ?? []);
    })
    .join('');
}

function extractParagraphs(field: StrapiRichTextNode[] | string | undefined): string[] {
  if (!field) return [];

  if (typeof field === 'string') {
    return field
      .split(/\n+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const paragraphs: string[] = [];

  for (const node of field) {
    if (node.type === 'paragraph' || node.type === 'list-item') {
      const text = extractTextFromNodes(node.children ?? []).trim();
      if (text) paragraphs.push(text);
      continue;
    }

    if (node.type === 'list' && node.children) {
      for (const child of node.children) {
        const text = extractTextFromNodes(child.children ?? []).trim();
        if (text) paragraphs.push(text);
      }
    }
  }

  return paragraphs;
}

function getExperienceLocation(item: StrapiExperienceDetail) {
  return item.destination?.name || item.location_label || null;
}

function getExperienceImageUrl(item: StrapiExperienceDetail) {
  const rawUrl =
    item.cover_image?.formats?.medium?.url ||
    item.cover_image?.formats?.small?.url ||
    item.cover_image?.url;

  return rawUrl ? mediaUrl(rawUrl) : null;
}

function getExperienceDescription(item: StrapiExperienceDetail) {
  if (item.seo_description) return item.seo_description;
  if (item.short_description) return item.short_description;

  const paragraphs = extractParagraphs(item.description);
  return paragraphs[0] ?? '';
}

function toTitleCase(value?: string | null) {
  if (!value) return '';

  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

// ── Rich text renderer ────────────────────────────────────────────────────────
function renderRichText(nodes: StrapiRichTextNode[]): React.ReactNode {
  return nodes.map((node, i) => {
    if (node.type === 'paragraph') {
      return (
        <p key={i} className="font-body text-sm text-neutral-700 leading-relaxed mb-5">
          {node.children ? renderRichText(node.children) : null}
        </p>
      );
    }
    if (node.type === 'heading') {
      return (
        <h3 key={i} className="font-display font-light text-neutral-800 text-xl mb-4 mt-8">
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
        <li key={i} className="font-body text-sm text-neutral-700 leading-relaxed list-disc">
          {node.children ? renderRichText(node.children) : null}
        </li>
      );
    }
    if (node.type === 'text') {
      let content: React.ReactNode = node.text ?? '';
      if (node.bold) content = <strong key={i}>{content}</strong>;
      if (node.italic) content = <em key={i}>{content}</em>;
      if (node.underline) content = <u key={i}>{content}</u>;
      return content;
    }
    // Fallback: render children if any
    if (node.children) return renderRichText(node.children);
    return null;
  });
}

// ── Strapi detail page component ──────────────────────────────────────────────
function StrapiExperiencePage({ item, slug }: { item: StrapiExperienceDetail; slug: string }) {
  const coverUrl = getExperienceImageUrl(item);
  const coverAlt = item.cover_image?.alternativeText ?? item.title;
  const locationDisplay = getExperienceLocation(item);
  const description = getExperienceDescription(item);
  const programItems = extractParagraphs(item.program);
  const audienceItems = extractParagraphs(item.audience);
  const categoryLabel = item.category || item.tier || item.intent_level || '';
  const groupSize = item.group_size || (item.max_guests ? String(item.max_guests) : '');
  const navigableExperiences = experiences.filter((experience) => experience.category !== 'BLACK');
  const currentNavIndex = navigableExperiences.findIndex((experience) => experience.slug === slug);
  const prevExperience = currentNavIndex > 0 ? navigableExperiences[currentNavIndex - 1] : null;
  const nextExperience =
    currentNavIndex >= 0 && currentNavIndex < navigableExperiences.length - 1
      ? navigableExperiences[currentNavIndex + 1]
      : null;
  const canonicalUrl = `${SITE_URL}/experiences/${slug}`;
  const destinationUrl = item.destination?.slug
    ? `${SITE_URL}/cultural-worlds/${item.destination.slug}`
    : undefined;
  const schemaProperties = [
    item.geo_experience_type
      ? {
          '@type': 'PropertyValue',
          name: 'Geo Experience Type',
          value: toTitleCase(item.geo_experience_type),
        }
      : null,
    item.mood
      ? {
          '@type': 'PropertyValue',
          name: 'Mood',
          value: toTitleCase(item.mood),
        }
      : null,
    item.audience_segment
      ? {
          '@type': 'PropertyValue',
          name: 'Audience Segment',
          value: toTitleCase(item.audience_segment),
        }
      : null,
    item.intensity
      ? {
          '@type': 'PropertyValue',
          name: 'Intensity',
          value: toTitleCase(item.intensity),
        }
      : null,
  ].filter(Boolean);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Experiences',
        item: `${SITE_URL}/experiences`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: item.title,
        item: `${SITE_URL}/experiences/${slug}`,
      },
    ],
  };
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'CREARE',
    url: SITE_URL,
    description: 'Experience design studio creating private cultural encounters.',
  };
  const placeJsonLd = locationDisplay
    ? {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: locationDisplay,
        ...(destinationUrl ? { url: destinationUrl } : {}),
      }
    : null;
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: item.title,
    description,
    provider: {
      '@type': 'ProfessionalService',
      name: 'CREARE',
      description: 'Experience design studio creating private cultural encounters.',
      url: SITE_URL,
    },
    ...(coverUrl ? { image: coverUrl } : {}),
    ...(item.category || item.geo_experience_type
      ? {
          serviceType: toTitleCase(item.geo_experience_type) || toTitleCase(item.category),
        }
      : {}),
    ...(locationDisplay
      ? {
          areaServed: {
            '@type': 'Place',
            name: locationDisplay,
            ...(destinationUrl ? { url: destinationUrl } : {}),
          },
        }
      : {}),
    ...(item.audience_segment || audienceItems.length > 0
      ? {
          audience: {
            '@type': 'Audience',
            audienceType: toTitleCase(item.audience_segment) || audienceItems.join(', '),
          },
        }
      : {}),
    ...(schemaProperties.length > 0 ? { additionalProperty: schemaProperties } : {}),
    ...(programItems.length > 0
      ? {
          itinerary: {
            '@type': 'ItemList',
            itemListElement: programItems.map((step, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: step,
            })),
          },
        }
      : {}),
  };
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: item.title,
    description,
    url: canonicalUrl,
    ...(coverUrl ? { image: coverUrl } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      '@type': 'Service',
      name: item.title,
      ...(item.category || item.geo_experience_type
        ? {
            serviceType: toTitleCase(item.geo_experience_type) || toTitleCase(item.category),
          }
        : {}),
    },
    mainEntity: {
      '@type': 'Service',
      name: item.title,
      description,
    },
  };

  // Build info bar items — only include if value exists
  const infoItems: { label: string; value: string }[] = [];
  if (categoryLabel) infoItems.push({ label: 'Category', value: categoryLabel });
  if (locationDisplay) infoItems.push({ label: 'Location', value: locationDisplay });
  if (item.duration) infoItems.push({ label: 'Duration', value: item.duration });
  if (groupSize) infoItems.push({ label: 'Group Size', value: groupSize });

  return (
    <main className="bg-white min-h-screen">
      <Script id="breadcrumb-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <Script id="organization-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(organizationJsonLd)}
      </Script>
      {placeJsonLd && (
        <Script id="place-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(placeJsonLd)}
        </Script>
      )}
      <Script id="service-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(serviceJsonLd)}
      </Script>
      <Script id="webpage-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(webPageJsonLd)}
      </Script>
      <ExperienceViewTracker slug={slug} title={item.title} category={categoryLabel} />

      {/* ── HERO / COVER ── */}
      {coverUrl ? (
        <section className="relative w-full h-[80vh] min-h-[560px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={coverUrl}
              alt={coverAlt || 'Experience image'}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              unoptimized={isLocalAssetUrl(coverUrl)}
            />
            {/* Luxury dark gradient: strong at bottom, subtle at top */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20">
            {item.intent_level && (
              <p className="font-body text-[0.6rem] tracking-[0.35em] text-white/50 uppercase mb-5">
                {item.intent_level}
              </p>
            )}
            <h1
              className="font-display font-light text-white leading-tight max-w-3xl"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}
            >
              {item.title}
            </h1>
            {item.short_description && (
              <p className="mt-5 font-body text-white/60 text-sm leading-relaxed max-w-xl">
                {item.short_description}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-neutral-950 pt-36 pb-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            {item.intent_level && (
              <p className="font-body text-[0.6rem] tracking-[0.35em] text-white/40 uppercase mb-5">
                {item.intent_level}
              </p>
            )}
            <h1
              className="font-display font-light text-white leading-tight max-w-3xl"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}
            >
              {item.title}
            </h1>
            {item.short_description && (
              <p className="mt-5 font-body text-white/50 text-sm leading-relaxed max-w-xl">
                {item.short_description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── BREADCRUMB ── */}
      <section className="bg-[#EDEAE4] py-5" aria-label="Breadcrumb navigation">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 list-none m-0 p-0">
              <li>
                <Link
                  href="/"
                  className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-400 uppercase hover:text-neutral-600 hover:underline underline-offset-2 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <span className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-300">
                  →
                </span>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-400 uppercase hover:text-neutral-600 hover:underline underline-offset-2 transition-colors"
                >
                  Experiences
                </Link>
              </li>
              <li aria-hidden="true">
                <span className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-300">
                  →
                </span>
              </li>
              <li aria-current="page">
                <span className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-600 uppercase">
                  {item.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* ── INFO BAR ── */}
      {infoItems.length > 0 && (
        <section className="py-12 bg-white" aria-label="Experience details">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="border-t border-b border-neutral-200 py-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {infoItems.map((infoItem) => (
                  <div key={infoItem.label}>
                    <p className="font-body text-[0.55rem] tracking-[0.28em] text-neutral-400 uppercase mb-2">
                      {infoItem.label}
                    </p>
                    {infoItem.label === 'Location' && item.destination?.slug ? (
                      <Link
                        href={`/destinations/${item.destination.slug}`}
                        className="font-body text-sm text-neutral-900 font-medium tracking-wide no-underline hover:text-neutral-500 transition-colors duration-200"
                      >
                        {infoItem.value}
                      </Link>
                    ) : (
                      <p className="font-body text-sm text-neutral-900 font-medium tracking-wide">
                        {infoItem.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SHORT DESCRIPTION (no cover fallback) ── */}
      {item.short_description && !coverUrl && (
        <section className="py-16 bg-white" aria-label="Experience overview">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
                Overview
              </p>
              <p
                className="font-display font-light text-neutral-800 leading-relaxed"
                style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}
              >
                {item.short_description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── INTENT LEVEL BADGE ── */}
      {item.intent_level && (
        <section className="pb-4 bg-white" aria-label="Intent level">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="flex items-center gap-3">
              <span className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase">
                Intent Level
              </span>
              <span className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-600 uppercase border border-neutral-200 px-3 py-1">
                {item.intent_level}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── RICH TEXT DESCRIPTION ── */}
      {item.description && (
        <section className="py-20 md:py-28 bg-white" aria-label="Experience description">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                The Experience
              </p>
              <div className="prose-neutral">
                {typeof item.description === 'string' ? (
                  <p className="font-body text-sm text-neutral-700 leading-relaxed">
                    {item.description}
                  </p>
                ) : (
                  renderRichText(item.description)
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PROGRAM SECTION ── */}
      {programItems.length > 0 && (
        <section className="py-20 md:py-24 bg-neutral-50" aria-label="Program">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                The Programme
              </p>
              <ol className="space-y-6">
                {programItems.map((step, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-300 uppercase pt-1 min-w-[1.5rem]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="font-body text-sm text-neutral-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* ── AUDIENCE SECTION ── */}
      {audienceItems.length > 0 && (
        <section className="py-20 md:py-24 bg-white" aria-label="Who this is for">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                Who This Is For
              </p>
              <ul className="space-y-4">
                {audienceItems.map((line, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className="mt-2 w-1 h-1 rounded-full bg-neutral-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <p className="font-body text-sm text-neutral-700 leading-relaxed">{line}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {item.gallery && item.gallery.length > 0 && <GallerySection images={item.gallery} />}

      {(prevExperience || nextExperience) && (
        <section
          className="pt-24 md:pt-32 pb-16 md:pb-20 bg-black"
          aria-label="Experience navigation"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                {prevExperience ? (
                  <Link
                    href={`/experiences/${prevExperience.slug}`}
                    className="group flex flex-col gap-2 text-left hover:opacity-80 transition-opacity"
                    aria-label={`Previous experience: ${prevExperience.title}`}
                  >
                    <span className="font-body text-[0.58rem] tracking-[0.3em] text-white/40 uppercase">
                      Previous Experience
                    </span>
                    <span
                      className="font-display font-light text-white leading-snug tracking-tight group-hover:underline underline-offset-4 decoration-white/30"
                      style={{ fontSize: 'clamp(1rem, 1.6vw, 1.3rem)' }}
                    >
                      {prevExperience.title}
                    </span>
                    <span className="font-body text-[0.75rem] text-white/50 mt-0.5">←</span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
              {prevExperience && nextExperience && (
                <div className="w-px self-stretch bg-white/10 mx-4" aria-hidden="true" />
              )}
              <div className="flex-1 flex justify-end">
                {nextExperience ? (
                  <Link
                    href={`/experiences/${nextExperience.slug}`}
                    className="group flex flex-col gap-2 text-right hover:opacity-80 transition-opacity"
                    aria-label={`Next experience: ${nextExperience.title}`}
                  >
                    <span className="font-body text-[0.58rem] tracking-[0.3em] text-white/40 uppercase">
                      Next Experience
                    </span>
                    <span
                      className="font-display font-light text-white leading-snug tracking-tight group-hover:underline underline-offset-4 decoration-white/30"
                      style={{ fontSize: 'clamp(1rem, 1.6vw, 1.3rem)' }}
                    >
                      {nextExperience.title}
                    </span>
                    <span className="font-body text-[0.75rem] text-white/50 mt-0.5">→</span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      {item.cta_enabled ? (
        <section className="py-24 md:py-32 bg-neutral-950" aria-label="Call to action">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
            <p className="font-body text-[0.6rem] tracking-[0.35em] text-white/40 uppercase mb-6">
              By introduction only
            </p>
            <p
              className="font-display font-light text-white leading-tight mb-10"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)' }}
            >
              Access is limited.
            </p>
            <p className="font-body text-[0.6rem] tracking-[0.2em] text-white/40 uppercase mb-6">
              Access is limited and curated.
            </p>
            <InquireCTA
              experienceSlug={slug}
              experienceId={item.id}
              label={item.cta_text || 'Begin a Private Conversation'}
              className="border border-white/30 text-white hover:bg-white hover:text-neutral-900"
            />
            <div className="mt-5">
              <a
                href={`https://wa.me/+905412203000?text=I'm interested in ${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-all duration-300"
                aria-label="Contact via WhatsApp"
              >
                Contact via WhatsApp
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[#E8E0D5] py-24 md:py-32" aria-label="Call to action">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
            <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
              CREARE
            </p>
            <h2
              className="font-display font-light text-neutral-900 leading-snug tracking-tight mb-6"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              {`Reserve ${item.title}`}
            </h2>
            <p className="font-body text-sm text-neutral-600 leading-relaxed max-w-md mx-auto mb-10">
              This experience is arranged privately. Availability is limited. Begin with a
              conversation.
            </p>
            <p className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-400/70 uppercase mb-6">
              Access is limited and curated.
            </p>
            <InquireCTA
              experienceSlug={slug}
              experienceId={item.id}
              label="INQUIRE PRIVATELY"
              className="bg-black text-white hover:bg-neutral-800"
            />
            <div className="mt-5">
              <a
                href={`https://wa.me/+905412203000?text=I'm interested in ${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-600 transition-all duration-300"
                aria-label="Contact via WhatsApp"
              >
                Contact via WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

interface PageProps {
  params: Promise<{ slug: string | string[] }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const result = await fetchStrapiExperienceBySlug(slugValue);

  if (result.status === 'error') {
    return { title: 'Experience Unavailable — CREARE' };
  }

  if (result.status === 'not_found') {
    return { title: 'Experience Not Found — CREARE' };
  }

  const strapiItem = result.item;

  const ogTitle = strapiItem.seo_title ?? `${strapiItem.title} — CREARE`;
  const ogDescription = getExperienceDescription(strapiItem);
  const coverUrl = getExperienceImageUrl(strapiItem);

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: {
      canonical: `${SITE_URL}/experiences/${slugValue}`,
      languages: {
        en: `${SITE_URL}/experiences/${slugValue}`,
        tr: `${SITE_URL}/experiences/${slugValue}`,
        ru: `${SITE_URL}/experiences/${slugValue}`,
        zh: `${SITE_URL}/experiences/${slugValue}`,
        'x-default': `${SITE_URL}/experiences/${slugValue}`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `${SITE_URL}/experiences/${slugValue}`,
      siteName: SITE_NAME,
      ...(coverUrl
        ? {
            images: [
              {
                url: coverUrl,
                width: 1200,
                height: 630,
                alt: strapiItem.cover_image?.alternativeText ?? strapiItem.title,
              },
            ],
          }
        : {}),
      type: 'website',
    },
    twitter: buildTwitterCard({
      title: ogTitle,
      description: ogDescription,
      ...(coverUrl
        ? {
            image: coverUrl,
            imageAlt: strapiItem.cover_image?.alternativeText ?? strapiItem.title,
          }
        : {}),
    }),
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const result = await fetchStrapiExperienceBySlug(slugValue);

  if (result.status === 'error') {
    return <div style={{ padding: 40 }}>Experience temporarily unavailable</div>;
  }

  if (result.status === 'not_found') {
    return <div style={{ padding: 40 }}>Not found</div>;
  }

  return <StrapiExperiencePage item={result.item} slug={slugValue} />;
}
