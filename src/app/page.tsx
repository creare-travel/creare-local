import type { Metadata } from 'next';
import Link from 'next/link';
import CulturalWorldsIndexSection from '@/app/home/components/CulturalWorldsIndexSection';
import HeroSection from '@/app/home/components/HeroSection';
import CollectionsSection from '@/app/home/components/CollectionsSection';
import SelectedInsightsSection from '@/app/home/components/SelectedInsightsSection';
import JsonLd from '@/components/JsonLd';
import { buildHomepageWebPageGraph } from '@/lib/schema-builder';
import { buildMetadataAlternates, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Creare — Experiences Composed as Art',
  description:
    'Creare curates private cultural encounters through access, narrative, and composition — monastery entry, atelier visits, and extraordinary moments for discerning clients.',
  alternates: buildMetadataAlternates('/'),
  openGraph: {
    title: 'Creare — Experiences Composed as Art',
    description: 'Private cultural access. Thoughtfully designed encounters.',
    url: 'https://crearetravel.com',
    siteName: 'Creare',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creare — Experiences Composed as Art',
    description: 'Private cultural access. Thoughtfully designed encounters.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  const homepageSchema = buildHomepageWebPageGraph();

  return (
    <main className="min-h-screen bg-black">
      <JsonLd id="homepage-webpage-jsonld" schema={homepageSchema} />
      <HeroSection />
      <section className="bg-neutral-50" aria-label="Homepage experience introduction">
        <div className="mx-auto max-w-7xl px-6 pb-24 sm:px-10 sm:pb-28 lg:px-16 lg:pb-32">
          <p className="mb-6 max-w-2xl font-body text-sm leading-relaxed text-neutral-700">
            CREARE is not built around packaged travel, but around cultural access, narrative
            intelligence, and the careful composition of encounter. Signature, LAB, and BLACK define
            three ways of working: curated cultural experiences, bespoke commissions, and discreet
            private access shaped by context, trust, and the deeper logic of place. The aim is not
            to move through places efficiently, but to understand what gives them meaning: the
            custodians who preserve them, the local knowledge that makes them legible, and the
            conditions under which an encounter becomes more than arrival.
          </p>
          <Link
            href="/experiences"
            className="inline-flex font-body text-xs uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-900"
          >
            How We Approach Experience →
          </Link>
        </div>
      </section>
      <CulturalWorldsIndexSection />
      <CollectionsSection />
      <SelectedInsightsSection />
    </main>
  );
}
