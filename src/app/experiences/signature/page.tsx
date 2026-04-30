import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

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
    (exp.cover_image as any)?.formats?.medium?.url ??
    (exp.cover_image as any)?.formats?.small?.url ??
    (exp.cover_image as any)?.url ??
    null;

  return rawUrl ? (rawUrl.startsWith('http') ? rawUrl : mediaUrl(rawUrl)) : null;
}

function renderExperienceCard(
  exp: StrapiExperience,
  options?: { compact?: boolean; offsetAfterThird?: boolean }
) {
  const coverUrl = getSeriesImage(exp);
  const coverAlt = exp.cover_image?.alternativeText ?? exp.title;
  const compact = options?.compact ?? false;

  return (
    <Link
      key={exp.id}
      href={`/experiences/${exp.slug}`}
      className={`group block ${options?.offsetAfterThird ? 'mt-6' : ''}`}
      aria-label={`View ${exp.title}`}
    >
      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] mb-5">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            className="object-cover scale-[1.03] origin-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={coverUrl.startsWith('http://localhost')}
          />
        ) : (
          <div className="w-full h-full bg-neutral-200" />
        )}
      </div>

      <p className="font-body text-[0.55rem] tracking-[0.28em] text-neutral-400 uppercase mb-2">
        {exp.series
          ? `${exp.category ?? 'SIGNATURE'} / ${exp.series}`
          : (exp.category ?? 'SIGNATURE')}
      </p>

      <h3
        className="font-display font-light text-neutral-900 leading-snug mb-2 group-hover:opacity-70 transition-opacity duration-300"
        style={{ fontSize: compact ? 'clamp(1rem, 1.6vw, 1.15rem)' : 'clamp(1rem, 1.8vw, 1.2rem)' }}
      >
        {exp.title}
      </h3>

      {!compact && (exp.destination?.name || exp.location_label) && (
        <p className="font-body text-[0.7rem] text-neutral-500">
          {exp.destination?.name ?? exp.location_label}
        </p>
      )}
    </Link>
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

  return (
    <main>
      {/* ── HERO ── */}
      <section className="relative w-full h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1649624597043-832bcae41fd2"
            alt="Opulent chandelier-lit ballroom with gilded architecture and warm candlelight"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Deeper gradient for stronger cinematic contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/40" />
          {/* Radial vignette for atmospheric depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)',
            }}
          />
        </div>

        {/* Centered content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <p className="font-body text-[0.6rem] tracking-[0.35em] text-white/70 uppercase mb-8">
            CREARE
          </p>
          <h1
            className="font-display font-light text-white leading-tight mb-10"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
          >
            Signature Experiences
          </h1>
          {/* Tighter max-width for subtext — more cinematic */}
          <p className="font-body font-light text-white/65 text-sm tracking-wide max-w-[280px] mb-16">
            Curated encounters shaped by culture, place and narrative.
          </p>
          {/* EXPLORE scroll CTA */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-body text-[0.6rem] tracking-[0.3em] text-white/50 uppercase">
              EXPLORE
            </span>
            <div className="w-px h-10 bg-white/25" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── INTRO TEXT BLOCK ── */}
      <section className="bg-[#EDEAE4] pt-28 md:pt-36 pb-10 md:pb-14" aria-label="Introduction">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Breadcrumb */}
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

          {/* Destinations top links — CMS-driven with static fallback */}
          <nav className="mb-12" aria-label="Destinations">
            <p className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
              Destinations
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {strapiDestinations.length > 0 ? (
                strapiDestinations.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/destinations/${dest.slug}`}
                    className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase hover:text-neutral-900 transition-colors underline underline-offset-2"
                  >
                    {dest.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/destinations/istanbul"
                    className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase hover:text-neutral-900 transition-colors underline underline-offset-2"
                  >
                    Istanbul
                  </Link>
                  <Link
                    href="/destinations/cappadocia"
                    className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase hover:text-neutral-900 transition-colors underline underline-offset-2"
                  >
                    Cappadocia
                  </Link>
                  <span className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase">
                    Aegean
                  </span>
                </>
              )}
            </div>
          </nav>

          {/* Simplified 3-line intro — editorial, broken rhythm */}
          <div className="max-w-xl mx-auto text-center">
            <p
              className="font-display font-light text-neutral-800 leading-[1.9]"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Each encounter is composed around culture, place and narrative.
            </p>
            <p
              className="font-display font-light text-neutral-800 leading-[1.9] mt-1"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Not itineraries — but designed experiences.
            </p>
            {/* Third line: smaller, lighter — supporting note */}
            <p
              className="font-body font-light text-neutral-500 tracking-wide mt-5"
              style={{ fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)' }}
            >
              Built from years of access, relationships and creative intelligence — rooted in the
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
        className="bg-[#EDEAE4] py-16 md:py-20 flex items-center justify-center"
        aria-hidden="true"
      >
        <p
          className="font-body tracking-[0.28em] text-neutral-700 uppercase text-center"
          style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)', opacity: 0.65 }}
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
            <div className="text-center mb-20">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-5">
                CREARE SIGNATURE™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Selected Signature Experiences
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 lg:gap-x-10 lg:gap-y-20">
              {selectedSignatureExperiences.map((exp, index) =>
                renderExperienceCard(exp, { offsetAfterThird: index >= 3 })
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CORPORATE SERIES SECTION ── */}
      {historicalExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pt-28 md:pt-36 pb-28 md:pb-36"
          aria-label="CREARE Historical Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-5">
                CREARE HISTORICAL SERIES™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Historical Series
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-x-14 lg:gap-y-24">
              {historicalExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {/* ── CORPORATE SERIES SECTION ── */}
      {corporateExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pt-28 md:pt-36 pb-28 md:pb-36"
          aria-label="CREARE Corporate Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            {/* Section heading */}
            <div className="text-center mb-20">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-5">
                CREARE CORPORATE SERIES™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Corporate Series
              </h2>
            </div>

            {/* Corporate grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-x-14 lg:gap-y-24">
              {corporateExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {/* ── CULINARY SERIES SECTION ── */}
      {culinaryExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pt-12 md:pt-20 pb-28 md:pb-36"
          aria-label="CREARE Culinary Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-5">
                CREARE CULINARY SERIES™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Culinary Series
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-x-14 lg:gap-y-24">
              {culinaryExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
