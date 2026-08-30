import React, { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import OutboundLink from '@/components/analytics/OutboundLink';
import AppImage from '@/components/ui/AppImage';
import ExperienceViewTracker from '@/components/experiences/ExperienceViewTracker';
import GallerySection from '@/components/experiences/GallerySection';
import InquireCTA from '@/components/experiences/InquireCTA';
import {
  fetchPublishedExperienceBySlug,
  fetchPublishedExperiences,
  getCmsImageUrl,
  normalizeRelationArray,
  type CmsExperience,
  type CmsRelatedInsight,
  type CmsRichTextNode,
  type ExperienceCategory,
} from '@/lib/experiences/cms';
import { DEFAULT_SITE_LOCALE, type SiteLocale } from '@/lib/i18n/config';
import { resolveActiveLocaleAvailability } from '@/lib/i18n/availability';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocalizedRouteTarget, localizePathname } from '@/lib/i18n/pathname';
import { buildLocaleOwnedMetadata } from '@/lib/seo';
import { buildExperienceDetailGraph } from '@/lib/schema-builder';
import { isLocalAssetUrl } from '@/lib/strapi';
import { buildCinematicBlurDataUrl } from '@/lib/lqip';
import { buildWhatsAppHref } from '@/lib/contact/channels';

// ── Strapi types ──────────────────────────────────────────────────────────────
type StrapiRichTextNode = CmsRichTextNode;

interface StrapiExperienceNavigationItem {
  id: number;
  slug?: string;
  title?: string;
  category?: string | null;
  visibility_status?: string | null;
  publishedAt?: string | null;
}

type StrapiRelatedInsight = CmsRelatedInsight;
type StrapiExperienceDetail = CmsExperience;

type StrapiExperienceResult =
  | {
      status: 'ok';
      item: StrapiExperienceDetail;
      navigationItems: StrapiExperienceNavigationItem[];
    }
  | { status: 'not_found' }
  | { status: 'error'; error: Error };

interface ResolvedExperienceDetail {
  status: 'ok';
  item: StrapiExperienceDetail;
  navigationItems: StrapiExperienceNavigationItem[];
  canonicalSlug: string;
}

async function fetchExperienceNavigationItems(
  category: string | null | undefined,
  locale: SiteLocale
): Promise<StrapiExperienceNavigationItem[]> {
  const normalizedCategory =
    category === 'signature' || category === 'lab' || category === 'black'
      ? (category as ExperienceCategory)
      : undefined;
  return fetchPublishedExperiences(locale, normalizedCategory);
}

async function fetchStrapiExperienceBySlug(
  slug: string,
  locale: SiteLocale
): Promise<StrapiExperienceResult> {
  try {
    const item = await fetchPublishedExperienceBySlug(slug, locale);
    if (!item) return { status: 'not_found' };
    const navigationItems = await fetchExperienceNavigationItems(item.category, locale);

    return {
      status: 'ok',
      item,
      navigationItems,
    };
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

function extractNodeText(node: StrapiRichTextNode): string {
  if (node.type === 'text') {
    return node.text ?? '';
  }

  return (node.children ?? []).map(extractNodeText).join('');
}

function normalizeProgramStep(step: string): string {
  return step.replace(/^\s*\d{1,2}\s*[.—-]\s*/, '').trim();
}

function getExperienceLocation(item: StrapiExperienceDetail) {
  return item.location || item.destination?.name || null;
}

function getExperienceImageUrl(item: StrapiExperienceDetail) {
  return getCmsImageUrl(item.cover_image);
}

export type ExperienceDetailMetadataItem = Pick<
  StrapiExperienceDetail,
  | 'title'
  | 'seo_title'
  | 'seo_description'
  | 'short_description'
  | 'description'
  | 'og_description'
  | 'hero_alt_text'
>;

function getExperienceDescription(item: ExperienceDetailMetadataItem) {
  const description = normalizeOptionalText(item.seo_description);
  if (!description) throw new Error('Missing CMS Experience SEO description');
  return description;
}

export function buildLocalizedExperienceDetailMetadata({
  locale,
  slug,
  item,
  image,
  availableLocales,
}: {
  locale: SiteLocale;
  slug: string;
  item: ExperienceDetailMetadataItem;
  image?: string | null;
  availableLocales?: readonly SiteLocale[];
}): Metadata {
  const seoTitle = normalizeOptionalText(item.seo_title);
  const ogDescription = normalizeOptionalText(item.og_description);
  const heroAltText = normalizeOptionalText(item.hero_alt_text);
  if (!seoTitle) throw new Error('Missing CMS Experience SEO title');
  if (!ogDescription) throw new Error('Missing CMS Experience Open Graph description');
  if (!heroAltText) throw new Error('Missing CMS Experience hero alt text');
  const description = getExperienceDescription(item);

  const metadata = buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: {
      family: 'experience-detail',
      locale,
      slug,
    },
    title: seoTitle,
    description,
    image: image ?? undefined,
    imageAlt: heroAltText,
    robots: { index: true, follow: true },
    titleMode: 'absolute',
    availableLocales,
  });

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, description: ogDescription }
      : metadata.openGraph,
    twitter: metadata.twitter
      ? { ...metadata.twitter, description: ogDescription }
      : metadata.twitter,
  };
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveExperienceCtaLabel(experience: StrapiExperienceDetail): string {
  const label = normalizeOptionalText(experience.cta_label);
  if (!label) throw new Error(`Missing CMS CTA label for ${experience.slug}`);
  return label;
}

