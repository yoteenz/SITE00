# Railway API readiness — Digital Foundation

**Host:** `https://api.site00.com`  
**Probe date (UTC):** 2026-10-11

## Deployed SHA / build

| Field | Value |
| --- | --- |
| **gitCommit** (from `/api/health`) | `3cd487e2968f` |
| **releaseId** | `site00-v272-3cd487e` |
| **Repo `main` at audit** | `3cd487e2968f7add0ff953475f878668305e5c3f` (matches deployed API) |

**New Railway deploy required for Gate A?** **NO** for code SHA — API already matches repo `main`.  
**YES** for **functional readiness** — persistence cannot work until **migrations applied** (tables missing).

## Environment flags (from health JSON)

| Flag | Value | Implication |
| --- | --- | --- |
| `digitalFoundation.persistSupabaseEnv` | `true` | `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` |
| `digitalFoundation.launchGateIntakeOnly` | `true` | Checkout blocked for intake-only mode |
| `digitalFoundation.artifactV1` | `true` | Feature enabled |
| `digitalFoundation.checkoutV1` | `true` | Present but gated |
| `auth.supabaseConfigured` | `true` | Service role path configured |

## Routes (repo)

- `GET/POST /api/site00/digital-foundation-artifact` — token intake, payload, updates  
- `POST /api/site00/digital-foundation-stripe-webhook` — Gate B  

## Production probes

| Probe | Result |
| --- | --- |
| `GET /api/health` ×8 | **200**, ~247–382ms, no 522 |
| `GET .../digital-foundation-artifact?action=payload&token=<probe>` | **400-level error body** `{"error":"[object Object]"}` — indicates Supabase/PostgREST error surfacing bug; **not** silent success |
| Invalid action | `{"error":"Unknown action"}` |
| Missing token POST | `{"error":"token required"}` |

## Readiness assessment

| Criterion | Status |
| --- | --- |
| Health route | **PASS** |
| Authenticated founder admin routes | **NOT PROBED** (no founder JWT in agent) |
| Client artifact lookup with real token | **BLOCKED** — no disposable production artifact; schema missing |
| Persistence configuration | **CONFIGURED but NON-FUNCTIONAL** — tables absent |
| Timeout / 522 on health | **NONE observed** |

## Recommendation

1. **Do not redeploy Railway** until migrations approved and applied (same SHA is fine).  
2. After migrations: mint **disposable** artifact, verify row in `site00_df_artifacts`.  
3. Follow-up PR: improve DF API error serialization (PostgREST errors currently `[object Object]`).

**API readiness for Gate A:** **BLOCKED** (database schema, not deploy SHA).
