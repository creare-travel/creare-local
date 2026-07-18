import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getLocaleFromPathname } from './pathname';
import {
  PRODUCTION_CANONICAL_HOSTNAME,
  SITE_URL,
  buildRouteCanonicalAlternates,
  buildRouteCanonicalUrl,
  canonicalUrl,
} from '../seo';

type RouteExpectation = {
  label: string;
  url: string;
};

function assertCanonicalUrl(label: string, actual: string, expected: string) {
  assert.equal(actual, expected, label);

  const parsed = new URL(actual);
  assert.equal(parsed.protocol, 'https:', `${label} uses https`);
  assert.equal(parsed.hostname, PRODUCTION_CANONICAL_HOSTNAME, `${label} uses non-www host`);
  assert.equal(parsed.search, '', `${label} has no query string`);
  assert.equal(parsed.hash, '', `${label} has no fragment`);
  assert.equal(actual.includes('www.crearetravel.com'), false, `${label} does not use www`);
  assert.equal(actual.includes('rocket.new'), false, `${label} does not use preview host`);
  assert.equal(actual.includes('localhost'), false, `${label} does not use localhost`);
  assert.equal(
    actual.includes('creare-cms-production.up.railway.app'),
    false,
    `${label} does not use CMS host`
  );
}

function assertRoute(label: string, actual: string, expectedPath: string) {
  assertCanonicalUrl(label, actual, `${SITE_URL}${expectedPath}`);
}

