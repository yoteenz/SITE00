# Foundation production deployment manifest

**Generated:** 2026-10-10 (Gate A certification sprint)  
**Public host:** https://site00.com  
**Do not store secrets in this file.**

## Request topology (verified)

| Layer | Host | Role |
| --- | --- | --- |
| Browser (production) | `https://site00.com` | Static SPA (GoDaddy cPanel) |
| Browser API calls | `https://api.site00.com` | Railway Node (`server/` + `api/` handlers) |
| Data | `hyycomvcaqxxvyrfupes.supabase.co` | Postgres via Supabase (service role on API only) |

Digital Foundation client fetches (post-#1578 on `main`): `site00ApiUrl('/api/site00/digital-foundation-artifact')` → **`https://api.site00.com`** when the page is served from `site00.com` or fsbw-dev preview (CI mode).

Founder admin: `https://api.site00.com/api/admin/site00-foundation` (Bearer + admin email).

cPanel does **not** serve DF API routes; there is no production `/api` rewrite on GoDaddy for DF.

## Live runtime identity (probed 2026-10-10)

| Field | Production value | Repo `main` (expected) | Match |
| --- | --- | --- | --- |
| **API `gitCommit`** | `4bf6fa50df3e` via `GET https://api.site00.com/api/health` | `2001e373eb9d` | **NO** |
| **API releaseId** | `site00-v272-4bf6fa5` | `site00-v272-2001e37` (local build manifest) | **NO** |
| **SPA bundle** | `index.D8Jaygrd.js` (HTML fetch) | `index.1FCvNvQR.js` (@ `2001e373` build) | **NO** |
| **SPA Last-Modified** | Mon, 28 Sep 2026 | Current releases 2026-10-10 | **NO** |
| **Supabase host (API)** | `hyycomvcaqxxvyrfupes.supabase.co` | Same (env on Railway) | **YES** (host only) |

## Manifest fields (target state after authorized deploy)

| Field | Intended value |
| --- | --- |
| FRONTEND_SOURCE_SHA | `2001e373` (or later `main`) |
| FRONTEND_BUILD_SHA | From `dist/release-manifest.json` `commitSha` |
| FRONTEND_DESTINATION | GoDaddy `public_html` (site00.com) |
| API_SOURCE_SHA | Same as frontend for coordinated release |
| API_DEPLOYMENT_ID | Railway deploy id (founder dashboard) |
| API_SERVICE | Railway `site00-api` (project-specific name) |
| API_ENVIRONMENT | production |
| DATABASE_PROJECT | Supabase `FS Website` / ref `hyycomvcaqxxvyrfupes` |
| DATABASE_SCHEMA_VERSION | See `FOUNDATION_SUPABASE_MIGRATION_AUDIT.md` |
| ACTIVE_FEATURE_FLAGS | See `FOUNDATION_INTAKE_ONLY_FLAG_AUDIT.md` |
| PAYMENT_MODE | Stripe test/live per Railway — **not verified this sprint** |
| EMAIL_MODE | DF comms DRY_RUN unless send flags ON |
| RELEASE_MODE | **INTAKE-ONLY** (Gate A) when `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1` |

## Post-deploy verification commands (founder-safe)

```bash
curl -sS https://api.site00.com/api/health | jq '{gitCommit, release, auth: .auth.supabaseHost, digitalFoundation}'
curl -sS https://site00.com/ | rg -o 'index\.[A-Za-z0-9_-]+\.js' | head -1
```

After Railway redeploy with diagnostics patch: confirm `digitalFoundation.persistSupabaseEnv` and `launchGateIntakeOnly` without exposing secrets.
