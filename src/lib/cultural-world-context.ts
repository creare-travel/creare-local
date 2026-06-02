interface CulturalWorldContextDefinition {
  definition: string;
  introParagraphs: string[];
  characteristics: string[];
  preferredMoods?: string[];
  preferredGeoTypes?: string[];
  preferredTags?: string[];
  secondaryExperienceSlugs?: string[];
}

interface CulturalWorldContextFallbackInput {
  name?: string;
  slug?: string;
  highlight?: string;
  introText?: string;
  description?: unknown;
}

export interface ResolvedCulturalWorldContext extends CulturalWorldContextDefinition {
  name?: string;
  slug?: string;
}

const CULTURAL_WORLD_CONTEXT: Record<string, CulturalWorldContextDefinition> = {
  istanbul: {
    definition:
      'A cultural world shaped by thresholds, water, and layered sovereignties that continue to organize movement, ritual, and perception.',
    introParagraphs: [
      'Istanbul is not reducible to a skyline or a chronology. It operates as a system of thresholds: shore to shore, court to street, ceremony to improvisation. Meaning here emerges through passage rather than monument alone.',
      'Water is not scenery in this world. The Bosphorus, the Golden Horn, and the in-between coastlines structure how privacy, trade, authority, and encounter have historically been arranged. To move across Istanbul is to move through changing regimes of attention.',
      'CREARE reads Istanbul as a living cultural world in which imperial memory, maritime rhythm, domestic interiors, and contemporary making continue to overlap. The experiences connected to it are shaped through access, pacing, and the interpretation of layered time.',
    ],
    characteristics: [
      'Thresholds matter as much as destinations: crossings, passages, and hidden interiors define how the city is understood.',
      'Water organizes the logic of the world, shaping movement, visibility, ceremony, and social distance.',
      'Imperial memory remains active in architecture, etiquette, collecting, and the staging of private space.',
      'Contemporary cultural production coexists with inherited ritual rather than replacing it.',
      'Interpretation depends on rhythm: the city reveals itself through sequencing, not overview.',
    ],
    preferredMoods: ['performance', 'celebration', 'gastronomy', 'stillness'],
    preferredGeoTypes: ['signature', 'seasonal', 'private'],
  },
  bodrum: {
    definition:
      'A Halicarnassian cultural world in which archaeology, maritime movement, cultivated land, and hosted sociability continue to shape the peninsula as a whole.',
    introParagraphs: [
      'Bodrum is not best understood as a summer coast. It is a peninsula system whose present remains inseparable from Halicarnassus, from the maritime routes that connected Caria to the wider Aegean, and from the cultivated ground that still structures life beyond the shoreline.',
      'The sea matters here not as scenery but as movement: anchorages, gulets, fishing memory, sponge-diving histories, castle approaches, and the shifting relation between harbor, bay, workshop, and table. Bodrum becomes legible through passage rather than panorama.',
      'CREARE approaches Bodrum as a Halicarnassian cultural world in which archaeology, hosted table culture, olive and vineyard landscapes, and literary afterlife coexist. The experiences connected to it are shaped by sequence, access, and the peninsula’s older social intelligence.',
    ],
    characteristics: [
      'Maritime Peninsula: shoreline, harbor, anchorage, workshop, and hillside are part of one continuous spatial system.',
      'Archaeological Memory: Halicarnassus remains active through ruins, reused stone, castle massing, and the peninsula’s historical self-understanding.',
      'Hosted Table Culture: food, receiving, and social rhythm structure how Bodrum is actually lived rather than merely visited.',
      'Cultivated Landscapes: olive ground, vineyards, orchards, and producer knowledge give the peninsula depth beyond the marina surface.',
      'Literary & Intellectual Coast: Bodrum carries an afterlife shaped by writers, artists, and reflective retreat rather than leisure alone.',
    ],
    preferredMoods: ['celebration', 'gastronomy', 'stillness'],
    preferredGeoTypes: ['signature', 'seasonal', 'private'],
    preferredTags: ['archaeology', 'maritime', 'table', 'cultivation', 'literary'],
  },
  cappadocia: {
    definition:
      'A geological civilization in which volcanic time, subterranean settlement, monastic withdrawal, and carved habitation still determine how the region is read.',
    introParagraphs: [
      'Cappadocia is not best understood as a scenic destination. It is a volcanic plateau whose settlement history, religious life, and material culture were shaped directly by tuff, erosion, enclosure, and the long discipline of adapting human life to geological conditions.',
      'This world is organized by verticality and concealment: valleys cut by erosion, rock-cut thresholds, cave churches, hidden chambers, and underground cities that transformed geology into refuge, worship, storage, and settlement. Meaning emerges here through inhabitation rather than viewpoint alone.',
      'CREARE approaches Cappadocia as a civilization carved into stone. Experiences connected to it are shaped by deep time, monastic withdrawal, subterranean systems, Anatolian continuity, and the slower forms of attention required by a landscape that was never meant to be consumed at speed.',
    ],
    characteristics: [
      'Volcanic Landscape Civilization: geology is the primary medium of settlement, worship, storage, movement, and memory.',
      'Underground Settlement Networks: Derinkuyu, Kaymaklı, and related systems define Cappadocia as a region of concealed urban intelligence rather than open spectacle.',
      'Monastic Anatolian Heritage: retreat, liturgy, fresco cycles, and carved sanctuaries remain central to the region’s cultural logic.',
      'Byzantine Continuity: cave churches, devotional space, and sacred architecture keep late antique and Byzantine inheritance materially present.',
      'Anatolian Craft Memory: clay, ceramic making, wine, food preservation, and domestic adaptation connect the plateau’s material culture to lived continuity.',
    ],
    preferredMoods: ['stillness', 'performance'],
    preferredGeoTypes: ['private', 'seasonal', 'signature'],
    preferredTags: ['geology', 'subterranean', 'monastic', 'byzantine', 'craft'],
    secondaryExperienceSlugs: ['the-salon-of-hands', 'beylerbeyi-1869-empire-interrupted'],
  },
};

