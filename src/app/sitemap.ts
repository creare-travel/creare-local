import { MetadataRoute } from 'next';
import {
  filterCanonicalCulturalWorlds,
  filterPublicExperiences,
  filterPublicInsights,
  isPublicInsightRecord,
} from '@/lib/canonical-gates';
import { insights as localInsights } from '@/data/insights';
import { DEFAULT_SITE_LOCALE, SUPPORTED_SITE_LOCALES, type SiteLocale } from '@/lib/i18n/config';
import { localizePathname } from '@/lib/i18n/pathname';
import {
  SITE_URL,
  buildLanguageAlternatesFromLocalizedPaths,
  buildLocalizedLanguageAlternates,
} from '@/lib/seo';
import { getAvailableStaticRouteLocales } from '@/lib/i18n/static-routes';
import { fetchStrapi } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

type SitemapEntry = MetadataRoute.Sitemap[number];

interface SitemapRecord {
  id: number;
  documentId?: string;
  slug?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

interface SitemapDestination extends SitemapRecord {
  name?: string;
  visibility_status?: string;
}

interface SitemapExperience extends SitemapRecord {
  category?: string;
  title?: string;
  visibility_status?: string;
}

interface SitemapInsight extends SitemapRecord {
  title?: string;
}

interface LocalizedInventory<T extends SitemapRecord> {
  locale: SiteLocale;
  records: T[];
}

const LEGACY_INSIGHT_SLUG_MAP: Record<string, string> = {
  'the-private-life-of-istanbul': 'private-life-of-istanbul',
};

function flattenRecord<T>(raw: Record<string, unknown>): T {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as T;
  }

  return raw as unknown as T;
}

function canonicalInsightSlug(slug?: string | null) {
  if (!slug) return undefined;
  return LEGACY_INSIGHT_SLUG_MAP[slug] ?? slug;
}

function resolveLastModified(value?: string | null, fallback?: string | null) {
  const candidate = value ?? fallback;
  if (!candidate) return undefined;

  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function createEntry(
  path: string,
  options: {
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
    lastModified?: Date;
    alternates?: SitemapEntry['alternates'];
  }
): SitemapEntry {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    ...(options.lastModified ? { lastModified: options.lastModified } : {}),
    ...(options.alternates ? { alternates: options.alternates } : {}),
  };
}

function createLocalizedStaticEntries(
  path: string,
  options: Pick<Parameters<typeof createEntry>[1], 'changeFrequency' | 'priority'>
): SitemapEntry[] {
  const availableLocales = getAvailableStaticRouteLocales(path);
  const alternates = {
    languages: buildLocalizedLanguageAlternates(path, availableLocales),
  };

  return availableLocales.map((locale) =>
    createEntry(localizePathname(path, locale), { ...options, alternates })
  );
}

function isLocalizedCounterpart(left: SitemapRecord, right: SitemapRecord) {
  if (left.documentId && right.documentId) {
    return left.documentId === right.documentId;
  }

  return Boolean(left.slug && right.slug && left.slug === right.slug);
}

function dedupeBySlug<T extends SitemapRecord>(records: T[]): T[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    if (!record.slug || seen.has(record.slug)) return false;
    seen.add(record.slug);
    return true;
  });
}

function buildLocalizedDetailEntries<T extends SitemapRecord>(
  inventories: ReadonlyArray<LocalizedInventory<T>>,
  pathPrefix: '/cultural-worlds' | '/experiences' | '/insights',
  options: Pick<Parameters<typeof createEntry>[1], 'changeFrequency' | 'priority'>
): SitemapEntry[] {
  const buildEntries = ({ locale, records }: LocalizedInventory<T>): SitemapEntry[] =>
    records.flatMap((record) => {
      if (!record.slug) return [];

      const path = localizePathname(`${pathPrefix}/${record.slug}`, locale);
      const localizedPaths = Object.fromEntries(
        inventories.flatMap((inventory) => {
          const counterpart = inventory.records.find((candidate) =>
            isLocalizedCounterpart(record, candidate)
          );
          return counterpart?.slug
            ? [
                [
                  inventory.locale,
                  localizePathname(`${pathPrefix}/${counterpart.slug}`, inventory.locale),
                ],
              ]
            : [];
        })
      ) as Partial<Record<SiteLocale, string>>;
      const languages = buildLanguageAlternatesFromLocalizedPaths(localizedPaths);

      return [
        createEntry(path, {
          ...options,
          lastModified: resolveLastModified(record.updatedAt, record.publishedAt),
          ...(Object.keys(languages).length > 0 ? { alternates: { languages } } : {}),
        }),
      ];
    });

  return inventories.flatMap(buildEntries).sort((a, b) => a.url.localeCompare(b.url));
}

