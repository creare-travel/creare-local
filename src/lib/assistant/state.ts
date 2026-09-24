import crypto from 'node:crypto';
import type { AssistantLocale, AssistantState, ModelStatePatch } from './types';

const TOKEN_VERSION = 'v1';

function getKey() {
  const secret = process.env.ASSISTANT_STATE_SECRET;
  if (!secret) throw new Error('ASSISTANT_STATE_SECRET is not configured');
  return crypto.createHash('sha256').update(secret).digest();
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
    budget_band: null,
    conversation_stage: 'discovery',
    recommended_experience_ids: [],
    last_user_message: null,
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
  return JSON.parse(plaintext) as AssistantState;
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
    guest_count:
      typeof patch.guest_count === 'number' && Number.isFinite(patch.guest_count)
        ? Math.max(1, Math.min(100, Math.round(patch.guest_count)))
        : state.guest_count,
    recommended_experience_ids: recommendedIds.slice(0, 6),
    last_user_message: message,
  };
  return next;
}
