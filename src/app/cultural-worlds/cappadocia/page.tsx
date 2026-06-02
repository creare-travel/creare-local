import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import CulturalWorldViewTracker from '@/components/CulturalWorldViewTracker';

const SITE_URL = 'https://crearetravel.com';

export const metadata: Metadata = {
  title: 'Cappadocia — Cultural World — Creare',
  description:
    "Cappadocia is ancient landscapes carved by time and fire — underground cities, cave churches, and volcanic formations holding millennia of human history. Discover private cultural access to Turkey's most extraordinary region.",
  alternates: {
    canonical: `${SITE_URL}/cultural-worlds/cappadocia`,
    languages: {
      en: `${SITE_URL}/cultural-worlds/cappadocia`,
      tr: `${SITE_URL}/cultural-worlds/cappadocia`,
      ru: `${SITE_URL}/cultural-worlds/cappadocia`,
      zh: `${SITE_URL}/cultural-worlds/cappadocia`,
      'x-default': `${SITE_URL}/cultural-worlds/cappadocia`,
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Cappadocia — Cultural World — Creare',
    description:
      "Cappadocia: ancient landscapes carved by time and fire. Discover private cultural access to Turkey's most extraordinary region.",
    url: `${SITE_URL}/cultural-worlds/cappadocia`,
    siteName: 'Creare',
    images: [
      {
        url: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d56f4fa1-1776100462678.png',
        width: 1200,
        height: 630,
        alt: 'Hot air balloons drifting over the fairy chimneys and volcanic rock formations of Cappadocia at sunrise',
      },
    ],

    type: 'website',
  },
};

const placeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: 'Cappadocia',
  description:
    'A volcanic landscape in central Anatolia where millennia of erosion have created extraordinary rock formations, and where human civilisation carved underground cities and cave churches into the living rock.',
  url: `${SITE_URL}/cultural-worlds/cappadocia`,
  image: 'https://images.unsplash.com/photo-1733155462024-1e7fa28898e8',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.6431,
    longitude: 34.8289,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Göreme',
    addressRegion: 'Nevşehir',
    addressCountry: 'TR',
  },
};

const touristDestinationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Cappadocia — Cultural World',
  description:
    'Private cultural access to Cappadocia: rock-cut monasteries, underground cities, ceramic ateliers, dawn balloon flights, and the living traditions of central Anatolia.',
  url: `${SITE_URL}/cultural-worlds/cappadocia`,
  image: 'https://images.unsplash.com/photo-1733155462024-1e7fa28898e8',
  touristType: [
    'Cultural Traveller',
    'Archaeological Enthusiast',
    'Photography Patron',
    'Spiritual Seeker',
  ],
  includesAttraction: [
    { '@type': 'TouristAttraction', name: 'Göreme Open Air Museum' },
    { '@type': 'TouristAttraction', name: 'Derinkuyu Underground City' },
    { '@type': 'TouristAttraction', name: 'Ihlara Valley' },
    { '@type': 'TouristAttraction', name: 'Avanos Ceramic Ateliers' },
    { '@type': 'TouristAttraction', name: 'Private Cave Churches, Cappadocia' },
  ],
};

