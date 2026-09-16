import fs from 'node:fs/promises';
import path from 'node:path';
import { WEBOPS_CONFIG } from './config.mjs';

const reportPath = path.resolve('webops/output/latest.json');
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));

function formatIstanbulTime(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function deterministicFindings(results) {
  const findings = [];
  const grouped = new Map();

  for (const result of results) {
    const key = result.strategy;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(result);

    if (result.status === 'alert') {
      findings.push({
        severity: 'warning',
        scope: `${result.target}/${result.strategy}`,
        finding: result.violations.join('; '),
      });
    }
    if (result.status === 'error') {
      findings.push({
        severity: 'error',
        scope: `${result.target}/${result.strategy}`,
        finding: result.error,
      });
    }
  }

  for (const [strategy, items] of grouped) {
    const healthy = items.filter((item) => item.status !== 'error');
    if (healthy.length < 2) continue;

    const performances = healthy.map((item) => item.scores.performance);
    const maxPerformance = Math.max(...performances);
    const minPerformance = Math.min(...performances);
    if (maxPerformance - minPerformance >= WEBOPS_CONFIG.anomalyRules.localePerformanceGap) {
      findings.push({
        severity: 'warning',
        scope: `locale-comparison/${strategy}`,
        finding: `Locale performance gap is ${maxPerformance - minPerformance} points`,
      });
    }

    const lcps = healthy.map((item) => item.metrics.lcpMs).filter((value) => Number.isFinite(value));
    if (lcps.length >= 2) {
      const maxLcp = Math.max(...lcps);
      const minLcp = Math.min(...lcps);
      if (minLcp > 0 && maxLcp / minLcp >= WEBOPS_CONFIG.anomalyRules.localeLcpRatio) {
        findings.push({
          severity: 'warning',
          scope: `locale-comparison/${strategy}`,
          finding: `Slowest locale LCP is ${(maxLcp / minLcp).toFixed(1)}x the fastest locale`,
        });
      }
    }
  }

  return findings;
}

const findings = deterministicFindings(report.results);
const deterministic = {
  status: findings.some((item) => item.severity === 'error')
    ? 'error'
    : findings.length
      ? 'attention'
      : 'healthy',
  findings,
};

const instructions = `You are CREARE WebOps Agent, an operational analyst for crearetravel.com.
Analyze the supplied PageSpeed measurements conservatively.
Rules:
- Do not invent causes that are not supported by the metrics.
- Distinguish measured facts from hypotheses.
- Compare EN/TR/ZH/RU before calling a problem global.
- Preserve CREARE visual quality; never recommend broad refactors from one noisy lab run.
- Prioritize LCP, CLS, blocking time, and cross-locale anomalies.
- Read result.evidenceState. Only confirmed-alert is eligible to become a remediation candidate; baseline-pass is monitor-only and alert-not-confirmed must not trigger a fix.
- Unique PSI analysis timestamps prevent cached duplicates, but independent lab runs can still vary materially.
- Treat one lab run as a signal, not proof of a regression.
- Before recommending site-code remediation, require trace/resource evidence for the suspected cause. A proposed fix is not successful unless preview or focused verification shows a material improvement in the target metric without a meaningful regression.
- If a preview does not improve the target metric, recommend rejecting/closing that proposal rather than shipping it.
- Return a compact operational report with sections: STATUS, FACTS, HYPOTHESES, NEXT ACTION.
- If results are healthy, say so and recommend monitoring rather than optimization churn.`;

let agentAnalysis = null;
let agentError = null;
const model = process.env.WEBOPS_MODEL || 'gpt-5.6-luna';

if (process.env.OPENAI_API_KEY) {
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions,
        input: JSON.stringify({ report, deterministic }, null, 2),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 500)}`);
    }

    const payload = await response.json();
    agentAnalysis = payload.output_text
      ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text
      ?? null;
  } catch (error) {
    agentError = error instanceof Error ? error.message : String(error);
  }
}

const generatedDate = new Date();
const generatedAtUtc = generatedDate.toISOString();
const generatedAtIstanbul = formatIstanbulTime(generatedDate);

const analysis = {
  schemaVersion: 1,
  generatedAt: generatedAtUtc,
  generatedAtIstanbul,
  deterministic,
  agent: {
    enabled: Boolean(process.env.OPENAI_API_KEY),
    model,
    analysis: agentAnalysis,
    error: agentError,
  },
};

await fs.writeFile(
  path.resolve('webops/output/analysis.json'),
  JSON.stringify(analysis, null, 2),
);

const summary = [
  '# CREARE WebOps',
  '',
  `**Status:** ${deterministic.status.toUpperCase()}`,
  `**Generated (Istanbul):** ${analysis.generatedAtIstanbul} (Europe/Istanbul)`,
  `**UTC:** ${analysis.generatedAt}`,
  '',
  '## Measurements',
  '',
  '| Target | Device | Evidence | Perf | LCP | CLS | TBT | Result |',
  '|---|---|---|---:|---:|---:|---:|---|',
  ...report.results.map((item) => {
    if (item.status === 'error') {
      return `| ${item.target} | ${item.strategy} | ${item.evidenceCount ?? 0}/${item.requestedSamples ?? 0} | - | - | - | - | ERROR |`;
    }
    return `| ${item.target} | ${item.strategy} | ${item.evidenceCount ?? 0}/${item.requestedSamples ?? 0} (${item.evidenceState ?? 'n/a'}) | ${item.scores.performance} | ${Math.round(item.metrics.lcpMs ?? 0)}ms | ${(item.metrics.cls ?? 0).toFixed(3)} | ${Math.round(item.metrics.tbtMs ?? 0)}ms | ${item.status.toUpperCase()} |`;
  }),
  '',
  '## Deterministic findings',
  '',
  ...(findings.length ? findings.map((item) => `- **${item.scope}:** ${item.finding}`) : ['- No threshold or locale anomaly detected.']),
  '',
  '## Agent analysis',
  '',
  agentAnalysis || (process.env.OPENAI_API_KEY ? `Agent unavailable: ${agentError ?? 'no output'}` : 'OPENAI_API_KEY is not configured; deterministic analysis only.'),
  '',
].join('\n');

await fs.writeFile(path.resolve('webops/output/summary.md'), summary);
console.log(summary);
