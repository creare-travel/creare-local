import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Experience Stories — Creare Stories',
  description: 'First-person accounts of Creare encounters.',
  robots: { index: false, follow: true },
};

interface Article {
  title: string;
  excerpt: string;
  category: string;
  image: string;
  alt: string;
}

const articles: Article[] = [
  {
    title: 'An Evening Inside the Uffizi',
    excerpt:
      'The gallery after closing. No crowds, no audio guides — just Botticelli, a curator who has spent thirty years with these paintings, and the particular silence of great art.',
    category: 'Signature Experience',
    image: 'https://images.unsplash.com/photo-1729023363330-4c530ad01e50',
    alt: 'Grand museum gallery hall with Renaissance paintings on walls and ornate gilded ceiling lit by evening light',
  },
  {
    title: 'Sailing the Bosphorus at First Light',
    excerpt:
      'A private boat, the strait between continents, and a breakfast of simit and tea as the city woke around us. Istanbul from the water is Istanbul at its most honest.',
    category: 'Istanbul',
    image: 'https://images.unsplash.com/photo-1695038406070-8fa8da0ab1c6',
    alt: 'Private sailing boat on the Bosphorus at dawn with Istanbul skyline and minarets in the misty background',
  },
  {
    title: 'Three Days in a Bodrum Gulet',
    excerpt:
      'We anchored in coves that had no names on any map. The cook prepared octopus on a wood fire. The water was the colour of glass.',
    category: 'Bodrum',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_125383115-1772252952502.png',
    alt: 'Traditional wooden gulet anchored in a secluded turquoise cove with limestone cliffs and clear water',
  },
  {
    title: 'Inside a Venetian Atelier',
    excerpt:
      "The glassblower's workshop on Murano has been in the same family since 1847. He showed us how to read the colour of molten glass. It is a language learned only by touch.",
    category: 'Lab',
    image: 'https://images.unsplash.com/photo-1615143735913-8ff84fd92bdb',
    alt: 'Glassblower working with molten glass in a traditional Murano workshop with glowing furnace',
  },
  {
    title: 'The Monastery at Dawn',
    excerpt:
      'We arrived before the bells. The monks were already in the chapel. We sat in the back and listened to Gregorian chant echo off stone walls that had heard it for eight hundred years.',
    category: 'Signature Experience',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12e80ea74-1772854311037.png',
    alt: 'Ancient monastery chapel interior with stone arches and candlelight during early morning prayer',
  },
  {
    title: 'A Night in the Sahara',
    excerpt:
      'The camp was three hours from the nearest road. The silence was total. The stars were not a backdrop — they were the ceiling of the world.',
    category: 'Black',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_153714ebb-1768641287206.png',
    alt: 'Luxury desert camp tent under a vast Milky Way sky in the Sahara with sand dunes in the distance',
  },
];

export default function ExperienceStoriesPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-16 px-8 sm:px-16 lg:px-24 max-w-[1600px] mx-auto border-b border-white/10">
        <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">Stories</p>
        <h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
        >
          Experience Stories
        </h1>
        <p className="text-white/50 font-sans font-light text-sm leading-relaxed max-w-lg mt-6">
          First-person accounts of Creare encounters. What it feels like to be inside the
          experience.
        </p>
      </section>

      {/* Articles Grid */}
      <section className="max-w-[1600px] mx-auto px-8 sm:px-16 lg:px-24 py-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article) => (
            <article key={article.title} className="group">
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
                <Image
                  src={article.image}
                  alt={article.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="pt-6">
                <p className="text-white/30 font-sans text-xs tracking-[0.18em] uppercase mb-3">
                  {article.category}
                </p>
                <h2 className="font-display font-light text-white text-xl leading-snug mb-4 group-hover:text-white/80 transition-colors">
                  {article.title}
                </h2>
                <p className="text-white/50 font-sans text-xs leading-relaxed">{article.excerpt}</p>
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
