import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import CulturalWorldViewTracker from '@/components/CulturalWorldViewTracker';

const SITE_URL = 'https://crearetravel.com';

export const metadata: Metadata = {
  title: 'Istanbul — Cultural World — Creare',
  description:
    'Istanbul is not a destination — it is a civilisation in motion. Discover the cultural layers of the city where East meets West: Byzantine mosaics, Ottoman palaces, Sufi lodges, and a living gastronomy shaped by centuries of empire.',
  alternates: {
    canonical: `${SITE_URL}/cultural-worlds/istanbul`,
    languages: {
      en: `${SITE_URL}/cultural-worlds/istanbul`,
      tr: `${SITE_URL}/cultural-worlds/istanbul`,
      ru: `${SITE_URL}/cultural-worlds/istanbul`,
      zh: `${SITE_URL}/cultural-worlds/istanbul`,
      'x-default': `${SITE_URL}/cultural-worlds/istanbul`,
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Istanbul — Cultural World — Creare',
    description:
      'Istanbul is not a destination — it is a civilisation in motion. Discover the cultural layers of the city where East meets West.',
    url: `${SITE_URL}/cultural-worlds/istanbul`,
    siteName: 'Creare',
    images: [
      {
        url: 'https://img.rocket.new/generatedImages/rocket_gen_img_11a7e18f5-1775589420387.png',
        width: 1200,
        height: 630,
        alt: 'Istanbul skyline at dusk with the Bosphorus strait and minarets silhouetted against an orange sky',
      },
    ],

    type: 'website',
  },
};

const placeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: 'Istanbul',
  description:
    'A city of 15 million where Byzantine, Ottoman and contemporary cultures converge across two continents.',
  url: `${SITE_URL}/cultural-worlds/istanbul`,
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19d22257f-1775598259355.png',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.0082,
    longitude: 28.9784,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Istanbul',
    addressCountry: 'TR',
  },
};

const touristDestinationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Istanbul — Cultural World',
  description:
    'Private cultural access to Istanbul: Byzantine mosaics, Ottoman palaces, Sufi lodges, private collections, and a living gastronomy shaped by centuries of empire.',
  url: `${SITE_URL}/cultural-worlds/istanbul`,
  image: 'https://images.unsplash.com/photo-1687464757833-24cf1730aea5',
  touristType: ['Cultural Traveller', 'Art Collector', 'Gastronomy Enthusiast', 'History Patron'],
  includesAttraction: [
    { '@type': 'TouristAttraction', name: 'Beylerbeyi Palace' },
    { '@type': 'TouristAttraction', name: 'Grand Bazaar Private Hans' },
    { '@type': 'TouristAttraction', name: 'Bosphorus Private Vessel' },
    { '@type': 'TouristAttraction', name: 'Byzantine Cisterns' },
    { '@type': 'TouristAttraction', name: 'Contemporary Art Studios, Beyoğlu' },
  ],
};

