import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

interface CollectionFeature {
  label: string;
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  imageRight?: boolean;
  subduedCta?: boolean;
}

const collectionFeatures: CollectionFeature[] = [
  {
    label: 'SIGNATURE™',
    title: 'Curated cultural experiences.',
    description: 'Designed, tested, and ready to be lived.',
    href: '/experiences/signature',
    image: 'https://images.unsplash.com/photo-1734970989502-aa1a2e284871',
    alt: 'Ancient stone courtyard of a historic Ottoman palace with ornate architectural details and warm afternoon light',
    imageRight: true,
  },
  {
    label: 'LAB™',
    title: 'Built with you.',
    description: 'Custom cultural experiences, developed from scratch.',
    href: '/experiences/lab',
    image: '/assets/images/lab_tailor_made_hand.png',
    alt: 'Craftsman hand holding a fine pencil drawing precise architectural lines on white drafting paper — tailor-made from scratch',
  },
  {
    label: 'BLACK™',
    title: 'Not publicly available.',
    description: 'Private access to places, collections, and moments.',
    href: '/experiences/black',
    image: '/assets/images/black_limited_access_key.png',
    alt: 'Single antique key resting on a pure black matte surface with dramatic side lighting — symbol of limited exclusive access',
    imageRight: true,
    subduedCta: true,
  },
];

export default function CollectionsSection() {
  return (
    <div className="w-full bg-neutral-50">
      <section
        className="mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-10 md:pb-36 md:pt-48 lg:px-16"
        aria-label="SIGNATURE experiences"
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20 xl:gap-28">
          <div className="mb-2 lg:mb-0 lg:w-5/12 lg:flex-shrink-0 xl:w-4/12">
            <p className="mb-5 font-body text-[0.58rem] font-bold uppercase tracking-[0.26em] text-neutral-400 sm:mb-6 sm:text-[0.6rem] sm:tracking-[0.3em]">
              {collectionFeatures[0].label}
            </p>
            <p className="mb-8 font-display text-[clamp(1.55rem,7.3vw,2.4rem)] font-light leading-[1.18] tracking-[-0.015em] text-neutral-900 sm:mb-10 sm:text-[clamp(1.7rem,2.8vw,2.4rem)] sm:leading-[1.1] sm:tracking-tight">
              {collectionFeatures[0].title}
            </p>
            <p className="mb-10 max-w-sm font-body text-[0.95rem] leading-[1.9] text-neutral-500 sm:mb-12 sm:max-w-xs sm:text-sm sm:leading-relaxed">
              {collectionFeatures[0].description}
            </p>
            <Link
              href={collectionFeatures[0].href}
              className="inline-flex min-h-11 items-center font-body text-[0.6rem] uppercase tracking-[0.22em] text-neutral-900 transition-opacity duration-[var(--motion-hover)] ease-[var(--ease-luxury)] hover:opacity-40 sm:tracking-[0.28em]"
              aria-label="Explore SIGNATURE experiences"
            >
              Explore →
            </Link>
          </div>
          <div className="overflow-hidden lg:w-7/12 xl:w-8/12">
            <div className="origin-right scale-105">
              <AppImage
                src={collectionFeatures[0].image}
                alt={collectionFeatures[0].alt}
                width={1200}
                height={780}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl border-t border-neutral-200/80 px-6 pb-28 pt-16 sm:px-10 md:pb-48 md:pt-20 lg:px-16"
        aria-label="LAB experiences"
      >
        <div className="flex flex-col gap-10 lg:flex-row-reverse lg:items-center lg:gap-20 xl:gap-28">
          <div className="mb-2 lg:mb-0 lg:w-7/12 xl:w-8/12">
            <div className="w-full overflow-hidden">
              <AppImage
                src={collectionFeatures[1].image}
                alt={collectionFeatures[1].alt}
                width={1200}
                height={780}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:w-5/12 lg:flex-shrink-0 xl:w-4/12">
            <p className="mb-5 font-body text-[0.58rem] font-bold uppercase tracking-[0.26em] text-neutral-400 sm:mb-6 sm:text-[0.6rem] sm:tracking-[0.3em]">
              {collectionFeatures[1].label}
            </p>
            <p className="mb-8 font-display text-[clamp(1.55rem,7.3vw,2.4rem)] font-light leading-[1.18] tracking-[-0.015em] text-neutral-900 sm:mb-10 sm:text-[clamp(1.7rem,2.8vw,2.4rem)] sm:leading-[1.1] sm:tracking-tight">
              {collectionFeatures[1].title}
            </p>
            <p className="mb-10 max-w-sm font-body text-[0.95rem] leading-[1.9] text-neutral-500 sm:mb-12 sm:max-w-xs sm:text-sm sm:leading-relaxed">
              {collectionFeatures[1].description}
            </p>
            <Link
              href={collectionFeatures[1].href}
              className="inline-flex min-h-11 items-center font-body text-[0.6rem] uppercase tracking-[0.22em] text-neutral-900 transition-opacity duration-[var(--motion-hover)] ease-[var(--ease-luxury)] hover:opacity-40 sm:tracking-[0.28em]"
              aria-label="Discover LAB experience design"
            >
              Discover →
            </Link>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl border-t border-neutral-200/80 px-6 pb-36 pt-20 sm:px-10 md:pb-56 md:pt-36 lg:px-16"
        aria-label="BLACK private access"
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20 xl:gap-28">
          <div className="mb-2 lg:mb-0 lg:w-5/12 lg:flex-shrink-0 xl:w-4/12">
            <p className="mb-5 font-body text-[0.58rem] font-bold uppercase tracking-[0.26em] text-neutral-400 sm:mb-6 sm:text-[0.6rem] sm:tracking-[0.3em]">
              {collectionFeatures[2].label}
            </p>
            <p className="mb-8 font-display text-[clamp(1.55rem,7.3vw,2.4rem)] font-light leading-[1.18] tracking-[-0.015em] text-neutral-900 sm:mb-10 sm:text-[clamp(1.7rem,2.8vw,2.4rem)] sm:leading-[1.1] sm:tracking-tight">
              {collectionFeatures[2].title}
            </p>
            <p className="mb-10 max-w-sm font-body text-[0.95rem] leading-[1.9] text-neutral-500 sm:mb-12 sm:max-w-xs sm:text-sm sm:leading-relaxed">
              {collectionFeatures[2].description}
            </p>
            <Link
              href={collectionFeatures[2].href}
              className="inline-flex min-h-11 items-center font-body text-[0.6rem] uppercase tracking-[0.22em] text-neutral-900 opacity-55 transition-opacity duration-[var(--motion-hover)] ease-[var(--ease-luxury)] hover:opacity-100 sm:tracking-[0.28em]"
              aria-label="Request private access to BLACK experiences"
            >
              Request Private Access →
            </Link>
          </div>
          <div className="lg:w-7/12 xl:w-8/12">
            <div className="w-full overflow-hidden">
              <AppImage
                src={collectionFeatures[2].image}
                alt={collectionFeatures[2].alt}
                width={1200}
                height={780}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
