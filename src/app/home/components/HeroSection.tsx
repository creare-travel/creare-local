import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      className="relative flex h-screen min-h-[600px] w-full items-end overflow-hidden"
      aria-label="Hero — Experiences Composed as Art"
    >
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1a084ee29-1772851440502.png"
          alt="Italian monastery colonnade corridor with arched stone columns and terracotta floor"
          fill
          priority
          className="object-cover w-full h-full"
          sizes="100vw"
        />

        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/88 via-black/55 to-black/18"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-30 mx-auto w-full max-w-7xl px-6 pb-14 sm:px-10 md:pb-20 lg:px-16">
        <div className="max-w-xl">
          <p className="mb-7 font-body text-[0.58rem] font-light uppercase tracking-[0.38em] text-white/35">
            Curated Cultural Experiences
          </p>

          <h1 className="mb-2 font-display text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.06] tracking-tight text-white">
            Experiences.
          </h1>

          <p
            className="mb-12 font-display text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.06] tracking-tight text-white/55"
            aria-hidden="true"
          >
            Composed as Art.
          </p>

          <Link
            href="/contact"
            className="font-body text-[0.62rem] uppercase tracking-[0.3em] text-white/70 transition-colors duration-300 hover:text-white"
            aria-label="Inquire privately about CREARE experiences"
          >
            Inquire Privately →
          </Link>
        </div>
      </div>
    </section>
  );
}
