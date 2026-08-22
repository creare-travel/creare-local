'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import OutboundLink from '@/components/analytics/OutboundLink';
import WeChatContact from '@/components/contact/WeChatContact';
import { buildCloudinaryUrl } from '@/lib/cloudinary';
import {
  buildWhatsAppHref,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  getGoogleAppointmentUrl,
  getWeChatConfig,
} from '@/lib/contact/channels';
import {
  trackContactSubmit,
  trackFormStart,
  trackFormSubmit,
  trackFormError,
  getExperienceSlug,
} from '@/lib/analytics/tracking';
import type { LocaleKey } from '@/lib/i18n/config';
import {
  INQUIRY_INTENT_LABELS,
  INQUIRY_INTENTS,
  INQUIRY_LIMITS,
  type InquiryIntent,
} from '@/lib/inquiry';

interface FormData {
  name: string;
  email: string;
  message: string;
  website: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ContactPageClientProps {
  locale?: LocaleKey;
  successRedirectHref?: string | null;
}

const contactCopy = {
  en: {
    heroTitle: 'Private Inquiries',
    heroSupport: 'We respond personally.',
    heroDescription:
      'For strategic engagements, private commissions, and confidential collaborations. We respond personally to international guest requests, partner-led introductions, and culturally specific planning briefs, with each inquiry reviewed in confidence before any proposal, coordination, or access design begins.',
    directLineLabel: 'DIRECT LINE',
    directLineDescription: 'Direct line for private inquiries.',
    privateMessageLabel: 'PRIVATE MESSAGE LINE',
    privateMessageDescription: 'Encrypted private messaging.',
    emailLabel: 'EMAIL',
    emailDescription:
      'For private requests, structured proposals, and strategic collaborations. Early conversations help establish pace, feasibility, and the level of coordination required across hosts, cultural partners, and on-the-ground logistics.',
    locationLabel: 'LOCATION',
    locationDescription: 'Meetings by appointment only.',
    mapsAriaLabel: 'View CREARE office location on Google Maps — 32G7+P8 Şişli, İstanbul',
    meetingButtonAriaLabel: 'Request a meeting with CREARE',
    meetingButtonLabel: 'Speak with CREARE™',
    imageAlt:
      'Ferko Signature Plaza in Şişli, Istanbul, home of CREARE Travel Consultancy Limited Co.',
    successTitle: 'Thank you.',
    successMessage: 'We have received your inquiry and will be in touch shortly.',
    successReference: 'Reference',
    formAriaLabel: 'Private inquiry form',
    nameLabel: 'NAME',
    namePlaceholder: 'Name',
    emailLabelField: 'EMAIL',
    emailPlaceholder: 'Email address',
    intentLabel: 'PROJECT INTENT',
    intents: [
      'Private Travel',
      'Corporate & Brand Experience',
      'Cultural Experience',
      'Ultra-Private Access',
      'Long-Term Collaboration',
    ],
    messageLabel: 'MESSAGE',
    messagePlaceholder: 'Tell us about your vision...',
    messageHelper: 'Share your objectives. We design the structure.',
    submitAriaLabel: 'Submit your private inquiry',
    loadingLabel: 'SENDING…',
    submitLabel: 'SEND INQUIRY →',
    confidentiality:
      'All inquiries are reviewed personally and handled with strict confidentiality.',
    requiredName: 'Name is required.',
    requiredEmail: 'Email is required.',
    invalidEmail: 'Please enter a valid email address.',
    requiredMessage: 'Message is required.',
    genericFailure: 'Something went wrong. Please try again.',
    globalCapabilityLabel: 'GLOBAL EXECUTION CAPABILITY',
    globalCapabilityText:
      'Cross-border experience delivery • Brand & institutional collaborations • Multi-market coordination • High-security engagements, with planning shaped around discretion, clear communication, and the practical realities of executing complex requests across different cultural and operational environments.',
    operatingInternationally: 'Operating Internationally.',
    roots: 'With roots in Istanbul and Bodrum.',
    scope:
      'Experience scope, timelines, and response expectations are discussed confidentially, so each engagement can move from inquiry to planning with the right level of clarity, privacy, and local coordination.',
    locationScope: 'Istanbul • Bodrum • International',
    contactSectionAriaLabel: 'Contact information and inquiry form',
    capabilitySectionAriaLabel: 'Global execution capability',
    phoneAriaLabel: 'Call CREARE at +90 541 220 3000',
    whatsappAriaLabel: 'Contact CREARE via WhatsApp',
    emailAriaLabel: 'Email CREARE at direct@crearetravel.com',
  },
  tr: {
    heroTitle: 'Özel Talepler',
    heroSupport: 'Kişisel olarak yanıt veriyoruz.',
    heroDescription:
      'Stratejik çalışmalar, özel tasarım talepleri ve gizlilik gerektiren iş birlikleri için.',
    directLineLabel: 'DOĞRUDAN HAT',
    directLineDescription: 'Özel talepler için doğrudan iletişim.',
    privateMessageLabel: 'ÖZEL MESAJ HATTI',
    privateMessageDescription: 'Özel ve güvenli mesajlaşma.',
    emailLabel: 'E-POSTA',
    emailDescription: 'Özel talepler, yapılandırılmış öneriler ve stratejik iş birlikleri için.',
    locationLabel: 'KONUM',
    locationDescription: 'Görüşmeler yalnızca randevu ile gerçekleştirilir.',
    mapsAriaLabel:
      'CREARE ofis konumunu Google Maps üzerinde görüntüleyin — 32G7+P8 Şişli, İstanbul',
    meetingButtonAriaLabel: 'CREARE ile görüşme talep edin',
    meetingButtonLabel: 'CREARE™ ile Görüşün',
    imageAlt:
      'CREARE Travel Consultancy Limited Co. adresinin bulunduğu Şişli, İstanbul’daki Ferko Signature Plaza',
    successTitle: 'Teşekkür ederiz.',
    successMessage: 'Talebinizi aldık. Sizinle en kısa sürede iletişime geçeceğiz.',
    successReference: 'Referans',
    formAriaLabel: 'Özel talep formu',
    nameLabel: 'AD SOYAD',
    namePlaceholder: 'Adınız ve soyadınız',
    emailLabelField: 'E-POSTA',
    emailPlaceholder: 'E-posta adresiniz',
    intentLabel: 'TALEBİN NİTELİĞİ',
    intents: [
      'Özel Deneyim Tasarımı',
      'Kurumsal ve Marka Deneyimi',
      'Kültürel Deneyim',
      'Ultra Özel Erişim',
      'Uzun Vadeli İş Birliği',
    ],
    messageLabel: 'MESAJ',
    messagePlaceholder: 'Vizyonunuzu ve aradığınız yapıyı paylaşın...',
    messageHelper: 'Hedefinizi paylaşın. Yapıyı biz tasarlayalım.',
    submitAriaLabel: 'Özel talebinizi gönderin',
    loadingLabel: 'Gönderiliyor…',
    submitLabel: 'TALEBİ GÖNDER →',
    confidentiality: 'Tüm talepler kişisel olarak incelenir ve kesin gizlilikle ele alınır.',
    requiredName: 'Lütfen adınızı ve soyadınızı girin.',
    requiredEmail: 'Lütfen e-posta adresinizi girin.',
    invalidEmail: 'Lütfen geçerli bir e-posta adresi girin.',
    requiredMessage: 'Lütfen talebinizle ilgili kısa bir açıklama paylaşın.',
    genericFailure:
      'Talebiniz şu anda gönderilemedi. Lütfen tekrar deneyin veya bizimle doğrudan iletişime geçin.',
    globalCapabilityLabel: 'KÜRESEL UYGULAMA KAPASİTESİ',
    globalCapabilityText:
      'Sınır ötesi deneyim uygulaması • Marka ve kurum iş birlikleri • Çoklu pazar koordinasyonu • Yüksek güvenlik gerektiren çalışmalar',
    operatingInternationally: 'Uluslararası ölçekte çalışıyoruz.',
    roots: 'İstanbul ve Bodrum kökleriyle.',
    scope: 'Deneyim kapsamı ve zaman planı gizlilik içinde görüşülür.',
    locationScope: 'İstanbul • Bodrum • Uluslararası',
    contactSectionAriaLabel: 'İletişim bilgileri ve özel talep formu',
    capabilitySectionAriaLabel: 'Küresel uygulama kapasitesi',
    phoneAriaLabel: 'CREARE’yi +90 541 220 3000 numarasından arayın',
    whatsappAriaLabel: 'CREARE ile WhatsApp üzerinden iletişime geçin',
    emailAriaLabel: 'CREARE’ye direct@crearetravel.com adresinden e-posta gönderin',
  },
  zh: {
    heroTitle: '私享咨询',
    heroSupport: '我们将亲自回复。',
    heroDescription:
      '面向战略合作、私人委托与保密协作。我们亲自回应国际宾客的需求、合作伙伴引荐及具有特定文化语境的策划简报；在提出任何方案、展开协调或设计通达方式之前，每一项咨询都会在保密前提下审阅。',
    directLineLabel: '专线电话',
    directLineDescription: '用于私享咨询的直接联络专线。',
    privateMessageLabel: '私密消息渠道',
    privateMessageDescription: '加密私密消息沟通。',
    emailLabel: '电子邮箱',
    emailDescription:
      '用于私人需求、结构化方案与战略合作。尽早沟通有助于明确节奏、可行性，以及与接待方、文化合作伙伴和当地执行团队协调所需的程度。',
    locationLabel: '地址',
    locationDescription: '会面仅接受预约。',
    mapsAriaLabel: '在 Google Maps 上查看 CREARE 办公室位置 — 32G7+P8 Şişli, İstanbul',
    meetingButtonAriaLabel: '申请与 CREARE 会面',
    meetingButtonLabel: '与 CREARE™ 沟通',
    imageAlt: 'CREARE Travel Consultancy Limited Co. 所在的伊斯坦布尔 Şişli Ferko Signature Plaza',
    successTitle: '谢谢。',
    successMessage: '我们已收到您的咨询，将很快与您联系。',
    successReference: '参考编号',
    formAriaLabel: '私享咨询表单',
    nameLabel: '姓名',
    namePlaceholder: '您的姓名',
    emailLabelField: '电子邮箱',
    emailPlaceholder: '您的电子邮箱地址',
    intentLabel: '项目意向',
    intents: ['私人旅行', '企业与品牌体验', '文化体验', '超私密通达', '长期合作'],
    messageLabel: '留言',
    messagePlaceholder: '请告诉我们您的构想……',
    messageHelper: '分享您的目标，由我们构筑其结构。',
    submitAriaLabel: '提交您的私享咨询',
    loadingLabel: '正在发送……',
    submitLabel: '发送咨询 →',
    confidentiality: '所有咨询均由我们亲自审阅，并严格保密。',
    requiredName: '请输入您的姓名。',
    requiredEmail: '请输入您的电子邮箱地址。',
    invalidEmail: '请输入有效的电子邮箱地址。',
    requiredMessage: '请输入留言。',
    genericFailure: '发生错误，请重试。',
    globalCapabilityLabel: '全球执行能力',
    globalCapabilityText:
      '跨境体验执行 • 品牌及机构合作 • 多市场协调 • 高安全级别合作；所有策划均围绕审慎、清晰沟通，以及在不同文化与运营环境中落实复杂需求的现实条件展开。',
    operatingInternationally: '业务遍及全球。',
    roots: '植根于伊斯坦布尔与博德鲁姆。',
    scope:
      '体验范围、时间安排与回应预期均在保密前提下讨论，使每一次合作都能在适当的清晰度、私密性与当地协调支持下，从咨询进入策划。',
    locationScope: '伊斯坦布尔 • 博德鲁姆 • 全球',
    contactSectionAriaLabel: '联系信息与咨询表单',
    capabilitySectionAriaLabel: '全球执行能力',
    phoneAriaLabel: '致电 CREARE：+90 541 220 3000',
    whatsappAriaLabel: '通过 WhatsApp 联系 CREARE',
    emailAriaLabel: '发送邮件至 direct@crearetravel.com 联系 CREARE',
  },
} as const;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPageClient({ locale = 'en' }: ContactPageClientProps) {
  const pathname = usePathname();
  const copy = contactCopy[locale];
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    website: '',
  });
  const [selectedIntents, setSelectedIntents] = useState<InquiryIntent[]>([]);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const hasFired = useRef(false);
  const isSubmitting = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const whatsappHref = buildWhatsAppHref(locale);
  const appointmentUrl = getGoogleAppointmentUrl();
  const weChatConfig = getWeChatConfig();

  useEffect(() => {
    if (formStatus === 'success' || formStatus === 'error') resultRef.current?.focus();
  }, [formStatus]);

  // Fire form_start once on first field focus
  const handleFormFocus = () => {
    if (hasFired.current) return;
    hasFired.current = true;
    trackFormStart({ source: 'contact_page', form_id: 'inquiry_form' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleIntent = (intent: InquiryIntent) => {
    setSelectedIntents((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent]
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = copy.requiredName;
    }
    if (!formData.email.trim()) {
      newErrors.email = copy.requiredEmail;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = copy.invalidEmail;
    }
    if (!formData.message.trim()) {
      newErrors.message = copy.requiredMessage;
    }
    setErrors(newErrors);
    const firstInvalid = newErrors.name
      ? nameRef
      : newErrors.email
        ? emailRef
        : newErrors.message
          ? messageRef
          : null;
    if (firstInvalid) requestAnimationFrame(() => firstInvalid.current?.focus());
    return firstInvalid === null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formStatus === 'loading' || isSubmitting.current) return; // prevent double submission
    if (!validate()) return;

    isSubmitting.current = true;
    setFormStatus('loading');
    setErrors({});
    setReferenceId(null);

    // Fire form_submit when submission begins
    trackFormSubmit({ source: 'contact_page', form_id: 'inquiry_form' });

    const experience_slug = getExperienceSlug();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          website: formData.website,
          intent: selectedIntents,
          experience_slug,
          locale,
          page_path: pathname,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`request_${response.status}`);
      }

      const data = (await response.json()) as { referenceId?: unknown };
      if (typeof data.referenceId !== 'string') throw new Error('invalid_response');

      trackContactSubmit({ source: 'contact_page', form_id: 'inquiry_form' });

      setReferenceId(data.referenceId);
      setFormData({ name: '', email: '', message: '', website: '' });
      setSelectedIntents([]);
      setFormStatus('success');
    } catch (error) {
      const errorCode =
        error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'request_failed';
      trackFormError({
        source: 'contact_page',
        form_id: 'inquiry_form',
        error_message: errorCode,
      });

      setFormStatus('error');
      setErrors({ general: copy.genericFailure });
    } finally {
      window.clearTimeout(timeout);
      isSubmitting.current = false;
    }
  };

  return (
    <main className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 pt-44 pb-20">
        <h1 className="font-display text-white font-normal leading-tight mb-6 text-[clamp(3rem,6vw,72px)]">
          {copy.heroTitle}
        </h1>
        <p className="text-white/60 font-body text-base mb-4">{copy.heroSupport}</p>
        <p className="text-white/35 font-body text-sm leading-relaxed max-w-[500px]">
          {copy.heroDescription}
        </p>
      </section>

      {/* Two-Column Layout */}
      <section className="px-6 sm:px-10 lg:px-16 pb-24" aria-label={copy.contactSectionAriaLabel}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-24 items-start">
            {/* Left Column — Contact Details */}
            <div className="flex flex-col gap-14">
              {/* Direct Line */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.directLineLabel}
                </p>
                <OutboundLink
                  href={CONTACT_PHONE_HREF}
                  aria-label={copy.phoneAriaLabel}
                  className="motion-link mb-3 inline-flex min-h-11 items-center text-white font-body font-bold text-[clamp(1.5rem,3vw,28px)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  trackingLabel="contact_phone"
                  trackingSource="contact_page"
                >
                  {CONTACT_PHONE_DISPLAY}
                </OutboundLink>
                <p className="text-white/35 font-body text-sm">{copy.directLineDescription}</p>
              </div>

              {/* Private Message Line */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.privateMessageLabel}
                </p>
                <div className="flex flex-col items-start mb-3">
                  <OutboundLink
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={copy.whatsappAriaLabel}
                    className="motion-link inline-flex min-h-11 items-center text-white font-body font-bold text-lg hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    trackingLabel="contact_whatsapp"
                    trackingSource="contact_page"
                  >
                    WhatsApp
                  </OutboundLink>
                  <WeChatContact locale={locale} config={weChatConfig} />
                </div>
                <p className="text-white/35 font-body text-sm">{copy.privateMessageDescription}</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.emailLabel}
                </p>
                <OutboundLink
                  href={`mailto:${CONTACT_EMAIL}`}
                  aria-label={copy.emailAriaLabel}
                  className="motion-link mb-3 inline-flex min-h-11 items-center text-white font-body text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  trackingLabel="contact_email"
                  trackingSource="contact_page"
                >
                  {CONTACT_EMAIL}
                </OutboundLink>
                <p className="text-white/35 font-body text-xs leading-relaxed">
                  {copy.emailDescription}
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.locationLabel}
                </p>
                <p className="text-white font-body font-semibold text-base mb-4">
                  CREARE Travel Consultancy Limited Co.
                </p>
                <p className="text-white font-body text-sm leading-relaxed mb-1">
                  Ferko Signature Plaza
                </p>
                <p className="text-white font-body text-sm leading-relaxed mb-4">
                  Buyukdere Cd. No.175
                </p>
                <p className="mb-4">
                  <OutboundLink
                    href="https://maps.google.com/?q=32G7%2BP8+%C5%9Ei%C5%9Fli,+%C4%B0stanbul"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={copy.mapsAriaLabel}
                    className="motion-link inline-flex min-h-11 items-center text-blue-400 font-body text-sm hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    trackingLabel="contact_google_maps"
                    trackingSource="contact_page"
                  >
                    📍 32G7+P8 Şişli, İstanbul
                  </OutboundLink>
                </p>
                <p className="text-white font-body text-sm mb-6">{copy.locationDescription}</p>
                {appointmentUrl && (
                  <OutboundLink
                    href={appointmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={copy.meetingButtonAriaLabel}
                    className="motion-button-editorial inline-flex min-h-11 items-center border border-white bg-black px-6 py-3 font-body text-sm tracking-wide text-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    trackingLabel="contact_google_appointment"
                    trackingSource="contact_page"
                  >
                    {copy.meetingButtonLabel}
                  </OutboundLink>
                )}
              </div>

              {/* Building Photo */}
              <div className="w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={buildCloudinaryUrl('creare-contact-ferko-signature-plaza.jpg', {
                    format: 'auto',
                    quality: 'auto:good',
                    crop: 'fill',
                    gravity: 'auto',
                    aspectRatio: '4:3',
                    width: 1200,
                  })}
                  alt={copy.imageAlt}
                  width={600}
                  height={450}
                  className="w-full h-full object-cover grayscale"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>

            {/* Right Column — Form */}
            <div>
              {formStatus === 'success' ? (
                <div
                  ref={resultRef}
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="py-20 outline-none"
                >
                  <div className="w-8 h-px bg-white/30 mb-10" />
                  <h2 className="font-display font-light text-white text-3xl mb-6">
                    {copy.successTitle}
                  </h2>
                  <p className="text-white/50 font-body text-sm leading-loose">
                    {copy.successMessage}
                  </p>
                  {referenceId && (
                    <p className="mt-4 text-white font-body text-sm">
                      {copy.successReference}: <strong>{referenceId}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  onFocus={handleFormFocus}
                  className="flex flex-col gap-10"
                  aria-label={copy.formAriaLabel}
                  noValidate
                >
                  {/* General error */}
                  {errors.general && (
                    <div
                      ref={resultRef}
                      tabIndex={-1}
                      role="alert"
                      aria-live="assertive"
                      className="border border-red-500/30 bg-red-500/10 px-4 py-3 outline-none"
                    >
                      <p className="text-red-400 font-body text-xs">{errors.general}</p>
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="name"
                      className="text-white/40 font-body text-[10px] tracking-[0.25em] uppercase"
                    >
                      {copy.nameLabel}{' '}
                      <span className="text-white/25" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      ref={nameRef}
                      id="name"
                      name="name"
                      type="text"
                      required
                      maxLength={INQUIRY_LIMITS.name}
                      autoComplete="name"
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={copy.namePlaceholder}
                      disabled={formStatus === 'loading'}
                      className="min-h-11 bg-transparent border-0 border-b border-white/20 focus:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full disabled:opacity-50"
                    />

                    {errors.name && (
                      <p
                        id="name-error"
                        role="alert"
                        className="text-red-400 font-body text-xs mt-1"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="email"
                      className="text-white/40 font-body text-[10px] tracking-[0.25em] uppercase"
                    >
                      {copy.emailLabelField}{' '}
                      <span className="text-white/25" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      ref={emailRef}
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={INQUIRY_LIMITS.email}
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={copy.emailPlaceholder}
                      disabled={formStatus === 'loading'}
                      className="min-h-11 bg-transparent border-0 border-b border-white/20 focus:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full disabled:opacity-50"
                    />

                    {errors.email && (
                      <p
                        id="email-error"
                        role="alert"
                        className="text-red-400 font-body text-xs mt-1"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Project Intent */}
                  <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
                    <legend className="text-white/40 font-body text-[10px] tracking-[0.25em] uppercase mb-1">
                      {copy.intentLabel}
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {INQUIRY_INTENTS.map((intent) => {
                        const isSelected = selectedIntents.includes(intent);
                        return (
                          <button
                            key={intent}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleIntent(intent)}
                            disabled={formStatus === 'loading'}
                            className={`motion-button-editorial min-h-11 rounded-full px-4 py-2 font-body text-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                              isSelected
                                ? 'border border-white text-white'
                                : 'border border-white/25 text-white/70 hover:border-white/50 hover:text-white'
                            }`}
                          >
                            {INQUIRY_INTENT_LABELS[locale][intent]}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Message */}
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="message"
                      className="text-white/40 font-body text-[10px] tracking-[0.25em] uppercase"
                    >
                      {copy.messageLabel}{' '}
                      <span className="text-white/25" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <textarea
                      ref={messageRef}
                      id="message"
                      name="message"
                      rows={5}
                      required
                      aria-required="true"
                      maxLength={INQUIRY_LIMITS.message}
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? 'message-error message-helper' : 'message-helper'
                      }
                      placeholder={copy.messagePlaceholder}
                      disabled={formStatus === 'loading'}
                      className="bg-transparent border-0 border-b border-white/20 focus:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full resize-none disabled:opacity-50"
                    />

                    {errors.message && (
                      <p
                        id="message-error"
                        role="alert"
                        className="text-red-400 font-body text-xs mt-1"
                      >
                        {errors.message}
                      </p>
                    )}

                    <p id="message-helper" className="text-white/35 font-body text-xs mt-1">
                      {copy.messageHelper}
                    </p>
                  </div>

                  <div
                    className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      aria-label={copy.submitAriaLabel}
                      disabled={formStatus === 'loading'}
                      className="motion-link min-h-11 text-white font-body text-sm tracking-[0.2em] uppercase text-left hover:text-white/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      {formStatus === 'loading' ? (
                        <>
                          <span
                            className="inline-block w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"
                            aria-hidden="true"
                          />
                          {copy.loadingLabel}
                        </>
                      ) : (
                        copy.submitLabel
                      )}
                    </button>
                    <p className="text-white/35 font-body text-xs leading-relaxed">
                      {copy.confidentiality}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Global Execution Capability */}
      <section
        className="w-full flex flex-col items-center pb-24 pt-8"
        aria-label={copy.capabilitySectionAriaLabel}
      >
        <h2 className="text-white font-body text-[10px] tracking-[0.3em] uppercase mb-4">
          {copy.globalCapabilityLabel}
        </h2>
        <div className="w-[200px] h-px bg-white/30" />

        <p className="text-white font-body text-center leading-relaxed mt-14 mb-12 px-6 text-lg max-w-[800px]">
          {copy.globalCapabilityText}
        </p>

        <div className="text-center mb-8">
          <p className="text-white font-body font-normal text-base mb-2">
            {copy.operatingInternationally}
          </p>
          <p className="text-white font-body font-normal text-base">{copy.roots}</p>
        </div>

        <p className="text-white/40 font-body text-sm text-center mb-12">{copy.scope}</p>

        <div className="w-[200px] h-px bg-white/20" />

        <p className="text-white/40 font-body text-[10px] tracking-[0.3em] uppercase mt-8 mb-4">
          {copy.locationLabel}
        </p>

        <p className="text-white font-body tracking-[0.15em] text-center text-base">
          {copy.locationScope}
        </p>
      </section>
    </main>
  );
}
