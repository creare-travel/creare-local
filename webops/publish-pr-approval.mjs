import fs from 'node:fs/promises';

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!token || !repository || !eventPath) process.exit(0);

const event = JSON.parse(await fs.readFile(eventPath, 'utf8'));
const pr = event.pull_request;
if (!pr) process.exit(0);

const [owner, repo] = repository.split('/');
const marker = `<!-- webops-approval-pr:${pr.number} -->`;
const title = `[WEBOPS APPROVAL] PR #${pr.number} ready — ${pr.title}`;
const body = `${marker}\n## Approval required\n\nWebOps validation completed successfully.\n\n- PR: ${pr.html_url}\n- Head: \`${pr.head.sha.slice(0, 12)}\`\n- Validation run: https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}\n- Production merge: **not authorized automatically**\n\nApprove only when you want this PR merged.\n`;

const headers = {
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'content-type': 'application/json',
  'x-github-api-version': '2022-11-28',
  'user-agent': 'CREARE-WebOps/2.1',
};

const list = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, { headers });
if (!list.ok) throw new Error(`Approval issue lookup failed: ${list.status}`);
const issues = await list.json();
const existing = issues.find((issue) => !issue.pull_request && issue.body?.includes(marker));

const payload = { title, body, assignees: [owner] };
const url = existing
  ? `https://api.github.com/repos/${owner}/${repo}/issues/${existing.number}`
  : `https://api.github.com/repos/${owner}/${repo}/issues`;
const response = await fetch(url, {
  method: existing ? 'PATCH' : 'POST',
  headers,
  body: JSON.stringify(payload),
});
if (!response.ok) throw new Error(`Approval issue publish failed: ${response.status} ${(await response.text()).slice(0, 300)}`);
const issue = await response.json();
console.log(`Approval request ready: ${issue.html_url}`);
