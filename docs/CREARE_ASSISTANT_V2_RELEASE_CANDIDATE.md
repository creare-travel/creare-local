# CREARE Assistant V2 — Release Candidate Manifest

Status: STAGED / NOT LIVE

This document is the production cutover source of truth for CREARE Assistant V2.
Do not publish or merge to production until UAT approval.

## Release candidate

- Release branch: `release/creare-assistant-v2-rc`
- Assistant source branch: `feat/creare-assistant-conversation-design`
- Assistant source commit: `a8a8e59408545ba94e1baa7e99bec412df96108d`
- Website bubble source branch: `feat/creare-assistant-embed`
- Website bubble source commit: `d5626722b8c105a3ff6134a7159c5d92d639d7fe`
- Production base at RC creation: `6a7298f13c68df6c3905590603589704c9717242`

The RC must contain both source commits before production cutover.

## Typebot production target

- Typebot V2 ID: `cmufapz3700000agmskmdsvaz`
- Public ID: `creare-assistant`
- Required production Assistant API URL:
  `https://crearetravel.com/api/assistant`
- Pre-cutover state: UNPUBLISHED
- Current local-test tunnel URL is temporary and MUST be replaced by the production API URL immediately before publish.

Required Assistant response mappings:
- `data.reply` -> `YapayZekaCevabi`
- `data.state_token` -> `AssistantStateToken`
- `data.stage` -> `AssistantStage`
- `data.handoff_recommended` -> `AssistantHandoff`
- `data.ticket_no` -> `ReferansNo`
- `data.handoff_summary` -> `SohbetGecmisi`
- `data.handoff_transcript` -> `HandoffTranscript`
- `data.handoff_control_notes` -> `HandoffControlNotes`
- `data.handoff_email_prompt` -> `HandoffEmailPrompt`
- `data.handoff_confirmation` -> `HandoffConfirmation`
- `data.guest_email_subject` -> `GuestEmailSubject`
- `data.guest_email_body` -> `GuestEmailBody`
- `data.handoff_email_failure` -> `HandoffEmailFailure`
- `data.lead_quality` -> `LeadQuality`
- `data.lead_priority` -> `LeadPriority`
- `data.lead_urgency_reason` -> `LeadUrgencyReason`
- `data.lead_missing_information` -> `LeadMissingInformation`
- `data.lead_next_action` -> `LeadNextAction`

## Website target

The website bubble must use:
- Typebot public ID: `creare-assistant`

The bubble and the Typebot publish are a coordinated release.
Do not expose the bubble before the V2 Typebot production webhook is set and V2 publish verification passes.

## Functional release baseline

The production release must include:
- deterministic conversation policy
- Signature / LAB / BLACK / Corporate routing
- deterministic multilingual literal extraction
- grounded Strapi Experience recommendation only
- deterministic recommendation scoring
- no fabricated Experience title / ID / URL / price / availability
- CRM ticket format `CRT-YYYYMMDD-XXXXXX`
- full transcript retention for internal CRM handoff
- guest confirmation email localized to EN/TR/RU/ZH
- internal CREARE email with English CRM headings and original-language transcript
- Lead Quality A/B/C
- Priority urgent/high/normal
- urgency reason
- missing information
- recommended next action
- prompt-injection guard
- standalone hotel/restaurant boundary
- price and availability boundaries
- exact-repeat suppression
- model-turn ceiling
- Strapi failure fallback
- Gemini failure fallback
- one controlled Gemini retry only for network/429/5xx
- anonymous token/usage observability without PII
- Gmail delivery idempotency using Gmail Thread ID response mapping
- separate guest/internal email success tracking so retries only send missing email(s)
- localized email-delivery failure fallback with preserved ticket/context
- Typebot transport guard: clear stale assistant reply before each webhook call and show localized fallback if webhook fails

## Validation baseline

Latest validated state before RC creation:
- type-check: PASS
- production build: PASS
- 20-persona regression: 20/20 PASS
- multilingual core matrix: 24/24 PASS
- prompt-injection guard: EN/TR/RU/ZH PASS
- real guest email delivery: EN/TR/RU/ZH PASS
- real internal CRM email delivery: PASS
- malformed JSON / invalid state / oversize / overlong input: PASS
- model outage fallback: PASS
- Strapi outage fallback: PASS
- 24-turn ceiling -> controlled Private Briefing: PASS
- invalid email remains on email input: PASS
- duplicate email submit -> no duplicate delivery: PASS
- partial Gmail failure -> no false success confirmation: PASS
- webhook transport failure -> localized EN/TR fallback without stale reply: PASS
- Typebot V2: UNPUBLISHED

## Production cutover order

1. Freeze RC commit and record its SHA.
2. Confirm Vercel Production has required encrypted environment variables.
3. Merge the RC to `main`.
4. Wait for the exact merged commit to reach Vercel Production READY.
5. Smoke-test `/api/assistant` using a zero/low-cost deterministic request.
6. Patch Typebot V2 webhook URL to `https://crearetravel.com/api/assistant`.
7. Read back Typebot V2 and verify all required mappings and Gmail blocks.
8. Publish Typebot V2.
9. Verify public Typebot ID `creare-assistant`.
10. Enable/ship website bubble only after Typebot public smoke test passes.
11. Run desktop/mobile smoke tests.
12. Run one controlled real handoff test to CREARE's own test inbox.
13. Monitor assistant metrics and Gmail delivery.
14. Declare live only after all checks pass.

## Rollback

If any production gate fails:
1. Remove/disable the website bubble first.
2. Unpublish or revert Typebot V2 to the previous safe flow as appropriate.
3. Roll back the Vercel production deployment to the known-good production deployment.
4. Preserve ticket/email evidence and logs for diagnosis.
5. Do not revoke the legacy Strapi credential until V2 cutover is confirmed stable and rollback no longer depends on the legacy flow.

## Security reminder

- Never place Gemini, Typebot, Strapi, Gmail or Vercel secrets in this repository.
- The legacy hardcoded Strapi credential found in the old Typebot flow must be rotated/revoked only after the V2 cutover and rollback window are complete.