const MAX_RELATED_INSIGHTS = 3;

const EXPERIENCE_SLUG_CANONICAL_MAP: Record<string, string> = {
  'beylerbeyi-1869': 'beylerbeyi-1869',
  'beylerbeyi-1869-empire-interrupted': 'beylerbeyi-1869',
  'beylerbeyi-1869tm-empire-interrupted': 'beylerbeyi-1869',
  'imperial-flavors': 'imperial-flavors',
  'imperial-flavors-culinary-atelier': 'imperial-flavors',
};

function getExperienceAliasCandidates(slug: string) {
  const normalizedSlug = slug.trim();
  const familyCanonicalSlug = EXPERIENCE_SLUG_CANONICAL_MAP[normalizedSlug];

  if (!familyCanonicalSlug) {
    return [normalizedSlug];
  }

  const familySlugs = Object.entries(EXPERIENCE_SLUG_CANONICAL_MAP)
    .filter(([, canonicalSlug]) => canonicalSlug === familyCanonicalSlug)
    .map(([aliasSlug]) => aliasSlug);

  return [normalizedSlug, ...familySlugs.filter((aliasSlug) => aliasSlug !== normalizedSlug)];
}

const resolveExperienceDetailBySlug = cache(async function resolveExperienceDetailBySlug(
  requestedSlug: string,
  locale: SiteLocale
): Promise<ResolvedExperienceDetail | { status: 'not_found' } | { status: 'error'; error: Error }> {
  const candidateSlugs = getExperienceAliasCandidates(requestedSlug);
  let lastNotFound = false;

  for (const candidateSlug of candidateSlugs) {
    const result = await fetchStrapiExperienceBySlug(candidateSlug, locale);

    if (result.status === 'error') {
      return result;
    }

    if (result.status === 'not_found') {
      lastNotFound = true;
      continue;
    }

    const canonicalSlug = result.item.slug?.trim() || candidateSlug;

    return {
      status: 'ok',
      item: result.item,
      navigationItems: result.navigationItems,
      canonicalSlug,
    };
  }

  return lastNotFound ? { status: 'not_found' } : { status: 'not_found' };
});

