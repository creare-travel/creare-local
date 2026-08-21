import React from 'react';
import Link from 'next/link';
import { localizePathname } from '@/lib/i18n/pathname';

interface LegalSection {
  number: number;
  heading: string;
  body: React.ReactNode;
}

export interface LegalPageContent {
  breadcrumb: string;
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const turkishPrivacyContent: LegalPageContent = {
  breadcrumb: 'GİZLİLİK',
  title: 'Gizlilik Politikası',
  lastUpdated: 'Son Güncelleme: 4 Mart 2026',
  sections: [
    {
      number: 1,
      heading: 'Topladığımız Bilgiler',
      body: 'CREARE, hizmetlerimiz hakkında talepte bulunduğunuzda, etkinliklere kayıt yaptığınızda veya ekibimizle iletişim kurduğunuzda doğrudan bize sağladığınız bilgileri toplar. Bu bilgiler adınızı, e-posta adresinizi, telefon numaranızı, şirket adınızı ve paylaşmayı seçtiğiniz diğer bilgileri içerebilir.',
    },
    {
      number: 2,
      heading: 'Bilgilerinizi Nasıl Kullanırız',
      body: 'Topladığımız bilgileri hizmetlerimizi sunmak, sürdürmek ve geliştirmek, talepleriniz ve sunduğumuz hizmetler hakkında sizinle iletişim kurmak ve hizmetlerimizin nasıl kullanıldığını anlamak için kullanırız. Kişisel bilgilerinizi üçüncü taraflarla onların pazarlama amaçları için satmayız veya paylaşmayız.',
    },
    {
      number: 3,
      heading: 'Veri Güvenliği',
      body: 'Kişisel bilgilerinizin güvenliğini korumak için uygun teknik ve organizasyonel önlemler uygularız. Ancak internet üzerinden iletimin veya elektronik saklama yöntemlerinin hiçbirinin tamamen güvenli olmadığını lütfen unutmayın.',
    },
    {
      number: 4,
      heading: 'Haklarınız',
      body: 'Kişisel bilgilerinize erişme, bu bilgileri güncelleme veya silme hakkına her zaman sahipsiniz. Bu hakları kullanmak isterseniz lütfen bizimle doğrudan iletişime geçin. Talebinize makul bir süre içinde yanıt veririz.',
    },
    {
      number: 5,
      heading: 'Bu Politikadaki Değişiklikler',
      body: 'Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Değişiklikleri, yeni Gizlilik Politikasını bu sayfada yayımlayarak ve "Son Güncelleme" tarihini güncelleyerek size bildiririz.',
    },
    {
      number: 6,
      heading: 'Bizimle İletişime Geçin',
      body: 'Bu Gizlilik Politikası hakkında herhangi bir sorunuz varsa, lütfen iletişim sayfamız üzerinden veya e-posta yoluyla bizimle iletişime geçin. Gizliliğinizle ilgili olası endişelerinizi gidermeye kararlıyız.',
    },
  ],
};

export const turkishTermsContent: LegalPageContent = {
  breadcrumb: 'KOŞULLAR',
  title: 'Kullanım Koşulları',
  lastUpdated: 'Son Güncelleme: 4 Mart 2026',
  sections: [
    {
      number: 1,
      heading: 'Koşulların Kabulü',
      body: 'CREARE web sitesine ve iletişim kanallarına erişerek ve bunları kullanarak, bu sözleşmenin koşul ve hükümlerine bağlı olmayı kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız lütfen web sitesini kullanmayın veya bir iş birliği talebiyle ilerlemeyin.',
    },
    {
      number: 2,
      heading: 'Hizmetlerin Kullanımı',
      body: 'CREARE, seçili müşterilere deneyim tasarımı, özel kültürel erişim planlaması ve ilgili stratejik iş birliği hizmetleri sunar. İş birlikleri, genellikle özel bir ön bilgilendirme sürecinin ardından davet veya talep esasına göre değerlendirilir. Herhangi bir iş birliği talebini veya hizmet ilişkisini herhangi bir zamanda reddetme ya da sonlandırma hakkımız saklıdır.',
    },
    {
      number: 3,
      heading: 'Fikri Mülkiyet',
      body: 'Bu web sitesindeki metinler, grafikler, logolar, görseller ve yazılım dahil tüm içerik CREARE mülkiyetindedir ve ilgili telif hakkı ve marka mevzuatıyla korunur. Açık yazılı izin olmadan içeriğimizi çoğaltamaz, dağıtamaz veya içeriğimizden türev çalışmalar oluşturamazsınız.',
    },
    {
      number: 4,
      heading: 'Gizlilik',
      body: 'CREARE en yüksek gizlilik standartlarıyla çalışır. Tüm müşteri bilgileri, talepler, iş birliği detayları ve erişimle ilgili bilgiler kesin gizlilikle ele alınır. Müşterilerimizden de tescilli yöntemlerimiz ve iş uygulamalarımız konusunda aynı düzeyde gizlilik bekleriz.',
    },
    {
      number: 5,
      heading: 'Sorumluluğun Sınırlandırılması',
      body: 'CREARE, web sitesini veya iş birliği hizmetlerimizi kullanmanızdan ya da kullanamamanızdan kaynaklanan dolaylı, arızi, özel, sonuç niteliğindeki veya cezai zararlardan sorumlu tutulamaz. Web sitesini veya iş birliği hizmetlerimizi kullanımınızdan doğan herhangi bir talep bakımından size karşı toplam sorumluluğumuz, söz konusu hizmetler için ödediğiniz tutarı aşamaz.',
    },
    {
      number: 6,
      heading: 'Koşullarda Değişiklik',
      body: 'Bu koşulları herhangi bir zamanda değiştirme hakkımız saklıdır. Değişiklikler bu sayfada yayımlandığı anda yürürlüğe girer. Bu tür değişikliklerden sonra web sitesini veya iş birliği hizmetlerimizi kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.',
    },
    {
      number: 7,
      heading: 'Uygulanacak Hukuk',
      body: 'Bu koşullar, uygulanabilir ilgili hukuk kurallarına göre yönetilir ve yorumlanır. Bu koşullardan veya web sitesini ya da iş birliği hizmetlerimizi kullanımınızdan doğan uyuşmazlıklar, uluslararası tahkim kurallarına uygun olarak bağlayıcı tahkim yoluyla çözümlenir.',
    },
    {
      number: 8,
      heading: 'İletişim Bilgileri',
      body: 'Bu Kullanım Koşulları hakkında herhangi bir sorunuz varsa lütfen resmi iletişim kanallarımız üzerinden bizimle iletişime geçin. Endişelerinizi hızlı ve profesyonel biçimde ele almaya kararlıyız.',
    },
  ],
};

export const turkishCookiesContent: LegalPageContent = {
  breadcrumb: 'ÇEREZLER',
  title: 'Çerez Politikası',
  lastUpdated: 'Son Güncelleme: 4 Mart 2026',
  sections: [
    {
      number: 1,
      heading: 'Çerezler Nedir?',
      body: 'Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza yerleştirilen küçük metin dosyalarıdır. Tercihlerinizi hatırlayarak ve hizmetlerimizle nasıl etkileşim kurduğunuzu anlamamıza yardımcı olarak size daha iyi bir deneyim sunmamızı sağlarlar.',
    },
    {
      number: 2,
      heading: 'Çerezleri Nasıl Kullanırız?',
      body: 'CREARE, ziyaretçilerin web sitemizde nasıl gezindiğini anlamak, dil tercihlerinizi hatırlamak ve web sitesi trafiğini analiz etmek için çerezler kullanır. Hem oturum çerezlerini (tarayıcınızı kapattığınızda süresi dolan) hem de kalıcı çerezleri (silinene veya süresi dolana kadar cihazınızda kalan) kullanırız.',
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
            <strong>Analitik Çerezler:</strong> Bu çerezleri ziyaretçilerin web sitemizle nasıl
            etkileşim kurduğunu anlamak, hizmetlerimizi ve kullanıcı deneyimini geliştirmek için
            kullanırız.
          </span>
          <span className="block">
            <strong>Tercih Çerezleri:</strong> Bu çerezler, web sitemizin tercih ettiğiniz dil gibi
            sitenin davranışını veya görünümünü değiştiren bilgileri hatırlamasını sağlar.
          </span>
        </>
      ),
    },
    {
      number: 4,
      heading: 'Çerezleri Yönetme',
      body: 'Çerezleri çeşitli şekillerde kontrol edebilir ve yönetebilirsiniz. Çerezleri kaldırmanın veya engellemenin kullanıcı deneyiminizi etkileyebileceğini ve bazı işlevlerin artık kullanılamayabileceğini lütfen unutmayın. Çoğu tarayıcı çerezleri otomatik olarak kabul eder; ancak dilerseniz tarayıcı ayarlarınızı genellikle çerezleri reddedecek şekilde değiştirebilirsiniz.',
    },
    {
      number: 5,
      heading: 'Bu Politikadaki Değişiklikler',
      body: 'Bu Çerez Politikasını teknoloji, mevzuat veya iş süreçlerimizdeki değişiklikleri yansıtmak üzere zaman zaman güncelleyebiliriz. Çerez uygulamalarımız hakkındaki en güncel bilgiler için bu sayfayı düzenli olarak gözden geçirmenizi öneririz.',
    },
  ],
};

export function TurkishLegalPage({ content }: { content: LegalPageContent }) {
  return (
    <main className="min-h-screen bg-white">
      <div className="px-6 sm:px-10 lg:px-16 pt-28 pb-24 max-w-4xl mx-auto">
        <nav aria-label="Sayfa yolu" className="flex items-center gap-2 mb-12">
          <Link
            href={localizePathname('/', 'tr')}
            className="flex items-center gap-1 text-xs tracking-widest text-gray-500 hover:text-black transition-colors uppercase"
          >
            <span aria-hidden="true">←</span>
            <span>ANA SAYFA</span>
          </Link>
          <span className="text-xs text-gray-400" aria-hidden="true">
            /
          </span>
          <h1 className="text-xs tracking-widest text-black uppercase" aria-current="page">
            {content.breadcrumb}
          </h1>
        </nav>

        <div className="flex flex-col gap-12">
          {content.sections.map((section) => (
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

        <p className="mt-16 text-xs text-gray-500 tracking-wide">{content.lastUpdated}</p>
      </div>
    </main>
  );
}
