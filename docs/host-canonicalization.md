# CREARE Host Canonicalization

Canonical production host:

- `https://crearetravel.com`

Redirect rule:

- `https://www.crearetravel.com/*`
- redirects permanently to `https://crearetravel.com/*`

Expected behavior:

- preserve pathname
- preserve query params
- avoid redirect loops by redirecting only when hostname is exactly `www.crearetravel.com`

SEO host standards:

- canonicals use `https://crearetravel.com`
- `metadataBase` uses `https://crearetravel.com`
- sitemap URLs use `https://crearetravel.com`
- robots sitemap reference uses `https://crearetravel.com/sitemap.xml`
- JSON-LD `@id` and `url` values use `https://crearetravel.com`

Vercel manual setting to verify:

- the project domains must not force `crearetravel.com` to `www.crearetravel.com`
- if Vercel has a preferred-domain or redirect rule, it must support:
  - `www` -> bare
  - not bare -> `www`

Live verification commands:

```bash
curl -I https://www.crearetravel.com
curl -I https://www.crearetravel.com/experiences
curl -I https://crearetravel.com
curl -I https://crearetravel.com/experiences
```

Expected results:

- `https://www.crearetravel.com` returns `301` or `308` to `https://crearetravel.com/`
- `https://www.crearetravel.com/experiences` returns `301` or `308` to `https://crearetravel.com/experiences`
- `https://crearetravel.com` does not redirect to `www`
- `https://crearetravel.com/experiences` may still redirect to `/experiences/signature` if that route intent remains in `next.config.mjs`
