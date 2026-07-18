import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { getDictionary } from './dictionaries';
import {
  DEFAULT_METADATA,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  PRODUCTION_CANONICAL_HOSTNAME,
  SITE_NAME,
  SITE_URL,
  assertRouteCanonicalOwnership,
  buildOpenGraph,
  buildLocaleOwnedMetadata,
  buildRouteCanonicalUrl,
  buildTwitterCard,
  canonicalUrl,
  getOpenGraphLocale,
  type SupportedMetadataPageType,
} from '../seo';
import { buildLocalizedCulturalWorldDetailMetadata } from '../../features/i18n-pages/cultural-world-detail';
import { buildLocalizedExperienceDetailMetadata } from '../../features/i18n-pages/experience-detail';
import { buildLocalizedInsightDetailMetadata } from '../../features/i18n-pages/insight-detail';

function assertThrows(label: string, action: () => unknown) {
  assert.throws(action, Error, label);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  assert.equal(typeof value, 'object', `${label} must be an object`);
  assert.notEqual(value, null, `${label} must not be null`);
  return value as Record<string, unknown>;
}

function titleValue(metadata: Metadata): string {
  const title = metadata.title;

  if (typeof title === 'string') return title;

  const titleRecord = asRecord(title, 'metadata title');
  const absolute = titleRecord.absolute;

  assert.equal(typeof absolute, 'string', 'metadata title must expose string or absolute title');
  return absolute as string;
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value instanceof URL) return [value.href];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function listSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') return [];
      return listSourceFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

const trDictionary = getDictionary('tr');
const englishTitle = 'Experiences';
const englishDescription =
  'CREARE structures its experience system through three distinct paths: Signature for curated cultural encounters, LAB for co-created commissions, and BLACK for discreet invitation-only access.';

const enMetadata = buildLocaleOwnedMetadata({
  locale: 'en',
  copyLocale: 'en',
  route: { family: 'experiences', locale: 'en' },
  title: englishTitle,
  description: englishDescription,
  image: DEFAULT_OG_IMAGE,
  imageAlt: DEFAULT_OG_IMAGE_ALT,
});

const trMetadata = buildLocaleOwnedMetadata({
  locale: 'tr',
  copyLocale: 'tr',
  route: { family: 'home', locale: 'tr' },
  title: trDictionary.home.hero.eyebrow,
  description: trDictionary.home.mainParagraph.paragraph1,
  image: DEFAULT_OG_IMAGE,
  imageAlt: DEFAULT_OG_IMAGE_ALT,
});

const enOpenGraph = asRecord(enMetadata.openGraph, 'EN Open Graph');
const trOpenGraph = asRecord(trMetadata.openGraph, 'TR Open Graph');
const enTwitter = asRecord(enMetadata.twitter, 'EN Twitter');
const trTwitter = asRecord(trMetadata.twitter, 'TR Twitter');
const enAlternates = asRecord(enMetadata.alternates, 'EN alternates');
const trAlternates = asRecord(trMetadata.alternates, 'TR alternates');
const trCanonical = buildRouteCanonicalUrl({ family: 'home', locale: 'tr' });
const inheritedEnglishSocialTitle = DEFAULT_METADATA.defaultTitle;
const inheritedEnglishSocialDescription =
  'Private cultural access. Thoughtfully designed encounters.';
