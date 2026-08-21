import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { filterPublicExperiences } from '@/lib/canonical-gates';
import { type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizePathname } from '@/lib/i18n/pathname';
import { getAvailableStaticRouteLocales } from '@/lib/i18n/static-routes';
import { buildLocaleOwnedMetadata } from '@/lib/seo';
import { fetchStrapi } from '@/lib/strapi';
import { collectionFeatures } from './experiences';

export type ExperienceCategory = 'signature' | 'lab' | 'black';

export function buildExperienceCategoryMetadata(
  category: ExperienceCategory,
  locale: SiteLocale
): Metadata {
  const dictionary = getDictionary(locale);
  const copy = dictionary[category];
  const path = `/experiences/${category}`;
  const feature = collectionFeatures.find((item) => item.href.endsWith(`/${category}`));

  return buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: { family: 'experience-category', locale, slug: category },
    title: `${copy.label} — ${copy.title}`,
    description: `${copy.description1} ${copy.description2}`,
    image: feature?.image,
    imageAlt: copy.label,
    robots: { index: true, follow: true },
    availableLocales: getAvailableStaticRouteLocales(path),
  });
}

interface StrapiExperience {
  id: number;
  title: string;
  short_description?: string;
  slug?: string;
  category?: string;
  visibility_status?: string;
  publishedAt?: string | null;
}

function isExperience(item: unknown): item is StrapiExperience {
  if (!item || typeof item !== 'object') return false;

  const record = item as Record<string, unknown>;
  return (
    typeof record.title === 'string' &&
    record.title.length > 0 &&
    typeof record.slug === 'string' &&
    record.slug.length > 0
  );
}

async function fetchCategoryExperiences(
  category: ExperienceCategory,
  locale: SiteLocale
): Promise<StrapiExperience[]> {
  const params = new URLSearchParams({
    'filters[category][$eqi]': category,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'short_description',
    'fields[3]': 'category',
    'fields[4]': 'visibility_status',
    'fields[5]': 'publishedAt',
    'pagination[pageSize]': '100',
  });

  try {
    const json = await fetchStrapi(`/api/experiences?${params.toString()}`, { locale });
    const items: unknown[] = Array.isArray(json?.data) ? json.data : [];

    return filterPublicExperiences(items.filter(isExperience)).filter(
      (item) => item.category?.trim().toLowerCase() === category
    );
  } catch {
    return [];
  }
}

export async function renderExperienceCategoryPage(
  category: ExperienceCategory,
  locale: SiteLocale
) {
  const dictionary = getDictionary(locale);
  const feature = collectionFeatures.find((item) => item.href.endsWith(`/${category}`));
  const collectionCopy = dictionary[category];
  const experiences = await fetchCategoryExperiences(category, locale);

  if (!feature) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-[72vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={feature.image}
            alt={collectionCopy.label}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/52 to-black/18" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16">
          <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/42">
            {dictionary.experiences.collection}
          </p>
          <h1
            className="max-w-4xl font-display font-light leading-[1.05] text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.8rem)' }}
          >
            {collectionCopy.label}
          </h1>
          <p className="mt-8 max-w-2xl font-display text-xl font-light leading-relaxed text-white/82 sm:text-2xl">
            {collectionCopy.title}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 md:py-24 lg:px-16">
        <Link
          href={localizePathname('/experiences', locale)}
          className="font-body text-[0.6rem] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white/80"
        >
          &larr; {dictionary.experiences.title}
        </Link>
        <div className="mt-12 max-w-3xl border-t border-white/10 pt-12">
          <p className="font-body text-sm leading-relaxed text-white/68">
            {collectionCopy.description1}
          </p>
          <p className="mt-5 font-body text-sm leading-relaxed text-white/48">
            {collectionCopy.description2}
          </p>
        </div>
      </section>

      {experiences.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-32 sm:px-10 lg:px-16">
          <div className="border-t border-white/10 pt-14">
            <p className="mb-10 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/35">
              {dictionary.experiences.collection}
            </p>
          </div>
          <ul className="divide-y divide-white/10">
            {experiences.map((item) => (
              <li key={item.id}>
                <Link
                  href={localizePathname(`/experiences/${item.slug}`, locale)}
                  className="group -mx-2 flex flex-col justify-between gap-4 px-2 py-8 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center"
                  aria-label={`${dictionary.common.enter} ${item.title}`}
                >
                  <div className="flex-1">
                    <h2 className="mb-2 font-display text-lg font-light text-white transition-colors group-hover:text-white/78">
                      {item.title}
                    </h2>
                    {item.short_description ? (
                      <p className="max-w-2xl font-body text-sm leading-relaxed text-white/42">
                        {item.short_description}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-body text-[0.62rem] uppercase tracking-[0.22em] text-white/35 transition-colors group-hover:text-white/62">
                    {dictionary.culturalWorlds.viewExperience} &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