// ── Rich text renderer ────────────────────────────────────────────────────────
function renderRichText(nodes: StrapiRichTextNode[]): React.ReactNode {
  return nodes.map((node, i) => {
    if (node.type === 'paragraph') {
      const text = extractNodeText(node).trim();
      if (!text) return null;

      return (
        <p key={i} className="font-body text-sm text-neutral-700 leading-relaxed mb-5">
          {node.children ? renderRichText(node.children) : null}
        </p>
      );
    }
    if (node.type === 'heading') {
      const text = extractNodeText(node).trim();
      if (!text) return null;

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
      const text = extractNodeText(node).trim();
      if (!text) return null;

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
function StrapiExperiencePage({
  item,
  canonicalSlug,
  navigationItems,
  locale,
}: {
  item: StrapiExperienceDetail;
  canonicalSlug: string;
  navigationItems: StrapiExperienceNavigationItem[];
  locale: SiteLocale;
}) {
  const dictionary = getDictionary(locale);
  const coverUrl = getExperienceImageUrl(item);
  const coverAlt = item.hero_alt_text as string;
  const locationDisplay = getExperienceLocation(item);
  const programItems = extractParagraphs(item.program).map(normalizeProgramStep).filter(Boolean);
  const audienceItems = extractParagraphs(item.audience);
  const standardInclusions = extractParagraphs(item.highlights);
  const optionalLayers = extractParagraphs(item.experience_flow);
  const cmsRelatedExperiences = normalizeRelationArray<StrapiExperienceDetail>(
    item.related_experiences
  )
    .filter(
      (experience) => experience.slug && experience.title && experience.slug !== canonicalSlug
    )
    .slice(0, 3);
  const cmsRelatedInsights = normalizeRelationArray<StrapiRelatedInsight>(item.related_insights)
    .filter((insight) => insight.slug && insight.title)
    .slice(0, MAX_RELATED_INSIGHTS);
  const relatedInsights = cmsRelatedInsights;
  const categoryLabel =
    item.category === 'signature'
      ? dictionary.common.protected.signature
      : item.category === 'lab'
        ? dictionary.common.protected.lab
        : item.category === 'black'
          ? dictionary.common.protected.black
          : item.category || '';
  const groupSize = item.group_size || '';
  const currentNavIndex = navigationItems.findIndex(
    (experience) => experience.slug === canonicalSlug
  );
  const prevExperience = currentNavIndex > 0 ? navigationItems[currentNavIndex - 1] : null;
  const nextExperience =
    currentNavIndex >= 0 && currentNavIndex < navigationItems.length - 1
      ? navigationItems[currentNavIndex + 1]
      : null;
  const wowMoment = normalizeOptionalText(item.wow_moment);
  const differentiator = normalizeOptionalText(item.differentiator);
  const visibleCtaLabel = resolveExperienceCtaLabel(item);
  const experienceSchemaGraph = buildExperienceDetailGraph(item, canonicalSlug, relatedInsights, {
    locale,
    heroAltText: item.hero_alt_text,
    labels: {
      home: dictionary.common.home,
      experiences: dictionary.experiences.title,
      programme: dictionary.experiences.programme,
      wowMoment: dictionary.experiences.wowMoment,
      differentiator: dictionary.experiences.differentiator,
    },
  });
  const coverBlurDataUrl = coverUrl
    ? buildCinematicBlurDataUrl(coverUrl, { atmosphere: 'dark', profile: 'hero' })
    : undefined;

  // Build info bar items — only include if value exists
  const infoItems: { label: string; value: string; note?: string; isLocation?: boolean }[] = [];
  if (categoryLabel)
    infoItems.push({ label: dictionary.experiences.category, value: categoryLabel });
  if (locationDisplay)
    infoItems.push({
      label: dictionary.experiences.location,
      value: locationDisplay,
      isLocation: true,
    });
  if (item.duration)
    infoItems.push({ label: dictionary.experiences.duration, value: item.duration });
  if (groupSize)
    infoItems.push({
      label: dictionary.experiences.groupSize,
      value: groupSize,
      note: item.group_size_note || undefined,
    });

  return (
    <main className="bg-white min-h-screen">
      <JsonLd id="experience-detail-jsonld" schema={experienceSchemaGraph} />
      <ExperienceViewTracker slug={canonicalSlug} title={item.title} category={categoryLabel} />

      {/* ── HERO / COVER ── */}
      {coverUrl ? (
        <section className="relative w-full h-[80vh] min-h-[560px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <AppImage
              src={coverUrl}
              alt={coverAlt}
              fill
              priority
              blurDataURL={coverBlurDataUrl}
              atmosphere="dark"
              deliveryProfile="hero"
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
                  href={localizePathname('/', locale)}
                  className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-400 uppercase hover:text-neutral-600 hover:underline underline-offset-2 transition-colors"
                >
                  {dictionary.common.home}
                </Link>
              </li>
              <li aria-hidden="true">
                <span className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-300">
                  →
                </span>
              </li>
              <li>
                <Link
                  href={localizePathname('/experiences', locale)}
                  className="font-body text-[0.65rem] tracking-[0.18em] text-neutral-400 uppercase hover:text-neutral-600 hover:underline underline-offset-2 transition-colors"
                >
                  {dictionary.experiences.title}
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
                    {infoItem.isLocation && item.destination?.slug ? (
                      <Link
                        href={localizePathname(`/cultural-worlds/${item.destination.slug}`, locale)}
                        className="font-body text-sm text-neutral-900 font-medium tracking-wide no-underline hover:text-neutral-500 transition-colors duration-200"
                      >
                        {infoItem.value}
                      </Link>
                    ) : (
                      <p className="font-body text-sm text-neutral-900 font-medium tracking-wide">
                        {infoItem.value}
                      </p>
                    )}
                    {infoItem.note ? (
                      <p className="mt-2 font-body text-xs leading-relaxed text-neutral-500">
                        {infoItem.note}
                      </p>
                    ) : null}
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
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
                {dictionary.experiences.overview}
              </h2>
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
                {dictionary.experiences.intentLevel}
              </span>
              <span className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-600 uppercase border border-neutral-200 px-3 py-1">
                {item.intent_level}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── DEFINING EXPERIENCE SECTION ── */}
      {(wowMoment || differentiator) && (
        <section className="py-16 md:py-20 bg-white" aria-label="What defines this experience">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-3xl border-t border-neutral-200 pt-10">
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                {locale === DEFAULT_SITE_LOCALE
                  ? `What Defines ${item.title}`
                  : dictionary.experiences.differentiator}
              </h2>
              <div className="grid gap-10 md:grid-cols-2 md:gap-12">
                {wowMoment && (
                  <div>
                    <p className="font-body text-[0.6rem] tracking-[0.24em] text-neutral-400 uppercase mb-3">
                      {dictionary.experiences.wowMoment}
                    </p>
                    <p className="font-display font-light text-neutral-800 leading-relaxed text-lg md:text-xl">
                      {wowMoment}
                    </p>
                  </div>
                )}
                {differentiator && (
                  <div>
                    <p className="font-body text-[0.6rem] tracking-[0.24em] text-neutral-400 uppercase mb-3">
                      {dictionary.experiences.differentiator}
                    </p>
                    <p className="font-body text-sm text-neutral-700 leading-relaxed">
                      {differentiator}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── RICH TEXT DESCRIPTION ── */}
      {item.description && (
        <section className="py-20 md:py-28 bg-white" aria-label="Experience description">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                {dictionary.experiences.experience}
              </h2>
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
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                {dictionary.experiences.programme}
              </h2>
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
              {item.programme_note ? (
                <p className="mt-8 border-t border-neutral-200 pt-6 font-body text-xs leading-relaxed text-neutral-500">
                  {item.programme_note}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {standardInclusions.length > 0 && (
        <section
          className="py-20 md:py-24 bg-white"
          aria-label={dictionary.experiences.standardInclusions}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl border-t border-neutral-200 pt-10">
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                {dictionary.experiences.standardInclusions}
              </h2>
              {typeof item.highlights === 'string' ? (
                <p className="font-body text-sm text-neutral-700 leading-relaxed">
                  {item.highlights}
                </p>
              ) : item.highlights ? (
                renderRichText(item.highlights)
              ) : null}
            </div>
          </div>
        </section>
      )}

      {optionalLayers.length > 0 && (
        <section
          className="py-20 md:py-24 bg-neutral-50"
          aria-label={dictionary.experiences.optionalLayers}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                {dictionary.experiences.optionalLayers}
              </h2>
              {typeof item.experience_flow === 'string' ? (
                <p className="font-body text-sm text-neutral-700 leading-relaxed">
                  {item.experience_flow}
                </p>
              ) : item.experience_flow ? (
                renderRichText(item.experience_flow)
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* ── AUDIENCE SECTION ── */}
      {audienceItems.length > 0 && (
        <section className="py-20 md:py-24 bg-white" aria-label="Who this is for">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                {dictionary.experiences.whoThisIsFor}
              </h2>
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

      {item.one_line_hook ? (
        <section
          className="bg-[#EDEAE4] py-16 md:py-20"
          aria-label={dictionary.experiences.closingCopy}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <p className="max-w-3xl font-display text-xl font-light leading-relaxed text-neutral-800 md:text-2xl">
              {item.one_line_hook}
            </p>
          </div>
        </section>
      ) : null}

      {/* ── GALLERY ── */}
      {item.gallery && item.gallery.length > 0 && <GallerySection images={item.gallery} />}

      {(cmsRelatedExperiences.length > 0 || relatedInsights.length > 0) && (
        <section className="py-20 md:py-24 bg-white" aria-label="Related editorial references">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="border-t border-neutral-200 pt-10">
              {cmsRelatedExperiences.length > 0 && (
                <div className={relatedInsights.length > 0 ? 'mb-16 md:mb-20' : ''}>
                  <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                    {dictionary.experiences.adjacentExperiences}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                    {cmsRelatedExperiences.map((experience, index) => {
                      const imageUrl = getExperienceImageUrl(experience);
                      const imageAlt = experience.hero_alt_text as string;
                      const relatedLocation = experience.location || experience.destination?.name;

                      return (
                        <Link
                          key={experience.id}
                          href={localizePathname(`/experiences/${experience.slug}`, locale)}
                          className="group block"
                          aria-label={`${dictionary.experiences.adjacentExperiences}: ${experience.title}`}
                        >
                          {imageUrl ? (
                            <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-neutral-100">
                              <Image
                                src={imageUrl}
                                alt={imageAlt || 'Experience image'}
                                fill
                                className="motion-media-drift object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                priority={index === 0}
                                unoptimized={isLocalAssetUrl(imageUrl)}
                              />
                            </div>
                          ) : null}
                          {relatedLocation && (
                            <p className="font-body text-[0.58rem] tracking-[0.18em] text-neutral-400 uppercase mb-2">
                              {relatedLocation}
                            </p>
                          )}
                          <h3 className="motion-copy-fade font-display font-light text-neutral-900 leading-snug mb-2">
                            {experience.title}
                          </h3>
                          {experience.short_description && (
                            <p className="font-body text-sm text-neutral-600 leading-relaxed">
                              {experience.short_description}
                            </p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {relatedInsights.length > 0 && (
                <div className="max-w-3xl">
                  <h2 className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                    {dictionary.experiences.furtherCulturalReading}
                  </h2>
                  <div className="space-y-6">
                    {relatedInsights.map((insight) => (
                      <Link
                        key={insight.id}
                        href={localizePathname(`/insights/${insight.slug}`, locale)}
                        className="group block border-b border-neutral-200/80 pb-6 last:border-b-0 last:pb-0"
                        aria-label={`${dictionary.experiences.furtherCulturalReading}: ${insight.title}`}
                      >
                        {insight.destination?.name && (
                          <p className="font-body text-[0.58rem] tracking-[0.18em] text-neutral-400 uppercase mb-2">
                            {insight.destination.name}
                          </p>
                        )}
                        <h3 className="motion-copy-fade font-display font-light text-neutral-900 leading-snug mb-2">
                          {insight.title}
                        </h3>
                        {insight.excerpt && (
                          <p className="font-body text-sm text-neutral-600 leading-relaxed">
                            {insight.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
                    href={localizePathname(`/experiences/${prevExperience.slug}`, locale)}
                    className="group flex flex-col gap-2 text-left motion-link hover:opacity-80"
                    aria-label={`${dictionary.experiences.previousExperience}: ${prevExperience.title}`}
                  >
                    <span className="font-body text-[0.58rem] tracking-[0.3em] text-white/40 uppercase">
                      {dictionary.experiences.previousExperience}
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
                    href={localizePathname(`/experiences/${nextExperience.slug}`, locale)}
                    className="group flex flex-col gap-2 text-right motion-link hover:opacity-80"
                    aria-label={`${dictionary.experiences.nextExperience}: ${nextExperience.title}`}
                  >
                    <span className="font-body text-[0.58rem] tracking-[0.3em] text-white/40 uppercase">
                      {dictionary.experiences.nextExperience}
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
      <section className="bg-[#E8E0D5] py-24 md:py-32" aria-label="Call to action">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
            {dictionary.common.protected.creare}
          </p>
          <h2
            className="font-display font-light text-neutral-900 leading-snug tracking-tight mb-6"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            {item.cta_heading}
          </h2>
          <p className="font-body text-sm text-neutral-600 leading-relaxed max-w-md mx-auto mb-10">
            {item.cta_supporting_text}
          </p>
          <p className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-400/70 uppercase mb-6">
            {item.cta_access_line}
          </p>
          <InquireCTA
            experienceSlug={canonicalSlug}
            label={visibleCtaLabel}
            className="bg-black text-white hover:bg-neutral-800"
          />
          <div className="mt-5">
            <OutboundLink
              href={buildWhatsAppHref(locale, item.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="motion-link inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-600"
              aria-label={dictionary.common.contactViaWhatsApp}
              trackingLabel="experience_whatsapp_contact"
              trackingSource="experience_detail_page"
            >
              {dictionary.common.contactViaWhatsApp}
            </OutboundLink>
          </div>
        </div>
      </section>
    </main>
  );
}

interface PageProps {
  params: Promise<{ slug: string | string[] }>;
}

export const dynamic = 'force-dynamic';

function buildExperienceNotFoundMetadata(
  locale: SiteLocale,
  title: 'Experience Unavailable' | 'Experience Not Found'
): Metadata {
  if (locale === DEFAULT_SITE_LOCALE) {
    return {
      title,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: { absolute: '404' },
    robots: { index: false, follow: false },
  };
}

export async function generateExperienceDetailMetadata({
  locale = DEFAULT_SITE_LOCALE,
  params,
}: {
  locale?: SiteLocale;
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const result = await resolveExperienceDetailBySlug(slugValue, locale);

  if (result.status === 'error') {
    return buildExperienceNotFoundMetadata(locale, 'Experience Unavailable');
  }

  if (result.status === 'not_found') {
    return buildExperienceNotFoundMetadata(locale, 'Experience Not Found');
  }

  const strapiItem = result.item;
  const canonicalSlug = result.canonicalSlug;
  const availableLocales = await resolveActiveLocaleAvailability(async (candidateLocale) => {
    if (candidateLocale === locale) return true;
    const candidate = await resolveExperienceDetailBySlug(canonicalSlug, candidateLocale);
    return candidate.status === 'ok';
  });
  return buildLocalizedExperienceDetailMetadata({
    locale,
    slug: canonicalSlug,
    item: strapiItem,
    image: getExperienceImageUrl(strapiItem),
    availableLocales,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  return generateExperienceDetailMetadata({ params });
}

export async function renderExperienceDetailPage(slug: string | string[], locale: SiteLocale) {
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const result = await resolveExperienceDetailBySlug(slugValue, locale);

  if (result.status === 'error') {
    notFound();
  }

  if (result.status === 'not_found') {
    notFound();
  }

  if (slugValue !== result.canonicalSlug) {
    permanentRedirect(buildLocalizedRouteTarget('/experiences', result.canonicalSlug, locale));
  }

  return (
    <StrapiExperiencePage
      item={result.item}
      canonicalSlug={result.canonicalSlug}
      navigationItems={result.navigationItems}
      locale={locale}
    />
  );
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return renderExperienceDetailPage(slug, DEFAULT_SITE_LOCALE);
}
