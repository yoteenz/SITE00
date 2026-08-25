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
| `ANTHROPIC_API_KEY` | for Creative Direction | Server-side Sonnet formation |
| `SITE00_CREATIVE_INTELLIGENCE_MODEL` | optional | Default `claude-sonnet-4-6` (do not use retired `claude-sonnet-4-20250514`) |
| `PORT` | auto | Railway sets this |

4. Deploy; confirm health: `GET https://<railway-url>/api/health` → `{ "ok": true, "service": "site00-api" }`.

**If Railway shows “Not Found — The train has not arrived at the station”:** the public domain exists but no healthy deployment is running behind it. Open **Deployments → latest → View logs** and look for crash lines before `[site00-api] listening`. Common fixes (Aug 2026): ensure `tsx` is a production dependency, server must not import `vite` at runtime, and `api/site00-access.ts` must import `./_lib/...` not `../_lib/...`.

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

GitHub Actions workflow (`.github/workflows/deploy-godaddy.yml`):

1. Trigger on push to `main`
2. `npm ci && npm run build`
3. FTP/SFTP or GoDaddy Git deploy of `dist/` when repo var `GODADDY_DEPLOY_ENABLED=true`

---

## Deploy checklist (agents + founder)

**Merging to `main` does not update the live site.** GitHub is updated immediately; production hosts are not.

SITE 00 has **two independent deploy targets**. Most sprints touch only one.

| Target | Host | URL | What it serves |
|--------|------|-----|----------------|
| **Frontend (cPanel)** | GoDaddy | `site00.com`, `site00.fsbw-dev.com` | Static SPA (`dist/`) |
| **API (Railway)** | Railway | `api.site00.com` | Node server (`server/` + `api/`) |

Preview hosts (`fsbw-dev.com`, Cloudflare tunnels) call **`https://api.site00.com`** for API requests — not the local Vite `/api` middleware. See `src/utils/site00ApiBase.ts`.

### Quick decision — which deploy(s)?

Use this at the end of every sprint. Check **only what changed in the PR**.

#### Frontend only → cPanel deploy

Redeploy **GoDaddy / fsbw-dev** when the PR changed any of:

- `src/**` (components, pages, hooks, styles)
- `public/**`
- `shared/**` consumed by the browser (UI registries, client-side logic, CSS tokens)
- `index.html`, Vite config, frontend env baked at build time (`VITE_*`)

**Skip Railway** for pure UI/CSS/hook work — e.g. layout fixes, founder workspace shell, project presence accent colors, desktop preview toggle.

#### API only → Railway redeploy

Redeploy **Railway** when the PR changed any of:

- `api/**`
- `server/**`
- `scripts/vite-site00-local-api.mjs` (local dev parity — production uses Railway)
- Server-side libs under `api/_lib/**`
- `package.json` / lockfile **only if** a dependency affects the API runtime
- New or changed **Railway environment variables** (secrets, model names, feature flags)

**Skip cPanel** if nothing under `src/` or frontend `shared/` changed.

#### Both → deploy both (in either order)

When a sprint adds a **new API action** and **UI that calls it**, deploy Railway first (or confirm API is already live), then cPanel.

Also deploy both when:

- Supabase migration applied **and** UI reads new columns/fields
- API response shape changed **and** frontend expects the new shape

#### Neither → no production deploy

Docs-only, tests-only, or motherboard-only changes. `main` merge is enough.

### Path cheat sheet

| Changed paths | cPanel | Railway |
|---------------|:------:|:-------:|
| `src/site00/components/**` | ✓ | — |
| `src/site00/styles/**` | ✓ | — |
| `shared/site00-brand-lore/**` (UI/registry) | ✓ | — |
| `api/site00/projects.ts` | — | ✓ |
| `api/_lib/**` | — | ✓ |
| `server/**` | — | ✓ |
| Supabase migration + API handler + UI | ✓ | ✓ |
| `motherboard/**`, `docs/**`, `tests/**` only | — | — |

### Agent session close (required)

At sprint end, state explicitly in the text summary:

1. **Deploy needed:** `FRONTEND` · `API` · `BOTH` · `NONE`
2. **Why** — one line referencing changed paths or behavior
3. **Founder action** — only the steps that apply (omit Railway when frontend-only)

Example (frontend-only):

> **Deploy:** FRONTEND only. Project presence accent hook + shared registry landed on `main`. Upload latest cPanel ZIP to `site00.fsbw-dev.com` / `site00.com`. **No Railway redeploy.**

Example (API-only):

> **Deploy:** API only. New `personality_replay_bootstrap` action in `api/site00/projects.ts`. Redeploy Railway from `main`; confirm `GET https://api.site00.com/api/health`. **No cPanel deploy.**

Do **not** tell the founder to redeploy Railway on every merge.

### Founder deploy steps

#### cPanel (frontend)

1. Build: `npm ci && npm run build` (or use GitHub Actions artifact / Release ZIP)
2. Upload **contents of `dist/`** to cPanel `public_html` (site00.com and/or fsbw-dev path)
3. Hard-refresh mobile browser (Safari cache is aggressive)

#### Railway (API)

1. **Service → Deploy** from `main` (or confirm auto-deploy finished)
2. Verify: `GET https://api.site00.com/api/health` → `{ "ok": true, "service": "site00-api" }`
3. If behavior still stale: check **Deployments → latest → View logs** for crash before `[site00-api] listening`

### Controlling Railway cost

If Railway is connected to GitHub on `main`, it may redeploy on **every push** even when only frontend files changed.

Recommended (Railway **Service → Settings → Deploy → Watch Paths**):

```
api/**
server/**
railway.toml
package.json
package-lock.json
```

With watch paths enabled, frontend-only merges skip Railway builds. Redeploy manually when API code or env vars change.

Auto-deploy on `main` is fine if cost is acceptable; watch paths reduce unnecessary builds.

### Common symptoms

| Symptom | Likely fix |
|---------|------------|
| Vite import error / blank page / old UI on fsbw-dev | **cPanel** — frontend bundle stale or partial |
| `Unknown action` / 404 on API calls / formation stuck | **Railway** — API handler not deployed |
| Sign-in works, projects list empty | **Railway** — check `/api/health` and projects route |
| UI shows new labels but backend behavior unchanged | Often **Railway** still on old API |
| Everything works on cloud preview tunnel, not on fsbw-dev | **cPanel** — tunnel runs latest code; fsbw-dev needs ZIP |

---

## Rollback

- Frontal Slayer monorepo commit before Phase 23 cleanup
- SITE 00 `main` initial commit: see git log in this repository
