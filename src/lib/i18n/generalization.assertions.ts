import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import enDictionary from '@/locales/en.json';
import ruDictionary from '@/locales/ru.json';
import zhDictionary from '@/locales/zh.json';
import {
  buildExperienceCategoryMetadata,
  type ExperienceCategory,
} from '@/features/i18n-pages/experience-category';
import type { CmsExperienceCategoryPage } from '@/lib/experiences/cms';
import {
  DEFAULT_SITE_LOCALE,
  ACTIVE_SITE_LOCALES,
  LOCALE_OPTIONS,
  LOCALE_REGISTRY,
  REGISTERED_LOCALES,
  SUPPORTED_SITE_LOCALES,
  getGenericRouteLocale,
  getLocaleDescriptor,
  getTechnicalRouteLocale,
} from './config';
import { canUseEnglishFallback } from './data-layer';
import { assertDictionaryActivationReady, type DictionaryJson } from './dictionary-readiness';
import {
  getLocaleFromPathname,
  getRegisteredLocaleFromPathname,
  localizePathname,
} from './pathname';
import { getAvailableStaticRouteLocales, isStaticPathAvailableForLocale } from './static-routes';
import {
  buildRouteCanonicalAlternates,
  buildLocalizedLanguageAlternates,
  buildMetadataAlternates,
  buildRouteCanonicalUrl,
  getOpenGraphLocale,
} from '../seo';
import { getActiveAvailableLocales } from './availability';

const defaultLocales = REGISTERED_LOCALES.filter((locale) => LOCALE_REGISTRY[locale].isDefault);
const activePrefixes = ACTIVE_SITE_LOCALES.map((locale) => LOCALE_REGISTRY[locale].urlPrefix);

assert.deepEqual(REGISTERED_LOCALES, ['en', 'tr', 'zh', 'ru']);
assert.deepEqual(SUPPORTED_SITE_LOCALES, ['en', 'tr', 'zh', 'ru']);
assert.deepEqual(ACTIVE_SITE_LOCALES, ['en', 'tr', 'zh', 'ru']);
assert.deepEqual(defaultLocales, [DEFAULT_SITE_LOCALE]);
assert.equal(new Set(activePrefixes).size, activePrefixes.length);
assert.deepEqual(
  LOCALE_OPTIONS.map((option) => option.code),
  ['en', 'tr', 'zh', 'ru']
);
assert.equal(LOCALE_OPTIONS.find((option) => option.code === 'zh')?.label, '简体中文');
assert.equal(LOCALE_OPTIONS.find((option) => option.code === 'ru')?.label, 'Русский');

assert.deepEqual(getLocaleDescriptor('zh'), {
  key: 'zh',
  active: true,
  urlPrefix: 'zh',
  dictionaryKey: 'zh',
  strapiLocale: 'zh-CN',
  htmlLang: 'zh-Hans',
  hreflang: 'zh-Hans',
  ogLocale: 'zh_CN',
  jsonLdLanguage: 'zh-Hans',
  direction: 'ltr',
  isDefault: false,
  routeMode: 'generic',
});
assert.equal(getGenericRouteLocale('zh'), 'zh');
assert.deepEqual(getLocaleDescriptor('ru'), {
  key: 'ru',
  active: true,
  urlPrefix: 'ru',
  dictionaryKey: 'ru',
  strapiLocale: 'ru-RU',
  htmlLang: 'ru',
  hreflang: 'ru',
  ogLocale: 'ru_RU',
  jsonLdLanguage: 'ru',
  direction: 'ltr',
  isDefault: false,
  routeMode: 'generic',
});
assert.equal(getTechnicalRouteLocale('ru'), 'ru');
assert.equal(getGenericRouteLocale('ru'), 'ru');
assert.equal(getLocaleFromPathname('/zh/experiences/signature'), 'zh');
assert.equal(getLocaleFromPathname('/ru/experiences/signature'), 'ru');
assert.equal(getRegisteredLocaleFromPathname('/zh/experiences/signature'), 'zh');
assert.equal(getRegisteredLocaleFromPathname('/ru/experiences/signature'), 'ru');
assert.equal(localizePathname('/experiences/signature', 'zh'), '/zh/experiences/signature');
assert.equal(localizePathname('/experiences/signature', 'ru'), '/ru/experiences/signature');

