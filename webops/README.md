# CREARE WebOps

CREARE WebOps measures production health, produces conservative AI-assisted operational findings, and exposes a lightweight control state for the CREARE Control Center.

## Current scope

- EN / TR / ZH / RU homepages
- mobile + desktop PageSpeed measurements with adaptive confirmation sampling
- Performance, Accessibility, Best Practices, SEO, FCP, LCP, CLS, TBT, Speed Index, TTI
- deterministic thresholds before AI reasoning
- cross-locale anomaly comparison
- OpenAI WebOps Agent interpretation
- Istanbul-local human-facing timestamps with canonical UTC retained
- 90-day evidence artifacts

## Control Center v2

V2 deliberately avoids a new database or a second standalone dashboard.

The current pipeline builds `webops/output/control-center.json` after every audit and updates the persistent GitHub issue **CREARE WebOps Status (#3)**. That issue is the lightweight durable feed for the existing CREARE Control Center / Finance dashboard.

The local Control Center will read this feed and display:

- current WebOps status
- latest EN/TR/ZH/RU measurements
- deterministic findings
- agent recommendations
- automation schedule
- integration status
- pending production changes

Future modules such as Google Tag Manager, GA4, Search Console, Strapi and Cloudinary will appear in the same Control Center instead of separate dashboards.

## Automatic triggers

WebOps runs:

- every day at `06:00 UTC` / `09:00 Europe/Istanbul`
- after a successful production deployment event
- on WebOps-related pull requests for validation; successful CI creates the approval handoff immediately
- manually through GitHub Actions `workflow_dispatch`
- the ChatGPT WebOps supervisor runs once daily at `10:00 Europe/Istanbul`, after the `09:00` audit, to continue non-destructive work that still needs diagnosis / preview review

## Safety and approval

Operating mode: `observe-and-propose`.

- production writes: disabled
- automatic merge: disabled
- automatic CMS/media writes: disabled
- human approval: required
- remediation path: `detect → diagnose → propose → PR → preview/tests → human approval → production → verify`

Agent recommendations are not production changes. Any future automated remediation must be represented as a GitHub pull request so the diff and preview can be reviewed before merge.

## Required configuration

GitHub Secrets:

- `PAGESPEED_API_KEY`
- `OPENAI_API_KEY` for AI interpretation

GitHub Variable:

- `WEBOPS_MODEL` — recommended `gpt-5.6-luna`; code fallback is also `gpt-5.6-luna`

OpenAI API usage is billed separately from ChatGPT subscriptions. CREARE WebOps uses its dedicated OpenAI project and low-cost operating configuration.

## Current thresholds

- Performance < 90
- LCP > 2500 ms
- CLS > 0.10
- TBT > 200 ms
- locale performance gap >= 15 points
- slowest locale LCP >= 2x fastest locale LCP

A single lab run is treated as a signal, not proof of regression. Daily measurement is adaptive: each target gets one baseline sample; only a baseline ALERT requests up to two additional independent PSI analyses and uses their median for confirmation. Cached analyses with the same `analysisUTCTimestamp` do not count as independent evidence. Even unique lab runs can vary materially, so a site-code remediation requires trace/resource evidence plus preview or focused verification.

A plausible change is not considered a fix until verification shows a material improvement in the target metric without a meaningful regression. If Preview does not improve the target metric, the proposal should be closed rather than merged.

## Integrations

Active now:

- GitHub Actions
- Vercel deployment events
- PageSpeed Insights
- OpenAI WebOps Agent

Planned Control Center modules:

- Google Tag Manager
- Google Analytics 4
- Google Search Console
- Strapi
- Cloudinary
- CrUX
- crawl / indexability / canonical / hreflang / schema / GEO checks

## Documentation rule

The Google Drive document `CREARE Automation — WebOps Agent Manual` inside `CREARE AUTOMATION — SECURE` remains the operational source of truth and must be updated with material WebOps changes.