async function fetchActiveCulturalWorldRecords(locale: SiteLocale): Promise<SitemapDestination[]> {
  const path =
    '/api/destinations?status=published&fields[0]=slug&fields[1]=name&fields[2]=visibility_status&fields[3]=publishedAt&fields[4]=updatedAt&pagination[pageSize]=100';

  try {
    const json = await fetchStrapi(path, { locale });
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return dedupeBySlug(
      filterCanonicalCulturalWorlds(items.map((item) => flattenRecord<SitemapDestination>(item)))
    );
  } catch (error) {
    console.error('Failed to build dynamic cultural-world sitemap entries.', {
      route: '/sitemap.xml',
      locale,
      strapiPath: path,
      error,
    });

    if (locale !== DEFAULT_SITE_LOCALE) return [];

    return ['bodrum', 'cappadocia', 'istanbul'].map((slug, index) => ({
      id: 9000 + index,
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      visibility_status: 'active',
    }));
  }
}

async function fetchCanonicalExperienceRecords(locale: SiteLocale): Promise<SitemapExperience[]> {
  const path =
    '/api/experiences?status=published&fields[0]=slug&fields[1]=category&fields[2]=title&fields[3]=visibility_status&fields[4]=publishedAt&fields[5]=updatedAt&pagination[pageSize]=100';

  try {
    const json = await fetchStrapi(path, { locale });
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
    const strapiRecords = filterPublicExperiences(
      items.map((item) => flattenRecord<SitemapExperience>(item))
    ).filter((item) => item.category?.toLowerCase() !== 'black');

    return dedupeBySlug(strapiRecords);
  } catch (error) {
    console.error('Failed to build dynamic experience sitemap entries.', {
      route: '/sitemap.xml',
      locale,
      strapiPath: path,
      error,
    });

    return [];
  }
}

function buildLocalInsightInventory(): SitemapInsight[] {
  return localInsights.map((insight, index) => ({
    id: index + 1,
    slug: insight.slug,
    title: insight.title,
  }));
}

async function fetchCanonicalInsightRecords(locale: SiteLocale): Promise<SitemapInsight[]> {
  const path =
    '/api/insights?status=published&fields[0]=slug&fields[1]=title&fields[2]=publishedAt&fields[3]=updatedAt&pagination[pageSize]=100';

  let strapiInsights: SitemapInsight[] = [];

  try {
    const json = await fetchStrapi(path, { locale });
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
    strapiInsights = filterPublicInsights(items.map((item) => flattenRecord<SitemapInsight>(item)));
  } catch (error) {
    console.error('Failed to fetch dynamic insight sitemap entries.', {
      route: '/sitemap.xml',
      locale,
      strapiPath: path,
      error,
    });
  }

  const merged =
    locale === 'en' ? [...strapiInsights, ...buildLocalInsightInventory()] : strapiInsights;

  return dedupeBySlug(
    merged
      .map((item) => ({
        ...item,
        slug: canonicalInsightSlug(item.slug),
      }))
      .filter((item) => isPublicInsightRecord(item))
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [culturalWorldInventories, experienceInventories, insightInventories] = await Promise.all([
    Promise.all(
      SUPPORTED_SITE_LOCALES.map(async (locale) => ({
        locale,
        records: await fetchActiveCulturalWorldRecords(locale),
      }))
    ),
    Promise.all(
      SUPPORTED_SITE_LOCALES.map(async (locale) => ({
        locale,
        records: await fetchCanonicalExperienceRecords(locale),
      }))
    ),
    Promise.all(
      SUPPORTED_SITE_LOCALES.map(async (locale) => ({
        locale,
        records: await fetchCanonicalInsightRecords(locale),
      }))
    ),
  ]);

  const culturalWorldEntries = buildLocalizedDetailEntries(
    culturalWorldInventories,
    '/cultural-worlds',
    { changeFrequency: 'weekly', priority: 0.85 }
  );
  const experienceEntries = buildLocalizedDetailEntries(experienceInventories, '/experiences', {
    changeFrequency: 'monthly',
    priority: 0.8,
  });
  const insightEntries = buildLocalizedDetailEntries(insightInventories, '/insights', {
    changeFrequency: 'monthly',
    priority: 0.75,
  });

  return [
    ...createLocalizedStaticEntries('/', { changeFrequency: 'weekly', priority: 1.0 }),
    ...createLocalizedStaticEntries('/experiences', {
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
    ...createLocalizedStaticEntries('/experiences/lab', {
      changeFrequency: 'weekly',
      priority: 0.85,
    }),
    ...createLocalizedStaticEntries('/experiences/signature', {
      changeFrequency: 'weekly',
      priority: 0.85,
    }),
    ...createLocalizedStaticEntries('/experiences/black', {
      changeFrequency: 'weekly',
      priority: 0.85,
    }),
    ...experienceEntries,
    ...createLocalizedStaticEntries('/cultural-worlds', {
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
    ...culturalWorldEntries,
    ...createLocalizedStaticEntries('/insights', {
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
    ...insightEntries,
    ...createLocalizedStaticEntries('/philosophy', {
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    ...createLocalizedStaticEntries('/contact', {
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    ...createLocalizedStaticEntries('/privacy', {
      changeFrequency: 'monthly',
      priority: 0.4,
    }),
    ...createLocalizedStaticEntries('/terms', {
      changeFrequency: 'monthly',
      priority: 0.4,
    }),
    ...createLocalizedStaticEntries('/cookies', {
      changeFrequency: 'monthly',
      priority: 0.4,
    }),
  ];
}
