import { NextRequest, NextResponse } from 'next/server';
import { runGemini } from '@/lib/assistant/gemini';
import { createInitialState, decryptState, encryptState, mergeState } from '@/lib/assistant/state';
import {
  hasDestinationMatch,
  hydrateExperiences,
  retrieveExperienceCandidates,
} from '@/lib/assistant/strapi';
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

function initialReply(locale: AssistantLocale, name: string) {
  const replies: Record<AssistantLocale, string> = {
    en: `Welcome, ${name}. What kind of journey or atmosphere would you like us to begin shaping?`,
    tr: `Hoş geldiniz, ${name}. Nasıl bir yolculuk veya atmosfer tasarlamaya başlamamızı istersiniz?`,
    ru: `Добро пожаловать, ${name}. Какое путешествие или атмосферу вы хотели бы начать создавать вместе с CREARE?`,
    zh: `欢迎，${name}。您希望我们从怎样的旅程或氛围开始为您构思？`,
  };
  return replies[locale];
}

function recommendationLead(locale: AssistantLocale) {
  const replies: Record<AssistantLocale, string> = {
    en: 'These published CREARE Experiences are the closest grounded matches to what you have shared:',
    tr: 'Paylaştığınız tercihlere en yakın yayımlanmış CREARE deneyimleri:',
    ru: 'Наиболее близкие опубликованные варианты CREARE по вашему запросу:',
    zh: '根据您目前分享的偏好，以下是最接近的已发布 CREARE 体验：',
  };
  return replies[locale];
}

function noMatchReply(locale: AssistantLocale, destination: string) {
  const replies: Record<AssistantLocale, string> = {
    en: `I don't have a matching published CREARE Experience for ${destination} in the retrieved catalogue. We can instead shape a bespoke journey around your interests. Would you like to move to a Private Briefing?`,
    tr: `${destination} için getirilen katalogda doğrudan eşleşen yayımlanmış bir CREARE deneyimi görünmüyor. Bunun yerine ilgi alanlarınıza göre size özel bir yolculuk tasarlayabiliriz. Özel görüşme aşamasına geçmek ister misiniz?`,
    ru: `В полученном каталоге нет опубликованного опыта CREARE, напрямую соответствующего запросу по направлению ${destination}. Вместо этого мы можем создать индивидуальное путешествие вокруг ваших интересов. Перейдём к приватному брифингу?`,
    zh: `在当前检索到的目录中，没有与 ${destination} 直接匹配的已发布 CREARE 体验。我们可以根据您的兴趣为您设计专属旅程。是否进入私人需求沟通阶段？`,
  };
  return replies[locale];
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

    if (isInitialTurn && !message && state.name) {
      return NextResponse.json({
        success: true,
        reply: initialReply(state.locale, state.name),
        state_token: encryptState(state),
        stage: state.conversation_stage,
        experiences: [],
        handoff_recommended: false,
      });
    }

    const candidates = await retrieveExperienceCandidates(state, modelMessage);
    const model = await runGemini(state, modelMessage, candidates);
    const statePatch = { ...model.statePatch };
    if (
      model.handoffRecommended &&
      statePatch.conversation_stage !== 'handoff' &&
      statePatch.conversation_stage !== 'private_briefing'
    ) {
      statePatch.conversation_stage = 'private_briefing';
    }
    const nextState = mergeState(state, statePatch, message, model.recommendedExperienceIds);
    const experiences = hydrateExperiences(
      candidates,
      model.recommendedExperienceIds,
      nextState.locale
    );

    const groundedLinks = experiences.map(
      (experience) => `[${experience.title}](${experience.url})`
    );
    const destinationMismatch =
      nextState.destination && !hasDestinationMatch(candidates, nextState.destination);
    const baseReply =
      experiences.length === 0 && nextState.destination && destinationMismatch
        ? noMatchReply(nextState.locale, nextState.destination)
        : model.reply.trim() || recommendationLead(nextState.locale);
    const reply = groundedLinks.length ? `${baseReply}\n\n${groundedLinks.join('\n')}` : baseReply;

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
