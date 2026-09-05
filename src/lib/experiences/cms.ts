import {
  filterPublicExperiences,
  filterPublicInsights,
  isPublicExperienceRecord,
} from '@/lib/canonical-gates';
import type { SiteLocale } from '@/lib/i18n/config';
import { fetchStrapi, mediaUrl } from '@/lib/strapi';

export type ExperienceCategory = 'signature' | 'lab' | 'black';

export interface CmsImageFormat {
  url?: string;
  width?: number;
  height?: number;
}

export interface CmsImage {
  id?: number;
  documentId?: string;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: {
    large?: CmsImageFormat;
    medium?: CmsImageFormat;
    small?: CmsImageFormat;
  };
}

export interface CmsDestination {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
}

export interface CmsRichTextNode {
  type: string;
  children?: CmsRichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface CmsOntologyEntity {
  name?: string;
  slug?: string;
  description?: string;
  same_as?: string[];
  semantic_tags?: string[];
  external_reference_url?: string;
  confidence_score?: number;
}

export interface CmsRelatedInsight {
  id: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  publishedAt?: string | null;
  cover_image?: CmsImage | null;
  destination?: CmsDestination | null;
}

export interface CmsExperience {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  short_description?: string;
  one_line_hook?: string;
  description?: CmsRichTextNode[] | string;
  program?: CmsRichTextNode[] | string;
  audience?: CmsRichTextNode[] | string;
  designed_for?: CmsRichTextNode[] | string;
  venue_details?: CmsRichTextNode[] | string;
  highlights?: CmsRichTextNode[] | string;
  experience_flow?: CmsRichTextNode[] | string;
  wow_moment?: string;
  differentiator?: string;
  ideal_guest?: string;
  category?: ExperienceCategory;
  series?: string | null;
  experience_type?: string | null;
  intent_level?: string;
  geo_experience_type?: string | null;
  audience_segment?: string | null;
  mood?: string | null;
  intensity?: string | null;
  location?: string;
  destination?: CmsDestination | null;
  duration?: string;
  group_size?: string;
  group_size_note?: string;
  programme_note?: string;
  cta_text?: string;
  cta_label?: string | null;
  cta_heading?: string;
  cta_supporting_text?: string;
  cta_access_line?: string;
  seo_title?: string;
  seo_description?: string;
  og_description?: string;
  hero_alt_text?: string;
  cover_image?: CmsImage | null;
  gallery?: CmsImage[];
  priority?: number | null;
  visibility_status?: string | null;
  publishedAt?: string | null;
  mood_entity?: CmsOntologyEntity | null;
  audience_entity?: CmsOntologyEntity | null;
  experience_type_entity?: CmsOntologyEntity | null;
  intensity_entity?: CmsOntologyEntity | null;
  related_experiences?: CmsExperience[] | { data?: Record<string, unknown>[] };
  related_insights?: CmsRelatedInsight[] | { data?: Record<string, unknown>[] };
}

export interface CmsExperienceLanding {
  id: number;
  documentId?: string;
  eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  introduction: string;
  supporting_content: string;
  collection_eyebrow: string;
  published_list_eyebrow: string;
  published_list_title: string;
  hero_image: CmsImage;
  hero_alt_text: string;
  cta_heading: string;
  cta_supporting_text: string;
  cta_label: string;
  seo_title: string;
  seo_description: string;
  og_description: string;
  publishedAt?: string | null;
}

export interface CmsExperienceCategoryPage {
  id: number;
  documentId?: string;
  key: ExperienceCategory;
  display_order: number;
  eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  introduction: string;
  supporting_content: string;
  list_eyebrow: string;
  list_title: string;
  cta_heading: string;
  cta_supporting_text: string;
  cta_access_line: string;
  cta_label: string;
  hero_image: CmsImage;
  hero_alt_text: string;
  card_title: string;
  card_description: string;
  card_distinction: string;
  card_image: CmsImage;
  card_alt_text: string;
  seo_title: string;
  seo_description: string;
  og_description: string;
  signature_positioning_title?: string | null;
  signature_positioning_body_1?: string | null;
  signature_positioning_body_2?: string | null;
  signature_positioning_body_3?: string | null;
  signature_composition_title?: string | null;
  signature_composition_body?: string | null;
  signature_distinction_body?: string | null;
  signature_inquiry_title?: string | null;
  signature_inquiry_body?: string | null;
  lab_definition_body?: string | null;
  lab_context_title?: string | null;
  lab_context_body?: string | null;
  lab_principles_eyebrow?: string | null;
  lab_principles_title?: string | null;
  lab_principle_1_title?: string | null;
  lab_principle_1_body?: string | null;
  lab_principle_2_title?: string | null;
  lab_principle_2_body?: string | null;
  lab_principle_3_title?: string | null;
  lab_principle_3_body?: string | null;
  lab_audience_title?: string | null;
  lab_audience_body_1?: string | null;
  lab_audience_body_2?: string | null;
  lab_process_eyebrow?: string | null;
  lab_process_title?: string | null;
  lab_process_step_1_title?: string | null;
  lab_process_step_1_body?: string | null;
  lab_process_step_2_title?: string | null;
  lab_process_step_2_body?: string | null;
  lab_process_step_3_title?: string | null;
  lab_process_step_3_body?: string | null;
  lab_process_step_4_title?: string | null;
  lab_process_step_4_body?: string | null;
  lab_closing_body?: string | null;
  black_context_title?: string | null;
  black_context_body?: string | null;
  black_process_eyebrow?: string | null;
  black_process_title?: string | null;
  black_process_step_1_title?: string | null;
  black_process_step_1_body?: string | null;
  black_process_step_2_title?: string | null;
  black_process_step_2_body?: string | null;
  black_process_step_3_title?: string | null;
  black_process_step_3_body?: string | null;
  black_process_step_4_title?: string | null;
  black_process_step_4_body?: string | null;
  black_conditions_title?: string | null;
  black_conditions_body?: string | null;
  publishedAt?: string | null;
}

const LANDING_REQUIRED_FIELDS = [
  'eyebrow',
  'hero_title',
  'hero_subtitle',
  'introduction',
  'supporting_content',
  'collection_eyebrow',
  'published_list_eyebrow',
  'published_list_title',
  'hero_alt_text',
  'cta_heading',
  'cta_supporting_text',
  'cta_label',
  'seo_title',
  'seo_description',
  'og_description',
] as const;

const CATEGORY_REQUIRED_FIELDS = [
  'documentId',
  'eyebrow',
  'hero_title',
  'hero_subtitle',
  'introduction',
  'supporting_content',
  'list_eyebrow',
  'list_title',
  'cta_heading',
  'cta_supporting_text',
  'cta_access_line',
  'cta_label',
  'hero_alt_text',
  'card_title',
  'card_description',
  'card_distinction',
  'card_alt_text',
  'seo_title',
  'seo_description',
  'og_description',
] as const;

const CATEGORY_QUERY_FIELDS = [
  'key',
  'display_order',
  'eyebrow',
  'hero_title',
  'hero_subtitle',
  'introduction',
  'supporting_content',
  'list_eyebrow',
  'list_title',
  'cta_heading',
  'cta_supporting_text',
  'cta_access_line',
  'cta_label',
  'hero_alt_text',
  'card_title',
  'card_description',
  'card_distinction',
  'card_alt_text',
  'seo_title',
  'seo_description',
  'og_description',
] as const;

const CATEGORY_EDITORIAL_REQUIRED_FIELDS = {
  signature: [
    'signature_positioning_title',
    'signature_positioning_body_1',
    'signature_positioning_body_2',
    'signature_positioning_body_3',
    'signature_composition_title',
    'signature_composition_body',
    'signature_distinction_body',
    'signature_inquiry_title',
    'signature_inquiry_body',
  ],
  lab: [
    'lab_definition_body',
    'lab_context_title',
    'lab_context_body',
    'lab_principles_eyebrow',
    'lab_principles_title',
    'lab_principle_1_title',
    'lab_principle_1_body',
    'lab_principle_2_title',
    'lab_principle_2_body',
    'lab_principle_3_title',
    'lab_principle_3_body',
    'lab_audience_title',
    'lab_audience_body_1',
    'lab_audience_body_2',
    'lab_process_eyebrow',
    'lab_process_title',
    'lab_process_step_1_title',
    'lab_process_step_1_body',
    'lab_process_step_2_title',
    'lab_process_step_2_body',
    'lab_process_step_3_title',
    'lab_process_step_3_body',
    'lab_process_step_4_title',
    'lab_process_step_4_body',
    'lab_closing_body',
  ],
  black: [
    'black_context_title',
    'black_context_body',
    'black_process_eyebrow',
    'black_process_title',
    'black_process_step_1_title',
    'black_process_step_1_body',
    'black_process_step_2_title',
    'black_process_step_2_body',
    'black_process_step_3_title',
    'black_process_step_3_body',
    'black_process_step_4_title',
    'black_process_step_4_body',
    'black_conditions_title',
    'black_conditions_body',
  ],
} as const satisfies Record<ExperienceCategory, readonly string[]>;

const EXPERIENCE_REQUIRED_FIELDS = [
  'title',
  'slug',
  'short_description',
  'category',
  'cta_heading',
  'cta_supporting_text',
  'cta_access_line',
  'cta_label',
  'seo_title',
  'seo_description',
  'og_description',
  'hero_alt_text',
] as const;

function flattenItem<T>(raw: Record<string, unknown>): T {
  if (raw.attributes && typeof raw.attributes === 'object') {
    return { id: raw.id, ...(raw.attributes as object) } as T;
  }

  return raw as T;
}

export function normalizeRelationArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === 'object' ? flattenItem<T>(item as Record<string, unknown>) : item
    ) as T[];
  }

  if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown[] }).data)) {
    return ((value as { data: unknown[] }).data ?? []).map((item) =>
      item && typeof item === 'object' ? flattenItem<T>(item as Record<string, unknown>) : item
    ) as T[];
  }

  return [];
}

