# Automated E2E live run report

**Sprint:** `P0.SITE00.IDNTY.PHASE3B.STAGING-DEPLOYMENT-AND-LIVE-FOUNDER-E2E-ACTIVATION1`  
**Status:** **NOT RUN** — blocked by staging deploy SHA mismatch and missing founder session

## Authorized tester

`kateenaarmstrong@gmail.com` (sole allowlisted recipient per implementation)

## Preconditions vs actual

| Precondition | Required | Actual (2026-10-24) |
| --- | --- | --- |
| API at integration SHA | `e907a6331` | **`34d9afa`** |
| SPA includes email journey desk | Yes | **No** (route not in live bundle) |
| Transactional send | OFF until preflight, then ON for run | **OFF** (correct for safety pre-run) |
| Founder admin session | Required for POST | **Not available to agent** |
| Resend live dispatch | Required for Gate V | **Not attempted** |

## Live run identifiers

| Field | Value |
| --- | --- |
| TEST_RUN_ID | — |
| TEST_PROJECT_ID | — |
| TEST_CLIENT_ROUTE | — |
| PROJECT_STATE_HISTORY | — |
| QUOTE_ID | — |
| CHECKOUT_TEST_RESULT | NOT_RUN |
| WEBHOOK_VERIFICATION_RESULT | NOT_RUN |
| EMAIL_INTENT_IDS | — |
| RESEND_MESSAGE_IDS | — |
| EMAIL_DELIVERY_EVENTS | — |
| RUNBOOK_TASK_RESULTS | — |
| FOUNDATION_COMPLETION_STATE | — |
| CREDIT_RECORD | — |
| BLDR_HANDOFF_STATE | — |

## What was validated instead (non-live)

| Evidence | Result |
| --- | --- |
| Unit E2E runner (`tests/automatedEmailJourneyRunner.test.ts`) | PASS on branch `e907a6331` (mocked Resend + stripe sim) |
| Staging health gate | PASS on **current** deploy (legacy SHA) |
| Staging API auth on journey POST | PASS (`401` / `MISSING_TOKEN` without cookie — not an open endpoint) |

## Intended live procedure (after deploy)

1. Confirm allowlist = `kateenaarmstrong@gmail.com` only on **reliable-creation**.
2. Set `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1` on API only for the run window.
3. Sign in to carefree-luck as founder admin.
4. Open `/admin/site00/foundation-email-journey`.
5. Authorize once → **Start automated journey**.
6. Wait for run status **COMPLETED** (or capture failed stage + error).
7. Refresh gallery; record provider message IDs and delivery states.
8. Open client portal via masked link from run summary (`/foundation/:token`).
9. **Post-run:** set `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=0`; confirm health `transactionalSendFlag: false`.

## Honest outcome

**No live Resend messages were sent during this sprint.** Inbox review (Gate W) and release approval (Gate X) remain with the founder after a successful live run.
