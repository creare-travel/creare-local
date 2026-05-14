import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadataAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Aegean — Cultural World — Creare',
  description:
    'The Aegean is where civilisation, coastline, and continuity meet. Private cultural access shaped by the sea, archaeology, and the table.',
  alternates: buildMetadataAlternates('/cultural-worlds/aegean'),
  robots: { index: false, follow: false },
};

export default function AegeanPage() {
  return (
    <main className="bg-black min-h-screen">
      <section className="pt-40 pb-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <p className="text-white/30 font-body text-xs tracking-[0.2em] uppercase mb-6">
          Cultural Worlds
        </p>
        <h1
          className="font-display font-light text-white leading-tight"
          style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
        >
          Aegean
        </h1>
        <p className="text-white/50 font-body font-light text-base leading-relaxed max-w-2xl mt-8">
          The Aegean is a living argument between sea, stone, and civilisation. This route remains
          stable while its fuller editorial destination page is restored.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-32">
        <div className="max-w-3xl border-t border-white/10 pt-12">
          <p className="text-white/60 font-body font-light text-base leading-loose mb-8">
            The coast holds archaeology, food, and maritime culture in continuous conversation. This
            placeholder avoids redirect instability and keeps the cultural-world route available in
            a controlled, minimal form.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/contact"
              className="font-body text-[0.65rem] tracking-[0.28em] text-white/70 uppercase hover:text-white transition-colors"
            >
              Inquire Privately →
            </Link>
            <Link
              href="/cultural-worlds"
              className="font-body text-[0.65rem] tracking-[0.28em] text-white/35 uppercase hover:text-white/60 transition-colors"
            >
              Back to Cultural Worlds
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
