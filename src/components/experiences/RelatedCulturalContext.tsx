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
        'Bu deneyim, Boğazın binyıllar boyunca imparatorlukların, ticaretin ve sanatsal ifadenin sahnesi olduğu İstanbul kültürel dünyasında var olur. Bu tekneyi taşıyan sular, Bizans törenlerine, Osmanlı ticaretine ve tek bir kimliğe indirgenmeyi reddeden bir şehrin sürekli yeniden kuruluşuna tanıklık etmiştir.',
      'beylerbeyi-1869':
        'Bu deneyim, İstanbul’un Osmanlı mirasına dayanır; imparatorluk mimarisinin hâlâ bir imparatorluğu şekillendiren törenlerin ve ritüellerin hafızasını taşıdığı bir şehre. Beylerbeyi Sarayı, taşında ve varaklarında korunmuş bu dünyanın fiziksel arşivi olarak ayakta durur.',
      'imperial-flavors':
        'Bu deneyim, İstanbul’un üç kıtanın kavşağı oluşundan beslenir; imparatorluk mutfağının Osmanlı coğrafyasının dört yanından tatları bir araya getirdiği bir şehirden. Tadacağınız yemekler, ticaret yollarının, kültürel alışverişin ve yüzyıllara yayılan mutfak inceliğinin hafızasını taşır.',
      'istanbul-through-the-lens':
        'Bu deneyim, İstanbul’un katmanlı coğrafyasında açılır; Bizans, Osmanlı ve çağdaş kültürlerin aynı manzara içinde eşzamanlı var olduğu bir şehirde. Fotoğraf, bu katmanları okumanın; tek bir yerin nasıl bu kadar çok tarihi taşıyabildiğini anlamanın bir yoluna dönüşür.',
      'curated-art-salon':
        'Bu deneyim, İstanbul’un yaşayan sanat kültürüne bağlanır; çağdaş üretimin, şehri yüzyıllar boyunca tanımlayan himaye ve sanatsal alışveriş geleneklerini sürdürdüğü bir dünyaya. Karşılaşacağınız sanatçılar, kesintisiz bir üretici ve düşünür hattının parçasıdır.',
      'silk-road-istanbul':
        'Bu deneyim, İstanbul’u Orta Çağ dünyasının merkezi hâline getiren ticaret yollarının izini sürer. Kapalıçarşı, bu yolların fiziksel tezahürü olmayı sürdürür; imparatorluklar kuran ticaretin, zanaatin ve kültürel alışverişin yaşayan arşivi olarak.',
      'golden-horn-regatta':
        "This experience unfolds on the Golden Horn, one of Istanbul's most storied waterways — a place where Byzantine fleets once anchored, where Ottoman commerce flowed, and where the city's relationship with the water has shaped its identity for thousands of years.",
      'princes-islands-regatta':
        "This experience takes place among the Princes' Islands, which have served as retreats for Istanbul's elite since Byzantine times. The islands hold the memory of imperial leisure, monastic communities, and the continuous desire to escape the intensity of the city while remaining within its sphere.",
      'driven-by-performance':
        "This experience is grounded in Istanbul's contemporary culture — a city that has always been defined by motion, transformation, and the drive to exceed limits. The principles of performance you will explore are rooted in the city's own relentless energy.",
      'the-studio-session':
        'Bu deneyim, İstanbul’un en deneysel yaratıcı bölgelerinden biri olan Karaköy’de gerçekleşir; çağdaş sanatsal pratiğin kentin uzun kültürel üretim ve yenilik tarihini sürdürdüğü bir mahallede.',
      'cultural-immersion-lab':
        "This experience unfolds in Balat, one of Istanbul's most layered neighbourhoods, where Byzantine, Ottoman, and contemporary cultures exist in the same streets. The neighbourhood itself becomes a text to be read, understood, and interpreted.",
      'narrative-workshop':
        "This experience is rooted in Istanbul's role as a city of stories — a place where narrative has always been central to how the city understands itself. The narratives you will shape are grounded in the city's own complexity.",
      'private-bosphorus-access':
        "This experience unfolds on the Bosphorus, the waterway that defines Istanbul's geography and identity. The strait has been the stage for empires, the boundary between continents, and the physical manifestation of the city's position at the intersection of worlds.",
      'closed-collection-viewing':
        "This experience connects to Istanbul's role as a centre of collecting and patronage — a city where private collections hold works that span centuries and continents. The collection you will view is part of Istanbul's hidden cultural infrastructure.",
      'after-hours-palace':
        "This experience takes place in a historic palace on the Asian shore — a building that holds the memory of Ottoman imperial life and the continuous transformation of Istanbul's relationship with power, beauty, and cultural memory.",
    },
  },
  bodrum: {
    url: '/cultural-worlds/bodrum',
    paragraphs: {
      'table-to-farm-bodrum':
        'Bu deneyim, Bodrum’un Ege kıyısındaki konumuna dayanır; antik Halikarnassos’un, Haçlı mimarisinin ve çağdaş kıyı yaşamının kesiştiği bir yarımadaya. Ziyaret edeceğiniz çiftlik, Bodrum’un manzarasıyla kurduğu yaşayan ilişkinin bir parçasıdır; burada tarım ve misafirperverlik birbirinden ayrılmaz.',
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
      : `Bu deneyim, tarihi, gelenekleri ve yaşayan mirasıyla şekillenen ${culturalWorld} kültürel dünyasına dayanır.`;

  // Strip trailing period from paragraph text so the link integrates cleanly
  const paragraphText = contextParagraph.replace(/\.\s*$/, '');

  return (
    <section className="bg-white py-20 md:py-28" aria-label="Kültürel bağlam">
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