function toParagraphs(value?: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  }
  if (typeof value !== 'string') return [];

  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getCulturalWorldContext(
  input: CulturalWorldContextFallbackInput
): ResolvedCulturalWorldContext {
  const normalizedSlug = input.slug?.trim().toLowerCase();
  const base = (normalizedSlug && CULTURAL_WORLD_CONTEXT[normalizedSlug]) || null;

  const fallbackParagraphs = [
    ...toParagraphs(input.introText),
    ...toParagraphs(input.description),
  ].slice(0, 3);

  return {
    name: input.name,
    slug: normalizedSlug,
    definition:
      base?.definition ||
      input.highlight ||
      `${input.name || 'This cultural world'} is approached through meaning, setting, and relation rather than tourism alone.`,
    introParagraphs:
      base?.introParagraphs && base.introParagraphs.length > 0
        ? base.introParagraphs
        : fallbackParagraphs.length > 0
          ? fallbackParagraphs
          : [
              `${input.name || 'This cultural world'} is treated as a system of memory, movement, and setting rather than a simple destination.`,
            ],
    characteristics:
      base?.characteristics && base.characteristics.length > 0
        ? base.characteristics
        : compactFallbackCharacteristics(input),
    preferredMoods: base?.preferredMoods,
    preferredGeoTypes: base?.preferredGeoTypes,
    preferredTags: base?.preferredTags,
    secondaryExperienceSlugs: base?.secondaryExperienceSlugs,
  };
}

function compactFallbackCharacteristics(input: CulturalWorldContextFallbackInput): string[] {
  const characteristics = [
    input.highlight ? `${input.highlight.replace(/\.\s*$/, '')}.` : null,
    input.name
      ? `${input.name} is approached as a cultural context rather than a sightseeing stop.`
      : null,
    'Meaning is built through access, pacing, and the relation between place and encounter.',
  ].filter(Boolean) as string[];

  return characteristics.slice(0, 4);
}
