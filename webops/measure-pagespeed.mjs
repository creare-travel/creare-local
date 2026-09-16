import fs from 'node:fs/promises';
import path from 'node:path';
import { WEBOPS_CONFIG } from './config.mjs';

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const SAMPLE_COUNT = Number(process.env.WEBOPS_SAMPLES || 3);
const MAX_RETRIES = Number(process.env.WEBOPS_RETRIES || 2);
const RETRY_BASE_MS = Number(process.env.WEBOPS_RETRY_BASE_MS || 1500);
const MIN_EVIDENCE = Math.min(SAMPLE_COUNT, Number(process.env.WEBOPS_MIN_EVIDENCE || 2));
const SAMPLE_GAP_MS = Number(process.env.WEBOPS_SAMPLE_GAP_MS || 15000);

function metricValue(audits, id) {
  return audits?.[id]?.numericValue ?? null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function median(values) {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
}

function getIndependentSamples(samples) {
  const seen = new Set();
  return samples.filter((sample) => {
    const key = sample.fetchedAt;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function runPsiOnce(target, strategy) {
  const params = new URLSearchParams({ url: target.url, strategy });

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
    const error = new Error(`PSI ${response.status} for ${target.id}/${strategy}: ${body.slice(0, 500)}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const categories = data.lighthouseResult?.categories ?? {};
  const audits = data.lighthouseResult?.audits ?? {};

  return {
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

async function runPsiWithRetry(target, strategy) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await runPsiOnce(target, strategy);
    } catch (error) {
      lastError = error;
      const status = error?.status;
      const transient = status === 429 || (status >= 500 && status <= 599);
      if (!transient || attempt === MAX_RETRIES) throw error;
      await sleep(RETRY_BASE_MS * (attempt + 1));
    }
  }
  throw lastError;
}

function aggregateSamples(target, strategy, samples, sampleErrors, rawSampleCount) {
  return {
    target: target.id,
    locale: target.locale,
    url: target.url,
    strategy,
    fetchedAt: samples.at(-1)?.fetchedAt ?? new Date().toISOString(),
    finalUrl: samples.at(-1)?.finalUrl ?? target.url,
    scores: {
      performance: Math.round(median(samples.map((sample) => sample.scores.performance)) ?? 0),
      accessibility: Math.round(median(samples.map((sample) => sample.scores.accessibility)) ?? 0),
      bestPractices: Math.round(median(samples.map((sample) => sample.scores.bestPractices)) ?? 0),
      seo: Math.round(median(samples.map((sample) => sample.scores.seo)) ?? 0),
    },
    metrics: {
      fcpMs: median(samples.map((sample) => sample.metrics.fcpMs)),
      lcpMs: median(samples.map((sample) => sample.metrics.lcpMs)),
      cls: median(samples.map((sample) => sample.metrics.cls)),
      tbtMs: median(samples.map((sample) => sample.metrics.tbtMs)),
      speedIndexMs: median(samples.map((sample) => sample.metrics.speedIndexMs)),
      ttiMs: median(samples.map((sample) => sample.metrics.ttiMs)),
    },
    lighthouseVersion: samples.at(-1)?.lighthouseVersion ?? null,
    evidenceCount: samples.length,
    rawSampleCount,
    duplicateSampleCount: rawSampleCount - samples.length,
    requestedSamples: SAMPLE_COUNT,
    sampleErrors,
    samples: samples.map((sample, index) => ({
      sample: index + 1,
      fetchedAt: sample.fetchedAt,
      scores: sample.scores,
      metrics: sample.metrics,
    })),
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
    const rawSamples = [];
    const sampleErrors = [];

    for (let sample = 1; sample <= SAMPLE_COUNT; sample += 1) {
      try {
        rawSamples.push(await runPsiWithRetry(target, strategy));
      } catch (error) {
        sampleErrors.push({ sample, error: error instanceof Error ? error.message : String(error) });
      }
      if (sample < SAMPLE_COUNT) await sleep(SAMPLE_GAP_MS);
    }

    const samples = getIndependentSamples(rawSamples);

    if (samples.length < MIN_EVIDENCE) {
      results.push({
        target: target.id,
        locale: target.locale,
        url: target.url,
        strategy,
        status: 'error',
        evidenceCount: samples.length,
        rawSampleCount: rawSamples.length,
        duplicateSampleCount: rawSamples.length - samples.length,
        requestedSamples: SAMPLE_COUNT,
        sampleErrors,
        error: `Insufficient independent evidence for ${target.id}/${strategy}: ${samples.length}/${SAMPLE_COUNT} unique PSI analyses`,
      });
      continue;
    }

    results.push(
      evaluate(aggregateSamples(target, strategy, samples, sampleErrors, rawSamples.length)),
    );
  }
}

const output = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  gitSha: process.env.GITHUB_SHA ?? null,
  repository: process.env.GITHUB_REPOSITORY ?? null,
  measurementPolicy: {
    sampleCount: SAMPLE_COUNT,
    minimumEvidence: MIN_EVIDENCE,
    transientRetries: MAX_RETRIES,
    sampleGapMs: SAMPLE_GAP_MS,
    independentEvidence: 'unique PageSpeed analysisUTCTimestamp',
    aggregation: 'median',
  },
  results,
};

const outputDir = path.resolve('webops/output');
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'latest.json'), JSON.stringify(output, null, 2));

console.log(JSON.stringify(output, null, 2));

if (results.every((result) => result.status === 'error')) {
  process.exitCode = 2;
}
