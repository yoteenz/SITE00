# cPanel frontend readiness — site00.com

**Probe date (UTC):** 2026-10-11

## Live production (GoDaddy)

| Signal | Value |
| --- | --- |
| **URL** | `https://site00.com/` → **HTTP 200** |
| **Primary bundle** | `/index.D8Jaygrd.js` (from HTML) |
| **meta app-build-id** | `47e2d7e4ca85` |
| **Last-Modified** | Mon, 28 Sep 2026 16:12:46 GMT |
| **`/foundation/:token` route** | **HTTP 200** (SPA shell loads) |

## Repo / expected deploy (main @ 3cd487e)

| Signal | Value |
| --- | --- |
| **Vite build (agent `npm run build`)** | `index.C0zBUWGo.js`, release `site00-v272-3cd487e` |
| **Digital Foundation client** | `src/site00/foundation-client/`, route `/foundation/:token` |

## Staleness verdict

**Production frontend is STALE** relative to repo `main` (September bundle vs October v272 build).

Anthony Gate A requires a **founder-approved cPanel ZIP deploy** from a fresh GitHub Release (see `FOUNDATION_PRODUCTION_DEPLOYMENT_MANIFEST.md` / packaging script).

## API origin / CORS

- Production SPA must call `VITE_API_BASE=https://api.site00.com` (built into dist).  
- DF artifact handler sets `Access-Control-Allow-Origin: *` on API.  
- **Verify after deploy:** page source must reference **new** `index.*.js`, not `index.D8Jaygrd.js`.

## Feature flags (browser)

Digital Foundation flags are compile-time / server-gated; stale bundle may lack latest intake UX fixes and admin console wiring.

## Recommendation

1. After migration approval: `bash scripts/package-cpanel-deploy.sh` → GitHub Release ZIP.  
2. Upload to `public_html`, extract, hard refresh.  
3. Confirm `app-build-id` / main chunk hash matches release manifest.  
4. Run mobile + desktop foundation route smoke (disposable token).

**CPANEL readiness:** **BLOCKED** (stale deploy; approved ZIP upload required).
