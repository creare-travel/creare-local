import type { AssistantState, ExperienceCandidate, ModelResult } from './types';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

function systemPrompt() {
  return `You are CREARE's website travel assistant. CREARE is an Istanbul-based luxury travel agency and experience design house.

Rules:
- Respond only in the state's locale: tr, en, ru, or zh.
- Except for official Experience titles and CREARE/LAB proper names, do not mix English brand nouns into tr, ru, or zh replies. In tr/ru/zh, never use the generic English words Journey, Experience, Encounter, Curated Journey, or Private Briefing; use natural equivalents in the selected language.
- Never translate Experience titles.
- Prefer CREARE language: Journey, Host, Experience, Encounter, Curated Journey. Avoid generic tourism language such as tour, sightseeing, package, itinerary, excursion, guide unless the visitor uses it and clarification requires it.
- Your purpose is discovery, qualification, grounded Experience recommendation, bespoke/LAB recognition, and movement toward a Private Briefing.
- Never invent an Experience, Experience title, slug, URL, availability, price, or operational promise.
- You may recommend ONLY candidate IDs supplied in CANDIDATES.
- If no candidate is a credible fit, recommend no IDs. Never infer or describe the geographic scope of CREARE's catalogue from an empty candidate list; simply state that no matching published Experience was retrieved for this request and that CREARE can shape a bespoke journey.
- When recommending candidate IDs, do not write Experience titles, URLs, or markdown links in reply; the server will append the exact grounded titles and links.
- Recommend no more than two Experience IDs per turn.
- Do not ask for the visitor's name if state.name is already present.
- Preserve known destination, dates, guest count, interests, intention, budget, and stage unless the visitor explicitly changes them.
- Ask at most one focused qualification question per turn when essential information is missing.
- Greet or welcome the visitor only when USER_MESSAGE is exactly START_SESSION. Never repeat a greeting on later turns.
- conversation_stage may only be one of: discovery, qualification, recommendation, private_briefing, handoff.
- Keep responses concise, calm, confident, and non-promotional.

Return JSON only with exactly these keys:
reply: string
statePatch: object containing only changed state fields
recommendedExperienceIds: array of candidate IDs only
handoffRecommended: boolean`;
}

function extractJson(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(trimmed);
}

const STAGES = new Set([
  'discovery',
  'qualification',
  'recommendation',
  'private_briefing',
  'handoff',
]);
const LOCALES = new Set(['tr', 'en', 'ru', 'zh']);

function sanitizeReply(reply: string, message: string, name: string | null) {
  let output = reply
    .trim()
    .replace(/\[[^\]]+\]\([^)]+\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (message === 'START_SESSION') return output;
  const firstSentenceMatch = output.match(/^(.+?[.!?。！？])\s*/u);
  if (
    firstSentenceMatch &&
    firstSentenceMatch[1].length < 90 &&
    /welcome|hoş geld|merhaba|добро пожаловать|здравствуйте|привет|欢迎|您好|你好/iu.test(
      firstSentenceMatch[1]
    )
  ) {
    output = output.slice(firstSentenceMatch[0].length).trim();
  }
  const escapedName = name ? name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
  const patterns = [
    escapedName ? new RegExp(`^Welcome,?\\s+${escapedName}[.!,:;]?\\s*`, 'i') : null,
    escapedName ? new RegExp(`^Hoş geldin(?:iz)?,?\\s+${escapedName}[.!,:;]?\\s*`, 'iu') : null,
    escapedName ? new RegExp(`^Добро пожаловать,?\\s+${escapedName}[.!,:;]?\\s*`, 'iu') : null,
    escapedName ? new RegExp(`^欢迎[，,]?\\s*${escapedName}[。.!！]?\\s*`, 'u') : null,
  ].filter(Boolean) as RegExp[];
  for (const pattern of patterns) output = output.replace(pattern, '');
  return output.trim();
}

function sanitizeStatePatch(value: unknown): ModelResult['statePatch'] {
  if (!value || typeof value !== 'object') return {};
  const input = value as Record<string, unknown>;
  const patch: ModelResult['statePatch'] = {};
  if (typeof input.locale === 'string' && LOCALES.has(input.locale))
    patch.locale = input.locale as 'tr' | 'en' | 'ru' | 'zh';
  if (typeof input.name === 'string' && input.name.trim())
    patch.name = input.name.trim().slice(0, 120);
  for (const key of ['destination', 'dates', 'intention', 'budget_band'] as const) {
    if (typeof input[key] === 'string' && input[key].trim())
      patch[key] = input[key].trim().slice(0, 300);
  }
  if (typeof input.guest_count === 'number' && Number.isFinite(input.guest_count))
    patch.guest_count = input.guest_count;
  if (Array.isArray(input.interests))
    patch.interests = input.interests
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim().slice(0, 120))
      .slice(0, 12);
  if (typeof input.conversation_stage === 'string') {
    const normalized =
      input.conversation_stage === 'briefing' ? 'private_briefing' : input.conversation_stage;
    if (STAGES.has(normalized))
      patch.conversation_stage = normalized as
        'discovery' | 'qualification' | 'recommendation' | 'private_briefing' | 'handoff';
  }
  return patch;
}

export async function runGemini(
  state: AssistantState,
  message: string,
  candidates: ExperienceCandidate[]
): Promise<ModelResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const payload = {
    system_instruction: { parts: [{ text: systemPrompt() }] },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({ STATE: state, USER_MESSAGE: message, CANDIDATES: candidates }),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 700,
      responseMimeType: 'application/json',
    },
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
  const result = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  const parsed = extractJson(text) as Partial<ModelResult>;
  const validIds = new Set(candidates.map((candidate) => candidate.id));
  return {
    reply: typeof parsed.reply === 'string' ? sanitizeReply(parsed.reply, message, state.name) : '',
    statePatch: sanitizeStatePatch(parsed.statePatch),
    recommendedExperienceIds: Array.isArray(parsed.recommendedExperienceIds)
      ? parsed.recommendedExperienceIds
          .map(String)
          .filter((id) => validIds.has(id))
          .slice(0, 2)
      : [],
    handoffRecommended: parsed.handoffRecommended === true,
  };
}
