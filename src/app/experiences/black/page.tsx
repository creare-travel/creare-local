import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { buildCanonicalUrl, buildExperienceListingGraph, listingIds } from '@/lib/schema-builder';
import { buildExperienceInquiryHref } from '@/lib/inquiry';
import { buildMetadataAlternates } from '@/lib/seo';
import { fetchStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'BLACK™ — Private Access',
  description:
    'Invitation-only. Rare access. Discreet execution. CREARE BLACK™ is reserved for those for whom exclusivity is not a preference — it is a requirement.',
  alternates: buildMetadataAlternates('/experiences/black'),
  robots: { index: false, follow: false },
  openGraph: {
    title: 'CREARE BLACK™ — Private Access',
    description: 'Invitation-only. Rare access. Discreet execution.',
    url: 'https://crearetravel.com/experiences/black',
  },
};

interface StrapiCoverImage {
  url?: string;
  alternativeText?: string;
  formats?: {
    medium?: { url?: string };
    small?: { url?: string };
  };
}

interface StrapiExperience {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  short_description?: string;
  category?: string;
  geo_experience_type?: string | null;
  mood?: string | null;
  intensity?: string | null;
  location_label?: string;
  duration?: string;
  destination?: {
    name?: string;
    slug?: string;
  };
  cover_image?: StrapiCoverImage | null;
}

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
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

function getGeoMetadataLine(exp: StrapiExperience) {
  return [
    toTitleCase(exp.geo_experience_type),
    formatIntensity(exp.intensity),
    toTitleCase(exp.mood),
  ]
    .filter(Boolean)
    .join(' · ');
}

async function fetchBlackExperiences(): Promise<StrapiExperience[]> {
  try {
    const json = await fetchStrapi('/api/experiences?filters[category][$eqi]=black&populate=*');
    const items: StrapiExperience[] = Array.isArray(json?.data) ? json.data : [];
    return items;
  } catch (error) {
    console.error('Failed to fetch BLACK experiences from Strapi.', error);
    return [];
  }
}

