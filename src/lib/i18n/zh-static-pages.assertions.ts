import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import enDictionary from '@/locales/en.json';
import zhDictionary from '@/locales/zh.json';
import {
  chineseCookiesContent,
  chinesePrivacyContent,
  chineseTermsContent,
} from '@/features/static-pages/chinese';
import { getGenericRouteLocale, LOCALE_REGISTRY } from './config';
import { assertDictionaryActivationReady, type DictionaryJson } from './dictionary-readiness';
import { getAvailableStaticRouteLocales, isStaticPathAvailableForLocale } from './static-routes';

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function assertChineseText(value: string, label: string): void {
  assert.match(value, /[\u3400-\u9fff]/u, `${label} must contain Simplified Chinese copy`);
}

assert.equal(LOCALE_REGISTRY.zh.active, true);
assert.equal(LOCALE_REGISTRY.zh.strapiLocale, 'zh-CN');
assert.equal(getGenericRouteLocale('zh'), 'zh');
assert.doesNotThrow(() =>
  assertDictionaryActivationReady(
    'zh',
    enDictionary as DictionaryJson,
    zhDictionary as DictionaryJson
  )
);

const staticPaths = ['/contact', '/philosophy', '/privacy', '/cookies', '/terms'] as const;
const registrySource = readSource('src/features/static-pages/registry.tsx');

staticPaths.forEach((path) => {
  assert.equal(
    registrySource.includes(`'${path}':`),
    true,
    `${path} must have a locale-owned ZH renderer`
  );
  assert.equal(isStaticPathAvailableForLocale(path, 'zh'), true);
  assert.deepEqual(getAvailableStaticRouteLocales(path), ['en', 'tr', 'zh']);
});

const chineseLegalPages = [
  ['privacy', chinesePrivacyContent, 6],
  ['cookies', chineseCookiesContent, 5],
  ['terms', chineseTermsContent, 8],
] as const;

chineseLegalPages.forEach(([name, content, sectionCount]) => {
  assertChineseText(content.title, `${name} title`);
  assertChineseText(content.lastUpdated, `${name} update date`);
  assert.equal(content.sections.length, sectionCount, `${name} section count changed`);
  content.sections.forEach((section) => assertChineseText(section.heading, `${name} heading`));
});

const contactSource = readSource('src/app/contact/ContactPageClient.tsx');
const philosophySource = readSource('src/features/static-pages/chinese.tsx');
const homeSource = readSource('src/features/i18n-pages/home.tsx');
const heroSource = readSource('src/app/home/components/HeroSection.tsx');
const collectionsSource = readSource('src/app/home/components/CollectionsSection.tsx');

assert.equal(contactSource.includes("heroTitle: '私享咨询'"), true);
assert.equal(contactSource.includes("requiredEmail: '请输入您的电子邮箱地址。'"), true);
assert.equal(contactSource.includes('const copy = contactCopy[locale]'), true);
assert.equal(philosophySource.includes('通达不是商品，而是一份托付。'), true);
assert.equal(philosophySource.includes('人与地方、宾客与文化世界'), true);
assert.equal(homeSource.includes("discovery: '首页体验体系探索'"), true);
assert.equal(heroSource.includes("sectionLabel: '主视觉 — 以艺术之法构筑体验'"), true);
assert.equal(collectionsSource.includes('fetchExperienceCategoryPages'), true);
assert.equal(collectionsSource.includes("'BLACK™ 私享通达'"), false);

['CREARE', 'SIGNATURE™', 'LAB™', 'BLACK™'].forEach((term) => {
  assert.equal(JSON.stringify(zhDictionary).includes(term), true, `${term} must remain protected`);
});

console.info('ZH static pages assertions passed');
