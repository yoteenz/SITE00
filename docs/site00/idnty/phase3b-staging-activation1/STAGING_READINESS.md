# Staging readiness — live inventory (2026-10-21)

## Services (verified HTTP)

| Layer | URL | Deployed commit (health) | Notes |
| --- | --- | --- | --- |
| SPA (Railway) | https://carefree-luck-staging.up.railway.app | HTML `app-build-id`: mvh804u4 | Bundle e.g. `/assets/index.BA8UINWX.js` |
| API (Railway) | https://reliable-creation-staging.up.railway.app | `34d9afa0de28` (`site00-v272`) | **Not** Phase 3/3B branch SHA yet |
| Supabase | `soocqbyjkxeubfjnuwvf` (site00-staging) | Migrations applied (see DATABASE_RLS_AUDIT) | Isolation verified in API health |

## Health gate (automated)

Command: `node scripts/staging/df-staging-health-gate.mjs`

| Check | Result |
| --- | --- |
| API `/api/health` ok | PASS |
| Persistence flag | `true` |
| Transactional send flag | `false` (expected until founder enables) |
| SPA shell + JS MIME | PASS |
| Missing JS → 404 plain text (not HTML) | PASS |
| Admin API without session → 401 | PASS |

## Merge / deploy order

1. **#1681** — Phase 3 integration (visual + functional wiring) — founder approval  
2. **#1682+** — Phase 3B tooling/docs (this branch) — optional before or with staging redeploy  
3. Redeploy **reliable-creation** + **carefree-luck** from approved merge commit  
4. Re-run health gate + founder tester journey

Production (site00.com, api.site00.com, production Supabase) — **unchanged**.
