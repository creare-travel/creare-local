import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { buildCanonicalUrl, buildExperienceListingGraph, listingIds } from '@/lib/schema-builder';
import { fetchStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'BLACK™ — Private Access',
  description:
    'Invitation-only. Rare access. Discreet execution. CREARE BLACK™ is reserved for those for whom exclusivity is not a preference — it is a requirement.',
  alternates: { canonical: 'https://crearetravel.com/experiences/black' },
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
      <main>
        {/* ── HERO — Full-bleed dark with grain ── */}
        <section
          className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]"
          aria-label="CREARE BLACK™ hero"
        >
          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
            }}
          />

          {/* Dark vignette */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.7)_100%)]"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            {/* Micro-line above title */}
            <p className="font-body uppercase tracking-[0.35em] text-white/30 mb-10 text-[0.6rem]">
              By invitation.
            </p>

            <h1 className="font-display font-light text-white mb-10 tracking-wide text-[clamp(3.5rem,8vw,7rem)] leading-[1.15]">
              BLACK™
            </h1>

            <p className="font-display font-light text-white/45 leading-loose mb-20 text-[clamp(0.75rem,1.3vw,0.95rem)]">
              Beyond the expected.
              <br />
              Where privilege is carefully composed.
            </p>

            <Link
              href="/contact?source=experience&slug=black&exp=black"
              className="font-body text-[0.6rem] tracking-[0.3em] text-white/60 uppercase border border-white/20 px-10 py-4 hover:border-white/40 hover:text-white/80 transition-all duration-500"
            >
              Submit Private Inquiry
            </Link>
          </div>
        </section>

        {/* ── BREADCRUMB + MANIFESTO ── */}
        <section className="bg-[#EAEAE5] py-28 md:py-40" aria-label="Access statement">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            {/* Breadcrumb */}
            <nav className="mb-20" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href="/"
                    className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-400 uppercase hover:text-neutral-700 transition-colors"
                  >
                    ← HOME
                  </Link>
                </li>
                <li aria-hidden="true">
                  <span className="font-body text-[0.6rem] text-neutral-300 mx-1">/</span>
                </li>
                <li>
                  <span className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-600 uppercase">
                    BLACK™
                  </span>
                </li>
              </ol>
            </nav>

            {/* Short sharp lines */}
            <div className="text-center space-y-8">
              <p className="font-display font-light italic text-neutral-500 leading-loose text-[clamp(0.95rem,1.6vw,1.15rem)]">
                Not publicly listed. Access is not open.
              </p>
              <p className="font-display font-light text-neutral-400 text-[clamp(0.9rem,1.5vw,1.05rem)]">
                Selected work remains unseen.
              </p>
              <p className="font-display font-light text-neutral-400 text-[clamp(0.9rem,1.5vw,1.05rem)]">
                What we arrange is not found. What we curate is not listed.
              </p>
            </div>
          </div>
        </section>

        {/* ── SILENCE MOMENT ── */}
        <div className="bg-[#EAEAE5] py-20 md:py-28">
          <p
            className="text-center font-display font-light text-neutral-400/50 text-[clamp(0.8rem,1.3vw,0.95rem)] tracking-[0.08em]"
            aria-hidden="true"
          >
            Not everything is meant to be accessed.
          </p>
        </div>

        {/* ── THIN DIVIDER ── */}
        <div className="bg-[#EAEAE5]">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            <hr className="border-t border-neutral-200" />
          </div>
        </div>

        {/* ── BLACK™ EXPERIENCE DIMENSIONS ── */}
        <section className="bg-[#EAEAE5] py-28 md:py-40" aria-label="Experience Dimensions">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <h2 className="font-display font-light text-neutral-700 text-[clamp(1.4rem,2.5vw,2rem)]">
                BLACK™ Experience Dimensions
              </h2>
            </div>

            {/* 2×3 Grid — reduced border contrast, increased spacing, lower opacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
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
                  className={`border border-neutral-200/60 px-10 py-14 text-center ${i >= 3 ? '-mt-px' : ''} ${i % 3 !== 0 ? '-ml-px' : ''}`}
                >
                  <p className="font-display font-light text-neutral-500/70 text-[clamp(0.8rem,1.3vw,0.95rem)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THIN DIVIDER ── */}
        <div className="bg-[#EAEAE5]">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            <hr className="border-t border-neutral-200" />
          </div>
        </div>

        {/* ── ACCESS PRINCIPLES ── */}
        <section className="bg-[#EAEAE5] py-28 md:py-40" aria-label="Access Principles">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
            <h2 className="font-display font-light text-neutral-700 mb-20 text-[clamp(1.4rem,2.5vw,2rem)]">
              Access Principles
            </h2>

            <div className="space-y-10">
              {[
                'Referral-based access',
                'Private consultation',
                'Discreet execution',
                'Confidential delivery',
              ].map((principle) => (
                <p
                  key={principle}
                  className="font-display font-light text-neutral-400/60 text-[clamp(0.9rem,1.5vw,1.05rem)]"
                >
                  {principle}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── THIN DIVIDER ── */}
        <div className="bg-[#EAEAE5]">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            <hr className="border-t border-neutral-200" />
          </div>
        </div>

        {/* ── HOW BLACK™ WORKS ── */}
        <section className="bg-[#EAEAE5] py-28 md:py-40" aria-label="How BLACK™ Works">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <h2 className="font-display font-light text-neutral-800 text-[clamp(1.4rem,2.5vw,2rem)]">
                How BLACK™ Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 text-center">
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
                  <p className="font-body text-[0.7rem] tracking-[0.2em] text-neutral-700 uppercase mb-6 font-medium">
                    {item.label}
                  </p>
                  <p className="font-body text-sm text-neutral-400/50 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {blackExperiences.length > 0 && (
          <section
            className="bg-[#EAEAE5] py-28 md:py-40"
            aria-label="BLACK experiences from the collection"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="text-center mb-20">
                <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                  FROM THE COLLECTION
                </p>
                <h2
                  className="font-display font-light text-neutral-800"
                  style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)' }}
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
                      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] mb-5 bg-neutral-900/5">
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

                      <p className="font-body text-[0.55rem] tracking-[0.28em] text-neutral-400 uppercase mb-2">
                        {exp.category ?? 'BLACK'}
                      </p>
                      <h3
                        className="font-display font-light text-neutral-800 leading-snug mb-2 group-hover:opacity-70 transition-opacity duration-300"
                        style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)' }}
                      >
                        {exp.title}
                      </h3>

                      {geoMetadata && (
                        <p className="font-body text-[0.68rem] text-neutral-500/80 mb-2">
                          {geoMetadata}
                        </p>
                      )}

                      {location && (
                        <p className="font-body text-[0.7rem] text-neutral-500 mb-2">{location}</p>
                      )}

                      {exp.short_description && (
                        <p className="font-body text-sm text-neutral-500 leading-relaxed">
                          {exp.short_description}
                        </p>
                      )}

                      {exp.duration && (
                        <p className="mt-3 font-body text-xs tracking-wide text-neutral-500 uppercase">
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

        {/* ── THIN DIVIDER ── */}
        <div className="bg-[#EAEAE5]">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            <hr className="border-t border-neutral-200" />
          </div>
        </div>

        {/* ── FINAL MANIFESTO + CTA ── */}
        <section className="bg-[#EAEAE5] py-32 md:py-48" aria-label="Request Private Access">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
            {/* Refined manifesto */}
            <div className="space-y-6 mb-24">
              <p className="font-display font-light text-neutral-800 text-[clamp(1.3rem,2.5vw,1.9rem)]">
                BLACK™ is not marketed. It is not advertised.
              </p>
              <p className="font-display font-light text-neutral-500 text-[clamp(1rem,1.8vw,1.4rem)]">
                It is extended — selectively.
              </p>
              <p className="font-body font-light text-neutral-400 text-sm leading-relaxed mt-4">
                BLACK™ operates across the cultural worlds of{' '}
                <Link
                  href="/cultural-worlds/istanbul"
                  className="underline underline-offset-2 hover:text-neutral-600 transition-colors"
                >
                  Istanbul
                </Link>{' '}
                and the <span className="underline underline-offset-2">Aegean</span> — in spaces
                that are never listed and encounters that are never described.
              </p>
            </div>

            {/* CTA button */}
            <Link
              href="/contact?source=experience&slug=black&exp=black"
              className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white uppercase bg-black px-12 py-5 hover:bg-neutral-800 transition-colors duration-300"
            >
              Request Private Access
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
