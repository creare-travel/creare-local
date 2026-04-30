import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LAB™ — Experimental Experiences',
  description:
    'Co-created, dynamic and exploratory. CREARE LAB™ is where cultural experiences are designed from scratch — open-ended, experimental, and built around your brief.',
  alternates: {
    canonical: 'https://crearetravel.com/experiences/lab',
    languages: {
      en: 'https://crearetravel.com/experiences/lab',
      tr: 'https://crearetravel.com/experiences/lab',
      ru: 'https://crearetravel.com/experiences/lab',
      zh: 'https://crearetravel.com/experiences/lab',
      'x-default': 'https://crearetravel.com/experiences/lab',
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CREARE LAB™ — Experimental Experiences',
    description: 'Co-created, dynamic and exploratory. Built around your brief.',
    url: 'https://crearetravel.com/experiences/lab',
  },
};

interface StrapiCoverImage {
  url?: string;
  alternativeText?: string;
  formats?: {
    medium?: { url?: string };
    small?: { url?: string };
  };
}

interface StrapiExperience {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  short_description?: string;
  category?: string;
  location_label?: string;
  duration?: string;
  destination?: {
    name?: string;
    slug?: string;
  };
  cover_image?: StrapiCoverImage | null;
}

async function fetchLabExperiences(): Promise<StrapiExperience[]> {
  try {
    const json = await fetchStrapi('/api/experiences?filters[category][$eqi]=lab&populate=*');
    const items: StrapiExperience[] = Array.isArray(json?.data) ? json.data : [];
    return items;
  } catch (error) {
    console.error('Failed to fetch LAB experiences from Strapi.', error);
    return [];
  }
}

