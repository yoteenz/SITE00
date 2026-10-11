# Anthony Gate A — production readiness

**Sprint:** P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-ANTHONY-GATE-A-PRODUCTION-PERSISTENCE-DEPLOYMENT-AND-LAUNCH-CERTIFICATION3  
**Date:** 2026-10-10  
**Agent:** Cursor Composer

## Executive result

| Gate | Result |
| --- | --- |
| **Gate A — production** | **FAIL / BLOCKED** |
| **Gate B — full service** | **NOT CERTIFIED** |
| **Recommended mode** | **NO-GO** for Anthony intake link |

## Repository truth (rechecked)

| Ref | SHA / state |
| --- | --- |
| `origin/main` | `2001e373` (#1578 merged after #1577 `7ba509e6`) |
| PR #1577 | **MERGED** (Anthony launch gate + V2 integration) |
| PR #1578 | **MERGED** (fsbw DF API routing) |
| PR #1573 | **MERGED** (component system) |
| PR #1574 | Open but **superseded** by #1577 — close recommended |

## Production vs repo (critical blocker)

| Surface | Deployed | Required for Gate A |
| --- | --- | --- |
| API | `4bf6fa50` (#1573) | ≥ `7ba509e6` (#1577 launch gate, intake UI, V2) |
| SPA (site00.com) | Sep 2026 bundle `index.D8Jaygrd.js` | ≥ `2001e373` build (routing + components + submitted surface) |

**Frontend/API compatibility: FAIL** — client would not match certified API behavior even if API were updated alone.

## Persistence & flags (production)

| Item | Status |
| --- | --- |
| `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE` on Railway | **UNVERIFIED** (health did not expose until diagnostics patch; likely **off** if intakes were memory-only) |
| Supabase migrations on live DB | **UNVERIFIED** (agent cannot query DB — network timeout) |
| API restart persistence proof | **BLOCKED** |
| `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY` | **UNVERIFIED** on live API at `4bf6fa50` (predates #1577) |

## What passed (engineering baseline on `main` code)

- Vitest DF suite: 100 pass / 1 skipped (prior sprint); + runtime diagnostics test after this branch
- Typecheck / build: PASS on branch
- Launch gate logic: vitest PASS
- Dev intake E2E (memory): PASS (prior artifacts)
- Cross-client invalid token: handler tests PASS

## Anthony personalized link

**NOT CREATED** on production for this sprint (disposable QA only; no Anthony PII/tokens in repo).

## Founder actions required (ordered)

1. Apply Supabase migrations on `hyycomvcaqxxvyrfupes` if missing (see migration audit).
2. Railway: set persist + intake-only flags; redeploy from **`main` `2001e373`** (or later).
3. Merge/deploy branch with `/api/health` `digitalFoundation` block (this sprint PR) for flag verification without secrets.
4. Upload latest GitHub Release ZIP to GoDaddy (match API SHA).
5. Execute restart persistence proof with disposable client (private ops doc).
6. Complete founder checklist; then authorize Anthony link creation manually.

## Related documents

- `FOUNDATION_PRODUCTION_DEPLOYMENT_MANIFEST.md`
- `FOUNDATION_SUPABASE_MIGRATION_AUDIT.md`
- `FOUNDATION_INTAKE_ONLY_FLAG_AUDIT.md`
- `FOUNDATION_API_RESTART_PERSISTENCE_PROOF.md`
- `FOUNDATION_PRODUCTION_BROWSER_QA.md`
- `FOUNDATION_GATE_A_LAUNCH_CHECKLIST.md`
- `FOUNDATION_LAUNCH_ROLLBACK_PLAN.md`

## Next sprint (preserved path)

`P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GATE-B-STRIPE-MESSAGING-APPROVALS-EMAIL-AND-FULL-SERVICE-E2E4`
