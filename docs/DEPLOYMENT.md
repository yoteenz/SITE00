# SITE 00 — GoDaddy & production deployment

## Hosting product (owner action required)

GoDaddy product type **cannot be determined programmatically**. Provide one of:

1. **Web Hosting (cPanel)** — static `dist/` + `.htaccess` SPA rewrites; API must live elsewhere
2. **Node.js Hosting** — can run API adapter for `api/` routes
3. **Other** — VPS, Managed WordPress (not recommended for this SPA)

## Architecture C — Static site (GoDaddy) + API (Railway)

Recommended production split:

| Layer | Host | URL |
|-------|------|-----|
| SPA (`dist/`) | GoDaddy cPanel | `https://site00.com` |
| Node API (`server/` + `api/`) | Railway | `https://api.site00.com` |

### Build the SPA with API origin

```bash
VITE_SUPABASE_URL=... \
VITE_SUPABASE_ANON_KEY=... \
VITE_SITE00_ROOT=1 \
VITE_SITE00_CANONICAL_ORIGIN=https://site00.com \
VITE_API_BASE=https://api.site00.com \
npm run build
```

Upload `dist/` to GoDaddy `public_html/site00.com` as in Architecture A.

### Railway service

1. Connect GitHub repo `yoteenz/SITE00` (branch with `server/` + `npm run start:api`).
2. **Service → Settings → Deploy → Custom Start Command:** leave empty (uses `railway.toml` → `npm run start:api`) or set `npm run start:api`.
3. **Service → Variables** (server-side only — never `VITE_*`):

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL` | yes | Same project as SPA |
| `SUPABASE_ANON_KEY` | yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Admin/production + ASSTS routes |
| `SESSION_COOKIE_SECRET` | yes | Random 32+ char secret for HttpOnly session cookie signing |
| `ADMIN_EMAILS` | optional | Comma-separated admin allowlist |
| `FAL_KEY` | later | ASSTS generation |
| `PORT` | auto | Railway sets this |

4. Deploy; confirm health: `GET https://<railway-url>/api/health` → `{ "ok": true, "service": "site00-api" }`.
5. **Service → Settings → Networking → Custom Domain:** add `api.site00.com`.
6. **GoDaddy DNS:** CNAME `api` → Railway-provided hostname.

### Local API dev

```bash
# Terminal 1 — API on :3000
npm run start:api

# Terminal 2 — Vite with proxy to API
VITE_DEV_PROXY_TARGET=http://127.0.0.1:3000 npm run dev
```

Or set `VITE_API_BASE=http://127.0.0.1:3000` when building/previewing.

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
