import { NextRequest, NextResponse } from 'next/server';
import {
  detectServicePathSignal,
  extractGuestCount,
  extractLiteralDates,
  extractLiteralDestination,
} from '@/lib/assistant/extractors';
import { runGemini } from '@/lib/assistant/gemini';
import {
  MAX_MODEL_TURNS,
  availabilityBoundaryReply,
  catalogueUnavailableReply,
  isAvailabilityRequest,
  isExactRepeat,
  isPriceOnlyRequest,
  isPromptInjectionAttempt,
  isStandaloneBookingRequest,
  modelUnavailableReply,
  pricingBoundaryReply,
  repeatReply,
  securityReply,
  standaloneBookingReply,
  turnLimitReply,
} from '@/lib/assistant/guardrails';
import { assessLead } from '@/lib/assistant/lead';
import { logAssistantMetric } from '@/lib/assistant/metrics';
import { deriveConversationPolicy } from '@/lib/assistant/policy';
import {
  buildAiControlNotes,
  buildConversationTranscript,
  buildHandoffContent,
  buildHandoffSummary,
  createTicketNo,
} from '@/lib/assistant/ticket';
import {
  appendConversationTurn,
  createInitialState,
  decryptState,
  encryptState,
  mergeState,
} from '@/lib/assistant/state';
import {
  hasDestinationMatch,
  hydrateExperiences,
  retrieveExperienceCandidates,
} from '@/lib/assistant/strapi';
import type { AssistantLocale, AssistantRequest, AssistantState } from '@/lib/assistant/types';

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

function hasExplicitIntentSignal(message: string) {
  const value = message.toLocaleLowerCase('en-US');
  return [
    'we want',
    'i want',
    ' want ',
    'we would like',
    'i would like',
    'interested in',
    'care most about',
    'care about',
    'cares about',
    'looking for',
    'hope to',
    'celebrating',
    'need a',
    'need an',
    'objective is',
    'goal is',
    'istiyoruz',
    'isteriz',
    'arıyoruz',
    'ilgileniyoruz',
    'kutluyoruz',
    'хотим',
    'интересуют',
    'ищем',
    'нужен',
    'нужна',
    '希望',
    '想要',
    '感兴趣',
    '我们想',
    '我想',
  ].some((signal) => value.includes(signal));
}

function isChecklistTourismRequest(message: string) {
  const value = message.toLocaleLowerCase('en-US');
  return [
    'top 10 tourist',
    'cheap package',
    'fastest sightseeing',
    'checklist tourism',
    'budget package tour',
  ].some((signal) => value.includes(signal));
}

