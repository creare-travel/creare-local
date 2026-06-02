export interface CulturalWorldSection {
  title: string;
  body: string;
}

export interface CulturalWorldLink {
  slug: string;
  title: string;
}

export interface CulturalWorldSystemMapping {
  experienceTitle: string;
  culturalSystem: string;
  secondaryCulturalSystem?: string;
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
  culturalSystems: string[];
  systemMappings: CulturalWorldSystemMapping[];
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
    culturalSystems: [
      'Bosphorus Maritime Culture',
      'Ottoman Culinary Memory',
      'Palace Memory',
      'Byzantine Subterranean Heritage',
      'Contemporary Craft Traditions',
    ],
    systemMappings: [
      {
        experienceTitle: 'Imperial Flavors™',
        culturalSystem: 'Ottoman Culinary Memory',
      },
      {
        experienceTitle: 'Private Ottoman Dining',
        culturalSystem: 'Ottoman Culinary Memory',
      },
      {
        experienceTitle: "Floating Salon d'Opera™",
        culturalSystem: 'Bosphorus Maritime Culture',
      },
      {
        experienceTitle: 'Bosphorus at Dawn',
        culturalSystem: 'Bosphorus Maritime Culture',
      },
      {
        experienceTitle: 'Beylerbeyi 1869™',
        culturalSystem: 'Palace Memory',
      },
      {
        experienceTitle: 'The Salon of Hands™',
        culturalSystem: 'Contemporary Craft Traditions',
      },
      {
        experienceTitle: 'Golden Horn Regatta™',
        culturalSystem: 'Bosphorus Maritime Culture',
      },
      {
        experienceTitle: 'Byzantine Underground',
        culturalSystem: 'Byzantine Subterranean Heritage',
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
      'A Halicarnassian cultural world shaped by archaeological memory, maritime movement, cultivated landscapes, hosted tables, and the literary afterlife of the peninsula.',
    heroStatement:
      'A peninsula where Halicarnassus, sea movement, cultivated ground, and hosted social ritual remain in active relation.',
    metaTitle: 'Bodrum — Cultural World — Creare',
    metaDescription:
      'A Halicarnassian cultural world of archaeological memory, Aegean maritime culture, cultivated landscapes, hosted table rituals, and literary afterlife beyond the resort surface.',
    sections: [
      {
        title: 'Cultural Identity',
        body: 'Bodrum is Halicarnassus before it is a season. The peninsula carries the memory of ancient Caria, of Mausolus and Artemisia II, of a monument so consequential that it gave another language its word for mausoleum. That archaeological inheritance did not vanish when the monument fell. It persisted in reused stone, in Bodrum Castle, in the Museum of Underwater Archaeology, and in the peninsula’s continuing sense of itself as a site of accumulated civilisation.\n\nThe sea is the second structure of this world. Bodrum has always been approached by water as much as by land: through anchorages, trade routes, gulet passages, sponge-diving histories, fishing rhythms, and coastal navigation that binds village, harbor, bay, and workshop into one moving system.\n\nIts modern identity is equally specific. Bodrum became a literary and intellectual coast as much as a leisure one, shaped by Halikarnas Balıkçısı, by artists and seasonal returners, and by those who understood the Aegean not as escape but as a disciplined way of living with light, conversation, and recurring return. What defines the peninsula is the coexistence of archaeology, maritime life, cultivated ground, and hosted sociability.',
      },
      {
        title: 'Hidden Layers',
        body: 'Beneath Bodrum’s visible polish lies a more exact peninsula: submerged history, unexcavated traces of Halicarnassus, inland villages, olive ground, and private bays whose meanings remain local rather than performative.\n\nThe sea is part of the archive here. Wreck sites, maritime approaches, workshop traditions, and remembered anchorages continue to shape how the peninsula is understood from the water. Bodrum Castle is not only a skyline object; it is part of a longer sequence linking the Mausoleum, Crusader reuse, and underwater archaeological memory.\n\nFurther inland, the peninsula’s slower intelligence persists through cultivation, family-held settings, citrus and olive production, workshop knowledge, and table customs that do not announce themselves yet continue to structure the coast from within. The hidden layer is not secrecy for its own sake. It is continuity that has never needed display.',
      },
      {
        title: 'Gastronomy & Rituals',
        body: 'Bodrum’s table belongs to the wider Aegean world, but it has its own peninsula logic: meze as pacing, fish as daily measure, olive oil as continuity, orchard and vineyard produce as season made visible, and hosting as a social form rather than an industry.\n\nWhat matters is not restaurant prestige but table culture. A hosted meal on this peninsula carries codes of reception, tempo, sequence, and conversation that are inseparable from place. Shoreline, market, garden, village, and kitchen all contribute to how the evening unfolds.\n\nThe most meaningful encounters are often the least signposted: a family-run table, a producer gathering, an olive harvest, a kitchen whose authority depends on repetition rather than novelty. In Bodrum, food is one of the peninsula’s most durable ways of remembering itself.',
      },
      {
        title: 'Private Access Potential',
        body: 'Private access in Bodrum is defined by sequence and setting rather than generic exclusivity. A vessel changes the peninsula. So does entry into an after-hours archaeological or institutional site, a private estate, a workshop, a protected bay, or a hosted domestic table.\n\nSome of the strongest encounters here come from the interplay between antiquity, water, and cultivation: Halicarnassus at first light, Bodrum Castle after public hours, a gulet approach that reveals the coast as a maritime system rather than a sequence of beaches, or a table shaped by land held and worked beyond the seasonal surface.\n\nWhat private access offers in Bodrum is a more accurate reading of the peninsula’s civilizational logic. It clarifies how archaeology, hosted sociability, and maritime movement still belong to the same world.',
      },
      {
        title: 'Experience Philosophy',
        body: 'Our approach to Bodrum begins by refusing the destination model. The peninsula is too historically dense, too maritime, too cultivated, and too culturally coded to be read as a backdrop for leisure.\n\nInstead, we compose encounters around Halicarnassus, Aegean maritime culture, hosted table life, olive and vineyard ground, and the literary afterlife that still survives beneath the seasonal surface. The aim is not to collect views but to understand how the peninsula holds together.\n\nBodrum becomes most legible when approached as a system of sequence: monument to harbor, harbor to workshop, workshop to grove, grove to table, table to conversation, conversation to return. That is when the refined coast becomes a cultural world.',
      },
    ],
    culturalSystems: [
      'Halicarnassus Archaeological Memory',
      'Aegean Maritime Culture',
      'Peninsula Table Culture',
      'Aegean Cultivation Traditions',
      'Literary Bodrum',
    ],
    systemMappings: [
      {
        experienceTitle: 'Table to Farm',
        culturalSystem: 'Aegean Cultivation Traditions',
        secondaryCulturalSystem: 'Peninsula Table Culture',
      },
      {
        experienceTitle: 'Halicarnassus at First Light',
        culturalSystem: 'Halicarnassus Archaeological Memory',
      },
      {
        experienceTitle: 'The Castle After Hours',
        culturalSystem: 'Halicarnassus Archaeological Memory',
        secondaryCulturalSystem: 'Aegean Maritime Culture',
      },
      {
        experienceTitle: 'Peninsula by Sea',
        culturalSystem: 'Aegean Maritime Culture',
      },
    ],
    furtherReading: [
      {
        slug: 'bodrum-beyond-the-coast-where-the-aegean-slows-down',
        title: 'Bodrum Beyond the Coast: Where the Aegean Slows Down',
      },
      {
        slug: 'private-experiences-bodrum-beyond-the-marina',
        title: 'Private Experiences in Bodrum: Beyond the Marina',
      },
      {
        slug: 'bodrum-without-beach-clubs-a-different-rhythm',
        title: 'Bodrum Without Beach Clubs: A Different Rhythm',
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
      'A geological civilization of volcanic stone, subterranean settlement, monastic retreat, Byzantine continuity, and Anatolian craft memory paced by deep time.',
    heroStatement:
      'A civilization carved into volcanic stone, where geology became settlement, refuge, worship, and continuity.',
    metaTitle: 'Cappadocia — Cultural World — Creare',
    metaDescription:
      'A geological civilization of volcanic tuff, underground settlement networks, monastic Anatolian heritage, Byzantine continuity, and craft traditions shaped by deep time.',
    sections: [
      {
        title: 'Cultural Identity',
        body: 'Cappadocia is one of the rare places where geology did not merely influence civilization but materially formed it. Volcanic eruptions from Erciyes and Hasan Dağı laid down the tuff from which valleys, chambers, sanctuaries, and settlements were later carved. Stone is not backdrop here; it is the medium through which shelter, worship, storage, movement, and memory were made.\n\nUnderground cities, rock-cut monasteries, cave churches, domestic interiors, and fortified heights such as Uçhisar all testify to a culture of adaptation shaped by pressure, patience, and long duration. Human life on the plateau was organized through enclosure, concealment, carved thresholds, and the disciplined reading of terrain.\n\nThe result is not simply an extraordinary landscape. It is a civilization inscribed into geology, in which settlement patterns, devotional life, and everyday inhabitation remain materially legible in the stone itself.',
      },
      {
        title: 'Hidden Layers',
        body: 'What most visitors recognize in Cappadocia is the visible surface of a much deeper system. Beyond the familiar routes lies a region of partially mapped underground networks, inaccessible cave churches, hidden monastic rooms, carved service chambers, and local knowledge still held by archaeologists, historians, and craft families.\n\nDerinkuyu and Kaymaklı are only the most legible entrances into a wider subterranean intelligence. The region’s underground settlements, ventilation systems, defensive thresholds, and storage logics reframe Cappadocia as a world of concealed urbanism rather than scenic emptiness.\n\nIts hidden layers are not only physical. They are also temporal and interpretive. Valleys become legible differently when entered on foot, churches change meaning when read as liturgical environments rather than attractions, and stone interiors reveal a civilization built around persistence rather than display.',
      },
      {
        title: 'Gastronomy & Rituals',
        body: 'Cappadocia’s food and wine culture belong to the logic of the plateau: preservation, volcanic soil, seasonal endurance, river clay, and cultivation under material constraint. These are not rustic accessories to the landscape. They are among the oldest continuities in how the region has lived.\n\nCeramic cooking is part of a deeper Anatolian craft memory linking the Kızılırmak, vessel-making, storage, and table ritual. Likewise, wine belongs to the region’s identity as an old plateau civilization, not a lifestyle add-on. Cellars cut into stone, protected interiors, and continuity of cultivation all connect food directly to geology.\n\nMeaningful encounters emerge when these traditions are approached through those who still hold them in practice: potters, growers, producers, and families for whom adaptation to the plateau remains a lived intelligence rather than a performance of locality.',
      },
      {
        title: 'Private Access Potential',
        body: 'Private access in Cappadocia depends on a different kind of permission than on the coast or in the city. It sits at the intersection of archaeological protocol, institutional trust, religious and historical sensitivity, and local custodianship.\n\nThat may mean entry into a rock-cut church outside normal visiting conditions, movement through less visible subterranean passages, or invitation into a working craft, domestic, or vineyard environment that remains outside the public tourism layer. In Cappadocia, access is rarely about exclusivity alone. It is about scale, silence, and the conditions needed to read a place accurately.\n\nWhat matters is not novelty for its own sake. It is the ability to encounter the plateau closer to how it was actually inhabited: carved into, withdrawn into, cultivated through, and understood over time.',
      },
      {
        title: 'Experience Philosophy',
        body: 'Cappadocia asks to be read through geological time rather than scenic appetite. Its visible forms are immediate, but their meaning appears more slowly: through silence, thresholds, erosion, carved interiors, altered scale, and the discipline of moving without haste.\n\nOur approach therefore shifts attention away from spectacle and toward inhabitation. A composed encounter here might begin in the pre-dawn stillness of a valley, continue underground or within a carved sacred interior, and end at a table where volcanic soil, craft memory, and family continuity remain active in the present.\n\nThis is not a place for itinerary thinking. It is a place for patience, descent, altered perspective, and revelation by degrees. Cappadocia becomes most legible when treated not as a beautiful place to visit, but as a civilization that learned to live inside geology.',
      },
    ],
    culturalSystems: [
      'Volcanic Landscape Civilization',
      'Underground Settlement Networks',
      'Monastic Anatolian Heritage',
      'Byzantine Continuity',
      'Anatolian Craft Memory',
    ],
    systemMappings: [
      {
        experienceTitle: 'Valley Before Dawn',
        culturalSystem: 'Volcanic Landscape Civilization',
        secondaryCulturalSystem: 'Byzantine Continuity',
      },
      {
        experienceTitle: 'Underground, Unexcavated',
        culturalSystem: 'Underground Settlement Networks',
        secondaryCulturalSystem: 'Volcanic Landscape Civilization',
      },
      {
        experienceTitle: 'Volcanic Terroir',
        culturalSystem: 'Anatolian Craft Memory',
        secondaryCulturalSystem: 'Volcanic Landscape Civilization',
      },
    ],
    furtherReading: [
      {
        slug: 'cappadocia-without-balloons-a-different-kind-of-silence',
        title: 'Cappadocia Without Balloons: A Different Kind of Silence',
      },
      {
        slug: 'private-experiences-cappadocia-silence-space-access',
        title: 'Private Experiences in Cappadocia: Silence, Space, and Access',
      },
      {
        slug: 'cappadocia-without-tours-moving-outside-the-routes',
        title: 'Cappadocia Without Tours: Moving Outside the Routes',
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
