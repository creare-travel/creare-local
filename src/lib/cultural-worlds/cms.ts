import { filterCanonicalCulturalWorlds } from '@/lib/canonical-gates';
import { getCmsImageUrl, normalizeSingleRelation, type CmsImage } from '@/lib/experiences/cms';
import type { SiteLocale } from '@/lib/i18n/config';
import { fetchStrapi } from '@/lib/strapi';

export interface CmsCulturalWorldPage {
  id: number;
  documentId: string;
  locale: string;
  eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  atlas_eyebrow: string;
  atlas_title: string;
  atlas_body: string;
  destination_section_eyebrow: string;
  destination_section_title: string;
  destination_section_supporting_text: string;
  rail_previous_label: string;
  rail_next_label: string;
  destination_cta_label: string;
  seo_title: string;
  seo_description: string;
  og_description: string;
  hero_alt_text: string;
  hero_image: CmsImage;
  publishedAt?: string | null;
}

export interface CmsCulturalWorldDestination {
  id: number;
  documentId: string;
  locale: string;
  name: string;
  slug: string;
  visibility_status: string;
  highlight: string;
  short_description: string;
  order?: number | null;
  cover_image: CmsImage;
  publishedAt?: string | null;
}

const PAGE_REQUIRED_FIELDS = [
  'documentId',
  'locale',
  'eyebrow',
  'hero_title',
  'hero_subtitle',
  'atlas_eyebrow',
  'atlas_title',
  'atlas_body',
  'destination_section_eyebrow',
  'destination_section_title',
  'destination_section_supporting_text',
  'rail_previous_label',
  'rail_next_label',
  'destination_cta_label',
  'seo_title',
  'seo_description',
  'og_description',
  'hero_alt_text',
] as const;

const DESTINATION_REQUIRED_FIELDS = [
  'documentId',
  'locale',
  'name',
  'slug',
  'visibility_status',
  'highlight',
  'short_description',
] as const;

const EDITORIAL_ORDER = ['istanbul', 'cappadocia', 'bodrum'] as const;

function flattenItem<T>(raw: Record<string, unknown>): T {
  if (raw.attributes && typeof raw.attributes === 'object') {
    return { id: raw.id, ...(raw.attributes as object) } as T;
  }

  return raw as T;
}

function assertRequiredTextFields(
  record: Record<string, unknown>,
  fields: readonly string[],
  identity: string
) {
  const missing = fields.filter(
    (field) => typeof record[field] !== 'string' || !(record[field] as string).trim()
  );

  if (missing.length > 0) {
    throw new Error(
      `Incomplete CMS Cultural Worlds contract for ${identity}: ${missing.join(', ')}`
    );
  }
}

function normalizeRequiredImage(value: unknown, identity: string): CmsImage {
  const image = normalizeSingleRelation<CmsImage>(value);
  if (!image?.url || !getCmsImageUrl(image)) {
    throw new Error(`Missing CMS media relation for ${identity}`);
  }
  return image;
}

export async function fetchCulturalWorldPage(locale: SiteLocale): Promise<CmsCulturalWorldPage> {
  const json = await fetchStrapi(
    '/api/cultural-world-page?status=published&populate[hero_image]=true',
    { locale }
  );
  const raw = json?.data;
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Missing published Cultural Worlds page for ${locale}`);
  }

  const page = flattenItem<CmsCulturalWorldPage>(raw as Record<string, unknown>);
  assertRequiredTextFields(
    page as unknown as Record<string, unknown>,
    PAGE_REQUIRED_FIELDS,
    `${locale}:cultural-worlds`
  );

  return {
    ...page,
    hero_image: normalizeRequiredImage(page.hero_image, `${locale}:cultural-worlds:hero_image`),
  };
}

export async function fetchCulturalWorldDestinations(
  locale: SiteLocale
): Promise<CmsCulturalWorldDestination[]> {
  const params = new URLSearchParams({
    status: 'published',
    'filters[visibility_status][$eqi]': 'active',
    'populate[cover_image]': 'true',
    'pagination[pageSize]': '100',
  });
  [
    'documentId',
    'locale',
    'name',
    'slug',
    'visibility_status',
    'highlight',
    'short_description',
    'publishedAt',
  ].forEach((field, index) => params.set(`fields[${index}]`, field));
  const json = await fetchStrapi(`/api/destinations?${params.toString()}`, { locale });
  const rawItems: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
  const destinations = filterCanonicalCulturalWorlds(
    rawItems.map((raw) => flattenItem<CmsCulturalWorldDestination>(raw))
  );

  for (const destination of destinations) {
    assertRequiredTextFields(
      destination as unknown as Record<string, unknown>,
      DESTINATION_REQUIRED_FIELDS,
      `${locale}:destination:${destination.slug}`
    );
  }

  const ordered = EDITORIAL_ORDER.map((slug) =>
    destinations.find((destination) => destination.slug.toLowerCase() === slug)
  );
  if (ordered.some((destination) => !destination)) {
    throw new Error(`Expected Istanbul, Cappadocia, and Bodrum destinations for ${locale}`);
  }

  return ordered.map((destination) => ({
    ...(destination as CmsCulturalWorldDestination),
    cover_image: normalizeRequiredImage(
      (destination as CmsCulturalWorldDestination).cover_image,
      `${locale}:destination:${(destination as CmsCulturalWorldDestination).slug}:cover_image`
    ),
  }));
}

export function getDestinationImageAlt(destination: CmsCulturalWorldDestination): string {
  return `${destination.name}. ${destination.highlight}`;
}
