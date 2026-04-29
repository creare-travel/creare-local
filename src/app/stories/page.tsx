import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Stories — Creare',
  description: 'Cultural narratives and experience stories from the world of Creare.',
  robots: { index: false, follow: true },
};

export default function StoriesPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <p className="text-white/30 font-body text-xs tracking-[0.2em] uppercase mb-6">Creare</p>
        <h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
        >
          Stories
        </h1>
        <p className="text-white/50 font-body font-light text-base leading-relaxed max-w-lg mt-8">
          The world as we encounter it. Cultural narratives and experience stories from the places
          and people that shape our work.
        </p>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Link
            href="/stories/cultural-narratives"
            className="group relative overflow-hidden block aspect-[4/3]"
            aria-label="Read Cultural Narratives"
          >
            <Image
              src="https://images.unsplash.com/photo-1685630923784-f530025e792d"
              alt="Ornate interior of a historic mosque with intricate tile work and golden light streaming through windows"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <p className="text-white/40 font-body text-xs tracking-[0.2em] uppercase mb-3">01</p>
              <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-3">
                Cultural Narratives
              </h2>
              <p className="text-white/60 font-body text-sm">
                The stories behind the places. History, ritual, and meaning.
              </p>
              <span className="mt-6 text-white/40 font-body text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                Read →
              </span>
            </div>
          </Link>

          <Link
            href="/stories/experience-stories"
            className="group relative overflow-hidden block aspect-[4/3]"
            aria-label="Read Experience Stories"
          >
            <Image
              src="https://img.rocket.new/generatedImages/rocket_gen_img_1efdf799a-1772854308698.png"
              alt="Grand Italian palazzo interior with ornate frescoed ceiling and marble columns bathed in warm light"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <p className="text-white/40 font-body text-xs tracking-[0.2em] uppercase mb-3">02</p>
              <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-3">
                Experience Stories
              </h2>
              <p className="text-white/60 font-body text-sm">
                First-person accounts of Creare encounters.
              </p>
              <span className="mt-6 text-white/40 font-body text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                Read →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
