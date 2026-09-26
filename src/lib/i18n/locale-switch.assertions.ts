import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { SiteLocale } from './config';
import { EXPERIENCE_CATEGORY_ROUTES } from './static-routes';
import {
  buildLocaleSwitchCandidate,
  classifyLocalizedRoute,
  createLocaleSwitchPlan,
  finalizeLocaleSwitchTarget,
  getLocaleFallbackPath,
  isSafeSameOriginUrl,
  resolveLocaleSwitchTarget,
} from './locale-switch';

const origin = 'https://creare.test';

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

const okProbe = async (input: RequestInfo | URL) => ({
  ok: true,
  status: 200,
  url: new URL(String(input), origin).toString(),
});

const missingProbe = async (input: RequestInfo | URL) => ({
  ok: false,
  status: 404,
  url: new URL(String(input), origin).toString(),
});

function probeFinalUrl(finalUrl: string, status = 200, ok = true) {
  return async () => ({
    ok,
    status,
    url: finalUrl,
  });
}

async function resolveWithFinalUrl(
  pathname: string,
  targetLocale: SiteLocale,
  finalUrl: string,
  status = 200,
  ok = true
) {
  return resolveLocaleSwitchTarget({
    origin,
    pathname,
    routeProbe: probeFinalUrl(finalUrl, status, ok),
    targetLocale,
  });
}

assert.equal(finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/', 'tr'), true).targetPath, '/tr');
assert.equal(finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr', 'en'), true).targetPath, '/');
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/cultural-worlds', 'tr'), true).targetPath,
  '/tr/cultural-worlds'
);
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr/cultural-worlds', 'en'), true).targetPath,
  '/cultural-worlds'
);
assert.equal(
  buildLocaleSwitchCandidate('/experiences/silk-road-istanbul', 'tr'),
  '/tr/experiences/silk-road-istanbul'
);
assert.equal(
  buildLocaleSwitchCandidate('/tr/experiences/silk-road-istanbul', 'en'),
  '/experiences/silk-road-istanbul'
);
assert.equal(
  finalizeLocaleSwitchTarget(
    createLocaleSwitchPlan(
      '/insights/private-life-of-istanbul',
      'tr',
      '?utm_source=test',
      '#overview'
    ),
    true
  ).targetPath,
  '/tr/insights/private-life-of-istanbul?utm_source=test#overview'
);
assert.equal(classifyLocalizedRoute('/travel').currentLocale, 'en');
assert.equal(classifyLocalizedRoute('/travel').kind, 'unknown');
assert.equal(classifyLocalizedRoute('/trailing').currentLocale, 'en');
assert.equal(classifyLocalizedRoute('/trailing').kind, 'unknown');
[
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr', 'tr'), true).targetPath,
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/experiences/test', 'tr'), true).targetPath,
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr/experiences/test', 'tr'), true).targetPath,
].forEach((targetPath) => {
  assert.equal(
    targetPath.includes('/tr/tr'),
    false,
    `Generated duplicate Turkish prefix: ${targetPath}`
  );
});
EXPERIENCE_CATEGORY_ROUTES.forEach((path) => {
  assert.equal(
    finalizeLocaleSwitchTarget(createLocaleSwitchPlan(path, 'tr'), true).targetPath,
    `/tr${path}`,
    `EN to TR collection switch must preserve the collection route: ${path}`
  );
  assert.equal(
    finalizeLocaleSwitchTarget(createLocaleSwitchPlan(`/tr${path}`, 'en'), true).targetPath,
    path,
    `TR to EN collection switch must preserve the collection route: ${path}`
  );
  assert.equal(
    classifyLocalizedRoute(`/tr${path}`).kind,
    'category',
    `TR collection route must not be classified as an Experience detail: ${path}`
  );
});
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/contact', 'tr'), true).targetPath,
  '/tr/contact'
);
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr/contact', 'en'), true).targetPath,
  '/contact'
);
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/privacy', 'tr'), true).targetPath,
  '/tr/privacy'
);
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr/terms', 'en'), true).targetPath,
  '/terms'
);
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/unknown-route', 'tr'), false).targetPath,
  '/tr'
);
assert.equal(
  finalizeLocaleSwitchTarget(createLocaleSwitchPlan('/tr/unknown-route', 'en'), false).targetPath,
  '/'
);
assert.equal(getLocaleFallbackPath('/cultural-worlds/missing-place', 'tr'), '/tr/cultural-worlds');
assert.equal(getLocaleFallbackPath('/experiences/missing-experience', 'tr'), '/tr/experiences');
assert.equal(getLocaleFallbackPath('/insights/missing-insight', 'tr'), '/tr/insights');
assert.equal(
  finalizeLocaleSwitchTarget(
    createLocaleSwitchPlan('/experiences/silk-road-istanbul', 'tr', '?utm_source=selector-smoke'),
    true
  ).targetPath,
  '/tr/experiences/silk-road-istanbul?utm_source=selector-smoke'
);
assert.equal(
  finalizeLocaleSwitchTarget(
    createLocaleSwitchPlan('/experiences/silk-road-istanbul', 'tr', '', '#overview'),
    true
  ).targetPath,
  '/tr/experiences/silk-road-istanbul#overview'
);
assert.equal(
  finalizeLocaleSwitchTarget(
    createLocaleSwitchPlan(
      '/experiences/silk-road-istanbul',
      'tr',
      '?utm_source=selector-smoke',
      '#overview'
    ),
    false
  ).targetPath,
  '/tr/experiences'
);
assert.throws(() => createLocaleSwitchPlan('/', 'fr' as SiteLocale), /Unsupported locale/);
assert.equal(isSafeSameOriginUrl('https://external.example/tr', origin), false);
assert.equal(isSafeSameOriginUrl('//external.example/tr', origin), false);

