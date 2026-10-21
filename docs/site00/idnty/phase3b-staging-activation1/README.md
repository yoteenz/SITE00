# Phase 3B — Staging activation & founder tester journey

**Sprint:** `P0.SITE00.IDNTY.PHASE3B.COMPOSER-STAGING-ACTIVATION-FOUNDER-TESTER-JOURNEY-AND-RELEASE-GATE1`  
**Depends on:** draft PR **#1681** (`cursor/idnty-phase3-composer-integration-b71a`) — **do not merge** until Gate X  
**Branch:** `cursor/idnty-phase3b-staging-activation-b71a`

| Document | Purpose |
| --- | --- |
| [STAGING_READINESS.md](./STAGING_READINESS.md) | Live stack inventory + health gate |
| [ENVIRONMENT_AUDIT.md](./ENVIRONMENT_AUDIT.md) | Env contract (names only, no values) |
| [DATABASE_RLS_AUDIT.md](./DATABASE_RLS_AUDIT.md) | Staging Supabase schema + RLS |
| [EMAIL_EVENT_MATRIX.md](./EMAIL_EVENT_MATRIX.md) | Lifecycle → template → dedupe |
| [STRIPE_TEST_PROOF.md](./STRIPE_TEST_PROOF.md) | Payment chain + blockers |
| [FOUNDER_TESTER_JOURNEY.md](./FOUNDER_TESTER_JOURNEY.md) | Plain-English tester steps |
| [CLIENT_PORTAL_VALIDATION.md](./CLIENT_PORTAL_VALIDATION.md) | Four-tab portal gates |
| [OPERATIONS_RUNBOOK_TEST.md](./OPERATIONS_RUNBOOK_TEST.md) | Runbook + simulation boundary |
| [COMPLETION_RECORDS_TEST.md](./COMPLETION_RECORDS_TEST.md) | Completion + downloads |
| [CREDIT_AND_HANDOFF_STATUS.md](./CREDIT_AND_HANDOFF_STATUS.md) | Credit + builder handoff |
| [E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md) | What ran vs blocked |
| [RELEASE_GATE_MATRIX.md](./RELEASE_GATE_MATRIX.md) | Gates A–X |
| [FOUNDER_REVIEW_PACK.md](./FOUNDER_REVIEW_PACK.md) | Review entry point |
| [NEXT_ACTIONS.md](./NEXT_ACTIONS.md) | Founder-ordered unblock list |
| [PHASE3B_FINAL_REPORT.md](./PHASE3B_FINAL_REPORT.md) | Sprint §28 status block |

**Evidence:** `/opt/cursor/artifacts/phase3b-staging/` (Playwright captures + health JSON)

**Automation:** `node scripts/staging/df-staging-health-gate.mjs`
