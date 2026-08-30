import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import {
  fetchExperienceCategoryPages,
  fetchExperienceLanding,
  fetchPublishedExperiences,
  getCmsImageUrl,
  type CmsExperienceLanding,
} from '@/lib/experiences/cms';
import { DEFAULT_SITE_LOCALE, LOCALE_REGISTRY, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizePathname } from '@/lib/i18n/pathname';
import { getAvailableStaticRouteLocales } from '@/lib/i18n/static-routes';
import { buildExperienceInquiryHref } from '@/lib/inquiry';
import { buildCanonicalUrl, buildExperienceListingGraph } from '@/lib/schema-builder';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function buildExperienceLandingMetadata(
  locale: SiteLocale,
  landing: CmsExperienceLanding
): Metadata {
  const image = getCmsImageUrl(landing.hero_image);
  const metadata = buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: { family: 'experiences', locale },
    title: landing.seo_title,
    description: landing.seo_description,
    image: image ?? undefined,
    imageAlt: landing.hero_alt_text,
    robots: { index: true, follow: true },
    availableLocales: getAvailableStaticRouteLocales('/experiences'),
  });

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, description: landing.og_description }
      : metadata.openGraph,
    twitter: metadata.twitter
      ? { ...metadata.twitter, description: landing.og_description }
      : metadata.twitter,
  };
}

export async function generateExperiencesMetadata(locale: SiteLocale): Promise<Metadata> {
  return buildExperienceLandingMetadata(locale, await fetchExperienceLanding(locale));
}

export async function renderExperiencesPage(locale: SiteLocale = DEFAULT_SITE_LOCALE) {
  const dictionary = getDictionary(locale);
  const [landing, categoryPages, publishedExperiences] = await Promise.all([
    fetchExperienceLanding(locale),
    fetchExperienceCategoryPages(locale),
    fetchPublishedExperiences(locale),
  ]);
  const heroImage = getCmsImageUrl(landing.hero_image);
  if (!heroImage) throw new Error(`Missing Experience landing hero media for ${locale}`);

  const canonicalPath = localizePathname('/experiences', locale);
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const experiencesSchema = buildExperienceListingGraph({
    pageId: `${canonicalUrl}#collection`,
    itemListId: `${canonicalUrl}#itemlist`,
    breadcrumbId: `${canonicalUrl}#breadcrumbs`,
    path: canonicalUrl,
    title: landing.hero_title,
    inLanguage: LOCALE_REGISTRY[locale].jsonLdLanguage,
    description: landing.seo_description,
    breadcrumbs: [
      { name: dictionary.common.home, url: buildCanonicalUrl(localizePathname('/', locale)) },
      { name: landing.hero_title, url: canonicalUrl },
    ],
    items: categoryPages.map((category) => ({
      title: category.eyebrow,
      url: buildCanonicalUrl(localizePathname(`/experiences/${category.key}`, locale)),
      description: category.card_description,
      image: category.card_image,
      category: category.key,
    })),
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <JsonLd id={`experiences-collection-jsonld-${locale}`} schema={experiencesSchema} />

      <section className="relative flex min-h-[72vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={landing.hero_alt_text}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16">
          <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/40">
            {landing.eyebrow}
          </p>
          <h1
            className="max-w-4xl font-display font-light leading-[1.05] text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.8rem)' }}
          >
            {landing.hero_title}
          </h1>
          <p className="mt-8 max-w-2xl font-body text-sm leading-relaxed text-white/65 sm:text-[0.95rem]">
            {landing.hero_subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 md:py-24 lg:px-16">
        <div className="grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/35">
              {landing.collection_eyebrow}
            </p>
            <p
              className="max-w-2xl font-display font-light leading-relaxed text-white/88"
              style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}
            >
              {landing.introduction}
            </p>
          </div>
          <div className="space-y-5">
            {splitParagraphs(landing.supporting_content).map((paragraph, index) => (
              <p
                key={paragraph}
                className={`font-body text-sm leading-relaxed ${index === 0 ? 'text-white/58' : 'text-white/42'}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {categoryPages.map((category) => {
            const image = getCmsImageUrl(category.card_image);
            if (!image) throw new Error(`Missing ${locale}:${category.key} card image`);

            return (
              <article key={category.key} className="flex flex-col">
                <Link
                  href={localizePathname(`/experiences/${category.key}`, locale)}
                  className="group block"
                  aria-label={`${dictionary.common.enter} ${category.eyebrow}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden lg:aspect-[7/10]">
                    <Image
                      src={image}
                      alt={category.card_alt_text}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-8 lg:pb-14">
                      <p className="mb-3 font-body text-[0.58rem] uppercase tracking-[0.28em] text-white/38">
                        {category.eyebrow}
                      </p>
                      <h2 className="mb-3 font-display text-[1.8rem] font-light leading-tight text-white">
                        {category.card_title}
                      </h2>
                      <p className="font-body text-sm leading-relaxed text-white/65">
                        {category.card_description}
                      </p>
                      <span className="mt-6 inline-block font-body text-[0.62rem] uppercase tracking-[0.24em] text-white/52 transition-colors group-hover:text-white/85">
                        {dictionary.common.enter} →
                      </span>
                    </div>
                  </div>
                </Link>
                <p className="mt-4 px-1 font-body text-xs leading-relaxed text-white/38">
                  {category.card_distinction}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32 sm:px-10 lg:px-16">
        <div className="border-t border-white/10 pt-14">
          <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/35">
            {landing.published_list_eyebrow}
          </p>
          <h2 className="mb-10 font-display text-3xl font-light text-white">
            {landing.published_list_title}
          </h2>
        </div>

        <ul className="divide-y divide-white/10">
          {publishedExperiences.map((item) => (
            <li key={item.id}>
              <Link
                href={localizePathname(`/experiences/${item.slug}`, locale)}
                className="group -mx-2 flex flex-col justify-between gap-4 px-2 py-8 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <h3 className="mb-2 font-display text-lg font-light text-white transition-colors group-hover:text-white/78">
                    {item.title}
                  </h3>
                  <p className="max-w-2xl font-body text-sm leading-relaxed text-white/45">
                    {item.short_description}
                  </p>
                </div>
                <span className="shrink-0 font-body text-[0.62rem] uppercase tracking-[0.22em] text-white/35 transition-colors group-hover:text-white/65">
                  {dictionary.culturalWorlds.viewExperience} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/10 bg-neutral-950 py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10 lg:px-16">
          <h2 className="font-display text-3xl font-light text-white">{landing.cta_heading}</h2>
          <p className="mx-auto mt-6 max-w-xl font-body text-sm leading-relaxed text-white/58">
            {landing.cta_supporting_text}
          </p>
          <Link
            href={buildExperienceInquiryHref('experiences', locale)}
            className="mt-10 inline-flex border border-white/25 px-8 py-4 font-body text-[0.62rem] uppercase tracking-[0.24em] text-white transition-colors hover:bg-white hover:text-black"
          >
            {landing.cta_label}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function ExperiencesPage() {
  return renderExperiencesPage(DEFAULT_SITE_LOCALE);
}
