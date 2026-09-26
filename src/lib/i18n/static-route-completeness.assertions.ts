import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import enDictionary from '@/locales/en.json';
import trDictionary from '@/locales/tr.json';
import {
  EXPERIENCE_CATEGORY_ROUTES,
  getExperienceCategoryTarget,
  getFooterNavigationRoutes,
  getLegalNavigationRoutes,
  getPrimaryNavigationRoutes,
  getPrivateInquiryHref,
  LEGAL_NAVIGATION_ROUTES,
  PRIMARY_NAVIGATION_ROUTES,
} from './static-routes';

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

function getValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);
}

function assertNonEmptyTurkishKey(path: string): void {
  const value = getValue(trDictionary, path);
  assert.equal(typeof value, 'string', `TR key must exist as a string: ${path}`);
  assert.notEqual((value as string).trim(), '', `TR key must not be empty: ${path}`);
}

const trPrimaryLinks = getPrimaryNavigationRoutes('tr');
assert.deepEqual(
  trPrimaryLinks.map((route) => route.href),
  ['/tr/cultural-worlds', '/tr/experiences', '/tr/insights', '/tr/philosophy', '/tr/contact'],
  'TR primary navigation must expose implemented Turkish routes'
);
assert.deepEqual(
  getFooterNavigationRoutes('tr').map((route) => route.href),
  ['/tr/cultural-worlds', '/tr/experiences', '/tr/insights', '/tr/philosophy', '/tr/contact'],
  'TR footer navigation must expose implemented Turkish routes'
);
assert.deepEqual(
  getLegalNavigationRoutes('tr').map((route) => route.href),
  ['/tr/privacy', '/tr/cookies', '/tr/terms'],
  'TR legal footer links must expose implemented Turkish legal routes'
);

PRIMARY_NAVIGATION_ROUTES.filter((route) => route.availability.tr === 'available').forEach(
  (route) => {
    assertNonEmptyTurkishKey(`global.nav.${route.key}`);
    assertNonEmptyTurkishKey(`global.footer.${route.key}`);
  }
);

assert.equal(
  PRIMARY_NAVIGATION_ROUTES.some((route) => route.availability.tr === 'copy-approval-required'),
  false,
  'TR copy-approved primary routes must no longer be marked unavailable'
);

assert.equal(
  LEGAL_NAVIGATION_ROUTES.some((route) => route.availability.tr === 'legal-approval-required'),
  false,
  'Implemented TR legal routes must no longer be marked unavailable'
);

EXPERIENCE_CATEGORY_ROUTES.forEach((path) => {
  assert.equal(
    getExperienceCategoryTarget(path, 'tr'),
    `/tr${path}`,
    `TR category route must preserve the localized collection path: ${path}`
  );
  assert.equal(
    getExperienceCategoryTarget(path, 'en'),
    path,
    `EN category route must preserve dedicated category page: ${path}`
  );
});

assert.equal(getPrivateInquiryHref('tr'), '/tr/contact', 'TR inquiry links must target TR contact');
assert.equal(getPrivateInquiryHref('en'), '/contact', 'EN inquiry link must remain unchanged');
assert.equal(
  getPrivateInquiryHref('tr', '?source=experience&slug=test'),
  '/tr/contact?source=experience&slug=test',
  'TR inquiry query state must be preserved'
);
assert.equal(
  getPrivateInquiryHref('en', '?source=experience&slug=test'),
  '/contact?source=experience&slug=test',
  'EN inquiry query state must be preserved'
);

[
  'home.hero.eyebrow',
  'home.hero.title',
  'home.hero.subtitle',
  'home.cta.approach',
  'home.collections.eyebrow',
  'home.mainParagraph.paragraph1',
  'home.mainParagraph.paragraph2',
  'home.mainParagraph.paragraph3',
  'culturalWorlds.title',
  'culturalWorlds.atlasTitle',
  'culturalWorlds.geography',
  'experiences.title',
  'experiences.threeWays',
  'experiences.collection',
  'insights.title',
  'insights.subtitle',
  'notFound.title',
  'notFound.message',
  'notFound.goBack',
  'notFound.backHome',
].forEach(assertNonEmptyTurkishKey);

['notFound.title', 'notFound.message', 'notFound.goBack', 'notFound.backHome'].forEach((key) => {
  assert.notEqual(
    getValue(trDictionary, key),
    getValue(enDictionary, key),
    `TR 404 copy must not duplicate English copy: ${key}`
  );
});

assert.equal(
  getValue(trDictionary, 'notFound.message'),
  'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
  'TR 404 message must match the approved Turkish copy'
);

[
  'src/app/(tr)/tr/page.tsx',
  'src/app/(tr)/tr/cultural-worlds/page.tsx',
  'src/app/(tr)/tr/experiences/page.tsx',
  'src/app/(tr)/tr/insights/page.tsx',
  'src/app/(tr)/tr/not-found.tsx',
  'src/app/(tr)/tr/philosophy/page.tsx',
  'src/app/(tr)/tr/contact/page.tsx',
  'src/app/(tr)/tr/privacy/page.tsx',
  'src/app/(tr)/tr/terms/page.tsx',
  'src/app/(tr)/tr/cookies/page.tsx',
].forEach((filePath) => {
  assert.equal(
    existsSync(join(process.cwd(), filePath)),
    true,
    `Missing required TR route: ${filePath}`
  );
});

[
  ['signature', 'src/app/(tr)/tr/experiences/signature/page.tsx'],
  ['lab', 'src/app/(tr)/tr/experiences/lab/page.tsx'],
  ['black', 'src/app/(tr)/tr/experiences/black/page.tsx'],
].forEach(([category, filePath]) => {
  assert.equal(
    existsSync(join(process.cwd(), filePath)),
    true,
    `Missing localized TR Experience collection route: ${filePath}`
  );
  assert.equal(
    readFileSync(join(process.cwd(), filePath), 'utf8').includes(
      `renderExperienceCategoryPage('${category}', 'tr')`
    ),
    true,
    `TR Experience collection route must render its localized category: ${filePath}`
  );
});

const runtimeSources = walkFiles(join(process.cwd(), 'src')).filter(
  (filePath) =>
    /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('static-route-completeness.assertions.ts')
);

runtimeSources.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  assert.equal(
    source.includes('static-route-completeness.assertions'),
    false,
    `static-route-completeness.assertions must not be imported by runtime source: ${filePath}`
  );
});

const notFoundClientSource = readFileSync(
  join(process.cwd(), 'src/app/NotFoundClient.tsx'),
  'utf8'
);
assert.equal(
  notFoundClientSource.includes('defaultCopy'),
  false,
  'NotFoundClient must not contain a hidden English default copy fallback'
);
assert.equal(
  notFoundClientSource.includes('homeHref: string'),
  true,
  'NotFoundClient must require an explicit homeHref'
);

const rootNotFoundSource = readFileSync(join(process.cwd(), 'src/app/(en)/not-found.tsx'), 'utf8');
assert.equal(
  rootNotFoundSource.includes('homeHref="/"'),
  true,
  'Root English 404 must pass the English home target explicitly'
);

const turkishNotFoundSource = readFileSync(
  join(process.cwd(), 'src/app/(tr)/tr/not-found.tsx'),
  'utf8'
);
assert.equal(
  turkishNotFoundSource.includes("homeHref={localizePathname('/', 'tr')}"),
  true,
  'Turkish 404 must pass the Turkish home target explicitly'
);

console.info('Static route completeness assertions passed');
