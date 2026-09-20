# SITE 00 production routing

## Path ownership

| Layer | Host | Paths |
|-------|------|--------|
| Frontend SPA | GoDaddy cPanel (`site00.com`) | `/`, `/projects/*`, `/services/*`, `/system/*`, … (see `scripts/spa-route-prefixes.mjs`) |
| API | Railway (`api.site00.com`) | `/api/*` only |
| Hashed assets | GoDaddy | `/assets/*`, `/release-manifest.json` |

The browser must never treat `/projects` as an API path.

## GoDaddy 403 on `/projects`

Apache returns **403 Forbidden** (raw HTML, no React) when:

1. A physical `projects/` directory exists on the host, and
2. `Options -Indexes` is active, and
3. Nested `projects/.htaccess` was **not** activated after ZIP upload (cPanel often skips dotfiles).

**Permanent mitigations in every deploy ZIP:**

- Root `htaccess-deploy.txt` → rename to `.htaccess`
- Each `{prefix}/htaccess-nested.txt` → rename to `{prefix}/.htaccess`
- `{prefix}/index.html` — copy of SPA shell (serves even if rewrite rules fail)
- `ErrorDocument 403 /index.html` at root and nested levels

CI runs `scripts/site00-activate-spa-htaccess.sh` after FTP deploy when secrets are present.

## Post-deploy verification

```bash
node scripts/site00-production-route-smoke.mjs
node scripts/site00-verify-spa-deep-link.mjs
```

Set `SPA_ROUTE_REPEAT=20` for intermittent regression checks on `/projects`.
