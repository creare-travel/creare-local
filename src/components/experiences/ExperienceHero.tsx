import React from 'react';
import AppImage from '@/components/ui/AppImage';

interface ExperienceHeroProps {
  title: string;
  subtitle?: string;
  label?: string;
  heroImage: string;
  heroImageAlt: string;
  showScrollCta?: boolean;
  heroHeadline?: string;
  heroMetaLine?: string;
}

export default function ExperienceHero({
  title,
  subtitle,
  label,
  heroImage,
  heroImageAlt,
  showScrollCta = false,
  heroHeadline,
  heroMetaLine,
}: ExperienceHeroProps) {
  return (
    <section
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      aria-label={`Hero — ${title}`}
    >
      {/* Full-bleed background */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src={heroImage}
          alt={heroImageAlt}
          fill
          priority
          deliveryProfile="hero"
          className="object-cover w-full h-full"
          sizes="100vw"
        />
        <div className="absolute inset-0 z-10 bg-black/50" aria-hidden="true" />
      </div>

      {/* Content — centered */}
      <div className="relative z-20 text-center px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        {label && (
          <p className="font-body text-[0.6rem] tracking-[0.35em] text-white/70 uppercase mb-5">
            {label}
          </p>
        )}
        {heroHeadline && (
          <p
            className="font-display font-light text-white leading-[1.08] tracking-tight mb-3"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}
          >
            {heroHeadline}
          </p>
        )}
        <h1
          className="font-display font-light text-white leading-[1.08] tracking-tight mb-6"
          style={{
            fontSize: heroHeadline ? 'clamp(1.2rem, 2.5vw, 2rem)' : 'clamp(2.4rem, 6vw, 5rem)',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-white/75 font-light text-sm leading-loose tracking-wide max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        {heroMetaLine && (
          <p className="font-body text-white/50 text-[0.65rem] tracking-[0.2em] uppercase mt-4">
            {heroMetaLine}
          </p>
        )}
      </div>

      {/* Scroll CTA */}
      {showScrollCta && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="font-body text-[0.55rem] tracking-[0.35em] text-white/60 uppercase">
            EXPLORE
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="motion-float-subtle text-white/60"
          >
            <path
              d="M8 3v10M3 9l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </section>
  );
}
