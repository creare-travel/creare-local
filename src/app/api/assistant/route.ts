import { NextRequest, NextResponse } from 'next/server';
import { runGemini } from '@/lib/assistant/gemini';
import { createInitialState, decryptState, encryptState, mergeState } from '@/lib/assistant/state';
import { hydrateExperiences, retrieveExperienceCandidates } from '@/lib/assistant/strapi';
import type { AssistantLocale, AssistantRequest } from '@/lib/assistant/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REQUEST_BYTES = 12_000;
const LOCALE_MAP: Record<string, AssistantLocale> = {
  tr: 'tr',
  en: 'en',
  ru: 'ru',
  zh: 'zh',
  turkish: 'tr',
  english: 'en',
  russian: 'ru',
  chinese: 'zh',
  türkçe: 'tr',
  русский: 'ru',
  中文: 'zh',
};

function localeOf(value: unknown): AssistantLocale {
  if (typeof value !== 'string') return 'en';
  return LOCALE_MAP[value.trim().toLocaleLowerCase('en-US')] || 'en';
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ success: false, error: 'Request is too large.' }, { status: 413 });
    }
    let body: AssistantRequest;
    try {
      body = JSON.parse(raw) as AssistantRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const isInitialTurn =
      !body.state_token && typeof body.name === 'string' && body.name.trim().length > 0;
    if ((!message && !isInitialTurn) || message.length > 3000) {
      return NextResponse.json({ success: false, error: 'Invalid message.' }, { status: 400 });
    }
    const modelMessage = message || 'START_SESSION';

    let state;
    if (body.state_token) {
      try {
        state = decryptState(body.state_token);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid session state.' },
          { status: 400 }
        );
      }
    } else {
      state = createInitialState(
        localeOf(body.locale),
        typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null
      );
    }

    const candidates = await retrieveExperienceCandidates(state, modelMessage);
    const model = await runGemini(state, modelMessage, candidates);
    const nextState = mergeState(state, model.statePatch, message, model.recommendedExperienceIds);
    const experiences = hydrateExperiences(
      candidates,
      model.recommendedExperienceIds,
      nextState.locale
    );

    const groundedLinks = experiences.map(
      (experience) => `[${experience.title}](${experience.url})`
    );
    const reply = groundedLinks.length
      ? `${model.reply}\n\n${groundedLinks.join('\n')}`
      : model.reply;

    return NextResponse.json({
      success: true,
      reply,
      state_token: encryptState(nextState),
      stage: nextState.conversation_stage,
      experiences,
      handoff_recommended: model.handoffRecommended,
    });
  } catch (error) {
    console.error('[assistant] request failed', {
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { success: false, error: 'Assistant is temporarily unavailable.' },
      { status: 503 }
    );
  }
}
