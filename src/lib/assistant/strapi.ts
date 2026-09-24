import { rankExperienceCandidates } from './recommendation';
import type {
  AssistantLocale,
  AssistantState,
  ExperienceCandidate,
  HydratedExperience,
} from './types';

const MAX_CANDIDATES = 6;
const CATALOG_CACHE_MS = 5 * 60 * 1000;
let catalogCache: { expiresAt: number; items: ExperienceCandidate[] } | null = null;

function strapiBaseUrl() {
  return (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || '').replace(/\/$/, '');
}

function normalizeItem(item: unknown): ExperienceCandidate | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  const attributes =
    record.attributes && typeof record.attributes === 'object'
      ? (record.attributes as Record<string, unknown>)
      : null;
  const source: Record<string, unknown> = attributes
    ? { ...attributes, id: record.id, documentId: record.documentId }
    : record;
  if (!source.title || !source.slug) return null;
  return {
    id: String(source.documentId || source.id),
    title: String(source.title),
    slug: String(source.slug),
    category:
      typeof source.category === 'string' && ['signature', 'lab', 'black'].includes(source.category)
        ? (source.category as 'signature' | 'lab' | 'black')
        : null,
    short_description: source.short_description ? String(source.short_description) : null,
    location: source.location ? String(source.location) : null,
    duration: source.duration ? String(source.duration) : null,
  };
}

async function fetchCatalog(): Promise<ExperienceCandidate[]> {
  if (catalogCache && catalogCache.expiresAt > Date.now()) return catalogCache.items;
  const base = strapiBaseUrl();
  if (!base) throw new Error('STRAPI_URL is not configured');
  const params = new URLSearchParams();
  for (const field of ['title', 'slug', 'category', 'short_description', 'location', 'duration']) {
    params.append('fields[]', field);
  }
  params.set('pagination[pageSize]', '100');
  params.set('sort[0]', 'title:asc');
  const response = await fetch(`${base}/api/experiences?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Strapi request failed: ${response.status}`);
  const payload = await response.json();
  const items = (Array.isArray(payload?.data) ? payload.data : [])
    .map(normalizeItem)
    .filter(Boolean) as ExperienceCandidate[];
  catalogCache = { items, expiresAt: Date.now() + CATALOG_CACHE_MS };
  return items;
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/стамбул[а-я]*/gu, ' istanbul ')
    .replace(/伊斯坦布尔/gu, ' istanbul ')
    .replace(/бодрум[а-я]*/gu, ' bodrum ')
    .replace(/博德鲁姆/gu, ' bodrum ')
    .replace(/каппадоки[а-я]*/gu, ' cappadocia ')
    .replace(/卡帕多奇亚/gu, ' cappadocia ');
}

export async function retrieveExperienceCandidates(state: AssistantState, message: string) {
  const catalog = await fetchCatalog();
  return rankExperienceCandidates(catalog, state, message, MAX_CANDIDATES);
}

export function hasDestinationMatch(candidates: ExperienceCandidate[], destination: string) {
  const normalizedDestination = normalizeText(destination).trim();
  if (!normalizedDestination) return false;
  return candidates.some((candidate) => {
    const location = normalizeText(candidate.location || '');
    const title = normalizeText(candidate.title);
    return location.includes(normalizedDestination) || title.includes(normalizedDestination);
  });
}

export function hydrateExperiences(
  candidates: ExperienceCandidate[],
  ids: string[],
  locale: AssistantLocale
): HydratedExperience[] {
  const prefix = locale === 'tr' ? '/tr' : '';
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((candidate) => ({ ...candidate!, url: `${prefix}/experiences/${candidate!.slug}` }));
}
