import type { Metadata } from 'next';
import Link from 'next/link';
import HeroSection from '@/app/home/components/HeroSection';
import CollectionsSection from '@/app/home/components/CollectionsSection';
import JsonLd from '@/components/JsonLd';
import { buildHomepageWebPageGraph } from '@/lib/schema-builder';
import { buildMetadataAlternates, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT } from '@/lib/seo';
import { DEFAULT_SITE_LOCALE, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

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

export function renderHomePage(locale: SiteLocale = DEFAULT_SITE_LOCALE) {
  const dictionary = getDictionary(locale);
  const homepageSchema = buildHomepageWebPageGraph();
  const mainParagraph = [
    dictionary.home.mainParagraph.paragraph1,
    dictionary.home.mainParagraph.paragraph2,
    dictionary.home.mainParagraph.paragraph3,
  ].join(' ');

  return (
    <main className="min-h-screen bg-black">
      {locale === DEFAULT_SITE_LOCALE && (
        <JsonLd id="homepage-webpage-jsonld" schema={homepageSchema} />
      )}
      <HeroSection dictionary={dictionary} />
      <CollectionsSection dictionary={dictionary} />
      <section className="bg-neutral-50" aria-label="Homepage experience system discovery">
        <div className="mx-auto max-w-7xl px-6 pb-24 sm:px-10 sm:pb-28 lg:px-16 lg:pb-32">
          <p className="mb-6 max-w-2xl font-body text-sm leading-relaxed text-neutral-700">
            {mainParagraph}
          </p>
          <Link
            href="/experiences"
            className="inline-flex font-body text-xs uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-900"
          >
            {dictionary.home.cta.approach}
          </Link>
        </div>
      </section>
      <section
        className="border-t border-white/10 bg-black"
        aria-label="Homepage contact call to action"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <h2
            className="font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          >
            {dictionary.home.contact.title}
          </h2>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/32 hover:text-white"
          >
            {dictionary.home.cta.contact}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return renderHomePage(DEFAULT_SITE_LOCALE);
}
