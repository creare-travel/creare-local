import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import ExperienceViewTracker from '@/components/experiences/ExperienceViewTracker';
import GallerySection from '@/components/experiences/GallerySection';
import InquireCTA from '@/components/experiences/InquireCTA';
import { buildCloudinaryUrl } from '@/lib/cloudinary';
import { buildMetadataAlternates, buildTwitterCard, SITE_NAME } from '@/lib/seo';
import { buildExperienceDetailGraph } from '@/lib/schema-builder';
import { fetchStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';
import { buildCinematicBlurDataUrl } from '@/lib/lqip';

const SITE_URL = 'https://crearetravel.com';
const GOVERNED_TABLE_TO_FARM_HERO_URL = buildCloudinaryUrl(
  'creare/experiences/table-to-farm-bodrum/hero/main',
  { profile: 'hero' }
);

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
  name?: string;
  alternativeText?: string;
  caption?: string;
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

interface StrapiExperienceNavigationItem {
  id: number;
  slug?: string;
  title?: string;
  category?: string | null;
  visibility_status?: string | null;
  publishedAt?: string | null;
}

interface StrapiRelatedInsight {
  id: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  cover_image?: StrapiCoverImage | null;
  destination?: StrapiDestination | null;
}

interface StrapiOntologyEntity {
  name?: string;
  slug?: string;
  description?: string;
  same_as?: string[];
  semantic_tags?: string[];
  external_reference_url?: string;
  confidence_score?: number;
}

interface StrapiExperienceDetail {
  id: number;
  documentId?: string;
  title: string;
  short_description?: string;
  description?: StrapiRichTextNode[] | string;
  wow_moment?: string;
  differentiator?: string;
  experience_type?: string | null;
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
  mood_entity?: StrapiOntologyEntity;
  audience_entity?: StrapiOntologyEntity;
  experience_type_entity?: StrapiOntologyEntity;
  intensity_entity?: StrapiOntologyEntity;
  related_experiences?: StrapiExperienceDetail[] | { data?: Record<string, unknown>[] };
  related_insights?: StrapiRelatedInsight[] | { data?: Record<string, unknown>[] };
}

type StrapiExperienceResult =
  | {
      status: 'ok';
      item: StrapiExperienceDetail;
      navigationItems: StrapiExperienceNavigationItem[];
    }
  | { status: 'not_found' }
  | { status: 'error'; error: Error };

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

async function fetchExperienceNavigationItems(
  category?: string | null
): Promise<StrapiExperienceNavigationItem[]> {
  const params = new URLSearchParams({
    'filters[visibility_status][$eqi]': 'active',
    'fields[0]': 'slug',
    'fields[1]': 'title',
    'fields[2]': 'category',
    'fields[3]': 'visibility_status',
    'fields[4]': 'publishedAt',
    'sort[0]': 'publishedAt:asc',
    'sort[1]': 'title:asc',
    'pagination[pageSize]': '200',
  });

  if (category) {
    params.set('filters[category][$eqi]', category);
  }

  const json = await fetchStrapi(`/api/experiences?${params.toString()}`);
  const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

  return items
    .map((item) => flattenItem<StrapiExperienceNavigationItem>(item))
    .filter(
      (item) =>
        typeof item.slug === 'string' &&
        item.slug.length > 0 &&
        typeof item.title === 'string' &&
        item.title.length > 0 &&
        item.visibility_status?.toLowerCase() === 'active' &&
        Boolean(item.publishedAt)
    );
}

async function fetchStrapiExperienceBySlug(slug: string): Promise<StrapiExperienceResult> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate[cover_image]': 'true',
      'populate[gallery]': 'true',
      'populate[destination]': 'true',
      'populate[related_experiences][populate][cover_image]': 'true',
      'populate[related_experiences][populate][destination]': 'true',
      'populate[related_insights][populate][cover_image]': 'true',
      'populate[mood_entity][fields][0]': 'name',
      'populate[mood_entity][fields][1]': 'slug',
      'populate[mood_entity][fields][2]': 'description',
      'populate[mood_entity][fields][3]': 'same_as',
      'populate[mood_entity][fields][4]': 'external_reference_url',
      'populate[mood_entity][fields][5]': 'confidence_score',
      'populate[audience_entity][fields][0]': 'name',
      'populate[audience_entity][fields][1]': 'slug',
      'populate[audience_entity][fields][2]': 'description',
      'populate[audience_entity][fields][3]': 'same_as',
      'populate[audience_entity][fields][4]': 'external_reference_url',
      'populate[audience_entity][fields][5]': 'confidence_score',
      'populate[experience_type_entity][fields][0]': 'name',
      'populate[experience_type_entity][fields][1]': 'slug',
      'populate[experience_type_entity][fields][2]': 'description',
      'populate[experience_type_entity][fields][3]': 'same_as',
      'populate[experience_type_entity][fields][4]': 'external_reference_url',
      'populate[experience_type_entity][fields][5]': 'confidence_score',
      'populate[intensity_entity][fields][0]': 'name',
      'populate[intensity_entity][fields][1]': 'slug',
      'populate[intensity_entity][fields][2]': 'description',
      'populate[intensity_entity][fields][3]': 'same_as',
      'populate[intensity_entity][fields][4]': 'external_reference_url',
      'populate[intensity_entity][fields][5]': 'confidence_score',
    });

    const json = await fetchStrapi(`/api/experiences?${params.toString()}`);
    const items: StrapiExperienceDetail[] = Array.isArray(json?.data) ? json.data : [];
    const item = items[0];
    if (!item) {
      return { status: 'not_found' };
    }
    const cmsRelatedExperiences = normalizeRelationArray<StrapiExperienceDetail>(
      item.related_experiences
    ).map((experience) => ({
      ...experience,
      cover_image: normalizeSingleRelation<StrapiCoverImage>(experience.cover_image) ?? undefined,
      destination: normalizeSingleRelation<StrapiDestination>(experience.destination) ?? undefined,
    }));
    const cmsRelatedInsights = normalizeRelationArray<StrapiRelatedInsight>(
      item.related_insights
    ).map((insight) => ({
      ...insight,
      cover_image: normalizeSingleRelation<StrapiCoverImage>(insight.cover_image) ?? undefined,
      destination: normalizeSingleRelation<StrapiDestination>(insight.destination) ?? undefined,
    }));
    const navigationItems = await fetchExperienceNavigationItems(item.category);

    return {
      status: 'ok',
      item: {
        ...item,
        destination: normalizeSingleRelation<StrapiDestination>(item.destination) ?? undefined,
        related_experiences: cmsRelatedExperiences,
        related_insights: cmsRelatedInsights,
      },
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

function getExperienceLocation(item: StrapiExperienceDetail) {
  return item.destination?.name || item.location_label || null;
}

function getExperienceImageUrl(item: StrapiExperienceDetail) {
  const rawUrl =
    item.cover_image?.formats?.large?.url ||
    item.cover_image?.formats?.medium?.url ||
    item.cover_image?.formats?.small?.url ||
    item.cover_image?.url;

  return rawUrl ? mediaUrl(rawUrl) : null;
}

function getGovernedExperienceImageUrl(item: StrapiExperienceDetail, slug: string) {
  if (slug === 'table-to-farm-bodrum') {
    return GOVERNED_TABLE_TO_FARM_HERO_URL;
  }

  return getExperienceImageUrl(item);
}

function getExperienceDescription(item: StrapiExperienceDetail) {
  if (item.seo_description) return item.seo_description;
  if (item.short_description) return item.short_description;

  const paragraphs = extractParagraphs(item.description);
  return paragraphs[0] ?? '';
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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
function StrapiExperiencePage({
  item,
  slug,
  navigationItems,
}: {
  item: StrapiExperienceDetail;
  slug: string;
  navigationItems: StrapiExperienceNavigationItem[];
}) {
  const coverUrl = getGovernedExperienceImageUrl(item, slug);
  const coverAlt = item.cover_image?.alternativeText ?? item.title;
  const locationDisplay = getExperienceLocation(item);
  const programItems = extractParagraphs(item.program);
  const audienceItems = extractParagraphs(item.audience);
  const cmsRelatedExperiences = normalizeRelationArray<StrapiExperienceDetail>(
    item.related_experiences
  )
    .filter((experience) => experience.slug && experience.title && experience.slug !== slug)
    .slice(0, 3);
  const cmsRelatedInsights = normalizeRelationArray<StrapiRelatedInsight>(item.related_insights)
    .filter((insight) => insight.slug && insight.title)
    .slice(0, 3);
  const categoryLabel = item.category || item.tier || item.intent_level || '';
  const groupSize = item.group_size || (item.max_guests ? String(item.max_guests) : '');
  const currentNavIndex = navigationItems.findIndex((experience) => experience.slug === slug);
  const prevExperience = currentNavIndex > 0 ? navigationItems[currentNavIndex - 1] : null;
  const nextExperience =
    currentNavIndex >= 0 && currentNavIndex < navigationItems.length - 1
      ? navigationItems[currentNavIndex + 1]
      : null;
  const wowMoment = normalizeOptionalText(item.wow_moment);
  const differentiator = normalizeOptionalText(item.differentiator);
  const experienceSchemaGraph = buildExperienceDetailGraph(item, slug);
  const coverBlurDataUrl = coverUrl
    ? buildCinematicBlurDataUrl(coverUrl, { atmosphere: 'dark', profile: 'hero' })
    : undefined;

  // Build info bar items — only include if value exists
  const infoItems: { label: string; value: string }[] = [];
  if (categoryLabel) infoItems.push({ label: 'Category', value: categoryLabel });
  if (locationDisplay) infoItems.push({ label: 'Location', value: locationDisplay });
  if (item.duration) infoItems.push({ label: 'Duration', value: item.duration });
  if (groupSize) infoItems.push({ label: 'Group Size', value: groupSize });

  return (
    <main className="bg-white min-h-screen">
      <JsonLd id="experience-detail-jsonld" schema={experienceSchemaGraph} />
      <ExperienceViewTracker slug={slug} title={item.title} category={categoryLabel} />

      {/* ── HERO / COVER ── */}
      {coverUrl ? (
        <section className="relative w-full h-[80vh] min-h-[560px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <AppImage
              src={coverUrl}
              alt={coverAlt || 'Experience image'}
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
                        href={`/cultural-worlds/${item.destination.slug}`}
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

      {/* ── DEFINING EXPERIENCE SECTION ── */}
      {(wowMoment || differentiator) && (
        <section className="py-16 md:py-20 bg-white" aria-label="What defines this experience">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="max-w-3xl border-t border-neutral-200 pt-10">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                What Defines This Experience
              </p>
              <div className="grid gap-10 md:grid-cols-2 md:gap-12">
                {wowMoment && (
                  <div>
                    <p className="font-body text-[0.6rem] tracking-[0.24em] text-neutral-400 uppercase mb-3">
                      Wow Moment
                    </p>
                    <p className="font-display font-light text-neutral-800 leading-relaxed text-lg md:text-xl">
                      {wowMoment}
                    </p>
                  </div>
                )}
                {differentiator && (
                  <div>
                    <p className="font-body text-[0.6rem] tracking-[0.24em] text-neutral-400 uppercase mb-3">
                      Differentiator
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

      {(cmsRelatedExperiences.length > 0 || cmsRelatedInsights.length > 0) && (
        <section className="py-20 md:py-24 bg-white" aria-label="Related editorial references">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="border-t border-neutral-200 pt-10">
              {cmsRelatedExperiences.length > 0 && (
                <div className={cmsRelatedInsights.length > 0 ? 'mb-16 md:mb-20' : ''}>
                  <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                    Adjacent Experiences
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                    {cmsRelatedExperiences.map((experience, index) => {
                      const imageUrl = getExperienceImageUrl(experience);
                      const imageAlt = experience.cover_image?.alternativeText ?? experience.title;
                      const relatedLocation =
                        experience.destination?.name || experience.location_label || null;

                      return (
                        <Link
                          key={experience.id}
                          href={`/experiences/${experience.slug}`}
                          className="group block"
                          aria-label={`View adjacent experience: ${experience.title}`}
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

              {cmsRelatedInsights.length > 0 && (
                <div className="max-w-3xl">
                  <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
                    Further Cultural Reading
                  </p>
                  <div className="space-y-6">
                    {cmsRelatedInsights.map((insight) => (
                      <Link
                        key={insight.id}
                        href={`/insights/${insight.slug}`}
                        className="group block border-b border-neutral-200/80 pb-6 last:border-b-0 last:pb-0"
                        aria-label={`Read further cultural context: ${insight.title}`}
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
                    href={`/experiences/${prevExperience.slug}`}
                    className="group flex flex-col gap-2 text-left motion-link hover:opacity-80"
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
                    className="group flex flex-col gap-2 text-right motion-link hover:opacity-80"
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
              label={item.cta_text || 'Begin a Private Conversation'}
              className="border border-white/30 text-white hover:bg-white hover:text-neutral-900"
            />
            <div className="mt-5">
              <a
                href={`https://wa.me/+905412203000?text=I'm interested in ${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-link inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase text-white/40 hover:text-white/70"
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
              label="INQUIRE PRIVATELY"
              className="bg-black text-white hover:bg-neutral-800"
            />
            <div className="mt-5">
              <a
                href={`https://wa.me/+905412203000?text=I'm interested in ${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-link inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-600"
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
  const coverUrl = getGovernedExperienceImageUrl(strapiItem, slugValue);

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: buildMetadataAlternates(`/experiences/${slugValue}`),
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

  return (
    <StrapiExperiencePage
      item={result.item}
      slug={slugValue}
      navigationItems={result.navigationItems}
    />
  );
}
