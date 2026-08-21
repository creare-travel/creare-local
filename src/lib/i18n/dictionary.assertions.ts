import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import enDictionary from '@/locales/en.json';
import trDictionary from '@/locales/tr.json';
import zhDictionary from '@/locales/zh.json';
import { assertDictionaryActivationReady } from './dictionary-readiness';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

const approvedKeys = [
  'global.nav.culturalWorlds',
  'global.nav.experiences',
  'global.nav.insights',
  'global.nav.philosophy',
  'global.nav.contact',
  'global.footer.culturalWorlds',
  'global.footer.experiences',
  'global.footer.insights',
  'global.footer.philosophy',
  'global.footer.contact',
  'global.footer.privacy',
  'global.footer.cookies',
  'global.footer.terms',
  'common.relatedInsights',
  'common.relatedExperiences',
  'common.relatedEssays',
  'common.inquirePrivately',
  'common.beginPrivateConversation',
  'common.read',
  'common.enter',
  'common.home',
  'common.privacy',
  'common.cookies',
  'common.terms',
  'common.contactViaWhatsApp',
  'common.contactCreareUpper',
  'common.protected.creare',
  'common.protected.signature',
  'common.protected.lab',
  'common.protected.black',
  'accessibility.returnHome',
  'accessibility.selectLanguage',
  'accessibility.languageOptions',
  'accessibility.mainNavigation',
  'accessibility.mobileNavigation',
  'accessibility.openNavigationMenu',
  'accessibility.closeNavigationMenu',
  'accessibility.legalLinks',
  'accessibility.privateInquiry',
  'nav.experiences',
  'nav.philosophy',
  'nav.contact',
  'footer.philosophy',
  'footer.contact',
  'footer.sitemap',
  'footer.privacy',
  'footer.cookies',
  'footer.terms',
  'home.hero.eyebrow',
  'home.hero.title',
  'home.hero.subtitle',
  'home.cta.label',
  'home.cta.labelWithArrow',
  'home.cta.approach',
  'home.cta.contact',
  'home.collections.eyebrow',
  'home.mainParagraph.paragraph1',
  'home.mainParagraph.paragraph2',
  'home.mainParagraph.paragraph3',
  'home.contact.title',
  'culturalWorlds.title',
  'culturalWorlds.explore',
  'culturalWorlds.atlasTitle',
  'culturalWorlds.geography',
  'culturalWorlds.atlas',
  'culturalWorlds.context',
  'culturalWorlds.coreCharacteristics',
  'culturalWorlds.whatDefines',
  'culturalWorlds.culturalSystems',
  'culturalWorlds.culturalSystemsSubheading',
  'culturalWorlds.connectedCulturalSystem',
  'culturalWorlds.viewExperience',
  'culturalWorlds.byIntroductionOnly',
  'culturalWorlds.accessLimited',
  'culturalWorlds.emptyState',
  'experiences.title',
  'experiences.threeWays',
  'experiences.collection',
  'experiences.category',
  'experiences.location',
  'experiences.duration',
  'experiences.groupSize',
  'experiences.overview',
  'experiences.intentLevel',
  'experiences.wowMoment',
  'experiences.differentiator',
  'experiences.experience',
  'experiences.programme',
  'experiences.whoThisIsFor',
  'experiences.adjacentExperiences',
  'experiences.furtherCulturalReading',
  'experiences.previousExperience',
  'experiences.nextExperience',
  'experienceDetail.category',
  'experienceDetail.location',
  'experienceDetail.duration',
  'experienceDetail.groupSize',
  'experienceDetail.overview',
  'experienceDetail.intentLevel',
  'experienceDetail.wowMoment',
  'experienceDetail.differentiator',
  'experienceDetail.experience',
  'experienceDetail.programme',
  'experienceDetail.whoThisIsFor',
  'experienceDetail.adjacentExperiences',
  'experienceDetail.furtherCulturalReading',
  'experienceDetail.previousExperience',
  'experienceDetail.nextExperience',
  'insights.title',
  'insights.subtitle',
  'insights.featuredEssays',
  'insights.culturalWorldEssays',
  'insights.editorialEssays',
  'insights.furtherReading',
  'insights.readEssay',
  'insights.readEssayWithArrow',
  'insights.backToInsights',
  'insights.accessNotListed',
  'signature.label',
  'signature.title',
  'signature.description1',
  'signature.description2',
  'signature.cta',
  'lab.label',
  'lab.title',
  'lab.description1',
  'lab.description2',
  'lab.cta',
  'black.label',
  'black.title',
  'black.description1',
  'black.description2',
  'black.cta',
  'sitemap.breadcrumb_home',
  'sitemap.breadcrumb_current',
  'sitemap.experiences',
  'sitemap.creare',
  'sitemap.legal',
  'sitemap.lab',
  'sitemap.signature',
  'sitemap.black',
  'sitemap.philosophy',
  'sitemap.contact',
  'sitemap.privacy',
  'sitemap.cookies',
  'sitemap.terms',
] as const;

