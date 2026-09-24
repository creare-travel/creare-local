import crypto from 'node:crypto';
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
        'Please share the email address where you would like us to send your briefing reference and follow-up.',
      confirmation: `Your private briefing file has been recorded under ${ticket}. A confirmation has been sent to your email, and the same reference has been forwarded to the CREARE team.`,
      guestSubject: `CREARE Private Briefing — ${ticket}`,
      guestBody: `Your CREARE private briefing file has been created under reference ${ticket}.\n\nOur team will review the context you shared and continue with this same reference.\n\nPlease keep ${ticket} for any follow-up correspondence.\n\nCREARE Travel`,
    },
    tr: {
      emailPrompt:
        'Özel görüşme referansınızı ve takip bilgisini iletmemiz için e-posta adresinizi paylaşır mısınız?',
      confirmation: `Özel görüşme dosyanız ${ticket} referansıyla kaydedildi. Teyit e-postanıza gönderildi ve aynı referans CREARE ekibine iletildi.`,
      guestSubject: `CREARE Özel Görüşme — ${ticket}`,
      guestBody: `CREARE özel görüşme dosyanız ${ticket} referansıyla oluşturuldu.\n\nEkibimiz paylaştığınız bağlamı inceleyecek ve aynı referans üzerinden devam edecektir.\n\nTakip yazışmalarınız için ${ticket} numarasını saklamanızı rica ederiz.\n\nCREARE Travel`,
    },
    ru: {
      emailPrompt:
        'Пожалуйста, укажите адрес электронной почты, на который мы можем отправить номер вашего приватного брифинга и дальнейшую информацию.',
      confirmation: `Ваш приватный брифинг зарегистрирован под номером ${ticket}. Подтверждение отправлено на вашу электронную почту, а тот же номер передан команде CREARE.`,
      guestSubject: `CREARE Private Briefing — ${ticket}`,
      guestBody: `Ваш приватный брифинг CREARE создан под номером ${ticket}.\n\nНаша команда изучит переданный вами контекст и продолжит работу с тем же номером.\n\nПожалуйста, сохраняйте ${ticket} для дальнейшей переписки.\n\nCREARE Travel`,
    },
    zh: {
      emailPrompt: '请提供您希望接收私人需求沟通编号及后续信息的电子邮箱。',
      confirmation: `您的私人需求沟通档案已以 ${ticket} 编号记录。确认邮件已发送至您的邮箱，同一编号也已转交 CREARE 团队。`,
      guestSubject: `CREARE 私人需求沟通 — ${ticket}`,
      guestBody: `您的 CREARE 私人需求沟通档案已创建，编号为 ${ticket}。\n\n我们的团队将查看您已分享的背景信息，并继续使用同一编号跟进。\n\n请保留 ${ticket} 以便后续沟通。\n\nCREARE Travel`,
    },
  } as const;
  return content[locale];
}
