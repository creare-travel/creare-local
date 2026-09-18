// Guarded workaround for intermittent App Router hydration blocking on Next.js 15.1.11.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextPackagePath = require.resolve('next/package.json');
const nextRoot = path.dirname(nextPackagePath);
const nextPackage = JSON.parse(fs.readFileSync(nextPackagePath, 'utf8'));

const VERIFIED_NEXT_VERSION = '15.1.11';
const runtimePath = path.join(
  nextRoot,
  'dist/compiled/next-server/app-page.runtime.prod.js'
);

if (nextPackage.version !== VERIFIED_NEXT_VERSION) {
  throw new Error(
    `Refusing hydration scheduling patch for unverified Next.js ${nextPackage.version}; expected ${VERIFIED_NEXT_VERSION}.`
  );
}

const source = fs.readFileSync(runtimePath, 'utf8');
const asyncProperty = 'async:!0';
const deferProperty = 'defer:!0';
const asyncTail = ' async=""><\\/script>';
const deferTail = ' defer=""><\\/script>';

const asyncPropertyCount = source.split(asyncProperty).length - 1;
const asyncTailCount = source.split(asyncTail).length - 1;

if (asyncPropertyCount !== 4 || asyncTailCount !== 1) {
  throw new Error(
    `Unexpected Next.js runtime shape: async properties=${asyncPropertyCount}, async script tails=${asyncTailCount}.`
  );
}

const patched = source
  .split(asyncProperty)
  .join(deferProperty)
  .split(asyncTail)
  .join(deferTail);

fs.writeFileSync(runtimePath, patched);
console.log(
  `Patched Next.js ${nextPackage.version} hydration scripts: ${asyncPropertyCount} async properties + ${asyncTailCount} bootstrap tail -> defer.`
);
