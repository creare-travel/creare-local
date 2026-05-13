import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import JsonLd from '@/components/JsonLd';
import { buildCulturalWorldCollectionGraph } from '@/lib/schema-builder';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://crearetravel.com';

export const metadata: Metadata = {
  title: 'Cultural Worlds — Creare',
  description:
    'Each destination is a world unto itself. Creare provides private cultural access to the deepest layers of extraordinary places shaped by history, ritual, and meaning.',
  alternates: {
    canonical: `${SITE_URL}/cultural-worlds`,
    languages: {
      en: `${SITE_URL}/cultural-worlds`,
      tr: `${SITE_URL}/cultural-worlds`,
      ru: `${SITE_URL}/cultural-worlds`,
      zh: `${SITE_URL}/cultural-worlds`,
      'x-default': `${SITE_URL}/cultural-worlds`,
    },
  },
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

function flattenDestination(raw: Record<string, unknown>): StrapiDestination {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as StrapiDestination;
  }
  return raw as unknown as StrapiDestination;
}

async function fetchActiveDestinations(): Promise<StrapiDestination[]> {
  const path = '/api/destinations?filters[visibility_status][$eqi]=active&populate=*';
  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return items
      .map((item) => flattenDestination(item))
      .filter((item) => item.name)
      .sort((a, b) => {
        const aOrder = a.order ?? Infinity;
        const bOrder = b.order ?? Infinity;
        return aOrder - bOrder;
      });
  } catch (error) {
    console.error('Failed to fetch active cultural worlds destinations.', {
      route: '/cultural-worlds',
      strapiPath: path,
      error,
    });
    return [];
  }
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
  const destinations = await fetchActiveDestinations();
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
      <section className="max-w-7xl mx-auto px-6 pt-44 pb-20 sm:px-10 lg:px-16">
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
            fontSize: 'clamp(2.8rem, 6.5vw, 6.2rem)',
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
      <section className="max-w-7xl mx-auto px-6 pb-24 sm:px-10 lg:px-16">
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-7 gap-y-10 md:grid-cols-2">
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
                <div className="relative aspect-[4/5] overflow-hidden">
                  <AppImage
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
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
                        className="mt-6 inline-block font-body uppercase transition-colors duration-700 group-hover:text-white/60"
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

      <section className="bg-[#0d0d0b]" aria-label="Contact handoff">
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
  );
}
