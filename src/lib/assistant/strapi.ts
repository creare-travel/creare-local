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
    .replace(/[\u0300-\u036f]/g, ' ');
}

function tokensFrom(state: AssistantState, message: string) {
  const raw = [state.destination, state.intention, ...state.interests, message]
    .filter(Boolean)
    .join(' ');
  return normalizeText(raw)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3)
    .slice(0, 30);
}

function score(candidate: ExperienceCandidate, tokens: string[]) {
  const title = normalizeText(candidate.title);
  const location = normalizeText(candidate.location || '');
  const description = normalizeText(candidate.short_description || '');
  const category = normalizeText(candidate.category || '');
  return tokens.reduce((total, token) => {
    if (title.includes(token)) total += 6;
    if (location.includes(token)) total += 5;
    if (category.includes(token)) total += 2;
    if (description.includes(token)) total += 1;
    return total;
  }, 0);
}

export async function retrieveExperienceCandidates(state: AssistantState, message: string) {
  const catalog = await fetchCatalog();
  const tokens = tokensFrom(state, message);
  if (!tokens.length) return catalog.slice(0, MAX_CANDIDATES);
  return catalog
    .map((candidate) => ({ candidate, score: score(candidate, tokens) }))
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, MAX_CANDIDATES)
    .map(({ candidate }) => candidate);
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
