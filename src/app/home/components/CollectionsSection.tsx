import React, { memo } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

interface CollectionCard {
  label: string;
  trademark: string;
  image: string;
  alt: string;
  description: string;
  features: string[];
  href: string;
}

const cards: CollectionCard[] = [
  {
    label: 'LAB',
    trademark: '™',
    image: 'https://images.unsplash.com/photo-1533822545705-6c02ae3e3a0a',
    alt: 'Black and white photograph of stone steps with textured granite surface',
    description:
      'Where new ideas are shaped into singular experiences.\nFor those who prefer to create rather than simply choose.',
    features: ['Concept creation', 'Strategic experience architecture', 'Bespoke development'],
    href: '/experiences/lab',
  },
  {
    label: 'SIGNATURE EXPERIENCES',
    trademark: '™',
    image: 'https://images.unsplash.com/photo-1505621625254-57bac2f1a872',
    alt: 'Deep blue and orange sunset sky over a dramatic horizon landscape',
    description: 'Our most distinguished experiences.\nRefined, tested and ready to be lived.',
    features: ['Established concepts', 'Curated partners', 'Seamless delivery'],
    href: '/experiences/signature',
  },
  {
    label: 'BLACK',
    trademark: '™',
    image: 'https://images.unsplash.com/photo-1730759214728-49fea9644175',
    alt: 'Dark luxury object with intricate texture on a pure black background',
    description: 'Beyond the expected.\nWhere privilege is carefully composed.',
    features: ['Private venues', 'Closed doors', 'After hours'],
    href: '/experiences/black',
  },
];

const CollectionCardItem = memo(function CollectionCardItem({ card }: { card: CollectionCard }) {
  return (
    <Link
      href={card.href}
      className="flex flex-col group"
      aria-label={`Explore ${card.label} collection`}
    >
      {/* Tall portrait image — lazy loaded (below fold) */}
      <div className="w-full aspect-[3/4] overflow-hidden relative">
        <AppImage
          src={card.image}
          alt={card.alt}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Label */}
      <p className="mt-6 mb-4 uppercase font-body font-normal text-[0.7rem] tracking-brand text-card-text leading-relaxed">
        {card.label.split('').join('\u200A')}
        <sup className="text-[0.5rem] align-super tracking-normal">{card.trademark}</sup>
      </p>

      {/* Description */}
      <p className="mb-5 font-display font-light text-[0.82rem] text-card-body leading-body whitespace-pre-line">
        {card.description}
      </p>

      {/* Feature bullets */}
      <ul className="flex flex-col gap-1.5">
        {card.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 font-body text-[0.68rem] text-card-muted tracking-wide"
          >
            <span
              className="inline-block w-1 h-1 rounded-full bg-card-muted flex-shrink-0"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
});

const CollectionsSection = memo(function CollectionsSection() {
  return (
    <section className="w-full bg-stone-light" aria-label="Collections">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20">
        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <CollectionCardItem key={card.label} card={card} />
          ))}
        </div>

        {/* Divider */}
        <div
          className="mt-16 mb-10 border-t border-divider mx-[calc(33.333%+16px)]"
          aria-hidden="true"
        />

        {/* INQUIRE PRIVATELY CTA */}
        <div className="flex justify-center">
          <Link
            href="/contact"
            aria-label="Inquire privately about CREARE experiences"
            className="font-body text-[0.65rem] tracking-[0.3em] text-card-text uppercase hover:opacity-60 transition-opacity"
          >
            INQUIRE PRIVATELY
          </Link>
        </div>

        {/* Bottom spacing */}
        <div className="h-20" aria-hidden="true" />
      </div>
    </section>
  );
});

export default CollectionsSection;