export function normalizeSingleRelation<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object') return null;

  if ('data' in (value as Record<string, unknown>)) {
    const data = (value as { data?: unknown }).data;
    if (!data || Array.isArray(data) || typeof data !== 'object') return null;
    return flattenItem<T>(data as Record<string, unknown>);
  }

  return flattenItem<T>(value as Record<string, unknown>);
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
    throw new Error(`Incomplete CMS Experience contract for ${identity}: ${missing.join(', ')}`);
  }
}

function assertRequiredImage(
  value: unknown,
  identity: string,
  field: string
): asserts value is CmsImage {
  const image = normalizeSingleRelation<CmsImage>(value);
  if (!image?.url) {
    throw new Error(`Missing CMS media relation ${field} for ${identity}`);
  }
}

function normalizeImage(value: unknown): CmsImage | null {
  const image = normalizeSingleRelation<
    CmsImage & {
      alternativeText?: string | null;
      formats?: CmsImage['formats'] | null;
    }
  >(value);
  if (!image) return null;

  return {
    ...image,
    alternativeText: image.alternativeText ?? undefined,
    formats: image.formats ?? undefined,
  };
}

export function getCmsImageUrl(image?: CmsImage | null): string | null {
  const rawUrl =
    image?.formats?.large?.url ??
    image?.formats?.medium?.url ??
    image?.formats?.small?.url ??
    image?.url;

  return rawUrl ? mediaUrl(rawUrl) : null;
}

