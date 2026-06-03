'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackCtaClick } from '@/lib/analytics/tracking';
import { buildCloudinaryUrl } from '@/lib/cloudinary';
import { buildCinematicBlurDataUrl } from '@/lib/lqip';

const HOMEPAGE_HERO_IMAGE = buildCloudinaryUrl('creare-hero-image.jpg', {
  format: 'auto',
  quality: 'auto',
  dpr: 'auto',
  crop: 'limit',
});
const HOMEPAGE_HERO_ALT =
  'Library of Celsus and the Gate of Augustus at sunset with warm architectural light';

export default function HeroSection() {
  const pathname = usePathname();
  const heroBlurDataUrl = buildCinematicBlurDataUrl(HOMEPAGE_HERO_IMAGE, {
    atmosphere: 'dark',
    profile: 'hero',
  });

  return (
    <section
      className="relative flex h-screen min-h-[600px] w-full items-end overflow-hidden"
      aria-label="Hero — Experiences Composed as Art"
    >
      <div className="absolute inset-0 z-0">
        <AppImage
          src={HOMEPAGE_HERO_IMAGE}
          alt={HOMEPAGE_HERO_ALT}
          fill
          priority
          blurDataURL={heroBlurDataUrl}
          atmosphere="dark"
          unoptimized
          className="hero-img-zoom h-full w-full object-cover"
          sizes="100vw"
        />

        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/84 via-black/48 to-black/16"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_46%,rgba(0,0,0,0.3)_100%)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-7xl items-end px-6 pb-20 pt-28 sm:px-10 sm:pb-16 sm:pt-32 md:pb-20 lg:px-16">
        <div className="max-w-[21.5rem] sm:max-w-xl">
          <p className="hero-label mb-8 font-body text-[0.56rem] font-light uppercase tracking-[0.34em] text-white/34 sm:mb-7 sm:text-[0.58rem] sm:tracking-[0.38em]">
            Curated Cultural Experiences
          </p>

          <h1 className="hero-title-lg mb-3 font-display text-[clamp(2.45rem,10.4vw,5.5rem)] font-light leading-[1.11] tracking-[-0.018em] text-white sm:mb-2 sm:text-[clamp(2.8rem,6vw,5.5rem)] sm:leading-[1.06] sm:tracking-tight">
            Experiences.
          </h1>

          <p
            className="hero-subtitle mb-14 font-display text-[clamp(2.45rem,10.4vw,5.5rem)] font-light leading-[1.11] tracking-[-0.018em] text-white/58 sm:mb-12 sm:text-[clamp(2.8rem,6vw,5.5rem)] sm:leading-[1.06] sm:tracking-tight sm:text-white/55"
            aria-hidden="true"
          >
            Composed as Art.
          </p>

          <Link
            href="/contact"
            onClick={() =>
              trackCtaClick({
                label: 'INQUIRE PRIVATELY',
                page_path: pathname,
                source: 'home_hero',
                cta_position: 'hero',
              })
            }
            className="hero-cta group/cta motion-link inline-flex min-h-11 items-center font-body text-[0.62rem] uppercase tracking-[0.24em] text-white/60 hover:text-white/90 sm:tracking-[0.3em]"
            aria-label="Inquire privately about CREARE experiences"
          >
            <span className="relative inline-block">
              Inquire Privately →
              <span className="absolute -bottom-px left-0 h-px w-0 bg-white/50 transition-[width,opacity] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] group-hover/cta:w-full" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
