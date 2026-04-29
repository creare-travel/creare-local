import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

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
    destination.cover_image?.formats?.medium?.url ??
    destination.cover_image?.formats?.small?.url ??
    destination.cover_image?.url;

  return rawUrl ? mediaUrl(rawUrl) : '/assets/images/no_image.png';
}

export default async function CulturalWorldsPage() {
  const destinations = await fetchActiveDestinations();

  return (
    <main className="bg-black min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <p className="text-white/30 font-body text-xs tracking-[0.2em] uppercase mb-6">Creare</p>
        <h1
          className="font-display font-light text-white leading-tight"
          style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
        >
          Cultural Worlds
        </h1>
        <p className="text-white/50 font-body font-light text-base leading-relaxed max-w-lg mt-8">
          Each destination holds layers of history, ritual, and meaning. We know them intimately —
          their hidden corners, their cultural custodians, their extraordinary moments.
        </p>
      </section>

      {/* World Cards */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-32">
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="relative overflow-hidden aspect-[3/4]">
                  <AppImage
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h2 className="font-display font-light text-white text-2xl mb-2">{title}</h2>
                    <p className="text-white/60 font-body text-xs leading-relaxed">{tagline}</p>
                    {href && (
                      <span className="inline-block mt-4 text-white/40 font-body text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                        Explore →
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
    </main>
  );
}
