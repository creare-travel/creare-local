import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import { buildCanonicalUrl, buildExperienceListingGraph, listingIds } from '@/lib/schema-builder';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';
import { experiences } from '@/lib/experiences';

const SITE_URL = 'https://crearetravel.com';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Signature Experiences',
  description:
    'Each encounter is composed around culture, place and narrative. Discover the CREARE Signature collection.',
  alternates: {
    canonical: 'https://crearetravel.com/experiences/signature',
    languages: {
      en: 'https://crearetravel.com/experiences/signature',
      tr: 'https://crearetravel.com/experiences/signature',
      ru: 'https://crearetravel.com/experiences/signature',
      zh: 'https://crearetravel.com/experiences/signature',
      'x-default': 'https://crearetravel.com/experiences/signature',
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Signature Experiences — CREARE',
    description: 'Each encounter is composed around culture, place and narrative.',
    url: 'https://crearetravel.com/experiences/signature',
  },
};

// ── Strapi types ──────────────────────────────────────────────────────────────
interface StrapiDestination {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
}

interface StrapiCoverImage {
  url: string;
  alternativeText?: string;
  caption?: string;
  formats?: {
    large?: { url?: string };
    medium?: { url?: string };
    small?: { url?: string };
  };
}

interface StrapiExperienceDestination {
  id: number;
  name: string;
  slug: string;
}

interface StrapiExperience {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  location_label?: string;
  cover_image?: StrapiCoverImage;
  category?: string;
  series?: string | null;
  geo_experience_type?: string | null;
  mood?: string | null;
  intensity?: string | null;
  destination?: StrapiExperienceDestination;
  order?: number;
}

