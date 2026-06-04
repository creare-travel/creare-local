import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import AppImage from '@/components/ui/AppImage';
import JsonLd from '@/components/JsonLd';
import CulturalWorldsDiscoveryRail from './CulturalWorldsDiscoveryRail';
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

const CULTURAL_WORLDS_PLACEHOLDER_IMAGE = '/assets/images/creare-image-placeholder.jpg';

const LOCAL_FALLBACK_DESTINATIONS: StrapiDestination[] = [
  {
    id: 9001,
    name: CULTURAL_WORLD_CONTENT.istanbul.title,
    slug: CULTURAL_WORLD_CONTENT.istanbul.slug,
    highlight: CULTURAL_WORLD_CONTENT.istanbul.shortDescription,
    short_description: CULTURAL_WORLD_CONTENT.istanbul.shortDescription,
    order: 1,
    cover_image: {
      url: 'https://res.cloudinary.com/djr97wm0n/image/upload/c_fill,g_custom,w_900,h_1200,q_auto,f_auto/v1780603200/creare-cultural-world-istanbul-image.jpg',
      alternativeText: 'Historic street leading toward Galata Tower in Istanbul, Türkiye.',
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
      url: 'https://res.cloudinary.com/djr97wm0n/image/upload/v1780601981/creare-cultural-world-cappadocia-image.jpg',
      alternativeText: 'Cappadocia landscape with volcanic forms and layered terrain',
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
      url: 'https://res.cloudinary.com/djr97wm0n/image/upload/c_fill,g_custom,w_900,h_1200,q_auto,f_auto/v1780602721/creare-cultural-world-bodrum-image.jpg',
      alternativeText: 'Bodrum Castle overlooking the marina and Aegean coastline in Türkiye.',
    },
  },
];

const CULTURAL_WORLDS_HERO_IMAGE =
  'https://res.cloudinary.com/djr97wm0n/image/upload/v1780596665/creare-cultural-world-hero-image.jpg';

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

  if (!rawUrl) {
    return CULTURAL_WORLDS_PLACEHOLDER_IMAGE;
  }

  if (rawUrl.startsWith('/assets/')) {
    return rawUrl;
  }

  return mediaUrl(rawUrl);
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

        .atlas-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .atlas-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <section className="relative flex min-h-[72vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={CULTURAL_WORLDS_HERO_IMAGE}
            alt="Ancient stone architecture and layered heritage landscape under cinematic light"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.58) 34%, rgba(0,0,0,0.2) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16">
          <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/32">
            Creare — Cultural Atlas
          </p>
          <h1
            className="max-w-4xl font-display font-light leading-[1.05] text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.8rem)' }}
          >
            Cultural Worlds
          </h1>
          <p className="mt-8 max-w-2xl font-body text-sm leading-relaxed text-white/58 sm:text-[0.95rem]">
            A geography of layered places, read through memory, custodianship, and the conditions
            that make real cultural access meaningful.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 md:py-24 lg:px-16">
        {destinations.length > 0 ? (
          <>
            <CulturalWorldsDiscoveryRail
              heading={
                <>
                  <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/30">
                    Explore Cultural Worlds
                  </p>
                  <h2 className="font-display text-3xl font-light text-white">
                    A geography of access, memory, and encounter.
                  </h2>
                </>
              }
            >
              <article
                data-rail-card="true"
                className="group block min-w-[82vw] snap-start sm:min-w-[31rem] lg:min-w-[calc((100%-3rem)/3.35)]"
              >
                <div className="relative flex aspect-[5/6] flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.02] p-8 pb-10">
                  <div>
                    <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/32">
                      The Atlas
                    </p>
                    <h3
                      className="max-w-[12ch] font-display font-light leading-[1.12] text-white"
                      style={{ fontSize: 'clamp(1.7rem, 2.7vw, 2.35rem)' }}
                    >
                      Each destination holds layers of history, ritual, and meaning.
                    </h3>
                  </div>
                </div>
              </article>

              {destinations.map((destination, index) => {
                const href = destination.slug ? `/cultural-worlds/${destination.slug}` : null;
                const title = destination.name ?? 'Destination';
                const tagline =
                  destination.slug === 'istanbul'
                    ? 'A city shaped by thresholds, water, and layered time.'
                    : destination.slug === 'cappadocia'
                      ? 'A landscape shaped by silence, stone, and movement.'
                      : destination.slug === 'bodrum'
                        ? 'A coastal world shaped by rhythm, light, and the sea.'
                        : (destination.highlight ??
                          destination.short_description ??
                          'Private cultural access composed around place, narrative, and depth.');
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
                      <div className="flex min-h-[12.75rem] flex-col justify-end">
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
                      </div>
                      {href && (
                        <span
                          className="motion-link mt-6 inline-flex items-center border border-white/14 bg-white/[0.04] px-3 py-1.5 font-body uppercase text-white/58 backdrop-blur-[2px] transition-colors duration-300 group-hover:border-white/24 group-hover:bg-white/[0.06] group-hover:text-white/72"
                          style={{
                            fontSize: '0.6rem',
                            letterSpacing: '0.28em',
                          }}
                        >
                          Enter
                        </span>
                      )}
                    </div>
                  </div>
                );

                const shellClassName =
                  'group block min-w-[82vw] snap-start sm:min-w-[31rem] lg:min-w-[calc((100%-3rem)/3.35)]';

                return href ? (
                  <article key={destination.id} data-rail-card="true" className={shellClassName}>
                    <Link href={href} aria-label={`Explore ${title}`}>
                      {card}
                    </Link>
                  </article>
                ) : (
                  <article
                    key={destination.id}
                    data-rail-card="true"
                    className={shellClassName}
                    aria-label={title}
                  >
                    {card}
                  </article>
                );
              })}
            </CulturalWorldsDiscoveryRail>
          </>
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