assert.equal(isStaticPathAvailableForLocale('/experiences/signature', 'en'), true);
assert.equal(isStaticPathAvailableForLocale('/experiences/signature', 'tr'), true);
assert.equal(isStaticPathAvailableForLocale('/experiences/signature', 'zh'), true);
assert.equal(isStaticPathAvailableForLocale('/experiences/signature', 'ru'), true);
assert.deepEqual(getAvailableStaticRouteLocales('/experiences/signature'), [
  'en',
  'tr',
  'zh',
  'ru',
]);
assert.equal(isStaticPathAvailableForLocale('/insights', 'ru'), false);

const collectionAlternates = buildLocalizedLanguageAlternates(
  '/experiences/signature',
  getAvailableStaticRouteLocales('/experiences/signature')
);
assert.deepEqual(collectionAlternates, {
  en: 'https://crearetravel.com/experiences/signature',
  tr: 'https://crearetravel.com/tr/experiences/signature',
  'zh-Hans': 'https://crearetravel.com/zh/experiences/signature',
  ru: 'https://crearetravel.com/ru/experiences/signature',
  'x-default': 'https://crearetravel.com/experiences/signature',
});
assert.equal('zh-Hans' in collectionAlternates, true);
assert.equal('ru' in collectionAlternates, true);
assert.equal(
  Object.values(collectionAlternates).some((url) => url.includes('/zh')),
  true
);
assert.deepEqual(
  buildMetadataAlternates('/tr/experiences/signature').languages,
  collectionAlternates
);
assert.deepEqual(getActiveAvailableLocales({ en: true, tr: false, zh: true }), ['en', 'zh']);
assert.deepEqual(
  buildRouteCanonicalAlternates(
    { family: 'insight-detail', locale: 'en', slug: 'private-life-of-istanbul' },
    ['en']
  ).languages,
  {
    en: 'https://crearetravel.com/insights/private-life-of-istanbul',
    'x-default': 'https://crearetravel.com/insights/private-life-of-istanbul',
  }
);

assert.equal(
  buildRouteCanonicalUrl({ family: 'experience-category', locale: 'en', slug: 'lab' }),
  'https://crearetravel.com/experiences/lab'
);
assert.equal(
  buildRouteCanonicalUrl({ family: 'experience-category', locale: 'tr', slug: 'lab' }),
  'https://crearetravel.com/tr/experiences/lab'
);
assert.equal(getOpenGraphLocale('en'), 'en_US');
assert.equal(getOpenGraphLocale('tr'), 'tr_TR');
assert.equal(getOpenGraphLocale('zh'), 'zh_CN');
assert.equal(getOpenGraphLocale('ru'), 'ru_RU');
assert.equal(
  buildRouteCanonicalUrl({ family: 'experience-category', locale: 'ru', slug: 'lab' }),
  'https://crearetravel.com/ru/experiences/lab'
);

function makeCategoryPage(
  category: ExperienceCategory,
  locale: 'tr' | 'zh'
): CmsExperienceCategoryPage {
  const label = `${locale}-${category}`;

  return {
    id: 1,
    key: category,
    display_order: 1,
    eyebrow: label,
    hero_title: `${label} hero`,
    hero_subtitle: `${label} subtitle`,
    introduction: `${label} introduction`,
    supporting_content: `${label} supporting content`,
    list_eyebrow: `${label} list eyebrow`,
    list_title: `${label} list title`,
    cta_heading: `${label} CTA heading`,
    cta_supporting_text: `${label} CTA supporting text`,
    cta_access_line: `${label} CTA access line`,
    cta_label: `${label} CTA label`,
    hero_image: { url: '/uploads/category-hero.jpg' },
    hero_alt_text: `${label} hero alt`,
    card_title: `${label} card title`,
    card_description: `${label} card description`,
    card_distinction: `${label} card distinction`,
    card_image: { url: '/uploads/category-card.jpg' },
    card_alt_text: `${label} card alt`,
    seo_title: `${label} | CREARE`,
    seo_description: `${label} SEO description`,
    og_description: `${label} Open Graph description`,
    publishedAt: '2026-01-01T00:00:00.000Z',
  };
}

