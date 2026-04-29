import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export const metadata: Metadata = {
  title: 'Creare — Experiences Composed as Art',
  description:
    'Creare curates private cultural encounters across Turkey and beyond — monastery access, atelier visits, and extraordinary moments for discerning clients.',
  alternates: {
    canonical: 'https://crearetravel.com',
    languages: {
      en: 'https://crearetravel.com',
      tr: 'https://crearetravel.com',
      ru: 'https://crearetravel.com',
      zh: 'https://crearetravel.com',
      'x-default': 'https://crearetravel.com',
    },
  },
  openGraph: {
    title: 'Creare — Experiences Composed as Art',
    description: 'Private cultural access. Thoughtfully designed encounters.',
    url: 'https://crearetravel.com',
    siteName: 'Creare',
    type: 'website',
    images: [
      {
        url: 'https://img.rocket.new/generatedImages/rocket_gen_img_167773a44-1775598260952.png',
        width: 1200,
        height: 630,
        alt: 'Creare — Private Cultural Experiences Composed as Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creare — Experiences Composed as Art',
    description: 'Private cultural access. Thoughtfully designed encounters.',
    images: ['https://crearetravel.com/og/default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <main className="bg-black min-h-screen">
      {/* ── HERO ── */}
      <section
        className="relative w-full h-screen min-h-[600px] flex items-end overflow-hidden"
        aria-label="Hero — Experiences Composed as Art"
      >
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <AppImage
            src="https://img.rocket.new/generatedImages/rocket_gen_img_1a084ee29-1772851440502.png"
            alt="Italian monastery colonnade corridor with arched stone columns and terracotta floor"
            fill
            priority
            className="object-cover w-full h-full"
            sizes="100vw"
          />

          {/* Deeper gradient — stronger contrast, bottom-heavy */}
          <div
            className="absolute inset-0 z-10 bg-gradient-to-t from-black/88 via-black/55 to-black/18"
            aria-hidden="true"
          />

          {/* Atmospheric depth — subtle vignette on sides */}
          <div
            className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]"
            aria-hidden="true"
          />
        </div>

        {/* Content — pushed left edge, lower on screen */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-14 md:pb-20">
          <div className="max-w-xl">
            {/* Eyebrow — low opacity */}
            <p
              className="font-body text-white/35 font-light text-[0.58rem] tracking-[0.38em] uppercase mb-7"
              aria-hidden="true"
            >
              Curated Cultural Experiences
            </p>

            {/* Primary headline */}
            <h1 className="font-display font-light text-white leading-[1.06] tracking-tight mb-2 text-[clamp(2.8rem,6vw,5.5rem)]">
              Experiences.
            </h1>

            {/* Secondary headline — reduced opacity for hierarchy */}
            <p
              className="font-display font-light text-white/55 leading-[1.06] tracking-tight mb-12 text-[clamp(2.8rem,6vw,5.5rem)]"
              aria-hidden="true"
            >
              Composed as Art.
            </p>

            {/* Subtle text link CTA */}
            <Link
              href="/contact"
              className="font-body text-[0.62rem] tracking-[0.3em] text-white/70 uppercase hover:text-white transition-colors duration-300"
              aria-label="Inquire privately about CREARE experiences"
            >
              Inquire Privately →
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE SECTIONS ── */}
      <div className="w-full bg-neutral-50">
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-24 md:pt-48 md:pb-36"
          aria-label="SIGNATURE experiences"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-20 xl:gap-28">
            <div className="lg:w-5/12 xl:w-4/12 mb-14 lg:mb-0 lg:flex-shrink-0">
              <p className="font-body font-bold text-[0.6rem] tracking-[0.3em] uppercase text-neutral-400 mb-6">
                SIGNATURE™
              </p>
              <p className="font-display font-light text-neutral-900 leading-[1.1] tracking-tight mb-10 text-[clamp(1.7rem,2.8vw,2.4rem)]">
                Curated cultural experiences.
              </p>
              <p className="font-body text-sm text-neutral-500 leading-relaxed mb-12 max-w-xs">
                Designed, tested, and ready to be lived.
              </p>
              <Link
                href="/experiences/signature"
                className="font-body text-[0.6rem] tracking-[0.28em] text-neutral-900 uppercase hover:opacity-40 transition-opacity"
                aria-label="Explore SIGNATURE experiences"
              >
                Explore →
              </Link>
            </div>
            <div className="lg:w-7/12 xl:w-8/12 overflow-hidden">
              <div className="w-full scale-105 origin-right">
                <AppImage
                  src="https://images.unsplash.com/photo-1734970989502-aa1a2e284871"
                  alt="Ancient stone courtyard of a historic Ottoman palace with ornate architectural details and warm afternoon light"
                  width={1200}
                  height={780}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-32 md:pt-20 md:pb-48 border-t border-neutral-200"
          aria-label="LAB experiences"
        >
          <div className="flex flex-col lg:flex-row-reverse lg:items-center lg:gap-20 xl:gap-28">
            <div className="lg:w-7/12 xl:w-8/12 mb-14 lg:mb-0">
              <div className="w-full overflow-hidden">
                <AppImage
                  src="/assets/images/lab_tailor_made_hand.png"
                  alt="Craftsman hand holding a fine pencil drawing precise architectural lines on white drafting paper — tailor-made from scratch"
                  width={1200}
                  height={780}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="lg:w-5/12 xl:w-4/12 lg:flex-shrink-0">
              <p className="font-body font-bold text-[0.6rem] tracking-[0.3em] uppercase text-neutral-400 mb-6">
                LAB™
              </p>
              <p className="font-display font-light text-neutral-900 leading-[1.1] tracking-tight mb-10 text-[clamp(1.7rem,2.8vw,2.4rem)]">
                Built with you.
              </p>
              <p className="font-body text-sm text-neutral-500 leading-relaxed mb-12 max-w-xs">
                Custom cultural experiences, developed from scratch.
              </p>
              <Link
                href="/experiences/lab"
                className="font-body text-[0.6rem] tracking-[0.28em] text-neutral-900 uppercase hover:opacity-40 transition-opacity"
                aria-label="Discover LAB experience design"
              >
                Discover →
              </Link>
            </div>
          </div>
        </section>

        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-40 md:pt-36 md:pb-56 border-t border-neutral-200"
          aria-label="BLACK private access"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-20 xl:gap-28">
            <div className="lg:w-5/12 xl:w-4/12 mb-14 lg:mb-0 lg:flex-shrink-0">
              <p className="font-body font-bold text-[0.6rem] tracking-[0.3em] uppercase text-neutral-400 mb-6">
                BLACK™
              </p>
              <p className="font-display font-light text-neutral-900 leading-[1.1] tracking-tight mb-10 text-[clamp(1.7rem,2.8vw,2.4rem)]">
                Not publicly available.
              </p>
              <p className="font-body text-sm text-neutral-500 leading-relaxed mb-12 max-w-xs">
                Private access to places, collections, and moments.
              </p>
              <Link
                href="/experiences/black"
                className="font-body text-[0.6rem] tracking-[0.28em] text-neutral-900 uppercase opacity-55 hover:opacity-100 transition-opacity duration-500"
                aria-label="Request private access to BLACK experiences"
              >
                Request Private Access →
              </Link>
            </div>
            <div className="lg:w-7/12 xl:w-8/12">
              <div className="w-full overflow-hidden">
                <AppImage
                  src="/assets/images/black_limited_access_key.png"
                  alt="Single antique key resting on a pure black matte surface with dramatic side lighting — symbol of limited exclusive access"
                  width={1200}
                  height={780}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── FINAL CTA ── */}
      <section
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-32 md:py-48"
        aria-label="Final call to action"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
          <p className="font-display font-light text-white leading-tight text-[clamp(1.5rem,3vw,2.5rem)]">
            Begin the conversation.
          </p>
          <Link
            href="/contact"
            className="font-body text-[0.62rem] tracking-[0.3em] text-white/70 uppercase border border-white/20 px-8 py-4 hover:border-white/50 hover:text-white transition-all duration-300"
            aria-label="Contact CREARE to begin your experience"
          >
            Contact CREARE →
          </Link>
        </div>
      </section>
    </main>
  );
}
