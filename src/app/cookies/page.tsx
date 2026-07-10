import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadataAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description:
    'CREARE çerez politikası — çerezleri ve benzer izleme teknolojilerini nasıl kullandığımızı açıklar.',
  alternates: buildMetadataAlternates('/cookies'),
};

interface PolicySection {
  number: number;
  heading: string;
  body: React.ReactNode;
}

const cookieSections: PolicySection[] = [
  {
    number: 1,
    heading: 'Çerez Nedir',
    body: 'Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza yerleştirilen küçük metin dosyalarıdır. Tercihlerinizi hatırlayarak ve hizmetlerimizle nasıl etkileşim kurduğunuzu anlayarak size daha iyi bir deneyim sunmamıza yardımcı olurlar.',
  },
  {
    number: 2,
    heading: 'Çerezleri Nasıl Kullanırız',
    body: 'CREARE, ziyaretçilerin web sitemizde nasıl gezindiğini anlamak, dil tercihlerinizi hatırlamak ve site trafiğini analiz etmek için çerezleri kullanır. Hem oturum çerezleri (tarayıcınızı kapattığınızda sona erer) hem de kalıcı çerezler (silinene veya süresi dolana kadar cihazınızda kalır) kullanırız.',
  },
  {
    number: 3,
    heading: 'Kullandığımız Çerez Türleri',
    body: (
      <>
        <span className="block mb-3">
          <strong>Zorunlu Çerezler:</strong> Bu çerezler web sitesinin düzgün çalışması için
          gereklidir. Güvenlik ve ağ yönetimi gibi temel işlevleri mümkün kılar.
        </span>
        <span className="block mb-3">
          <strong>Analitik Çerezler:</strong> Bu çerezleri, ziyaretçilerin web sitemizle nasıl
          etkileşim kurduğunu anlamak ve hizmetlerimizi geliştirmek için kullanırız.
        </span>
        <span className="block">
          <strong>Tercih Çerezleri:</strong> Bu çerezler, tercih ettiğiniz dil gibi sitenin
          davranışını veya görünümünü etkileyen bilgileri hatırlamasını sağlar.
        </span>
      </>
    ),
  },
  {
    number: 4,
    heading: 'Çerez Yönetimi',
    body: 'Çerezleri çeşitli yollarla kontrol edip yönetebilirsiniz. Çerezleri kaldırmanın veya engellemenin kullanıcı deneyiminizi etkileyebileceğini ve bazı işlevlerin kullanılamaz hale gelebileceğini lütfen unutmayın. Çoğu tarayıcı çerezleri otomatik kabul eder; ancak dilerseniz tarayıcı ayarlarınızı değiştirerek bunları reddedebilirsiniz.',
  },
  {
    number: 5,
    heading: 'Bu Politikadaki Değişiklikler',
    body: "Bu Çerez Politikası'nı teknoloji, mevzuat veya işleyişimizdeki değişiklikleri yansıtacak şekilde zaman zaman güncelleyebiliriz. En güncel bilgi için bu sayfayı düzenli olarak gözden geçirmenizi öneririz.",
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="px-6 sm:px-10 lg:px-16 pt-28 pb-24 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="İçerik yolu" className="flex items-center gap-2 mb-12">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs tracking-widest text-gray-500 hover:text-black transition-colors uppercase"
          >
            <span aria-hidden="true">←</span>
            <span>ANA SAYFA</span>
          </Link>
          <span className="text-xs text-gray-400" aria-hidden="true">
            /
          </span>
          <h1 className="text-xs tracking-widest text-black uppercase" aria-current="page">
            ÇEREZLER
          </h1>
        </nav>

        {/* Cookie Sections */}
        <div className="flex flex-col gap-12">
          {cookieSections.map((section) => (
            <div key={section.number}>
              <h2 className="text-lg font-bold text-black mb-4 leading-snug">
                {section.number}. {section.heading}
              </h2>
              <div className="text-sm text-gray-800 leading-relaxed max-w-[680px]">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <p className="mt-16 text-xs text-gray-500 tracking-wide">Son Güncelleme: 4 Mart 2026</p>
      </div>
    </main>
  );
}
