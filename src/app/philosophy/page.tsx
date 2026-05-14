import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { buildPhilosophyPageGraph } from '@/lib/schema-builder';
import { buildMetadataAlternates } from '@/lib/seo';

const SITE_URL = 'https://crearetravel.com';
const OG_IMAGE = `${SITE_URL}/og/default.jpg`;

export const metadata: Metadata = {
  title: 'Philosophy',
  description:
    'The Creare philosophy. Why we exist, how we think, and what we believe about the nature of experience.',
  alternates: buildMetadataAlternates('/philosophy'),
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Philosophy — Creare',
    description:
      'The Creare philosophy. Why we exist, how we think, and what we believe about the nature of experience.',
    url: `${SITE_URL}/philosophy`,
    siteName: 'Creare',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Creare Philosophy — Experiences Composed as Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Philosophy — Creare',
    description:
      'The Creare philosophy. Why we exist, how we think, and what we believe about the nature of experience.',
    images: [OG_IMAGE],
  },
};

export default function PhilosophyPage() {
  const philosophySchema = buildPhilosophyPageGraph();

  return (
    <main className="bg-black min-h-screen">
      <JsonLd id="philosophy-page-jsonld" schema={philosophySchema} />
      {/* Opening Statement */}
      <section className="flex min-h-[86vh] items-center px-8 sm:min-h-[92vh] sm:px-16 lg:min-h-screen lg:px-24">
        <div className="max-w-[680px]">
          <p className="mb-12 font-body text-[0.7rem] uppercase tracking-[0.22em] text-white/15">
            Creare / Philosophy
          </p>
          <h1 className="font-display font-light leading-[1.18] text-white text-[clamp(2rem,4.6vw,4.4rem)]">
            We believe that the most
            <br />
            extraordinary experiences
            <br />
            cannot be purchased.
            <br />
            <span className="text-white/60">They can only be composed.</span>
          </h1>
        </div>
      </section>

      {/* Manifesto Sections */}
      <section className="mx-auto max-w-[660px] px-8 pb-40 sm:px-16 lg:px-0">
        <div className="flex flex-col gap-32">
          {/* 01 — Against the Itinerary */}
          <div>
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              01
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Against the Itinerary
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>
                The industry has spent decades perfecting the itinerary — a pre-packaged sequence of
                sights, meals, and transfers.
              </p>
              <p>It moves people through places without ever letting them arrive.</p>
              <p>We are not in that business.</p>
              <p>
                Creare creates the conditions for genuine encounter — between a person and a place,
                a guest and a cultural world, a moment and its full meaning.
              </p>
            </div>
          </div>

          {/* 02 — The Composition */}
          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              02
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              The Composition
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>We use the word &ldquo;compose&rdquo; deliberately.</p>
              <p>A composer creates emotion — not sequences.</p>
              <p>They understand silence and sound, anticipation and arrival.</p>
              <p>We work the same way.</p>
              <p className="leading-[2.4]">
                The best experience is not the most expensive, nor the most exclusive —<br />
                it is the one that arrives at the right moment,
                <br />
                in the right form,
                <br />
                for the right person.
              </p>
            </div>
          </div>

          {/* 03 — Access as Responsibility */}
          <div className="border-t border-white/6 pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              03
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              Access as Responsibility
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>Access is not a commodity. It is a trust.</p>
              <p>
                Extended to us by those who open their doors —{' '}
                <span className="text-white/80 italic">not for exposure, but for alignment.</span>
              </p>
              <p>We take that trust seriously.</p>
              <p>
                Every experience is designed to leave a place better than we found it —<br />
                to deepen the relationship between people and culture,{' '}
                <span className="block mt-4">never to extract from it.</span>
              </p>
            </div>
          </div>

          {/* 04 — The Client */}
          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              04
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              The Client
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>We work with a small number of clients each year.</p>
              <p>Genuine composition requires attention — and attention cannot be scaled.</p>
              <p>Our clients have seen the world.</p>
              <p>They are ready to encounter it differently.</p>
              <p className="leading-[2.4]">
                Curious.
                <br />
                Discerning.
                <br />
                Open to being surprised.
              </p>
              <p>
                They understand that the best experiences begin with a conversation —{' '}
                <span className="block mt-4 text-white/40">not a catalogue.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-white/6 py-28 px-8 sm:px-16 lg:px-24">
        <div className="max-w-[660px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
          <p className="font-display font-light text-white leading-tight text-[clamp(1.5rem,3vw,2.5rem)]">
            If this resonates,
            <br />
            <span className="text-white/40">we should talk.</span>
          </p>
          <Link href="/contact" className="btn-ghost flex-shrink-0">
            Begin the Conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
