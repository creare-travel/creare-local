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
      'A cultural world composed through carved stone, subterranean space, volcanic memory, and a slower choreography of movement.',
    introParagraphs: [
      'Cappadocia is not defined by spectacle alone. Its real structure lies in carved interiors, concealed chambers, softened horizons, and the geological memory that shapes every path through the terrain.',
      'This is a world where enclosure matters as much as openness. Valleys, cave rooms, thresholds cut into rock, and shifting viewpoints produce a spatial intelligence built on patience, silence, and altered scale.',
      'CREARE reads Cappadocia as a cultural world of material time. Experiences connected to it should emphasize stillness, surface, ritual movement, and forms of attention that emerge when landscape is entered rather than observed from a distance.',
    ],
    characteristics: [
      'Stone is not backdrop but structure, shaping movement, acoustics, shelter, and memory.',
      'The world is experienced through carved thresholds, interior voids, and gradual revelation rather than spectacle alone.',
      'Silence and pacing are part of the cultural logic, not simply atmospheric effects.',
      'Geological duration gives the landscape a sense of deep time that reorients human scale.',
      'Meaning accumulates through inhabitation, not overview.',
    ],
    preferredMoods: ['stillness', 'performance'],
    preferredGeoTypes: ['private', 'seasonal', 'signature'],
    secondaryExperienceSlugs: ['the-salon-of-hands', 'beylerbeyi-1869-empire-interrupted'],
  },
  aegean: {
    definition:
      'A cultural world where coast, cultivation, and maritime continuity remain in constant negotiation.',
    introParagraphs: [
      'The Aegean is not a generic seaside region. It is a field of relationships between inlet and plateau, olive ground and harbor, settlement and passage. The coast is meaningful because it has been repeatedly worked, crossed, and provisioned.',
      'This world is defined by continuity rather than monument alone. Maritime routes, cultivated tables, vernacular building, and seasonal return create a cultural logic in which movement and settlement depend on one another.',
      'CREARE approaches the Aegean as a world of long continuity: land and sea read together, hospitality understood through cultivation, and atmosphere shaped by the discipline of coastal living.',
    ],
    characteristics: [
      'Land and sea are reciprocal systems rather than separate themes.',
      'Cultivation, table culture, and shoreline movement belong to the same cultural logic.',
      'Seasonal return shapes memory, labor, and social rhythm.',
      'Meaning is distributed across coves, farms, harbors, and domestic thresholds.',
    ],
    preferredMoods: ['gastronomy', 'celebration', 'stillness'],
    preferredGeoTypes: ['seasonal', 'signature', 'private'],
    secondaryExperienceSlugs: ['table-to-farm-bodrum'],
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
