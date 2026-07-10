import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadataAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description:
    'CREARE gizlilik politikası — kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.',
  alternates: buildMetadataAlternates('/privacy'),
};

interface PolicySection {
  number: number;
  heading: string;
  body: string;
}

const policySections: PolicySection[] = [
  {
    number: 1,
    heading: 'Topladığımız Bilgiler',
    body: 'CREARE, hizmetlerimiz hakkında bilgi talep ettiğinizde, etkinliklere kayıt olduğunuzda veya ekibimizle iletişime geçtiğinizde bize doğrudan sunduğunuz bilgileri toplar. Buna adınız, e-posta adresiniz, telefon numaranız, şirket adınız ve paylaşmayı tercih ettiğiniz diğer bilgiler dahil olabilir.',
  },
  {
    number: 2,
    heading: 'Bilgilerinizi Nasıl Kullanırız',
    body: 'Topladığımız bilgileri hizmetlerimizi sunmak, sürdürmek ve geliştirmek; talepleriniz ve sunduklarımız hakkında sizinle iletişim kurmak; ayrıca hizmetlerimizin nasıl kullanıldığını anlamak için kullanırız. Kişisel bilgilerinizi pazarlama amaçlarıyla üçüncü taraflara satmayız veya paylaşmayız.',
  },
  {
    number: 3,
    heading: 'Veri Güvenliği',
    body: 'Kişisel bilgilerinizin güvenliğini korumak için uygun teknik ve organizasyonel önlemler uygularız. Bununla birlikte, internet üzerinden hiçbir aktarım yöntemi veya elektronik saklama yöntemi tamamen güvenli değildir.',
  },
  {
    number: 4,
    heading: 'Haklarınız',
    body: 'Kişisel bilgilerinize erişme, bunları güncelleme veya silme hakkına her zaman sahipsiniz. Bu hakları kullanmak isterseniz lütfen doğrudan bizimle iletişime geçin. Talebinize makul bir süre içinde yanıt veririz.',
  },
  {
    number: 5,
    heading: 'Bu Politikadaki Değişiklikler',
    body: 'Bu Gizlilik Politikası\'nı zaman zaman güncelleyebiliriz. Herhangi bir değişikliği, yeni politikayı bu sayfada yayımlayarak ve "Son Güncelleme" tarihini yenileyerek bildiririz.',
  },
  {
    number: 6,
    heading: 'İletişim',
    body: 'Bu Gizlilik Politikası hakkında sorularınız varsa lütfen CREARE ile iletişim sayfamız veya e-posta yoluyla bağlantı kurun. Gizliliğinizle ilgili tüm endişeleri dikkatle ele almaya kararlıyız.',
  },
];

export default function PrivacyPage() {
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
            GİZLİLİK
          </h1>
        </nav>

        {/* Policy Sections */}
        <div className="flex flex-col gap-12">
          {policySections.map((section) => (
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