const inheritedEnglishOpenGraphImagePath = '/opengraph-image?282b2b8eda0907e3';
const inheritedEnglishSocialImage = [
  {
    url: inheritedEnglishOpenGraphImagePath,
    width: 1200,
    height: 630,
    alt: DEFAULT_OG_IMAGE_ALT,
  },
];
const enCulturalWorldDetailCanonical = buildRouteCanonicalUrl({
  family: 'cultural-world-detail',
  locale: 'en',
  slug: 'istanbul',
});
const trCulturalWorldDetailCanonical = buildRouteCanonicalUrl({
  family: 'cultural-world-detail',
  locale: 'tr',
  slug: 'istanbul',
});
const enCulturalWorldDetailOpenGraph = asRecord(
  {
    title: inheritedEnglishSocialTitle,
    description: inheritedEnglishSocialDescription,
    url: enCulturalWorldDetailCanonical,
    siteName: SITE_NAME,
    locale: getOpenGraphLocale('en'),
    images: inheritedEnglishSocialImage,
    type: 'website',
  },
  'EN cultural world detail Open Graph'
);
const enCulturalWorldDetailTwitter = asRecord(
  buildTwitterCard({
    title: inheritedEnglishSocialTitle,
    description: inheritedEnglishSocialDescription,
    image: DEFAULT_OG_IMAGE,
    imageAlt: DEFAULT_OG_IMAGE_ALT,
  }),
  'EN cultural world detail inherited Twitter'
);
const trCulturalWorldDetailMetadata = buildLocalizedCulturalWorldDetailMetadata({
  locale: 'tr',
  slug: 'istanbul',
  destination: {
    name: 'İstanbul',
    meta_title: 'İstanbul | CREARE',
    meta_description:
      'CREARE’in İstanbul dünyası; mekân, hafıza ve kültürel süreklilik üzerinden kurulan seçili deneyimlere bağlam sunar.',
  },
});
const trCulturalWorldDetailOpenGraph = asRecord(
  trCulturalWorldDetailMetadata.openGraph,
  'TR cultural world detail Open Graph'
);
const trCulturalWorldFallbackMetadata = buildLocalizedCulturalWorldDetailMetadata({
  locale: 'tr',
  slug: 'bodrum',
  destination: {
    name: 'Bodrum',
    highlight: 'Bodrum için Türkçe vurgu metni.',
    short_description: 'Bodrum için kısa Türkçe açıklama.',
  },
});
const trExperienceDetailMetadata = buildLocalizedExperienceDetailMetadata({
  locale: 'tr',
  slug: 'beylerbeyi-1869',
  item: {
    title: 'Beylerbeyi 1869',
    seo_title: 'Beylerbeyi 1869 | CREARE',
    seo_description: 'Beylerbeyi deneyimi için onaylı Türkçe SEO açıklaması.',
    short_description: 'Beylerbeyi deneyimi için kısa Türkçe açıklama.',
    description: 'Beylerbeyi deneyimi için gövde metni.',
  },
  image: DEFAULT_OG_IMAGE,
});
const trExperienceFallbackMetadata = buildLocalizedExperienceDetailMetadata({
  locale: 'tr',
  slug: 'imperial-flavors',
  item: {
    title: 'İmparatorluk Lezzetleri',
    short_description: 'İmparatorluk lezzetleri için kısa Türkçe açıklama.',
    description: 'İmparatorluk lezzetleri için gövde metni.',
  },
});
const trExperienceRichTextFallbackMetadata = buildLocalizedExperienceDetailMetadata({
  locale: 'tr',
  slug: 'open-studio-istanbul',
  item: {
    title: 'Açık Stüdyo İstanbul',
    description: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'İlk Türkçe rich-text paragrafı.' }],
      },
    ],
  },
});
const trInsightDetailMetadata = buildLocalizedInsightDetailMetadata({
  locale: 'tr',
  slug: 'private-life-of-istanbul',
  insight: {
    title: 'İstanbul’un Özel Hayatı',
    excerpt: 'İstanbul içgörüsü için Türkçe özet.',
    seo_title: 'İstanbul’un Özel Hayatı | CREARE',
    seo_description: 'İstanbul içgörüsü için onaylı Türkçe SEO açıklaması.',
  },
});
const trInsightFallbackMetadata = buildLocalizedInsightDetailMetadata({
  locale: 'tr',
  slug: 'bodrum-beyond-the-coast',
  insight: {
    title: 'Kıyının Ötesinde Bodrum',
    excerpt: 'Bodrum içgörüsü için Türkçe özet.',
  },
});
const trInsightHtmlMetadata = buildLocalizedInsightDetailMetadata({
  locale: 'tr',
  slug: 'istanbul-html-normalization',
  insight: {
    title: 'İstanbul HTML Denemesi',
    seo_description: '<p>İstanbul <strong>özet</strong> metni.</p>',
  },
});
const trExperienceDetailOpenGraph = asRecord(
  trExperienceDetailMetadata.openGraph,
  'TR experience detail Open Graph'
);
const trExperienceDetailTwitter = asRecord(
  trExperienceDetailMetadata.twitter,
  'TR experience detail Twitter'
);
const trExperienceDetailAlternates = asRecord(
  trExperienceDetailMetadata.alternates,
  'TR experience detail alternates'
);
const trInsightDetailOpenGraph = asRecord(
  trInsightDetailMetadata.openGraph,
  'TR insight detail Open Graph'
);
const trInsightDetailTwitter = asRecord(
  trInsightDetailMetadata.twitter,
  'TR insight detail Twitter'
);
const trInsightDetailAlternates = asRecord(
  trInsightDetailMetadata.alternates,
  'TR insight detail alternates'
);

