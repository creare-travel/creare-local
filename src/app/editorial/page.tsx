import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Editorial — Creare',
  description:
    'Essays and guides from the world of Creare. Long-form writing on culture, travel, and the art of experience.',
  robots: { index: false, follow: true },
};

export default function EditorialPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-20 px-8 sm:px-16 lg:px-24 max-w-[1600px] mx-auto">
        <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-6">Creare</p>
        <h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
        >
          Editorial
        </h1>
        <p className="text-white/50 font-sans font-light text-base leading-relaxed max-w-lg mt-8">
          Long-form writing on culture, travel, and the art of experience. Essays that think, guides
          that illuminate.
        </p>
      </section>

      {/* Two Sections */}
      <section className="max-w-[1600px] mx-auto px-8 sm:px-16 lg:px-24 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Essays */}
          <Link
            href="/editorial/essays"
            className="group relative overflow-hidden block"
            style={{ aspectRatio: '3/4' }}
          >
            <Image
              src="https://images.unsplash.com/photo-1571097499809-b1f0778ae2e2"
              alt="Open book on a dark wooden desk with a single lamp casting warm light over the pages"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">01</p>
              <h2 className="font-display font-light text-white text-4xl mb-4">Essays</h2>
              <p className="text-white/60 font-sans text-sm leading-relaxed max-w-xs">
                Long-form thinking on culture, place, and the nature of experience. Written to be
                read slowly.
              </p>
              <span className="mt-8 text-white/40 font-sans text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                Read →
              </span>
            </div>
          </Link>

          {/* Guides */}
          <Link
            href="/editorial/guides"
            className="group relative overflow-hidden block"
            style={{ aspectRatio: '3/4' }}
          >
            <Image
              src="https://img.rocket.new/generatedImages/rocket_gen_img_18b72dbdc-1772854307250.png"
              alt="Traveller\'s journal, compass, and map laid out on a wooden table with morning coffee"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <p className="text-white/30 font-sans text-xs tracking-[0.2em] uppercase mb-4">02</p>
              <h2 className="font-display font-light text-white text-4xl mb-4">Guides</h2>
              <p className="text-white/60 font-sans text-sm leading-relaxed max-w-xs">
                Practical luxury. How to move through a city, a culture, a moment — with intention.
              </p>
              <span className="mt-8 text-white/40 font-sans text-xs tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                Read →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
