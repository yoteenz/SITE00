# Staging deployment parity recovery — Composer1

**Sprint:** `P0.SITE00.IDNTY.STAGING-DEPLOYMENT-PARITY-RECOVERY.COMPOSER1`  
**Checked:** 2026-10-19T19:32Z UTC  
**Required integration SHA:** `255576b5d737a660ea930c646d366e1f034fe7ae` (#1661)

## Result summary

| Layer | Status |
| --- | --- |
| **Backend (reliable-creation-staging)** | **PARITY OK** — `gitCommit` `255576b5d737` |
| **Frontend (carefree-luck-staging)** | **FUNCTIONAL PARITY OK** — runtime smoke confirms custom industry select + CONTACT NUMBER; manifest `commitSha` still `unknown` |
| **Agent Railway deploy** | **NOT PERFORMED** — no Railway CLI/token in cloud agent; parity restored by existing staging deployment before this run |
| **Full Sprint B E2E** | **PARTIAL** — Supabase vitest PASS; authenticated synthetic client journey still requires founder session |

## Evidence artifacts

| Artifact | Path |
| --- | --- |
| Parity JSON | `/opt/cursor/artifacts/form-control-staging-b/staging-parity-report.json` |
| Live SPA smoke | `/opt/cursor/artifacts/staging-parity-recovery-composer1/live-spa-smoke.json` |
| P02 screenshot | `/opt/cursor/artifacts/staging-parity-recovery-composer1/staging-p02-mobile.png` |

## Scripts

- `scripts/staging/verify-form-control-staging-parity.mjs`
- `scripts/staging/staging-live-spa-form-control-smoke.mjs`
- `scripts/staging/build-founder-staging-spa.sh` (defaults `VITE_DF_CUSTOM_INDUSTRY_SELECT=1`)
