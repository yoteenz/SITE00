# Client portal validation — live staging

**Sprint:** `P0.SITE00.IDNTY.PHASE3B.STAGING-DEPLOYMENT-AND-LIVE-FOUNDER-E2E-ACTIVATION1`  
**Status:** **NOT_RUN** (no synthetic project from live automated journey)

## Scope (when live run exists)

Route: `/foundation/:token` on https://carefree-luck-staging.up.railway.app

Viewports: mobile · tablet · desktop

Four-tab experience: overview · roadmap · needs you · records (per existing portal contract)

## Checks (planned)

| Check | Live result |
| --- | --- |
| Intake persisted | NOT_RUN |
| Client identity | NOT_RUN |
| Quote matches stored version | NOT_RUN |
| Payment status accurate | NOT_RUN |
| Roadmap reflects lifecycle | NOT_RUN |
| NEEDS YOU correctness | NOT_RUN |
| Records visibility / gating | NOT_RUN |
| Completion preserves history | NOT_RUN |
| Return access same project | NOT_RUN |
| Revoked/expired token fails safe | NOT_RUN |
| Credit not shown as BLDR purchase | NOT_RUN |
| BLDR nav does not auto-purchase | NOT_RUN |

## Staging SPA / API note

Current staging deploy (`34d9afa`) supports Foundation client routes for **prior** integrations. Automated E2E portal proof requires the post-run **`public_token`** from a journey executed on **`e907a6331`** API with persistence ON (staging Supabase).

## Browser errors

None captured — manual portal pass not executed this sprint.
