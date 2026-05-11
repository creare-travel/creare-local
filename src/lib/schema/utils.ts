import type { BreadcrumbItemInput, SchemaNode, StrapiRichTextNode } from './types';

export const SCHEMA_CONTEXT = 'https://schema.org';
export const SITE_URL = 'https://crearetravel.com';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const BRAND_ID = `${SITE_URL}/#brand`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const UNSAFE_SCHEMA_VALUES = new Set([
  'TouristTrip',
  'https://schema.org/TouristTrip',
  'http://schema.org/TouristTrip',
  'TourOperator',
  'https://schema.org/TourOperator',
  'http://schema.org/TourOperator',
  'TravelAgency',
  'https://schema.org/TravelAgency',
  'http://schema.org/TravelAgency',
]);

const UNSAFE_SAME_AS_VALUES = new Set([
  ...UNSAFE_SCHEMA_VALUES,
  'VIPPackage',
  'https://schema.org/VIPPackage',
  'http://schema.org/VIPPackage',
  'PackageTour',
  'https://schema.org/PackageTour',
  'http://schema.org/PackageTour',
]);

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function compactArray<T>(values: Array<T | null | undefined | false>): T[] {
  return values.filter(Boolean) as T[];
}

export function absoluteUrl(url?: string | null, base: string = SITE_URL): string | undefined {
  if (!isNonEmptyString(url)) return undefined;
  if (/^https?:\/\//i.test(url)) return url.trim();
  if (url.startsWith('//')) return `https:${url}`;
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export function buildCanonicalUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function normalizeSlug(value?: string | null): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/^-|-$/g, '');
}

export function normalizeEnumValue(value?: string | null): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function humanizeSlug(value?: string | null): string | undefined {
  const normalized = normalizeSlug(value);
  if (!normalized) return undefined;

  return normalized
    .split('/')
    .pop()
    ?.split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function normalizeBreadcrumbName(item: BreadcrumbItemInput): string {
  return item.name || humanizeSlug(item.slugFallback || item.url) || 'Untitled';
}

export function isUnsafeSchemaType(value?: string | null): boolean {
  if (!isNonEmptyString(value)) return false;
  return UNSAFE_SCHEMA_VALUES.has(value.trim());
}

export function isUnsafeSameAsTarget(value?: string | null): boolean {
  if (!isNonEmptyString(value)) return false;
  return UNSAFE_SAME_AS_VALUES.has(value.trim());
}

export function filterUnsafeSchemaValues(values?: Array<string | null | undefined>): string[] {
  return compactArray(
    (values ?? []).map((value) => {
      const normalized = isNonEmptyString(value) ? value.trim() : undefined;
      if (!normalized || isUnsafeSchemaType(normalized) || isUnsafeSameAsTarget(normalized)) {
        return null;
      }
      return normalized;
    })
  );
}

export function normalizeSameAs(
  value?: string | string[] | null,
  requireAbsolute: boolean = true
): string[] | undefined {
  const entries = Array.isArray(value) ? value : value ? [value] : [];
  const normalized = compactArray(
    entries.map((entry) => {
      if (!isNonEmptyString(entry)) return null;
      const trimmed = entry.trim();
      if (isUnsafeSchemaType(trimmed) || isUnsafeSameAsTarget(trimmed)) return null;
      if (requireAbsolute && !/^https?:\/\//i.test(trimmed)) return null;
      return trimmed;
    })
  );

  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
}

export function dedupeGraphById<T extends SchemaNode>(nodes: T[]): T[] {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const node of nodes) {
    const id = typeof node['@id'] === 'string' ? node['@id'] : undefined;

    if (!id) {
      output.push(node);
      continue;
    }

    if (seen.has(id)) continue;
    seen.add(id);
    output.push(node);
  }

  return output;
}

export function cleanSchemaObject<T>(value: T): T | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return (trimmed ? trimmed : undefined) as T | undefined;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map((entry) => cleanSchemaObject(entry))
      .filter((entry) => entry !== undefined);

    return (cleaned.length > 0 ? cleaned : undefined) as T | undefined;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [key, cleanSchemaObject(entry)] as const)
      .filter(([, entry]) => entry !== undefined);

    if (entries.length === 0) return undefined;

    const cleanedObject = Object.fromEntries(entries);
    return cleanedObject as T;
  }

  return value;
}

