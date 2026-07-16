import assert from 'node:assert/strict';
import { isSiteLocale } from './config';
import { buildLocaleAwareStrapiPath, canUseEnglishFallback } from './data-layer';

function getQuery(path: string): URLSearchParams {
  const [withoutHash] = path.split('#');
  const query = withoutHash.split('?')[1] ?? '';
  return new URLSearchParams(query);
}

function assertSingleLocale(path: string, expectedLocale: string) {
  const params = getQuery(path);

  assert.equal(params.get('locale'), expectedLocale);
  assert.equal(params.getAll('locale').length, 1);
  assert.equal(path.includes('locale=en') && path.includes('locale=tr-TR'), false);
}

const destinationEnPath = buildLocaleAwareStrapiPath('/api/destinations?populate=*', 'en');
assertSingleLocale(destinationEnPath, 'en');
assert.ok(destinationEnPath.includes('locale=en'));

const destinationTrPath = buildLocaleAwareStrapiPath('/api/destinations?populate=*', 'tr');
assertSingleLocale(destinationTrPath, 'tr-TR');
assert.ok(destinationTrPath.includes('locale=tr-TR'));

const replacedLocalePath = buildLocaleAwareStrapiPath(
  '/api/destinations?locale=en&filters[visibility_status][$eqi]=active',
  'tr'
);
assertSingleLocale(replacedLocalePath, 'tr-TR');

const slugFilterPath = buildLocaleAwareStrapiPath(
  '/api/experiences?filters[slug][$eq]=beylerbeyi-1869&populate[cover_image]=true',
  'tr'
);
const slugFilterParams = getQuery(slugFilterPath);
assertSingleLocale(slugFilterPath, 'tr-TR');
assert.equal(slugFilterParams.get('filters[slug][$eq]'), 'beylerbeyi-1869');
assert.equal(slugFilterParams.get('populate[cover_image]'), 'true');
assert.ok(slugFilterPath.includes('filters%5Bslug%5D%5B%24eq%5D=beylerbeyi-1869'));
assert.ok(slugFilterPath.includes('populate%5Bcover_image%5D=true'));

assert.equal(canUseEnglishFallback('en'), true);
assert.equal(canUseEnglishFallback('tr'), false);

const relatedExperiencePath = buildLocaleAwareStrapiPath(
  '/api/experiences?filters[slug][$in][0]=imperial-flavors&filters[visibility_status][$eqi]=active',
  'tr'
);
const relatedExperienceParams = getQuery(relatedExperiencePath);
assertSingleLocale(relatedExperiencePath, 'tr-TR');
assert.equal(relatedExperienceParams.get('filters[slug][$in][0]'), 'imperial-flavors');
assert.equal(relatedExperienceParams.get('filters[visibility_status][$eqi]'), 'active');

const relatedInsightPath = buildLocaleAwareStrapiPath(
  '/api/insights?filters[slug][$eq]=private-life-of-istanbul&populate[experiences][populate][destination]=true',
  'en'
);
const relatedInsightParams = getQuery(relatedInsightPath);
assertSingleLocale(relatedInsightPath, 'en');
assert.equal(relatedInsightParams.get('filters[slug][$eq]'), 'private-life-of-istanbul');
assert.equal(relatedInsightParams.get('populate[experiences][populate][destination]'), 'true');
assert.ok(
  relatedInsightPath.includes('populate%5Bexperiences%5D%5Bpopulate%5D%5Bdestination%5D=true')
);

const hashPath = buildLocaleAwareStrapiPath('/api/insights?populate=*&locale=en#editorial', 'tr');
assert.equal(hashPath.endsWith('#editorial'), true);
assertSingleLocale(hashPath, 'tr-TR');

const absoluteUrlPath = buildLocaleAwareStrapiPath(
  'https://cms.example.com/api/experiences?filters[slug][$eq]=test&populate=deep#section',
  'tr'
);
const absoluteUrl = new URL(absoluteUrlPath);
assert.equal(absoluteUrl.protocol, 'https:');
assert.equal(absoluteUrl.hostname, 'cms.example.com');
assert.equal(absoluteUrl.pathname, '/api/experiences');
assert.equal(absoluteUrl.hash, '#section');
assert.equal(absoluteUrl.searchParams.get('filters[slug][$eq]'), 'test');
assert.equal(absoluteUrl.searchParams.get('populate'), 'deep');
assert.equal(absoluteUrl.searchParams.get('locale'), 'tr-TR');
assert.equal(absoluteUrl.searchParams.getAll('locale').length, 1);
assert.equal(absoluteUrl.searchParams.get('locale') === 'en', false);
assert.equal(absoluteUrlPath.includes('locale=en'), false);

assert.equal(isSiteLocale('en'), true);
assert.equal(isSiteLocale('tr'), true);
assert.equal(isSiteLocale('ru'), false);
assert.equal(isSiteLocale('zh'), false);
assert.equal(isSiteLocale('ar'), false);
assert.equal(isSiteLocale('fr'), false);
assert.equal(isSiteLocale(''), false);
assert.equal(isSiteLocale('random'), false);
assert.equal(isSiteLocale(null), false);
assert.equal(isSiteLocale(undefined), false);

const runTypeOnlyLocaleAssertions = process.env.RUN_TYPE_ONLY_LOCALE_ASSERTIONS === 'true';
if (runTypeOnlyLocaleAssertions) {
  // @ts-expect-error Unsupported locales cannot enter typed path builders.
  buildLocaleAwareStrapiPath('/api/experiences', 'ru');
  // @ts-expect-error Unsupported locales cannot enter typed fallback checks.
  canUseEnglishFallback('ru');
}

console.info('Locale-aware Strapi data layer assertions passed.');