async function main() {
  const validEquivalent = await resolveLocaleSwitchTarget({
    hash: '#overview',
    origin,
    pathname: '/experiences/silk-road-istanbul',
    routeProbe: okProbe,
    search: '?utm_source=selector-smoke',
    targetLocale: 'tr',
  });
  assert.equal(
    validEquivalent.targetPath,
    '/tr/experiences/silk-road-istanbul?utm_source=selector-smoke#overview'
  );
  assert.equal(validEquivalent.usedFallback, false);

  const missingEquivalent = await resolveLocaleSwitchTarget({
    hash: '#overview',
    origin,
    pathname: '/experiences/princes-islands-regatta',
    routeProbe: missingProbe,
    search: '?utm_source=selector-smoke',
    targetLocale: 'tr',
  });
  assert.equal(missingEquivalent.targetPath, '/tr/experiences');
  assert.equal(missingEquivalent.usedFallback, true);

  const externalRedirectProbe = async () => ({
    ok: true,
    status: 200,
    url: 'https://external.example/tr/experiences/silk-road-istanbul',
  });
  const externalRedirect = await resolveLocaleSwitchTarget({
    origin,
    pathname: '/experiences/silk-road-istanbul',
    routeProbe: externalRedirectProbe,
    targetLocale: 'tr',
  });
  assert.equal(externalRedirect.targetPath, '/tr/experiences');
  assert.equal(externalRedirect.usedFallback, true);

  const wrongLocaleTr = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/experiences/silk-road-istanbul`
  );
  assert.equal(wrongLocaleTr.targetPath, '/tr/experiences');
  assert.equal(wrongLocaleTr.usedFallback, true);

  const wrongLocaleEn = await resolveWithFinalUrl(
    '/tr/experiences/silk-road-istanbul',
    'en',
    `${origin}/tr/experiences/silk-road-istanbul`
  );
  assert.equal(wrongLocaleEn.targetPath, '/experiences');
  assert.equal(wrongLocaleEn.usedFallback, true);

  const validTrRedirect = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/tr/experiences/canonical-silk-road`
  );
  assert.equal(validTrRedirect.targetPath, '/tr/experiences/canonical-silk-road');
  assert.equal(validTrRedirect.usedFallback, false);

  const validEnRedirect = await resolveWithFinalUrl(
    '/tr/experiences/silk-road-istanbul',
    'en',
    `${origin}/experiences/canonical-silk-road`
  );
  assert.equal(validEnRedirect.targetPath, '/experiences/canonical-silk-road');
  assert.equal(validEnRedirect.usedFallback, false);

  const travelRedirect = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/travel`
  );
  assert.equal(travelRedirect.targetPath, '/tr/experiences');
  assert.equal(travelRedirect.usedFallback, true);

  const trailingRedirect = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/trailing`
  );
  assert.equal(trailingRedirect.targetPath, '/tr/experiences');
  assert.equal(trailingRedirect.usedFallback, true);

  const duplicateTrRedirect = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/tr/tr/experiences/silk-road-istanbul`
  );
  assert.equal(duplicateTrRedirect.targetPath, '/tr/experiences');
  assert.equal(duplicateTrRedirect.usedFallback, true);

  const experienceToInsight = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/tr/insights/private-life-of-istanbul`
  );
  assert.equal(experienceToInsight.targetPath, '/tr/experiences');
  assert.equal(experienceToInsight.usedFallback, true);

  const insightToExperience = await resolveWithFinalUrl(
    '/insights/private-life-of-istanbul',
    'tr',
    `${origin}/tr/experiences/silk-road-istanbul`
  );
  assert.equal(insightToExperience.targetPath, '/tr/insights');
  assert.equal(insightToExperience.usedFallback, true);

  const culturalToHome = await resolveWithFinalUrl(
    '/cultural-worlds/istanbul',
    'tr',
    `${origin}/tr`
  );
  assert.equal(culturalToHome.targetPath, '/tr/cultural-worlds');
  assert.equal(culturalToHome.usedFallback, true);

  const protocolRelativeRedirect = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    '//external.example/tr/experiences/silk-road-istanbul'
  );
  assert.equal(protocolRelativeRedirect.targetPath, '/tr/experiences');
  assert.equal(protocolRelativeRedirect.usedFallback, true);

  const malformedRedirect = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    'http://[malformed-url'
  );
  assert.equal(malformedRedirect.targetPath, '/tr/experiences');
  assert.equal(malformedRedirect.usedFallback, true);

  const failedProbe = await resolveWithFinalUrl(
    '/experiences/silk-road-istanbul',
    'tr',
    `${origin}/tr/experiences/silk-road-istanbul`,
    500,
    false
  );
  assert.equal(failedProbe.targetPath, '/tr/experiences');
  assert.equal(failedProbe.usedFallback, true);
}