function assertThrows(label: string, action: () => unknown) {
  assert.throws(action, Error, label);
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

const routeExpectations: RouteExpectation[] = [
  {
    label: 'EN homepage canonical',
    url: buildRouteCanonicalUrl({ family: 'home', locale: 'en' }),
  },
  {
    label: 'TR homepage canonical',
    url: buildRouteCanonicalUrl({ family: 'home', locale: 'tr' }),
  },
  {
    label: 'EN cultural worlds listing canonical',
    url: buildRouteCanonicalUrl({ family: 'cultural-worlds', locale: 'en' }),
  },
  {
    label: 'TR cultural worlds listing canonical',
    url: buildRouteCanonicalUrl({ family: 'cultural-worlds', locale: 'tr' }),
  },
  {
    label: 'EN cultural world detail canonical',
    url: buildRouteCanonicalUrl({
      family: 'cultural-world-detail',
      locale: 'en',
      slug: 'istanbul',
    }),
  },
  {
    label: 'TR cultural world detail canonical',
    url: buildRouteCanonicalUrl({
      family: 'cultural-world-detail',
      locale: 'tr',
      slug: 'istanbul',
    }),
  },
  {
    label: 'EN experiences listing canonical',
    url: buildRouteCanonicalUrl({ family: 'experiences', locale: 'en' }),
  },
  {
    label: 'TR experiences listing canonical',
    url: buildRouteCanonicalUrl({ family: 'experiences', locale: 'tr' }),
  },
  {
    label: 'EN experience detail canonical',
    url: buildRouteCanonicalUrl({
      family: 'experience-detail',
      locale: 'en',
      slug: 'beylerbeyi-1869-empire-interrupted',
    }),
  },
  {
    label: 'TR experience detail canonical',
    url: buildRouteCanonicalUrl({
      family: 'experience-detail',
      locale: 'tr',
      slug: 'beylerbeyi-1869-empire-interrupted',
    }),
  },
  {
    label: 'EN insights listing canonical',
    url: buildRouteCanonicalUrl({ family: 'insights', locale: 'en' }),
  },
  {
    label: 'TR insights listing canonical',
    url: buildRouteCanonicalUrl({ family: 'insights', locale: 'tr' }),
  },
  {
    label: 'EN insight detail canonical',
    url: buildRouteCanonicalUrl({
      family: 'insight-detail',
      locale: 'en',
      slug: 'private-life-of-istanbul',
    }),
  },
  {
    label: 'TR insight detail canonical',
    url: buildRouteCanonicalUrl({
      family: 'insight-detail',
      locale: 'tr',
      slug: 'private-life-of-istanbul',
    }),
  },
];

assert.equal(new URL(SITE_URL).hostname, PRODUCTION_CANONICAL_HOSTNAME);
assert.equal(SITE_URL, 'https://crearetravel.com');

assertRoute('EN homepage canonical', routeExpectations[0].url, '/');
assertRoute('TR homepage canonical', routeExpectations[1].url, '/tr');
assertRoute('EN cultural worlds listing canonical', routeExpectations[2].url, '/cultural-worlds');
assertRoute(
  'TR cultural worlds listing canonical',
  routeExpectations[3].url,
  '/tr/cultural-worlds'
);
assertRoute(
  'EN cultural world detail canonical',
  routeExpectations[4].url,
  '/cultural-worlds/istanbul'
);
assertRoute(
  'TR cultural world detail canonical',
  routeExpectations[5].url,
  '/tr/cultural-worlds/istanbul'
);
assertRoute('EN experiences listing canonical', routeExpectations[6].url, '/experiences');
assertRoute('TR experiences listing canonical', routeExpectations[7].url, '/tr/experiences');
assertRoute(
  'EN experience detail canonical',
  routeExpectations[8].url,
  '/experiences/beylerbeyi-1869-empire-interrupted'
);
assertRoute(
  'TR experience detail canonical',
  routeExpectations[9].url,
  '/tr/experiences/beylerbeyi-1869-empire-interrupted'
);
assertRoute('EN insights listing canonical', routeExpectations[10].url, '/insights');
assertRoute('TR insights listing canonical', routeExpectations[11].url, '/tr/insights');
assertRoute(
  'EN insight detail canonical',
  routeExpectations[12].url,
  '/insights/private-life-of-istanbul'
);
assertRoute(
  'TR insight detail canonical',
  routeExpectations[13].url,
  '/tr/insights/private-life-of-istanbul'
);

for (const expectation of routeExpectations) {
  assertCanonicalUrl(expectation.label, expectation.url, expectation.url);
}

assert.deepEqual(buildRouteCanonicalAlternates({ family: 'home', locale: 'tr' }), {
  canonical: 'https://crearetravel.com/tr',
});
assert.deepEqual(
  buildRouteCanonicalAlternates({
    family: 'experience-detail',
    locale: 'tr',
    slug: 'beylerbeyi-1869-empire-interrupted',
  }),
  {
    canonical: 'https://crearetravel.com/tr/experiences/beylerbeyi-1869-empire-interrupted',
  }
);

assertCanonicalUrl(
  'query string is stripped from canonicalUrl',
  canonicalUrl('/experiences?utm_source=test'),
  'https://crearetravel.com/experiences'
);
assertCanonicalUrl(
  'fragment is stripped from canonicalUrl',
  canonicalUrl('/tr/insights#editorial'),
  'https://crearetravel.com/tr/insights'
);
assertCanonicalUrl(
  'duplicate slash is normalized in canonicalUrl',
  canonicalUrl('/tr//experiences///beylerbeyi-1869-empire-interrupted'),
  'https://crearetravel.com/tr/experiences/beylerbeyi-1869-empire-interrupted'
);
assertCanonicalUrl(
  'relative path is normalized in canonicalUrl',
  canonicalUrl('insights/private-life-of-istanbul'),
  'https://crearetravel.com/insights/private-life-of-istanbul'
);

assert.equal(getLocaleFromPathname('/travel'), 'en');
assert.equal(getLocaleFromPathname('/trailing'), 'en');
assert.equal(getLocaleFromPathname('/tr'), 'tr');
assert.equal(getLocaleFromPathname('/tr/experiences'), 'tr');

assertThrows('duplicate Turkish prefix is rejected', () => canonicalUrl('/tr/tr'));
assertThrows('protocol-relative canonical path is rejected', () =>
  canonicalUrl('//evil.example/path')
);
assertThrows('external canonical path is rejected', () => canonicalUrl('https://example.com/path'));
assertThrows('preview host canonical path is rejected', () =>
  canonicalUrl('https://rocket.new/path')
);
assertThrows('CMS host canonical path is rejected', () =>
  canonicalUrl('https://creare-cms-production.up.railway.app/api/experiences')
);
assertThrows('localhost canonical path is rejected', () =>
  canonicalUrl('http://localhost:3000/tr')
);
assertThrows('unsupported canonical locale is rejected', () =>
  buildRouteCanonicalUrl({ family: 'home', locale: 'fr' as never })
);
assertThrows('unsupported route family is rejected', () =>
  buildRouteCanonicalUrl({ family: 'bad-family' as never, locale: 'en' })
);
assertThrows('detail route slug is required', () =>
  buildRouteCanonicalUrl({ family: 'experience-detail', locale: 'en' })
);
assertThrows('listing route slug is rejected', () =>
  buildRouteCanonicalUrl({ family: 'experiences', locale: 'en', slug: 'unexpected' })
);
assertThrows('slash-containing slug is rejected', () =>
  buildRouteCanonicalUrl({ family: 'experience-detail', locale: 'tr', slug: 'bad/slug' })
);
assertThrows('malformed encoded slug is rejected', () =>
  buildRouteCanonicalUrl({ family: 'insight-detail', locale: 'en', slug: '%E0%A4%A' })
);
assertThrows('decoded slash slug is rejected', () =>
  buildRouteCanonicalUrl({ family: 'cultural-world-detail', locale: 'tr', slug: 'bad%2Fslug' })
);
assertThrows('assertions fail non-zero on invariant failure', () => assert.equal(true, false));

const assertionFilePath = join(process.cwd(), 'src/lib/i18n/canonical.assertions.ts');
const runtimeImportViolations = listSourceFiles(join(process.cwd(), 'src'))
  .filter((filePath) => filePath !== assertionFilePath)
  .filter((filePath) => readFileSync(filePath, 'utf8').includes('canonical.assertions'));

assert.deepEqual(runtimeImportViolations, []);

console.info('Canonical assertions passed.');
