import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

function readSource(filePath: string): string {
  return readFileSync(join(process.cwd(), filePath), 'utf8');
}

function countOccurrences(source: string, pattern: string): number {
  return source.split(pattern).length - 1;
}

const enLayoutPath = 'src/app/(en)/layout.tsx';
const trLayoutPath = 'src/app/(tr)/layout.tsx';
const shellPath = 'src/components/layout/LocaleRootShell.tsx';

assert.equal(existsSync(join(process.cwd(), 'src/app/layout.tsx')), false);
assert.equal(existsSync(join(process.cwd(), enLayoutPath)), true);
assert.equal(existsSync(join(process.cwd(), trLayoutPath)), true);
assert.equal(existsSync(join(process.cwd(), shellPath)), true);

const enLayoutSource = readSource(enLayoutPath);
const trLayoutSource = readSource(trLayoutPath);
const shellSource = readSource(shellPath);

assert.equal(
  enLayoutSource.includes("getLocaleDescriptor('en')"),
  true,
  'EN root owns the EN locale descriptor'
);
assert.equal(
  trLayoutSource.includes("getLocaleDescriptor('tr')"),
  true,
  'TR root owns the TR locale descriptor'
);
assert.equal(
  enLayoutSource.includes('lang={locale.htmlLang}'),
  true,
  'EN root derives HTML language from the locale registry'
);
assert.equal(
  trLayoutSource.includes('lang={locale.htmlLang}'),
  true,
  'TR root derives HTML language from the locale registry'
);
assert.equal(
  enLayoutSource.includes('<LocaleRootShell locale="en">'),
  true,
  'EN root passes explicit locale'
);
assert.equal(
  trLayoutSource.includes('<LocaleRootShell locale="tr">'),
  true,
  'TR root passes explicit locale'
);
assert.equal(
  countOccurrences(enLayoutSource, 'localeRootMetadata'),
  2,
  'EN root consumes shared locale root metadata export'
);
assert.equal(
  countOccurrences(trLayoutSource, 'localeRootMetadata'),
  2,
  'TR root consumes shared locale root metadata export'
);

[enLayoutSource, trLayoutSource, shellSource].forEach((source) => {
  [
    'headers(',
    'cookies(',
    'navigator.language',
    'localStorage',
    'document.documentElement',
  ].forEach((forbidden) => {
    assert.equal(source.includes(forbidden), false, `Root locale source must not use ${forbidden}`);
  });
});

assert.equal(
  shellSource.includes('usePathname'),
  false,
  'Root shell must not infer locale by path'
);
assert.equal(
  shellSource.includes('<LanguageProvider initialLocale={locale}>'),
  true,
  'Root shell passes explicit locale into provider'
);
assert.equal(countOccurrences(shellSource, '<Header />'), 1, 'Root shell owns one Header');
assert.equal(countOccurrences(shellSource, '<Footer />'), 1, 'Root shell owns one Footer');
assert.equal(
  countOccurrences(shellSource, '<GoogleTagManager />'),
  1,
  'Root shell owns one GoogleTagManager'
);
assert.equal(
  countOccurrences(shellSource, 'id="global-schema-jsonld"'),
  1,
  'Root organization schema is emitted once by the shell'
);
assert.equal(
  enLayoutSource.includes('GoogleTagManager') || trLayoutSource.includes('GoogleTagManager'),
  false,
  'Locale root layouts must not duplicate GTM'
);

assert.equal(
  shellSource.includes('metadataBase: new URL('),
  false,
  'Root metadata uses approved shared metadataBase constant'
);
assert.equal(
  shellSource.includes('metadataBase: DEFAULT_METADATA.metadataBase'),
  true,
  'Root metadata keeps approved metadataBase ownership'
);
assert.equal(
  shellSource.includes('applicationName'),
  false,
  'Root metadata must not emit unapproved application-name output'
);
assert.equal(
  shellSource.includes('template: DEFAULT_METADATA.titleTemplate'),
  true,
  'Root metadata preserves approved title template'
);
assert.equal(
  shellSource.includes('default: isMaintenanceMode'),
  true,
  'Root metadata preserves approved title default branch'
);
assert.equal(
  shellSource.includes('robots:'),
  true,
  'Root metadata preserves approved robots fallback'
);
assert.equal(
  shellSource.includes("card: 'summary_large_image'"),
  true,
  'Root metadata preserves approved Twitter card fallback'
);
assert.equal(
  shellSource.includes('alternates:'),
  false,
  'Root metadata must not own canonical or hreflang alternates'
);
assert.equal(
  shellSource.includes("url: 'https://crearetravel.com'"),
  false,
  'Root metadata must not own page Open Graph URL'
);
assert.equal(
  shellSource.includes('description: trDictionary') ||
    shellSource.includes('description: getDictionary') ||
    shellSource.includes('description: dictionary'),
  false,
  'Root metadata must not own translated root description'
);

