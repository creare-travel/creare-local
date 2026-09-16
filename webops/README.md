# CREARE WebOps Agent V1

CREARE WebOps continuously measures production performance and turns raw PageSpeed data into conservative operational findings.

## V1 scope

- Measures EN, TR, and ZH homepages on mobile and desktop.
- Captures Performance, Accessibility, Best Practices, SEO, FCP, LCP, CLS, TBT, Speed Index, and TTI.
- Applies deterministic thresholds before any AI reasoning.
- Compares locales to detect page/locale-specific anomalies.
- Optionally sends the complete measurement set to the CREARE WebOps Agent through the OpenAI Responses API.
- Publishes a GitHub Actions summary and retains JSON/Markdown evidence for 90 days.
- Runs daily, manually, and after successful production deployment status events when GitHub receives them.

## Safety model

V1 is observation-only. It does not modify production code, merge pull requests, block deployments, or automatically remediate issues.

A single Lighthouse/PageSpeed run is treated as a signal, not proof of regression. Recommendations should prefer narrow diagnosis over broad refactors and preserve CREARE visual quality.

## Required GitHub secrets

`PAGESPEED_API_KEY`

Recommended for reliable PageSpeed Insights API quota. The measurement script can attempt requests without it, but production automation should configure the key.

`OPENAI_API_KEY`

Optional. When absent, WebOps still performs deterministic threshold and locale analysis. When present, the agent adds a CREARE-specific operational interpretation.

## Optional GitHub variable

`WEBOPS_MODEL`

Defaults to `gpt-5` when unset.

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

## Architecture

```text
GitHub/Vercel deployment event or daily schedule
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
```

## Next phases

V2: persistent metrics store, baseline/regression history, incident lifecycle, notifications.

V3: Codex remediation workflow that opens a branch/PR after a confirmed regression; human approval remains required.

V4: CrUX, GA4, Search Console, Vercel runtime, crawl/indexability, hreflang, schema, i18n parity, and GEO checks under the same WebOps control plane.
