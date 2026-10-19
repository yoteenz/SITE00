# Regression test report

**Integration SHA:** `255576b5`  
**Date:** 2026-10-19

| Command | Result |
| --- | --- |
| `npm test -- tests/dfFormControlConsolidatedA.test.ts tests/dfFormControlPhase1.test.ts tests/idntySelectPhase2.test.ts tests/digitalFoundationCommerce.test.ts tests/digitalFoundationCriticalRepair.test.ts tests/digitalFoundationPersistenceErrors.test.ts tests/founderReadinessE2e.test.ts` | **PASS** (68 tests) |
| `SITE00_DF_PERSISTENCE_TEST=1 SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1 npm test -- tests/digitalFoundationPersistence.test.ts` | **PASS** (2 tests) |
| `npm run build` (with `VITE_DF_CUSTOM_INDUSTRY_SELECT=1`) | **PASS** — manifest `site00-v272-255576b` |
| `node scripts/staging/verify-form-control-staging-parity.mjs` | **PASS** asset routing; **FAIL** commit parity (expected until redeploy) |
| `node scripts/staging/verify-form-control-responsive-local.mjs` | **PASS** (0 overflow) |

## Not run

- Live staging browser intake journey (blocked)
- Physical iPhone Safari
- VoiceOver
