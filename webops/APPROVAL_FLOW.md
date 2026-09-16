# CREARE WebOps Approval Flow

WebOps remains observe-and-propose by default. Production changes are never applied directly by the monitoring workflow.

## Approval lifecycle

1. WebOps measures and analyzes production.
2. A remediation candidate is only promoted to an approval request after evidence is considered sufficiently repeatable.
3. The approval request is created as a GitHub issue whose title begins with `[WEBOPS APPROVAL]` and is assigned to the CREARE owner.
4. The issue body must state:
   - proposed change,
   - evidence and reason,
   - expected impact,
   - risk and rollback,
   - verification plan,
   - whether the change touches production code or only WebOps tooling.
5. Approval does not mean direct production write. The approved remediation is implemented in a branch and submitted as a pull request.
6. The PR must pass checks and preview verification before merge.
7. Merge/deploy remains a separate human-controlled action unless an explicit future policy changes this rule.

## Current V2 policy

- Production writes: disabled.
- Automatic merge: disabled.
- Automatic CMS writes: disabled.
- Human approval: required.
- Remediation path: approval request -> branch -> PR -> preview -> human merge -> post-deploy verification.

## Notification channels

- Control Center `/webops`: recommendations and pending approvals.
- GitHub: assigned `[WEBOPS APPROVAL]` issue.
- ChatGPT: `WebOps Approval Watch` condition watch checks for open approval requests and notifies when one is pending.
