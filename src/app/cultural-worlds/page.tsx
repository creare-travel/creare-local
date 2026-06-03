import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import JsonLd from '@/components/JsonLd';
import { buildCulturalWorldCollectionGraph } from '@/lib/schema-builder';
import { filterCanonicalCulturalWorlds } from '@/lib/canonical-gates';
import { CULTURAL_WORLD_CONTENT } from '@/data/cultural-worlds';
import { buildMetadataAlternates } from '@/lib/seo';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://crearetravel.com';

export const metadata: Metadata = {
  title: 'Cultural Worlds — Creare',
  description:
    'Each destination is a world unto itself. Creare provides private cultural access to the deepest layers of extraordinary places shaped by history, ritual, and meaning.',
  alternates: buildMetadataAlternates('/cultural-worlds'),
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Cultural Worlds — Creare',
    description:
      'Private cultural access to extraordinary destinations shaped by history, ritual, and meaning.',
    url: `${SITE_URL}/cultural-worlds`,
    siteName: 'Creare',
    type: 'website',
  },
};

interface StrapiDestination {
  id: number;
  documentId?: string;
  name?: string;
  slug?: string;
  visibility_status?: string;
  highlight?: string;
  short_description?: string;
  order?: number;
  cover_image?: {
    url?: string;
    alternativeText?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
    };
  } | null;
}

const LOCAL_FALLBACK_DESTINATIONS: StrapiDestination[] = [
  {
    id: 9001,
    name: CULTURAL_WORLD_CONTENT.istanbul.title,
    slug: CULTURAL_WORLD_CONTENT.istanbul.slug,
    highlight: CULTURAL_WORLD_CONTENT.istanbul.shortDescription,
    short_description: CULTURAL_WORLD_CONTENT.istanbul.shortDescription,
    order: 1,
    cover_image: {
      url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
      alternativeText: 'Istanbul skyline at dusk with domes and minarets above the Bosphorus',
    },
  },
  {
    id: 9002,
    name: CULTURAL_WORLD_CONTENT.cappadocia.title,
    slug: CULTURAL_WORLD_CONTENT.cappadocia.slug,
    highlight: CULTURAL_WORLD_CONTENT.cappadocia.shortDescription,
    short_description: CULTURAL_WORLD_CONTENT.cappadocia.shortDescription,
    order: 2,
    cover_image: {
      url: 'https://images.unsplash.com/photo-1660925113440-50358842e0d8',
      alternativeText:
        'Cappadocia landscape with volcanic rock formations under soft evening light',
    },
  },
  {
    id: 9003,
    name: CULTURAL_WORLD_CONTENT.bodrum.title,
    slug: CULTURAL_WORLD_CONTENT.bodrum.slug,
    highlight: CULTURAL_WORLD_CONTENT.bodrum.shortDescription,
    short_description: CULTURAL_WORLD_CONTENT.bodrum.shortDescription,
    order: 3,
    cover_image: {
      url: 'https://images.unsplash.com/photo-1613419772278-eb01548b4b88',
      alternativeText:
        'Bodrum coastline and harbor at blue hour with lights reflected across the water',
    },
  },
];

function flattenDestination(raw: Record<string, unknown>): StrapiDestination {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as StrapiDestination;
  }
  return raw as unknown as StrapiDestination;
}

async function fetchActiveDestinations(): Promise<StrapiDestination[]> {
  const path = '/api/destinations?filters[visibility_status][$eqi]=active&populate=*';
  const json = await fetchStrapi(path);
  const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
  const preferredOrder = ['istanbul', 'cappadocia'];

  return filterCanonicalCulturalWorlds(items.map((item) => flattenDestination(item))).sort(
    (a, b) => {
      const aSlug = a.slug?.toLowerCase() ?? '';
      const bSlug = b.slug?.toLowerCase() ?? '';
      const aPreferredIndex = preferredOrder.indexOf(aSlug);
      const bPreferredIndex = preferredOrder.indexOf(bSlug);

      if (aPreferredIndex !== -1 || bPreferredIndex !== -1) {
        if (aPreferredIndex === -1) return 1;
        if (bPreferredIndex === -1) return -1;
        if (aPreferredIndex !== bPreferredIndex) {
          return aPreferredIndex - bPreferredIndex;
        }
      }

      const aOrder = a.order ?? Infinity;
      const bOrder = b.order ?? Infinity;
      return aOrder - bOrder;
    }
  );
}

function getDestinationImageUrl(destination: StrapiDestination): string {
  const rawUrl =
    destination.cover_image?.formats?.large?.url ??
    destination.cover_image?.formats?.medium?.url ??
    destination.cover_image?.formats?.small?.url ??
    destination.cover_image?.url;

  return rawUrl ? mediaUrl(rawUrl) : '/assets/images/creare-image-placeholder.jpg';
}