export async function fetchExperienceLanding(locale: SiteLocale): Promise<CmsExperienceLanding> {
  const json = await fetchStrapi(
    '/api/experience-landing?status=published&populate[hero_image]=true',
    { locale }
  );
  const raw = json?.data;
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Missing published Experience Landing for ${locale}`);
  }

  const landing = flattenItem<CmsExperienceLanding>(raw as Record<string, unknown>);
  assertRequiredTextFields(
    landing as unknown as Record<string, unknown>,
    LANDING_REQUIRED_FIELDS,
    `${locale}:experience-landing`
  );
  assertRequiredImage(landing.hero_image, `${locale}:experience-landing`, 'hero_image');

  return {
    ...landing,
    hero_image: normalizeImage(landing.hero_image) as CmsImage,
  };
}

export async function fetchExperienceCategoryPages(
  locale: SiteLocale
): Promise<CmsExperienceCategoryPage[]> {
  return Promise.all(
    (['signature', 'lab', 'black'] as const).map((category) =>
      fetchExperienceCategoryPageRecord(category, locale)
    )
  );
}

async function fetchExperienceCategoryPageRecord(
  category: ExperienceCategory,
  locale: SiteLocale
): Promise<CmsExperienceCategoryPage> {
  const params = new URLSearchParams({
    status: 'published',
    'filters[key][$eq]': category,
    'populate[hero_image]': 'true',
    'populate[card_image]': 'true',
    'pagination[pageSize]': '1',
  });
  [...CATEGORY_QUERY_FIELDS, ...CATEGORY_EDITORIAL_REQUIRED_FIELDS[category]].forEach(
    (field, index) => params.set(`fields[${index}]`, field)
  );

  const json = await fetchStrapi(`/api/experience-category-pages?${params.toString()}`, {
    locale,
  });
  const raw = Array.isArray(json?.data) ? json.data[0] : null;
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Missing published ${category} Experience Category page for ${locale}`);
  }

  const page = flattenItem<CmsExperienceCategoryPage>(raw as Record<string, unknown>);
  assertRequiredTextFields(
    page as unknown as Record<string, unknown>,
    CATEGORY_REQUIRED_FIELDS,
    `${locale}:experience-category:${category}`
  );
  assertRequiredTextFields(
    page as unknown as Record<string, unknown>,
    CATEGORY_EDITORIAL_REQUIRED_FIELDS[category],
    `${locale}:experience-category:${category}:editorial`
  );
  assertRequiredImage(page.hero_image, `${locale}:experience-category:${category}`, 'hero_image');
  assertRequiredImage(page.card_image, `${locale}:experience-category:${category}`, 'card_image');

  return {
    ...page,
    hero_image: normalizeImage(page.hero_image) as CmsImage,
    card_image: normalizeImage(page.card_image) as CmsImage,
  };
}

