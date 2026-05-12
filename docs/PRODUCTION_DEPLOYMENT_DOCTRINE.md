# CREARE Production Deployment Doctrine

This document defines the minimum operational discipline for deploying CREARE to production.

Scope:
- Frontend: `creare-local` -> Vercel -> `https://www.crearetravel.com`
- Backend: `creare-cms` -> Railway -> Strapi

Core rules:
- Build passing is not enough.
- Every production change must be reversible.
- No unreviewed deploys.
- No direct production experimentation.
- Preserve luxury restraint during hotfixes. Fix the fault, not the brand system.

## 1. Frontend Pre-Deploy Checklist

### Release state
- Confirm the release branch is isolated and intentional.
- Confirm `git status` is clean or contains only approved release files.
- Confirm unrelated work is excluded from the release candidate.
- Record the branch name and intended commit SHA before promotion.

### Build discipline
- Run `npm run build`
- Run `npm run lint`
- Run `npm run type-check`
- Treat any failure as a hard blocker.

### Preview verification
- Open the Vercel preview deployment.
- Verify:
  - `/`
  - `/experiences/signature`
  - `/experiences/lab`
  - `/experiences/black`
  - `/cultural-worlds`
  - `/contact`
  - `/insights`

### Visual parity checks
- Homepage hero and collections remain unchanged except approved motion.
- Signature grid remains frozen to the approved editorial structure.
- BLACK parity remains intact.
- Cultural Worlds parity remains intact.
- Header and Footer remain structurally unchanged unless explicitly approved.
- No accidental Rocket sections, duplicate dividers, duplicate CTA layers, or stray preview artifacts appear.

### Responsive checks
- Verify desktop and mobile for:
  - header contrast
  - menu behavior
  - card grids
  - footer handoff
  - CTA alignment

### Contact and inquiry verification
- Verify `/contact` loads.
- Verify invalid form payloads fail cleanly.
- Verify one safe end-to-end submission path only if using a sandbox mailbox or explicitly approved test address.
- Never spam the live inbox during routine deploy checks.

### CMS fetch verification
- Confirm frontend still resolves content from `NEXT_PUBLIC_STRAPI_URL`.
- Confirm representative experience, cultural world, and insight pages still render live CMS-backed data.
- Confirm media still loads from approved remote hosts.

## 2. Backend Pre-Deploy Checklist

### Railway environment verification
- Confirm the following variables exist and are populated:
  - `APP_KEYS`
  - `API_TOKEN_SALT`
  - `ADMIN_JWT_SECRET`
  - `TRANSFER_TOKEN_SALT`
  - `STRAPI_PUBLIC_URL`
  - `DATABASE_CLIENT`
  - `DATABASE_URL`
  - `CORS_ORIGIN`
  - `CLOUDINARY_NAME`
  - `CLOUDINARY_KEY`
  - `CLOUDINARY_SECRET`

### Production safety verification
- `DATABASE_CLIENT` must be `postgres` in production.
- `STRAPI_PUBLIC_URL` must point to the live Railway CMS URL.
- `CORS_ORIGIN` must explicitly include:
  - `https://www.crearetravel.com`
  - `https://crearetravel.com`
- No wildcard CORS origin is allowed.

### Build verification
- Run `npm run build`
- Run `npm run strapi -- version` if needed for runtime confirmation.
- Treat config boot errors as deploy blockers.

### Cloudinary verification
- Confirm upload provider config is active.
- Confirm one representative media URL resolves.
- Confirm no local upload fallback is unintentionally serving production assets.

### Placeholder seed verification
- Confirm `ENABLE_PRODUCTION_PLACEHOLDER_SEED` is not enabled unless explicitly intended.
- Never promote a release while unsure whether production bootstrap seeding may run.

## 3. Production Promotion Checklist

### Promotion prerequisites
- Frontend preview passes.
- Backend build and config verification pass.
- Known issues are documented and consciously accepted.
- Frontend and backend commit SHAs are recorded together.

### Vercel promotion strategy
- Promote only from a verified preview or approved release branch.
- Record:
  - branch
  - commit SHA
  - preview URL
  - promotion timestamp

### Railway deploy strategy
- Deploy only after environment verification is complete.
- Confirm no emergency scripts, seed scripts, or backfill scripts are tied to startup.
- Record:
  - branch
  - commit SHA
  - deploy timestamp

### Smoke verification order
1. Backend API reachability
2. Frontend homepage and critical routes
3. Media loading
4. Contact/inquiry path
5. Final executive visual pass

## 4. Post-Deploy Smoke Checklist

### Frontend
- Homepage
- Signature
- BLACK
- Cultural Worlds
- Insights
- Contact

Check for:
- correct layout
- correct copy
- working images
- header contrast
- footer handoff
- responsive stability

### Backend
- `GET /api/experiences?pagination[pageSize]=1`
- `GET /api/destinations?pagination[pageSize]=1`
- `GET /api/insights?pagination[pageSize]=1`
- `POST` path readiness for inquiry/contact-related flows as appropriate

### Cross-system checks
- Media URLs resolve
- CORS allows production frontend origins
- Frontend can reach CMS successfully
- No obvious schema or serialization failures appear in rendered pages

## 5. Rollback Doctrine

### Frontend rollback
- Use Vercel rollback to the last known-good deployment.
- After rollback:
  - verify homepage
  - verify Signature
  - verify BLACK
  - verify Cultural Worlds
  - verify Contact

### Backend rollback
- Use Railway rollback to the last known-good service version.
- Treat database rollback as a separate decision.
- Never assume application rollback automatically makes database state safe.

### Database caution rules
- No schema-changing intervention during an incident unless explicitly necessary.
- No emergency seed scripts.
- No emergency backfill or editorial scripts while service stability is unclear.
- Restore service first. Repair content second.

### Incident rollback principle
- Roll back to the last stable known-good state quickly.
- Investigate after stability is restored.

## 6. Incident Classification

### Visual regression
- Layout drift
- parity break
- spacing collapse
- contrast failure
- mobile-only or desktop-only visual break

### API degradation
- frontend loads but CMS-backed sections fail
- partial content load
- slow or unstable API responses

### CMS outage
- Strapi unavailable
- admin unavailable
- public API unavailable
- production boot failure

### Media outage
- Cloudinary asset failures
- broken cover images
- image host mismatch
- asset dependency failures

### Contact path failure
- `/contact` unavailable
- inquiry submission failing
- SendGrid misconfiguration
- silent failure without operator visibility

## 7. Frontend / Backend Coordination Rules

- Never treat frontend and backend deploys as unrelated if they share live content dependencies.
- Record both SHAs for every coordinated release.
- If backend content shape changed, frontend preview must be rechecked against live CMS responses.
- If frontend schema rendering changed, verify live CMS payload compatibility before promotion.
- If either side is uncertain, do not promote both.

## 8. Operational Philosophy

- Build passing is not enough.
- Production changes must be reversible.
- No unreviewed deploys.
- No direct production experimentation.
- Preserve luxury restraint during hotfixes.
- Scope discipline matters: deploy only what was intentionally reviewed.
- Stability beats completeness during incidents.