export default function CappadociaPage() {
  return (
    <>
      <Script id="cappadocia-place-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(placeJsonLd)}
      </Script>

      <Script id="cappadocia-tourist-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(touristDestinationJsonLd)}
      </Script>

      <CulturalWorldViewTracker location="cappadocia" />

      <main className="bg-black min-h-screen">
        {/* ── HERO ── */}
        <section className="relative w-full h-[80vh] min-h-[560px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1733155462024-1e7fa28898e8"
              alt="Hot air balloons drifting over the fairy chimneys and volcanic rock formations of Cappadocia at sunrise"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20 w-full">
            <p className="text-white/40 font-body text-xs tracking-[0.2em] uppercase mb-4">
              Cultural Worlds
            </p>
            <h1
              className="font-display font-light text-white leading-tight"
              style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}
            >
              Cappadocia
            </h1>
            <p className="text-white/50 font-body font-light text-sm mt-4 max-w-md leading-relaxed">
              Ancient landscapes carved by time and fire.
            </p>
          </div>
        </section>

        {/* ── BREADCRUMB ── */}
        <nav className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className="text-white/30 font-body text-xs tracking-[0.15em] uppercase hover:text-white/60 transition-colors"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <span className="text-white/20 font-body text-xs mx-1">→</span>
            </li>
            <li>
              <Link
                href="/cultural-worlds"
                className="text-white/30 font-body text-xs tracking-[0.15em] uppercase hover:text-white/60 transition-colors"
              >
                Cultural Worlds
              </Link>
            </li>
            <li aria-hidden="true">
              <span className="text-white/20 font-body text-xs mx-1">→</span>
            </li>
            <li>
              <span className="text-white/60 font-body text-xs tracking-[0.15em] uppercase">
                Cappadocia
              </span>
            </li>
          </ol>
        </nav>

        {/* ── SECTION 1: CULTURAL IDENTITY ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="cultural-identity"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-xs tracking-[0.25em] uppercase mb-5">01</p>
            <h2
              id="cultural-identity"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Cultural Identity
            </h2>
            <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
              <p>
                Cappadocia is one of the world&rsquo;s great landscapes — a place where the
                geological and the human have been in dialogue for so long that it is impossible to
                separate them. The volcanic eruptions of Mount Erciyes and Mount Hasan, millions of
                years ago, deposited layers of soft tuff across the central Anatolian plateau. Wind
                and water carved this material into the extraordinary formations — the fairy
                chimneys, the cone-shaped pinnacles, the deep valleys — that define the
                region&rsquo;s visual identity.
              </p>
              <p>
                Into this landscape, human beings carved their world. The underground cities of
                Derinkuyu and Kaymaklı — extending eight and ten storeys below the surface — were
                built by early Christian communities seeking refuge from successive waves of
                invasion. They are among the most extraordinary feats of human engineering in the
                ancient world: complete cities, with stables, churches, wine cellars, and
                ventilation shafts, capable of housing tens of thousands of people for months at a
                time.
              </p>
              <p>
                Above ground, the same communities carved churches and monasteries into the rock
                faces of the valleys. The Göreme Open Air Museum — a UNESCO World Heritage Site —
                contains some of the finest Byzantine frescoes in existence, painted between the 9th
                and 13th centuries by artists whose names are unknown but whose work has survived a
                thousand years of history. These frescoes are not museum pieces. They are still in
                the places where they were painted, still in the churches where they were meant to
                be seen.
              </p>
              <p>
                Cappadocia&rsquo;s cultural identity is defined by this quality of endurance — the
                sense that the past is not behind you but beneath you, around you, carved into the
                very landscape you inhabit. It is a place that demands a different kind of attention
                than most destinations: slower, more patient, more willing to sit with what cannot
                be immediately understood.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── SECTION 2: HIDDEN LAYERS ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="hidden-layers"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-xs tracking-[0.25em] uppercase mb-5">02</p>
            <h2
              id="hidden-layers"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Hidden Layers
            </h2>
            <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
              <p>
                The Cappadocia that most visitors see is a fraction of what exists. The Göreme Open
                Air Museum, the balloon flights, the cave hotels — these are the surface of a region
                whose depths have barely been mapped. Archaeological surveys conducted in recent
                decades have identified hundreds of rock-cut churches, monasteries, and settlements
                that have never been opened to the public. Some of these spaces contain frescoes in
                better condition than those in the Open Air Museum. They are accessible only through
                formal archaeological partnerships.
              </p>
              <p>
                The underground city system is similarly underexplored. Derinkuyu and Kaymaklı are
                the two cities open to visitors, but archaeologists have identified more than two
                hundred underground settlements across the region. Many of these have never been
                fully excavated. The tunnels that connect them — some extending for kilometres
                beneath the plateau — have not been fully mapped. The underground geography of
                Cappadocia is, in the most literal sense, unknown.
              </p>
              <p>
                The Ihlara Valley — a 14-kilometre canyon carved by the Melendiz River — contains
                more than a hundred rock-cut churches, most of them inaccessible to casual visitors.
                To walk the valley in the company of a Byzantine art historian, stopping at churches
                that are never included in any tour, is to encounter a dimension of Cappadocia that
                most visitors never suspect exists.
              </p>
              <p>
                The living traditions of the region are equally hidden. The ceramic tradition of
                Avanos — which has been practised continuously for four thousand years, using clay
                from the Kızılırmak River — is carried by a small number of master potters whose
                knowledge of the craft is not taught in any school. Access to their workshops, to
                their process, to the knowledge they hold, requires introduction and trust.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── SECTION 3: GASTRONOMY & RITUALS ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="gastronomy"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-xs tracking-[0.25em] uppercase mb-5">03</p>
            <h2
              id="gastronomy"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Gastronomy &amp; Rituals
            </h2>
            <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
              <p>
                Cappadocia&rsquo;s gastronomy is rooted in the Anatolian heartland — a cuisine of
                extraordinary depth and variety, shaped by the region&rsquo;s volcanic soil, its
                harsh winters, its tradition of preservation, and its position at the crossroads of
                trade routes that connected the Mediterranean with Central Asia and the Far East.
                This is not a cuisine of refinement in the Western sense. It is a cuisine of
                necessity transformed into art — of making extraordinary things from the ingredients
                that the land provides.
              </p>
              <p>
                The testi kebab — meat and vegetables slow-cooked in a sealed clay pot, then broken
                open at the table — is Cappadocia&rsquo;s most famous dish, but it is only the most
                visible expression of a much deeper ceramic cooking tradition. The region&rsquo;s
                potters have been making cooking vessels for four thousand years. The relationship
                between the clay of the Kızılırmak River and the food cooked in vessels made from it
                is not metaphorical — it is chemical, affecting the flavour and texture of
                everything prepared within.
              </p>
              <p>
                The wine tradition of Cappadocia is equally ancient. The region&rsquo;s volcanic
                soil produces grapes of extraordinary character — particularly the indigenous
                Öküzgözü and Boğazkere varieties, which have been cultivated here since antiquity.
                The wine cellars carved into the rock beneath Cappadocia&rsquo;s villages are among
                the oldest in the world. A small number of family producers are continuing this
                tradition, making wines that express the specific character of their volcanic
                terroir with a clarity that no other region can replicate.
              </p>
              <p>
                Our{' '}
                <Link
                  href="/experiences/lab"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  LAB™ experiences
                </Link>{' '}
                in Cappadocia engage with these living traditions — composing encounters that
                connect guests with the region&rsquo;s food and wine culture at its most authentic
                and least accessible.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── SECTION 4: PRIVATE ACCESS POTENTIAL ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="private-access"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-xs tracking-[0.25em] uppercase mb-5">04</p>
            <h2
              id="private-access"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Private Access Potential
            </h2>
            <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
              <p>
                Cappadocia&rsquo;s private access landscape is defined by the relationship between
                the Turkish state, the academic archaeological community, and the local families who
                have lived in this landscape for generations. Navigating this landscape requires
                formal cultural partnerships, academic credentials, and the kind of long-term
                relationships that cannot be established on a single visit.
              </p>
              <p>
                The rock-cut churches of the Ihlara Valley and the surrounding region can be
                accessed outside of public hours through arrangements with the local directorate of
                culture. To enter a Byzantine church at dawn — before any other visitor has arrived,
                in the company of a specialist in Byzantine iconography — is to experience the
                frescoes as they were meant to be experienced: in silence, in low light, with the
                full weight of their theological programme available to contemplation.
              </p>
              <p>
                The underground cities offer a different kind of private access. The sections open
                to the public represent a small fraction of the total extent of Derinkuyu and
                Kaymaklı. With the appropriate permissions and the right guides, it is possible to
                access sections of these cities that have not been visited by any tourist — spaces
                that are still in the process of being excavated and documented.
              </p>
              <p>
                For encounters that go beyond what any formal permission can provide — access to
                private collections, to family archives, to spaces that exist entirely outside the
                public cultural infrastructure — our{' '}
                <Link
                  href="/experiences/black"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  BLACK™ programme
                </Link>{' '}
                operates at a level of discretion and depth that our public offerings cannot match.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── SECTION 5: EXPERIENCE PHILOSOPHY ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="experience-philosophy"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-xs tracking-[0.25em] uppercase mb-5">05</p>
            <h2
              id="experience-philosophy"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Experience Philosophy
            </h2>
            <div className="space-y-6 text-white/65 font-body font-light text-base leading-relaxed">
              <p>
                Cappadocia demands a particular kind of experience design. The landscape is so
                visually overwhelming — so immediately spectacular — that it is easy to mistake the
                surface for the substance. The balloon flights, the cave hotels, the sunset
                viewpoints: these are real pleasures, and we do not dismiss them. But they are the
                beginning of Cappadocia, not its depth.
              </p>
              <p>
                Our approach to Cappadocia is built around the concept of geological time — the
                understanding that this landscape was formed over millions of years, that the human
                presence within it spans thousands of years, and that a meaningful encounter with it
                requires a willingness to slow down to the pace of the landscape itself. This is not
                a place for itineraries. It is a place for immersion.
              </p>
              <p>
                A Cappadocia experience with Creare might begin before dawn, in a valley where no
                balloon has ever flown — watching the light change across the fairy chimneys in
                complete silence. It might continue in an underground city section that has never
                been opened to any tourist, in the company of the archaeologist who is currently
                excavating it. It might end in a cave cellar beneath a family vineyard, tasting
                wines made from grapes grown in volcanic soil that has been cultivated for four
                thousand years.
              </p>
              <p>
                Our{' '}
                <Link
                  href="/experiences/signature"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  Signature Experiences
                </Link>{' '}
                in Cappadocia are composed around this philosophy — each one a carefully structured
                encounter with the region&rsquo;s deepest layers, designed for those who understand
                that the most extraordinary experiences are not found but composed.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── EXPERIENCES IN CAPPADOCIA ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="experiences-cappadocia"
        >
          <div className="max-w-3xl">
            <h2
              id="experiences-cappadocia"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Experiences in Cappadocia
            </h2>
            <p className="text-white/65 font-body font-light text-base leading-relaxed mb-16">
              Private experiences in Cappadocia move at the pace of the landscape itself. Exclusive
              access to rock-cut churches that have never been opened to the public, to underground
              city sections still being excavated, to the ceramic ateliers of Avanos where a
              four-thousand-year tradition is carried by a handful of master potters. Cultural
              encounters shaped by geological time — unhurried, unrepeatable, and available only
              through formal cultural partnerships and long-standing relationships. Cappadocia,
              approached this way, is not a spectacle. It is a revelation.
            </p>
            <div className="space-y-12">
              <div className="border-t border-white/8 pt-10">
                <p className="font-display font-light text-white text-lg leading-snug mb-2">
                  Valley Before Dawn
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  A private hour in a valley where no balloon has ever flown — watching the light
                  change across the fairy chimneys in complete silence.
                </p>
                <Link
                  href="/experiences/signature"
                  className="text-white/35 font-body text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
                >
                  → Signature Experiences
                </Link>
              </div>
              <div className="border-t border-white/8 pt-10">
                <p className="font-display font-light text-white text-lg leading-snug mb-2">
                  Underground, Unexcavated
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  Exclusive access to sections of Derinkuyu never opened to visitors — in the
                  company of the archaeologist currently mapping them.
                </p>
                <Link
                  href="/experiences/signature"
                  className="text-white/35 font-body text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
                >
                  → Signature Experiences
                </Link>
              </div>
              <div className="border-t border-white/8 pt-10">
                <p className="font-display font-light text-white text-lg leading-snug mb-2">
                  Volcanic Terroir
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  A private tasting in a cave cellar beneath a family vineyard — wines made from
                  grapes grown in soil cultivated for four thousand years.
                </p>
                <Link
                  href="/experiences/lab"
                  className="text-white/35 font-body text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
                >
                  → LAB™ Experiences
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── FURTHER READING ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-0"
          aria-label="Further reading"
        >
          <div className="max-w-3xl">
            <p className="text-white/30 font-body text-[0.6rem] tracking-[0.22em] uppercase mb-2">
              Further reading
            </p>
            <Link
              href="/insights/cappadocia-without-balloons-a-different-kind-of-silence"
              className="font-body text-sm text-white/55 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/20"
            >
              Cappadocia Without Balloons: A Different Kind of Silence
            </Link>
          </div>
        </section>

        {/* ── AUTHORITY STATEMENT ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-label="Access philosophy"
        >
          <div className="max-w-2xl">
            <p
              className="font-display font-light text-white/80 leading-relaxed mb-3"
              style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)' }}
            >
              Access is not listed.
            </p>
            <p
              className="font-display font-light text-white/80 leading-relaxed mb-6"
              style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)' }}
            >
              It is composed.
            </p>
            <p className="text-white/35 font-body font-light text-sm tracking-wide">
              Each experience begins with a conversation.
            </p>
          </div>
        </section>

        {/* ── CTA BLOCK ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 pb-36"
          aria-label="Private inquiry"
        >
          <div className="border border-white/10 p-12 md:p-16 max-w-2xl">
            <p
              className="font-display font-light text-white/80 leading-relaxed mb-2"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Some experiences are not listed.
            </p>
            <p
              className="font-display font-light text-white/50 leading-relaxed mb-10"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              They are composed.
            </p>
            <Link
              href="/contact"
              className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white/70 uppercase border border-white/20 px-8 py-4 hover:border-white/50 hover:text-white transition-all duration-300"
              aria-label="Inquire privately about Cappadocia experiences"
            >
              Inquire Privately →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
