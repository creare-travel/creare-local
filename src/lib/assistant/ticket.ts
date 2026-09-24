import crypto from 'node:crypto';
import { assessLead } from './lead';
import type { AssistantState } from './types';

export function createTicketNo(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
  return `CRT-${date}-${suffix}`;
}

export function buildHandoffSummary(state: AssistantState) {
  const lines = [
    `Ticket: ${state.ticket_no || 'pending'}`,
    `Locale: ${state.locale}`,
    `Name: ${state.name || 'not provided'}`,
    `Service path: ${state.service_path}`,
    `Stage: ${state.conversation_stage}`,
    `Destination: ${state.destination || 'not provided'}`,
    `Dates: ${state.dates || 'not provided'}`,
    `Guests: ${state.guest_count ?? 'not provided'}`,
    `Profile: ${state.profile || 'not provided'}`,
    `Intention: ${state.intention || 'not provided'}`,
    `Interests: ${state.interests.length ? state.interests.join(', ') : 'not provided'}`,
    `Mindset: ${state.mindset || 'not provided'}`,
    `Emotional goal: ${state.emotional_goal || 'not provided'}`,
    `Preferred environments: ${
      state.preferred_environments.length ? state.preferred_environments.join(', ') : 'not provided'
    }`,
    `Group dynamics: ${state.group_dynamics || 'not provided'}`,
    `Budget band: ${state.budget_band || 'not provided'}`,
    `Last message: ${state.last_user_message || 'not provided'}`,
  ];
  return lines.join('\n');
}

export function buildHandoffContent(locale: AssistantState['locale'], ticket: string) {
  const content = {
    en: {
      emailPrompt:
        'Where would you like us to send your private briefing reference and follow-up details?',
      confirmation: `Your private briefing has been recorded under ${ticket}. The confirmation is on its way to your email, and the CREARE team has received the same reference and context.`,
      guestSubject: `Your CREARE Private Briefing — ${ticket}`,
      guestBody: `Thank you for sharing the context of your journey.\n\nYour CREARE private briefing is now registered under reference ${ticket}.\n\nThe CREARE team will review the brief using the context you have already shared, so you will not need to repeat it.\n\nFor any follow-up correspondence, please keep ${ticket} as your reference.\n\nCREARE Travel`,
      emailFailure: `We could not complete the email delivery for ${ticket}. Your briefing and conversation context remain safely preserved in CREARE's system. Please re-enter the same email address to retry. If the issue continues, contact direct@crearetravel.com and quote ${ticket}.`,
    },
    tr: {
      emailPrompt:
        'Özel görüşme referansınızı ve takip bilgilerini hangi e-posta adresine iletmemizi istersiniz?',
      confirmation: `Özel görüşmeniz ${ticket} referansıyla kaydedildi. Teyit e-postanıza iletiliyor; CREARE ekibi de aynı referans ve görüşme bağlamını aldı.`,
      guestSubject: `CREARE Özel Görüşmeniz — ${ticket}`,
      guestBody: `Yolculuğunuzun bağlamını bizimle paylaştığınız için teşekkür ederiz.\n\nCREARE özel görüşmeniz ${ticket} referansıyla kaydedildi.\n\nCREARE ekibi, daha önce paylaştığınız görüşme bağlamını koruyarak briefinizi inceleyecek; aynı bilgileri yeniden aktarmanız gerekmeyecek.\n\nTakip yazışmalarınızda lütfen ${ticket} referansını kullanın.\n\nCREARE Travel`,
      emailFailure: `${ticket} referanslı e-posta gönderimini tamamlayamadık. Özel görüşme kaydınız ve konuşma bağlamınız korunuyor. Yeniden denemek için aynı e-posta adresini tekrar girin. Sorun devam ederse direct@crearetravel.com adresine ${ticket} referansıyla yazabilirsiniz.`,
    },
    ru: {
      emailPrompt:
        'На какой адрес электронной почты отправить номер вашего приватного брифинга и информацию для дальнейшей связи?',
      confirmation: `Ваш приватный брифинг зарегистрирован под номером ${ticket}. Подтверждение отправляется на вашу электронную почту; команда CREARE получила тот же номер и весь сохранённый контекст разговора.`,
      guestSubject: `Ваш приватный брифинг CREARE — ${ticket}`,
      guestBody: `Благодарим вас за контекст, которым вы поделились о предстоящем путешествии.\n\nВаш приватный брифинг CREARE зарегистрирован под номером ${ticket}.\n\nКоманда CREARE рассмотрит запрос с учётом уже сохранённого контекста, поэтому вам не потребуется повторять предоставленную информацию.\n\nДля дальнейшей переписки, пожалуйста, используйте номер ${ticket}.\n\nCREARE Travel`,
      emailFailure: `Не удалось завершить отправку письма для ${ticket}. Ваш брифинг и контекст разговора сохранены. Повторно введите тот же адрес электронной почты, чтобы попробовать ещё раз. Если проблема сохранится, напишите на direct@crearetravel.com и укажите ${ticket}.`,
    },
    zh: {
      emailPrompt: '您希望我们将私人需求沟通编号及后续信息发送至哪个电子邮箱？',
      confirmation: `您的私人需求沟通已以 ${ticket} 编号记录。确认邮件正在发送至您的邮箱；CREARE 团队也已收到同一编号及完整的沟通背景。`,
      guestSubject: `您的 CREARE 私人需求沟通 — ${ticket}`,
      guestBody: `感谢您与我们分享此次旅程的背景与期待。\n\n您的 CREARE 私人需求沟通已以 ${ticket} 编号登记。\n\nCREARE 团队将依据您已经提供的完整沟通背景进行审阅，因此无需再次重复相同信息。\n\n后续沟通时，请保留并使用 ${ticket} 作为您的参考编号。\n\nCREARE Travel`,
      emailFailure: `${ticket} 的邮件发送未能完成。您的需求档案和对话背景均已保留。请重新输入同一电子邮箱以再次尝试。如果问题持续存在，请联系 direct@crearetravel.com 并注明 ${ticket}。`,
    },
  } as const;
  return content[locale];
}