for (const category of ['signature', 'lab', 'black'] as const) {
  const trPage = makeCategoryPage(category, 'tr');
  const metadata = buildExperienceCategoryMetadata(category, 'tr', trPage);
  assert.equal(metadata.title, trPage.seo_title);
  assert.equal(metadata.description, trPage.seo_description);
  assert.equal(
    metadata.alternates?.canonical,
    `https://crearetravel.com/tr/experiences/${category}`
  );
  assert.deepEqual(metadata.alternates?.languages, {
    en: `https://crearetravel.com/experiences/${category}`,
    tr: `https://crearetravel.com/tr/experiences/${category}`,
    'zh-Hans': `https://crearetravel.com/zh/experiences/${category}`,
    ru: `https://crearetravel.com/ru/experiences/${category}`,
    'x-default': `https://crearetravel.com/experiences/${category}`,
  });
  assert.equal(metadata.openGraph?.locale, 'tr_TR');
  assert.equal(metadata.openGraph?.url, `https://crearetravel.com/tr/experiences/${category}`);
  assert.equal(String(metadata.title).includes('Creare — Creare'), false);

  const zhPage = makeCategoryPage(category, 'zh');
  const zhMetadata = buildExperienceCategoryMetadata(category, 'zh', zhPage);
  assert.equal(zhMetadata.title, zhPage.seo_title);
  assert.equal(zhMetadata.description, zhPage.seo_description);
  assert.equal(
    zhMetadata.alternates?.canonical,
    `https://crearetravel.com/zh/experiences/${category}`
  );
  assert.equal(zhMetadata.openGraph?.locale, 'zh_CN');
  assert.equal(zhMetadata.openGraph?.url, `https://crearetravel.com/zh/experiences/${category}`);
  assert.equal(String(zhMetadata.title).includes('Creare — Creare'), false);
}

assert.equal(canUseEnglishFallback('en'), true);
assert.equal(canUseEnglishFallback('tr'), false);
assert.equal(canUseEnglishFallback('zh'), false);
assert.equal(canUseEnglishFallback('ru'), false);
assert.doesNotThrow(() =>
  assertDictionaryActivationReady(
    'zh',
    enDictionary as DictionaryJson,
    zhDictionary as DictionaryJson
  )
);
assert.doesNotThrow(() =>
  assertDictionaryActivationReady(
    'ru',
    enDictionary as DictionaryJson,
    ruDictionary as DictionaryJson
  )
);

const genericLayoutSource = readFileSync(
  join(process.cwd(), 'src/app/[locale]/layout.tsx'),
  'utf8'
);
const genericRouteSource = readFileSync(
  join(process.cwd(), 'src/app/[locale]/[[...segments]]/page.tsx'),
  'utf8'
);
const sitemapSource = readFileSync(join(process.cwd(), 'src/app/sitemap.ts'), 'utf8');

assert.equal(genericLayoutSource.includes('getGenericRouteLocale(localeKey)'), true);
assert.equal(genericLayoutSource.includes('if (!locale) notFound()'), true);
assert.equal(genericRouteSource.includes('renderExperienceCategoryPage'), true);
assert.equal(genericRouteSource.includes('renderExperienceDetailPage'), true);
assert.equal(genericRouteSource.includes('renderCulturalWorldDetailPage'), true);
assert.equal(genericRouteSource.includes('renderInsightDetailPage'), true);
assert.equal(sitemapSource.includes("createLocalizedStaticEntries('/experiences/signature'"), true);
assert.equal(sitemapSource.includes("createLocalizedStaticEntries('/experiences/lab'"), true);
assert.equal(sitemapSource.includes("createLocalizedStaticEntries('/experiences/black'"), true);
assert.equal(sitemapSource.includes('ACTIVE_SITE_LOCALES.map'), true);
assert.equal(sitemapSource.includes('SUPPORTED_SITE_LOCALES.map'), false);
