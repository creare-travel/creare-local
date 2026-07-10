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

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  general?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const projectIntents: string[] = [
  'Özel Seyahat',
  'Kurumsal ve Marka Deneyimi',
  'Kültürel Deneyim',
  'Yüksek Mahremiyetli Erişim',
  'Uzun Vadeli İş Birliği',
];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPageClient() {
  const router = useRouter();
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
      newErrors.name = 'Ad alanı zorunludur.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi girin.';
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
        throw new Error(data?.error || 'Gönderim başarısız oldu.');
      }

      // Fire form_success ONLY on confirmed API success (response.ok)
      trackFormSuccess({ source: 'contact_page', form_id: 'inquiry_form' });

      setFormStatus('success');

      // Redirect to /thank-you after successful submission
      router.push('/thank-you');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir sorun oluştu. Lütfen tekrar deneyin.';

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
          Özel Talepler
        </h1>
        <p className="text-white/60 font-body text-base mb-4">Kişisel olarak yanıt veririz.</p>
        <p className="text-white/35 font-body text-sm leading-relaxed max-w-[500px]">
          Özel komisyonlar, gizli iş birlikleri ve özenli talepler için. Uluslararası misafir
          taleplerine, partner yönlendirmelerine ve kültürel bağlam gerektiren isteklere; herhangi
          bir düzenleme başlamadan önce mahremiyet içinde, kişisel olarak yanıt veriyoruz.
        </p>
      </section>

      {/* Two-Column Layout */}
      <section
        className="px-6 sm:px-10 lg:px-16 pb-24"
        aria-label="İletişim bilgileri ve talep formu"
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-16 lg:gap-24 items-start">
            {/* Left Column — Contact Details */}
            <div className="flex flex-col gap-14">
              {/* Direct Line */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  DOĞRUDAN HAT
                </p>
                <p className="text-white font-body font-bold mb-3 text-[clamp(1.5rem,3vw,28px)]">
                  +90 541 220 3000
                </p>
                <p className="text-white/35 font-body text-sm">Özel talepler için doğrudan hat.</p>
              </div>

              {/* Private Message Line */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  ÖZEL MESAJ HATTI
                </p>
                <p className="text-white font-body font-bold text-lg leading-relaxed">WhatsApp</p>
                <p className="text-white font-body font-bold text-lg leading-relaxed mb-3">
                  WeChat
                </p>
                <p className="text-white/35 font-body text-sm">Şifreli özel mesajlaşma.</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  E-POSTA
                </p>
                <p className="text-white font-body text-base mb-3">direct@crearetravel.com</p>
                <p className="text-white/35 font-body text-xs leading-relaxed">
                  Özel talepler, özenli tanışmalar ve gizli iş birlikleri için. İlk temas; ritmi,
                  uygulanabilirliği ve ev sahipleri, kültürel ortaklar ile yerel düzenlemeler
                  arasında gereken özen düzeyini belirlemeye yardımcı olur.
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-white/35 font-body text-[10px] tracking-[0.25em] uppercase mb-4">
                  KONUM
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
                    aria-label="CREARE ofis konumunu Google Haritalar'da görüntüle — 32G7+P8 Şişli, İstanbul"
                    className="motion-link text-blue-400 font-body text-sm hover:text-blue-300"
                    trackingLabel="contact_google_maps"
                    trackingSource="contact_page"
                  >
                    📍 32G7+P8 Şişli, İstanbul
                  </OutboundLink>
                </p>
                <p className="text-white font-body text-sm mb-6">
                  Görüşmeler yalnızca randevu ile yapılır.
                </p>
                <button
                  type="button"
                  aria-label="CREARE ile görüşme talep et"
                  className="motion-button-editorial border border-white bg-black px-6 py-3 font-body text-sm tracking-wide text-white hover:bg-white hover:text-black"
                >
                  CREARE™ ile Görüşün
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
                  alt="Ferko Signature Plaza in Şişli, Istanbul, home of CREARE Travel Consultancy Limited Co."
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
                    Teşekkür ederiz.
                  </h2>
                  <p className="text-white/50 font-body text-sm leading-loose">
                    Talebinizi aldık. Kısa süre içinde sizinle iletişime geçeceğiz.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  onFocus={handleFormFocus}
                  className="flex flex-col gap-10"
                  aria-label="Özel talep formu"
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
                      AD SOYAD{' '}
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
                      placeholder="Ad Soyad"
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
                      E-POSTA{' '}
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
                      placeholder="E-posta adresi"
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
                      TALEP KONUSU
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {projectIntents.map((intent) => {
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
                      MESAJ
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Niyetinizi ve ihtiyacınızı paylaşın..."
                      disabled={formStatus === 'loading'}
                      className="bg-transparent border-0 border-b border-white/20 focus:border-white/50 outline-none text-white font-body text-sm py-3 placeholder:text-white/25 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] w-full resize-none disabled:opacity-50"
                    />

                    <p className="text-white/35 font-body text-xs mt-1">
                      İhtiyacınızı paylaşın. Yapıyı birlikte kuralım.
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      aria-label="Özel talebinizi gönderin"
                      disabled={formStatus === 'loading'}
                      className="motion-link text-white font-body text-sm tracking-[0.2em] uppercase text-left hover:text-white/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                      {formStatus === 'loading' ? (
                        <>
                          <span
                            className="inline-block w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"
                            aria-hidden="true"
                          />
                          GÖNDERİLİYOR…
                        </>
                      ) : (
                        'TALEBİ GÖNDER →'
                      )}
                    </button>
                    <p className="text-white/35 font-body text-xs leading-relaxed">
                      Tüm talepler kişisel olarak değerlendirilir ve sıkı gizlilik içinde ele
                      alınır.
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
        aria-label="Uluslararası uygulama kapasitesi"
      >
        <h2 className="text-white font-body text-[10px] tracking-[0.3em] uppercase mb-4">
          ULUSLARARASI UYGULAMA KAPASİTESİ
        </h2>
        <div className="w-[200px] h-px bg-white/30" />

        <p className="text-white font-body text-center leading-relaxed mt-14 mb-12 px-6 text-lg max-w-[800px]">
          Sınır ötesi deneyim kurguları • Marka ve kurumsal iş birlikleri • Çok pazarlı koordinasyon
          • Yüksek güvenlik gerektiren çalışmalar; mahremiyet, açık iletişim ve farklı kültürel ile
          operasyonel ortamlarda karmaşık talepleri uygulamanın pratik gerçekleri etrafında
          planlanır.
        </p>

        <div className="text-center mb-8">
          <p className="text-white font-body font-normal text-base mb-2">
            Uluslararası ölçekte çalışırız.
          </p>
          <p className="text-white font-body font-normal text-base">
            Köklerimiz İstanbul ve Bodrum&apos;dadır.
          </p>
        </div>

        <p className="text-white/40 font-body text-sm text-center mb-12">
          Deneyimin kapsamı, zamanlaması ve yanıt beklentileri gizlilik içinde konuşulur; böylece
          her çalışma, talep aşamasından planlamaya doğru doğru netlik, mahremiyet ve yerel
          koordinasyon düzeyiyle ilerleyebilir.
        </p>

        <div className="w-[200px] h-px bg-white/20" />

        <p className="text-white/40 font-body text-[10px] tracking-[0.3em] uppercase mt-8 mb-4">
          KONUM
        </p>

        <p className="text-white font-body tracking-[0.15em] text-center text-base">
          İstanbul • Bodrum • Uluslararası
        </p>
      </section>
    </main>
  );
}
