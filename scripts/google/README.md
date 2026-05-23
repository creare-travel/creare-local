# CREARE Google Automation Foundation

This folder is reserved for future Google Tag Manager and Google Analytics Admin automation.

## Safety rules

- Credentials must never be committed.
- OAuth client JSON files must be stored locally only.
- Refresh tokens and token caches must remain local only.
- The `credentials/` folder and token artifacts are ignored by Git.

## Current phase

Phase 1 is read-only discovery only.

That means future scripts in this folder should begin by:

- discovering GTM account, container, and workspace state
- discovering GA4 property and data stream state
- generating plan and diff output

They must not:

- apply configuration changes by default
- create GTM tags, triggers, or variables automatically
- publish GTM versions automatically
- create or modify GA4 entities without explicit approval

## Approval boundary

No apply or publish workflow should be introduced here without explicit approval.

Recommended safe script modes for future implementation:

- `--dry-run`
- `--plan`
- `--apply`
- `--publish`

The default mode must remain read-only.

## Refresh token helper

You can generate a local refresh token with:

```bash
npm run google:auth:refresh-token
```

If you intentionally need a token that can create or update GTM workspace entities, use:

```bash
npm run google:auth:refresh-token:gtm-edit
```

Required `.env.local` values:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

How it works:

1. The script prints a Google OAuth consent URL.
2. Open the URL in your browser and approve access.
3. Copy the returned authorization code.
4. Paste it into the terminal prompt.
5. The script prints only the refresh token.

Safety notes:

- The helper does not call GTM APIs.
- The helper does not call GA4 Admin APIs.
- The helper does not store tokens automatically.
- Add the refresh token to `.env.local` manually only if you approve that step.
- The default helper remains read-only.
- The `gtm-edit` helper requests:
  - `https://www.googleapis.com/auth/tagmanager.readonly`
  - `https://www.googleapis.com/auth/tagmanager.edit.containers`
  - `https://www.googleapis.com/auth/analytics.readonly`
- A GTM edit refresh token can create or update GTM workspace entities.
- A GTM edit refresh token does not publish GTM versions by itself.
- Use a GTM edit token only for controlled apply scripts.
- Never commit refresh tokens.
- Keep `.env.local` local only.