export default async function CulturalWorldsPage() {
  let destinations: StrapiDestination[] = [];

  try {
    destinations = await fetchActiveDestinations();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[cultural-worlds] CMS fetch failed in development. Using canonical local fallback data for visual QA.',
        {
          route: '/cultural-worlds',
          fallbackSlugs: LOCAL_FALLBACK_DESTINATIONS.map((destination) => destination.slug),
          error,
        }
      );
      destinations = LOCAL_FALLBACK_DESTINATIONS;
    } else {
      destinations = [];
    }
  }

  const culturalWorldSchema = buildCulturalWorldCollectionGraph({
    items: destinations.map((destination) => ({
      ...destination,
      description:
        destination.highlight ??
        destination.short_description ??
        'Private cultural access composed around place, narrative, and depth.',
    })),
  });

  return (
    <main className="min-h-screen bg-[#0d0d0b]">
      <JsonLd id="cultural-worlds-jsonld" schema={culturalWorldSchema} />
      <style>{`
        header button[aria-label='Open navigation menu'] svg path,
        header button[aria-label='Close navigation menu'] svg path {
          stroke: currentColor !important;
        }
      `}</style>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-44 pb-16 sm:px-10 lg:px-16">
        <p
          className="mb-8 font-body uppercase"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.20)',
          }}
        >
          Creare — Cultural Atlas
        </p>
        <h1
          className="font-display font-light text-white"
          style={{
            fontSize: 'clamp(2.8rem, 5.8vw, 5.5rem)',
            lineHeight: 1.06,
            letterSpacing: '-0.015em',
          }}
        >
          Cultural Worlds
        </h1>
        <div
          className="mb-8 mt-8 h-px w-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
        />
        <p
          className="font-body font-light"
          style={{
            fontSize: 'clamp(0.88rem, 1.4vw, 1.02rem)',
            lineHeight: 1.9,
            letterSpacing: '0.01em',
            maxWidth: '46ch',
            color: 'rgba(255,255,255,0.42)',
          }}
        >
          Each destination holds layers of history, ritual, and meaning. We know them intimately —
          their hidden corners, their cultural custodians, their extraordinary moments.
        </p>
      </section>

      {/* World Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:px-16">
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
            {destinations.map((destination, index) => {
              const href = destination.slug ? `/cultural-worlds/${destination.slug}` : null;
              const title = destination.name ?? 'Destination';
              const tagline =
                destination.highlight ??
                destination.short_description ??
                'Private cultural access composed around place, narrative, and depth.';
              const imageUrl = getDestinationImageUrl(destination);
              const imageAlt =
                destination.cover_image?.alternativeText ?? `${title} cultural world`;

              const card = (
                <div className="relative aspect-[5/6] overflow-hidden">
                  <AppImage
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    deliveryProfile="cardPortrait"
                    className="motion-media-drift object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(10,9,7,0.78) 0%, rgba(10,9,7,0.26) 44%, rgba(10,9,7,0.06) 100%)',
                    }}
                  />
                  <div
                    className="absolute inset-0 mix-blend-multiply"
                    style={{ backgroundColor: 'rgba(22,18,12,0.16)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div
                      className="mb-5 h-px"
                      style={{ width: '1.8rem', backgroundColor: 'rgba(255,255,255,0.22)' }}
                    />
                    <h2
                      className="font-display font-light text-white"
                      style={{
                        fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.01em',
                        marginBottom: '0.55rem',
                      }}
                    >
                      {title}
                    </h2>
                    <p
                      className="font-body font-light"
                      style={{
                        fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                        lineHeight: 1.75,
                        letterSpacing: '0.01em',
                        color: 'rgba(255,255,255,0.50)',
                        maxWidth: '28ch',
                      }}
                    >
                      {tagline}
                    </p>
                    {href && (
                      <span
                        className="motion-link mt-6 inline-block font-body uppercase group-hover:text-white/60"
                        style={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.28em',
                          color: 'rgba(255,255,255,0.28)',
                        }}
                      >
                        Enter
                      </span>
                    )}
                  </div>
                </div>
              );

              return href ? (
                <Link
                  key={destination.id}
                  href={href}
                  className="group block"
                  aria-label={`Explore ${title}`}
                >
                  {card}
                </Link>
              ) : (
                <div key={destination.id} className="group block" aria-label={title}>
                  {card}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12">
            <p className="text-white/40 font-body text-sm leading-relaxed max-w-md">
              Cultural worlds will appear here as soon as active destinations are published in the
              CMS.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-black" aria-label="Contact handoff">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <p
            className="font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          >
            Begin the conversation.
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/32 hover:text-white"
          >
            CONTACT CREARE →
          </Link>
        </div>
      </section>
    </main>
  );
}
