import type { Metadata } from 'next';
import Link from 'next/link';
import CulturalWorldsIndexSection from '@/app/home/components/CulturalWorldsIndexSection';
import HeroSection from '@/app/home/components/HeroSection';
import CollectionsSection from '@/app/home/components/CollectionsSection';
import SelectedInsightsSection from '@/app/home/components/SelectedInsightsSection';
import JsonLd from '@/components/JsonLd';
import { buildHomepageWebPageGraph } from '@/lib/schema-builder';
import { buildMetadataAlternates, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Creare — Deneyimler Bir Sanat Eseri Gibi Tasarlanır',
  description:
    'Creare, kültürel erişim, anlatı ve kompozisyon üzerinden özel karşılaşmalar kurgular. SIGNATURE, LAB ve BLACK ile her deneyim bağlamına göre şekillenir.',
  alternates: buildMetadataAlternates('/'),
  openGraph: {
    title: 'Creare — Deneyimler Bir Sanat Eseri Gibi Tasarlanır',
    description: 'Özel kültürel erişim. Dikkatle tasarlanmış karşılaşmalar.',
    url: 'https://crearetravel.com',
    siteName: 'Creare',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creare — Deneyimler Bir Sanat Eseri Gibi Tasarlanır',
    description: 'Özel kültürel erişim. Dikkatle tasarlanmış karşılaşmalar.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  const homepageSchema = buildHomepageWebPageGraph();

  return (
    <main className="min-h-screen bg-black">
      <JsonLd id="homepage-webpage-jsonld" schema={homepageSchema} />
      <HeroSection />
      <section className="bg-neutral-50" aria-label="Homepage experience introduction">
        <div className="mx-auto max-w-7xl px-6 pb-24 sm:px-10 sm:pb-28 lg:px-16 lg:pb-32">
          <p className="mb-6 max-w-2xl font-body text-sm leading-relaxed text-neutral-700">
            CREARE, paketlenmiş seyahat etrafında değil; kültürel erişim, anlatı zekâsı ve
            karşılaşmanın dikkatli kompozisyonu etrafında kurulur. Signature, LAB ve BLACK üç
            çalışma biçimini tanımlar: küratörlü kültürel deneyimler, kişiye özel komisyonlar ve
            bağlam, güven ve yerin daha derin mantığıyla şekillenen mahrem erişim. Amaç yerler
            arasında verimli biçimde ilerlemek değil; onlara anlamını veren şeyi kavramaktır: onları
            koruyan emanetçiler, onları okunur kılan yerel bilgi ve bir karşılaşmayı sırf varışın
            ötesine taşıyan koşullar.
          </p>
          <Link
            href="/experiences"
            className="inline-flex font-body text-xs uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-900"
          >
            Deneyime Nasıl Yaklaşıyoruz →
          </Link>
        </div>
      </section>
      <CulturalWorldsIndexSection />
      <CollectionsSection />
      <SelectedInsightsSection />
    </main>
  );
}
