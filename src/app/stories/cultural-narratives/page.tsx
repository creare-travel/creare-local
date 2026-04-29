import React from 'react';
import type { Metadata } from 'next';

import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Cultural Narratives — Creare Stories',
  description: 'The stories behind the places. History, ritual, and meaning.',
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
    title: 'The Silence of the Monastery',
    excerpt:
      'Inside a 12th-century Benedictine community in Umbria, time moves differently. A meditation on stillness, ritual, and the architecture of devotion.',
    category: 'Italy',
    image: 'https://images.unsplash.com/photo-1563820040175-ecef8cb233de',
    alt: 'Ancient stone monastery cloister with arched walkways and a central garden in soft morning light',
  },
  {
    title: "Istanbul's Byzantine Underbelly",
    excerpt:
      "Beneath the city's mosques and markets lies a world of cisterns, frescoes, and forgotten empires. A journey through the layers of Constantinople.",
    category: 'Istanbul',
    image: 'https://images.unsplash.com/photo-1713332622450-f8b9b4431379',
    alt: 'Dimly lit Byzantine cistern with rows of ancient marble columns reflected in dark still water',
  },
  {
    title: 'The Last Gulet Builders of Bodrum',
    excerpt:
      'In a small workshop on the Bodrum waterfront, three brothers continue a craft their grandfather taught them. Wood, water, and the memory of the sea.',
    category: 'Bodrum',
    image: 'https://images.unsplash.com/photo-1717606345066-de5286c2d010',
    alt: 'Traditional wooden gulet boat under construction in a coastal boatyard with craftsmen at work',
  },
  {
    title: 'Fez: The City That Refused to Change',
    excerpt:
      "The medina of Fez is the world's largest living medieval city. A portrait of a place that has chosen memory over modernity.",
    category: 'Morocco',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f305bd18-1772534946653.png',
    alt: 'Aerial view of the Fez medina tanneries with colorful dye vats surrounded by ancient stone buildings',
  },
  {
    title: 'Tea and Ceremony in Kyoto',
    excerpt:
      'A tea master in Higashiyama has been practicing the same ritual for forty years. On the meaning of repetition, presence, and the perfect bowl of matcha.',
    category: 'Japan',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d5ba3e8a-1765350337896.png',
    alt: 'Traditional Japanese tea ceremony room with tatami mats, a bamboo whisk, and a ceramic tea bowl',
  },
  {
    title: 'The Weavers of Oaxaca',
    excerpt:
      'In the valleys south of the city, families have been weaving the same patterns for generations. A story about colour, memory, and the politics of craft.',
    category: 'Mexico',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ff74bde9-1772854305555.png',
    alt: 'Vibrant handwoven textiles in traditional Oaxacan patterns displayed in a sunlit artisan workshop',
  },
];

export default function CulturalNarrativesPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-16 px-8 sm:px-16 lg:px-24 max-w-[1600px] mx-auto border-b border-white/10">
        <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">Stories</p>
        <h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
        >
          Cultural Narratives
        </h1>
        <p className="text-white/50 font-sans font-light text-sm leading-relaxed max-w-lg mt-6">
          The stories behind the places. History, ritual, and meaning — told through the lens of
          those who know them best.
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
