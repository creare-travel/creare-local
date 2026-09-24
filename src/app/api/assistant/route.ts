import { NextRequest, NextResponse } from 'next/server';
import { runGemini } from '@/lib/assistant/gemini';
import { deriveConversationPolicy } from '@/lib/assistant/policy';
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
    en: `I don't have a matching published CREARE Experience for ${destination} in the retrieved catalogue. We can instead shape this as a bespoke journey. What kind of moment would make this journey unforgettable for you?`,
    tr: `${destination} için getirilen katalogda doğrudan eşleşen yayımlanmış bir CREARE deneyimi görünmüyor. Bunu size özel bir yolculuk olarak tasarlayabiliriz. Bu yolculuğu sizin için unutulmaz kılacak nasıl bir an hayal ediyorsunuz?`,
    ru: `В полученном каталоге нет опубликованного опыта CREARE, напрямую соответствующего запросу по направлению ${destination}. Мы можем создать это как индивидуальное путешествие. Какой момент сделал бы его по-настоящему незабываемым для вас?`,
    zh: `在当前检索到的目录中，没有与 ${destination} 直接匹配的已发布 CREARE 体验。我们可以将其作为专属旅程来构思。什么样的时刻会让这段旅程对您而言真正难忘？`,
  };
  return replies[locale];
}

function qualificationQuestion(locale: AssistantLocale, focus: string) {
  const questions: Record<AssistantLocale, Record<string, string>> = {
    en: {
      destination: 'Where would you like this journey to take shape?',
      timing: 'What timing window are you considering?',
      guest_profile:
        'How many guests will be travelling, and is this a couple, family, friends or a professional group?',
      intention: 'What are you hoping to feel, discover or celebrate through this journey?',
      emotional_goal: 'What kind of moment would make this journey unforgettable for you?',
      preferred_environment:
        'Which environments feel most natural to you—urban, historic, coastal, rural, private interiors, or something else?',
      group_dynamics: 'How would you describe the group dynamic you want us to design around?',
      budget:
        'To calibrate the scope without over-designing it, is there an approximate investment range you would like us to work within?',
    },
    tr: {
      destination: 'Bu yolculuğun nerede şekillenmesini istersiniz?',
      timing: 'Hangi tarih veya zaman aralığını düşünüyorsunuz?',
      guest_profile:
        'Kaç misafir olacaksınız; çift, aile, arkadaş grubu veya profesyonel bir grup mu?',
      intention: 'Bu yolculukta ne hissetmek, keşfetmek veya kutlamak istiyorsunuz?',
      emotional_goal: 'Bu yolculuğu sizin için unutulmaz kılacak nasıl bir an hayal ediyorsunuz?',
      preferred_environment:
        'Size en doğal gelen ortamlar hangileri—şehir, tarihî mekânlar, kıyı, kırsal alanlar, mahrem iç mekânlar veya başka bir atmosfer?',
      group_dynamics: 'Tasarlamamız gereken grup dinamiğini nasıl tarif edersiniz?',
      budget:
        'Kapsamı gereğinden fazla büyütmeden doğru kalibre etmek için, çalışmamızı istediğiniz yaklaşık bir yatırım aralığı var mı?',
    },
    ru: {
      destination: 'Где вы хотели бы, чтобы это путешествие обрело форму?',
      timing: 'Какой период или даты вы рассматриваете?',
      guest_profile: 'Сколько будет гостей — пара, семья, друзья или профессиональная группа?',
      intention: 'Что вы хотели бы почувствовать, открыть или отметить в этом путешествии?',
      emotional_goal: 'Какой момент сделал бы это путешествие по-настоящему незабываемым для вас?',
      preferred_environment:
        'Какие пространства вам ближе — городские, исторические, прибрежные, сельские, приватные интерьеры или иной контекст?',
      group_dynamics: 'Какую динамику внутри группы нам важно учитывать при создании опыта?',
      budget:
        'Чтобы точно откалибровать масштаб, есть ли ориентировочный диапазон инвестиций, в рамках которого вы хотели бы работать?',
    },
    zh: {
      destination: '您希望这段旅程在哪里展开？',
      timing: '您考虑的日期或时间范围是什么？',
      guest_profile: '预计有几位客人？是伴侣、家庭、朋友，还是专业团队？',
      intention: '您希望通过这段旅程感受、发现或庆祝什么？',
      emotional_goal: '什么样的时刻会让这段旅程对您而言真正难忘？',
      preferred_environment:
        '您更偏爱怎样的环境——城市、历史空间、海岸、乡野、私密室内空间，还是其他氛围？',
      group_dynamics: '在设计过程中，我们应当围绕怎样的团队或同行者关系来考虑？',
      budget: '为了准确控制设计范围，您是否有希望我们遵循的大致投入区间？',
    },
  };
  return questions[locale][focus] || '';
}

