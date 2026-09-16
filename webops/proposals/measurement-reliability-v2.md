# Measurement Reliability V2

Status: pending approval
Scope: WebOps tooling only
Production site change: no

## Proposed change

- Run three PageSpeed samples per locale/device.
- Retry transient PSI/Lighthouse 5xx failures before marking a measurement error.
- Use the median sample for performance, LCP, CLS and TBT decisions.
- Require repeated evidence before promoting a finding to a remediation approval request.

## Why now

The latest production audit showed substantial lab variability and one transient TR mobile PSI 500. A single lab sample is not sufficient evidence for a production-site remediation.

## Expected impact

Fewer false alarms and safer, evidence-based remediation decisions across EN/TR/ZH/RU.

## Risk / rollback

Risk is limited to longer workflow runtime and additional PageSpeed API usage. No production website mutation. Rollback is a revert of the WebOps tooling PR.

## Verification

Run the full EN/TR/ZH/RU x mobile/desktop matrix; confirm three successful samples per target where PSI is available; confirm transient 5xx retries; confirm median reporting in Control Center; confirm production writes and automatic merge remain disabled.
