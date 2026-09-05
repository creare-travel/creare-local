import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CulturalWorldsDiscoveryRail from '@/app/cultural-worlds/CulturalWorldsDiscoveryRail';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import {
  fetchCulturalWorldDestinations,
  fetchCulturalWorldPage,
  getDestinationImageAlt,
} from '@/lib/cultural-worlds/cms';
import { getCmsImageUrl } from '@/lib/experiences/cms';
import { DEFAULT_SITE_LOCALE, LOCALE_REGISTRY, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizePathname } from '@/lib/i18n/pathname';
import { getAvailableStaticRouteLocales, getPrivateInquiryHref } from '@/lib/i18n/static-routes';
import { buildCulturalWorldCollectionGraph } from '@/lib/schema-builder';
import { buildLocaleOwnedMetadata } from '@/lib/seo';
import { isLocalAssetUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export async function generateCulturalWorldsMetadata(locale: SiteLocale): Promise<Metadata> {
  const page = await fetchCulturalWorldPage(locale);
  const image = getCmsImageUrl(page.hero_image);
  const metadata = buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: { family: 'cultural-worlds', locale },
    title: page.seo_title,
    description: page.seo_description,
    image: image ?? undefined,
    imageAlt: page.hero_alt_text,
    robots: { index: true, follow: true },
    titleMode: 'absolute',
    availableLocales: getAvailableStaticRouteLocales('/cultural-worlds'),
  });

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, description: page.og_description }
      : metadata.openGraph,
    twitter: metadata.twitter
      ? { ...metadata.twitter, description: page.og_description }
      : metadata.twitter,
  };
}

export function generateMetadata() {
  return generateCulturalWorldsMetadata(DEFAULT_SITE_LOCALE);
}

export async function renderCulturalWorldsPage(locale: SiteLocale = DEFAULT_SITE_LOCALE) {
  const dictionary = getDictionary(locale);
  const privateInquiryHref = getPrivateInquiryHref(locale);
  const [page, destinations] = await Promise.all([
    fetchCulturalWorldPage(locale),
    fetchCulturalWorldDestinations(locale),
  ]);
  const heroImage = getCmsImageUrl(page.hero_image);
  if (!heroImage) throw new Error(`Missing ${locale}:cultural-worlds hero image`);

  const canonicalPath = localizePathname('/cultural-worlds', locale);
  const culturalWorldSchema = buildCulturalWorldCollectionGraph({
    canonicalPath,
    homePath: localizePathname('/', locale),
    title: page.hero_title,
    description: page.seo_description,
    homeLabel: dictionary.common.home,
    inLanguage: LOCALE_REGISTRY[locale].jsonLdLanguage,
    items: destinations,
  });

  return (
    <main className="min-h-screen overflow-x-clip bg-[#0d0d0b] text-white">
      <JsonLd id={`cultural-worlds-jsonld-${locale}`} schema={culturalWorldSchema} />
      <style>{`
        .atlas-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .atlas-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <section className="relative flex min-h-[72vh] items-end overflow-hidden">
        <Image
          src={heroImage}
          alt={page.hero_alt_text}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized={isLocalAssetUrl(heroImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16">
          <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/48">
            {page.eyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.8rem)] font-light leading-[1.05]">
            {page.hero_title}
          </h1>
          <p className="mt-8 max-w-2xl font-display text-xl font-light leading-relaxed text-white/78 md:text-2xl">
            {page.hero_subtitle}
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141411] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16">
          <div>
            <p className="mb-5 font-body text-[0.6rem] uppercase tracking-[0.3em] text-white/38">
              {page.atlas_eyebrow}
            </p>
            <h2 className="max-w-[15ch] font-display text-3xl font-light leading-tight md:text-4xl">
              {page.atlas_title}
            </h2>
          </div>
          <p className="max-w-2xl border-t border-white/12 pt-8 font-body text-sm leading-8 text-white/58 lg:pt-10">
            {page.atlas_body}
          </p>
        </div>
      </section>

      <section className="bg-[#0d0d0b] py-20 md:py-28" aria-labelledby={`worlds-${locale}`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <CulturalWorldsDiscoveryRail
            previousLabel={page.rail_previous_label}
            nextLabel={page.rail_next_label}
            railLabel={page.destination_section_title}
            heading={
              <div className="max-w-2xl">
                <p className="mb-4 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/36">
                  {page.destination_section_eyebrow}
                </p>
                <h2
                  id={`worlds-${locale}`}
                  className="font-display text-3xl font-light leading-tight md:text-4xl"
                >
                  {page.destination_section_title}
                </h2>
                <p className="mt-5 max-w-xl font-body text-sm leading-relaxed text-white/50">
                  {page.destination_section_supporting_text}
                </p>
              </div>
            }
          >
            {destinations.map((destination, index) => {
              const href = localizePathname(`/cultural-worlds/${destination.slug}`, locale);
              const image = getCmsImageUrl(destination.cover_image);
              if (!image) throw new Error(`Missing ${locale}:${destination.slug} rail image`);

              return (
                <article
                  key={destination.documentId || destination.slug}
                  data-rail-card="true"
                  className="group min-w-[calc((100%-1.5rem)/1.05)] shrink-0 snap-start md:min-w-[calc((100%-1.5rem)/2.2)] lg:min-w-[calc((100%-3rem)/3.35)]"
                >
                  <Link
                    href={href}
                    className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <div className="relative aspect-[5/6] overflow-hidden bg-white/[0.03]">
                      <AppImage
                        src={image}
                        alt={getDestinationImageAlt(destination)}
                        fill
                        deliveryProfile="cardPortrait"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
                        priority={index === 0}
                        sizes="(max-width: 767px) 95vw, (max-width: 1023px) 45vw, 30vw"
                        unoptimized={isLocalAssetUrl(image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/24 to-black/5" />
                      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
                        <div className="mb-5 h-px w-7 bg-white/25" />
                        <h3 className="font-display text-2xl font-light leading-tight">
                          {destination.name}
                        </h3>
                        <p className="mt-3 max-w-[30ch] font-body text-sm leading-relaxed text-white/58">
                          {destination.highlight}
                        </p>
                        <span className="mt-6 inline-flex border border-white/20 px-4 py-2 font-body text-[0.58rem] uppercase tracking-[0.24em] text-white/72 transition-colors group-hover:border-white/40 group-hover:text-white">
                          {page.destination_cta_label}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </CulturalWorldsDiscoveryRail>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black" aria-labelledby={`contact-${locale}`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <h2
            id={`contact-${locale}`}
            className="font-display text-[clamp(1.45rem,2.2vw,2rem)] font-light leading-tight"
          >
            {dictionary.home.contact.title}
          </h2>
          {privateInquiryHref ? (
            <Link
              href={privateInquiryHref}
              className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors hover:border-white/32 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {dictionary.common.contactCreareUpper} →
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default function CulturalWorldsPage() {
  return renderCulturalWorldsPage(DEFAULT_SITE_LOCALE);
}
