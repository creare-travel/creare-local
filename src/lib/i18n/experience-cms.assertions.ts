import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  fetchExperienceCategoryPages,
  fetchExperienceLanding,
  fetchPublishedExperiences,
  type CmsExperience,
  type CmsExperienceCategoryPage,
} from '@/lib/experiences/cms';
import type { SiteLocale } from './config';

const locales: SiteLocale[] = ['en', 'tr', 'zh'];
const expectedCategoryMedia = {
  signature: 69,
  lab: 70,
  black: 71,
} as const;
const obsoleteTurkishTitles = [
  'İpek Yolu: İstanbul™',
  'İmparatorluk Lezzetleri™',
  'Kokteyl Atölyesi™',
  'Beylerbeyi 1869™ — İmparatorluğun Kırılma Anı',
  'Performansın İzinde™',
];
const prohibitedBlackClaims = [
  'invitation-only',
  'by invitation',
  'never listed',
  'not publicly listed',
  'selected work remains unseen',
  'after-hours access',
  'closed collections',
  'referral-based access',
  'confidential execution',
  'confidential delivery',
  'guaranteed private access',
  'guaranteed private venues',
];

function assertText(value: unknown, identity: string) {
  assert.equal(typeof value, 'string', `${identity} must be a string`);
  assert.ok((value as string).trim(), `${identity} must not be empty`);
}

function collectCategoryCopy(page: CmsExperienceCategoryPage) {
  return [
    page.eyebrow,
    page.hero_title,
    page.hero_subtitle,
    page.introduction,
    page.supporting_content,
    page.list_eyebrow,
    page.list_title,
    page.cta_heading,
    page.cta_supporting_text,
    page.cta_access_line,
    page.cta_label,
    page.card_title,
    page.card_description,
    page.card_distinction,
    page.seo_title,
    page.seo_description,
    page.og_description,
  ].join('\n');
}

function assertExperienceContract(item: CmsExperience, locale: SiteLocale) {
  for (const field of [
    'title',
    'slug',
    'short_description',
    'category',
    'cta_heading',
    'cta_supporting_text',
    'cta_access_line',
    'cta_label',
    'seo_title',
    'seo_description',
    'og_description',
    'hero_alt_text',
  ] as const) {
    assertText(item[field], `${locale}:${item.slug}:${field}`);
  }

  assert.ok(item.cover_image?.url, `${locale}:${item.slug}:cover_image must resolve`);
}

const retiredFiles = [
  'src/data/experience-editorial.ts',
  'src/lib/experiences.ts',
  'src/lib/i18n/experience-editorial.assertions.ts',
];
for (const path of retiredFiles) {
  assert.equal(existsSync(join(process.cwd(), path)), false, `${path} must remain retired`);
}

const runtimeFiles = [
  'src/features/i18n-pages/experiences.tsx',
  'src/features/i18n-pages/experience-category.tsx',
  'src/features/i18n-pages/experience-detail.tsx',
  'src/app/home/components/CollectionsSection.tsx',
  'src/app/(en)/experiences/[slug]/opengraph-image.tsx',
];
const runtimeSource = runtimeFiles
  .map((path) => readFileSync(join(process.cwd(), path), 'utf8'))
  .join('\n');

assert.equal(runtimeSource.includes('@/data/experience-editorial'), false);
assert.equal(runtimeSource.includes("@/lib/experiences'"), false);
assert.equal(runtimeSource.includes('collectionFeatures'), false);
assert.equal(runtimeSource.includes('res.cloudinary.com'), false);
assert.equal(
  runtimeSource.match(/inLanguage: LOCALE_REGISTRY\[locale\]\.jsonLdLanguage/g)?.length,
  2,
  'Experience landing and category JSON-LD must use the active locale language'
);

for (const locale of locales) {
  const dictionary = JSON.parse(
    readFileSync(join(process.cwd(), `src/locales/${locale}.json`), 'utf8')
  ) as Record<string, unknown>;
  assert.equal('signature' in dictionary, false, `${locale} dictionary owns SIGNATURE copy`);
  assert.equal('lab' in dictionary, false, `${locale} dictionary owns LAB copy`);
  assert.equal('black' in dictionary, false, `${locale} dictionary owns BLACK copy`);
}

async function main() {
  const inventories = await Promise.all(
    locales.map(async (locale) => {
      const [landing, categories, experiences] = await Promise.all([
        fetchExperienceLanding(locale),
        fetchExperienceCategoryPages(locale),
        fetchPublishedExperiences(locale),
      ]);

      assert.equal(landing.hero_image.id, 68, `${locale} landing media identity`);
      assert.equal(categories.length, 3, `${locale} category count`);
      assert.equal(experiences.length, 14, `${locale} Experience count`);
      assert.equal(new Set(experiences.map((item) => item.slug)).size, 14);

      for (const category of categories) {
        assert.equal(category.hero_image.id, expectedCategoryMedia[category.key]);
        assert.equal(category.card_image.id, expectedCategoryMedia[category.key]);
        for (const claim of prohibitedBlackClaims) {
          assert.equal(
            collectCategoryCopy(category).toLowerCase().includes(claim),
            false,
            `${locale}:${category.key} contains prohibited claim: ${claim}`
          );
        }
      }

      for (const item of experiences) assertExperienceContract(item, locale);

      return { locale, experiences };
    })
  );

  const enInventory = inventories.find((inventory) => inventory.locale === 'en');
  assert.ok(enInventory);
  const officialTitleBySlug = new Map(
    enInventory.experiences.map((item) => [item.slug, item.title] as const)
  );

  for (const inventory of inventories) {
    for (const item of inventory.experiences) {
      assert.equal(
        item.title,
        officialTitleBySlug.get(item.slug),
        `${inventory.locale}:${item.slug}`
      );
    }
  }

  const trInventory = inventories.find((inventory) => inventory.locale === 'tr');
  assert.ok(trInventory);
  for (const obsoleteTitle of obsoleteTurkishTitles) {
    assert.equal(
      trInventory.experiences.some((item) => item.title === obsoleteTitle),
      false,
      `Obsolete TR title resurfaced: ${obsoleteTitle}`
    );
  }

  console.info('Experience CMS assertions passed:');
  console.info('- CMS inventories: EN 14 / TR 14 / ZH 14');
  console.info('- Landing/category media: 68 / 69 / 70 / 71');
  console.info('- Official title parity: 42/42');
  console.info('- Experience supplement fallback references: 0');
  console.info('- Frontend-owned category dictionary sections: 0');
  console.info('- Prohibited BLACK claims: 0');
}

void main();
