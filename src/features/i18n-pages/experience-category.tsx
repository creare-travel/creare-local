import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import {
  fetchExperienceCategoryPage,
  fetchPublishedExperiences,
  getCmsImageUrl,
  type CmsExperience,
  type CmsExperienceCategoryPage,
  type ExperienceCategory,
} from '@/lib/experiences/cms';
import { LOCALE_REGISTRY, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizePathname } from '@/lib/i18n/pathname';
import { getAvailableStaticRouteLocales } from '@/lib/i18n/static-routes';
import { buildExperienceInquiryHref } from '@/lib/inquiry';
import { buildCanonicalUrl, buildExperienceListingGraph } from '@/lib/schema-builder';
import { buildLocaleOwnedMetadata } from '@/lib/seo';
import { isLocalAssetUrl } from '@/lib/strapi';

export type { ExperienceCategory } from '@/lib/experiences/cms';

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function buildExperienceCategoryMetadata(
  category: ExperienceCategory,
  locale: SiteLocale,
  page: CmsExperienceCategoryPage
): Metadata {
  const image = getCmsImageUrl(page.hero_image);
  const metadata = buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: { family: 'experience-category', locale, slug: category },
    title: page.seo_title,
    description: page.seo_description,
    image: image ?? undefined,
    imageAlt: page.hero_alt_text,
    robots: { index: true, follow: true },
    availableLocales: getAvailableStaticRouteLocales(`/experiences/${category}`),
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

export async function generateExperienceCategoryMetadata(
  category: ExperienceCategory,
  locale: SiteLocale
): Promise<Metadata> {
  const page = await fetchExperienceCategoryPage(category, locale);
  return buildExperienceCategoryMetadata(category, locale, page);
}

function ExperienceCard({ item, locale }: { item: CmsExperience; locale: SiteLocale }) {
  const dictionary = getDictionary(locale);
  const image = getCmsImageUrl(item.cover_image);
  const location = item.location || item.destination?.name;

  return (
    <Link
      href={localizePathname(`/experiences/${item.slug}`, locale)}
      className="group block"
      aria-label={`${dictionary.culturalWorlds.viewExperience}: ${item.title}`}
    >
      {image ? (
        <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-neutral-200">
          <AppImage
            src={image}
            alt={item.hero_alt_text as string}
            fill
            atmosphere="light"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized={isLocalAssetUrl(image)}
          />
        </div>
      ) : null}
      {location ? (
        <p className="mb-2 font-body text-[0.58rem] uppercase tracking-[0.2em] text-neutral-400">
          {location}
        </p>
      ) : null}
      <h3 className="font-display text-xl font-light leading-snug text-neutral-900 transition-opacity group-hover:opacity-65">
        {item.title}
      </h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-neutral-600">
        {item.short_description}
      </p>
    </Link>
  );
}

function ExperienceGrid({
  page,
  experiences,
  locale,
  dark = false,
}: {
  page: CmsExperienceCategoryPage;
  experiences: CmsExperience[];
  locale: SiteLocale;
  dark?: boolean;
}) {
  if (experiences.length === 0) return null;

  return (
    <section className={dark ? 'bg-[#0d0d0b] py-24 md:py-32' : 'bg-[#EDEAE4] py-24 md:py-32'}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <p
          className={`mb-4 font-body text-[0.6rem] uppercase tracking-[0.28em] ${dark ? 'text-white/38' : 'text-neutral-400'}`}
        >
          {page.list_eyebrow}
        </p>
        <h2
          className={`mb-14 font-display text-3xl font-light md:text-4xl ${dark ? 'text-white' : 'text-neutral-900'}`}
        >
          {page.list_title}
        </h2>
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map((item) => (
            <div key={item.id} className={dark ? 'rounded-none bg-[#EDEAE4] p-5' : ''}>
              <ExperienceCard item={item} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCta({
  page,
  locale,
  dark = false,
}: {
  page: CmsExperienceCategoryPage;
  locale: SiteLocale;
  dark?: boolean;
}) {
  return (
    <section className={dark ? 'bg-black py-24 md:py-32' : 'bg-white py-24 md:py-32'}>
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-10 lg:px-16">
        <h2
          className={`font-display text-3xl font-light leading-tight ${dark ? 'text-white' : 'text-neutral-900'}`}
        >
          {page.cta_heading}
        </h2>
        <p
          className={`mx-auto mt-6 max-w-xl font-body text-sm leading-relaxed ${dark ? 'text-white/58' : 'text-neutral-600'}`}
        >
          {page.cta_supporting_text}
        </p>
        <p
          className={`mt-6 font-body text-[0.58rem] uppercase tracking-[0.22em] ${dark ? 'text-white/38' : 'text-neutral-400'}`}
        >
          {page.cta_access_line}
        </p>
        <Link
          href={buildExperienceInquiryHref(page.key, locale)}
          className={`mt-10 inline-flex border px-8 py-4 font-body text-[0.62rem] uppercase tracking-[0.24em] transition-colors ${
            dark
              ? 'border-white/25 text-white hover:bg-white hover:text-black'
              : 'border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
          }`}
        >
          {page.cta_label}
        </Link>
      </div>
    </section>
  );
}

function SignatureCategoryLayout({
  page,
  experiences,
  locale,
}: {
  page: CmsExperienceCategoryPage;
  experiences: CmsExperience[];
  locale: SiteLocale;
}) {
  const heroImage = getCmsImageUrl(page.hero_image);
  if (!heroImage) throw new Error(`Missing ${locale}:signature hero image`);

  return (
    <main className="min-h-screen bg-[#EDEAE4]">
      <section className="relative flex min-h-[76vh] items-end overflow-hidden">
        <Image
          src={heroImage}
          alt={page.hero_alt_text}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/38 to-black/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 text-white sm:px-10 lg:px-16">
          <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/45">
            {page.eyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.05]">
            {page.hero_title}
          </h1>
          <p className="mt-7 max-w-2xl font-display text-xl font-light leading-relaxed text-white/78 md:text-2xl">
            {page.hero_subtitle}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 md:py-28 lg:px-16">
        <div className="grid gap-10 border-t border-neutral-300 pt-12 lg:grid-cols-2 lg:gap-20">
          <p className="font-display text-2xl font-light leading-relaxed text-neutral-900">
            {page.introduction}
          </p>
          <div className="space-y-5">
            {splitParagraphs(page.supporting_content).map((paragraph) => (
              <p key={paragraph} className="font-body text-sm leading-relaxed text-neutral-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
      <ExperienceGrid page={page} experiences={experiences} locale={locale} />
      <CategoryCta page={page} locale={locale} />
    </main>
  );
}

export function LabCategoryLayout({
  page,
  experiences,
  locale,
}: {
  page: CmsExperienceCategoryPage;
  experiences: CmsExperience[];
  locale: SiteLocale;
}) {
  const heroImage = getCmsImageUrl(page.hero_image);
  if (!heroImage) throw new Error(`Missing ${locale}:lab hero image`);

  return (
    <main className="min-h-screen bg-[#EDEAE4]">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-2" aria-label={page.eyebrow}>
        <div className="flex min-h-[55vh] flex-col justify-center px-8 py-24 sm:px-12 lg:min-h-screen lg:px-16 xl:px-20">
          <p className="mb-8 font-body text-[0.6rem] uppercase tracking-[0.35em] text-neutral-500">
            {page.eyebrow}
          </p>
          <h1 className="max-w-xl font-display text-[clamp(2.2rem,4vw,3.8rem)] font-light leading-tight text-neutral-900">
            {page.hero_title}
          </h1>
          <p className="mt-8 max-w-lg font-display text-xl font-light leading-relaxed text-neutral-700">
            {page.hero_subtitle}
          </p>
          <p className="mt-8 max-w-lg font-body text-sm leading-relaxed text-neutral-600">
            {page.introduction}
          </p>
          <div className="mt-5 max-w-lg space-y-4">
            {splitParagraphs(page.supporting_content).map((paragraph) => (
              <p key={paragraph} className="font-body text-sm leading-relaxed text-neutral-500">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        <div className="relative h-[52vh] min-h-[420px] w-full overflow-hidden lg:h-auto lg:min-h-screen">
          <Image
            src={heroImage}
            alt={page.hero_alt_text}
            fill
            priority
            className="object-cover object-[center_38%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>
      <ExperienceGrid page={page} experiences={experiences} locale={locale} />
      <CategoryCta page={page} locale={locale} />
    </main>
  );
}

function BlackCategoryLayout({
  page,
  experiences,
  locale,
}: {
  page: CmsExperienceCategoryPage;
  experiences: CmsExperience[];
  locale: SiteLocale;
}) {
  const heroImage = getCmsImageUrl(page.hero_image);
  if (!heroImage) throw new Error(`Missing ${locale}:black hero image`);

  return (
    <main className="min-h-screen bg-[#0d0d0b] text-white">
      <section className="relative flex min-h-[76vh] items-end overflow-hidden">
        <Image
          src={heroImage}
          alt={page.hero_alt_text}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/72 to-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16">
          <p className="mb-7 font-body text-[0.6rem] uppercase tracking-[0.36em] text-white/42">
            {page.eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.05]">
            {page.hero_title}
          </h1>
          <p className="mt-8 max-w-2xl font-display text-xl font-light leading-relaxed text-white/72 md:text-2xl">
            {page.hero_subtitle}
          </p>
        </div>
      </section>
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl border-t border-white/10 pt-12">
            <p className="font-display text-2xl font-light leading-relaxed text-white/88">
              {page.introduction}
            </p>
            <div className="mt-8 space-y-6">
              {splitParagraphs(page.supporting_content).map((paragraph) => (
                <p key={paragraph} className="font-body text-sm leading-relaxed text-white/55">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ExperienceGrid page={page} experiences={experiences} locale={locale} dark />
      <CategoryCta page={page} locale={locale} dark />
    </main>
  );
}

export async function renderExperienceCategoryPage(
  category: ExperienceCategory,
  locale: SiteLocale
) {
  const dictionary = getDictionary(locale);
  const [page, experiences] = await Promise.all([
    fetchExperienceCategoryPage(category, locale),
    fetchPublishedExperiences(locale, category),
  ]);
  const canonicalPath = localizePathname(`/experiences/${category}`, locale);
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const schema = buildExperienceListingGraph({
    pageId: `${canonicalUrl}#collection`,
    itemListId: `${canonicalUrl}#itemlist`,
    breadcrumbId: `${canonicalUrl}#breadcrumbs`,
    path: canonicalUrl,
    title: page.hero_title,
    inLanguage: LOCALE_REGISTRY[locale].jsonLdLanguage,
    description: page.seo_description,
    breadcrumbs: [
      { name: dictionary.common.home, url: buildCanonicalUrl(localizePathname('/', locale)) },
      {
        name: dictionary.experiences.title,
        url: buildCanonicalUrl(localizePathname('/experiences', locale)),
      },
      { name: page.eyebrow, url: canonicalUrl },
    ],
    items: experiences.map((item) => ({
      title: item.title,
      slug: item.slug,
      url: buildCanonicalUrl(localizePathname(`/experiences/${item.slug}`, locale)),
      description: item.short_description,
      image: item.cover_image,
      category: item.category,
      series: item.series,
      destinationName: item.location || item.destination?.name,
    })),
  });

  const layout =
    category === 'lab' ? (
      <LabCategoryLayout page={page} experiences={experiences} locale={locale} />
    ) : category === 'black' ? (
      <BlackCategoryLayout page={page} experiences={experiences} locale={locale} />
    ) : (
      <SignatureCategoryLayout page={page} experiences={experiences} locale={locale} />
    );

  return (
    <>
      <JsonLd id={`experience-category-jsonld-${locale}-${category}`} schema={schema} />
      {layout}
    </>
  );
}
