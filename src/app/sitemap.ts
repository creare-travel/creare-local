import { MetadataRoute } from 'next';
import {
  filterCanonicalCulturalWorlds,
  filterPublicExperiences,
  filterPublicInsights,
} from '@/lib/canonical-gates';
import { fetchStrapi } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://crearetravel.com';
const LAST_MODIFIED = new Date('2026-04-07');

interface SitemapDestination {
  id: number;
  slug?: string;
  visibility_status?: string;
}

interface SitemapExperience {
  id: number;
  slug?: string;
  category?: string;
  title?: string;
  visibility_status?: string;
  publishedAt?: string | null;
}

interface SitemapInsight {
  id: number;
  slug?: string;
  title?: string;
  visibility_status?: string;
  publishedAt?: string | null;
}

const LEGACY_INSIGHT_SLUG_MAP: Record<string, string> = {
  'the-private-life-of-istanbul': 'private-life-of-istanbul',
};

function flattenDestination(raw: Record<string, unknown>): SitemapDestination {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as SitemapDestination;
  }

  return raw as unknown as SitemapDestination;
}

function flattenExperience(raw: Record<string, unknown>): SitemapExperience {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as SitemapExperience;
  }

  return raw as unknown as SitemapExperience;
}

function flattenInsight(raw: Record<string, unknown>): SitemapInsight {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as SitemapInsight;
  }

  return raw as unknown as SitemapInsight;
}

async function fetchActiveCulturalWorldUrls() {
  const path =
    '/api/destinations?filters[visibility_status][$eqi]=active&fields[0]=slug&fields[1]=visibility_status';

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return filterCanonicalCulturalWorlds(items.map((item) => flattenDestination(item))).map(
      (item) => ({
        url: `${BASE_URL}/cultural-worlds/${item.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })
    );
  } catch (error) {
    console.error('Failed to build dynamic cultural-world sitemap entries.', {
      route: '/sitemap.xml',
      strapiPath: path,
      error,
    });
    return [
      {
        url: `${BASE_URL}/cultural-worlds/istanbul`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      },
      {
        url: `${BASE_URL}/cultural-worlds/bodrum`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      },
      {
        url: `${BASE_URL}/cultural-worlds/cappadocia`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      },
    ];
  }
}

async function fetchCanonicalExperienceUrls() {
  const path =
    '/api/experiences?fields[0]=slug&fields[1]=category&fields[2]=title&fields[3]=visibility_status&fields[4]=publishedAt&pagination[pageSize]=100';

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return filterPublicExperiences(items.map((item) => flattenExperience(item)))
      .filter((item) => item.slug)
      .filter((item) => item.category?.toLowerCase() !== 'black')
      .map((item) => ({
        url: `${BASE_URL}/experiences/${item.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error('Failed to build dynamic experience sitemap entries.', {
      route: '/sitemap.xml',
      strapiPath: path,
      error,
    });
    return [];
  }
}

async function fetchCanonicalInsightUrls() {
  const path =
    '/api/insights?fields[0]=slug&fields[1]=title&fields[2]=visibility_status&fields[3]=publishedAt&pagination[pageSize]=100';

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    const seen = new Set<string>();

    return filterPublicInsights(items.map((item) => flattenInsight(item)))
      .map((item) => ({
        ...item,
        slug: LEGACY_INSIGHT_SLUG_MAP[item.slug ?? ''] ?? item.slug,
      }))
      .filter((item) => item.slug)
      .filter((item) => {
        if (!item.slug || seen.has(item.slug)) return false;
        seen.add(item.slug);
        return true;
      })
      .map((item) => ({
        url: `${BASE_URL}/insights/${item.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      }));
  } catch (error) {
    console.error('Failed to build dynamic insight sitemap entries.', {
      route: '/sitemap.xml',
      strapiPath: path,
      error,
    });
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [culturalWorldEntries, experienceEntries, insightEntries] = await Promise.all([
    fetchActiveCulturalWorldUrls(),
    fetchCanonicalExperienceUrls(),
    fetchCanonicalInsightUrls(),
  ]);

  return [
    // Core
    { url: `${BASE_URL}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1.0 },

    // Experiences — canonical routes only (BLACK excluded: invitation-only, noindex)
    {
      url: `${BASE_URL}/experiences`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/experiences/lab`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/experiences/signature`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...experienceEntries,

    // Cultural Worlds — semantic SEO engine
    {
      url: `${BASE_URL}/cultural-worlds`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...culturalWorldEntries,
    {
      url: `${BASE_URL}/insights`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...insightEntries,
    // Core pages
    {
      url: `${BASE_URL}/philosophy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
