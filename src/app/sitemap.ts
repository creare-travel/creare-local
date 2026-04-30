import { MetadataRoute } from 'next';
import { fetchStrapi } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://crearetravel.com';
const LAST_MODIFIED = new Date('2026-04-07');

interface SitemapDestination {
  id: number;
  slug?: string;
  visibility_status?: string;
}

function flattenDestination(raw: Record<string, unknown>): SitemapDestination {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: Number(raw.id), ...(raw.attributes as object) } as SitemapDestination;
  }

  return raw as unknown as SitemapDestination;
}

async function fetchActiveCulturalWorldUrls() {
  const path =
    '/api/destinations?filters[visibility_status][$eqi]=active&fields[0]=slug&fields[1]=visibility_status';

  try {
    const json = await fetchStrapi(path);
    const items: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];

    return items
      .map((item) => flattenDestination(item))
      .filter((item) => item.slug && item.visibility_status?.toLowerCase() === 'active')
      .map((item) => ({
        url: `${BASE_URL}/cultural-worlds/${item.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const culturalWorldEntries = await fetchActiveCulturalWorldUrls();

  return [
    // Core
    { url: `${BASE_URL}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1.0 },

    // Experiences — canonical routes only (BLACK excluded: invitation-only, noindex)
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

    // Signature Experience detail pages
    {
      url: `${BASE_URL}/experiences/floating-salon-d-opera`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/beylerbeyi-1869`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/imperial-flavors`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/istanbul-through-the-lens`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/curated-art-salon`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/silk-road-istanbul`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/table-to-farm-bodrum`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experiences/private-bosphorus-access`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/experiences/closed-collection-viewing`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/experiences/after-hours-palace`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },

    // LAB Experience detail pages
    {
      url: `${BASE_URL}/experiences/open-studio-istanbul`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/experiences/cultural-immersion-lab`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/experiences/narrative-workshop`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.75,
    },

    // Cultural Worlds — semantic SEO engine
    {
      url: `${BASE_URL}/cultural-worlds`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...culturalWorldEntries,
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
