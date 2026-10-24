# Staging deployment report — Phase 3B live E2E activation

**Sprint:** `P0.SITE00.IDNTY.PHASE3B.STAGING-DEPLOYMENT-AND-LIVE-FOUNDER-E2E-ACTIVATION1`  
**Audited:** 2026-10-24 (UTC) · **Agent environment:** Cursor Cloud (no Railway deploy credentials)

## Service identities (canonical)

| Role | Railway service | Public URL |
| --- | --- | --- |
| SITE 00 SPA (staging) | `carefree-luck` | https://carefree-luck-staging.up.railway.app |
| SITE 00 API (staging) | `reliable-creation` | https://reliable-creation-staging.up.railway.app |

Both services are in Railway project **SITE00**, repository **yoteenz/SITE00**. Build/start follow repo `railway.toml` / `npm run start:api` (API) and Vite production build (SPA).

## Integration target (not yet deployed)

| Item | Value |
| --- | --- |
| PR | #1684 (draft, unmerged) |
| Branch | `cursor/idnty-phase3b-automated-e2e-email-b71a` |
| Expected SHA | `e907a6331ee703967f7618c45f4c1b775337de80` |
| Ancestry | Contains Phase 3 (#1681) + Phase 3B (#1682) commits |

## Live deployment state (observed)

| Layer | Deployed SHA | Matches E2E target? |
| --- | --- | --- |
| API `GET /api/health` → `gitCommit` | `34d9afa0de28` | **NO** (predates automated journey runner + gallery) |
| SPA shell `index.*.js` | `/assets/index.BA8UINWX.js` | **NO** (bundle lacks `foundation-email-journey` / `FoundationEmailJourneyPage` markers) |

**Conclusion:** Staging is healthy on the **legacy** integration commit. The automated founder E2E implementation **is not deployed** to Railway staging.

## Health gate (2026-10-24)

Command: `node scripts/staging/df-staging-health-gate.mjs`

| Check | Result |
| --- | --- |
| API health | PASS |
| SPA shell | PASS |
| JS MIME | PASS |
| Missing asset not HTML | PASS |
| Admin API auth gate (401 without session) | PASS |

Extended audit: `node scripts/staging/df-staging-deployment-audit.mjs` → exit code **2** (`deployment_match: false`, `e2e_route_in_spa_bundle: false`).

## Configuration (API health — non-secret)

| Variable / signal | Staging state |
| --- | --- |
| `SUPABASE_URL` project | `soocqbyjkxeubfjnuwvf` (staging isolation verified in health) |
| `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE` | ON |
| `SITE00_PUBLIC_APP_ORIGIN` | Matches carefree-luck SPA |
| `SITE00_DF_FOUNDER_TEST_MODE` | ON |
| `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` | Present (addresses not exposed) |
| `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` | **OFF** (`transactionalSendFlag: false`) |
| `RESEND_API_KEY` | Present |
| Stripe secret | Present; `stripeKeyMode: unrecognized` (prefix not classified — confirm `sk_test_` / `rk_test_` on Railway) |

## Agent deployment capability

| Capability | Result |
| --- | --- |
| Railway CLI / API token on agent VM | **Not available** |
| GitHub Actions workflow for staging deploy | **Not found** in repo |
| Agent-executed redeploy | **Not performed** (cannot claim deployment) |

## Required founder / Railway actions (exact)

1. **API service `reliable-creation`:** Settings → Source → deploy branch `cursor/idnty-phase3b-automated-e2e-email-b71a` at commit **`e907a6331`** (or merge stack then deploy that SHA). Redeploy.
2. **SPA service `carefree-luck`:** Same branch/SHA. Ensure build uses staging API base (`VITE_API_BASE` / build script → `https://reliable-creation-staging.up.railway.app`).
3. **Verify:** `GET https://reliable-creation-staging.up.railway.app/api/health` → `gitCommit` starts with `e907a63`.
4. **Verify:** `node scripts/staging/df-staging-deployment-audit.mjs` → exit **0** (`deployment_match` + `e2e_route_in_spa_bundle` true).
5. **Email safety:** Set allowlist to **`kateenaarmstrong@gmail.com` only** before enabling send (see `AUTOMATED_E2E_EMAIL_JOURNEY.md`).

## Historical failure recheck (staging)

| Failure mode | Current observation |
| --- | --- |
| White screen / wrong MIME | PASS (health gate) |
| Admin API open | PASS (401 without token) |
| Persistence off | PASS (persist on + staging ref) |
| localhost auth redirect | Not re-tested in browser this run |
| Email journey desk missing | **FAIL** until SPA redeploy to E2E SHA |
