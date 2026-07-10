import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { buildPhilosophyPageGraph } from '@/lib/schema-builder';
import { buildMetadataAlternates } from '@/lib/seo';

const SITE_URL = 'https://crearetravel.com';
const OG_IMAGE = `${SITE_URL}/og/default.jpg`;

export const metadata: Metadata = {
  title: 'Yaklaşım',
  description:
    'CREARE yaklaşımı: neden varız, nasıl düşünüyoruz ve deneyimin doğasına dair neye inanıyoruz.',
  alternates: buildMetadataAlternates('/philosophy'),
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Yaklaşım — Creare',
    description:
      'CREARE yaklaşımı: neden varız, nasıl düşünüyoruz ve deneyimin doğasına dair neye inanıyoruz.',
    url: `${SITE_URL}/philosophy`,
    siteName: 'Creare',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Creare Yaklaşımı — Deneyimler Bir Sanat Eseri Gibi Tasarlanır',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yaklaşım — Creare',
    description:
      'CREARE yaklaşımı: neden varız, nasıl düşünüyoruz ve deneyimin doğasına dair neye inanıyoruz.',
    images: [OG_IMAGE],
  },
};

export default function PhilosophyPage() {
  const philosophySchema = buildPhilosophyPageGraph();

  return (
    <main className="bg-black min-h-screen">
      <JsonLd id="philosophy-page-jsonld" schema={philosophySchema} />
      {/* Opening Statement */}
      <section className="flex min-h-[86vh] items-center px-8 sm:min-h-[92vh] sm:px-16 lg:min-h-screen lg:px-24">
        <div className="max-w-[680px]">
          <p className="mb-12 font-body text-[0.7rem] uppercase tracking-[0.22em] text-white/15">
            Creare / Yaklaşım
          </p>
          <h1 className="font-display font-light leading-[1.18] text-white text-[clamp(2rem,4.6vw,4.4rem)]">
            İnanıyoruz ki en
            <br />
            olağanüstü deneyimler
            <br />
            satın alınamaz.
            <br />
            <span className="text-white/60">Yalnızca kurgulanabilir.</span>
          </h1>
        </div>
      </section>

      {/* Manifesto Sections */}
      <section className="mx-auto max-w-[660px] px-8 pb-40 sm:px-16 lg:px-0">
        <div className="flex flex-col gap-32">
          {/* 01 — Against the Itinerary */}
          <div>
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              01
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Rota Mantığının Karşısında
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>
                Sektör onlarca yılını; görülecek yerler, öğünler ve transferlerden oluşan önceden
                paketlenmiş rotayı kusursuzlaştırmaya harcadı.
              </p>
              <p>
                İnsanları yerlerin içinden geçirir; ama onların gerçekten varmasına izin vermez.
              </p>
              <p>Biz o işte değiliz.</p>
              <p>
                CREARE; bir kişi ile bir yer, bir misafir ile bir kültürel dünya, bir an ile onun
                tüm anlamı arasında gerçek karşılaşmanın koşullarını kurar.
              </p>
            </div>
          </div>

          {/* 02 — The Composition */}
          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              02
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Kompozisyon
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>&ldquo;Kurgulamak&rdquo; kelimesini bilinçli olarak kullanıyoruz.</p>
              <p>Bir besteci sıralar değil, duygu yaratır.</p>
              <p>Suskunluğu ve sesi, beklentiyi ve varışı anlar.</p>
              <p>Biz de aynı şekilde çalışırız.</p>
              <p className="leading-[2.4]">
                En iyi deneyim ne en pahalı olandır ne de en kapalı olan —<br />
                doğru anda gelen,
                <br />
                doğru biçimde kurulan,
                <br />
                doğru kişiye ulaşandır.
              </p>
            </div>
          </div>

          {/* 03 — Access as Responsibility */}
          <div className="border-t border-white/6 pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              03
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Sorumluluk Olarak Erişim
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>Erişim bir meta değildir. Bir güvendir.</p>
              <p>
                Kapılarını açanlar tarafından bize uzatılır —{' '}
                <span className="text-white/80 italic">görünürlük için değil, uyum için.</span>
              </p>
              <p>Bu güveni ciddiyetle taşırız.</p>
              <p>
                Her deneyim, bir yeri bulduğumuzdan daha iyi bırakacak şekilde tasarlanır —<br />
                insanla kültür arasındaki ilişkiyi derinleştirmek için,{' '}
                <span className="block mt-4">ondan bir şey çekip almak için değil.</span>
              </p>
            </div>
          </div>

          {/* 04 — The Client */}
          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              04
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Misafir
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>Her yıl sınırlı sayıda misafirle çalışırız.</p>
              <p>Gerçek kompozisyon dikkat ister; dikkat ise ölçeklenemez.</p>
              <p>Misafirlerimiz dünyayı görmüştür.</p>
              <p>Onunla başka türlü karşılaşmaya hazırdırlar.</p>
              <p className="leading-[2.4]">
                Meraklı.
                <br />
                Seçici.
                <br />
                Şaşırmaya açık.
              </p>
              <p>
                En iyi deneyimlerin bir katalogla değil, bir sohbetle başladığını bilirler —{' '}
                <span className="block mt-4 text-white/40">katalogla değil.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-28">
          <p className="mb-4 font-body text-[0.7rem] uppercase tracking-[0.2em] text-white/18">
            İçgörüler
          </p>
          <Link
            href="/insights"
            className="inline-flex font-body text-xs uppercase tracking-[0.14em] text-white/34 transition-colors hover:text-white/70"
          >
            Okumaya Devam Et →
          </Link>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-white/10 bg-black" aria-label="Yaklaşım iletişim çağrısı">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <h2
            className="font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          >
            Bu yaklaşım size
            <br />
            yakındıysa, konuşalım.
          </h2>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/32 hover:text-white"
          >
            Bir Görüşme Başlatın →
          </Link>
        </div>
      </section>
    </main>
  );
}
