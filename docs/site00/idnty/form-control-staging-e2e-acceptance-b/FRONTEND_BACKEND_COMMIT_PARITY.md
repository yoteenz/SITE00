# Frontend / backend commit parity

**Evidence file:** `/opt/cursor/artifacts/form-control-staging-b/staging-parity-report.json`

| Service | Deployed identity | Required (Sprint A) | Match |
| --- | --- | --- | --- |
| **reliable-creation** (API) | `1152f25f502d` | `255576b5…` (#1661) | **NO** |
| **carefree-luck** (SPA) | `builtAt: 2026-10-19T16:20:43Z`, `commitSha: unknown` | `255576b5…` | **NO** |

## Interpretation

- Sprint A merged **after** the last SPA build timestamp (16:52 > 16:20).
- Live staging cannot demonstrate Sprint A form-control behavior until both services redeploy from integration HEAD.
- Prior incident protections (asset 404) remain **PASS** on current SPA host.

## Required founder action

1. Railway → **reliable-creation** → deploy branch `cursor/idnty-founder-readiness-e2e-be3b` @ `255576b5`.
2. Railway → **carefree-luck** → build with `scripts/staging/build-founder-staging-spa.sh` (includes industry select flag).
3. Re-run `node scripts/staging/verify-form-control-staging-parity.mjs` until `parity.apiMatchesIntegration` and bundle markers are true.
