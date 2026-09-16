import fs from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve('webops/output');

async function readJson(name) {
  try {
    return JSON.parse(await fs.readFile(path.join(outputDir, name), 'utf8'));
  } catch {
    return null;
  }
}

function extractNextActions(text) {
  if (!text) return [];
  const match = text.match(/##\s*NEXT ACTION[\s\S]*?(?=\n##\s|$)/i);
  if (!match) return [];
  return match[0]
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => /^(?:[-*]|\d+\.)\s+/.test(line))
    .map((line) => line.replace(/^(?:[-*]|\d+\.)\s+/, '').replace(/\*\*/g, ''));
}

const report = await readJson('latest.json');
const analysis = await readJson('analysis.json');
const generatedAt = analysis?.generatedAt ?? report?.generatedAt ?? new Date().toISOString();
const generatedAtIstanbul = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  dateStyle: 'medium',
  timeStyle: 'medium',
}).format(new Date(generatedAt));

const controlState = {
  schemaVersion: 1,
  generatedAt,
  generatedAtIstanbul,
  status: analysis?.deterministic?.status ?? 'unknown',
  mode: 'observe-and-propose',
  schedule: {
    daily: '09:00 Europe/Istanbul',
    productionDeploy: true,
    manual: true,
  },
  policy: {
    productionWrites: false,
    automaticMerge: false,
    automaticCmsWrites: false,
    humanApprovalRequired: true,
    remediation: 'PR + preview + human approval',
  },
  measurements: report?.results ?? [],
  findings: analysis?.deterministic?.findings ?? [],
  recommendations: extractNextActions(analysis?.agent?.analysis),
  agent: {
    enabled: Boolean(analysis?.agent?.enabled),
    model: analysis?.agent?.model ?? null,
    healthy: Boolean(analysis?.agent?.enabled && !analysis?.agent?.error),
    error: analysis?.agent?.error ?? null,
  },
  integrations: [
    { id: 'pagespeed', name: 'PageSpeed Insights', status: report ? 'active' : 'waiting' },
    { id: 'openai', name: 'OpenAI WebOps Agent', status: analysis?.agent?.enabled && !analysis?.agent?.error ? 'active' : 'waiting' },
    { id: 'github', name: 'GitHub Actions', status: 'active' },
    { id: 'vercel', name: 'Vercel Deployments', status: 'active' },
    { id: 'gtm', name: 'Google Tag Manager', status: 'planned' },
    { id: 'ga4', name: 'Google Analytics 4', status: 'planned' },
    { id: 'gsc', name: 'Google Search Console', status: 'planned' },
    { id: 'strapi', name: 'Strapi', status: 'planned' },
    { id: 'cloudinary', name: 'Cloudinary', status: 'planned' },
  ],
  pendingChanges: [],
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'control-center.json'), JSON.stringify(controlState, null, 2));
console.log(JSON.stringify(controlState, null, 2));
