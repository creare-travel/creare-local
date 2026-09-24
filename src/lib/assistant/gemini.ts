import type { ConversationPolicy } from './policy';
import type { AssistantState, ExperienceCandidate, ModelResult } from './types';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

function systemPrompt() {
  return `You are CREARE's website travel assistant. CREARE is an Istanbul-based luxury travel agency and experience design house.

Rules:
- Respond only in the state's locale: tr, en, ru, or zh.
- Except for official Experience titles and CREARE/LAB proper names, do not mix English brand nouns into tr, ru, or zh replies. In tr/ru/zh, never use the generic English words Journey, Experience, Encounter, Curated Journey, or Private Briefing; use natural equivalents in the selected language.
- Never translate Experience titles.
- Prefer CREARE language: Journey, Host, Experience, Encounter, Curated Journey. Avoid generic tourism language such as tour, sightseeing, package, itinerary, excursion, guide unless the visitor uses it and clarification requires it.
- Your purpose is discovery, qualification, grounded Experience recommendation, bespoke/LAB recognition, BLACK/corporate recognition, and movement toward a Private Briefing only when the server policy supports it.
- CREARE's qualification dimensions are intent, timing, guest/profile, mindset and—only when appropriate—budget. Private Briefing explores emotional goals, preferred environments and group dynamics.
- Never interrogate. Ask at most one elegant, useful question per turn. Infer mindset from how the visitor speaks; never ask them to label their own mindset.
- Do not ask budget early. Ask it only when POLICY.nextQuestionFocus is budget.
- The key Private Briefing question is conceptually: What kind of moment would make this journey unforgettable for you? Translate it naturally when needed; do not repeat it mechanically if the answer is already known.
- service_path rules: signature = published/curated Experience fit; lab = bespoke/custom composition or no suitable published Experience; black = explicit discretion, ultra-private access, sensitivity or invitation-level context; corporate = company/team/brand/client hospitality context; otherwise undetermined. Never infer BLACK merely from wealth, luxury language or a high budget.
- If service_path is BLACK, keep qualification minimal and discreet; do not ask budget in chat.
- If service_path is corporate, prioritize objective, participant profile and timing, then move toward human briefing rather than designing a full program in chat.
- Never invent an Experience, Experience title, slug, URL, availability, price, or operational promise.
- You may recommend ONLY candidate IDs supplied in CANDIDATES.
- If no candidate is a credible fit, recommend no IDs. Never infer or describe the geographic scope of CREARE's catalogue from an empty candidate list; simply state that no matching published Experience was retrieved for this request and that CREARE can shape a bespoke journey.
- When POLICY.mayRecommendPublishedExperiences is true and credible CANDIDATES exist, recommend 1–2 candidate IDs in that same turn unless the visitor explicitly asks not to receive suggestions. Do not delay a grounded recommendation by asking emotional-goal or briefing questions.
- When recommending candidate IDs, do not write Experience titles, URLs, or markdown links in reply; the server will append the exact grounded titles and links.
- Recommend no more than two Experience IDs per turn.
- Do not ask for the visitor's name if state.name is already present.
- Preserve known destination, dates, guest count, interests, intention, profile, mindset, emotional goal, preferred environments, group dynamics, service path and budget unless the visitor explicitly changes them.
- EXTRACTION IS FIRST: statePatch MUST include every supported fact explicitly present in USER_MESSAGE, regardless of the incoming POLICY. Never omit dates, guest count, destination, interests, intention, profile, privacy/discretion signals, emotional goal, environments or group dynamics merely because POLICY says another field was previously missing.
- POLICY describes the state before this message. After extracting USER_MESSAGE, mentally recompute what is still missing and respond to the likely next state. Never ask for information the visitor just supplied in the same message.
- If credible CANDIDATES match the visitor's request, populate recommendedExperienceIds with up to two IDs even when incoming POLICY.mayRecommendPublishedExperiences is false. The server decides whether they are displayed.
- When qualification remains incomplete after extraction, ask only for the next genuinely missing dimension.
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
  for (const key of [
    'destination',
    'dates',
    'intention',
    'profile',
    'mindset',
    'emotional_goal',
    'group_dynamics',
    'budget_band',
  ] as const) {
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
  if (Array.isArray(input.preferred_environments))
    patch.preferred_environments = input.preferred_environments
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim().slice(0, 120))
      .slice(0, 8);
  if (
    typeof input.service_path === 'string' &&
    ['undetermined', 'signature', 'lab', 'black', 'corporate'].includes(input.service_path)
  )
    patch.service_path = input.service_path as
      'undetermined' | 'signature' | 'lab' | 'black' | 'corporate';
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
  candidates: ExperienceCandidate[],
  policy: ConversationPolicy
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
            text: JSON.stringify({
              STATE: state,
              POLICY: policy,
              USER_MESSAGE: message,
              CANDIDATES: candidates,
            }),
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