export default async function LabPage() {
  const labExperiences = await fetchLabExperiences();

  return (
    <>
      <main>
        {/* ── HERO — Split Layout ── */}
        <section
          className="relative w-full min-h-screen flex flex-col lg:flex-row"
          aria-label="CREARE LAB™ hero"
        >
          {/* Left — Content */}
          <div className="relative z-10 flex flex-col justify-center bg-[#EDEAE4] w-full lg:w-1/2 px-8 sm:px-12 lg:px-16 xl:px-20 py-24 lg:py-0 min-h-[60vh] lg:min-h-screen">
            <p className="font-body text-[0.6rem] tracking-[0.35em] text-neutral-500 uppercase mb-8">
              CREARE LAB™
            </p>
            <h1
              className="font-display font-light text-neutral-900 leading-tight mb-10"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}
            >
              Every experience
              <br />
              begins with
              <br />a question.
            </h1>
            <div className="flex flex-col gap-0 mb-12 max-w-sm">
              <p className="font-body font-light text-neutral-700 text-sm leading-loose">
                LAB™ is not a catalogue. It is a process.
              </p>
              <p className="font-body font-light text-neutral-600 text-sm leading-loose">
                Built around your brief. Shaped through collaboration.
              </p>
              <p className="font-body font-light text-neutral-500 text-sm leading-loose">
                No predefined paths. Only what needs to exist.
              </p>
            </div>
            <div className="flex flex-col items-start gap-6">
              <Link
                href="/contact?exp=lab"
                className="font-body text-[0.65rem] tracking-[0.3em] text-neutral-900 uppercase border border-neutral-900 px-8 py-4 hover:bg-neutral-900 hover:text-white transition-all duration-300"
              >
                DESIGN YOUR EXPERIENCE
              </Link>
              <div className="flex flex-col items-center gap-2 mt-4">
                <span className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-400 uppercase">
                  DISCOVER ↓
                </span>
              </div>
            </div>
          </div>

          {/* Right — Full-bleed image */}
          <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen overflow-hidden">
            <Image
              src="https://img.rocket.new/generatedImages/rocket_gen_img_137ddd9e4-1772074857584.png"
              alt="Creative studio workspace with natural light and collaborative surfaces representing the LAB experimental approach"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </section>

        {/* ── BREADCRUMB + INTRO ── */}
        <section className="bg-[#EDEAE4] py-20 md:py-28" aria-label="Introduction">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <nav className="mb-14" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href="/"
                    className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-500 uppercase hover:text-neutral-800 transition-colors"
                  >
                    ← HOME
                  </Link>
                </li>
                <li aria-hidden="true">
                  <span className="font-body text-[0.6rem] text-neutral-400 mx-1">/</span>
                </li>
                <li>
                  <span className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-800 uppercase">
                    LAB™
                  </span>
                </li>
              </ol>
            </nav>

            <div className="max-w-2xl mx-auto text-center">
              <p
                className="font-display font-light text-neutral-800 leading-relaxed"
                style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.5rem)' }}
              >
                LAB™ is not a catalogue. It is a process — open, collaborative and driven by your
                brief. We compose from the ground up, combining cultural intelligence with creative
                intention to produce experiences that have never existed before.
              </p>
              <p className="font-body font-light text-neutral-500 text-sm leading-relaxed mt-6">
                Our LAB™ process has been applied across the cultural worlds of{' '}
                <Link
                  href="/cultural-worlds/istanbul"
                  className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
                >
                  Istanbul
                </Link>
                ,{' '}
                <Link
                  href="/cultural-worlds/bodrum"
                  className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
                >
                  Bodrum
                </Link>
                , and{' '}
                <Link
                  href="/cultural-worlds/cappadocia"
                  className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
                >
                  Cappadocia
                </Link>{' '}
                — each composition shaped by the specific character of its place.
              </p>
            </div>
          </div>
        </section>

        {/* ── OUR APPROACH — 3 Columns ── */}
        <section className="bg-white py-24 md:py-36" aria-label="Our Approach">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                PHILOSOPHY
              </p>
              <h2
                className="font-display font-light text-neutral-900"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Our Approach
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
              {[
                {
                  label: 'Clarity',
                  body: 'Understanding before shaping.',
                },
                {
                  label: 'Structure',
                  body: 'Giving form to the intangible.',
                },
                {
                  label: 'Control',
                  body: 'Precision without rigidity.',
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-5">
                    {item.label}
                  </p>
                  <div className="w-8 h-px bg-neutral-300 mb-8" />
                  <p
                    className="font-display font-light text-neutral-700 leading-relaxed"
                    style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)' }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COLLABORATIONS — Split ── */}
        <section className="bg-[#EDEAE4] py-20 md:py-28" aria-label="Collaborations">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
                  CREARE LAB™ FOR BRANDS
                </p>
                <h2
                  className="font-display font-light text-neutral-900 leading-tight mb-10"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
                >
                  Collaborations
                </h2>
                <p className="font-body text-sm text-neutral-600 leading-relaxed mb-6">
                  LAB™ works with brands to compose cultural experiences built around a shared
                  intention — from leadership retreats to product launches, from team immersions to
                  client encounters.
                </p>
                <p className="font-body text-sm text-neutral-500 leading-relaxed mb-12">
                  Each collaboration is shaped with your team. We bring the cultural context,
                  creative direction and compositional intelligence. You bring the narrative.
                </p>
                <Link
                  href="/contact?exp=lab"
                  className="font-body text-[0.65rem] tracking-[0.3em] text-neutral-900 uppercase border-b border-neutral-400 pb-1 hover:border-neutral-900 transition-colors duration-300"
                >
                  START A CONVERSATION →
                </Link>
              </div>

              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_1c4822a6f-1775494720024.png"
                  alt="Corporate team engaged in a structured creative workshop in a contemporary cultural space"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── EMOTIONAL PAUSE ── */}
        <section className="bg-white py-20 md:py-28" aria-label="Emotional pause">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p
              className="font-display font-light text-neutral-500 tracking-widest"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', letterSpacing: '0.18em' }}
            >
              Nothing is selected. Everything is composed.
            </p>
          </div>
        </section>

        {labExperiences.length > 0 && (
          <section
            className="bg-white py-24 md:py-32"
            aria-label="LAB experiences from the collection"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="text-center mb-20">
                <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                  FROM THE COLLECTION
                </p>
                <h2
                  className="font-display font-light text-neutral-900"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
                >
                  LAB Experiences
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-x-14 lg:gap-y-24">
                {labExperiences.map((exp) => {
                  const rawUrl =
                    exp.cover_image?.formats?.medium?.url ??
                    exp.cover_image?.formats?.small?.url ??
                    exp.cover_image?.url ??
                    null;
                  const coverUrl = rawUrl ? mediaUrl(rawUrl) : null;
                  const coverAlt = exp.cover_image?.alternativeText ?? exp.title;
                  const location = exp.destination?.name ?? exp.location_label;

                  return (
                    <Link
                      key={exp.id}
                      href={`/experiences/${exp.slug}`}
                      className="group block"
                      aria-label={`View ${exp.title}`}
                    >
                      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] mb-5">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt={coverAlt}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={isLocalAssetUrl(coverUrl)}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200" />
                        )}
                      </div>

                      <p className="font-body text-[0.55rem] tracking-[0.28em] text-neutral-400 uppercase mb-2">
                        {exp.category ?? 'LAB'}
                      </p>
                      <h3
                        className="font-display font-light text-neutral-900 leading-snug mb-2 group-hover:opacity-70 transition-opacity duration-300"
                        style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)' }}
                      >
                        {exp.title}
                      </h3>

                      {location && (
                        <p className="font-body text-[0.7rem] text-neutral-500 mb-2">{location}</p>
                      )}

                      {exp.short_description && (
                        <p className="font-body text-sm text-neutral-500 leading-relaxed">
                          {exp.short_description}
                        </p>
                      )}

                      {exp.duration && (
                        <p className="mt-3 font-body text-xs tracking-wide text-neutral-500 uppercase">
                          {exp.duration}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── PROCESS — 4 Steps ── */}
        <section className="bg-[#EDEAE4] py-28 md:py-44" aria-label="LAB Process">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-24">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                THE JOURNEY
              </p>
              <h2
                className="font-display font-light text-neutral-900"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                The LAB™ Process
              </h2>
            </div>

            {/* Steps — horizontal on large, vertical on small */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {[
                {
                  step: '01',
                  label: 'INTENT',
                  body: 'We begin with your brief. Context and intention are understood before any composition begins.',
                },
                {
                  step: '02',
                  label: 'DESIGN',
                  body: 'Concepts emerge through dialogue — narrative, spatial and experiential dimensions shaped together.',
                },
                {
                  step: '03',
                  label: 'COMPOSITION',
                  body: 'Every material element is assembled with precision — partners, environments, sequences and sensory detail.',
                },
                {
                  step: '04',
                  label: 'EXECUTION',
                  body: 'Delivery is managed end-to-end. Full visibility at every stage. Nothing left to chance.',
                },
              ].map((item, index, arr) => (
                <div key={item.label} className="relative flex flex-col md:flex-row">
                  {/* Step content */}
                  <div className="flex flex-col px-0 md:px-10 pb-20 md:pb-0 first:pl-0 last:pr-0">
                    <span className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-300 uppercase mb-6">
                      {item.step}
                    </span>
                    <p className="font-body text-[0.65rem] tracking-[0.3em] text-neutral-900 uppercase mb-6">
                      {item.label}
                    </p>
                    <div className="w-6 h-px bg-neutral-200 mb-8" />
                    <p className="font-body text-xs text-neutral-500 leading-loose">{item.body}</p>
                  </div>

                  {/* Divider between steps */}
                  {index < arr.length - 1 && (
                    <>
                      {/* Vertical divider on md+ */}
                      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-neutral-200" />
                      {/* Horizontal divider on mobile */}
                      <div className="md:hidden w-full h-px bg-neutral-100 mb-20" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING CTA ── */}
        <section className="bg-[#EDEAE4] py-28 md:py-40" aria-label="Start a conversation">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
            <p
              className="font-display font-light text-neutral-900 leading-snug mb-6"
              style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)' }}
            >
              Behind every seamless experience is a carefully built structure.
            </p>
            <p
              className="font-display font-light text-neutral-600 leading-snug mb-16"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)' }}
            >
              And behind that structure — a process shaped with you.
            </p>

            <Link
              href="/contact?exp=lab"
              className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white uppercase bg-neutral-900 px-10 py-5 hover:bg-neutral-700 transition-colors duration-300 mb-10"
            >
              START A CONVERSATION
            </Link>

            <p className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-400 uppercase">
              STRUCTURED COLLABORATION. CONTROLLED EXECUTION.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
