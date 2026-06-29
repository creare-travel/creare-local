import { MetadataRoute } from 'next';
import {
  filterCanonicalCulturalWorlds,
  filterPublicExperiences,
  filterPublicInsights,
  isPublicInsightRecord,
} from '@/lib/canonical-gates';
import { insights as localInsights } from '@/data/insights';
import { fetchStrapi } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://crearetravel.com';

type SitemapEntry = MetadataRoute.Sitemap[number];

interface SitemapDestination {
  id: number;
  slug?: string;
  name?: string;
  visibility_status?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

interface SitemapExperience {
  id: number;
  slug?: string;
  category?: string;
  title?: string;
  visibility_status?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

interface SitemapInsight {
  id: number;
  slug?: string;
  title?: string;
  visibility_status?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
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
  }
): SitemapEntry {
  return {
    url: `${BASE_URL}${path}`,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    ...(options.lastModified ? { lastModified: options.lastModified } : {}),
  };
}

async function fetchActiveCulturalWorldUrls() {
  const path =
    '/api/destinations?fields[0]=slug&fields[1]=name&fields[2]=visibility_status&fields[3]=publishedAt&fields[4]=updatedAt&pagination[pageSize]=100';

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return filterCanonicalCulturalWorlds(
      items.map((item) => flattenRecord<SitemapDestination>(item))
    )
      .map((item) =>
        createEntry(`/cultural-worlds/${item.slug}`, {
          lastModified: resolveLastModified(item.updatedAt, item.publishedAt),
          changeFrequency: 'weekly',
          priority: 0.85,
        })
      )
      .sort((a, b) => a.url.localeCompare(b.url));
  } catch (error) {
    console.error('Failed to build dynamic cultural-world sitemap entries.', {
      route: '/sitemap.xml',
      strapiPath: path,
      error,
    });

    return [
      createEntry('/cultural-worlds/bodrum', {
        changeFrequency: 'weekly',
        priority: 0.85,
      }),
      createEntry('/cultural-worlds/cappadocia', {
        changeFrequency: 'weekly',
        priority: 0.85,
      }),
      createEntry('/cultural-worlds/istanbul', {
        changeFrequency: 'weekly',
        priority: 0.85,
      }),
    ];
  }
}

async function fetchCanonicalExperienceUrls() {
  const path =
    '/api/experiences?fields[0]=slug&fields[1]=category&fields[2]=title&fields[3]=visibility_status&fields[4]=publishedAt&fields[5]=updatedAt&pagination[pageSize]=100';

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return filterPublicExperiences(items.map((item) => flattenRecord<SitemapExperience>(item)))
      .filter((item) => item.slug)
      .filter((item) => item.category?.toLowerCase() !== 'black')
      .map((item) =>
        createEntry(`/experiences/${item.slug}`, {
          lastModified: resolveLastModified(item.updatedAt, item.publishedAt),
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      )
      .sort((a, b) => a.url.localeCompare(b.url));
  } catch (error) {
    console.error('Failed to build dynamic experience sitemap entries.', {
      route: '/sitemap.xml',
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
    visibility_status: 'published',
  }));
}

async function fetchCanonicalInsightUrls() {
  const path =
    '/api/insights?fields[0]=slug&fields[1]=title&fields[2]=visibility_status&fields[3]=publishedAt&fields[4]=updatedAt&pagination[pageSize]=100';

  let strapiInsights: SitemapInsight[] = [];

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
    strapiInsights = filterPublicInsights(items.map((item) => flattenRecord<SitemapInsight>(item)));
  } catch (error) {
    console.error('Failed to fetch dynamic insight sitemap entries.', {
      route: '/sitemap.xml',
      strapiPath: path,
      error,
    });
  }

  const merged = [...strapiInsights, ...buildLocalInsightInventory()];
  const seen = new Set<string>();

  return merged
    .map((item) => ({
      ...item,
      slug: canonicalInsightSlug(item.slug),
    }))
    .filter((item) => isPublicInsightRecord(item))
    .filter((item) => item.slug)
    .filter((item) => {
      if (!item.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .map((item) =>
      createEntry(`/insights/${item.slug}`, {
        lastModified: resolveLastModified(item.updatedAt, item.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.75,
      })
    )
    .sort((a, b) => a.url.localeCompare(b.url));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [culturalWorldEntries, experienceEntries, insightEntries] = await Promise.all([
    fetchActiveCulturalWorldUrls(),
    fetchCanonicalExperienceUrls(),
    fetchCanonicalInsightUrls(),
  ]);

  return [
    createEntry('/', { changeFrequency: 'weekly', priority: 1.0 }),
    createEntry('/experiences', { changeFrequency: 'weekly', priority: 0.9 }),
    createEntry('/experiences/lab', { changeFrequency: 'weekly', priority: 0.85 }),
    createEntry('/experiences/signature', { changeFrequency: 'weekly', priority: 0.85 }),
    createEntry('/experiences/black', { changeFrequency: 'weekly', priority: 0.85 }),
    ...experienceEntries,
    createEntry('/cultural-worlds', { changeFrequency: 'weekly', priority: 0.9 }),
    ...culturalWorldEntries,
    createEntry('/insights', { changeFrequency: 'weekly', priority: 0.8 }),
    ...insightEntries,
    createEntry('/philosophy', { changeFrequency: 'monthly', priority: 0.7 }),
    createEntry('/contact', { changeFrequency: 'monthly', priority: 0.7 }),
    createEntry('/privacy', { changeFrequency: 'monthly', priority: 0.4 }),
    createEntry('/terms', { changeFrequency: 'monthly', priority: 0.4 }),
    createEntry('/cookies', { changeFrequency: 'monthly', priority: 0.4 }),
  ];
}