function checklistRedirect(locale: AssistantLocale) {
  const replies: Record<AssistantLocale, string> = {
    en: 'CREARE is not designed around checklist sightseeing or low-cost packages. If you would like, we can instead focus on one or two meaningful encounters shaped around what genuinely interests you. What would you most like to understand or feel in Istanbul?',
    tr: 'CREARE, hızlı gezi listeleri veya düşük maliyetli paketler üzerine kurulmaz. İsterseniz bunun yerine gerçekten ilginizi çeken bir veya iki anlamlı karşılaşmaya odaklanabiliriz. İstanbul’da en çok neyi anlamak veya hissetmek istersiniz?',
    ru: 'CREARE не строит путешествия вокруг списков достопримечательностей или бюджетных пакетов. Вместо этого мы можем сосредоточиться на одном-двух содержательных культурных впечатлениях. Что в Стамбуле вам действительно хотелось бы понять или почувствовать?',
    zh: 'CREARE 并不以打卡式观光或低价套餐为核心。如果您愿意，我们可以转而聚焦一到两个真正有意义的文化体验。您在伊斯坦布尔最希望理解或感受到什么？',
  };
  return replies[locale];
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

function basicResponse(
  state: ReturnType<typeof createInitialState>,
  reply: string,
  startedAt: number,
  guardrail: string
) {
  const nextState = appendConversationTurn(state, 'assistant', reply);
  logAssistantMetric({
    state: nextState,
    event: 'guardrail',
    durationMs: Date.now() - startedAt,
    guardrail,
  });
  return NextResponse.json({
    success: true,
    reply,
    state_token: encryptState(nextState),
    stage: nextState.conversation_stage,
    experiences: [],
    handoff_recommended: false,
    ticket_no: nextState.ticket_no,
    handoff_summary: null,
    handoff_transcript: null,
    handoff_control_notes: null,
    handoff_email_prompt: null,
    handoff_confirmation: null,
    guest_email_subject: null,
    guest_email_body: null,
    lead_quality: null,
    lead_priority: null,
    lead_urgency_reason: null,
    lead_missing_information: null,
    lead_next_action: null,
  });
}

function privateBriefingReply(locale: AssistantLocale, path: string, ticket: string | null) {
  const replies: Record<AssistantLocale, string> = {
    en:
      path === 'black'
        ? `What you have shared is enough to move this into a discreet Private Briefing${ticket ? ` under ${ticket}` : ''}. To open the file, please share your full name.`
        : `What you have shared is enough to move into a Private Briefing${ticket ? ` under ${ticket}` : ''}. To open the file, please share your full name.`,
    tr:
      path === 'black'
        ? `Paylaştıklarınız bu talebi mahrem bir özel görüşmeye taşımak için yeterli${ticket ? `; dosya referansınız ${ticket}` : ''}. Dosyayı açabilmemiz için lütfen adınızı ve soyadınızı paylaşın.`
        : `Paylaştıklarınız özel görüşme aşamasına geçmek için yeterli${ticket ? `; dosya referansınız ${ticket}` : ''}. Dosyayı açabilmemiz için lütfen adınızı ve soyadınızı paylaşın.`,
    ru:
      path === 'black'
        ? `Этого достаточно, чтобы перевести запрос в конфиденциальный частный брифинг${ticket ? ` под номером ${ticket}` : ''}. Чтобы открыть файл, пожалуйста, укажите имя и фамилию.`
        : `Этого достаточно, чтобы перейти к частному брифингу${ticket ? ` под номером ${ticket}` : ''}. Чтобы открыть файл, пожалуйста, укажите имя и фамилию.`,
    zh:
      path === 'black'
        ? `您目前提供的信息已足够进入私密沟通阶段${ticket ? `，档案编号为 ${ticket}` : ''}。为建立档案，请提供您的姓名。`
        : `您目前提供的信息已足够进入私人需求沟通阶段${ticket ? `，档案编号为 ${ticket}` : ''}。为建立档案，请提供您的姓名。`,
  };
  return replies[locale];
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
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
      const reply = initialReply(state.locale, state.name);
      state = appendConversationTurn(state, 'assistant', reply);
      return NextResponse.json({
        success: true,
        reply,
        state_token: encryptState(state),
        stage: state.conversation_stage,
        experiences: [],
        handoff_recommended: false,
      });
    }

    if (isPromptInjectionAttempt(message)) {
      state = appendConversationTurn(state, 'visitor', message);
      return basicResponse(state, securityReply(state.locale), startedAt, 'prompt_injection');
    }

    if (isStandaloneBookingRequest(message)) {
      state = appendConversationTurn(state, 'visitor', message);
      return basicResponse(
        state,
        standaloneBookingReply(state.locale),
        startedAt,
        'standalone_booking'
      );
    }

    if (isPriceOnlyRequest(message)) {
      state = appendConversationTurn(state, 'visitor', message);
      return basicResponse(
        state,
        pricingBoundaryReply(state.locale),
        startedAt,
        'pricing_boundary'
      );
    }

    if (isAvailabilityRequest(message)) {
      state = appendConversationTurn(state, 'visitor', message);
      return basicResponse(
        state,
        availabilityBoundaryReply(state.locale),
        startedAt,
        'availability_boundary'
      );
    }

    if (isExactRepeat(state, message)) {
      state = appendConversationTurn(state, 'visitor', message);
      const policy = deriveConversationPolicy(state);
      const nextQuestion =
        policy.nextQuestionFocus !== 'none' && policy.nextQuestionFocus !== 'private_briefing'
          ? qualificationQuestion(state.locale, policy.nextQuestionFocus)
          : '';
      const reply = [repeatReply(state.locale), nextQuestion].filter(Boolean).join(' ');
      return basicResponse(state, reply, startedAt, 'exact_repeat');
    }

    if ((state.model_turn_count ?? 0) >= MAX_MODEL_TURNS) {
      state = appendConversationTurn(state, 'visitor', message);
      const ticket = state.ticket_no || createTicketNo();
      let nextState: AssistantState = {
        ...state,
        ticket_no: ticket,
        service_path: state.service_path === 'undetermined' ? ('lab' as const) : state.service_path,
        conversation_stage: 'private_briefing' as const,
        last_user_message: message,
      };
      const reply = turnLimitReply(nextState.locale, ticket);
      nextState = appendConversationTurn(nextState, 'assistant', reply);
      const handoffContent = buildHandoffContent(nextState.locale, ticket);
      const leadAssessment = assessLead(nextState);
      return NextResponse.json({
        success: true,
        reply,
        state_token: encryptState(nextState),
        stage: nextState.conversation_stage,
        experiences: [],
        handoff_recommended: true,
        ticket_no: ticket,
        handoff_summary: buildHandoffSummary(nextState),
        handoff_transcript: buildConversationTranscript(nextState),
        handoff_control_notes: buildAiControlNotes(nextState),
        handoff_email_prompt: handoffContent.emailPrompt,
        handoff_confirmation: handoffContent.confirmation,
        guest_email_subject: handoffContent.guestSubject,
        guest_email_body: handoffContent.guestBody,
        lead_quality: leadAssessment.quality,
        lead_priority: leadAssessment.priority.toUpperCase(),
        lead_urgency_reason: leadAssessment.urgency_reason,
        lead_missing_information: leadAssessment.missing_information.join(', ') || 'none',
        lead_next_action: leadAssessment.next_action,
      });
    }

    state = appendConversationTurn(state, 'visitor', message);
    let candidates;
    try {
      candidates = await retrieveExperienceCandidates(state, modelMessage);
    } catch (error) {
      console.error('[assistant] catalogue retrieval failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      return basicResponse(
        state,
        catalogueUnavailableReply(state.locale),
        startedAt,
        'catalogue_unavailable'
      );
    }
    const currentPolicy = deriveConversationPolicy(state);
    const modelState = { ...state, conversation_history: [] };
    let model;
    try {
      model = await runGemini(modelState, modelMessage, candidates, currentPolicy);
    } catch (error) {
      console.error('[assistant] model request failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      return basicResponse(
        state,
        modelUnavailableReply(state.locale),
        startedAt,
        'model_unavailable'
      );
    }
    const statePatch = { ...model.statePatch };
    if (!state.destination && !statePatch.destination) {
      const literalDestination = extractLiteralDestination(message);
      if (literalDestination) statePatch.destination = literalDestination;
    }
    if (!state.dates && !statePatch.dates) {
      const literalDates = extractLiteralDates(message);
      if (literalDates) statePatch.dates = literalDates;
    }
    if (!state.guest_count && !statePatch.guest_count) {
      const guestCount = extractGuestCount(message);
      if (guestCount) statePatch.guest_count = guestCount;
    }
    if (
      !state.intention &&
      state.interests.length === 0 &&
      !statePatch.intention &&
      (!statePatch.interests || statePatch.interests.length === 0) &&
      hasExplicitIntentSignal(message)
    ) {
      statePatch.intention = message.slice(0, 300);
    }
    const explicitServicePath = detectServicePathSignal(message);
    if (explicitServicePath && state.service_path === 'undetermined') {
      statePatch.service_path = explicitServicePath;
    }
    let provisionalState = {
      ...mergeState(state, statePatch, message, []),
      model_turn_count: (state.model_turn_count ?? 0) + 1,
    };
    const destinationMismatch =
      provisionalState.destination &&
      !hasDestinationMatch(candidates, provisionalState.destination);
    let provisionalPolicyBeforePath = deriveConversationPolicy(provisionalState);
    if (
      state.service_path === 'undetermined' &&
      provisionalPolicyBeforePath.stage === 'discovery' &&
      provisionalPolicyBeforePath.nextQuestionFocus === 'destination'
    ) {
      provisionalState = { ...provisionalState, service_path: 'undetermined' };
      provisionalPolicyBeforePath = deriveConversationPolicy(provisionalState);
    }
    const enteredLabBecauseNoMatch = Boolean(
      destinationMismatch &&
      state.service_path === 'undetermined' &&
      provisionalState.service_path === 'undetermined' &&
      provisionalPolicyBeforePath.nextQuestionFocus !== 'destination'
    );

    if (enteredLabBecauseNoMatch) {
      provisionalState = { ...provisionalState, service_path: 'lab' };
    } else if (
      provisionalState.service_path === 'undetermined' &&
      provisionalPolicyBeforePath.stage === 'recommendation' &&
      candidates.length > 0
    ) {
      provisionalState = { ...provisionalState, service_path: 'signature' };
    }

    const nextPolicy = deriveConversationPolicy(provisionalState);
    const allowedRecommendationIds = nextPolicy.mayRecommendPublishedExperiences
      ? model.recommendedExperienceIds.length > 0
        ? model.recommendedExperienceIds
        : candidates.slice(0, 2).map((candidate) => candidate.id)
      : [];
    let nextState = {
      ...mergeState(provisionalState, {}, message, allowedRecommendationIds),
      conversation_stage: nextPolicy.stage,
    };
    if (nextPolicy.shouldOfferPrivateBriefing && !nextState.ticket_no) {
      nextState = { ...nextState, ticket_no: createTicketNo() };
    }
    const experiences = hydrateExperiences(candidates, allowedRecommendationIds, nextState.locale);

    const groundedLinks = experiences.map(
      (experience) => `[${experience.title}](${experience.url})`
    );
    const baseReply = isChecklistTourismRequest(message)
      ? checklistRedirect(nextState.locale)
      : enteredLabBecauseNoMatch
        ? noMatchReply(nextState.locale, nextState.destination!)
        : nextPolicy.shouldOfferPrivateBriefing
          ? privateBriefingReply(nextState.locale, nextState.service_path, nextState.ticket_no)
          : (nextPolicy.stage === 'discovery' || nextPolicy.stage === 'qualification') &&
              nextPolicy.nextQuestionFocus !== 'none'
            ? qualificationQuestion(nextState.locale, nextPolicy.nextQuestionFocus)
            : nextPolicy.stage === 'recommendation' && experiences.length > 0
              ? recommendationLead(nextState.locale)
              : model.reply.trim() || recommendationLead(nextState.locale);
    const reply = groundedLinks.length ? `${baseReply}\n\n${groundedLinks.join('\n')}` : baseReply;
    nextState = appendConversationTurn(nextState, 'assistant', reply);

    const handoffContent = nextState.ticket_no
      ? buildHandoffContent(nextState.locale, nextState.ticket_no)
      : null;
    const leadAssessment = nextPolicy.shouldOfferPrivateBriefing ? assessLead(nextState) : null;

    logAssistantMetric({
      state: nextState,
      event: nextPolicy.shouldOfferPrivateBriefing ? 'handoff' : 'model_turn',
      durationMs: Date.now() - startedAt,
      candidateCount: candidates.length,
      recommendationCount: experiences.length,
      usage: model.usage,
      ranking: candidates.slice(0, 3).map((candidate) => ({
        id: candidate.id,
        score: 'score' in candidate ? candidate.score : undefined,
        reasons: 'match_reasons' in candidate ? candidate.match_reasons : undefined,
      })),
    });

    return NextResponse.json({
      success: true,
      reply,
      state_token: encryptState(nextState),
      stage: nextState.conversation_stage,
      experiences,
      handoff_recommended: nextPolicy.shouldOfferPrivateBriefing,
      ticket_no: nextState.ticket_no,
      handoff_summary: nextPolicy.shouldOfferPrivateBriefing
        ? buildHandoffSummary(nextState)
        : null,
      handoff_transcript: nextPolicy.shouldOfferPrivateBriefing
        ? buildConversationTranscript(nextState)
        : null,
      handoff_control_notes: nextPolicy.shouldOfferPrivateBriefing
        ? buildAiControlNotes(nextState)
        : null,
      handoff_email_prompt: handoffContent?.emailPrompt ?? null,
      handoff_confirmation: handoffContent?.confirmation ?? null,
      guest_email_subject: handoffContent?.guestSubject ?? null,
      guest_email_body: handoffContent?.guestBody ?? null,
      lead_quality: leadAssessment?.quality ?? null,
      lead_priority: leadAssessment?.priority.toUpperCase() ?? null,
      lead_urgency_reason: leadAssessment?.urgency_reason ?? null,
      lead_missing_information: leadAssessment
        ? leadAssessment.missing_information.join(', ') || 'none'
        : null,
      lead_next_action: leadAssessment?.next_action ?? null,
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
