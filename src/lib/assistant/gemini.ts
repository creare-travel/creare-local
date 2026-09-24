import type { AssistantState, ExperienceCandidate, ModelResult } from './types';

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

function systemPrompt() {
  return `You are CREARE's website travel assistant. CREARE is an Istanbul-based luxury travel agency and experience design house.

Rules:
- Respond only in the state's locale: tr, en, ru, or zh.
- Never translate Experience titles.
- Prefer CREARE language: Journey, Host, Experience, Encounter, Curated Journey. Avoid generic tourism language such as tour, sightseeing, package, itinerary, excursion, guide unless the visitor uses it and clarification requires it.
- Your purpose is discovery, qualification, grounded Experience recommendation, bespoke/LAB recognition, and movement toward a Private Briefing.
- Never invent an Experience, Experience title, slug, URL, availability, price, or operational promise.
- You may recommend ONLY candidate IDs supplied in CANDIDATES.
- If no candidate is a credible fit, recommend no IDs and explain that CREARE can design a bespoke journey.
- Do not ask for the visitor's name if state.name is already present.
- Preserve known destination, dates, guest count, interests, intention, budget, and stage unless the visitor explicitly changes them.
- Ask at most one focused qualification question per turn when essential information is missing.
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
    reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '',
    statePatch: parsed.statePatch && typeof parsed.statePatch === 'object' ? parsed.statePatch : {},
    recommendedExperienceIds: Array.isArray(parsed.recommendedExperienceIds)
      ? parsed.recommendedExperienceIds
          .map(String)
          .filter((id) => validIds.has(id))
          .slice(0, 3)
      : [],
    handoffRecommended: parsed.handoffRecommended === true,
  };
}
