import { NextRequest, NextResponse } from 'next/server';
import { runGemini } from '@/lib/assistant/gemini';
import { createInitialState, decryptState, encryptState, mergeState } from '@/lib/assistant/state';
import { hydrateExperiences, retrieveExperienceCandidates } from '@/lib/assistant/strapi';
import type { AssistantLocale, AssistantRequest } from '@/lib/assistant/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REQUEST_BYTES = 12_000;
const LOCALES = new Set<AssistantLocale>(['tr', 'en', 'ru', 'zh']);

function localeOf(value: unknown): AssistantLocale {
  return typeof value === 'string' && LOCALES.has(value as AssistantLocale)
    ? (value as AssistantLocale)
    : 'en';
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
    if (!message || message.length > 3000) {
      return NextResponse.json({ success: false, error: 'Invalid message.' }, { status: 400 });
    }

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

    const candidates = await retrieveExperienceCandidates(state, message);
    const model = await runGemini(state, message, candidates);
    const nextState = mergeState(state, model.statePatch, message, model.recommendedExperienceIds);
    const experiences = hydrateExperiences(
      candidates,
      model.recommendedExperienceIds,
      nextState.locale
    );

    return NextResponse.json({
      success: true,
      reply: model.reply,
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