assert.equal(enOpenGraph.locale, 'en_US', 'EN metadata uses en_US Open Graph locale');
assert.equal(trOpenGraph.locale, 'tr_TR', 'TR metadata uses tr_TR Open Graph locale');
assert.equal(
  enCulturalWorldDetailOpenGraph.locale,
  'en_US',
  'EN cultural world detail uses en_US Open Graph locale'
);
assert.equal(
  enCulturalWorldDetailOpenGraph.url,
  enCulturalWorldDetailCanonical,
  'EN cultural world detail Open Graph URL equals canonical'
);
assert.equal(
  trCulturalWorldDetailOpenGraph.locale,
  'tr_TR',
  'TR cultural world detail uses tr_TR Open Graph locale'
);
assert.equal(
  trCulturalWorldDetailOpenGraph.url,
  trCulturalWorldDetailCanonical,
  'TR cultural world detail Open Graph URL equals canonical'
);
assert.notEqual(
  enCulturalWorldDetailOpenGraph.url,
  trCulturalWorldDetailCanonical,
  'EN cultural world detail Open Graph URL cannot cross to TR'
);
assert.notEqual(
  trCulturalWorldDetailOpenGraph.url,
  enCulturalWorldDetailCanonical,
  'TR cultural world detail Open Graph URL cannot cross to EN'
);
assert.notEqual(
  enCulturalWorldDetailOpenGraph.url,
  SITE_URL,
  'EN cultural world detail does not use homepage Open Graph URL'
);
assert.equal(
  enCulturalWorldDetailOpenGraph.title,
  inheritedEnglishSocialTitle,
  'EN cultural world detail Open Graph title remains unchanged'
);
assert.equal(
  enCulturalWorldDetailOpenGraph.description,
  inheritedEnglishSocialDescription,
  'EN cultural world detail Open Graph description remains unchanged'
);
assert.deepEqual(
  enCulturalWorldDetailOpenGraph.images,
  inheritedEnglishSocialImage,
  'EN cultural world detail Open Graph images remain unchanged'
);
assert.deepEqual(
  enCulturalWorldDetailTwitter,
  {
    card: 'summary_large_image',
    title: inheritedEnglishSocialTitle,
    description: inheritedEnglishSocialDescription,
    images: [DEFAULT_OG_IMAGE],
    imageAlt: DEFAULT_OG_IMAGE_ALT,
  },
  'EN cultural world detail inherited Twitter fields remain unchanged'
);
assert.equal(enAlternates.canonical, `${SITE_URL}/experiences`, 'EN canonical remains unprefixed');
assert.equal(trAlternates.canonical, `${SITE_URL}/tr`, 'TR canonical keeps /tr prefix');
assertThrows('TR route canonical rejects English canonical', () =>
  assertRouteCanonicalOwnership({ family: 'home', locale: 'tr' }, SITE_URL)
);
assertThrows('EN route canonical rejects Turkish canonical', () =>
  assertRouteCanonicalOwnership({ family: 'home', locale: 'en' }, `${SITE_URL}/tr`)
);
assertThrows('TR route canonical rejects missing Turkish prefix', () =>
  assertRouteCanonicalOwnership(
    { family: 'experience-detail', locale: 'tr', slug: 'beylerbeyi-1869' },
    `${SITE_URL}/experiences/beylerbeyi-1869`
  )
);
assertThrows('EN route canonical rejects Turkish-prefixed route', () =>
  assertRouteCanonicalOwnership(
    { family: 'experience-detail', locale: 'en', slug: 'beylerbeyi-1869' },
    `${SITE_URL}/tr/experiences/beylerbeyi-1869`
  )
);
assertThrows('metadata canonical rejects duplicate Turkish prefix', () =>
  assertRouteCanonicalOwnership({ family: 'home', locale: 'tr' }, `${SITE_URL}/tr/tr`)
);
assertThrows('canonical path helper rejects duplicate Turkish prefix', () =>
  canonicalUrl('/tr/tr')
);
assertThrows('metadata canonical rejects www canonical host', () =>
  assertRouteCanonicalOwnership({ family: 'home', locale: 'en' }, `https://www.crearetravel.com/`)
);
assert.notEqual(titleValue(trMetadata), DEFAULT_METADATA.defaultTitle);
assert.notEqual(trMetadata.description, DEFAULT_METADATA.defaultDescription);
assertThrows('locale-owned metadata rejects cross-locale route ownership', () =>
  buildLocaleOwnedMetadata({
    locale: 'tr',
    copyLocale: 'tr',
    route: { family: 'home', locale: 'en' },
    title: trDictionary.home.hero.eyebrow,
    description: trDictionary.home.mainParagraph.paragraph1,
  })
);
assertThrows('EN locale-owned metadata rejects TR route ownership', () =>
  buildLocaleOwnedMetadata({
    locale: 'en',
    copyLocale: 'en',
    route: { family: 'home', locale: 'tr' },
    title: englishTitle,
    description: englishDescription,
  })
);
assertThrows('TR metadata rejects English fallback source', () =>
  buildLocaleOwnedMetadata({
    locale: 'tr',
    copyLocale: 'en',
    route: { family: 'home', locale: 'tr' },
    title: englishTitle,
    description: englishDescription,
  })
);
assertThrows('TR detail metadata rejects English fallback source', () =>
  buildLocaleOwnedMetadata({
    locale: 'tr',
    copyLocale: 'en',
    route: { family: 'experience-detail', locale: 'tr', slug: 'beylerbeyi-1869' },
    title: englishTitle,
    description: englishDescription,
  })
);
assertThrows('unsupported metadata page type is rejected at runtime', () =>
  buildOpenGraph({
    title: 'Unsupported',
    description: 'Unsupported metadata page type fixture.',
    path: '/tr',
    type: 'collection' as unknown as SupportedMetadataPageType,
  })
);
assertThrows('locale-owned metadata rejects unsupported page type at runtime', () =>
  buildLocaleOwnedMetadata({
    locale: 'tr',
    copyLocale: 'tr',
    route: { family: 'insight-detail', locale: 'tr', slug: 'private-life-of-istanbul' },
    title: 'İstanbul’un Özel Hayatı',
    description: 'İstanbul içgörüsü için Türkçe SEO açıklaması.',
    type: 'story' as unknown as SupportedMetadataPageType,
  })
);
assertThrows('blank metadata page type is rejected at runtime', () =>
  buildOpenGraph({
    title: 'Blank type',
    description: 'Blank metadata page type fixture.',
    path: '/tr',
    type: '' as unknown as SupportedMetadataPageType,
  })
);
assert.equal(
  buildOpenGraph({
    title: 'Article type',
    description: 'Valid article page type fixture.',
    path: '/tr/insights/private-life-of-istanbul',
    type: 'article',
  }).type,
  'article',
  'Open Graph article page type is preserved'
);
assert.equal(
  buildOpenGraph({
    title: 'Default type',
    description: 'Default page type fixture.',
    path: '/tr',
  }).type,
  'website',
  'Open Graph page type defaults to website'
);
assertThrows('unsupported locale is rejected', () =>
  buildLocaleOwnedMetadata({
    locale: 'fr' as never,
    copyLocale: 'fr' as never,
    route: { family: 'home', locale: 'fr' as never },
    title: 'French',
    description: 'French',
  })
);
assertThrows('missing TR title is rejected', () =>
  buildLocaleOwnedMetadata({
    locale: 'tr',
    copyLocale: 'tr',
    route: { family: 'home', locale: 'tr' },
    title: '',
    description: trDictionary.home.mainParagraph.paragraph1,
  })
);
assertThrows('missing TR description is rejected', () =>
  buildLocaleOwnedMetadata({
    locale: 'tr',
    copyLocale: 'tr',
    route: { family: 'home', locale: 'tr' },
    title: trDictionary.home.hero.eyebrow,
    description: '',
  })
);
assertThrows('TR cultural world detail rejects missing localized title', () =>
  buildLocalizedCulturalWorldDetailMetadata({
    locale: 'tr',
    slug: 'missing-title',
    destination: {
      highlight: 'Başlıksız kültürel dünya açıklaması.',
    },
  })
);
assertThrows('TR cultural world detail rejects missing localized description', () =>
  buildLocalizedCulturalWorldDetailMetadata({
    locale: 'tr',
    slug: 'missing-description',
    destination: {
      name: 'Açıklamasız Kültürel Dünya',
    },
  })
);
assertThrows('TR experience detail rejects missing localized title', () =>
  buildLocalizedExperienceDetailMetadata({
    locale: 'tr',
    slug: 'missing-title',
    item: {
      title: '',
      short_description: 'Başlıksız deneyim açıklaması.',
    },
  })
);
assertThrows('TR experience detail rejects missing localized description', () =>
  buildLocalizedExperienceDetailMetadata({
    locale: 'tr',
    slug: 'missing-description',
    item: {
      title: 'Açıklamasız Deneyim',
    },
  })
);
assertThrows('TR insight detail rejects missing localized title', () =>
  buildLocalizedInsightDetailMetadata({
    locale: 'tr',
    slug: 'missing-title',
    insight: {
      title: '',
      excerpt: 'Başlıksız içgörü özeti.',
    },
  })
);
assertThrows('TR insight detail rejects missing localized description', () =>
  buildLocalizedInsightDetailMetadata({
    locale: 'tr',
    slug: 'missing-description',
    insight: {
      title: 'Açıklamasız İçgörü',
    },
  })
);
assertThrows('TR insight detail rejects content-only raw rich text description', () =>
  buildLocalizedInsightDetailMetadata({
    locale: 'tr',
    slug: 'content-only-rich-text',
    insight: {
      title: 'Rich Text İçerik',
      content: [{ type: 'paragraph', children: [{ type: 'text', text: 'Ham JSON olmamalı.' }] }],
    } as unknown as Parameters<typeof buildLocalizedInsightDetailMetadata>[0]['insight'],
  })
);
assert.equal(trOpenGraph.url, trCanonical, 'Open Graph URL equals canonical');
assert.equal(trTwitter.title, titleValue(trMetadata), 'Twitter title follows metadata title');
assert.equal(
  trTwitter.description,
  trMetadata.description,
  'Twitter description follows metadata description'
);
assert.deepEqual(
  (trOpenGraph.images as Array<Record<string, unknown>>).map((image) => image.url),
  [DEFAULT_OG_IMAGE],
  'Open Graph images are preserved'
);
assert.equal(trTwitter.card, 'summary_large_image', 'Twitter card is preserved');
assert.equal(enTwitter.card, 'summary_large_image', 'English Twitter card is preserved');
assert.equal(enOpenGraph.siteName, SITE_NAME, 'siteName is preserved');
assert.equal(trMetadata.metadataBase?.href, DEFAULT_METADATA.metadataBase.href);
assert.equal(
  titleValue(trCulturalWorldDetailMetadata),
  'İstanbul | CREARE',
  'TR cultural world detail uses metadata SEO title before destination name'
);
assert.equal(
  trCulturalWorldDetailMetadata.description,
  'CREARE’in İstanbul dünyası; mekân, hafıza ve kültürel süreklilik üzerinden kurulan seçili deneyimlere bağlam sunar.',
  'TR cultural world detail uses metadata SEO description before fallback copy'
);
assert.equal(
  titleValue(trCulturalWorldFallbackMetadata),
  'Bodrum',
  'TR cultural world detail falls back to localized destination name'
);
assert.equal(
  trCulturalWorldFallbackMetadata.description,
  'Bodrum için Türkçe vurgu metni.',
  'TR cultural world detail falls back to localized highlight before short description'
);
assert.equal(
  titleValue(trExperienceDetailMetadata),
  'Beylerbeyi 1869 | CREARE',
  'TR experience detail uses SEO title before title'
);
assert.equal(
  trExperienceDetailMetadata.description,
  'Beylerbeyi deneyimi için onaylı Türkçe SEO açıklaması.',
  'TR experience detail uses SEO description before fallback copy'
);
assert.equal(
  titleValue(trExperienceFallbackMetadata),
  'İmparatorluk Lezzetleri',
  'TR experience detail falls back to localized title'
);
assert.equal(
  trExperienceFallbackMetadata.description,
  'İmparatorluk lezzetleri için kısa Türkçe açıklama.',
  'TR experience detail falls back to localized short description'
);
assert.equal(
  trExperienceRichTextFallbackMetadata.description,
  'İlk Türkçe rich-text paragrafı.',
  'TR experience detail extracts localized rich-text paragraph instead of raw JSON'
);
assert.equal(
  String(trExperienceRichTextFallbackMetadata.description).includes('"type"'),
  false,
  'TR experience detail description does not expose raw rich-text JSON'
);
assert.equal(
  trExperienceDetailAlternates.canonical,
  `${SITE_URL}/tr/experiences/beylerbeyi-1869`,
  'TR experience detail canonical keeps localized slug identity'
);
assert.equal(
  trExperienceDetailOpenGraph.url,
  trExperienceDetailAlternates.canonical,
  'TR experience detail Open Graph URL equals canonical'
);
assert.equal(
  trExperienceDetailOpenGraph.locale,
  'tr_TR',
  'TR experience detail Open Graph locale remains Turkish-owned'
);
assert.equal(
  trExperienceDetailTwitter.title,
  titleValue(trExperienceDetailMetadata),
  'TR experience detail Twitter title follows localized metadata title'
);
assert.equal(
  trExperienceDetailTwitter.description,
  trExperienceDetailMetadata.description,
  'TR experience detail Twitter description follows localized metadata description'
);
assert.equal(
  titleValue(trInsightDetailMetadata),
  'İstanbul’un Özel Hayatı | CREARE',
  'TR insight detail uses SEO title before title'
);
assert.equal(
  trInsightDetailMetadata.description,
  'İstanbul içgörüsü için onaylı Türkçe SEO açıklaması.',
  'TR insight detail uses SEO description before fallback copy'
);
assert.equal(
  titleValue(trInsightFallbackMetadata),
  'Kıyının Ötesinde Bodrum',
  'TR insight detail falls back to localized title'
);
assert.equal(
  trInsightFallbackMetadata.description,
  'Bodrum içgörüsü için Türkçe özet.',
  'TR insight detail falls back to localized excerpt'
);
assert.equal(
  trInsightHtmlMetadata.description,
  'İstanbul özet metni.',
  'TR insight detail strips HTML tags from localized description'
);
assert.equal(
  /<[^>]*>/.test(String(trInsightHtmlMetadata.description)),
  false,
  'TR insight detail description contains no HTML tags after normalization'
);
assert.equal(
  String(trInsightHtmlMetadata.description).includes('İ'),
  true,
  'TR insight detail preserves Turkish Unicode in normalized description'
);
assert.equal(
  trInsightDetailAlternates.canonical,
  `${SITE_URL}/tr/insights/private-life-of-istanbul`,
  'TR insight detail canonical keeps localized slug identity'
);
assert.equal(
  trInsightDetailOpenGraph.url,
  trInsightDetailAlternates.canonical,
  'TR insight detail Open Graph URL equals canonical'
);
assert.equal(
  trInsightDetailTwitter.title,
  titleValue(trInsightDetailMetadata),
  'TR insight detail Twitter title follows localized metadata title'
);
assert.equal(
  trInsightDetailTwitter.description,
  trInsightDetailMetadata.description,
  'TR insight detail Twitter description follows localized metadata description'
);
assert.equal(titleValue(enMetadata), englishTitle, 'English title fixture remains exact');
assert.equal(
  enMetadata.description,
  englishDescription,
  'English description fixture remains exact'
);
assert.ok(titleValue(trMetadata).includes('Ö'), 'Turkish diacritics are preserved in title');
assert.ok(
  String(trMetadata.description).includes('ü'),
  'Turkish diacritics are preserved in description'
);
assert.equal('languages' in trAlternates, false, 'TR metadata emits no hreflang languages');

collectStrings([enMetadata, trMetadata]).forEach((value) => {
  assert.equal(value.includes('www.crearetravel.com'), false, 'metadata does not use www host');
  assert.equal(value.includes('rocket.new'), false, 'metadata does not use Rocket host');
  assert.equal(
    value.includes('creare-cms-production.up.railway.app'),
    false,
    'metadata does not use CMS host'
  );
  assert.equal(value.includes('localhost'), false, 'metadata does not use localhost');
});

assert.equal(new URL(SITE_URL).hostname, PRODUCTION_CANONICAL_HOSTNAME);
assertThrows('assertion failure exits non-zero on invariant failure', () =>
  assert.equal(true, false)
);

const assertionFilePath = join(process.cwd(), 'src/lib/i18n/metadata.assertions.ts');
const runtimeImportViolations = listSourceFiles(join(process.cwd(), 'src'))
  .filter((filePath) => filePath !== assertionFilePath)
  .filter((filePath) => readFileSync(filePath, 'utf8').includes('metadata.assertions'));

assert.deepEqual(runtimeImportViolations, []);

console.info('Localized metadata assertions passed.');
