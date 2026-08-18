# SITE 00 — GoDaddy & production deployment

## Hosting product (owner action required)

GoDaddy product type **cannot be determined programmatically**. Provide one of:

1. **Web Hosting (cPanel)** — static `dist/` + `.htaccess` SPA rewrites; API must live elsewhere
2. **Node.js Hosting** — can run API adapter for `api/` routes
3. **Other** — VPS, Managed WordPress (not recommended for this SPA)

## Architecture A — cPanel static (SPA only)

```
GitHub → npm ci && npm run build → dist/ → GoDaddy public_html
```

1. Build locally or in GitHub Actions
2. Upload `dist/` contents to web root
3. Ensure `.htaccess` from `public/.htaccess` is present (Vite copies to `dist/`)
4. Point API to separate Node/Supabase Edge host via `VITE_API_BASE`

**Limitation:** Vercel serverless routes under `api/` do not run on static hosting. Host API on:
- Supabase Edge Functions (migrate handlers), or
- Small Node service on GoDaddy Node hosting / external VPS, or
- Temporary: keep API on existing deployment until SITE 00 API is migrated

## Architecture B — GoDaddy Node.js

If Node hosting is available:
- Serve `dist/` as static files
- Run Express (or similar) adapter mounting `api/` handlers
- Set server env: `SUPABASE_SERVICE_ROLE_KEY`, `FAL_KEY`, `ADMIN_EMAILS`

## DNS (after hosting is ready)

| Host | Type | Target |
|------|------|--------|
| `@` | A or CNAME | GoDaddy hosting IP / hostname |
| `www` | CNAME | `@` or hosting hostname |

**Canonical:** `https://site00.com` — redirect `www.site00.com` → apex in hosting panel.

## Supabase auth callbacks

In Supabase dashboard (SITE 00 project when split, or shared project during migration):

- Site URL: `https://site00.com`
- Redirect URLs: `https://site00.com/**`, `http://localhost:5174/**`

## Repeatable deploy (recommended)

GitHub Actions workflow (add `.github/workflows/deploy-godaddy.yml` when credentials available):

1. Trigger on push to `main`
2. `npm ci && npm run build`
3. FTP/SFTP or GoDaddy Git deploy of `dist/`

## Rollback

- Frontal Slayer monorepo commit before Phase 23 cleanup
- SITE 00 `main` initial commit: see git log in this repository
