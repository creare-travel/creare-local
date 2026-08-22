'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OutboundLink from '@/components/analytics/OutboundLink';
import { buildCloudinaryUrl } from '@/lib/cloudinary';
import {
  trackFormStart,
  trackFormSubmit,
  trackFormSuccess,
  trackFormError,
  getExperienceSlug,
} from '@/lib/analytics/tracking';
import type { LocaleKey } from '@/lib/i18n/config';
import { DEFAULT_SITE_LOCALE } from '@/lib/i18n/config';

interface FormData {
  name: string;
  email: string;
  message: string;
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
    contactSectionAriaLabel: 'Contact information and inquiry form',
    capabilitySectionAriaLabel: 'Global execution capability',
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
  },
} as const;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPageClient({
  locale = 'en',
  successRedirectHref = '/thank-you',
}: ContactPageClientProps) {
  const router = useRouter();
  const copy = contactCopy[locale];
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const hasFired = useRef(false);
  const isSubmitting = useRef(false);

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

  const toggleIntent = (intent: string) => {
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formStatus === 'loading' || isSubmitting.current) return; // prevent double submission
    if (!validate()) return;

    isSubmitting.current = true;
    setFormStatus('loading');
    setErrors({});

    // Fire form_submit when submission begins
    trackFormSubmit({ source: 'contact_page', form_id: 'inquiry_form' });

    const experience_slug = getExperienceSlug();
    const intent = selectedIntents.join(', ');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          intent,
          experience_slug,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || copy.genericFailure);
      }

      // Fire form_success ONLY on confirmed API success (response.ok)
      trackFormSuccess({ source: 'contact_page', form_id: 'inquiry_form' });

      setFormStatus('success');

      if (successRedirectHref) {
        router.push(successRedirectHref);
      }
    } catch (err) {
      const rawErrorMessage = err instanceof Error ? err.message : copy.genericFailure;
      const errorMessage = locale === DEFAULT_SITE_LOCALE ? rawErrorMessage : copy.genericFailure;

      // Fire form_error on failure
      trackFormError({
        source: 'contact_page',
        form_id: 'inquiry_form',
        error_message: errorMessage,
      });

      setFormStatus('error');
      setErrors({
        general: errorMessage,
      });
    } finally {
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
          <div
            className={`grid grid-cols-1 gap-16 lg:gap-24 items-start ${
              locale === 'zh'
                ? 'lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]'
                : 'lg:grid-cols-[45%_55%]'
            }`}
          >
            {/* Left Column — Contact Details */}
            <div className="flex flex-col gap-14">
              {/* Direct Line */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.directLineLabel}
                </p>
                <p className="text-white font-body font-bold mb-3 text-[clamp(1.5rem,3vw,28px)]">
                  +90 541 220 3000
                </p>
                <p className="text-white/35 font-body text-sm">{copy.directLineDescription}</p>
              </div>

              {/* Private Message Line */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.privateMessageLabel}
                </p>
                <p className="text-white font-body font-bold text-lg leading-relaxed">WhatsApp</p>
                <p className="text-white font-body font-bold text-lg leading-relaxed mb-3">
                  WeChat
                </p>
                <p className="text-white/35 font-body text-sm">{copy.privateMessageDescription}</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  {copy.emailLabel}
                </p>
                <p className="text-white font-body text-base mb-3">direct@crearetravel.com</p>
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
                    className="motion-link text-blue-400 font-body text-sm hover:text-blue-300"
                    trackingLabel="contact_google_maps"
                    trackingSource="contact_page"
                  >
                    📍 32G7+P8 Şişli, İstanbul
                  </OutboundLink>
                </p>
                <p className="text-white font-body text-sm mb-6">{copy.locationDescription}</p>
                <button
                  type="button"
                  aria-label={copy.meetingButtonAriaLabel}
                  className="motion-button-editorial border border-white bg-black px-6 py-3 font-body text-sm tracking-wide text-white hover:bg-white hover:text-black"
                >
                  {copy.meetingButtonLabel}
                </button>
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
                <div className="py-20">
                  <div className="w-8 h-px bg-white/30 mb-10" />
                  <h2 className="font-display font-light text-white text-3xl mb-6">
                    {copy.successTitle}
                  </h2>
                  <p className="text-white/50 font-body text-sm leading-loose">
                    {copy.successMessage}
                  </p>
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
                    <div role="alert" className="border border-red-500/30 bg-red-500/10 px-4 py-3">
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
                      id="name"
                      name="name"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={copy.namePlaceholder}
                      disabled={formStatus === 'loading'}
                      className="bg-transparent border-0 border-b border-white/20 focus:border-white/50 outline-none text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full disabled:opacity-50"
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
                      id="email"
                      name="email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={copy.emailPlaceholder}
                      disabled={formStatus === 'loading'}
                      className="bg-transparent border-0 border-b border-white/20 focus:border-white/50 outline-none text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full disabled:opacity-50"
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
                      {copy.intents.map((intent) => {
                        const isSelected = selectedIntents.includes(intent);
                        return (
                          <button
                            key={intent}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleIntent(intent)}
                            disabled={formStatus === 'loading'}
                            className={`motion-button-editorial rounded-full px-4 py-2 font-body text-sm disabled:opacity-50 ${
                              isSelected
                                ? 'border border-white text-white'
                                : 'border border-white/25 text-white/70 hover:border-white/50 hover:text-white'
                            }`}
                          >
                            {intent}
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
                      {copy.messageLabel}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? 'message-error message-helper' : 'message-helper'
                      }
                      placeholder={copy.messagePlaceholder}
                      disabled={formStatus === 'loading'}
                      className="bg-transparent border-0 border-b border-white/20 focus:border-white/50 outline-none text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full resize-none disabled:opacity-50"
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

                  {/* Submit */}
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      aria-label={copy.submitAriaLabel}
                      disabled={formStatus === 'loading'}
                      className="motion-link text-white font-body text-sm tracking-[0.2em] uppercase text-left hover:text-white/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
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
