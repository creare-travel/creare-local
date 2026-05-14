import type { Metadata } from 'next';
import HeroSection from '@/app/home/components/HeroSection';
import CollectionsSection from '@/app/home/components/CollectionsSection';
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
      <CollectionsSection />
    </main>
  );
}
