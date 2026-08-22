import type { SiteLocale } from '@/lib/i18n/config';

export const CONTACT_PHONE_DISPLAY = '+90 541 220 3000';
export const CONTACT_PHONE_HREF = 'tel:+905412203000';
export const CONTACT_EMAIL = 'direct@crearetravel.com';

const WHATSAPP_MESSAGES: Record<SiteLocale, string> = {
  en: 'Hello CREARE, I would like to make a private inquiry.',
  tr: 'Merhaba CREARE, özel bir talepte bulunmak istiyorum.',
  zh: '您好 CREARE，我想进行私享咨询。',
};

export function buildWhatsAppHref(locale: SiteLocale, experienceTitle?: string): string {
  const baseMessage = WHATSAPP_MESSAGES[locale];
  const contextualMessage = experienceTitle
    ? {
        en: `${baseMessage} I am interested in ${experienceTitle}.`,
        tr: `${baseMessage} ${experienceTitle} hakkında görüşmek istiyorum.`,
        zh: `${baseMessage} 我对 ${experienceTitle} 感兴趣。`,
      }[locale]
    : baseMessage;
  return `https://wa.me/905412203000?text=${encodeURIComponent(contextualMessage)}`;
}

function parseOptionalHttpsUrl(value?: string): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getGoogleAppointmentUrl(): string | null {
  const url = parseOptionalHttpsUrl(process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL);
  if (!url) return null;
  const hostname = new URL(url).hostname;
  return hostname === 'calendar.app.google' || hostname === 'calendar.google.com' ? url : null;
}

export interface WeChatConfig {
  id: string;
  qrUrl: string;
}

export function getWeChatConfig(): WeChatConfig | null {
  const id = process.env.NEXT_PUBLIC_WECHAT_ID?.trim();
  const qrUrl = parseOptionalHttpsUrl(process.env.NEXT_PUBLIC_WECHAT_QR_URL);
  return id && qrUrl ? { id, qrUrl } : null;
}
