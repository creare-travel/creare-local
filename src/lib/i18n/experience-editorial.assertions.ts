import assert from 'node:assert/strict';
import {
  EXPERIENCE_EDITORIAL_SLUGS,
  getExperienceEditorialSupplement,
} from '@/data/experience-editorial';
import { LOCALE_REGISTRY, SUPPORTED_SITE_LOCALES, type SiteLocale } from '@/lib/i18n/config';

const EXPECTED_SLUGS = [
  'silk-road-istanbul',
  'istanbul-through-the-lens',
  'floating-salon-d-opera',
  'culinary-arena-bodrum',
  'the-salon-of-hands',
  'golden-horn-regatta',
  'princes-islands-regatta',
  'the-studio-session',
  'bodrum-beach-games-rhythm-competition-celebration',
  'table-to-farm-bodrum',
  'cocktail-atelier-mix-move-connect',
  'imperial-flavors-culinary-atelier',
  'driven-by-performance',
  'beylerbeyi-1869-empire-interrupted',
] as const;

assert.deepEqual(EXPERIENCE_EDITORIAL_SLUGS, EXPECTED_SLUGS);
assert.deepEqual(SUPPORTED_SITE_LOCALES, ['en', 'tr', 'zh']);
assert.equal('ru' in LOCALE_REGISTRY, false);

for (const slug of EXPECTED_SLUGS) {
  const en = getExperienceEditorialSupplement(slug, 'en');
  const zh = getExperienceEditorialSupplement(slug, 'zh');

  assert.equal(zh.expectedTitle, en.expectedTitle, `${slug} must preserve its EN name in ZH`);

  for (const locale of SUPPORTED_SITE_LOCALES as readonly SiteLocale[]) {
    const editorial = getExperienceEditorialSupplement(slug, locale);
    assert.ok(editorial.expectedTitle.trim(), `${locale}:${slug} title`);
    assert.ok(editorial.shortDescription.trim(), `${locale}:${slug} short description`);
    assert.ok(editorial.ctaHeading.trim(), `${locale}:${slug} CTA heading`);
    assert.ok(editorial.ctaSupportingText.trim(), `${locale}:${slug} CTA supporting copy`);
    assert.ok(editorial.ctaAccessLine.trim(), `${locale}:${slug} CTA access line`);
    assert.ok(editorial.openGraphDescription.trim(), `${locale}:${slug} OG description`);
    assert.ok(editorial.heroAltText.trim(), `${locale}:${slug} hero alt text`);
  }
}

const enEditorial = EXPECTED_SLUGS.map((slug) => getExperienceEditorialSupplement(slug, 'en'));
assert.equal(enEditorial.filter((item) => item.expectedCategory === 'signature').length, 11);
assert.equal(enEditorial.filter((item) => item.expectedCategory === 'lab').length, 3);
assert.equal(enEditorial.filter((item) => item.expectedCategory === 'black').length, 0);

for (const locale of SUPPORTED_SITE_LOCALES as readonly SiteLocale[]) {
  assert.equal(
    getExperienceEditorialSupplement('the-salon-of-hands', locale).expectedTitle,
    'The Sound of Clay™'
  );
  assert.equal(
    getExperienceEditorialSupplement('table-to-farm-bodrum', locale).expectedTitle,
    'Farm-to-Table Bodrum™'
  );
  assert.equal(
    getExperienceEditorialSupplement('beylerbeyi-1869', locale).expectedTitle,
    getExperienceEditorialSupplement('beylerbeyi-1869-empire-interrupted', locale).expectedTitle
  );
  assert.equal(
    getExperienceEditorialSupplement('imperial-flavors', locale).expectedTitle,
    getExperienceEditorialSupplement('imperial-flavors-culinary-atelier', locale).expectedTitle
  );
}

console.info('Experience editorial assertions passed.');