const SIGNATURE_CATEGORY = 'signature';
const SIGNATURE_SERIES = {
  historical: 'historical',
  corporate: 'corporate',
  culinary: 'culinary',
} as const;

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function getSeriesImage(exp: StrapiExperience) {
  const rawUrl =
    exp.cover_image?.formats?.large?.url ??
    exp.cover_image?.formats?.medium?.url ??
    exp.cover_image?.formats?.small?.url ??
    exp.cover_image?.url ??
    null;

  return rawUrl ? (rawUrl.startsWith('http') ? rawUrl : mediaUrl(rawUrl)) : null;
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

function formatGeoExperienceType(value?: string | null) {
  return toTitleCase(value);
}

function formatIntensity(value?: string | null) {
  const normalized = normalizeValue(value);
  if (!normalized) return '';

  const intensityMap: Record<string, string> = {
    low: 'Low Intensity',
    medium: 'Medium Intensity',
    high: 'High Intensity',
  };

  return intensityMap[normalized] ?? `${toTitleCase(value)} Intensity`;
}

function formatMood(value?: string | null) {
  return toTitleCase(value);
}

function getGeoMetadataLine(exp: StrapiExperience) {
  return [
    formatGeoExperienceType(exp.geo_experience_type),
    formatIntensity(exp.intensity),
    formatMood(exp.mood),
  ]
    .filter(Boolean)
    .join(' · ');
}

function renderExperienceCard(exp: StrapiExperience, options?: { compact?: boolean }) {
  const coverUrl = getSeriesImage(exp);
  const coverAlt = exp.cover_image?.alternativeText ?? exp.title;
  const compact = options?.compact ?? false;
  const geoMetadata = getGeoMetadataLine(exp);
  const href = exp.slug ? `/experiences/${exp.slug}` : null;

  const card = (
    <>
      <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-2xl">
        {coverUrl ? (
          <AppImage
            src={coverUrl}
            alt={coverAlt}
            fill
            atmosphere="light"
            className="object-cover scale-[1.03] origin-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={coverUrl.startsWith('http://localhost')}
          />
        ) : (
          <div className="w-full h-full bg-[linear-gradient(135deg,rgba(245,241,234,0.98),rgba(225,217,206,0.94))]" />
        )}
      </div>

      <p
        className="mb-3 font-body text-[0.55rem] uppercase tracking-[0.28em]"
        style={{ color: 'rgba(108,101,93,0.72)' }}
      >
        {exp.series
          ? `${exp.category ?? 'SIGNATURE'} / ${exp.series}`
          : (exp.category ?? 'SIGNATURE')}
      </p>

      <h3
        className="mb-3 font-display font-light leading-snug text-neutral-900 transition-opacity duration-300 group-hover:opacity-70"
        style={{
          fontSize: compact ? 'clamp(1rem, 1.6vw, 1.15rem)' : 'clamp(1rem, 1.8vw, 1.2rem)',
        }}
      >
        {exp.title}
      </h3>

      {geoMetadata && (
        <p
          className="mb-3 font-body text-[0.62rem] tracking-[0.08em]"
          style={{ color: 'rgba(80,76,70,0.46)' }}
        >
          {geoMetadata}
        </p>
      )}

      {!compact && (exp.destination?.name || exp.location_label) && (
        <p className="font-body text-[0.7rem]" style={{ color: 'rgba(98,91,83,0.76)' }}>
          {exp.destination?.name ?? exp.location_label}
        </p>
      )}
    </>
  );

  return href ? (
    <Link key={exp.id} href={href} className="group block" aria-label={`View ${exp.title}`}>
      {card}
    </Link>
  ) : (
    <div key={exp.id} className="group block" aria-label={exp.title}>
      {card}
    </div>
  );
}

// ── Strapi fetch helpers ──────────────────────────────────────────────────────
async function fetchStrapiDestinations(): Promise<StrapiDestination[]> {
  try {
    const json = await fetchStrapi('/api/destinations?populate=*');
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    console.error('Failed to fetch destinations for signature experiences.', error);
    return [];
  }
}

async function fetchStrapiSignatureExperiences(): Promise<StrapiExperience[]> {
  try {
    const json = await fetchStrapi('/api/experiences?filters[category][$eqi]=signature&populate=*');
    const all: StrapiExperience[] = Array.isArray(json?.data) ? json.data : [];

    if (!all.length) {
      return [];
    }

    return all
      .filter((exp) => normalizeValue(exp.category) === SIGNATURE_CATEGORY)
      .sort((a, b) => {
        const aOrder = a.order ?? Infinity;
        const bOrder = b.order ?? Infinity;
        return aOrder - bOrder;
      });
  } catch (error) {
    console.error('Failed to fetch signature experiences from Strapi.', error);
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function SignatureExperiencesPage() {
  // Fetch CMS data in parallel
  const [strapiDestinations, strapiSignatureExperiences] = await Promise.all([
    fetchStrapiDestinations(),
    fetchStrapiSignatureExperiences(),
  ]);

  const selectedSignatureExperiences = strapiSignatureExperiences.filter((exp) => {
    const series = normalizeValue(exp.series);
    return (
      !series ||
      !Object.values(SIGNATURE_SERIES).includes(
        series as (typeof SIGNATURE_SERIES)[keyof typeof SIGNATURE_SERIES]
      )
    );
  });
  const historicalExperiences = strapiSignatureExperiences.filter(
    (exp) => normalizeValue(exp.series) === SIGNATURE_SERIES.historical
  );
  const corporateExperiences = strapiSignatureExperiences.filter(
    (exp) => normalizeValue(exp.series) === SIGNATURE_SERIES.corporate
  );
  const culinaryExperiences = strapiSignatureExperiences.filter(
    (exp) => normalizeValue(exp.series) === SIGNATURE_SERIES.culinary
  );
  const staticPerformanceFallback: StrapiExperience[] = experiences
    .filter((exp) => exp.category === 'PERFORMANCE')
    .map((exp, index) => ({
      id: 100000 + index,
      title: exp.title,
      slug: exp.slug,
      location_label: exp.location,
      cover_image: exp.heroImage
        ? {
            url: exp.heroImage,
            alternativeText: exp.heroImageAlt,
          }
        : undefined,
      category: 'PERFORMANCE',
      series: 'corporate',
    }));
  const corporateLayerExperiences =
    corporateExperiences.length > 0 ? corporateExperiences : staticPerformanceFallback;
  const visibleExperienceCards = [
    ...selectedSignatureExperiences,
    ...historicalExperiences,
    ...corporateExperiences,
    ...culinaryExperiences,
  ];
  const ids = listingIds('/experiences/signature');
  const signatureCollectionJsonLd = buildExperienceListingGraph({
    pageId: ids.collection,
    itemListId: ids.itemList,
    breadcrumbId: ids.breadcrumbs,
    path: ids.canonical,
    title: 'Signature Experiences',
    description:
      'Each encounter is composed around culture, place and narrative. Discover the CREARE Signature collection.',
    breadcrumbs: [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Experiences', url: buildCanonicalUrl('/experiences') },
      { name: 'Signature Experiences', url: ids.canonical },
    ],
    items: visibleExperienceCards.map((exp) => ({
      title: exp.title,
      slug: exp.slug,
      url: exp.slug ? `${SITE_URL}/experiences/${exp.slug}` : undefined,
      description: exp.destination?.name ?? exp.location_label,
      image: exp.cover_image,
      category: exp.category,
      series: exp.series,
      destinationName: exp.destination?.name ?? exp.location_label ?? null,
    })),
  });

  const hasLowerSeriesContent =
    historicalExperiences.length > 0 ||
    corporateLayerExperiences.length > 0 ||
    culinaryExperiences.length > 0;

  return (
    <main data-signature-page>
      <JsonLd id="signature-collection-jsonld" schema={signatureCollectionJsonLd} />
      <style>{`
        body:has(main[data-signature-page]) header button[aria-label*='navigation menu'] svg path {
          stroke: currentColor !important;
        }
      `}</style>
      {/* ── HERO ── */}
      <section className="relative flex h-screen min-h-[600px] w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1649624597043-832bcae41fd2"
            alt="Opulent chandelier-lit ballroom with gilded architecture and warm candlelight"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/40" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <p className="mb-8 font-body text-[0.6rem] uppercase tracking-[0.35em] text-white/55">
            CREARE
          </p>
          <h1
            className="mb-10 font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
          >
            Signature Experiences
          </h1>
          <p className="mb-16 max-w-[280px] font-body text-sm font-light tracking-wide text-white/65">
            Curated encounters shaped by culture, place and narrative.
          </p>
          <div className="flex flex-col items-center gap-3">
            <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-white/50">
              EXPLORE
            </span>
            <div className="h-10 w-px bg-white/25" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── INTRO TEXT BLOCK ── */}
      <section className="bg-[#EDEAE4] pb-10 pt-28 md:pb-14 md:pt-36" aria-label="Introduction">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <nav className="mb-16" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-500 uppercase hover:text-neutral-800 transition-colors"
                >
                  ← HOME
                </Link>
              </li>
              <li aria-hidden="true">
                <span className="font-body text-[0.6rem] text-neutral-400 mx-1">/</span>
              </li>
              <li>
                <span className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-800 uppercase">
                  SIGNATURE EXPERIENCES
                </span>
              </li>
            </ol>
          </nav>

          <nav className="mb-12" aria-label="Destinations">
            <p className="mb-4 font-body text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400/80">
              Destinations
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {strapiDestinations.length > 0 ? (
                strapiDestinations.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/destinations/${dest.slug}`}
                    className="font-body text-[0.7rem] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:text-neutral-900 underline underline-offset-2"
                  >
                    {dest.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/destinations/istanbul"
                    className="font-body text-[0.7rem] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:text-neutral-900 underline underline-offset-2"
                  >
                    Istanbul
                  </Link>
                  <Link
                    href="/destinations/cappadocia"
                    className="font-body text-[0.7rem] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:text-neutral-900 underline underline-offset-2"
                  >
                    Cappadocia
                  </Link>
                  <span className="font-body text-[0.7rem] uppercase tracking-[0.15em] text-neutral-600">
                    Aegean
                  </span>
                </>
              )}
            </div>
          </nav>

          <div className="mx-auto max-w-xl text-center">
            <p
              className="font-display font-light leading-[1.9] text-neutral-800"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Each encounter is composed around culture, place and narrative.
            </p>
            <p
              className="mt-1 font-display font-light leading-[1.9] text-neutral-800"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Not itineraries, but designed experiences.
            </p>
            <p
              className="mt-5 font-body font-light tracking-wide text-neutral-500"
              style={{ fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)' }}
            >
              Built from years of access, relationships and creative intelligence, and rooted in the
              cultural worlds of{' '}
              <Link
                href="/cultural-worlds/istanbul"
                className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
              >
                Istanbul
              </Link>
              ,{' '}
              <Link
                href="/cultural-worlds/cappadocia"
                className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
              >
                Cappadocia
              </Link>
              , and the <span className="underline underline-offset-2">Aegean</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ── PAUSE MOMENT: "Selected. Not discovered." ── */}
      <div
        className="flex items-center justify-center bg-[#EDEAE4] py-16 md:py-20"
        aria-hidden="true"
      >
        <p
          className="text-center font-body uppercase tracking-[0.18em]"
          style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)', color: 'rgba(94,88,81,0.62)' }}
        >
          Selected. Not discovered.
        </p>
      </div>

      {/* ── SELECTED SIGNATURE EXPERIENCES ── */}
      {selectedSignatureExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pb-32 md:pb-44"
          aria-label="Selected Signature Experiences"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20">
              {selectedSignatureExperiences.map((exp) => renderExperienceCard(exp))}
            </div>
          </div>
        </section>
      )}

      {historicalExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pb-28 pt-24 md:pb-36 md:pt-32"
          aria-label="CREARE Historical Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="mx-auto mb-18 max-w-[48rem] text-center md:mb-20">
              <p className="mb-5 font-body text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400/76">
                CREARE HISTORICAL SERIES™
              </p>
              <h2
                className="font-display font-light leading-tight text-neutral-900"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Historical Series
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-24">
              {historicalExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {corporateLayerExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pb-32 pt-[7rem] md:pb-40 md:pt-[8.5rem]"
          aria-label="CREARE Corporate Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="mb-16 h-px w-full bg-[#c8c2b8]/60 md:mb-20" aria-hidden="true" />
            <div className="mx-auto mb-18 max-w-[50rem] text-center md:mb-20">
              <p
                className="mb-5 font-body text-[0.6rem] uppercase tracking-[0.3em]"
                style={{ color: 'rgba(108,101,93,0.72)' }}
              >
                CREARE CORPORATE SERIES™
              </p>
              <h2
                className="font-display font-light leading-tight text-neutral-900"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Performance Experiences
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-24">
              {corporateLayerExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {culinaryExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pb-28 pt-16 md:pb-36 md:pt-24"
          aria-label="CREARE Culinary Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-18 md:mb-20">
              <p className="mb-5 font-body text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400/76">
                CREARE CULINARY SERIES™
              </p>
              <h2
                className="font-display font-light leading-tight text-neutral-900"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Culinary Series
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-24">
              {culinaryExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {hasLowerSeriesContent && (
        <section className="bg-black" aria-label="Signature contact handoff">
          <div className="max-w-7xl mx-auto px-6 pb-0 pt-16 sm:px-10 md:pt-20 lg:px-16">
            <div className="flex flex-col gap-8 pb-12 md:pb-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-light leading-[1.15] text-white">
                Begin the conversation.
              </h2>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-white/16 px-6 py-3 font-body text-[0.62rem] uppercase tracking-[0.24em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                CONTACT CREARE →
              </Link>
            </div>
            <div className="h-px w-full bg-white/10" aria-hidden="true" />
          </div>
        </section>
      )}
    </main>
  );
}
