import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      className="relative w-full h-screen min-h-[600px] flex items-center overflow-hidden"
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

        {/* Subtle dark overlay */}
        <div
          className="absolute inset-0 z-10"
          aria-hidden="true"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />
      </div>

      {/* Content — left aligned */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-xl">
          <h1
            className="font-display font-light text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
          >
            Experiences.
            <br />
            Composed as Art.
          </h1>
          <p className="font-body text-white/70 font-light text-xs leading-loose tracking-widest uppercase mb-10">
            Private access. Cultural composition.
          </p>
          <Link
            href="/contact"
            className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white uppercase border border-white/50 px-8 py-3 hover:bg-white hover:text-black transition-all duration-300"
            aria-label="Inquire privately about CREARE experiences"
          >
            Inquire Privately
          </Link>
        </div>
      </div>
    </section>
  );
}
