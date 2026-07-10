import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import { filterPublicExperiences } from '@/lib/canonical-gates';
import { buildCanonicalUrl, buildExperienceListingGraph, listingIds } from '@/lib/schema-builder';
import {
  experiences as staticExperiences,
  getPublicLocalExperienceFallbacks,
} from '@/lib/experiences';
import {
  isTurkishPublicLaunch,
  logPublicContentIssue,
  shouldUsePublicStaticEnglishFallbacks,
} from '@/lib/public-content';
import { buildMetadataAlternates } from '@/lib/seo';
import { fetchPublicStrapi, mediaUrl } from '@/lib/strapi';

const SITE_URL = 'https://crearetravel.com';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Signature Deneyimleri',
  description:
    'Her karşılaşma kültür, yer ve anlatı etrafında kurgulanır. CREARE Signature koleksiyonunu keşfedin.',
  alternates: buildMetadataAlternates('/experiences/signature'),
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Signature Deneyimleri — CREARE',
    description: 'Her karşılaşma kültür, yer ve anlatı etrafında kurgulanır.',
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
  visibility_status?: string;
  publishedAt?: string | null;
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
    low: 'Düşük Yoğunluk',
    medium: 'Orta Yoğunluk',
    high: 'Yüksek Yoğunluk',
  };

  return intensityMap[normalized] ?? `${toTitleCase(value)} Yoğunluk`;
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
      <div className="relative mb-6 w-full overflow-hidden rounded-[16px] aspect-[4/3] lg:mb-2 lg:aspect-[61/50]">
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

      <p className="mb-3 font-body text-[0.55rem] uppercase tracking-[0.2em] text-neutral-400/75">
        {exp.series
          ? `${exp.category ?? 'SIGNATURE'} / ${exp.series}`
          : (exp.category ?? 'SIGNATURE')}
      </p>

      <h3
        className="mb-3 font-display font-light leading-snug text-neutral-900 transition-opacity duration-300 group-hover:opacity-70"
        style={{ fontSize: compact ? 'clamp(1rem, 1.6vw, 1.15rem)' : 'clamp(1rem, 1.8vw, 1.2rem)' }}
      >
        {exp.title}
      </h3>

      {geoMetadata && (
        <p className="mb-3 font-body text-[0.68rem] text-neutral-500/75">{geoMetadata}</p>
      )}

      {!compact && (exp.destination?.name || exp.location_label) && (
        <p className="font-body text-[0.7rem] text-neutral-500">
          {exp.destination?.name ?? exp.location_label}
        </p>
      )}
    </>
  );

  return href ? (
    <Link
      key={exp.id}
      href={href}
      className="group block"
      aria-label={`${exp.title} deneyimini görüntüle`}
    >
      {card}
    </Link>
  ) : (
    <div key={exp.id} className="group block" aria-label={exp.title}>
      {card}
    </div>
  );
}

function buildStaticPerformanceFallback(): StrapiExperience[] {
  if (!shouldUsePublicStaticEnglishFallbacks()) {
    return [];
  }

  const unavailablePerformanceSlugs = new Set([
    'golden-horn-regatta',
    'princes-islands-regatta',
    'driven-by-performance',
  ]);

  return staticExperiences
    .filter((experience) => experience.category === 'PERFORMANCE')
    .filter((experience) => !unavailablePerformanceSlugs.has(experience.slug))
    .map((experience, index) => ({
      id: 1000 + index,
      title: experience.title,
      slug: experience.slug,
      location_label: experience.location,
      category: 'performance',
      series: 'corporate',
      geo_experience_type: experience.category,
      cover_image: {
        url: experience.heroImage,
        alternativeText: experience.heroImageAlt,
      },
    }));
}

function buildStaticSignatureFallback(): StrapiExperience[] {
  if (!shouldUsePublicStaticEnglishFallbacks()) {
    return [];
  }

  return getPublicLocalExperienceFallbacks()
    .filter((experience) => experience.slug === 'istanbul-through-the-lens')
    .filter((experience) => experience.category === 'SIGNATURE')
    .map((experience, index) => ({
      id: 2000 + index,
      title: experience.title,
      slug: experience.slug,
      location_label: experience.location,
      category: 'signature',
      geo_experience_type: experience.category,
      destination: experience.culturalWorld
        ? {
            id: 5000 + index,
            name: experience.culturalWorld,
            slug: experience.culturalWorld.toLowerCase(),
          }
        : undefined,
      cover_image: {
        url: experience.heroImage,
        alternativeText: experience.heroImageAlt,
      },
    }));
}

// ── Strapi fetch helpers ──────────────────────────────────────────────────────
async function fetchStrapiDestinations(): Promise<StrapiDestination[]> {
  try {
    const json = await fetchPublicStrapi('/api/destinations?populate=*');
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    logPublicContentIssue('Signature destinations unavailable in public locale.', { error });
    return [];
  }
}

