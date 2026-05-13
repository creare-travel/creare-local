export interface Experience {
  title: string;
  slug: string;
  category: string;
  location: string;
  duration: string;
  groupSize: string;
  heroImage: string;
  heroImageAlt: string;
  heroHeadline?: string;
  heroMetaLine?: string;
  intro: string;
  program: string[];
  venue: string;
  venueDescription: string;
  audience: string[];
  relatedSlugs?: string[];
  series?: string;
  seoTitle?: string;
  seoDescription?: string;
  culturalWorld?: string;
  ctaLabel?: string;
  ctaSubtext?: string;
  trustStatement?: string;
}

export const experiences: Experience[] = [
  {
    title: "Floating Salon d'Opera™",
    slug: 'floating-salon-d-opera',
    category: 'SIGNATURE',
    location: 'Bosphorus, Istanbul',
    duration: '4 Hours',
    groupSize: 'Up to 16 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_143420af4-1775491296696.png',
    heroImageAlt: 'Opulent chandelier-lit salon aboard a private vessel on the Bosphorus at dusk',
    intro:
      'An intimate opera performance staged aboard a private vessel drifting along the Bosphorus. The water becomes the stage, the city the backdrop, and the music the architecture of the evening.',
    program: [
      'Private boarding at the historic Kabataş pier',
      'Welcome reception with curated Anatolian wines',
      'Chamber opera performance by resident soloists',
      'Dinner course served between acts',
      'Bosphorus night passage under the bridges',
      'Farewell with handcrafted programme booklet',
    ],

    venue:
      "A privately commissioned vessel fitted with acoustic panels and intimate seating for sixteen. The programme changes seasonally, always featuring works with a connection to Istanbul's cultural memory.",
    venueDescription: 'Private Vessel — Bosphorus, Istanbul',
    audience: [
      'Music patrons and cultural connoisseurs',
      'Private groups marking significant occasions',
      'Those who seek performance in unexpected settings',
    ],

    relatedSlugs: ['beylerbeyi-1869', 'curated-art-salon'],
    seoTitle: "Floating Salon d'Opera™ — Private Opera Performance on the Bosphorus",
    seoDescription:
      "Experience an intimate chamber opera performance aboard a private vessel on the Bosphorus. Curated wines, live music, and dinner under Istanbul's illuminated bridges.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Beylerbeyi 1869™',
    slug: 'beylerbeyi-1869',
    category: 'SIGNATURE',
    location: 'Beylerbeyi, Istanbul',
    duration: '5 Hours',
    groupSize: 'Up to 12 Guests',
    heroImage: 'https://images.unsplash.com/photo-1637156620944-a0609ba4b028',
    heroImageAlt:
      'Grand Ottoman palace interior with ornate gilded ceilings and crystal chandeliers',
    intro:
      'An evening within the private chambers of Beylerbeyi Palace, the summer residence of the Ottoman sultans. Dinner is served in rooms that have not been open to the public since 1869.',
    program: [
      'Private arrival by boat from the European shore',
      'Exclusive access to the ceremonial halls after closing',
      'Cultural briefing with palace historian',
      "Five-course dinner in the Sultan's dining room",
      'Private tour of the imperial gardens by lantern light',
      'Departure by private launch',
    ],

    venue:
      'Beylerbeyi Palace, constructed in 1865 on the Asian shore of the Bosphorus. Access is arranged through a formal cultural partnership with the Turkish Ministry of Culture and Tourism.',
    venueDescription: 'Beylerbeyi Palace — Asian Shore, Istanbul',
    audience: [
      'Discerning travellers seeking historical depth',
      'Private groups celebrating significant milestones',
      'Cultural patrons and collectors',
    ],

    relatedSlugs: ['floating-salon-d-opera', 'imperial-flavors'],
    seoTitle: 'Beylerbeyi 1869™ — Private Ottoman Palace Dinner Experience',
    seoDescription:
      'Dine in the private chambers of Beylerbeyi Palace. Exclusive access to Ottoman imperial rooms with historian-led cultural briefing.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Imperial Flavors™',
    slug: 'imperial-flavors',
    category: 'SIGNATURE',
    location: 'Istanbul, Turkey',
    duration: '3 Hours',
    groupSize: 'Up to 10 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1997d2f02-1772057414790.png',
    heroImageAlt:
      'Elegantly plated Ottoman-inspired cuisine on fine porcelain in a candlelit historic setting',
    intro:
      'A culinary journey through the Ottoman imperial kitchen tradition. Dishes reconstructed from 16th-century palace manuscripts, prepared by a chef trained in both classical French technique and Anatolian heritage.',
    program: [
      'Welcome at a private kitchen in the Fatih district',
      'Introduction to Ottoman culinary manuscripts',
      'Hands-on preparation of three heritage dishes',
      'Seated tasting with wine and sherbet pairings',
      'Departure with a curated spice collection',
    ],

    venue:
      'A restored 19th-century konağ in the Fatih district, operating as a private culinary research space. The kitchen is equipped with both traditional hearths and contemporary equipment.',
    venueDescription: 'Private Culinary Atelier — Fatih, Istanbul',
    audience: [
      'Food culture enthusiasts and culinary professionals',
      'Those interested in the archaeology of taste',
      'Private groups seeking immersive cultural experiences',
    ],

    relatedSlugs: ['beylerbeyi-1869', 'istanbul-through-the-lens'],
    seoTitle: 'Imperial Flavors™ — Ottoman Culinary Heritage Experience',
    seoDescription:
      'A culinary journey through the Ottoman imperial kitchen tradition. Dishes reconstructed from 16th-century palace manuscripts, prepared by a chef trained in both classical French technique and Anatolian heritage.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Istanbul Through the Lens™',
    slug: 'istanbul-through-the-lens',
    category: 'SIGNATURE',
    location: 'Istanbul, Turkey',
    duration: 'Full Day',
    groupSize: 'Up to 6 Guests',
    heroImage: 'https://images.unsplash.com/photo-1709963681928-0a3c0a46d4a0',
    heroImageAlt:
      'Atmospheric view of Istanbul skyline with minarets and Bosphorus at golden hour through a camera lens perspective',
    intro:
      "A private photographic journey through the layers of Istanbul — from the Byzantine underground to the rooftops of Beyoğlu. Led by a documentary photographer with twenty years of access to the city's hidden spaces.",
    program: [
      'Dawn session at the Süleymaniye rooftop terrace',
      'Access to a private Byzantine cistern not open to the public',
      'Street photography in the Balat district with local guide',
      'Midday edit session and portfolio review',
      'Afternoon access to a private rooftop in Beyoğlu',
      'Sunset session over the Golden Horn',
    ],

    venue:
      'Multiple private locations across Istanbul, accessed through long-standing relationships with property owners, cultural institutions, and local communities.',
    venueDescription: 'Multiple Private Locations — Istanbul',
    audience: [
      'Photographers and visual artists',
      'Those drawn to the layered history of Istanbul',
      'Guests seeking an alternative to conventional tourism',
    ],

    relatedSlugs: ['curated-art-salon', 'silk-road-istanbul'],
    seoTitle: 'Istanbul Through the Lens™ — Private Photography Experience',
    seoDescription:
      "A private photographic journey through the layers of Istanbul — from the Byzantine underground to the rooftops of Beyoğlu. Led by a documentary photographer with twenty years of access to the city's hidden spaces.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Curated Art Salon™',
    slug: 'curated-art-salon',
    category: 'SIGNATURE',
    location: 'Beyoğlu, Istanbul',
    duration: '3 Hours',
    groupSize: 'Up to 8 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_18ab39334-1772064904874.png',
    heroImageAlt:
      'Contemporary art gallery with white walls, dramatic lighting, and abstract paintings in a historic Istanbul building',
    intro:
      "Private access to the studios and collections of Istanbul's most significant contemporary artists. A guided conversation between collector, curator, and maker — conducted in the language of contemporary Turkish art.",
    program: [
      'Private welcome at the CREARE gallery space in Beyoğlu',
      'Introduction to the contemporary Istanbul art scene',
      'Studio visit with two emerging artists',
      'Private viewing of a significant collection',
      'Acquisition consultation for interested guests',
      'Closing reception with the artists',
    ],

    venue:
      'Three private spaces across Beyoğlu and Karaköy — a working studio, a private collection, and a gallery operating by appointment only.',
    venueDescription: 'Private Studios & Collections — Beyoğlu, Istanbul',
    audience: [
      'Collectors and patrons of contemporary art',
      'Cultural professionals and curators',
      'Those seeking authentic engagement with living artists',
    ],

    relatedSlugs: ['istanbul-through-the-lens', 'silk-road-istanbul'],
    seoTitle: 'Curated Art Salon™ — Private Contemporary Art Experience',
    seoDescription:
      "Private access to the studios and collections of Istanbul's most significant contemporary artists. A guided conversation between collector, curator, and maker — conducted in the language of contemporary Turkish art.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Silk Road Istanbul™',
    slug: 'silk-road-istanbul',
    category: 'SIGNATURE',
    location: 'Istanbul, Turkey',
    duration: 'Full Day',
    groupSize: 'Up to 8 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c92e1fd0-1772666486398.png',
    heroImageAlt:
      'Grand Bazaar interior with ornate arched ceilings, colorful textiles and antique treasures in warm golden light',
    intro:
      "A private journey through the trading routes that made Istanbul the crossroads of civilisation. From the Grand Bazaar's hidden hans to the spice merchants of the Egyptian Bazaar — with access to spaces closed to the public.",
    program: [
      'Private entrance to the Grand Bazaar before opening',
      'Access to three private hans within the bazaar complex',
      'Meeting with a fifth-generation textile merchant',
      'Private viewing of an antique map collection',
      'Lunch at a family-run meyhane in Eminönü',
      'Afternoon session at the Egyptian Bazaar with a spice historian',
    ],

    venue:
      'The historic bazaar district of Eminönü and Beyazıt, with access to private spaces within the Grand Bazaar complex arranged through decades of cultural relationships.',
    venueDescription: 'Grand Bazaar & Eminönü District — Istanbul',
    audience: [
      'History enthusiasts and cultural travellers',
      'Collectors of antiques and textiles',
      'Those interested in the living heritage of trade',
    ],

    relatedSlugs: ['curated-art-salon', 'istanbul-through-the-lens'],
    seoTitle: 'Silk Road Istanbul™ — Private Grand Bazaar & Trading Heritage Experience',
    seoDescription:
      "A private journey through the trading routes that made Istanbul the crossroads of civilisation. From the Grand Bazaar's hidden hans to the spice merchants of the Egyptian Bazaar — with access to spaces closed to the public.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Golden Horn Regatta™',
    slug: 'golden-horn-regatta',
    category: 'PERFORMANCE',
    series: 'CREARE CORPORATE SERIES™',
    location: 'Golden Horn, Istanbul',
    duration: '6 Hours',
    groupSize: 'Up to 20 Guests',
    heroImage: 'https://images.unsplash.com/photo-1603625354572-83f7a0c498a1',
    heroImageAlt:
      'Sailing boats racing on calm golden water at sunset with forested shoreline in the background',
    intro:
      "A private regatta on the Golden Horn — one of Istanbul's most storied waterways. Teams compete aboard traditional wooden vessels, guided by professional skippers, against the backdrop of the historic peninsula.",
    program: [
      'Team briefing and vessel assignment at the marina',
      'Sailing masterclass with professional skipper',
      'Competitive regatta — three laps of the Golden Horn course',
      'Awards ceremony aboard the flagship vessel',
      'Dinner on the waterfront with live music',
    ],

    venue:
      'The Golden Horn waterway, with departure from the historic Fener marina. The course passes beneath the Atatürk Bridge and alongside the Byzantine sea walls.',
    venueDescription: 'Golden Horn Waterway — Fener Marina, Istanbul',
    audience: [
      'Corporate groups seeking competitive team experiences',
      'Leadership teams and executive retreats',
      'Those who perform best under pressure',
    ],

    relatedSlugs: ['princes-islands-regatta', 'driven-by-performance'],
    seoTitle: 'Golden Horn Regatta™ — Corporate Team Sailing Experience',
    seoDescription:
      "A private regatta on the Golden Horn — one of Istanbul's most storied waterways. Teams compete aboard traditional wooden vessels, guided by professional skippers, against the backdrop of the historic peninsula.",
    culturalWorld: 'Istanbul',
  },
  {
    title: "Princes' Islands Regatta™",
    slug: 'princes-islands-regatta',
    category: 'PERFORMANCE',
    series: 'CREARE CORPORATE SERIES™',
    location: "Princes' Islands, Istanbul",
    duration: 'Full Day',
    groupSize: 'Up to 24 Guests',
    heroImage: 'https://images.unsplash.com/photo-1692023496239-0554df299b0d',
    heroImageAlt:
      'White sailing yacht with spinnaker sail racing on deep blue sea with islands visible in the distance',
    intro:
      "A full-day offshore regatta between the Princes' Islands — nine islands in the Sea of Marmara that have been a retreat for Istanbul's elite since Byzantine times. Racing in open water, with the city skyline as the finish line.",
    program: [
      'Departure from Karaköy marina at dawn',
      'Navigation briefing and team formation',
      'Offshore passage to Büyükada — the largest island',
      'Competitive circuit race between the islands',
      'Lunch at a private villa on Heybeliada',
      'Return passage with sunset over the city',
    ],

    venue:
      "The Sea of Marmara between the Princes' Islands, with a private villa on Heybeliada for the midday break. The return passage offers unobstructed views of the Istanbul skyline.",
    venueDescription: "Princes' Islands — Sea of Marmara, Istanbul",
    audience: [
      'Corporate teams seeking offshore challenge',
      'Sailing enthusiasts and competitive groups',
      'Executive retreats requiring full-day immersion',
    ],

    relatedSlugs: ['golden-horn-regatta', 'driven-by-performance'],
    seoTitle: "Princes' Islands Regatta™ — Full-Day Offshore Sailing Challenge",
    seoDescription:
      "A full-day offshore regatta between the Princes' Islands — nine islands in the Sea of Marmara that have been a retreat for Istanbul's elite since Byzantine times. Racing in open water, with the city skyline as the finish line.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Driven by Performance™',
    slug: 'driven-by-performance',
    category: 'PERFORMANCE',
    series: 'CREARE CORPORATE SERIES™',
    location: 'Private Circuit, Istanbul',
    duration: '5 Hours',
    groupSize: 'Up to 12 Guests',
    heroImage: 'https://images.unsplash.com/photo-1734104563635-253f946b1f7d',
    heroImageAlt:
      'High-performance sports car racing on a private circuit track with green hills in the background',
    intro:
      'A private track day at a restricted circuit outside Istanbul. High-performance vehicles, professional instruction, and a programme designed to translate the principles of motorsport into the language of leadership.',
    program: [
      'Private transfer to the circuit',
      'Vehicle briefing and safety induction',
      'Instructed hot laps with professional racing driver',
      'Solo timed sessions — individual performance data provided',
      'Team challenge: relay format with combined times',
      'Debrief and performance analysis session',
      'Dinner at the circuit clubhouse',
    ],

    venue:
      'A private circuit facility outside Istanbul, not accessible to the public. The venue operates exclusively for corporate and private events, with a fleet of performance vehicles maintained to racing specification.',
    venueDescription: 'Private Circuit — Istanbul Region',
    audience: [
      'Corporate groups seeking high-performance experiences',
      'Leadership teams exploring decision-making under pressure',
      'Motorsport enthusiasts and performance professionals',
    ],

    relatedSlugs: ['golden-horn-regatta', 'princes-islands-regatta'],
    seoTitle: 'Driven by Performance™ — Private Track Day Experience',
    seoDescription:
      'A private track day at a restricted circuit outside Istanbul. High-performance vehicles, professional instruction, and a programme designed to translate the principles of motorsport into the language of leadership.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'The Studio Session™',
    slug: 'the-studio-session',
    category: 'LAB',
    location: 'Karaköy, Istanbul',
    duration: '4 Hours',
    groupSize: 'Up to 12 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_12b67329f-1772144360901.png',
    heroImageAlt:
      'Creative studio workspace with natural light, art materials, and collaborative work surfaces in Istanbul',
    intro:
      "A co-creation session inside one of Istanbul's most experimental creative studios. Participants work alongside resident artists to develop a concept from scratch — no brief, no outcome defined in advance.",
    program: [
      'Welcome and studio orientation',
      'Concept generation workshop with resident artist',
      'Hands-on material exploration session',
      'Collaborative prototype development',
      'Group critique and reflection',
      'Departure with a personal artefact from the session',
    ],
    venue:
      'A working creative studio in Karaköy, shared by a rotating collective of artists, designers and cultural producers. The space is reconfigured for each LAB session.',
    venueDescription: 'Creative Studio — Karaköy, Istanbul',
    audience: [
      'Creative professionals and brand strategists',
      'Teams seeking unconventional ideation environments',
      'Those who learn by making',
    ],
    relatedSlugs: ['cultural-immersion-lab', 'narrative-workshop'],
    seoTitle: 'The Studio Session™ — Co-Creation Workshop with Artists',
    seoDescription:
      "A co-creation session inside one of Istanbul's most experimental creative studios. Participants work alongside resident artists to develop a concept from scratch — no brief, no outcome defined in advance.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Cultural Immersion Lab™',
    slug: 'cultural-immersion-lab',
    category: 'LAB',
    location: 'Balat, Istanbul',
    duration: 'Full Day',
    groupSize: 'Up to 8 Guests',
    heroImage: 'https://images.unsplash.com/photo-1678719887816-e5c483607ebb',
    heroImageAlt:
      'Colourful historic neighbourhood street in Balat Istanbul with traditional architecture and vibrant facades',
    intro:
      "An immersive day inside the living culture of Balat — Istanbul's most layered neighbourhood. Participants engage directly with local makers, historians and community figures to co-develop a cultural narrative.",
    program: [
      'Morning walk with a neighbourhood historian',
      'Workshop with a local ceramics maker',
      'Lunch at a family-run community kitchen',
      'Afternoon session with a documentary filmmaker',
      'Collaborative storytelling exercise',
      'Evening debrief and narrative presentation',
    ],
    venue:
      'Multiple community spaces across the Balat district, accessed through long-standing relationships with local residents and cultural organisations.',
    venueDescription: 'Community Spaces — Balat, Istanbul',
    audience: [
      'Brand teams developing cultural narratives',
      'Creative directors and content strategists',
      'Those seeking authentic local engagement',
    ],
    relatedSlugs: ['the-studio-session', 'narrative-workshop'],
    seoTitle: 'Cultural Immersion Lab™ — Balat Neighbourhood Storytelling Experience',
    seoDescription:
      "An immersive day inside the living culture of Balat — Istanbul's most layered neighbourhood. Participants engage directly with local makers, historians and community figures to co-develop a cultural narrative.",
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Narrative Workshop™',
    slug: 'narrative-workshop',
    category: 'LAB',
    location: 'Beyoğlu, Istanbul',
    duration: '3 Hours',
    groupSize: 'Up to 10 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1546a457d-1772073636968.png',
    heroImageAlt:
      'Open notebook with handwritten notes and creative sketches on a wooden desk with warm ambient light',
    intro:
      'A structured creative workshop exploring the architecture of cultural storytelling. Participants develop original narrative frameworks guided by a writer and cultural strategist.',
    program: [
      'Introduction to narrative structure in cultural contexts',
      'Individual concept development exercise',
      'Small group narrative construction',
      'Presentation and peer feedback',
      'Closing reflection with facilitator',
    ],
    venue:
      'A private meeting space in Beyoğlu, configured for focused creative work with natural light and minimal distraction.',
    venueDescription: 'Private Workshop Space — Beyoğlu, Istanbul',
    audience: [
      'Writers, strategists and creative thinkers',
      'Brand teams developing cultural positioning',
      'Those who think in stories',
    ],
    relatedSlugs: ['the-studio-session', 'cultural-immersion-lab'],
    seoTitle: 'Narrative Workshop™ — Cultural Storytelling Framework',
    seoDescription:
      'A structured creative workshop exploring the architecture of cultural storytelling. Participants develop original narrative frameworks guided by a writer and cultural strategist.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Private Bosphorus Access™',
    slug: 'private-bosphorus-access',
    category: 'SIGNATURE',
    location: 'Bosphorus, Istanbul',
    duration: '6 Hours',
    groupSize: 'Up to 6 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_19e2f3ffe-1775494719326.png',
    heroImageAlt:
      'Luxury private yacht on the Bosphorus at dusk with Istanbul skyline and illuminated bridges in the background',
    intro:
      'An invitation-only passage along the Bosphorus aboard a privately commissioned vessel. No programme is published. The evening is composed entirely around the guest.',
    program: [
      'Private transfer to a discreet embarkation point',
      'Welcome aboard with curated selection',
      'Passage through restricted waterway sections',
      'Private dinner prepared by a resident chef',
      'Exclusive night viewing of the city from the water',
      'Discreet return transfer',
    ],
    venue:
      'A privately commissioned vessel operating under exclusive arrangement. The route and duration are adapted to each guest. No public record is maintained.',
    venueDescription: 'Private Vessel — Bosphorus, Istanbul',
    audience: [
      'Those who require complete privacy',
      'Guests marking occasions of singular significance',
      'Individuals for whom access is never in question',
    ],
    relatedSlugs: ['floating-salon-d-opera', 'beylerbeyi-1869'],
    seoTitle: 'Private Bosphorus Access™ — Invitation-Only Yacht Experience',
    seoDescription:
      'An invitation-only passage along the Bosphorus aboard a privately commissioned vessel. Customized evening with private dinner and exclusive night viewing of Istanbul.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Closed Collection Viewing™',
    slug: 'closed-collection-viewing',
    category: 'SIGNATURE',
    location: 'Private Residence, Istanbul',
    duration: '2 Hours',
    groupSize: 'Up to 4 Guests',
    heroImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1cfdb5cbd-1775598262213.png',
    heroImageAlt:
      'Dimly lit private gallery with rare artworks on dark walls and a single spotlight illuminating a sculpture',
    intro:
      'Access to a private collection that has never been exhibited publicly. Arranged by invitation only, for guests with a demonstrated relationship with significant art.',
    program: [
      'Private arrival at an undisclosed address',
      "Introduction by the collection's custodian",
      'Guided viewing of selected works',
      'Private conversation with the collector',
      'Departure with a handwritten note of provenance',
    ],
    venue:
      'A private residence in Istanbul, the location of which is shared only upon confirmed attendance. The collection spans five centuries and three continents.',
    venueDescription: 'Private Residence — Istanbul (Location Disclosed on Confirmation)',
    audience: [
      'Collectors and serious patrons of the arts',
      'Those with an established relationship with significant works',
      'Guests for whom rarity is the only criterion',
    ],
    relatedSlugs: ['curated-art-salon', 'istanbul-through-the-lens'],
    seoTitle: 'Closed Collection Viewing™ — Private Art Collection Access',
    seoDescription:
      'Access to a private collection that has never been exhibited publicly. Arranged by invitation only, for guests with a demonstrated relationship with significant art.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'After Hours Palace™',
    slug: 'after-hours-palace',
    category: 'SIGNATURE',
    location: 'Asian Shore, Istanbul',
    duration: '4 Hours',
    groupSize: 'Up to 4 Guests',
    heroImage: 'https://images.unsplash.com/photo-1707840579943-a13ceebb2f47',
    heroImageAlt:
      'Grand historic palace exterior at night with dramatic lighting reflecting on still water in complete silence',
    intro:
      'Exclusive after-hours access to a historic palace on the Asian shore of the Bosphorus. The venue is closed to all others. The evening belongs entirely to the guest.',
    program: [
      'Private arrival by water at the palace landing',
      'After-hours access to the ceremonial halls',
      'Private dinner in the imperial dining room',
      'Exclusive access to the palace gardens after dark',
      'Departure by private launch',
    ],
    venue:
      'A historic palace on the Asian shore, accessible only through a formal cultural arrangement. The venue is never shared with other guests. Access is strictly by invitation.',
    venueDescription: 'Historic Palace — Asian Shore, Istanbul (By Invitation Only)',
    audience: [
      'Those for whom exclusivity is not a preference but a requirement',
      'Guests marking occasions of the highest significance',
      'Individuals who have experienced everything else',
    ],
    relatedSlugs: ['beylerbeyi-1869', 'private-bosphorus-access'],
    seoTitle: 'After Hours Palace™ — Exclusive Palace Access Experience',
    seoDescription:
      'Exclusive after-hours access to a historic palace on the Asian shore. Private dinner in imperial dining room and exclusive garden access.',
    culturalWorld: 'Istanbul',
  },
  {
    title: 'Table to Farm',
    slug: 'table-to-farm-bodrum',
    category: 'SIGNATURE',
    location: 'Bodrum Peninsula (Aegean)',
    duration: 'Half-day to full evening',
    groupSize: 'Max 10 guests',
    heroImage: '/assets/images/creare-image-placeholder.jpg',
    heroImageAlt:
      'A single table set on a hillside olive farm above the Aegean, overlooking the Gulf of Gökova at dusk',
    heroHeadline: 'There is only one table.',
    heroMetaLine: 'Bodrum Peninsula — Aegean  ·  Max 10 Guests',
    intro:
      'There is only one table.\n\nOn a five-acre hillside above the Aegean, a single table is set — and never duplicated.\n\nMaximum ten guests.\nNo second seating. No replication.',
    program: [
      'Arrival at the off-grid farm on the Bodrum Peninsula hillside',
      'Optional descent to the sea — clear water, minimal presence, marine life visible without effort',
      'Return to the farm as the table is prepared by the French artisan living on-site',
      'Locally produced cheeses and small-production wines not commercially available',
      'No menu. No explanation unless asked.',
      'Departure by arrangement — half-day to full evening',
    ],

    venue:
      'The farm is entirely off-grid. No infrastructure. No system designed for visitors. Goats move freely across the land. Olive trees define the terrain. Below, the coastline opens into a rare stretch of turquoise water facing the Gulf of Gökova, with views toward Kos and the Datça Peninsula.',
    venueDescription: 'Off-Grid Farm — Bodrum Peninsula, Aegean',
    audience: [
      'Those seeking a controlled absence of structure',
      'Guests who understand the difference between designed luxury and lived environment',
      'Private groups of no more than ten, by arrangement only',
    ],

    relatedSlugs: ['floating-salon-d-opera', 'beylerbeyi-1869'],
    series: undefined,
    seoTitle: 'Table to Farm — French Artisan Table at an Off-Grid Farm, Bodrum',
    seoDescription:
      'There is only one table. On a five-acre hillside above the Aegean, a single table is set for a maximum of ten guests. Off-grid farm, local cheeses, small-production wines. Bodrum Peninsula.',
    culturalWorld: 'Aegean',
    ctaLabel: 'Request Access →',
    ctaSubtext: 'Limited availability. Subject to timing and approval.',
    trustStatement:
      'Each access is arranged through long-standing local relationships.\nNot publicly available. Not repeatable on demand.',
  },
];

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}

export function getRelatedExperiences(slugs: string[]): Experience[] {
  return experiences.filter((e) => slugs.includes(e.slug));
}

export function getExperiencesByCategory(category: string): Experience[] {
  return experiences.filter((e) => e.category === category);
}
