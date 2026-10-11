# Foundation Railway deployment execution (Group B)

**Service:** Production API at `https://api.site00.com`  
**Source of truth branch:** `main`  
**As probed 2026-10-10 UTC**

## Current live state

| Field | Value |
| --- | --- |
| Deployed `gitCommit` | `56cae6852f0c` |
| `releaseId` | `site00-v272-56cae68` |
| `digitalFoundation.persistSupabaseEnv` | `true` |
| `digitalFoundation.launchGateIntakeOnly` | `true` |
| Supabase host | `hyycomvcaqxxvyrfupes.supabase.co` |

Sprint baseline cited `89e5b740` / proposed `62e4ef98` — **live API is already ahead of those** on `56cae685` (includes BLDR GPU fix merge). **Repo `main` tip:** `ce75811a` (Digital Foundation vector chamber restore) — **not yet on Railway**.

## Composer access

| Item | Status |
| --- | --- |
| Railway CLI | **NOT CONNECTED** |
| Deploy from this VM | **BLOCKED** without token |

## Founder connection path (exact)

1. Open **Railway** → SITE 00 API service (production).
2. **Settings → Connect GitHub** (if not linked) → repo `yoteenz/SITE00`, branch `main`.
3. Confirm env vars (names only):  
   - `SUPABASE_URL` / `VITE_SUPABASE_URL` host = `hyycomvcaqxxvyrfupes.supabase.co`  
   - `SUPABASE_SERVICE_ROLE_KEY` (secret — rotate only with approval)  
   - `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`  
   - `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1`  
   - `SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1=1` (or equivalent flag wiring)
4. **Deploy** from latest `main` **after** Supabase data path is healthy.
5. Verify:

```bash
curl -sS https://api.site00.com/api/health | jq '{gitCommit, digitalFoundation}'
```

Target: `gitCommit` matches merged `main` (e.g. `ce75811a…` after next deploy).

## Optional code merge before deploy

| PR | Purpose | Merge? |
| --- | --- | --- |
| **#1585** | Map Supabase failures to **503** (not `[object Object]`) | **After DB healthy** — sprint says do not auto-merge |

## Deployment approval

**Group B — WAITING.** Do not redeploy for Anthony until:

1. Supabase reads succeed (`action=payload` < 2 s or clean 404), and  
2. Migrations verified/applied (Group A), and  
3. Founder approves Railway deploy.

## Post-deploy checks

- Health JSON flags unchanged (intake-only + persist on).
- Disposable `action=payload` returns 404 for unknown token **quickly** (proves DB path).
- Intake save + founder admin detail (Gate A script).