const forbiddenLegacyValues = new Set([
  'İçgörüler',
  'İlgili İçgörüler',
  'Kültürel Dünyalar',
  'Küratörlüğü Yapılmış Kültürel Deneyimler',
  'Bir Sanat Gibi Kurgulanır',
  'Görüşmeyi başlatın',
  'Deneyime Yaklaşımımız',
  'Erişim sınırlıdır',
  'Niyet Düzeyi',
  'Doruk Anı',
  'Ayırt Edici Unsur',
  'İleri Okumalar',
]);

const protectedTermKeys = [
  'common.protected.creare',
  'common.protected.signature',
  'common.protected.lab',
  'common.protected.black',
  'signature.label',
  'lab.label',
  'black.label',
] as const;

const homepageParagraphKeys = [
  'home.mainParagraph.paragraph1',
  'home.mainParagraph.paragraph2',
  'home.mainParagraph.paragraph3',
] as const;

const contextSpecificCtaKeys = [
  'common.inquirePrivately',
  'home.cta.label',
  'home.cta.labelWithArrow',
  'common.beginPrivateConversation',
  'home.contact.title',
  'common.contactCreareUpper',
  'home.cta.contact',
  'insights.readEssay',
  'insights.readEssayWithArrow',
] as const;

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenKeys(value: JsonValue, prefix = ''): string[] {
  if (!isObject(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.keys(value).flatMap((key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(value[key], path);
  });
}

function getValue(source: JsonObject, path: string): JsonValue | undefined {
  return path.split('.').reduce<JsonValue | undefined>((current, segment) => {
    if (current === undefined || !isObject(current)) {
      return undefined;
    }

    return current[segment];
  }, source);
}

function assertApprovedString(path: string): void {
  const enValue = getValue(enDictionary, path);
  const trValue = getValue(trDictionary, path);

  assert.notEqual(enValue, undefined, `Missing EN approved key: ${path}`);
  assert.notEqual(trValue, undefined, `Missing TR approved key: ${path}`);
  assert.equal(typeof enValue, 'string', `EN approved key must be a string: ${path}`);
  assert.equal(typeof trValue, 'string', `TR approved key must be a string: ${path}`);
  assert.notEqual(trValue, null, `TR approved key is null: ${path}`);
  assert.notEqual(trValue, undefined, `TR approved key is undefined: ${path}`);
  assert.notEqual((trValue as string).trim(), '', `TR approved key is empty: ${path}`);
  assert.equal(
    forbiddenLegacyValues.has(trValue as string),
    false,
    `TR approved key uses forbidden legacy value: ${path}`
  );
}

function walkFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return walkFiles(fullPath);
    }

    return fullPath;
  });
}

const enKeys = flattenKeys(enDictionary).sort();
const trKeys = flattenKeys(trDictionary).sort();

assert.deepEqual(trKeys, enKeys, 'EN and TR dictionary structures must match recursively');
assert.doesNotThrow(() =>
  assertDictionaryActivationReady('en', enDictionary as JsonObject, enDictionary as JsonObject)
);
assert.doesNotThrow(() =>
  assertDictionaryActivationReady('tr', enDictionary as JsonObject, trDictionary as JsonObject)
);
assert.throws(
  () =>
    assertDictionaryActivationReady('zh', enDictionary as JsonObject, zhDictionary as JsonObject),
  /Dictionary activation blocked/,
  'Incomplete ZH dictionary must remain impossible to activate'
);

approvedKeys.forEach(assertApprovedString);

homepageParagraphKeys.forEach((key) => {
  assertApprovedString(key);
});

assert.equal(
  new Set(homepageParagraphKeys).size,
  3,
  'Homepage paragraph keys must remain separate'
);
assert.equal(
  new Set(contextSpecificCtaKeys).size,
  contextSpecificCtaKeys.length,
  'CTA keys must remain separate'
);
contextSpecificCtaKeys.forEach(assertApprovedString);

protectedTermKeys.forEach((key) => {
  assert.equal(
    getValue(trDictionary, key),
    getValue(enDictionary, key),
    `Protected term changed: ${key}`
  );
});

const sourceFiles = walkFiles(join(process.cwd(), 'src')).filter(
  (filePath) => /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('dictionary.assertions.ts')
);

sourceFiles.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  assert.equal(
    source.includes('dictionary.assertions'),
    false,
    `dictionary.assertions must not be imported by runtime source: ${filePath}`
  );
});

console.info('Dictionary assertions passed');
