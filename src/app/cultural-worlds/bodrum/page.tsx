import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import CulturalWorldViewTracker from '@/components/CulturalWorldViewTracker';

const SITE_URL = 'https://crearetravel.com';

export const metadata: Metadata = {
  title: 'Bodrum — Cultural World — Creare',
  description:
    "Bodrum is the Aegean coast at its most refined — ancient harbour, Crusader castle, and whitewashed hillside villages holding a quiet sophistication. Discover private cultural access to Turkey's most exclusive coastline.",
  alternates: {
    canonical: `${SITE_URL}/cultural-worlds/bodrum`,
    languages: {
      en: `${SITE_URL}/cultural-worlds/bodrum`,
      tr: `${SITE_URL}/cultural-worlds/bodrum`,
      ru: `${SITE_URL}/cultural-worlds/bodrum`,
      zh: `${SITE_URL}/cultural-worlds/bodrum`,
      'x-default': `${SITE_URL}/cultural-worlds/bodrum`,
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Bodrum — Cultural World — Creare',
    description:
      "Bodrum is the Aegean coast at its most refined. Discover private cultural access to Turkey's most exclusive coastline.",
    url: `${SITE_URL}/cultural-worlds/bodrum`,
    siteName: 'Creare',
    images: [
      {
        url: 'https://img.rocket.new/generatedImages/rocket_gen_img_11a7e18f5-1775589420387.png',
        width: 1200,
        height: 630,
        alt: 'Whitewashed Bodrum houses cascading down a hillside to a turquoise Aegean bay',
      },
    ],

    type: 'website',
  },
};

const placeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: 'Bodrum',
  description:
    "A peninsula on Turkey's Aegean coast where ancient Halicarnassus, Crusader architecture, and contemporary cultural life converge.",
  url: `${SITE_URL}/cultural-worlds/bodrum`,
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1727ad881-1775598258607.png',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.0344,
    longitude: 27.4305,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bodrum',
    addressRegion: 'Muğla',
    addressCountry: 'TR',
  },
};

const touristDestinationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Bodrum — Cultural World',
  description:
    "Private cultural access to Bodrum: ancient Halicarnassus, Crusader castle, private yachts, archaeological sites, and artisan workshops along Turkey's most exclusive Aegean coastline.",
  url: `${SITE_URL}/cultural-worlds/bodrum`,
  image: 'https://images.unsplash.com/photo-1588151272204-2e11d6764f68',
  touristType: [
    'Cultural Traveller',
    'Yacht Charter Guest',
    'Archaeological Enthusiast',
    'Gastronomy Patron',
  ],
  includesAttraction: [
    { '@type': 'TouristAttraction', name: 'Bodrum Castle (Castle of St. Peter)' },
    { '@type': 'TouristAttraction', name: 'Mausoleum at Halicarnassus' },
    { '@type': 'TouristAttraction', name: 'Bodrum Underwater Archaeology Museum' },
    { '@type': 'TouristAttraction', name: 'Private Aegean Yacht Charters' },
    { '@type': 'TouristAttraction', name: 'Artisan Workshops, Bodrum Peninsula' },
  ],
};

