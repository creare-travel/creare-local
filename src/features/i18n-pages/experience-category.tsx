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

function editorialField(
  page: CmsExperienceCategoryPage,
  field: keyof CmsExperienceCategoryPage
): string {
  const value = page[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing ${page.key} editorial field: ${String(field)}`);
  }
  return value;
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
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900"
      aria-label={`${dictionary.culturalWorlds.viewExperience}: ${item.title}`}
    >
      {image ? (
        <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-neutral-200">
          <AppImage
            src={image}
            alt={item.hero_alt_text as string}
            fill
            atmosphere="light"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
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
    <section
      className={dark ? 'bg-[#0d0d0b] py-24 md:py-32' : 'bg-[#EDEAE4] py-24 md:py-32'}
      aria-labelledby={`${page.key}-collection-${locale}`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <p
          className={`mb-4 font-body text-[0.6rem] uppercase tracking-[0.28em] ${dark ? 'text-white/38' : 'text-neutral-400'}`}
        >
          {page.list_eyebrow}
        </p>
        <h2
          id={`${page.key}-collection-${locale}`}
          className={`mb-14 font-display text-3xl font-light md:text-4xl ${dark ? 'text-white' : 'text-neutral-900'}`}
        >
          {page.list_title}
        </h2>
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map((item) => (
            <div
              key={item.documentId || item.slug}
              className={dark ? 'bg-[#EDEAE4] p-5' : undefined}
            >
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
    <section
      className={dark ? 'bg-black py-24 md:py-32' : 'bg-white py-24 md:py-32'}
      aria-labelledby={`${page.key}-cta-${locale}`}
    >
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-10 lg:px-16">
        <h2
          id={`${page.key}-cta-${locale}`}
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
          className={`mt-10 inline-flex border px-8 py-4 font-body text-[0.62rem] uppercase tracking-[0.24em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
            dark
              ? 'border-white/25 text-white hover:bg-white hover:text-black focus-visible:outline-white'
              : 'border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline-neutral-900'
          }`}
        >
          {page.cta_label}
        </Link>
      </div>
    </section>
  );
}

function FullBleedHero({
  page,
  locale,
  dark = false,
}: {
  page: CmsExperienceCategoryPage;
  locale: SiteLocale;
  dark?: boolean;
}) {
  const image = getCmsImageUrl(page.hero_image);
  if (!image) throw new Error(`Missing ${locale}:${page.key} hero image`);

  return (
    <section className="relative flex min-h-[76vh] items-end overflow-hidden">
      <Image
        src={image}
        alt={page.hero_alt_text}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        unoptimized={isLocalAssetUrl(image)}
      />
      <div
        className={
          dark
            ? 'absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/20'
            : 'absolute inset-0 bg-gradient-to-t from-black/90 via-black/38 to-black/10'
        }
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 text-white sm:px-10 lg:px-16">
        <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/48">
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
  const positioningBodies = [
    editorialField(page, 'signature_positioning_body_1'),
    editorialField(page, 'signature_positioning_body_2'),
    editorialField(page, 'signature_positioning_body_3'),
  ];

  return (
    <main className="min-h-screen bg-[#EDEAE4]">
      <FullBleedHero page={page} locale={locale} />

      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
          <p className="font-display text-2xl font-light leading-relaxed text-neutral-900 md:text-3xl">
            {page.introduction}
          </p>
          <div className="border-t border-neutral-300 pt-8">
            {splitParagraphs(page.supporting_content).map((paragraph) => (
              <p key={paragraph} className="font-body text-sm leading-7 text-neutral-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16">
          <h2 className="max-w-[15ch] font-display text-3xl font-light leading-tight text-neutral-900 md:text-4xl">
            {editorialField(page, 'signature_positioning_title')}
          </h2>
          <div className="space-y-6 border-t border-neutral-200 pt-8">
            {positioningBodies.map((paragraph) => (
              <p key={paragraph} className="font-body text-sm leading-7 text-neutral-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#191916] py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
            <h2 className="max-w-[16ch] font-display text-3xl font-light leading-tight md:text-4xl">
              {editorialField(page, 'signature_composition_title')}
            </h2>
            <p className="border-t border-white/12 pt-8 font-body text-sm leading-7 text-white/60">
              {editorialField(page, 'signature_composition_body')}
            </p>
          </div>
          <blockquote className="mt-20 max-w-4xl border-l border-white/25 pl-8 font-display text-2xl font-light leading-relaxed text-white/82 md:ml-auto md:text-3xl">
            {editorialField(page, 'signature_distinction_body')}
          </blockquote>
        </div>
      </section>

      <ExperienceGrid page={page} experiences={experiences} locale={locale} />

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
          <h2 className="font-display text-3xl font-light leading-tight text-neutral-900 md:text-4xl">
            {editorialField(page, 'signature_inquiry_title')}
          </h2>
          <p className="border-t border-neutral-200 pt-8 font-body text-sm leading-7 text-neutral-600">
            {editorialField(page, 'signature_inquiry_body')}
          </p>
        </div>
      </section>

      <CategoryCta page={page} locale={locale} />
    </main>
  );
}

function LabCategoryLayout({
  page,
  experiences,
  locale,
}: {
  page: CmsExperienceCategoryPage;
  experiences: CmsExperience[];
  locale: SiteLocale;
}) {
  const image = getCmsImageUrl(page.hero_image);
  if (!image) throw new Error(`Missing ${locale}:lab hero image`);
  const principles = [1, 2, 3].map((number) => ({
    title: editorialField(page, `lab_principle_${number}_title` as keyof CmsExperienceCategoryPage),
    body: editorialField(page, `lab_principle_${number}_body` as keyof CmsExperienceCategoryPage),
  }));
  const process = [1, 2, 3, 4].map((number) => ({
    title: editorialField(
      page,
      `lab_process_step_${number}_title` as keyof CmsExperienceCategoryPage
    ),
    body: editorialField(
      page,
      `lab_process_step_${number}_body` as keyof CmsExperienceCategoryPage
    ),
  }));

  return (
    <main className="min-h-screen bg-[#EDEAE4]">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
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
        </div>
        <div className="relative h-[58vh] min-h-[430px] overflow-hidden lg:h-auto lg:min-h-screen">
          <Image
            src={image}
            alt={page.hero_alt_text}
            fill
            priority
            className="object-cover object-[center_38%]"
            sizes="(max-width: 1024px) 100vw, 54vw"
            unoptimized={isLocalAssetUrl(image)}
          />
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16">
          <div>
            <p className="font-display text-2xl font-light leading-relaxed text-neutral-900 md:text-3xl">
              {page.introduction}
            </p>
            <p className="mt-6 font-body text-sm leading-7 text-neutral-500">
              {page.supporting_content}
            </p>
          </div>
          <p className="border-t border-neutral-300 pt-8 font-body text-sm leading-7 text-neutral-600">
            {editorialField(page, 'lab_definition_body')}
          </p>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-16">
          <h2 className="max-w-[14ch] font-display text-3xl font-light leading-tight text-neutral-900 md:text-4xl">
            {editorialField(page, 'lab_context_title')}
          </h2>
          <p className="border-t border-neutral-200 pt-8 font-body text-sm leading-7 text-neutral-600">
            {editorialField(page, 'lab_context_body')}
          </p>
        </div>
      </section>

      <section className="bg-[#191916] py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <p className="mb-4 font-body text-[0.6rem] uppercase tracking-[0.3em] text-white/38">
            {editorialField(page, 'lab_principles_eyebrow')}
          </p>
          <h2 className="font-display text-3xl font-light md:text-4xl">
            {editorialField(page, 'lab_principles_title')}
          </h2>
          <div className="mt-14 grid border-t border-white/12 md:grid-cols-3">
            {principles.map((principle, index) => (
              <div
                key={principle.title}
                className={`py-8 md:px-8 ${index > 0 ? 'border-t border-white/12 md:border-l md:border-t-0' : ''}`}
              >
                <h3 className="font-display text-2xl font-light">{principle.title}</h3>
                <p className="mt-4 font-body text-sm leading-7 text-white/52">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16">
          <h2 className="font-display text-3xl font-light leading-tight text-neutral-900 md:text-4xl">
            {editorialField(page, 'lab_audience_title')}
          </h2>
          <div className="space-y-6 border-t border-neutral-200 pt-8">
            {[
              editorialField(page, 'lab_audience_body_1'),
              editorialField(page, 'lab_audience_body_2'),
            ].map((paragraph) => (
              <p key={paragraph} className="font-body text-sm leading-7 text-neutral-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <p className="mb-4 font-body text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400">
            {editorialField(page, 'lab_process_eyebrow')}
          </p>
          <h2 className="font-display text-3xl font-light text-neutral-900 md:text-4xl">
            {editorialField(page, 'lab_process_title')}
          </h2>
          <ol className="mt-14 grid border-t border-neutral-300 md:grid-cols-2 xl:grid-cols-4">
            {process.map((step, index) => (
              <li
                key={step.title}
                className={`py-8 md:px-8 ${index > 0 ? 'border-t border-neutral-300 md:border-l md:border-t-0' : ''}`}
              >
                <span className="font-body text-[0.58rem] tracking-[0.2em] text-neutral-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 font-display text-2xl font-light text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-4 font-body text-sm leading-7 text-neutral-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ExperienceGrid page={page} experiences={experiences} locale={locale} />

      <section className="bg-[#191916] py-24 text-white md:py-32">
        <p className="mx-auto max-w-4xl px-6 text-center font-display text-2xl font-light leading-relaxed text-white/82 sm:px-10 md:text-3xl lg:px-16">
          {editorialField(page, 'lab_closing_body')}
        </p>
      </section>

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
  const process = [1, 2, 3, 4].map((number) => ({
    title: editorialField(
      page,
      `black_process_step_${number}_title` as keyof CmsExperienceCategoryPage
    ),
    body: editorialField(
      page,
      `black_process_step_${number}_body` as keyof CmsExperienceCategoryPage
    ),
  }));

  return (
    <main className="min-h-screen bg-[#0d0d0b] text-white">
      <FullBleedHero page={page} locale={locale} dark />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <p className="max-w-4xl border-t border-white/12 pt-10 font-display text-2xl font-light leading-relaxed text-white/86 md:text-3xl">
            {page.introduction}
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#141411] py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-16">
          <h2 className="max-w-[14ch] font-display text-3xl font-light leading-tight md:text-4xl">
            {editorialField(page, 'black_context_title')}
          </h2>
          <p className="border-t border-white/12 pt-8 font-body text-sm leading-7 text-white/56">
            {editorialField(page, 'black_context_body')}
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <p className="mb-4 font-body text-[0.6rem] uppercase tracking-[0.3em] text-white/34">
            {editorialField(page, 'black_process_eyebrow')}
          </p>
          <h2 className="font-display text-3xl font-light md:text-4xl">
            {editorialField(page, 'black_process_title')}
          </h2>
          <ol className="mt-14 grid border-t border-white/12 md:grid-cols-2 xl:grid-cols-4">
            {process.map((step, index) => (
              <li
                key={step.title}
                className={`py-8 md:px-8 ${index > 0 ? 'border-t border-white/12 md:border-l md:border-t-0' : ''}`}
              >
                <span className="font-body text-[0.58rem] tracking-[0.2em] text-white/30">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 font-display text-2xl font-light">{step.title}</h3>
                <p className="mt-4 font-body text-sm leading-7 text-white/52">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#171713] py-24 md:py-32">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
          <h2 className="font-display text-3xl font-light leading-tight md:text-4xl">
            {editorialField(page, 'black_conditions_title')}
          </h2>
          <p className="border-t border-white/12 pt-8 font-body text-sm leading-7 text-white/56">
            {editorialField(page, 'black_conditions_body')}
          </p>
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
      id: item.documentId || item.slug,
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
