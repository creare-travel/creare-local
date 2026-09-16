import fs from 'node:fs/promises';
import path from 'node:path';

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const issueNumber = Number(process.env.WEBOPS_STATUS_ISSUE || 3);

if (!token || !repository) {
  console.log('GitHub publishing skipped: GITHUB_TOKEN or GITHUB_REPOSITORY missing.');
  process.exit(0);
}

const state = JSON.parse(
  await fs.readFile(path.resolve('webops/output/control-center.json'), 'utf8'),
);

const [owner, repo] = repository.split('/');
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

const measurements = state.measurements
  .map((item) => {
    if (item.status === 'error') {
      return `| ${item.target} | ${item.strategy} | - | - | - | - | ERROR |`;
    }
    return `| ${item.target} | ${item.strategy} | ${item.scores?.performance ?? '-'} | ${Math.round(item.metrics?.lcpMs ?? 0)}ms | ${(item.metrics?.cls ?? 0).toFixed(3)} | ${Math.round(item.metrics?.tbtMs ?? 0)}ms | ${String(item.status).toUpperCase()} |`;
  })
  .join('\n');

const recommendations = state.recommendations.length
  ? state.recommendations.map((item) => `- ${item}`).join('\n')
  : '- No agent recommendation available.';

const integrations = state.integrations
  .map((item) => `- **${item.name}:** ${item.status}`)
  .join('\n');

const body = `# CREARE WebOps Status

**Status:** ${String(state.status).toUpperCase()}  
**Generated (Istanbul):** ${state.generatedAtIstanbul}  
**UTC:** ${state.generatedAt}  
**Mode:** ${state.mode}

## Safety

- Production writes: **DISABLED**
- Automatic merge: **DISABLED**
- Human approval: **REQUIRED**
- Remediation: **PR → preview → human approval → production**

## Measurements

| Target | Device | Perf | LCP | CLS | TBT | Result |
|---|---|---:|---:|---:|---:|---|
${measurements}

## Recommended next actions

${recommendations}

## Integrations

${integrations}

## Automation schedule

- Daily: **09:00 Europe/Istanbul**
- After successful production deploy: **enabled**
- Manual run: **enabled**

## Pending production changes

${state.pendingChanges.length ? state.pendingChanges.map((item) => `- ${item}`).join('\n') : '- None. WebOps cannot change production directly.'}

<details>
<summary>Control Center JSON</summary>

\`\`\`json
${JSON.stringify(state, null, 2)}
\`\`\`

</details>
`;

const response = await fetch(apiUrl, {
  method: 'PATCH',
  headers: {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'content-type': 'application/json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'CREARE-WebOps/2.0',
  },
  body: JSON.stringify({ body }),
});

if (!response.ok) {
  throw new Error(`GitHub status publish failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
}

console.log(`Updated CREARE WebOps Status issue #${issueNumber}.`);
