import fs from 'node:fs/promises';
import path from 'node:path';
import { WEBOPS_CONFIG } from './config.mjs';

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const MAX_SAMPLE_COUNT = Number(process.env.WEBOPS_SAMPLES || 3);
const MAX_RETRIES = Number(process.env.WEBOPS_RETRIES || 2);
const RETRY_BASE_MS = Number(process.env.WEBOPS_RETRY_BASE_MS || 1500);
const MIN_ALERT_EVIDENCE = Math.min(
  MAX_SAMPLE_COUNT,
  Number(process.env.WEBOPS_MIN_EVIDENCE || 2),
);
const SAMPLE_GAP_MS = Number(process.env.WEBOPS_SAMPLE_GAP_MS || 15000);

function metricValue(audits, id) {
  return audits?.[id]?.numericValue ?? null;
}

function auditItems(audits, id) {
  const items = audits?.[id]?.details?.items;
  return Array.isArray(items) ? items : [];
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function topBy(items, key, limit = 8) {
  return [...items]
    .filter((item) => Number.isFinite(item?.[key]))
    .sort((a, b) => b[key] - a[key])
    .slice(0, limit);
}

function extractDiagnostics(audits) {
  const diagnosticItem = auditItems(audits, 'diagnostics')[0] ?? {};

  return {
    mainThreadBreakdown: topBy(auditItems(audits, 'mainthread-work-breakdown'), 'duration').map(
      (item) => ({
        group: item.group ?? null,
        label: item.groupLabel ?? null,
        durationMs: finiteOrNull(item.duration),
      }),
    ),
    bootupTime: topBy(auditItems(audits, 'bootup-time'), 'total').map((item) => ({
      url: item.url ?? null,
      totalMs: finiteOrNull(item.total),
      scriptingMs: finiteOrNull(item.scripting),
      parseCompileMs: finiteOrNull(item.scriptParseCompile),
    })),
    longTasks: topBy(auditItems(audits, 'long-tasks'), 'duration').map((item) => ({
      url: item.url ?? null,
      durationMs: finiteOrNull(item.duration),
      startTimeMs: finiteOrNull(item.startTime),
    })),
    thirdPartySummary: topBy(
      auditItems(audits, 'third-party-summary'),
      'mainThreadTime',
    ).map((item) => ({
      entity: item.entity ?? null,
      mainThreadTimeMs: finiteOrNull(item.mainThreadTime),
      blockingTimeMs: finiteOrNull(item.blockingTime),
      transferSizeBytes: finiteOrNull(item.transferSize),
    })),
    unusedJavaScript: topBy(
      auditItems(audits, 'unused-javascript'),
      'wastedBytes',
    ).map((item) => ({
      url: item.url ?? null,
      totalBytes: finiteOrNull(item.totalBytes),
      wastedBytes: finiteOrNull(item.wastedBytes),
      wastedPercent: finiteOrNull(item.wastedPercent),
    })),
    legacyJavaScript: topBy(
      auditItems(audits, 'legacy-javascript'),
      'wastedBytes',
    ).map((item) => ({
      url: item.url ?? null,
      wastedBytes: finiteOrNull(item.wastedBytes),
    })),
    taskSummary: {
      numTasks: finiteOrNull(diagnosticItem.numTasks),
      numTasksOver10ms: finiteOrNull(diagnosticItem.numTasksOver10ms),
      numTasksOver25ms: finiteOrNull(diagnosticItem.numTasksOver25ms),
      numTasksOver50ms: finiteOrNull(diagnosticItem.numTasksOver50ms),
      numTasksOver100ms: finiteOrNull(diagnosticItem.numTasksOver100ms),
      numTasksOver500ms: finiteOrNull(diagnosticItem.numTasksOver500ms),
      mainDocumentTransferSizeBytes: finiteOrNull(diagnosticItem.mainDocumentTransferSize),
      totalByteWeightBytes: finiteOrNull(diagnosticItem.totalByteWeight),
      maxServerLatencyMs: finiteOrNull(diagnosticItem.maxServerLatency),
    },
  };
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
    diagnostics: extractDiagnostics(audits),
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

function aggregateSamples(target, strategy, samples, sampleErrors, rawSampleCount, requestedSamples) {
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
    requestedSamples,
    maximumSamples: MAX_SAMPLE_COUNT,
    sampleErrors,
    samples: samples.map((sample, index) => ({
      sample: index + 1,
      fetchedAt: sample.fetchedAt,
      scores: sample.scores,
      metrics: sample.metrics,
      diagnostics: sample.diagnostics,
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

function errorResult(target, strategy, samples, rawSamples, sampleErrors, requestedSamples, reason) {
  return {
    target: target.id,
    locale: target.locale,
    url: target.url,
    strategy,
    status: 'error',
    evidenceState: 'insufficient-evidence',
    evidenceCount: samples.length,
    rawSampleCount: rawSamples.length,
    duplicateSampleCount: rawSamples.length - samples.length,
    requestedSamples,
    maximumSamples: MAX_SAMPLE_COUNT,
    sampleErrors,
    error: reason,
  };
}

const results = [];
for (const target of WEBOPS_CONFIG.targets) {
  for (const strategy of WEBOPS_CONFIG.strategies) {
    const rawSamples = [];
    const sampleErrors = [];

    try {
      rawSamples.push(await runPsiWithRetry(target, strategy));
    } catch (error) {
      sampleErrors.push({ sample: 1, error: error instanceof Error ? error.message : String(error) });
    }

    let samples = getIndependentSamples(rawSamples);
    if (!samples.length) {
      results.push(errorResult(
        target,
        strategy,
        samples,
        rawSamples,
        sampleErrors,
        1,
        `No independent PageSpeed evidence for ${target.id}/${strategy}`,
      ));
      continue;
    }

    const baseline = evaluate(aggregateSamples(target, strategy, samples, sampleErrors, rawSamples.length, 1));

    if (baseline.status === 'pass' || MAX_SAMPLE_COUNT <= 1) {
      results.push({
        ...baseline,
        evidenceState: baseline.status === 'pass' ? 'baseline-pass' : 'baseline-alert',
        confirmationTriggered: false,
      });
      continue;
    }

    for (let sample = 2; sample <= MAX_SAMPLE_COUNT; sample += 1) {
      await sleep(SAMPLE_GAP_MS);
      try {
        rawSamples.push(await runPsiWithRetry(target, strategy));
      } catch (error) {
        sampleErrors.push({ sample, error: error instanceof Error ? error.message : String(error) });
      }
    }

    samples = getIndependentSamples(rawSamples);
    if (samples.length < MIN_ALERT_EVIDENCE) {
      results.push(errorResult(
        target,
        strategy,
        samples,
        rawSamples,
        sampleErrors,
        MAX_SAMPLE_COUNT,
        `Insufficient independent evidence to confirm alert for ${target.id}/${strategy}: ${samples.length}/${MIN_ALERT_EVIDENCE} required`,
      ));
      continue;
    }

    const confirmed = evaluate(
      aggregateSamples(target, strategy, samples, sampleErrors, rawSamples.length, MAX_SAMPLE_COUNT),
    );
    results.push({
      ...confirmed,
      evidenceState: confirmed.status === 'alert' ? 'confirmed-alert' : 'alert-not-confirmed',
      confirmationTriggered: true,
    });
  }
}

const output = {
  schemaVersion: 4,
  generatedAt: new Date().toISOString(),
  gitSha: process.env.GITHUB_SHA ?? null,
  repository: process.env.GITHUB_REPOSITORY ?? null,
  measurementPolicy: {
    mode: 'adaptive-confirmation',
    baselineSamples: 1,
    maximumSamples: MAX_SAMPLE_COUNT,
    minimumAlertEvidence: MIN_ALERT_EVIDENCE,
    transientRetries: MAX_RETRIES,
    sampleGapMs: SAMPLE_GAP_MS,
    independentEvidence: 'unique PageSpeed analysisUTCTimestamp',
    aggregation: 'median after baseline alert',
    costPolicy: 'PASS stops after baseline; ALERT collects additional independent evidence',
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