async function fetchStrapiSignatureExperiences(): Promise<StrapiExperience[]> {
  try {
    const json = await fetchPublicStrapi(
      '/api/experiences?filters[category][$eqi]=signature&populate=*'
    );
    const all: StrapiExperience[] = Array.isArray(json?.data) ? json.data : [];

    if (!all.length) {
      return [];
    }

    return filterPublicExperiences(
      all
        .filter((exp) => normalizeValue(exp.category) === SIGNATURE_CATEGORY)
        .sort((a, b) => {
          const aOrder = a.order ?? Infinity;
          const bOrder = b.order ?? Infinity;
          return aOrder - bOrder;
        })
    );
  } catch (error) {
    logPublicContentIssue('Signature experiences unavailable in public locale.', { error });
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
  const staticSignatureFallback = buildStaticSignatureFallback();
  const signatureExperienceMap = new Map<string, StrapiExperience>();

  for (const experience of [...selectedSignatureExperiences, ...staticSignatureFallback]) {
    if (experience.slug && !signatureExperienceMap.has(experience.slug)) {
      signatureExperienceMap.set(experience.slug, experience);
    }
  }

  const visibleSelectedSignatureExperiences = Array.from(signatureExperienceMap.values());
  const historicalExperiences = strapiSignatureExperiences.filter(
    (exp) => normalizeValue(exp.series) === SIGNATURE_SERIES.historical
  );
  const cmsCorporateExperiences = strapiSignatureExperiences.filter(
    (exp) => normalizeValue(exp.series) === SIGNATURE_SERIES.corporate
  );
  const culinaryExperiences = strapiSignatureExperiences.filter(
    (exp) => normalizeValue(exp.series) === SIGNATURE_SERIES.culinary
  );
  const corporateExperiences =
    cmsCorporateExperiences.length > 0 || isTurkishPublicLaunch()
      ? cmsCorporateExperiences
      : buildStaticPerformanceFallback();
  const visibleExperienceCards = [
    ...visibleSelectedSignatureExperiences,
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
    title: 'Signature Deneyimleri',
    description:
      'Her karşılaşma kültür, yer ve anlatı etrafında kurgulanır. CREARE Signature koleksiyonunu keşfedin.',
    breadcrumbs: [
      { name: 'Ana Sayfa', url: buildCanonicalUrl('/') },
      { name: 'Deneyimler', url: buildCanonicalUrl('/experiences') },
      { name: 'Signature Deneyimleri', url: ids.canonical },
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

  return (
    <main>
      <JsonLd id="signature-collection-jsonld" schema={signatureCollectionJsonLd} />
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
          <p className="font-body text-[0.58rem] tracking-[0.24em] text-white/55 uppercase mb-8">
            CREARE
          </p>
          <h1
            className="font-display font-light text-white leading-tight mb-10"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
          >
            Signature Deneyimleri
          </h1>
          {/* Tighter max-width for subtext — more cinematic */}
          <p className="font-body font-light text-white/65 text-sm tracking-wide max-w-[280px] mb-16">
            Kültür, yer ve anlatı etrafında şekillenen küratörlü karşılaşmalar.
          </p>
          {/* EXPLORE scroll CTA */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-body text-[0.6rem] tracking-[0.3em] text-white/50 uppercase">
              KEŞFET
            </span>
            <div className="w-px h-10 bg-white/25" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── INTRO TEXT BLOCK ── */}
      <section className="bg-[#EDEAE4] pt-28 md:pt-36 pb-12 md:pb-16" aria-label="Introduction">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Breadcrumb */}
          <nav className="mb-16" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-500 uppercase hover:text-neutral-800 transition-colors"
                >
                  ← ANA SAYFA
                </Link>
              </li>
              <li aria-hidden="true">
                <span className="font-body text-[0.6rem] text-neutral-400 mx-1">/</span>
              </li>
              <li>
                <span className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-800 uppercase">
                  SIGNATURE DENEYİMLERİ
                </span>
              </li>
            </ol>
          </nav>

          {/* Destinations top links — CMS-driven with static fallback */}
          <nav className="mb-12" aria-label="Destinations">
            <p className="font-body text-[0.55rem] tracking-[0.22em] text-neutral-400/80 uppercase mb-4">
              Kültürel Dünyalar
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {strapiDestinations.length > 0 ? (
                strapiDestinations.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/cultural-worlds/${dest.slug}`}
                    className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase hover:text-neutral-900 transition-colors underline underline-offset-2"
                  >
                    {dest.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/cultural-worlds/istanbul"
                    className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase hover:text-neutral-900 transition-colors underline underline-offset-2"
                  >
                    İstanbul
                  </Link>
                  <Link
                    href="/cultural-worlds/cappadocia"
                    className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase hover:text-neutral-900 transition-colors underline underline-offset-2"
                  >
                    Kapadokya
                  </Link>
                  <span className="font-body text-[0.7rem] tracking-[0.15em] text-neutral-600 uppercase">
                    Ege
                  </span>
                </>
              )}
            </div>
          </nav>

          {/* Simplified 3-line intro — editorial, broken rhythm */}
          <div className="max-w-xl mx-auto text-center">
            <h2
              className="font-display font-light text-neutral-800 leading-[1.9]"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Her karşılaşma kültür, yer ve anlatı etrafında kurgulanır.
            </h2>
            <p
              className="font-display font-light text-neutral-800 leading-[1.9] mt-1"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Rotalar değil; özenle tasarlanmış karşılaşmalar.
            </p>
            {/* Third line: smaller, lighter — supporting note */}
            <p
              className="font-body font-light text-neutral-500 tracking-wide mt-5"
              style={{ fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)' }}
            >
              Yıllara yayılan erişim, ilişkiler ve yaratıcı zekâdan doğar; kültürel dünyaları içinde
              kök salar:{' '}
              <Link
                href="/cultural-worlds/istanbul"
                className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
              >
                İstanbul
              </Link>
              ,{' '}
              <Link
                href="/cultural-worlds/cappadocia"
                className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
              >
                Kapadokya
              </Link>
              , ve <span className="underline underline-offset-2">Ege</span>.
            </p>
            <p
              className="mx-auto mt-8 max-w-2xl font-body text-sm leading-relaxed text-neutral-600"
              style={{ fontSize: 'clamp(0.9rem, 1.2vw, 0.98rem)' }}
            >
              Signature, CREARE&apos;nin yazarlı katmanıdır: önceden kurgulanan ama yerin yaşayan
              zekâsına dayanan kültürel deneyimler. Her biri; yerel bilgi, sınanmış ilişkiler ve bir
              anı yalnız erişimin ötesinde anlamlı kılan koşullara dair açık bir kavrayışla inşa
              edilir.
            </p>
            <p
              className="mx-auto mt-5 max-w-2xl font-body text-sm leading-relaxed text-neutral-600"
              style={{ fontSize: 'clamp(0.9rem, 1.2vw, 0.98rem)' }}
            >
              Amaç durak biriktirmek değil; mekân, ev sahibi, anlatı ve misafir arasında süreklilik
              kurmaktır. Kültür burada bir performans ya da dekor olarak değil; emanetçilik, hafıza
              ve bir yeri içeriden taşımayı sürdüren insanlar tarafından şekillenen yaşayan bir
              sistem olarak ele alınır.
            </p>
            <p
              className="mx-auto mt-5 max-w-2xl font-body text-sm leading-relaxed text-neutral-600"
              style={{ fontSize: 'clamp(0.9rem, 1.2vw, 0.98rem)' }}
            >
              Signature deneyimini ayrıksı kılan da budur. Derinlemesine anlaşılmış bir kültürel
              dünyaya kurgulanmış bir giriş sunar; böylece karşılaşma gezip görmeden değil tanımadan
              başlayabilir ve erişim teşhirden değil bağlamdan doğabilir.
            </p>
          </div>
        </div>
      </section>

      {/* ── PAUSE MOMENT: "Selected. Not discovered." ── */}
      <div
        className="bg-[#EDEAE4] flex items-center justify-center py-[4.5rem] md:py-[5.5rem]"
        aria-hidden="true"
      >
        <p
          className="text-center font-body uppercase tracking-[0.18em]"
          style={{
            fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
            color: 'rgba(26,26,24,0.38)',
          }}
        >
          Seçilmiş. Tesadüfen bulunmuş değil.
        </p>
      </div>

      {/* ── SELECTED SIGNATURE EXPERIENCES ── */}
      {visibleSelectedSignatureExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pb-36 md:pb-48"
          aria-label="Seçilmiş Signature deneyimleri"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
              {visibleSelectedSignatureExperiences.map((exp) => renderExperienceCard(exp))}
            </div>
          </div>
        </section>
      )}

      {/* ── CORPORATE SERIES SECTION ── */}
      {historicalExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pt-32 md:pt-40 pb-32 md:pb-40"
          aria-label="CREARE Historical Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-18 md:mb-20">
              <p className="font-body text-[0.58rem] tracking-[0.22em] text-neutral-400/80 uppercase mb-5">
                CREARE HISTORICAL SERIES™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Tarih Serisi
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-16">
              {historicalExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {/* ── CORPORATE SERIES SECTION ── */}
      {corporateExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pt-[7.5rem] md:pt-[9.5rem] pb-32 md:pb-40"
          aria-label="CREARE Corporate Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            {/* Section heading */}
            <div className="text-center mb-18 md:mb-20">
              <p className="font-body text-[0.58rem] tracking-[0.22em] text-neutral-400/80 uppercase mb-5">
                CREARE CORPORATE SERIES™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Kurumsal Seri
              </h2>
            </div>

            {/* Corporate grid */}
            <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-16">
              {corporateExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}

      {/* ── CULINARY SERIES SECTION ── */}
      {culinaryExperiences.length > 0 && (
        <section
          className="bg-[#EDEAE4] pt-16 md:pt-24 pb-32 md:pb-40"
          aria-label="CREARE Culinary Series"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-18 md:mb-20">
              <p className="font-body text-[0.58rem] tracking-[0.22em] text-neutral-400/80 uppercase mb-5">
                CREARE CULINARY SERIES™
              </p>
              <h2
                className="font-display font-light text-neutral-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
              >
                Mutfak Serisi
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-16">
              {culinaryExperiences.map((exp) => renderExperienceCard(exp, { compact: true }))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
