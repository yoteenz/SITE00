# Staging environment verification

**Frontend:** https://carefree-luck-staging.up.railway.app  
**Backend:** https://reliable-creation-staging.up.railway.app  
**Supabase project ref (from API health):** `soocqbyjkxeubfjnuwvf`

## Health

| Check | Result |
| --- | --- |
| `GET /api/health` | `ok: true`, `persistenceStore: supabase` |
| SPA `GET /` | HTTP 200 HTML |
| Missing JS asset | HTTP **404** `text/plain` (not HTML masquerading as JS) — **PASS** |

## Public configuration (names only)

Verified via API health diagnostics (no secret values logged):

- `VITE_API_BASE` effective on staging SPA → reliable-creation-staging (client bundle uses build-time API base)
- Supabase host matches staging project
- `transactionalSendFlag: false` on staging API

## Feature flag

`VITE_DF_CUSTOM_INDUSTRY_SELECT=1` is **required** at SPA build time.

**Live staging bundle check (2026-10-19):** strings `idnty-sel-sheet`, `ENTER A CONTACT NUMBER`, `df-check--on` were **absent** from `/assets/index.BglJXaIB.js` → flag/build not reflected on carefree-luck.

**Repo fix:** `scripts/staging/build-founder-staging-spa.sh` now defaults `VITE_DF_CUSTOM_INDUSTRY_SELECT=1`.
