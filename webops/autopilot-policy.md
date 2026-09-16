# CREARE WebOps Autopilot Policy

## Default operating mode
WebOps progresses autonomously through non-destructive stages. Human prompting is not required for routine progression.

Automatic stages:
1. Measure and retry.
2. Confirm with repeated evidence / medians.
3. Diagnose likely root cause using available evidence and repository context.
4. Prepare a remediation proposal.
5. Create a remediation branch or draft pull request when the change is low-risk and reversible.
6. Run CI / preview verification available to the repository.
7. Update Control Center status and evidence.

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
