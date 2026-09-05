import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildExperienceCategoryMetadata } from '@/features/i18n-pages/experience-category';
import { fetchCulturalWorldDestinations, fetchCulturalWorldPage } from '@/lib/cultural-worlds/cms';
import { fetchExperienceCategoryPages, type ExperienceCategory } from '@/lib/experiences/cms';
import { LOCALE_REGISTRY, type SiteLocale } from './config';
import { getDictionary } from './dictionaries';
import { localizePathname } from './pathname';
import { getAvailableStaticRouteLocales } from './static-routes';
import { buildCulturalWorldCollectionGraph } from '../schema-builder';
import { buildLocaleOwnedMetadata } from '../seo';

const locales: SiteLocale[] = ['en', 'tr', 'zh'];
const expectedPageDocumentId = 'gvtccto0fawypsik8jclk970';
const expectedCategoryDocumentIds: Record<ExperienceCategory, string> = {
  signature: 'kxmwpgar8qiqhs3m5rd3t8d1',
  lab: 'gtfcqsmfa937uqp047564k4z',
  black: 'u96oel83wqat62i4vr8jhgi6',
};
const expectedPrinciples = {
  en: ['Clarity', 'Structure', 'Precision'],
  tr: ['Netlik', 'Yapı', 'Hassasiyet'],
  zh: ['清晰', '结构', '精准'],
} as const;

const culturalWorldSource = readFileSync(
  join(process.cwd(), 'src/features/i18n-pages/cultural-worlds.tsx'),
  'utf8'
);
const categorySource = readFileSync(
  join(process.cwd(), 'src/features/i18n-pages/experience-category.tsx'),
  'utf8'
);
const genericRouteSource = readFileSync(
  join(process.cwd(), 'src/app/[locale]/[[...segments]]/page.tsx'),
  'utf8'
);
const runtimeSource = `${culturalWorldSource}\n${categorySource}`;

assert.equal(runtimeSource.includes('res.cloudinary.com'), false);
assert.equal(runtimeSource.includes('canUseEnglishFallback'), false);
assert.equal(runtimeSource.includes('CULTURAL_WORLD_CONTENT'), false);
assert.equal(runtimeSource.includes('LOCAL_FALLBACK'), false);
assert.equal(/destination_section_support(?!ing_text)/.test(runtimeSource), false);
assert.equal(runtimeSource.includes('key={item.id}'), false);
assert.equal(runtimeSource.includes('key={destination.id}'), false);
assert.equal(runtimeSource.includes('hero_image.id'), false);
assert.equal(runtimeSource.includes('card_image.id'), false);
assert.equal(
  genericRouteSource.includes(
    "if (!slug && family === 'cultural-worlds') return generateCulturalWorldsMetadata(locale)"
  ),
  true
);
assert.deepEqual(getAvailableStaticRouteLocales('/cultural-worlds'), locales);
assert.deepEqual(getAvailableStaticRouteLocales('/experiences/signature'), locales);
assert.equal(LOCALE_REGISTRY.zh.strapiLocale, 'zh-CN');
assert.equal('ru' in LOCALE_REGISTRY, false);

function metadataTitle(metadata: Awaited<ReturnType<typeof buildLocaleOwnedMetadata>>) {
  if (typeof metadata.title === 'string') return metadata.title;
  if (metadata.title && typeof metadata.title === 'object' && 'absolute' in metadata.title) {
    return metadata.title.absolute;
  }
  return '';
}