[
  'src/app/(en)/page.tsx',
  'src/app/(en)/cultural-worlds/page.tsx',
  'src/app/(en)/experiences/page.tsx',
  'src/app/(en)/insights/page.tsx',
  'src/app/(tr)/tr/page.tsx',
  'src/app/(tr)/tr/cultural-worlds/page.tsx',
  'src/app/(tr)/tr/experiences/page.tsx',
  'src/app/(tr)/tr/insights/page.tsx',
].forEach((filePath) => {
  const source = readSource(filePath);
  assert.equal(
    source.includes('metadata') || source.includes('generateMetadata'),
    true,
    `Valid page metadata remains route-owned: ${filePath}`
  );
});

const appSourceFiles = walkFiles(join(process.cwd(), 'src/app')).filter((filePath) =>
  /\.(ts|tsx)$/.test(filePath)
);

appSourceFiles.forEach((filePath) => {
  const relativePath = filePath.replace(`${process.cwd()}/`, '');

  if (
    relativePath.includes('/api/') ||
    relativePath.endsWith('sitemap.ts') ||
    relativePath.endsWith('robots.ts')
  ) {
    return;
  }

  if (
    relativePath.endsWith('/page.tsx') ||
    relativePath.endsWith('/not-found.tsx') ||
    relativePath.endsWith('/opengraph-image.tsx')
  ) {
    assert.equal(
      relativePath.includes('src/app/(en)/') ||
        relativePath.includes('src/app/(tr)/') ||
        relativePath.includes('src/app/[locale]/'),
      true,
      `Route-owned file must live under a locale root group: ${relativePath}`
    );
  }
});

const runtimeSources = walkFiles(join(process.cwd(), 'src')).filter(
  (filePath) => /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('locale-root.assertions.ts')
);

const importsGoogleTagManager = runtimeSources.filter((filePath) =>
  readFileSync(filePath, 'utf8').includes("from '@/components/GoogleTagManager'")
);
const importsHeader = runtimeSources.filter((filePath) =>
  readFileSync(filePath, 'utf8').includes("from '@/components/Header'")
);
const importsFooter = runtimeSources.filter((filePath) =>
  readFileSync(filePath, 'utf8').includes("from '@/components/Footer'")
);

assert.deepEqual(importsGoogleTagManager, [join(process.cwd(), shellPath)]);
assert.deepEqual(importsHeader, [join(process.cwd(), shellPath)]);
assert.deepEqual(importsFooter, [join(process.cwd(), shellPath)]);

runtimeSources.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  assert.equal(
    source.includes('locale-root.assertions'),
    false,
    `locale-root.assertions must not be imported by runtime source: ${filePath}`
  );
});

[
  'src/app/(en)/page.tsx',
  'src/app/(en)/cultural-worlds/page.tsx',
  'src/app/(en)/experiences/page.tsx',
  'src/app/(en)/insights/page.tsx',
].forEach((filePath) => {
  assert.equal(
    readSource(filePath).includes('/en'),
    false,
    `EN route must remain unprefixed: ${filePath}`
  );
});

[
  'src/app/(tr)/tr/page.tsx',
  'src/app/(tr)/tr/cultural-worlds/page.tsx',
  'src/app/(tr)/tr/experiences/page.tsx',
  'src/app/(tr)/tr/insights/page.tsx',
].forEach((filePath) => {
  assert.equal(
    readSource(filePath).includes('/tr/tr'),
    false,
    `TR route must not duplicate prefix: ${filePath}`
  );
});

console.info('Locale root assertions passed');
