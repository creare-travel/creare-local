import { ImageResponse } from 'next/og';
import { isPublicExperienceRecord } from '@/lib/canonical-gates';
import { buildCloudinaryUrl } from '@/lib/cloudinary';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';
import { getExperienceBySlug } from '@/lib/experiences';

export const runtime = 'edge';
export const alt = 'Creare Experience';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const GOVERNED_TABLE_TO_FARM_HERO_URL = buildCloudinaryUrl(
  'creare/experiences/table-to-farm-bodrum/hero/main',
  { profile: 'hero' }
);

const EXPERIENCE_SLUG_CANONICAL_MAP: Record<string, string> = {
  'beylerbeyi-1869': 'beylerbeyi-1869',
  'beylerbeyi-1869-empire-interrupted': 'beylerbeyi-1869',
  'beylerbeyi-1869tm-empire-interrupted': 'beylerbeyi-1869',
  'imperial-flavors': 'imperial-flavors',
  'imperial-flavors-culinary-atelier': 'imperial-flavors',
};

interface StrapiImageFormat {
  url: string;
}

interface StrapiCoverImage {
  url?: string;
  formats?: {
    large?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    small?: StrapiImageFormat;
  };
}

interface StrapiDestination {
  name?: string;
}

interface StrapiExperienceOgRecord {
  title?: string;
  slug?: string;
  category?: string | null;
  location_label?: string | null;
  destination?: StrapiDestination | null;
  cover_image?: StrapiCoverImage | null;
  visibility_status?: string | null;
  publishedAt?: string | null;
}

function flattenItem<T>(raw: Record<string, unknown>): T {
  if (raw?.attributes && typeof raw.attributes === 'object') {
    return { id: raw.id, ...(raw.attributes as object) } as T;
  }

  return raw as T;
}

function normalizeSingleRelation<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object') return null;

  if ('data' in (value as { data?: unknown })) {
    const relationData = (value as { data?: unknown }).data;
    if (!relationData || typeof relationData !== 'object') return null;
    return flattenItem<T>(relationData as Record<string, unknown>);
  }

  return value as T;
}

function getExperienceAliasCandidates(slug: string) {
  const normalizedSlug = slug.trim();
  const familyCanonicalSlug = EXPERIENCE_SLUG_CANONICAL_MAP[normalizedSlug];

  if (!familyCanonicalSlug) {
    return [normalizedSlug];
  }

  const familySlugs = Object.entries(EXPERIENCE_SLUG_CANONICAL_MAP)
    .filter(([, canonicalSlug]) => canonicalSlug === familyCanonicalSlug)
    .map(([aliasSlug]) => aliasSlug);

  return [normalizedSlug, ...familySlugs.filter((aliasSlug) => aliasSlug !== normalizedSlug)];
}

function getStrapiExperienceImageUrl(item: StrapiExperienceOgRecord | null) {
  if (!item) return null;

  const rawUrl =
    item.cover_image?.formats?.large?.url ||
    item.cover_image?.formats?.medium?.url ||
    item.cover_image?.formats?.small?.url ||
    item.cover_image?.url;

  return rawUrl ? mediaUrl(rawUrl) : null;
}

function getGovernedCloudinaryExperienceImageUrl(slug: string) {
  if (slug === 'table-to-farm-bodrum') {
    return GOVERNED_TABLE_TO_FARM_HERO_URL;
  }

  return null;
}

async function fetchExperienceOgRecordBySlug(
  slug: string
): Promise<StrapiExperienceOgRecord | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'fields[0]': 'slug',
    'fields[1]': 'title',
    'fields[2]': 'category',
    'fields[3]': 'location_label',
    'fields[4]': 'visibility_status',
    'fields[5]': 'publishedAt',
    'populate[destination][fields][0]': 'name',
    'populate[cover_image]': 'true',
  });

  try {
    const json = await fetchStrapi(`/api/experiences?${params.toString()}`);
    const items = Array.isArray(json?.data) ? json.data : [];
    const rawItem = items[0];

    if (!rawItem || typeof rawItem !== 'object') {
      return null;
    }

    const item = flattenItem<StrapiExperienceOgRecord>(rawItem as Record<string, unknown>);
    const normalizedItem: StrapiExperienceOgRecord = {
      ...item,
      destination: normalizeSingleRelation<StrapiDestination>(item.destination) ?? undefined,
      cover_image: normalizeSingleRelation<StrapiCoverImage>(item.cover_image) ?? undefined,
    };

    return isPublicExperienceRecord(normalizedItem) ? normalizedItem : null;
  } catch (error) {
    console.error(`Failed to fetch OG experience data for slug "${slug}".`, error);
    return null;
  }
}

async function resolveExperienceOgRecord(slug: string): Promise<StrapiExperienceOgRecord | null> {
  const candidateSlugs = getExperienceAliasCandidates(slug);

  for (const candidateSlug of candidateSlugs) {
    const item = await fetchExperienceOgRecordBySlug(candidateSlug);
    if (item) return item;
  }

  return null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ExperienceOgImage({ params }: Props) {
  const { slug } = await params;
  const [strapiExperience, legacyExperience] = await Promise.all([
    resolveExperienceOgRecord(slug),
    Promise.resolve(getExperienceBySlug(slug)),
  ]);

  const title = strapiExperience?.title ?? legacyExperience?.title ?? 'Private Experience';
  const location =
    strapiExperience?.destination?.name ??
    strapiExperience?.location_label ??
    legacyExperience?.location ??
    'Turkey';
  const category = strapiExperience?.category ?? legacyExperience?.category ?? 'SIGNATURE';
  const heroImage =
    getStrapiExperienceImageUrl(strapiExperience) ??
    getGovernedCloudinaryExperienceImageUrl(strapiExperience?.slug ?? slug) ??
    DEFAULT_OG_IMAGE;

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Hero image background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          ...(heroImage
            ? {
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : {
                background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1410 100%)',
              }),
        }}
      />

      {/* Dark gradient overlay — bottom-heavy for text legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Category badge — top left */}
      <div
        style={{
          position: 'absolute',
          top: '56px',
          left: '72px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {category}™
        </span>
      </div>

      {/* CREARE brand — top right */}
      <span
        style={{
          position: 'absolute',
          top: '56px',
          right: '72px',
          fontSize: '11px',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        CREARE
      </span>

      {/* Content block — bottom left */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '0 72px 64px',
          zIndex: 1,
        }}
      >
        {/* Title */}
        <span
          style={{
            fontSize: '58px',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            maxWidth: '820px',
          }}
        >
          {title}
        </span>

        {/* Location line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {location}
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
