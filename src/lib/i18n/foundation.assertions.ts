import assert from 'node:assert/strict';
import { getStrapiLocale, isSiteLocale } from './config';
import {
  getLocaleFromPathname,
  isTurkishPathname,
  localizePathname,
  normalizePathname,
  stripLocalePrefix,
} from './pathname';
import { buildLocalizedStrapiPath } from '../strapi';

assert.equal(isSiteLocale('en'), true);
assert.equal(isSiteLocale('tr'), true);
assert.equal(isSiteLocale('ru'), false);
assert.equal(isSiteLocale('zh'), false);
assert.equal(isSiteLocale('ar'), false);
assert.equal(isSiteLocale('fr'), false);
assert.equal(isSiteLocale(''), false);
assert.equal(isSiteLocale(null), false);
assert.equal(isSiteLocale(undefined), false);
assert.equal(isSiteLocale('random'), false);

assert.equal(getStrapiLocale('en'), 'en');
assert.equal(getStrapiLocale('tr'), 'tr-TR');

assert.equal(normalizePathname('/'), '/');
assert.equal(normalizePathname(''), '/');
assert.equal(normalizePathname('cultural-worlds'), '/cultural-worlds');
assert.equal(normalizePathname('/cultural-worlds/'), '/cultural-worlds');
assert.equal(normalizePathname('/tr'), '/tr');
assert.equal(normalizePathname('/tr/'), '/tr');
assert.equal(normalizePathname('/tr/tr'), '/tr');
assert.equal(normalizePathname('/tr/tr/'), '/tr');
assert.equal(normalizePathname('/tr/tr/experiences/test'), '/tr/experiences/test');
assert.equal(normalizePathname('/tr/tr/tr/insights/test'), '/tr/insights/test');
assert.equal(normalizePathname('/tr/tr/experiences/tr/test'), '/tr/experiences/tr/test');
assert.equal(normalizePathname('/travel'), '/travel');
assert.equal(normalizePathname('/trailing'), '/trailing');
assert.equal(normalizePathname('/cultural-worlds/tr'), '/cultural-worlds/tr');
assert.equal(normalizePathname('/experiences/tr/test'), '/experiences/tr/test');

assert.equal(getLocaleFromPathname('/'), 'en');
assert.equal(getLocaleFromPathname('/tr'), 'tr');
assert.equal(getLocaleFromPathname('/tr/experiences/test'), 'tr');
assert.equal(getLocaleFromPathname('/experiences/test'), 'en');
assert.equal(getLocaleFromPathname('/travel'), 'en');
assert.equal(getLocaleFromPathname('/trailing'), 'en');

assert.equal(isTurkishPathname('/travel'), false);
assert.equal(isTurkishPathname('/trailing'), false);

assert.equal(stripLocalePrefix('/tr'), '/');
assert.equal(stripLocalePrefix('/tr/'), '/');
assert.equal(stripLocalePrefix('/tr/insights/test'), '/insights/test');
assert.equal(stripLocalePrefix('/travel'), '/travel');

assert.equal(localizePathname('/', 'tr'), '/tr');
assert.equal(localizePathname('/tr', 'en'), '/');
assert.equal(localizePathname('/experiences/test', 'tr'), '/tr/experiences/test');
assert.equal(localizePathname('/tr/experiences/test', 'en'), '/experiences/test');
assert.equal(localizePathname('/tr/experiences/test', 'tr'), '/tr/experiences/test');
assert.equal(localizePathname('/tr/tr/experiences/test', 'tr'), '/tr/experiences/test');
assert.equal(localizePathname('/tr/tr/experiences/test', 'en'), '/experiences/test');

assert.equal(
  buildLocalizedStrapiPath('/api/destinations?populate=deep', 'tr'),
  '/api/destinations?populate=deep&locale=tr-TR'
);
assert.equal(
  buildLocalizedStrapiPath('/api/experiences?filters[slug][$eq]=test', 'en'),
  '/api/experiences?filters%5Bslug%5D%5B%24eq%5D=test&locale=en'
);

const replacedLocalePath = buildLocalizedStrapiPath(
  '/api/experiences?locale=en&populate=deep',
  'tr'
);
const replacedLocaleParams = new URLSearchParams(replacedLocalePath.split('?')[1]);
assert.equal(replacedLocaleParams.get('locale'), 'tr-TR');
assert.equal(replacedLocaleParams.get('populate'), 'deep');
assert.equal(replacedLocalePath.includes('locale=en'), false);
assert.equal(replacedLocaleParams.getAll('locale').length, 1);

assert.equal(
  buildLocalizedStrapiPath('/api/insights?populate=deep#section', 'tr'),
  '/api/insights?populate=deep&locale=tr-TR#section'
);
assert.equal(
  buildLocalizedStrapiPath('/api/insights#section', 'en'),
  '/api/insights?locale=en#section'
);

const absolutePath = buildLocalizedStrapiPath(
  'https://cms.example.com/api/insights?populate=deep#section',
  'tr'
);
const absoluteUrl = new URL(absolutePath);
assert.equal(absoluteUrl.protocol, 'https:');
assert.equal(absoluteUrl.hostname, 'cms.example.com');
assert.equal(absoluteUrl.pathname, '/api/insights');
assert.equal(absoluteUrl.searchParams.get('populate'), 'deep');
assert.equal(absoluteUrl.searchParams.get('locale'), 'tr-TR');
assert.equal(absoluteUrl.hash, '#section');