export default async function BlackPage() {
  const blackExperiences = await fetchBlackExperiences();
  const ids = listingIds('/experiences/black');
  const blackSchemaGraph = buildExperienceListingGraph({
    pageId: ids.collection,
    itemListId: ids.itemList,
    breadcrumbId: ids.breadcrumbs,
    path: ids.canonical,
    title: 'BLACK Experiences',
    description:
      'Invitation-only private access, rare encounters, and discreet cultural compositions for select clients.',
    breadcrumbs: [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Experiences', url: buildCanonicalUrl('/experiences') },
      { name: 'BLACK Experiences', url: ids.canonical },
    ],
    items: blackExperiences.map((exp) => ({
      title: exp.title,
      slug: exp.slug,
      url: exp.slug ? buildCanonicalUrl(`/experiences/${exp.slug}`) : undefined,
      description: exp.short_description,
      image: exp.cover_image ?? undefined,
      category: exp.category,
      destinationName: exp.destination?.name ?? exp.location_label ?? null,
    })),
  });

  return (
    <>
      <JsonLd id="black-collection-jsonld" schema={blackSchemaGraph} />
      <style>{`
        header button[aria-label='Open navigation menu'] svg path,
        header button[aria-label='Close navigation menu'] svg path {
          stroke: currentColor !important;
        }
      `}</style>
      <main>
        {/* ── HERO — Full-bleed dark with grain ── */}
        <section
          className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d0d0b]"
          aria-label="CREARE BLACK™ hero"
        >
          {/* Grain texture overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              opacity: 0.14,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
            }}
          />

          {/* Dark vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(28,26,22,0.0) 0%, rgba(8,8,6,0.72) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            {/* Micro-line above title */}
            <p className="mb-10 font-body text-[0.58rem] uppercase tracking-[0.42em] text-white/22">
              By invitation.
            </p>

            <h1 className="mb-10 font-display text-[clamp(3.2rem,7vw,6.5rem)] font-light leading-[1.08] tracking-[-0.01em] text-white">
              BLACK™
            </h1>

            <p className="mb-20 font-display text-[clamp(0.72rem,1.2vw,0.9rem)] font-light leading-[1.9] text-white/38">
              Beyond the expected.
              <br />
              Where privilege is carefully composed.
            </p>

            <Link
              href={buildExperienceInquiryHref('black')}
              className="border border-white/14 px-12 py-5 font-body text-[0.58rem] uppercase tracking-[0.35em] text-white/45 transition-all duration-500 hover:border-white/28 hover:text-white/65"
              style={{
                minWidth: '19rem',
              }}
            >
              Submit Private Inquiry
            </Link>
          </div>
        </section>

        {/* ── BREADCRUMB + MANIFESTO ── */}
        <section className="bg-[#EAEAE5]" aria-label="Access statement">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 pt-24 sm:px-10 md:min-h-screen md:pt-32 lg:px-16">
            {/* Breadcrumb */}
            <nav className="mb-20" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href="/"
                    className="font-body text-[0.6rem] uppercase tracking-[0.22em] transition-colors"
                    style={{ color: '#b0aa9f' }}
                  >
                    ← HOME
                  </Link>
                </li>
                <li aria-hidden="true">
                  <span className="mx-1 font-body text-[0.6rem]" style={{ color: '#c8c2b8' }}>
                    /
                  </span>
                </li>
                <li>
                  <span
                    className="font-body text-[0.6rem] uppercase tracking-[0.22em]"
                    style={{ color: '#6b6560' }}
                  >
                    BLACK™
                  </span>
                </li>
              </ol>
            </nav>

            <div className="flex flex-1 flex-col justify-center">
              {/* Short sharp lines */}
              <div className="space-y-8 text-center">
                <p
                  className="font-display text-[clamp(0.95rem,1.6vw,1.15rem)] font-light italic leading-loose"
                  style={{ color: '#5c5750' }}
                >
                  Not publicly listed. Access is not open.
                </p>
                <p
                  className="font-display text-[clamp(0.9rem,1.5vw,1.05rem)] font-light"
                  style={{ color: '#5c5750' }}
                >
                  Selected work remains unseen.
                </p>
                <p
                  className="font-display text-[clamp(0.9rem,1.5vw,1.05rem)] font-light"
                  style={{ color: '#5c5750' }}
                >
                  What we arrange is not found. What we curate is not listed.
                </p>
              </div>
            </div>

            <div className="pb-16 md:pb-20">
              <p
                className="text-center font-display text-[clamp(0.8rem,1.3vw,0.95rem)] font-light tracking-[0.22em]"
                aria-hidden="true"
                style={{ color: '#9e9890' }}
              >
                Not everything is meant to be accessed.
              </p>
              <hr
                className="mt-16 border-t md:mt-20"
                style={{ borderColor: 'rgba(200,194,184,0.6)' }}
              />
            </div>
          </div>
        </section>

        {/* ── BLACK™ EXPERIENCE DIMENSIONS ── */}
        <section className="bg-[#EAEAE5]" aria-label="Experience Dimensions">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-16 sm:px-10 md:min-h-screen md:py-20 lg:px-16">
            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-24 text-center">
                <h2
                  className="font-display text-[clamp(1.18rem,2.15vw,1.72rem)] font-light tracking-[0.01em]"
                  style={{ color: '#5c5650' }}
                >
                  BLACK™ Experience Dimensions
                </h2>
              </div>

              {/* 2×3 Grid — reduced border contrast, increased spacing, lower opacity */}
              <div className="mx-auto grid max-w-[40rem] grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3 lg:max-w-[42rem]">
                {[
                  'Private Venues',
                  'After-Hours Access',
                  'Curator-Led Experiences',
                  'Closed Collections',
                  'Invitation-Only Events',
                  'Bespoke Cultural Programming',
                ].map((item, i) => (
                  <div
                    key={item}
                    className={`bg-white/15 px-10 py-14 text-center ${i >= 3 ? '-mt-px' : ''} ${i % 3 !== 0 ? '-ml-px' : ''}`}
                    style={{ border: '1px solid rgba(212,207,198,0.5)' }}
                  >
                    <p
                      className="font-display text-[clamp(0.78rem,1.2vw,0.9rem)] font-light leading-[1.7]"
                      style={{ color: '#6b6560' }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-t" style={{ borderColor: 'rgba(200,194,184,0.6)' }} />
          </div>
        </section>

        {/* ── ACCESS PRINCIPLES ── */}
        <section className="bg-[#EAEAE5]" aria-label="Access Principles">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-16 text-center sm:px-10 md:min-h-screen md:py-20 lg:px-16">
            <div className="flex flex-1 flex-col justify-center">
              <h2
                className="mb-24 font-display text-[clamp(1.2rem,2.2vw,1.75rem)] font-light tracking-[0.01em]"
                style={{ color: '#4a4540' }}
              >
                Access Principles
              </h2>

              <div className="space-y-14">
                {[
                  'Referral-based access',
                  'Private consultation',
                  'Discreet execution',
                  'Confidential delivery',
                ].map((principle) => (
                  <p
                    key={principle}
                    className="font-display text-[clamp(0.88rem,1.4vw,1.02rem)] font-light leading-[1.85]"
                    style={{ color: '#6b6560' }}
                  >
                    {principle}
                  </p>
                ))}
              </div>
            </div>

            <hr className="border-t" style={{ borderColor: 'rgba(200,194,184,0.6)' }} />
          </div>
        </section>

        {/* ── HOW BLACK™ WORKS ── */}
        <section className="bg-[#EAEAE5]" aria-label="How BLACK™ Works">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-16 sm:px-10 md:min-h-screen md:py-20 lg:px-16">
            <div className="flex flex-1 flex-col justify-center">
              <div className="text-center mb-20">
                <h2
                  className="font-display text-[clamp(1.2rem,2.2vw,1.75rem)] font-light tracking-[0.01em]"
                  style={{ color: '#4a4540' }}
                >
                  How BLACK™ Works
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-16 text-center md:grid-cols-3 lg:gap-20">
                {[
                  {
                    label: 'Referral and Qualification',
                    body: 'Access is granted through trusted referrals and qualification review.',
                  },
                  {
                    label: 'Private Consultation',
                    body: 'We design experiences aligned with your interests and expectations.',
                  },
                  {
                    label: 'Confidential Execution',
                    body: 'Every detail is arranged discreetly, with full privacy and control.',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <div className="mb-7 flex items-start justify-center md:min-h-[3.1rem]">
                      <p
                        className="font-body text-[0.65rem] font-medium uppercase tracking-[0.25em]"
                        style={{ color: '#4a4540' }}
                      >
                        {item.label}
                      </p>
                    </div>
                    <p
                      className="max-w-[18ch] font-body text-[0.8rem] leading-[1.85]"
                      style={{ color: '#7a7268' }}
                    >
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-t" style={{ borderColor: 'rgba(200,194,184,0.6)' }} />
          </div>
        </section>

        {blackExperiences.length > 0 && (
          <section
            className="bg-[#EAEAE5] py-28 md:py-40"
            aria-label="BLACK experiences from the collection"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="text-center mb-20">
                <p
                  className="mb-4 font-body text-[0.58rem] uppercase tracking-[0.22em]"
                  style={{ color: '#9e9890' }}
                >
                  FROM THE COLLECTION
                </p>
                <h2
                  className="font-display font-light"
                  style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: '#4a4540' }}
                >
                  BLACK Experiences
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-x-14 lg:gap-y-24">
                {blackExperiences.map((exp) => {
                  const rawUrl =
                    exp.cover_image?.formats?.medium?.url ??
                    exp.cover_image?.formats?.small?.url ??
                    exp.cover_image?.url ??
                    null;
                  const coverUrl = rawUrl ? mediaUrl(rawUrl) : null;
                  const coverAlt = exp.cover_image?.alternativeText ?? exp.title;
                  const location = exp.destination?.name ?? exp.location_label;
                  const geoMetadata = getGeoMetadataLine(exp);
                  const href = exp.slug ? `/experiences/${exp.slug}` : null;

                  const card = (
                    <>
                      <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-neutral-900/[0.07]">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt={coverAlt}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={isLocalAssetUrl(coverUrl)}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-900/10" />
                        )}
                      </div>

                      <p
                        className="mb-3 font-body text-[0.55rem] uppercase tracking-[0.2em]"
                        style={{ color: '#9e9890' }}
                      >
                        {exp.category ?? 'BLACK'}
                      </p>
                      <h3
                        className="mb-3 font-display font-light leading-snug transition-opacity duration-300 group-hover:opacity-75"
                        style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', color: '#3e3a35' }}
                      >
                        {exp.title}
                      </h3>

                      {geoMetadata && (
                        <p className="mb-3 font-body text-[0.68rem]" style={{ color: '#6b6560' }}>
                          {geoMetadata}
                        </p>
                      )}

                      {location && (
                        <p className="mb-3 font-body text-[0.7rem]" style={{ color: '#6b6560' }}>
                          {location}
                        </p>
                      )}

                      {exp.short_description && (
                        <p
                          className="font-body text-sm leading-relaxed"
                          style={{ color: '#5c5750' }}
                        >
                          {exp.short_description}
                        </p>
                      )}

                      {exp.duration && (
                        <p
                          className="mt-4 font-body text-[0.68rem] uppercase tracking-[0.14em]"
                          style={{ color: '#6b6560' }}
                        >
                          {exp.duration}
                        </p>
                      )}
                    </>
                  );

                  return href ? (
                    <Link
                      key={exp.id}
                      href={href}
                      className="group block"
                      aria-label={`View ${exp.title}`}
                    >
                      {card}
                    </Link>
                  ) : (
                    <div key={exp.id} className="group block" aria-label={exp.title}>
                      {card}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── FINAL MANIFESTO + CTA ── */}
        <section className="bg-[#EAEAE5]" aria-label="Request Private Access">
          <div className="mx-auto flex min-h-[72vh] max-w-3xl flex-col justify-center px-6 py-20 text-center sm:px-10 md:min-h-[78vh] md:py-24 lg:px-16">
            {/* Refined manifesto */}
            <div className="space-y-6 mb-24">
              <p
                className="font-display text-[clamp(1.3rem,2.5vw,1.9rem)] font-light"
                style={{ color: '#3e3a35' }}
              >
                BLACK™ is not marketed. It is not advertised.
              </p>
              <p
                className="font-display text-[clamp(1rem,1.8vw,1.4rem)] font-light"
                style={{ color: '#5c5750' }}
              >
                It is extended — selectively.
              </p>
              <p
                className="mt-4 font-body text-sm font-light leading-relaxed"
                style={{ color: '#8c8478' }}
              >
                BLACK™ operates across the cultural worlds of{' '}
                <Link
                  href="/cultural-worlds/istanbul"
                  className="underline underline-offset-2 transition-colors hover:opacity-80"
                  style={{ color: '#5c5750' }}
                >
                  Istanbul
                </Link>{' '}
                and the <span className="underline underline-offset-2">Aegean</span> — in spaces
                that are never listed and encounters that are never described.
              </p>
            </div>

            {/* CTA button */}
            <Link
              href={buildExperienceInquiryHref('black')}
              className="group/btn relative inline-flex overflow-hidden border border-neutral-700/40 px-12 py-5 font-body text-[0.62rem] uppercase tracking-[0.32em] text-neutral-800 transition-colors duration-300 hover:text-white/80"
            >
              <span className="absolute inset-0 translate-y-full bg-neutral-800 transition-transform duration-300 group-hover/btn:translate-y-0" />
              <span className="relative z-10">Request Private Access</span>
            </Link>
          </div>
        </section>

        <section className="bg-black" aria-label="Contact handoff">
          <div className="mx-auto max-w-7xl px-6 pb-10 pt-24 sm:px-10 lg:px-16">
            <div className="flex flex-col gap-8 border-b border-white/[0.08] pb-10 md:flex-row md:items-center md:justify-between md:gap-12 md:pb-12">
              <p className="font-display text-[clamp(1.7rem,3vw,2.3rem)] font-light text-white">
                Begin the conversation.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center self-start border border-white/[0.18] px-10 py-4 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/[0.3] hover:text-white md:self-center"
              >
                CONTACT CREARE →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
