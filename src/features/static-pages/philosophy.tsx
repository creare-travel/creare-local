import React from 'react';
import Link from 'next/link';
import { localizePathname } from '@/lib/i18n/pathname';

export function TurkishPhilosophyPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="flex min-h-[86vh] items-center px-8 sm:min-h-[92vh] sm:px-16 lg:min-h-screen lg:px-24">
        <div className="max-w-[680px]">
          <p className="mb-12 font-body text-[0.7rem] uppercase tracking-[0.22em] text-white/15">
            Creare / Felsefemiz
          </p>
          <h1 className="font-display font-light leading-[1.18] text-white text-[clamp(2rem,4.6vw,4.4rem)]">
            BİZ, STRATEJİK BİR
            <br />
            DENEYİM TASARIM
            <br />
            STÜDYOSUYUZ.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[660px] px-8 pb-40 sm:px-16 lg:px-0">
        <div className="flex flex-col gap-32">
          <div>
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              01
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Felsefemiz
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>Deneyimleri ölçülülük, hassasiyet ve disiplinli uygulamayla yapılandırıyoruz.</p>
              <p>Deneyimleri çoğaltmıyoruz.</p>
              <p>Onları rafine ediyoruz.</p>
            </div>
          </div>

          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              02
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Mimari
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>Yolculuk, en yüksek hâlinde hareket değildir.</p>
              <p>Bir mimaridir.</p>
              <p>Herkes bir destinasyonu düzenleyebilir.</p>
              <p>Çok az kişi bir deneyimi tasarlayabilir.</p>
              <p>Biz deneyimler tasarlıyoruz.</p>
            </div>
          </div>

          <div className="border-t border-white/6 pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              03
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              İlkeler
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>CREARE deneyiminde hiçbir şey tesadüfi değildir.</p>
              <p>Niyet, güzergahtan önce gelir.</p>
              <p>Erişim, görünürlükten önce gelir.</p>
              <p>Akış, gösteriden önce gelir.</p>
              <p>Uygulama, ifadeden önce gelir.</p>
            </div>
          </div>

          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              04
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Kontrol
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>Lüks fazlalık değildir.</p>
              <p>Kontroldür.</p>
              <p>Sürtüşmenin yokluğu asla tesadüf değildir.</p>
              <p>Tasarlanır.</p>
              <p>Bilinçle.</p>
            </div>
          </div>
        </div>

        <div className="mt-28">
          <p className="mb-4 font-body text-[0.7rem] uppercase tracking-[0.2em] text-white/18">
            Yazılar
          </p>
          <Link
            href={localizePathname('/insights', 'tr')}
            className="inline-flex font-body text-xs uppercase tracking-[0.14em] text-white/34 transition-colors hover:text-white/70"
          >
            Okumaya devam et →
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black" aria-label="Felsefe iletişim çağrısı">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <h2
            className="font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          >
            Bu yaklaşım size yakınsa,
            <br />
            görüşmeliyiz.
          </h2>
          <Link
            href={localizePathname('/contact', 'tr')}
            className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/32 hover:text-white"
          >
            ÖZEL TALEP
          </Link>
        </div>
      </section>
    </main>
  );
}
