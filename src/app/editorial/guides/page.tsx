import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Guides — Creare Editorial',
  description:
    'Practical luxury. How to move through a city, a culture, a moment — with intention.',
  robots: { index: false, follow: true },
};

interface Guide {
  title: string;
  excerpt: string;
  destination: string;
  type: string;
  image: string;
  alt: string;
}

const guides: Guide[] = [
  {
    title: 'Istanbul: A First Week',
    excerpt:
      'Seven days in the city between continents. Where to stay, what to eat, which neighbourhoods reward slow walking, and the one thing most visitors miss entirely.',
    destination: 'Istanbul',
    type: 'City Guide',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10674aaf7-1773268078214.png',
    alt: 'Istanbul street scene with a traditional tea house, cobblestones, and the Bosphorus visible in the distance',
  },
  {
    title: 'The Bodrum Peninsula: Beyond the Marina',
    excerpt:
      'The peninsula has more to offer than its famous harbour. A guide to the villages, coves, and cultural sites that most visitors never find.',
    destination: 'Bodrum',
    type: 'Regional Guide',
    image: 'https://images.unsplash.com/photo-1587240852847-64aa45b0a993',
    alt: 'Scenic view of Bodrum peninsula with whitewashed buildings, windmills, and the turquoise Aegean sea',
  },
  {
    title: 'Florence for the Serious Visitor',
    excerpt:
      'Beyond the Uffizi queue and the Ponte Vecchio crowds lies a Florence of private collections, working ateliers, and neighbourhood trattorias that have never appeared in a guidebook.',
    destination: 'Florence',
    type: 'City Guide',
    image: 'https://images.unsplash.com/photo-1640664597116-d0e5dd4dfbaa',
    alt: 'Florence rooftop view at sunset with the Duomo dome and terracotta rooftops bathed in golden light',
  },
  {
    title: 'How to Travel in Japan',
    excerpt:
      'Japan rewards preparation and punishes impatience. A guide to the rhythms, rituals, and unwritten rules of a country that operates on its own terms.',
    destination: 'Japan',
    type: 'Country Guide',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e24c8c8d-1772854309151.png',
    alt: 'Traditional Japanese street in Kyoto with wooden machiya townhouses and cherry blossom trees',
  },
  {
    title: 'The Art of the Private Dinner',
    excerpt:
      'How to arrange a private dining experience that transcends the restaurant. Locations, chefs, and the questions to ask before you commit.',
    destination: 'Global',
    type: 'Experience Guide',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15d2ef65c-1772854307031.png',
    alt: 'Elegantly set private dinner table in a candlelit stone cellar with crystal glasses and fresh flowers',
  },
  {
    title: 'Packing for the Extraordinary',
    excerpt:
      'What to bring when the experience demands more than a suitcase. A practical guide to travelling light without sacrificing anything that matters.',
    destination: 'Global',
    type: 'Practical Guide',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b68b8744-1772854308495.png',
    alt: 'Neatly packed leather travel bag with quality clothing, a journal, and travel essentials on a wooden floor',
  },
];

export default function GuidesPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-16 px-8 sm:px-16 lg:px-24 max-w-[1600px] mx-auto border-b border-white/10">
        <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">Editorial</p>
        <h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
        >
          Guides
        </h1>
        <p className="text-white/50 font-sans font-light text-sm leading-relaxed max-w-lg mt-6">
          Practical luxury. How to move through a city, a culture, a moment — with intention.
        </p>
      </section>

      {/* Guides Grid */}
      <section className="max-w-[1600px] mx-auto px-8 sm:px-16 lg:px-24 py-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {guides.map((guide) => (
            <article key={guide.title} className="group">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
                <Image
                  src={guide.image}
                  alt={guide.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-white/30 font-sans text-xs tracking-[0.18em] uppercase">
                    {guide.destination}
                  </p>
                  <span className="text-white/20">·</span>
                  <p className="text-white/30 font-sans text-xs tracking-[0.18em] uppercase">
                    {guide.type}
                  </p>
                </div>
                <h2 className="font-display font-light text-white text-xl leading-snug mb-4 group-hover:text-white/80 transition-colors">
                  {guide.title}
                </h2>
                <p className="text-white/50 font-sans text-xs leading-relaxed">{guide.excerpt}</p>
                <span className="inline-block mt-5 text-white/30 font-sans text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                  Read Guide →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