function privateBriefingReply(locale: AssistantLocale, path: string) {
  const replies: Record<AssistantLocale, string> = {
    en:
      path === 'black'
        ? 'What you have shared is enough to move this into a discreet Private Briefing. CREARE can continue from here without asking you to repeat these details.'
        : 'What you have shared is enough to move into a Private Briefing. CREARE can continue from here without asking you to repeat these details.',
    tr:
      path === 'black'
        ? 'Paylaştıklarınız bu talebi mahrem bir özel görüşmeye taşımak için yeterli. CREARE bundan sonraki aşamada bu bilgileri size tekrar sordurmadan devam edebilir.'
        : 'Paylaştıklarınız özel görüşme aşamasına geçmek için yeterli. CREARE bundan sonraki aşamada bu bilgileri size tekrar sordurmadan devam edebilir.',
    ru:
      path === 'black'
        ? 'Этого достаточно, чтобы перевести запрос в конфиденциальный частный брифинг. CREARE продолжит с уже сохранённым контекстом, не заставляя вас повторять детали.'
        : 'Этого достаточно, чтобы перейти к частному брифингу. CREARE продолжит с уже сохранённым контекстом, не заставляя вас повторять детали.',
    zh:
      path === 'black'
        ? '您目前提供的信息已足够进入私密沟通阶段。CREARE 会保留这些背景信息，后续无需您重复说明。'
        : '您目前提供的信息已足够进入私人需求沟通阶段。CREARE 会保留这些背景信息，后续无需您重复说明。',
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
    const currentPolicy = deriveConversationPolicy(state);
    const model = await runGemini(state, modelMessage, candidates, currentPolicy);
    const statePatch = { ...model.statePatch };
    let provisionalState = mergeState(state, statePatch, message, []);
    const destinationMismatch =
      provisionalState.destination &&
      !hasDestinationMatch(candidates, provisionalState.destination);
    const enteredLabBecauseNoMatch = Boolean(
      destinationMismatch && state.service_path === 'undetermined'
    );

    if (enteredLabBecauseNoMatch) {
      provisionalState = { ...provisionalState, service_path: 'lab' };
    }

    const nextPolicy = deriveConversationPolicy(provisionalState);
    const allowedRecommendationIds = nextPolicy.mayRecommendPublishedExperiences
      ? model.recommendedExperienceIds
      : [];
    const nextState = {
      ...mergeState(provisionalState, {}, message, allowedRecommendationIds),
      conversation_stage: nextPolicy.stage,
    };
    const experiences = hydrateExperiences(candidates, allowedRecommendationIds, nextState.locale);

    const groundedLinks = experiences.map(
      (experience) => `[${experience.title}](${experience.url})`
    );
    const baseReply = enteredLabBecauseNoMatch
      ? noMatchReply(nextState.locale, nextState.destination!)
      : nextPolicy.shouldOfferPrivateBriefing
        ? privateBriefingReply(nextState.locale, nextState.service_path)
        : nextPolicy.stage === 'qualification' && nextPolicy.nextQuestionFocus !== 'none'
          ? qualificationQuestion(nextState.locale, nextPolicy.nextQuestionFocus)
          : nextPolicy.stage === 'recommendation' && experiences.length > 0
            ? recommendationLead(nextState.locale)
            : model.reply.trim() || recommendationLead(nextState.locale);
    const reply = groundedLinks.length ? `${baseReply}\n\n${groundedLinks.join('\n')}` : baseReply;

    return NextResponse.json({
      success: true,
      reply,
      state_token: encryptState(nextState),
      stage: nextState.conversation_stage,
      experiences,
      handoff_recommended: nextPolicy.shouldOfferPrivateBriefing,
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