export function extractTextFromRichNode(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return node.trim();

  if (Array.isArray(node)) {
    return node
      .map((entry) => extractTextFromRichNode(entry))
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  if (typeof node === 'object') {
    const record = node as {
      text?: unknown;
      children?: unknown;
      value?: unknown;
      content?: unknown;
      body?: unknown;
    };

    const directText = [record.text, record.value, record.content, record.body].find(
      (entry) => typeof entry === 'string'
    );

    if (typeof directText === 'string') return directText.trim();

    return extractTextFromRichNode(record.children);
  }

  return '';
}

export function extractParagraphs(field?: StrapiRichTextNode[] | string | unknown): string[] {
  if (!field) return [];

  if (typeof field === 'string') {
    return field
      .split(/\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(field)) {
    const text = extractTextFromRichNode(field).trim();
    return text ? [text] : [];
  }

  const paragraphs: string[] = [];

  for (const node of field) {
    if (node.type === 'paragraph' || node.type === 'list-item') {
      const text = extractTextFromRichNode(node.children ?? []).trim();
      if (text) paragraphs.push(text);
      continue;
    }

    if (node.type === 'list' && node.children) {
      for (const child of node.children) {
        const text = extractTextFromRichNode(child.children ?? []).trim();
        if (text) paragraphs.push(text);
      }
      continue;
    }

    const text = extractTextFromRichNode(node).trim();
    if (text) paragraphs.push(text);
  }

  return paragraphs;
}

export function getPrimaryDescription(...values: Array<string | undefined>): string | undefined {
  return values.find(isNonEmptyString)?.trim();
}

export function getSafeAdditionalTypeUrl(values?: string[] | null): string | undefined {
  const candidates = normalizeSameAs(values);
  return candidates?.find((value) => /^https?:\/\//i.test(value));
}

export function experienceIds(slug: string) {
  const canonical = buildCanonicalUrl(`/experiences/${slug}`);
  return {
    canonical,
    webpage: `${canonical}#webpage`,
    service: `${canonical}#service`,
    image: `${canonical}#image`,
    itinerary: `${canonical}#itinerary`,
    place: `${canonical}#place`,
    breadcrumbs: `${canonical}#breadcrumbs`,
  };
}

export function listingIds(
  path: '/experiences/signature' | '/experiences/lab' | '/experiences/black'
) {
  const canonical = buildCanonicalUrl(path);
  return {
    canonical,
    collection: `${canonical}#collection`,
    itemList: `${canonical}#itemlist`,
    breadcrumbs: `${canonical}#breadcrumbs`,
  };
}

export function culturalWorldIds(slug: string) {
  const canonical = buildCanonicalUrl(`/cultural-worlds/${slug}`);
  return {
    canonical,
    webpage: `${canonical}#webpage`,
    collection: `${canonical}#collection`,
    place: `${canonical}#place`,
    breadcrumbs: `${canonical}#breadcrumbs`,
    itemList: `${canonical}#itemlist`,
  };
}

export function insightIds(slug: string) {
  const canonical = buildCanonicalUrl(`/insights/${slug}`);
  return {
    canonical,
    article: `${canonical}#article`,
    webpage: `${canonical}#webpage`,
    image: `${canonical}#image`,
    breadcrumbs: `${canonical}#breadcrumbs`,
    collection: `${canonical}#collection`,
    itemList: `${canonical}#itemlist`,
  };
}

export function contactIds() {
  const canonical = buildCanonicalUrl('/contact');
  return {
    canonical,
    webpage: `${canonical}#contact-page`,
    breadcrumbs: `${canonical}#breadcrumbs`,
  };
}
