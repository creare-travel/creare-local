import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadataAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description:
    'CREARE kullanım koşulları — web sitemizin ve özel çalışmalarımızın kullanımını düzenleyen şartları açıklar.',
  alternates: buildMetadataAlternates('/terms'),
};

interface PolicySection {
  number: number;
  heading: string;
  body: string;
}

const termsSections: PolicySection[] = [
  {
    number: 1,
    heading: 'Koşulların Kabulü',
    body: 'CREARE web sitesine ve iletişim kanallarına erişerek bu sözleşmenin şartlarını kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız lütfen web sitesini kullanmayın ve herhangi bir çalışma talebiyle ilerlemeyin.',
  },
  {
    number: 2,
    heading: 'Çalışmaların Kullanımı',
    body: 'CREARE seçili misafirlere özel kültürel deneyimler, erişim planlaması ve ilgili hizmetler sunar. Çalışmalar davet veya talep temelinde değerlendirilir. Herhangi bir talebi veya hizmet ilişkisini dilediğimiz zaman reddetme ya da sonlandırma hakkımız saklıdır.',
  },
  {
    number: 3,
    heading: 'Fikri Mülkiyet',
    body: "Bu web sitesindeki metin, grafik, logo, görsel ve yazılım dahil tüm içerik CREARE'nin mülkiyetindedir ve ilgili telif ile marka mevzuatı kapsamında korunur. Açık yazılı izin olmadan içeriklerimizi çoğaltamaz, dağıtamaz veya türev işler üretemezsiniz.",
  },
  {
    number: 4,
    heading: 'Gizlilik',
    body: 'CREARE en yüksek mahremiyet standartlarıyla çalışır. Tüm misafir bilgileri, talepler, çalışma detayları ve erişimle ilgili bilgiler sıkı gizlilik içinde ele alınır. Müşterilerimizden de yöntemlerimiz ve iş yapış biçimimiz konusunda aynı ölçüde özen bekleriz.',
  },
  {
    number: 5,
    heading: 'Sorumluluğun Sınırlandırılması',
    body: 'CREARE, web sitesini veya hizmetlerini kullanmanızdan ya da kullanamamanızdan doğan dolaylı, arızi, özel, sonuçsal veya cezai nitelikteki zararlardan sorumlu tutulamaz. Bu web sitesi veya hizmetlerimizden doğan herhangi bir talepte toplam sorumluluğumuz, söz konusu hizmetler için ödediğiniz tutarı aşmaz.',
  },
  {
    number: 6,
    heading: 'Koşullardaki Değişiklikler',
    body: 'Bu koşulları dilediğimiz zaman değiştirme hakkımız saklıdır. Değişiklikler bu sayfada yayımlandığı anda yürürlüğe girer. Değişikliklerden sonra web sitesini veya hizmetlerimizi kullanmaya devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir.',
  },
  {
    number: 7,
    heading: 'Uygulanacak Hukuk',
    body: 'Bu koşullar ilgili mevzuata göre yorumlanır ve uygulanır. Bu koşullardan veya web sitesi ile hizmetlerimizin kullanımından doğan uyuşmazlıklar, uygulanabilir hukuk ve ilgili çözüm usulleri çerçevesinde ele alınır.',
  },
  {
    number: 8,
    heading: 'İletişim Bilgileri',
    body: 'Bu Kullanım Koşulları hakkında sorularınız için lütfen CREARE ile resmi iletişim kanallarımız üzerinden bağlantı kurun. Tüm soruları dikkatli ve profesyonel biçimde ele almaya kararlıyız.',
  },
];

export default function TermsPage() {
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
            KOŞULLAR
          </h1>
        </nav>

        {/* Terms Sections */}
        <div className="flex flex-col gap-12">
          {termsSections.map((section) => (
            <div key={section.number}>
              <h2 className="text-lg font-bold text-black mb-4 leading-snug">
                {section.number}. {section.heading}
              </h2>
              <p className="text-sm text-gray-800 leading-relaxed max-w-[680px]">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <p className="mt-16 text-xs text-gray-500 tracking-wide">Son Güncelleme: 4 Mart 2026</p>
      </div>
    </main>
  );
}
