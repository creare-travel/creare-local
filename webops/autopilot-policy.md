# CREARE WebOps Autopilot Policy

## Default operating mode
WebOps progresses autonomously through non-destructive stages. Human prompting is not required for routine progression.

Automatic stages:
1. Measure one baseline sample per target and retry transient API failures.
2. If the baseline is an ALERT, collect additional independent evidence (up to three total) and confirm with the median. PASS targets stop after the baseline to control API cost.
3. Diagnose likely root cause using available evidence and repository context.
4. Prepare a remediation proposal.
5. Create a remediation branch or draft pull request when the change is low-risk and reversible.
6. Run CI / Vercel Preview / focused Lighthouse verification available to the system.
7. Reject and close a proposal when Preview does not materially improve the target metric or introduces a meaningful regression.
8. Update Control Center status and evidence.

## Human approval gate
Explicit human approval is required before any production-impacting action, including:
- merging a site-fix pull request to the production branch,
- production deployment when it is not already the normal consequence of an approved merge,
- Strapi/CMS content mutation,
- production secrets, DNS, billing, authentication, or destructive data changes.

## Notification rule
Do not request routine progress confirmations. Notify the operator only when:
- a production-impacting approval is ready,
- a proposed fix is ready for a decision,
- progress is blocked by permission, ambiguity, or an error that requires human choice.

The approval notification should contain: problem, evidence, proposed change, affected files, expected impact, verification result, risk, rollback plan, and direct GitHub link.

## Evidence and cost policy
- Cached PageSpeed responses with the same `analysisUTCTimestamp` are duplicates, not independent evidence.
- Independent PageSpeed lab runs can still be noisy. Material variance requires focused trace/resource inspection before code remediation.
- Daily audit policy is adaptive: 1 baseline PSI sample for every target; only ALERT targets receive up to 2 extra independent confirmation samples.
- OpenAI analysis runs once on the aggregated audit, not once per sample.
- The daily ChatGPT supervisor runs at 10:00 Europe/Istanbul after the 09:00 GitHub audit. Event-driven GitHub handoffs still advance CI/approval state immediately when available.

## Remediation acceptance rule
A recommendation is not a successful fix. A site-fix PR may advance to human production approval only when the suspected cause is supported by trace/resource evidence and Preview or focused verification shows a material improvement in the intended metric without a meaningful regression. No measurable benefit means reject/close.

## Branch convention
Autonomous site-remediation branches should use `webops/fix/<short-description>` so the daily supervisor can distinguish them from ordinary development work.
