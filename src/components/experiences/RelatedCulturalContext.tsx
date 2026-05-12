import React from 'react';
import Link from 'next/link';

interface RelatedCulturalContextProps {
  culturalWorld: string;
  experienceTitle?: string;
}

const CULTURAL_WORLD_CONTEXTS: Record<
  string,
  { url?: string; paragraphs: Record<string, string> }
> = {
  istanbul: {
    url: '/cultural-worlds/istanbul',
    paragraphs: {
      'floating-salon-d-opera':
        'This experience exists within the cultural world of Istanbul, where the Bosphorus has been the stage for empire, trade, and artistic expression for millennia. The waters that carry this vessel have witnessed Byzantine ceremonies, Ottoman commerce, and the continuous reinvention of a city that refuses to be singular.',
      'beylerbeyi-1869':
        "This experience is rooted in Istanbul's Ottoman heritage — a city where imperial architecture still holds the memory of the ceremonies and rituals that shaped an empire. Beylerbeyi Palace stands as a physical archive of that world, preserved in stone and gilt.",
      'imperial-flavors':
        "This experience draws from Istanbul's position as the crossroads of three continents, where the imperial kitchen synthesized flavours from across the Ottoman world. The dishes you will taste carry the memory of trade routes, cultural exchange, and centuries of culinary refinement.",
      'istanbul-through-the-lens':
        'This experience unfolds across the layered geography of Istanbul — a city where Byzantine, Ottoman, and contemporary cultures exist simultaneously in the same landscape. Photography becomes a method of reading these layers, of understanding how a single place can hold so many histories.',
      'curated-art-salon':
        "This experience connects to Istanbul's living artistic culture — a city where contemporary creation continues the traditions of patronage and artistic exchange that have defined the city for centuries. The artists you will meet are part of a continuous lineage of makers and thinkers.",
      'silk-road-istanbul':
        'This experience traces the trading routes that made Istanbul the centre of the medieval world. The Grand Bazaar remains the physical manifestation of those routes — a living archive of the commerce, craftsmanship, and cultural exchange that built empires.',
      'golden-horn-regatta':
        "This experience unfolds on the Golden Horn, one of Istanbul's most storied waterways — a place where Byzantine fleets once anchored, where Ottoman commerce flowed, and where the city's relationship with the water has shaped its identity for thousands of years.",
      'princes-islands-regatta':
        "This experience takes place among the Princes' Islands, which have served as retreats for Istanbul's elite since Byzantine times. The islands hold the memory of imperial leisure, monastic communities, and the continuous desire to escape the intensity of the city while remaining within its sphere.",
      'driven-by-performance':
        "This experience is grounded in Istanbul's contemporary culture — a city that has always been defined by motion, transformation, and the drive to exceed limits. The principles of performance you will explore are rooted in the city's own relentless energy.",
      'the-studio-session':
        "This experience takes place in Karaköy, one of Istanbul's most experimental creative districts — a neighbourhood where contemporary artistic practice continues the city's long history of cultural production and artistic innovation.",
      'cultural-immersion-lab':
        "This experience unfolds in Balat, one of Istanbul's most layered neighbourhoods, where Byzantine, Ottoman, and contemporary cultures exist in the same streets. The neighbourhood itself becomes a text to be read, understood, and interpreted.",
      'narrative-workshop':
        "This experience is rooted in Istanbul's role as a city of stories — a place where narrative has always been central to how the city understands itself. The frameworks you will develop are grounded in the city's own narrative complexity.",
      'private-bosphorus-access':
        "This experience unfolds on the Bosphorus, the waterway that defines Istanbul's geography and identity. The strait has been the stage for empires, the boundary between continents, and the physical manifestation of the city's position at the intersection of worlds.",
      'closed-collection-viewing':
        "This experience connects to Istanbul's role as a centre of collecting and patronage — a city where private collections hold works that span centuries and continents. The collection you will view is part of Istanbul's hidden cultural infrastructure.",
      'after-hours-palace':
        "This experience takes place in a historic palace on the Asian shore — a building that holds the memory of Ottoman imperial life and the continuous transformation of Istanbul's relationship with power, beauty, and cultural memory.",
    },
  },
  aegean: {
    paragraphs: {
      'table-to-farm-bodrum':
        'This experience exists within the cultural world of the Aegean, where the relationship between land and sea has shaped human civilization for three thousand years. The farm sits at the intersection of that ancient relationship — rooted in the soil, open to the water, part of a continuous lineage of cultivation and care.',
    },
  },
  bodrum: {
    url: '/cultural-worlds/bodrum',
    paragraphs: {
      'table-to-farm-bodrum':
        "This experience is rooted in Bodrum's position on the Aegean coast — a peninsula where ancient Halicarnassus, Crusader architecture, and contemporary coastal life converge. The farm you will visit is part of Bodrum's living relationship with its landscape, where agriculture and hospitality remain inseparable.",
    },
  },
  cappadocia: {
    url: '/cultural-worlds/cappadocia',
    paragraphs: {},
  },
};

export default function RelatedCulturalContext({
  culturalWorld,
  experienceTitle,
}: RelatedCulturalContextProps) {
  const worldKey = culturalWorld.toLowerCase();
  const worldConfig = CULTURAL_WORLD_CONTEXTS[worldKey];

  if (!worldConfig) {
    return null;
  }

  const experienceKey = experienceTitle
    ? experienceTitle
        .toLowerCase()
        .replace(/[™®]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    : '';
  const normalizedExperienceKey = experienceTitle?.includes("Floating Salon d'Opera")
    ? 'floating-salon-d-opera'
    : experienceKey;

  const contextParagraph =
    normalizedExperienceKey && worldConfig.paragraphs[normalizedExperienceKey]
      ? worldConfig.paragraphs[normalizedExperienceKey]
      : `This experience is rooted in the cultural world of ${culturalWorld}, shaped by its history, traditions, and living heritage.`;

  // Strip trailing period from paragraph text so the link integrates cleanly
  const paragraphText = contextParagraph.replace(/\.\s*$/, '');

  return (
    <section className="bg-white py-20 md:py-28" aria-label="Cultural context">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <p className="font-body text-base text-neutral-700 leading-relaxed mb-6">
            {paragraphText}
            {' — '}
            {worldConfig.url ? (
              <Link
                href={worldConfig.url}
                className="text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:text-neutral-600 hover:decoration-neutral-400 transition-colors font-medium"
              >
                {culturalWorld}
              </Link>
            ) : (
              <span className="text-neutral-900 font-medium">{culturalWorld}</span>
            )}
            .
          </p>
        </div>
      </div>
    </section>
  );
}
