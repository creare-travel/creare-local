export interface CulturalWorldSection {
  title: string;
  body: string;
}

export interface CulturalWorldLink {
  slug: string;
  title: string;
}

export interface CulturalWorldCta {
  eyebrow?: string;
  title: string;
  subtitle: string;
  note?: string;
}

export interface CulturalWorldContent {
  slug: 'istanbul' | 'bodrum' | 'cappadocia';
  title: string;
  shortDescription: string;
  heroStatement: string;
  heroImage?: string;
  heroImageAlt?: string;
  metaTitle: string;
  metaDescription: string;
  sections: CulturalWorldSection[];
  furtherReading: CulturalWorldLink[];
  cta: CulturalWorldCta;
}

export const CULTURAL_WORLD_CONTENT: Record<string, CulturalWorldContent> = {
  istanbul: {
    slug: 'istanbul',
    title: 'Istanbul',
    shortDescription:
      'A layered cultural world of water, thresholds, imperial memory, and private interiors still shaped by living custodianship.',
    heroStatement: 'Where water, empire, and private interiors remain in active conversation.',
    metaTitle: 'Istanbul — Cultural World — Creare',
    metaDescription:
      'A layered cultural world of Bosphorus crossings, Ottoman and Byzantine memory, private interiors, and encounters shaped through access, pace, and cultural intelligence.',
    sections: [
      {
        title: 'Cultural Identity',
        body: 'Istanbul is not a city that yields to overview. It is a layered civilisation in which Roman, Byzantine, Ottoman, and Republican registers remain active in architecture, etiquette, collecting, and daily ritual.\n\nThe Bosphorus is not scenery here. Water structures authority, privacy, trade, ceremony, and encounter. To move across Istanbul is to move through changing regimes of attention.\n\nWhat distinguishes the city is not simply the density of monuments, but the continuity between visible history and private custodianship. A cistern beneath a cafe, a family apartment holding an uncatalogued library, a han whose commercial life still carries the memory of empire: this is the level at which Istanbul begins to disclose itself.',
      },
      {
        title: 'Hidden Layers',
        body: "Beneath the city's public surface lies a more private geography: underground Byzantine structures, domestic archives, Sufi inheritances carried through family lineages, and interiors that remain legible only through trust.\n\nSome of Istanbul's most consequential cultural spaces are not museums at all. They are apartments, yalis, hans, private collections, and working rooms in which objects, stories, and forms of hospitality have remained intact across generations.\n\nThese layers are not entered through tourism channels. They are entered through relationships, timing, and cultural permission.",
      },
      {
        title: 'Gastronomy & Rituals',
        body: "Istanbul's food culture is inseparable from ceremony. The Ottoman kitchen, the meyhane table, the coffee ritual, the market conversation, the private dinner arranged around memory rather than display: each belongs to a larger civic and domestic intelligence.\n\nThe city's gastronomy is not best understood through restaurant rankings. It lives in transmission, in hospitality, in the continuity between archive and table, and in those who still treat food as a carrier of form, rhythm, and social meaning.\n\nWhat matters here is not spectacle but context: who receives, who prepares, who explains, and what kind of attention the setting asks in return.",
      },
      {
        title: 'Private Access Potential',
        body: "Istanbul's access landscape is shaped by institutions, foundations, private families, and long-standing custodians of space. That makes access possible, but never casual.\n\nA palace after closing hours, a private Bosphorus residence, an underground structure opened with the right scholarly accompaniment, a room in which manuscripts or paintings remain part of family memory rather than public display: each requires a different protocol.\n\nThe point is not entry alone. It is the quality of encounter made possible once entry is granted.",
      },
      {
        title: 'Experience Philosophy',
        body: "Our approach to Istanbul is built on threshold intelligence. We do not assemble a list of monuments. We compose sequences that allow the city's deeper logic to become perceptible.\n\nAn encounter here might begin with first light over water, continue underground in the company of a specialist, and end in a private interior where a single object or story reorganises what the city means. The through-line is not geography but interpretation.\n\nIstanbul rewards those willing to move at the pace of comprehension rather than consumption. That is the pace at which the city becomes legible.",
      },
    ],
    furtherReading: [
      {
        slug: 'private-experiences-istanbul-what-access-really-means',
        title: 'Private Experiences in Istanbul: What Access Really Means',
      },
    ],
    cta: {
      eyebrow: 'By introduction only',
      title: 'Access is limited.',
      subtitle: 'We compose a small number of Istanbul encounters each season.',
      note: 'Availability is shaped by access, timing, and cultural permission.',
    },
  },
  bodrum: {
    slug: 'bodrum',
    title: 'Bodrum',
    shortDescription:
      'An Aegean cultural world shaped by Halicarnassus, maritime routes, cultivated tables, and the slower codes of the peninsula.',
    heroStatement: 'An Aegean peninsula of Halicarnassus, maritime rhythm, and cultivated quiet.',
    metaTitle: 'Bodrum — Cultural World — Creare',
    metaDescription:
      'An Aegean cultural world of Halicarnassus, maritime routes, olive groves, underwater archaeology, and composed encounters shaped by the peninsula rather than resort surface.',
    sections: [
      {
        title: 'Cultural Identity',
        body: 'Bodrum is ancient Halicarnassus before it is a seasonal image. It carries the memory of one of the Seven Wonders of the Ancient World, a Crusader castle built from its remains, and a peninsula whose cultural life has been shaped by sea routes, cultivation, and recurring return.\n\nIts modern identity is equally specific. Bodrum became a literary and intellectual coast as much as a leisure one, shaped by artists, writers, and those who read the Aegean as a place of form rather than escape.\n\nWhat matters is the coexistence of harbor life, village life, archaeological memory, and hosted sociability. The peninsula is not one mood. It is a series of spatial codes.',
      },
      {
        title: 'Hidden Layers',
        body: "Beneath Bodrum's visible polish lies a peninsula of submerged history, unexcavated traces, inland villages, olive ground, and private bays whose meanings are local rather than performative.\n\nThe sea is part of the archive here. Trade routes, wreck sites, anchorages, and coastal approaches all remain present in how the place is understood from the water.\n\nFurther inland, the peninsula's slower life persists through cultivation, workshop knowledge, and family-held settings that do not announce themselves but continue to structure the atmosphere of the coast.",
      },
      {
        title: 'Gastronomy & Rituals',
        body: "Bodrum's table belongs to the wider Aegean tradition: olive oil, fish, herbs, orchard produce, and a discipline of restraint that values source and season over elaboration.\n\nThe peninsula's food culture is not separate from its geography. Shoreline, garden, village, and market all contribute to how hospitality is staged and how time is spent.\n\nThe most meaningful encounters are often the least signposted: a family table, an olive harvest, a kitchen whose intelligence depends on continuity rather than display.",
      },
      {
        title: 'Private Access Potential',
        body: "Private access in Bodrum is defined as much by setting as by status. A vessel changes the peninsula. So does entry into a private estate, a protected bay, an after-hours institutional space, or a hosted domestic table.\n\nSome of the most compelling encounters here come from the interplay between land and sea: archaeology approached from the water, a culinary sequence shaped by cultivation and shoreline movement, or a residence whose position on the peninsula reframes the entire coast.\n\nWhat private access offers in Bodrum is not generic exclusivity. It is a more exact reading of the peninsula's social and maritime logic.",
      },
      {
        title: 'Experience Philosophy',
        body: 'Our approach to Bodrum begins by refusing to read it as a Mediterranean backdrop. The peninsula is too historically dense, too spatially specific, and too culturally coded for that.\n\nInstead, we compose encounters around Halicarnassus, the Aegean table, hosted sociability, maritime rhythm, and the literary-intellectual coast that still survives beneath the seasonal surface.\n\nBodrum becomes most legible when approached as an environment of sequence and atmosphere: harbor to hillside, bay to grove, table to water, conversation to return.',
      },
    ],
    furtherReading: [
      {
        slug: 'bodrum-beyond-the-coast-where-the-aegean-slows-down',
        title: 'Bodrum Beyond the Coast: Where the Aegean Slows Down',
      },
    ],
    cta: {
      title: 'Some encounters remain unlisted.',
      subtitle: 'We shape a small number of Bodrum experiences around timing, setting, and access.',
      note: 'Availability depends on season, custodianship, and the right conditions for entry.',
    },
  },
  cappadocia: {
    slug: 'cappadocia',
    title: 'Cappadocia',
    shortDescription:
      'A cultural world of carved stone, subterranean life, rock monasteries, and volcanic craft traditions paced by geological time.',
    heroStatement: 'A landscape of carved stone, subterranean life, and volcanic memory.',
    metaTitle: 'Cappadocia — Cultural World — Creare',
    metaDescription:
      'A cultural world of carved stone, subterranean settlements, rock monasteries, volcanic craft traditions, and encounters shaped by silence, scale, and geological time.',
    sections: [
      {
        title: 'Cultural Identity',
        body: 'Cappadocia is one of those rare places where geology and civilisation are inseparable. Stone is not backdrop here; it is the medium through which shelter, worship, storage, movement, and memory were made.\n\nUnderground cities, carved monasteries, cave churches, and inhabited interiors all testify to a culture of adaptation shaped by pressure, patience, and long duration.\n\nThe result is not simply an extraordinary landscape. It is a world in which the human relationship to scale, enclosure, and time has been materially inscribed into the terrain itself.',
      },
      {
        title: 'Hidden Layers',
        body: 'What most visitors recognise in Cappadocia is only the outer surface. Beyond the familiar viewpoints lies a deeper register of inaccessible churches, partially mapped underground systems, carved thresholds, and local knowledge held by archaeologists, historians, and craft families.\n\nThe region rewards those willing to move from spectacle into inhabitation. Valleys become legible differently when entered on foot, interiors become meaningful when read with a specialist, and subterranean space changes the whole scale of experience.\n\nIts hidden layers are not only physical. They are also temporal and interpretive.',
      },
      {
        title: 'Gastronomy & Rituals',
        body: "Cappadocia's food and wine culture belong to the logic of the plateau: preservation, clay, volcanic soil, seasonal endurance, and cultivation under constraint.\n\nCeramic cooking is not a novelty here. It is part of a longer material intelligence linking river clay, vessel-making, storage, and table ritual. Likewise, the wine tradition is not incidental to the region's identity but one of its oldest continuities.\n\nMeaningful encounters emerge when these traditions are approached through those who still hold them in practice rather than as rustic performance.",
      },
      {
        title: 'Private Access Potential',
        body: 'Private access in Cappadocia depends on a different kind of permission than on the coast or in the city. It sits at the intersection of archaeological protocol, institutional trust, and local custodianship.\n\nThat may mean entry into a rock-cut church outside normal visiting conditions, movement through less visible subterranean spaces, or invitation into a working craft or vineyard environment that remains outside the public tourism layer.\n\nWhat matters is not novelty alone. It is the ability to encounter the region at a scale and pace closer to how it was actually inhabited.',
      },
      {
        title: 'Experience Philosophy',
        body: 'Cappadocia asks to be read through geological time. The landscape is visually immediate, but its deeper meaning appears more slowly: through silence, thresholds, carved interiors, altered scale, and the discipline of moving without haste.\n\nOur approach therefore shifts attention away from surface spectacle and toward inhabitation. A composed encounter here might begin in stillness before dawn, continue underground or within stone, and end at a table where volcanic soil, craft memory, and family continuity meet.\n\nThis is not a place for itinerary thinking. It is a place for patience, structure, and revelation by degrees.',
      },
    ],
    furtherReading: [
      {
        slug: 'cappadocia-without-balloons-a-different-kind-of-silence',
        title: 'Cappadocia Without Balloons: A Different Kind of Silence',
      },
    ],
    cta: {
      title: 'Some encounters ask for slower timing.',
      subtitle:
        'We compose a small number of Cappadocia experiences around access, silence, and geological pace.',
      note: 'Availability depends on season, permissions, and the conditions required for meaningful entry.',
    },
  },
};

export function getCulturalWorldContent(slug?: string): CulturalWorldContent | null {
  if (!slug) return null;
  return CULTURAL_WORLD_CONTENT[slug] ?? null;
}
