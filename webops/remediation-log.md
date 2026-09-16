# CREARE WebOps Remediation Log

## 2026-09-16 — First manual remediation exercise

### Signal
Independent-evidence PSI audit still showed highly variable TBT/LCP across EN/TR/ZH/RU. RU mobile/desktop appeared severe in PSI, but focused local Lighthouse did not reproduce the same severity consistently.

### Root-cause investigation
Focused RU Lighthouse traces showed Google Tag Manager / gtag as the largest third-party JavaScript contributor and a source of long tasks. This supported a low-risk hypothesis: moving GTM from `afterInteractive` to `lazyOnload` might reduce early main-thread contention.

### Proposal
PR #13 changed only the GTM Next.js Script strategy from `afterInteractive` to `lazyOnload`. Vercel Preview built successfully.

### Verification result
Authenticated Lighthouse reached the actual Vercel Preview page. RU mobile TBT was ~154.5 ms on production and ~153.5 ms on Preview. GTM/gtag long tasks remained present. The difference was not material.

### Decision
**REJECTED / NOT MERGED.** A plausible optimization with no measurable Preview benefit is not a fix. PR #13 was closed.

### System lessons
1. Unique PSI timestamps remove cached duplicates but do not remove lab variance.
2. High-variance findings require focused trace/resource evidence before site-code changes.
3. Every site-fix proposal needs Preview/focused verification before production approval.
4. No material improvement means close the proposal automatically; do not optimize for the Lighthouse score alone.
5. Daily PSI sampling should be adaptive to control cost: one baseline sample, then extra confirmation only for ALERT targets.