export default function IstanbulPage() {
  return (
    <>
      <Script id="istanbul-place-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(placeJsonLd)}
      </Script>

      <Script id="istanbul-tourist-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(touristDestinationJsonLd)}
      </Script>

      <CulturalWorldViewTracker location="istanbul" />

      <main className="bg-black min-h-screen">
        {/* ── HERO ── */}
        <section className="relative w-full h-[90vh] min-h-[620px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1687464757833-24cf1730aea5"
              alt="Istanbul skyline at dusk with the Bosphorus strait and minarets silhouetted against an orange sky"
              fill
              priority
              className="object-cover hero-img-zoom"
              sizes="100vw"
            />

            {/* Stronger gradient for cinematic contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            {/* Subtle vignette on sides */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-24 w-full">
            <p className="hero-label text-white/50 font-body text-[0.6rem] tracking-[0.35em] uppercase mb-6">
              Cultural Worlds
            </p>
            <h1
              className="hero-title-lg font-display font-light text-white leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(4rem, 9vw, 9rem)' }}
            >
              Istanbul
            </h1>
            <p className="hero-subtitle text-white/60 font-body font-light text-base mt-6 max-w-sm leading-relaxed tracking-wide">
              Where East meets West in perpetual conversation.
            </p>
          </div>
        </section>

        {/* ── THE EXPERIENCE — STORYTELLING ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-20"
          aria-labelledby="the-experience"
        >
          <div className="max-w-2xl">
            <p className="text-white/25 font-body text-[0.6rem] tracking-[0.35em] uppercase mb-8">
              The Experience
            </p>
            <h2
              id="the-experience"
              className="font-display font-light text-white leading-tight mb-14"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
            >
              A city that does not reveal itself — it discloses.
            </h2>
            <div
              className="space-y-10 text-white/60 font-body font-light text-base"
              style={{ lineHeight: '2' }}
            >
              <p>
                Istanbul is not encountered — it is entered. The city operates on a logic of gradual
                disclosure: the more time you give it, the more it returns. Its streets do not lead
                to monuments; they lead to thresholds. Behind each one, a different century, a
                different civilisation, a different understanding of what it means to inhabit a
                place for three thousand years.
              </p>
              <p>
                To experience Istanbul with Creare is to move through the city at the pace of
                comprehension rather than consumption. We do not arrange visits — we compose
                sequences. A morning in a Byzantine cistern with the archaeologist who mapped it. An
                afternoon in a private han in the Grand Bazaar, with a fifth-generation merchant
                whose family has traded here since the reign of Suleiman the Magnificent. An evening
                in a Bosphorus yalı, where the library holds manuscripts that have never been
                catalogued.
              </p>
              <p>
                What remains after these encounters is not a collection of memories but a shift in
                orientation — a new way of reading cities, of understanding depth, of recognising
                the difference between access and presence. Istanbul, experienced this way, does not
                end when you leave. It continues to unfold.
              </p>
            </div>
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
                Istanbul
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
                Istanbul is not a city that can be understood in a single visit. It is a palimpsest
                — a surface written upon and rewritten across three thousand years of continuous
                civilisation. Roman, Byzantine, Ottoman, and Republican layers coexist here not as
                museum exhibits but as living architecture, spoken language, and daily ritual.
              </p>
              <p>
                The city sits across two continents, its European and Asian shores connected by the
                Bosphorus strait — one of the world&rsquo;s most strategically significant
                waterways. This geography has shaped everything: the temperament of its people, the
                complexity of its cuisine, the layered nature of its cultural identity. Istanbul is
                simultaneously Mediterranean and Middle Eastern, Balkan and Anatolian, ancient and
                urgently contemporary.
              </p>
              <p>
                What distinguishes Istanbul from other great cities is the density of its cultural
                inheritance. Within a single neighbourhood — Sultanahmet, Beyoğlu, Balat, Karaköy —
                centuries of architectural ambition stand in direct conversation. A Byzantine
                cistern beneath a modern café. A Sephardic synagogue beside an Ottoman mosque. A
                contemporary art gallery housed in a 19th-century han. This is not contrast — it is
                continuity.
              </p>
              <p>
                For those who seek cultural depth rather than surface spectacle, Istanbul rewards
                patience and access. The city&rsquo;s most extraordinary spaces are not on any
                public itinerary. They are known only through relationships — with curators,
                historians, collectors, and the families who have stewarded these places across
                generations.
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
                Beneath the surface of Istanbul&rsquo;s famous landmarks lies a city that most
                visitors never encounter. The Byzantine underground — cisterns, tunnels, and
                subterranean churches — extends for kilometres beneath the historic peninsula. Some
                of these spaces have never been opened to the public. Others require formal cultural
                partnerships to access.
              </p>
              <p>
                The Sufi lodges — tekkes — that once defined the spiritual geography of the city
                were officially closed in 1925. Yet the traditions they housed did not disappear.
                They moved inward, into private homes and family lineages. Today, a small number of
                these communities still gather, still practice, still transmit. Access to these
                gatherings is not available through any tourism channel. It is a matter of trust,
                built over years.
              </p>
              <p>
                The private collections of Istanbul are among the most significant in the world —
                Ottoman manuscripts, Byzantine icons, Anatolian textiles, and contemporary Turkish
                art assembled by families whose cultural patronage spans centuries. These
                collections are never publicly exhibited. They exist in private apartments, in
                converted hans, in family yalıs along the Bosphorus. Our{' '}
                <Link
                  href="/experiences/signature"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  Signature Experiences
                </Link>{' '}
                provide access to a curated selection of these spaces.
              </p>
              <p>
                The Grand Bazaar, too, has its hidden geography. Beyond the tourist corridors lie
                private hans — covered courtyards that have operated as trading spaces since the
                15th century. Here, fifth-generation merchants deal in antique maps, rare textiles,
                and objects whose provenance spans continents. These spaces are not listed. They are
                found.
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
                Istanbul&rsquo;s culinary tradition is one of the world&rsquo;s great unacknowledged
                gastronomies. The Ottoman imperial kitchen — which fed thousands daily in the
                Topkapı Palace complex — developed a cuisine of extraordinary sophistication: dishes
                layered with spice, technique, and symbolic meaning. Many of these recipes were
                never written down. They were transmitted orally, from palace cook to apprentice,
                across generations.
              </p>
              <p>
                Today, a small number of chefs and culinary researchers are engaged in the
                archaeology of this tradition — reconstructing dishes from 16th-century palace
                manuscripts, working with historians and botanists to identify forgotten
                ingredients. Our{' '}
                <Link
                  href="/experiences/lab"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  LAB™ experiences
                </Link>{' '}
                engage directly with this research, offering private culinary encounters that go far
                beyond conventional dining.
              </p>
              <p>
                The ritual dimension of Istanbul&rsquo;s food culture is equally significant. The
                meyhane — the traditional tavern — is not merely a restaurant. It is a social
                institution, a space for conversation, music, and the slow consumption of meze over
                hours. The simit seller on the Galata Bridge, the börek maker in Karaköy, the spice
                merchant in the Egyptian Bazaar — each is a custodian of a living tradition that
                predates the city&rsquo;s modern identity.
              </p>
              <p>
                Coffee, too, carries ritual weight in Istanbul. Turkish coffee is not a beverage —
                it is a ceremony, a medium for conversation, a practice of hospitality that has been
                recognised by UNESCO as an Intangible Cultural Heritage. To drink coffee in a
                private home in Istanbul, prepared by someone who learned the practice from their
                grandmother, is to participate in something that no café can replicate.
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
                Istanbul&rsquo;s private access landscape is unparalleled. The city&rsquo;s cultural
                institutions — its palaces, its mosques, its libraries, its private collections —
                are governed by a complex web of relationships between the state, religious
                foundations, and private families. Navigating this landscape requires years of
                relationship-building and a deep understanding of the cultural protocols involved.
              </p>
              <p>
                Beylerbeyi Palace, the summer residence of the Ottoman sultans on the Asian shore of
                the Bosphorus, can be accessed after closing hours through a formal cultural
                partnership with the Turkish Ministry of Culture and Tourism. The experience of
                dining in the Sultan&rsquo;s private chambers — in rooms that have not been open to
                the public since 1869 — is available exclusively through Creare.
              </p>
              <p>
                The yalıs — the historic waterfront mansions along the Bosphorus — represent another
                dimension of private access. Many of these extraordinary buildings remain in the
                hands of the families who built them in the 18th and 19th centuries. A small number
                of these families are willing to receive guests of distinction, to share their
                libraries, their collections, and their family histories. These encounters cannot be
                booked. They must be arranged.
              </p>
              <p>
                For those seeking the most rarified access, our{' '}
                <Link
                  href="/experiences/black"
                  className="text-white/80 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
                >
                  BLACK™ programme
                </Link>{' '}
                operates at a level beyond our public offerings — arranging encounters that are
                never listed, never advertised, and available only through private consultation.
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
                Our approach to Istanbul is not curatorial in the conventional sense. We do not
                assemble a list of the city&rsquo;s greatest monuments and arrange private access to
                them. We compose encounters — sequences of experience that reveal the city&rsquo;s
                deeper logic, its hidden connections, its living traditions.
              </p>
              <p>
                An Istanbul experience with Creare might begin at dawn on the roof of the
                Süleymaniye Mosque complex, watching the city wake across the Golden Horn. It might
                continue in a private Byzantine cistern, in the company of an archaeologist who has
                spent twenty years mapping the city&rsquo;s underground. It might end in a private
                apartment in Beyoğlu, where a collector shares the story of a single painting over
                dinner.
              </p>
              <p>
                What connects these moments is not geography but intention. Each element is chosen
                for its capacity to reveal something essential about the city — something that
                cannot be found in any guidebook, accessed through any tour operator, or replicated
                in any other context. Istanbul, experienced this way, is not a destination. It is a
                state of understanding.
              </p>
              <p>
                We work with a small number of guests each year. Every encounter is composed
                individually, in response to the specific interests, sensibilities, and intentions
                of those we work with. Istanbul rewards this approach more than almost any other
                city in the world — because its depths are inexhaustible, and its custodians are
                generous to those who approach with genuine curiosity.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="w-full h-px bg-white/8" />
        </div>

        {/* ── EXPERIENCES IN ISTANBUL ── */}
        <section
          className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
          aria-labelledby="experiences-istanbul"
        >
          <div className="max-w-3xl">
            <h2
              id="experiences-istanbul"
              className="font-display font-light text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Experiences in Istanbul
            </h2>
            <p className="text-white/65 font-body font-light text-base leading-relaxed mb-16">
              Private experiences in Istanbul are not assembled from a catalogue. They are composed
              — each one shaped around the specific cultural intentions of those we work with.
              Exclusive access to the city&rsquo;s most guarded spaces: the private yalıs of the
              Bosphorus, the Sufi lodges of the old city, the Ottoman manuscript collections held in
              family hands for centuries. These are cultural encounters of the rarest kind —
              intimate, unrepeatable, and available only through introduction. Istanbul rewards
              those who seek depth over spectacle with a generosity proportional to the civilisation
              it holds.
            </p>
            <div className="space-y-12">
              <div className="border-t border-white/8 pt-10">
                <p className="font-display font-light text-white text-lg leading-snug mb-2">
                  Private Ottoman Dining
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  An intimate evening shaped around ritual and memory, in a private residence whose
                  culinary tradition predates the Republic.
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
                  Bosphorus at Dawn
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  A private vessel on the strait at first light — the city&rsquo;s two continents in
                  silence, the minarets emerging from mist.
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
                  Byzantine Underground
                </p>
                <p className="text-white/50 font-body font-light text-sm leading-relaxed mb-4">
                  Exclusive access to cisterns and subterranean spaces beneath the historic
                  peninsula, guided by an archaeologist of twenty years&rsquo; standing.
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
              href="/insights/private-experiences-istanbul-what-access-really-means"
              className="font-body text-sm text-white/55 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/20"
            >
              Private Experiences in Istanbul: What Access Really Means
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
            <p className="text-white/30 font-body text-[0.6rem] tracking-[0.25em] uppercase mb-6">
              By introduction only
            </p>
            <p
              className="font-display font-light text-white/80 leading-relaxed mb-2"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              Access is limited.
            </p>
            <p
              className="font-display font-light text-white/50 leading-relaxed mb-3"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              We compose a small number of Istanbul encounters each season.
            </p>
            <p className="text-white/30 font-body font-light text-sm leading-relaxed mb-10">
              Availability for the current season is nearly full.
            </p>
            <Link
              href="/contact"
              className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white/70 uppercase border border-white/20 px-8 py-4 hover:border-white/50 hover:text-white transition-all duration-300"
              aria-label="Begin a private conversation about Istanbul"
            >
              Begin a Private Conversation →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