assert.throws(() => assert.equal(true, false));

const sourceFiles = walkFiles(join(process.cwd(), 'src')).filter(
  (filePath) => /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('locale-switch.assertions.ts')
);

sourceFiles.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  assert.equal(
    source.includes('locale-switch.assertions'),
    false,
    `locale-switch.assertions must not be imported by runtime source: ${filePath}`
  );
});

const selectorSource = readFileSync(
  join(process.cwd(), 'src/components/LanguageSelector.tsx'),
  'utf8'
);
assert.ok(selectorSource.includes('abortRef.current?.abort()'));
assert.ok(selectorSource.includes('switchIdRef.current !== switchId'));
assert.ok(selectorSource.includes('!mountedRef.current'));
assert.ok(
  selectorSource.indexOf('if (code === locale)') < selectorSource.indexOf('setLocale(code)')
);

function applyNavigationResult({
  activeSwitchId,
  mounted,
  resultSwitchId,
  signalAborted,
}: {
  activeSwitchId: number;
  mounted: boolean;
  resultSwitchId: number;
  signalAborted: boolean;
}) {
  return mounted && !signalAborted && activeSwitchId === resultSwitchId;
}

assert.equal(
  applyNavigationResult({
    activeSwitchId: 2,
    mounted: true,
    resultSwitchId: 1,
    signalAborted: false,
  }),
  false,
  'Stale success must not navigate after a newer selection'
);
assert.equal(
  applyNavigationResult({
    activeSwitchId: 2,
    mounted: true,
    resultSwitchId: 1,
    signalAborted: false,
  }),
  false,
  'Stale failure must not override a newer success'
);
assert.equal(
  applyNavigationResult({
    activeSwitchId: 2,
    mounted: true,
    resultSwitchId: 1,
    signalAborted: false,
  }),
  false,
  'Stale success must not override a newer fallback'
);
assert.equal(
  applyNavigationResult({
    activeSwitchId: 2,
    mounted: true,
    resultSwitchId: 2,
    signalAborted: true,
  }),
  false,
  'Aborted request must not navigate'
);
assert.equal(
  applyNavigationResult({
    activeSwitchId: 2,
    mounted: false,
    resultSwitchId: 2,
    signalAborted: false,
  }),
  false,
  'Unmounted selector must not navigate or update state'
);

main()
  .then(() => {
    console.info('Locale switch assertions passed');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
