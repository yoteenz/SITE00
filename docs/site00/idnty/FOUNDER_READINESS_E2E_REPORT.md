# Digital Foundation — Founder Readiness E2E (P0.SITE00.IDNTY.FOUNDER-READINESS-E2E1)

**Repository:** yoteenz/SITE00  
**Branch:** `cursor/idnty-founder-readiness-e2e-be3b` (draft — founder approval required before merge/deploy)

## Executive gate

| Gate | Status |
| --- | --- |
| Engineering: founder test workspace + Resend adapter + FNDATN dispatch bridge | **Implemented (this PR)** |
| Anthony invitation | **NOT APPROVED — BLOCKED** |
| Production email to real clients | **BLOCKED** |
| Live Stripe charges | **BLOCKED** |
| DNS changes | **NOT PERFORMED** |

## A. READY (verified in repo / tests)

- FNDATN-01 pack: 7 emails, 14 authorities (`tests/fndatn01.test.ts`).
- Correspondence Studio pack chip resolves FNDATN vs R4 versions (`tests/fndatn01.test.ts`, #1640).
- Digital Foundation client intake, quote, simulated payment, portal — existing vitest coverage (`tests/digitalFoundation*.test.ts`).
- **Founder route:** `/admin/site00/foundation-readiness` — synthetic client, journey, email timeline, dispatch controls.
- **Resend adapter:** `api/_lib/digitalFoundation/communications/resendAdapter.ts` (server-only; ACCEPTED on API success — not DELIVERED).
- **Delivery worker:** allowlist + synthetic guard + FNDATN HTML render (`deliveryWorker.ts`, `fndatnTemplateBridge.ts`).
- **Send intent states extended:** DRY_RUN, SIMULATED, QUEUED, ACCEPTED, FAILED, … (`communications/types.ts`).
- **Reminder eligibility** pure functions + tests (`reminderEligibility.ts`) — scheduler wiring still required on Railway.
- Default production comms map remains **disabled** (`eventMap.ts`); FNDATN test map only when `SITE00_DF_FOUNDER_TEST_MODE=1` + `SYNTH ·` business name.

## B. NEEDS FOUNDER

1. **Railway API env:** `SITE00_DF_FOUNDER_TEST_MODE=1`
2. **Allowlist:** `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST=your-inbox@domain.com` (comma-separated)
3. **Optional send:** `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1` when ready to queue provider sends (still allowlist-gated)
4. **Resend:** `RESEND_API_KEY`, `SITE00_DF_TRANSACTIONAL_FROM`, `SITE00_DF_TRANSACTIONAL_REPLY_TO`, verify sending domain in Resend (separate from cPanel hello@ mailbox)
5. **DNS (approval only):** DKIM for site00.com; optional transactional subdomain — see founder action card below
6. **Stripe TEST:** complete hosted checkout once in test workspace; confirm webhook endpoint on staging API
7. **Supabase persistence:** `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` + migrations before any real client link survives restart

## Activation2 (P0.SITE00.IDNTY.FOUNDER-READINESS-ACTIVATION2)

| Check | Result (2026-10-14) |
| --- | --- |
| Railway `/api/health` gitCommit | `286dba76249c` (**main** — PR #1642 **not** merged) |
| `digitalFoundation.founderReadiness` on health | **Absent** until #1642 deploys |
| Production Resend key (founder) | Confirmed set on Railway — **not exercised** this sprint |
| First test email sent | **NO** — requires merge, env, UI approve + checkbox |

**New in Activation2 branch:** `prepare-test-invitation` API, founder-approval gate on `dispatch-test-email`, Resend webhook route `/api/site00/digital-foundation-resend-webhook`, `/api/health` env-presence block under `digitalFoundation.founderReadiness`, dispatch fix (synthetic detection uses lead `SYNTH ·` name).

## C. BLOCKED

- **Provider-confirmed DELIVERED** — webhook handler added; founder must register URL + `RESEND_WEBHOOK_SECRET` on Railway.
- **Reminder cron** — eligibility tested; no production scheduler job added.
- **Full 9-stage browser E2E** — requires founder credentials + Railway deploy of this branch.
- **Anthony** — do not invite until gates above are green.

## Founder action card — email authentication (no auto DNS)

| Item | Action | Composer automated? |
| --- | --- | --- |
| Human mailbox hello@site00.com | Already working (Roundcube) | N/A |
| Transactional sends | Resend + separate from MX | Configure in Resend dashboard after founder adds API key |
| DKIM (cPanel) | Verify/generate DKIM in GoDaddy cPanel; publish TXT | **No** — founder approval |
| SPF | Do **not** add second SPF TXT; use subdomain for transactional if needed | Propose records only |
| DMARC | Current p=quarantine — review with DNS expert before changes | **No** |
| Gmail “Show Original” | After first allowlisted test send, paste Authentication-Results | Founder |

## Technical appendix

- **Workspace API:** `GET ?action=readiness-report`, `POST create-test-client`, `advance-test-intake`, `advance-test-quote`, `dispatch-test-email`, `reset-test-data`
- **Prior audit:** `docs/site00/idnty/FOUNDATION_EMAIL_DELIVERY_VERIFICATION.md`, `ANTHONY_LAUNCH_READINESS_REPORT.md` — still largely accurate; this sprint adds Resend path + UI.