export async function fetchExperienceCategoryPage(
  category: ExperienceCategory,
  locale: SiteLocale
): Promise<CmsExperienceCategoryPage> {
  return fetchExperienceCategoryPageRecord(category, locale);
}

export async function fetchPublishedExperiences(
  locale: SiteLocale,
  category?: ExperienceCategory
): Promise<CmsExperience[]> {
  const params = new URLSearchParams({
    status: 'published',
    'filters[visibility_status][$eqi]': 'active',
    'populate[cover_image]': 'true',
    'populate[destination]': 'true',
    'sort[0]': 'publishedAt:asc',
    'sort[1]': 'title:asc',
    'pagination[pageSize]': '100',
  });
  if (category) params.set('filters[category][$eqi]', category);

  const json = await fetchStrapi(`/api/experiences?${params.toString()}`, { locale });
  const rawItems: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
  const items = filterPublicExperiences(rawItems.map((raw) => flattenItem<CmsExperience>(raw))).map(
    (item) => ({
      ...item,
      cover_image: normalizeImage(item.cover_image),
      destination: normalizeSingleRelation<CmsDestination>(item.destination),
    })
  );

  for (const item of items) {
    assertRequiredTextFields(
      item as unknown as Record<string, unknown>,
      EXPERIENCE_REQUIRED_FIELDS,
      `${locale}:experience:${item.slug}`
    );
  }

  return items;
}

export async function fetchPublishedExperienceBySlug(
  slug: string,
  locale: SiteLocale
): Promise<CmsExperience | null> {
  const params = new URLSearchParams({
    status: 'published',
    'filters[slug][$eq]': slug,
    'populate[cover_image]': 'true',
    'populate[gallery]': 'true',
    'populate[destination]': 'true',
    'populate[related_experiences][populate][cover_image]': 'true',
    'populate[related_experiences][populate][destination]': 'true',
    'populate[related_insights][populate][cover_image]': 'true',
    'populate[mood_entity]': 'true',
    'populate[audience_entity]': 'true',
    'populate[experience_type_entity]': 'true',
    'populate[intensity_entity]': 'true',
    'pagination[pageSize]': '1',
  });
  const json = await fetchStrapi(`/api/experiences?${params.toString()}`, { locale });
  const raw = Array.isArray(json?.data) ? json.data[0] : null;
  if (!raw || typeof raw !== 'object') return null;

  const item = flattenItem<CmsExperience>(raw as Record<string, unknown>);
  if (!isPublicExperienceRecord(item)) return null;
  assertRequiredTextFields(
    item as unknown as Record<string, unknown>,
    EXPERIENCE_REQUIRED_FIELDS,
    `${locale}:experience:${slug}`
  );

  const relatedExperiences = filterPublicExperiences(
    normalizeRelationArray<CmsExperience>(item.related_experiences)
  ).map((experience) => ({
    ...experience,
    cover_image: normalizeImage(experience.cover_image),
    destination: normalizeSingleRelation<CmsDestination>(experience.destination),
  }));
  const relatedInsights = filterPublicInsights(
    normalizeRelationArray<CmsRelatedInsight>(item.related_insights)
  ).map((insight) => ({
    ...insight,
    cover_image: normalizeImage(insight.cover_image),
    destination: normalizeSingleRelation<CmsDestination>(insight.destination),
  }));

  return {
    ...item,
    cover_image: normalizeImage(item.cover_image),
    gallery: normalizeRelationArray<CmsImage>(item.gallery),
    destination: normalizeSingleRelation<CmsDestination>(item.destination),
    mood_entity: normalizeSingleRelation<CmsOntologyEntity>(item.mood_entity),
    audience_entity: normalizeSingleRelation<CmsOntologyEntity>(item.audience_entity),
    experience_type_entity: normalizeSingleRelation<CmsOntologyEntity>(item.experience_type_entity),
    intensity_entity: normalizeSingleRelation<CmsOntologyEntity>(item.intensity_entity),
    related_experiences: relatedExperiences,
    related_insights: relatedInsights,
  };
}
