import type { Metadata } from 'next';
import HeroSection from '@/app/home/components/HeroSection';
import CollectionsSection from '@/app/home/components/CollectionsSection';
import JsonLd from '@/components/JsonLd';
import { buildHomepageWebPageGraph } from '@/lib/schema-builder';

export const metadata: Metadata = {
  title: 'Creare — Experiences Composed as Art',
  description:
    'Creare curates private cultural encounters across Turkey and beyond — monastery access, atelier visits, and extraordinary moments for discerning clients.',
  alternates: {
    canonical: 'https://crearetravel.com',
    languages: {
      en: 'https://crearetravel.com',
      tr: 'https://crearetravel.com',
      ru: 'https://crearetravel.com',
      zh: 'https://crearetravel.com',
      'x-default': 'https://crearetravel.com',
    },
  },
  openGraph: {
    title: 'Creare — Experiences Composed as Art',
    description: 'Private cultural access. Thoughtfully designed encounters.',
    url: 'https://crearetravel.com',
    siteName: 'Creare',
    type: 'website',
    images: [
      {
        url: 'https://img.rocket.new/generatedImages/rocket_gen_img_167773a44-1775598260952.png',
        width: 1200,
        height: 630,
        alt: 'Creare — Private Cultural Experiences Composed as Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creare — Experiences Composed as Art',
    description: 'Private cultural access. Thoughtfully designed encounters.',
    images: ['https://crearetravel.com/og/default.jpg'],
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