export function buildConversationTranscript(state: AssistantState) {
  if (!state.conversation_history.length) return 'No assistant conversation recorded.';
  return state.conversation_history
    .map((turn) => `${turn.role === 'visitor' ? '[VISITOR]' : '[CREARE ASSISTANT]'}\n${turn.text}`)
    .join('\n\n');
}

export function buildAiControlNotes(state: AssistantState) {
  const assessment = assessLead(state);
  const known = [
    state.destination && 'destination',
    state.dates && 'timing',
    state.guest_count && 'guest_count',
    (state.intention || state.interests.length) && 'intention/interests',
    state.emotional_goal && 'emotional_goal',
    state.preferred_environments.length && 'preferred_environments',
    state.group_dynamics && 'group_dynamics',
    state.budget_band && 'budget',
  ].filter(Boolean);
  const handoffReason =
    state.service_path === 'black'
      ? 'Explicit discretion / private-access context'
      : state.service_path === 'corporate'
        ? 'Corporate / professional briefing path'
        : state.service_path === 'lab'
          ? 'Bespoke LAB path / published Experience not sufficient for the brief'
          : 'Human follow-up requested by conversation policy';
  const lines = [
    `Human review required: yes`,
    `Lead quality: ${assessment.quality}`,
    `Priority: ${assessment.priority}`,
    `Urgency reason: ${assessment.urgency_reason}`,
    `Missing information: ${assessment.missing_information.length ? assessment.missing_information.join(', ') : 'none'}`,
    `Recommended next action: ${assessment.next_action}`,
    `Handoff reason: ${handoffReason}`,
    `Service path: ${state.service_path}`,
    `Conversation stage: ${state.conversation_stage}`,
    `Captured qualification fields: ${known.length ? known.join(', ') : 'none'}`,
    `Grounded Experience IDs retained in state: ${
      state.recommended_experience_ids.length ? state.recommended_experience_ids.join(', ') : 'none'
    }`,
    `Transcript turns: ${state.conversation_history.length}`,
    `Control note: Review the transcript against the structured brief before replying to the guest.`,
  ];
  return lines.join('\n');
}
