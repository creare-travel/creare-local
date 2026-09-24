import crypto from 'node:crypto';
import type { AssistantLocale, AssistantState, ConversationTurn, ModelStatePatch } from './types';

const TOKEN_VERSION = 'v1';

function getKey() {
  const secret = process.env.ASSISTANT_STATE_SECRET || process.env.GEMINI_API_KEY;
  if (!secret) throw new Error('Assistant state encryption secret is not configured');
  return crypto.createHash('sha256').update(`creare-assistant-state-v1:${secret}`).digest();
}

export function createInitialState(
  locale: AssistantLocale = 'en',
  name: string | null = null
): AssistantState {
  return {
    session_id: crypto.randomUUID(),
    locale,
    name,
    destination: null,
    dates: null,
    guest_count: null,
    interests: [],
    intention: null,
    profile: null,
    mindset: null,
    emotional_goal: null,
    preferred_environments: [],
    group_dynamics: null,
    service_path: 'undetermined',
    ticket_no: null,
    budget_band: null,
    conversation_stage: 'discovery',
    recommended_experience_ids: [],
    last_user_message: null,
    conversation_history: [],
    model_turn_count: 0,
  };
}

export function encryptState(state: AssistantState) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(state), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    TOKEN_VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptState(token: string): AssistantState {
  const [version, ivPart, tagPart, ciphertextPart] = token.split('.');
  if (version !== TOKEN_VERSION || !ivPart || !tagPart || !ciphertextPart)
    throw new Error('Invalid state token');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getKey(),
    Buffer.from(ivPart, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  const parsed = JSON.parse(plaintext) as AssistantState;
  return {
    ...parsed,
    conversation_history: Array.isArray(parsed.conversation_history)
      ? parsed.conversation_history
      : [],
    model_turn_count:
      typeof parsed.model_turn_count === 'number' && Number.isFinite(parsed.model_turn_count)
        ? parsed.model_turn_count
        : 0,
  };
}

const MAX_TRANSCRIPT_TURNS = 40;
const MAX_TRANSCRIPT_CHARS = 30_000;

function trimTranscript(turns: ConversationTurn[]) {
  const kept = turns.slice(-MAX_TRANSCRIPT_TURNS);
  let total = kept.reduce((sum, turn) => sum + turn.text.length, 0);
  while (kept.length > 2 && total > MAX_TRANSCRIPT_CHARS) {
    const removed = kept.shift();
    total -= removed?.text.length ?? 0;
  }
  return kept;
}

export function appendConversationTurn(
  state: AssistantState,
  role: ConversationTurn['role'],
  text: string
): AssistantState {
  const clean = text.trim();
  if (!clean) return state;
  return {
    ...state,
    conversation_history: trimTranscript([
      ...(state.conversation_history || []),
      { role, text: clean.slice(0, 6_000) },
    ]),
  };
}

export function mergeState(
  state: AssistantState,
  patch: ModelStatePatch,
  message: string,
  recommendedIds: string[]
) {
  const next: AssistantState = {
    ...state,
    ...patch,
    interests: Array.isArray(patch.interests) ? patch.interests.slice(0, 12) : state.interests,
    preferred_environments: Array.isArray(patch.preferred_environments)
      ? patch.preferred_environments.slice(0, 8)
      : state.preferred_environments,
    guest_count:
      typeof patch.guest_count === 'number' && Number.isFinite(patch.guest_count)
        ? Math.max(1, Math.min(100, Math.round(patch.guest_count)))
        : state.guest_count,
    recommended_experience_ids: recommendedIds.slice(0, 6),
    last_user_message: message,
  };
  return next;
}
