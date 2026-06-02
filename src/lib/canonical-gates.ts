const PUBLIC_VISIBILITY_VALUES = new Set(['active', 'visible', 'published']);
const NON_PUBLIC_VISIBILITY_VALUES = new Set([
  'hidden',
  'draft',
  'testing',
  'archived',
  'disabled',
]);

const CANONICAL_CULTURAL_WORLD_SLUGS = new Set(['istanbul', 'bodrum', 'cappadocia']);

type CmsRecordLike = {
  slug?: unknown;
  title?: unknown;
  name?: unknown;
  visibility_status?: unknown;
  publishedAt?: unknown;
};

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeVisibility(value: unknown): string | undefined {
  return normalizeText(value)?.toLowerCase();
}

export function isNonEmptySlug(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isCanonicalCulturalWorldSlug(slug: unknown): slug is string {
  return isNonEmptySlug(slug) && CANONICAL_CULTURAL_WORLD_SLUGS.has(slug.trim().toLowerCase());
}

export function isPublicCmsRecord(record: CmsRecordLike | null | undefined): boolean {
  if (!record) return false;

  const visibility = normalizeVisibility(record.visibility_status);

  if (visibility && NON_PUBLIC_VISIBILITY_VALUES.has(visibility)) {
    return false;
  }

  if (visibility && !PUBLIC_VISIBILITY_VALUES.has(visibility)) {
    return false;
  }

  if ('publishedAt' in record && record.publishedAt == null) {
    return false;
  }

  return true;
}

export function isPublicExperienceRecord<T extends CmsRecordLike>(
  record: T | null | undefined
): boolean {
  return Boolean(
    record &&
    isNonEmptySlug(record.slug) &&
    normalizeText(record.title) &&
    isPublicCmsRecord(record)
  );
}

export function isPublicInsightRecord<T extends CmsRecordLike>(
  record: T | null | undefined
): boolean {
  return Boolean(
    record &&
    isNonEmptySlug(record.slug) &&
    normalizeText(record.title) &&
    isPublicCmsRecord(record)
  );
}

export function isPublicDestinationRecord<T extends CmsRecordLike>(
  record: T | null | undefined
): boolean {
  return Boolean(
    record && isNonEmptySlug(record.slug) && normalizeText(record.name) && isPublicCmsRecord(record)
  );
}

export function filterCanonicalCulturalWorlds<T extends CmsRecordLike>(records: T[]): T[] {
  return records.filter(
    (record) => isPublicDestinationRecord(record) && isCanonicalCulturalWorldSlug(record.slug)
  );
}

export function filterPublicExperiences<T extends CmsRecordLike>(records: T[]): T[] {
  return records.filter((record) => isPublicExperienceRecord(record));
}

export function filterPublicInsights<T extends CmsRecordLike>(records: T[]): T[] {
  return records.filter((record) => isPublicInsightRecord(record));
}
