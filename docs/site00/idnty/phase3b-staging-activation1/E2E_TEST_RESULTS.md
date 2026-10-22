# E2E test results — Phase 3B

**Test run ID:** none executed on live staging (founder session required)  
**Regression run ID:** `IDNTY-E2E-AGENT-20261021-LOCAL`

## Automated (agent VM)

| Suite | Result |
| --- | --- |
| `node scripts/staging/df-staging-health-gate.mjs` | **PASS** |
| `npm test -- tests/digitalFoundation*` | **202 pass**, 2 fail (tunnel + review iframe env), 1 skip |
| `npm test -- tests/digitalFoundationFounderTestMode.test.ts` | PASS |
| `npm test -- tests/stagingEnvConfig.test.ts` | PASS |
| Playwright `df-staging-screenshot.mjs` | Sign-in + review captures saved |

## Live staging journey

| Step | Result |
| --- | --- |
| Create test client on staging API | **NOT_TESTED** (401 without founder token) |
| Invitation delivered | **BLOCKED** (send flag off) |
| Intake persist refresh | **NOT_TESTED** |
| Stripe test payment | **NOT_TESTED** |
| Webhook | **NOT_TESTED** |
| Full founder runbook | **NOT_TESTED** |
| Completion + portal reopen | **NOT_TESTED** |

## Regression delta vs Phase 3 report

| Area | Delta |
| --- | --- |
| Client board unit tests | Unchanged pass count |
| Staging RLS | **Improved** — messages RLS migration applied on staging |
| Health gate script | **New** |
| Stripe key detection | **New** rk_test/rk_live support (needs API redeploy) |

## Evidence directory

`/opt/cursor/artifacts/phase3b-staging/`

- `staging-spa-sign-in-390.png`  
- `staging-foundation-review-390.png`  
- `sign-in-response.html` (curl fallback)