export default function BodrumPage() {
  return (
    <>
      <Script id="bodrum-place-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(placeJsonLd)}
      </Script>

      <Script id="bodrum-tourist-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(touristDestinationJsonLd)}
      </Script>

      <CulturalWorldViewTracker location="bodrum" />

      <main className="bg-black min-h-screen">
        {/* ── HERO ── */}
        <section className="relative w-full h-[80vh] min-h-[560px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1588151272204-2e11d6764f68"
              alt="Whitewashed Bodrum houses cascading down a hillside to a turquoise Aegean bay"
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
              Bodrum
            </h1>
            <p className="text-white/50 font-body font-light text-sm mt-4 max-w-md leading-relaxed">
              The Aegean coast at its most refined.
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
                Bodrum
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
                Bodrum is ancient Halicarnassus — birthplace of Herodotus, site of one of the Seven
                Wonders of the Ancient World, and a place whose cultural identity has been shaped by
                successive civilisations across three millennia. The Mausoleum at Halicarnassus,
                built for the Persian satrap Mausolus in the 4th century BC, gave the world the word
                &quot;mausoleum&quot; and established Bodrum as a place of architectural ambition
                and cultural significance long before the Crusaders arrived.
              </p>
              <p>
                The Knights of St. John built their castle here in the 15th century, using stones
                from the Mausoleum itself. That castle — now home to the Museum of Underwater
                Archaeology — stands as one of the best-preserved Crusader fortifications in the
                Mediterranean, its towers flying the flags of the European kingdoms whose knights
                once garrisoned it. The museum within holds treasures recovered from ancient
                shipwrecks in the surrounding waters: Bronze Age cargo, Byzantine glassware, Ottoman
                ceramics.
              </p>
              <p>
                Modern Bodrum carries a different kind of cultural weight. In the mid-20th century,
                the Turkish poet and novelist Cevat Şakir Kabaağaçlı — known as Halikarnas
                Balıkçısı, the Fisherman of Halicarnassus — transformed the town into a gathering
                place for Turkish intellectuals, artists, and writers. His legacy endures in the
                town&rsquo;s literary culture, its bohemian spirit, and its tradition of welcoming
                those who think seriously about the world.
              </p>
              <p>
                Today, Bodrum occupies a unique position in Turkish cultural life: simultaneously a
                destination for the international elite and a place of genuine local character,
                where fishermen still mend nets in the harbour and the weekly market in Turgutreis
                sells produce grown on the peninsula&rsquo;s hillsides.
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
                Beneath Bodrum&rsquo;s reputation as a luxury destination lies a peninsula of
                extraordinary archaeological richness. The ancient city of Halicarnassus extends far
                beyond the visible ruins — beneath the modern town, beneath private gardens, beneath
                the foundations of houses built in the last century. Archaeological surveys have
                identified dozens of significant sites that have never been excavated. The peninsula
                is, in a very real sense, an unread text.
              </p>
              <p>
                The surrounding waters are equally rich. The Aegean seabed around Bodrum holds the
                remains of trading routes that connected the ancient Mediterranean world —
                Phoenician, Greek, Roman, Byzantine, and Ottoman vessels whose cargo tells the story
                of commerce across three thousand years. The Museum of Underwater Archaeology holds
                only a fraction of what has been recovered. Much remains on the seabed, protected by
                Turkish law and accessible only to licensed archaeologists.
              </p>
              <p>
                The peninsula&rsquo;s interior — the villages of Yalıkavak, Türkbükü, Gündoğan, and
                Götürkükü — holds a different kind of hidden layer: a traditional Aegean culture of
                olive cultivation, sponge diving, and boat building that has survived the
                peninsula&rsquo;s transformation into a luxury destination. The families who have
                lived here for generations carry knowledge of the land and sea that no guidebook
                records.
              </p>
              <p>
                The private villas and estates of the peninsula represent another dimension of
                hidden Bodrum — extraordinary properties, many of them designed by significant
                architects, set within olive groves and overlooking private bays. Some of these
                estates have hosted artists, writers, and political figures whose presence has
                shaped the cultural life of the peninsula. Their stories are not public.
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
                Bodrum&rsquo;s gastronomy is rooted in the Aegean tradition — a cuisine of
                extraordinary simplicity and depth, built on olive oil, fresh fish, wild herbs, and
                vegetables grown in the peninsula&rsquo;s fertile soil. The Aegean kitchen is not a
                cuisine of complexity or technique in the French sense. It is a cuisine of quality,
                seasonality, and restraint — where the flavour of a tomato grown in volcanic soil,
                dressed with cold-pressed olive oil from trees that are centuries old, requires
                nothing further.
              </p>
              <p>
                The meyhane culture of Bodrum has its own character, distinct from Istanbul&rsquo;s.
                Here, the ritual of meze — the slow procession of small dishes that precedes the
                main course — is conducted with a particular attention to the sea. Octopus dried in
                the sun and grilled over charcoal. Sea urchin roe served on bread. Smoked mackerel
                with wild thyme. These are not dishes that appear on menus. They are prepared by
                fishermen&rsquo;s wives in small family restaurants that have no signage and no
                reservations system.
              </p>
              <p>
                The olive harvest — which takes place across the peninsula each autumn — is one of
                the great ritual events of the Aegean calendar. Families who have cultivated the
                same trees for generations gather to harvest, press, and taste the new oil. To
                participate in this process — to spend a morning in an olive grove with a family
                whose relationship with the land spans centuries — is to understand something
                essential about the Aegean relationship between people, place, and food.
              </p>
              <p>
                Our{' '}
                <Link
                  href="/experiences/lab"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  LAB™ experiences
                </Link>{' '}
                in Bodrum are built around these living traditions — composing encounters that
                connect guests with the peninsula&rsquo;s food culture at its most authentic and
                least accessible.
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
                Bodrum&rsquo;s private access landscape is defined by the sea. The peninsula&rsquo;s
                coastline — with its dozens of private bays, its ancient anchorages, and its
                extraordinary underwater topography — is best experienced from the water. A private
                gulet, crewed by a captain who has navigated these waters for thirty years, opens a
                dimension of the peninsula that is entirely invisible from the shore.
              </p>
              <p>
                The Museum of Underwater Archaeology within Bodrum Castle can be accessed after
                hours, in the company of the museum&rsquo;s director or a senior archaeologist. To
                walk through the castle&rsquo;s towers at night — past the Bronze Age shipwreck
                cargo, past the Byzantine glassware, past the Ottoman ceramics — without the
                presence of other visitors, is to experience the weight of the Mediterranean&rsquo;s
                history in a way that daylight hours cannot provide.
              </p>
              <p>
                The peninsula&rsquo;s private estates offer another dimension of access. Several of
                the most significant properties — designed by architects of international
                reputation, set within ancient olive groves — are available for private stays
                arranged through Creare. These are not hotels. They are private homes, offered to
                guests of distinction through relationships built over years.
              </p>
              <p>
                For the most rarified encounters — access to private archaeological sites, to family
                collections, to spaces that have never been opened to any outside guest — our{' '}
                <Link
                  href="/experiences/black"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  BLACK™ programme
                </Link>{' '}
                operates at a level beyond our public offerings.
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
                Our approach to Bodrum begins with a refusal. We refuse to treat the peninsula as a
                backdrop for luxury consumption — as a setting for yacht parties and beach clubs
                that could exist anywhere in the Mediterranean. Bodrum is too specific, too
                historically dense, too culturally particular for that kind of approach.
              </p>
              <p>
                Instead, we compose encounters that are rooted in the peninsula&rsquo;s specific
                character: its ancient history, its Aegean food culture, its tradition of
                intellectual life, its relationship with the sea. A Bodrum experience with Creare
                might begin with a private dawn visit to the Mausoleum site, in the company of an
                archaeologist who has spent a career studying Halicarnassus. It might continue on
                the water, anchoring in a bay that has been used as a harbour since the Bronze Age.
                It might end in a family restaurant in a village that has no name on any tourist
                map.
              </p>
              <p>
                What we seek in Bodrum is the same thing we seek everywhere: the moment when a place
                reveals itself — when its history, its culture, and its living present converge in a
                single experience that could not have been planned, only composed. Bodrum,
                approached with the right guides and the right intentions, offers these moments with
                extraordinary generosity.
              </p>
              <p>
                Our{' '}
                <Link
                  href="/experiences/signature"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  Signature Experiences
                </Link>{' '}
                in the Aegean region are designed around this philosophy — each one a composed
                encounter with the peninsula&rsquo;s deepest layers.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── EXPERIENCES IN BODRUM ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="experiences-bodrum"
        >
          <div className="max-w-3xl">
            <h2
              id="experiences-bodrum"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Experiences in Bodrum
            </h2>
            <p className="text-white/65 font-body font-light text-base leading-relaxed mb-16">
              Private experiences in Bodrum are rooted in the peninsula&rsquo;s specific character —
              its ancient harbour, its intellectual tradition, its Aegean food culture, its
              relationship with the sea. Exclusive access to the Mausoleum site at dawn, to the
              Museum of Underwater Archaeology after hours, to private estates set within ancient
              olive groves overlooking bays that have no name on any tourist map. Cultural
              encounters composed for those who understand that Bodrum&rsquo;s depth is inversely
              proportional to its visibility — and that the most extraordinary things here are never
              listed.
            </p>
            <div className="space-y-12">
              <div className="border-t border-white/8 pt-10">
                <p className="font-display font-light text-white text-lg leading-snug mb-2">
                  Halicarnassus at First Light
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  A private dawn visit to the Mausoleum site with an archaeologist who has spent a
                  career studying the ancient city beneath the modern town.
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
                  The Castle After Hours
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  Exclusive access to the Museum of Underwater Archaeology at night — three thousand
                  years of Mediterranean history, without another visitor present.
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
                  Peninsula by Sea
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  A private gulet voyage along the coastline — anchoring in bays accessible only by
                  water, above seabeds that hold the remains of ancient trade.
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
              href="/insights/bodrum-beyond-the-coast-where-the-aegean-slows-down"
              className="font-body text-sm text-white/55 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/20"
            >
              Bodrum Beyond the Coast: Where the Aegean Slows Down
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
              aria-label="Inquire privately about Bodrum experiences"
            >
              Inquire Privately →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
