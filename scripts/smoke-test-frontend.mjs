#!/usr/bin/env node

const BASE_URL = (process.env.SMOKE_BASE_URL || 'https://www.crearetravel.com').replace(/\/+$/, '');
const TIMEOUT_MS = 8000;

const routes = [
  '/',
  '/api/health',
  '/api/ready',
  '/experiences/signature',
  '/experiences/black',
  '/cultural-worlds',
  '/insights',
  '/contact',
];

function buildUrl(route) {
  return new URL(route, `${BASE_URL}/`).toString();
}

async function checkRoute(route) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await fetch(buildUrl(route), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      },
    });

    const durationMs = Math.round(performance.now() - startedAt);
    const passed = response.status >= 200 && response.status < 400;

    return {
      route,
      status: response.status,
      durationMs,
      passed,
      reason: passed ? null : 'non-2xx/3xx response',
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    const aborted = error instanceof Error && error.name === 'AbortError';

    return {
      route,
      status: aborted ? 'TIMEOUT' : 'ERROR',
      durationMs,
      passed: false,
      reason: aborted ? `timed out after ${TIMEOUT_MS}ms` : error instanceof Error ? error.message : 'request failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  console.log(`CREARE frontend smoke test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms`);
  console.log('');

  const results = [];

  for (const route of routes) {
    const result = await checkRoute(route);
    results.push(result);
    const label = result.passed ? 'PASS' : 'FAIL';
    console.log(`[${label}] ${route} ${result.status} ${result.durationMs}ms`);
  }

  const failures = results.filter((result) => !result.passed);

  if (failures.length > 0) {
    console.log('');
    console.log(`Smoke test failed for ${failures.length} route(s).`);
    for (const failure of failures) {
      console.log(`- ${failure.route}: ${failure.reason}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log(`Smoke test passed for ${results.length} route(s).`);
}

await main();
