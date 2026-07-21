import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { canUseEnglishFallback, buildLocaleAwareStrapiPath } from './data-layer';
import { getStrapiLocale, isSiteLocale, type SiteLocale } from './config';
import {
  buildLocalizedRouteTarget,
  getLocaleFromPathname,
  localizePathname,
  normalizePathname,
} from './pathname';

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

assert.equal(getLocaleFromPathname('/experiences/test'), 'en');
assert.equal(getLocaleFromPathname('/tr/experiences/test'), 'tr');
assert.equal(getStrapiLocale('tr'), 'tr-TR');
assert.equal(
  buildLocaleAwareStrapiPath('/api/experiences?filters[slug][$eq]=test', 'tr'),
  '/api/experiences?filters%5Bslug%5D%5B%24eq%5D=test&locale=tr-TR'
);
assert.equal(localizePathname('/experiences/test', 'tr'), '/tr/experiences/test');
assert.equal(localizePathname('/tr/experiences/test', 'en'), '/experiences/test');
assert.equal(
  buildLocalizedRouteTarget('/experiences', 'canonical-slug', 'en'),
  '/experiences/canonical-slug'
);
assert.equal(
  buildLocalizedRouteTarget('/experiences', 'canonical-slug', 'tr'),
  '/tr/experiences/canonical-slug'
);
assert.equal(
  buildLocalizedRouteTarget('/insights', 'canonical-slug', 'en'),
  '/insights/canonical-slug'
);
assert.equal(
  buildLocalizedRouteTarget('/insights', 'canonical-slug', 'tr'),
  '/tr/insights/canonical-slug'
);
assert.equal(
  buildLocalizedRouteTarget('/tr/experiences', 'canonical-slug', 'tr'),
  '/tr/experiences/canonical-slug'
);
assert.equal(localizePathname('/travel', 'en'), '/travel');
assert.equal(localizePathname('/trailing', 'en'), '/trailing');
assert.equal(getLocaleFromPathname('/travel'), 'en');
assert.equal(getLocaleFromPathname('/trailing'), 'en');
assert.equal(isSiteLocale('en'), true);
assert.equal(isSiteLocale('tr'), true);
['ru', 'zh', 'ar', 'fr', '', null, undefined, 'de', 'english'].forEach((locale) => {
  assert.equal(
    isSiteLocale(locale),
    false,
    `Unsupported locale must be rejected: ${String(locale)}`
  );
});
assert.equal(canUseEnglishFallback('tr'), false);

const relatedContentLocale = 'tr' satisfies SiteLocale;
assert.equal(getStrapiLocale(relatedContentLocale), 'tr-TR');

[
  localizePathname('/tr/experiences/test', 'tr'),
  localizePathname('/experiences/test', 'tr'),
  localizePathname('/tr/insights/private-life-of-istanbul', 'tr'),
  buildLocalizedRouteTarget('/tr/experiences', 'test', 'tr'),
  normalizePathname('/tr/tr/experiences/test'),
].forEach((pathname) => {
  assert.equal(
    pathname.includes('/tr/tr'),
    false,
    `Generated duplicate Turkish prefix: ${pathname}`
  );
});

const routeFiles = [
  'src/app/(tr)/tr/page.tsx',
  'src/app/(tr)/tr/cultural-worlds/page.tsx',
  'src/app/(tr)/tr/cultural-worlds/[slug]/page.tsx',
  'src/app/(tr)/tr/experiences/page.tsx',
  'src/app/(tr)/tr/experiences/[slug]/page.tsx',
  'src/app/(tr)/tr/insights/page.tsx',
  'src/app/(tr)/tr/insights/[slug]/page.tsx',
  'src/app/(tr)/tr/philosophy/page.tsx',
  'src/app/(tr)/tr/contact/page.tsx',
  'src/app/(tr)/tr/privacy/page.tsx',
  'src/app/(tr)/tr/terms/page.tsx',
  'src/app/(tr)/tr/cookies/page.tsx',
];

routeFiles.forEach((filePath) => {
  const source = readFileSync(join(process.cwd(), filePath), 'utf8');
  assert.equal(
    source.includes('localStorage'),
    false,
    `Direct /tr route must not depend on localStorage: ${filePath}`
  );
});

const sourceFiles = walkFiles(join(process.cwd(), 'src')).filter(
  (filePath) => /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('route-foundation.assertions.ts')
);

sourceFiles.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  assert.equal(
    source.includes('route-foundation.assertions'),
    false,
    `route-foundation.assertions must not be imported by runtime source: ${filePath}`
  );
});

console.info('TR route foundation assertions passed');
