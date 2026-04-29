import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Essays — Creare Editorial',
  description: 'Long-form thinking on culture, place, and the nature of experience.',
  robots: { index: false, follow: true },
};

interface Essay {
  title: string;
  excerpt: string;
  theme: string;
  readTime: string;
  image: string;
  alt: string;
}

const essays: Essay[] = [
  {
    title: 'On the Meaning of Access',
    excerpt:
      'What does it mean to be granted entry to a place that is closed to the world? A meditation on privilege, responsibility, and the ethics of private experience.',
    theme: 'Philosophy',
    readTime: '12 min',
    image: 'https://images.unsplash.com/photo-1691001539705-91c0745c952c',
    alt: 'Solitary figure standing before a grand closed wooden door in a stone archway',
  },
  {
    title: 'The Architecture of Silence',
    excerpt:
      'From Cistercian monasteries to Japanese tea rooms, the greatest spaces in the world are defined not by what they contain, but by what they exclude.',
    theme: 'Architecture',
    readTime: '9 min',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_13694a711-1772854306426.png',
    alt: 'Minimalist stone monastery corridor with a single shaft of light illuminating the floor',
  },
  {
    title: 'What the Bosphorus Knows',
    excerpt:
      'The strait between Europe and Asia has witnessed more history than any other body of water on earth. A reflection on geography, memory, and the weight of place.',
    theme: 'Istanbul',
    readTime: '15 min',
    image: 'https://images.unsplash.com/photo-1641837750718-54c3c92660f0',
    alt: 'The Bosphorus strait at twilight with tanker ships and the Istanbul skyline in the background',
  },
  {
    title: 'Against the Itinerary',
    excerpt:
      'The best travel experiences cannot be planned. They can only be prepared for. On the difference between an itinerary and an invitation.',
    theme: 'Travel',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1551880080-989d0e3ff339',
    alt: 'Open travel journal with handwritten notes and a vintage map spread across a wooden table',
  },
  {
    title: "The Craftsman's Time",
    excerpt:
      'In a world of instant production, the master craftsman operates in a different temporal register. A visit to a Florentine bookbinder who has been making the same book for forty years.',
    theme: 'Craft',
    readTime: '11 min',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_113f0c92b-1772854306070.png',
    alt: "Artisan bookbinder's hands carefully stitching leather binding in a traditional Florentine workshop",
  },
  {
    title: 'Eating as Archaeology',
    excerpt:
      "Every traditional dish is a document. A meal in Oaxaca, a meze in Istanbul, a ribollita in Florence — each one a record of a civilization's encounter with its landscape.",
    theme: 'Food',
    readTime: '10 min',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d2356961-1772057142910.png',
    alt: 'Traditional Turkish meze spread on a long wooden table with ceramic dishes and fresh herbs',
  },
];

export default function EssaysPage() {
  return (
    <main style={{ backgroundColor: '#080808' }} className="min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-16 px-8 sm:px-16 lg:px-24 max-w-[1600px] mx-auto border-b border-white/10">
        <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">Editorial</p>
        <h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
        >
          Essays
        </h1>
        <p className="text-white/40 font-sans font-light text-sm leading-relaxed max-w-lg mt-6">
          Long-form thinking on culture, place, and the nature of experience. Written to be read
          slowly.
        </p>
      </section>

      {/* Featured Essay */}
      <section className="max-w-[1600px] mx-auto px-8 sm:px-16 lg:px-24 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative" style={{ aspectRatio: '16/9' }}>
            <Image
              src={essays[0].image}
              alt={essays[0].alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">
              {essays[0].theme} · {essays[0].readTime} read
            </p>
            <h2
              className="font-display font-light text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              {essays[0].title}
            </h2>
            <p className="text-white/50 font-sans text-sm leading-loose">{essays[0].excerpt}</p>
            <span className="inline-block mt-8 text-white/30 font-sans text-xs tracking-[0.18em] uppercase hover:text-white transition-colors cursor-pointer">
              Read Essay →
            </span>
          </div>
        </div>
      </section>

      {/* Essays Grid */}
      <section className="max-w-[1600px] mx-auto px-8 sm:px-16 lg:px-24 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {essays.slice(1).map((essay) => (
            <article key={essay.title} className="group">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
                <Image
                  src={essay.image}
                  alt={essay.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="pt-6">
                <p className="text-white/30 font-sans text-xs tracking-[0.18em] uppercase mb-3">
                  {essay.theme} · {essay.readTime} read
                </p>
                <h2 className="font-display font-light text-white text-xl leading-snug mb-4 group-hover:text-white/80 transition-colors">
                  {essay.title}
                </h2>
                <p className="text-white/40 font-sans text-xs leading-relaxed">{essay.excerpt}</p>
                <span className="inline-block mt-5 text-white/30 font-sans text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                  Read →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