async function main() {
  const inventories = await Promise.all(
    locales.map(async (locale) => {
      const [page, destinations, categories] = await Promise.all([
        fetchCulturalWorldPage(locale),
        fetchCulturalWorldDestinations(locale),
        fetchExperienceCategoryPages(locale),
      ]);

      assert.equal(page.documentId, expectedPageDocumentId, `${locale}:Cultural Worlds identity`);
      assert.ok(page.hero_image.documentId, `${locale}:Cultural Worlds hero documentId`);
      assert.deepEqual(
        destinations.map((destination) => destination.slug),
        ['istanbul', 'cappadocia', 'bodrum'],
        `${locale}:destination editorial order`
      );
      assert.equal(new Set(destinations.map((item) => item.documentId)).size, 3);
      assert.ok(destinations.every((item) => item.cover_image.documentId));
      assert.equal(categories.length, 3);

      for (const category of categories) {
        assert.equal(category.documentId, expectedCategoryDocumentIds[category.key]);
        const metadata = buildExperienceCategoryMetadata(category.key, locale, category);
        assert.equal(metadataTitle(metadata), category.seo_title);
        assert.equal(
          metadata.alternates?.canonical,
          `https://crearetravel.com${localizePathname(`/experiences/${category.key}`, locale)}`
        );
        assert.equal('ru' in (metadata.alternates?.languages ?? {}), false);
      }

      const lab = categories.find((category) => category.key === 'lab');
      assert.ok(lab);
      assert.deepEqual(
        [lab.lab_principle_1_title, lab.lab_principle_2_title, lab.lab_principle_3_title],
        expectedPrinciples[locale]
      );

      const culturalMetadata = buildLocaleOwnedMetadata({
        locale,
        copyLocale: locale,
        route: { family: 'cultural-worlds', locale },
        title: page.seo_title,
        description: page.seo_description,
        imageAlt: page.hero_alt_text,
        robots: { index: true, follow: true },
        titleMode: 'absolute',
        availableLocales: locales,
      });
      assert.equal(metadataTitle(culturalMetadata), page.seo_title);
      assert.equal(
        culturalMetadata.alternates?.canonical,
        `https://crearetravel.com${localizePathname('/cultural-worlds', locale)}`
      );
      assert.equal('ru' in (culturalMetadata.alternates?.languages ?? {}), false);

      const graph = buildCulturalWorldCollectionGraph({
        canonicalPath: localizePathname('/cultural-worlds', locale),
        homePath: localizePathname('/', locale),
        title: page.hero_title,
        description: page.seo_description,
        homeLabel: getDictionary(locale).common.home,
        inLanguage: LOCALE_REGISTRY[locale].jsonLdLanguage,
        items: destinations,
      });
      const collection = graph.find((node) => node['@type'] === 'CollectionPage');
      const list = graph.find((node) => node['@type'] === 'ItemList');
      assert.equal(collection?.inLanguage, LOCALE_REGISTRY[locale].jsonLdLanguage);
      assert.equal(list?.inLanguage, LOCALE_REGISTRY[locale].jsonLdLanguage);
      assert.equal((list?.itemListElement as unknown[])?.length, 3);

      return { locale, page, categories };
    })
  );

  const en = inventories.find((inventory) => inventory.locale === 'en');
  assert.ok(en);
  for (const inventory of inventories.filter((item) => item.locale !== 'en')) {
    assert.notEqual(inventory.page.hero_title, en.page.hero_title);
    for (const category of inventory.categories) {
      const enCategory = en.categories.find((candidate) => candidate.key === category.key);
      assert.ok(enCategory);
      assert.notEqual(
        category.hero_title,
        enCategory.hero_title,
        `${inventory.locale}:${category.key}`
      );
    }
  }

  console.info('Editorial page assertions passed:');
  console.info('- Cultural Worlds CMS page identity and localized completeness: 3/3');
  console.info('- Category CMS identities and localized completeness: 9/9');
  console.info('- Destination order and stable identity: Istanbul / Cappadocia / Bodrum');
  console.info('- LAB principles: Clarity / Structure / Precision localized exactly');
  console.info('- Numeric row-ID routing/key dependencies: 0');
  console.info('- Editorial fallbacks and hardcoded Cloudinary URLs: 0');
  console.info('- EN/TR/ZH metadata, canonical, hreflang, and JSON-LD: PASS');
}

void main();
