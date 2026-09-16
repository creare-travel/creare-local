import fs from 'node:fs/promises';
import path from 'node:path';
import { WEBOPS_CONFIG } from './config.mjs';

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

function metricValue(audits, id) {
  return audits?.[id]?.numericValue ?? null;
}

async function runPsi(target, strategy) {
  const params = new URLSearchParams({
    url: target.url,
    strategy,
  });

  for (const category of WEBOPS_CONFIG.categories) {
    params.append('category', category);
  }

  if (process.env.PAGESPEED_API_KEY) {
    params.set('key', process.env.PAGESPEED_API_KEY);
  }

  const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
    headers: { 'user-agent': 'CREARE-WebOps/1.0' },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PSI ${response.status} for ${target.id}/${strategy}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const categories = data.lighthouseResult?.categories ?? {};
  const audits = data.lighthouseResult?.audits ?? {};

  return {
    target: target.id,
    locale: target.locale,
    url: target.url,
    strategy,
    fetchedAt: data.analysisUTCTimestamp ?? new Date().toISOString(),
    finalUrl: data.lighthouseResult?.finalUrl ?? target.url,
    scores: {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    },
    metrics: {
      fcpMs: metricValue(audits, 'first-contentful-paint'),
      lcpMs: metricValue(audits, 'largest-contentful-paint'),
      cls: metricValue(audits, 'cumulative-layout-shift'),
      tbtMs: metricValue(audits, 'total-blocking-time'),
      speedIndexMs: metricValue(audits, 'speed-index'),
      ttiMs: metricValue(audits, 'interactive'),
    },
    lighthouseVersion: data.lighthouseResult?.lighthouseVersion ?? null,
  };
}

function evaluate(result) {
  const threshold = WEBOPS_CONFIG.thresholds[result.strategy];
  const violations = [];

  if (result.scores.performance < threshold.performance) {
    violations.push(`performance ${result.scores.performance} < ${threshold.performance}`);
  }
  if (result.metrics.lcpMs != null && result.metrics.lcpMs > threshold.lcpMs) {
    violations.push(`LCP ${Math.round(result.metrics.lcpMs)}ms > ${threshold.lcpMs}ms`);
  }
  if (result.metrics.cls != null && result.metrics.cls > threshold.cls) {
    violations.push(`CLS ${result.metrics.cls.toFixed(3)} > ${threshold.cls}`);
  }
  if (result.metrics.tbtMs != null && result.metrics.tbtMs > threshold.tbtMs) {
    violations.push(`TBT ${Math.round(result.metrics.tbtMs)}ms > ${threshold.tbtMs}ms`);
  }

  return { ...result, status: violations.length ? 'alert' : 'pass', violations };
}

const results = [];
for (const target of WEBOPS_CONFIG.targets) {
  for (const strategy of WEBOPS_CONFIG.strategies) {
    try {
      results.push(evaluate(await runPsi(target, strategy)));
    } catch (error) {
      results.push({
        target: target.id,
        locale: target.locale,
        url: target.url,
        strategy,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  gitSha: process.env.GITHUB_SHA ?? null,
  repository: process.env.GITHUB_REPOSITORY ?? null,
  results,
};

const outputDir = path.resolve('webops/output');
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'latest.json'), JSON.stringify(output, null, 2));

console.log(JSON.stringify(output, null, 2));

if (results.every((result) => result.status === 'error')) {
  process.exitCode = 2;
}
