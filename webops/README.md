# CREARE WebOps Agent V1

CREARE WebOps continuously measures production performance and turns raw PageSpeed data into conservative operational findings.

## V1 scope

- Measures EN, TR, ZH, and RU homepages on mobile and desktop.
- Captures Performance, Accessibility, Best Practices, SEO, FCP, LCP, CLS, TBT, Speed Index, and TTI.
- Applies deterministic thresholds before any AI reasoning.
- Compares locales to detect page/locale-specific anomalies.
- Optionally sends the complete measurement set to the CREARE WebOps Agent through the OpenAI Responses API.
- Publishes a GitHub Actions summary and retains JSON/Markdown evidence for 90 days.

## Automatic triggers

WebOps runs automatically in these cases:

- Daily at `06:00 UTC` through GitHub Actions cron.
- After a successful Production deployment status event when GitHub receives it from the deployment provider.
- On pull requests that change `webops/**` or `.github/workflows/creare-webops.yml`.

It can also be started manually through GitHub Actions `workflow_dispatch`.

## Safety model

V1 is observation-only. It does not modify production code, merge pull requests, block deployments, or automatically remediate issues.

A single Lighthouse/PageSpeed run is treated as a signal, not proof of regression. Recommendations should prefer narrow diagnosis over broad refactors and preserve CREARE visual quality.

## Required GitHub secrets

`PAGESPEED_API_KEY`

Required for reliable production automation. Anonymous PageSpeed Insights quota can return HTTP 429 and must not be relied on for scheduled WebOps runs.

`OPENAI_API_KEY`

Optional for measurements, required for AI interpretation. When absent, WebOps still performs deterministic threshold and locale analysis. When present, the agent adds a CREARE-specific operational interpretation.

## GitHub variable

`WEBOPS_MODEL`

Recommended value: `gpt-5.6-luna` for scheduled high-volume analysis. If the repository variable is unset, the code currently falls back to `gpt-5.6-luna`.

## Current thresholds

Mobile and desktop currently alert on:

- Performance below 90
- LCP above 2500 ms
- CLS above 0.10
- TBT above 200 ms

Locale anomaly signals:

- Performance gap of 15+ points
- Slowest LCP at least 2x fastest LCP

These are initial operating thresholds and should be calibrated after observing real production variance.

## Strapi and Cloudinary

V1 does not call Strapi or Cloudinary directly. They are upstream production dependencies whose effects are observed through the rendered website and PageSpeed metrics.

Planned extensions should treat them as separate data sources:

- Strapi: publishing events, content freshness, missing fields, broken references, EN/TR/ZH/RU locale parity, unpublished/draft anomalies.
- Cloudinary: asset weight, dimensions, format, responsive delivery, transformation quality, cache behavior, oversized LCP assets.

A Strapi or Cloudinary event may trigger a WebOps audit, but WebOps should not automatically mutate CMS content or media in observation mode.

## Architecture

```text
GitHub / deployment / schedule / manual trigger
                    |
                    v
          PageSpeed Insights API
                    |
                    v
       deterministic WebOps rules
                    |
                    v
       CREARE WebOps Agent (optional)
                    |
                    v
 GitHub summary + 90-day evidence artifact

Future inputs:
Strapi events ----\
Cloudinary events -+--> CREARE WebOps control plane
CrUX / GA4 / GSC --/
```

## Documentation rule

The Google Drive document `CREARE Automation — WebOps Agent Manual` inside `CREARE AUTOMATION — SECURE` is the operational source of truth. Every material WebOps capability, trigger, integration, safety-boundary, locale-scope, or runbook change should update that document in the same development cycle.

## Next phases

V2: persistent metrics store, baseline/regression history, incident lifecycle, notifications.

V3: Codex remediation workflow that opens a branch/PR after a confirmed regression; human approval remains required.

V4: CrUX, GA4, Search Console, Vercel runtime, Strapi, Cloudinary, crawl/indexability, hreflang, schema, EN/TR/ZH/RU i18n parity, and GEO checks under the same WebOps control plane.
