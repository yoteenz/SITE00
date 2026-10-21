# Email event matrix (Digital Foundation)

**Send default:** intents are created as `DRY_RUN` unless `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1` and purpose flags allow.  
**Synthetic clients:** FNDATN test template map when `SITE00_DF_FOUNDER_TEST_MODE=1` + `SYNTH ·` business prefix.  
**Allowlist:** `isRecipientAllowedForFounderTestSend` — required for real Resend dispatch.

| Lifecycle event | Typical template phase | Recipient | Dedupe key includes | Live staging (2026-10-21) |
| --- | --- | --- | --- | --- |
| `ARTIFACT_CREATED` | Invitation | Client email | artifact + event + template | Intent only (send OFF) |
| `INTAKE_COMPLETED` | Intake complete | Client | artifact + event + template | Intent only |
| `QUOTE_CREATED` / quote ready | Quote / recommendation | Client | + quote_version | Intent only |
| Acceptance / checkout | Payment link | Client | quote_version | After accept + commercial ready |
| Payment confirmed | Receipt | Client | stripe event id (webhook path) | **NOT_TESTED** live |
| Project activated | Activation | Client | milestone | **NOT_TESTED** live |
| Client action required | Needs you | Client | request_id | **NOT_TESTED** live |
| Foundation complete | Completion | Client | completion timestamp | **NOT_TESTED** live |
| Build opportunity | Handoff | Client | handoff id | **NOT_TESTED** live |

## Founder dispatch controls (existing admin API)

| Action | Purpose |
| --- | --- |
| `POST create-test-client` | Creates synthetic lead + artifact + queues invitation intent |
| `GET prepare-test-invitation?intent_id=` | Preview HTML + blockers (no send) |
| `POST dispatch-test-email` | Requires `founder_approved_send: true` + allowlist + send flag |

## Idempotency

`buildSendIdempotencyKey` — duplicate lifecycle events reuse same intent row (no duplicate queue entries).

## Gate I / J

| Gate | Status |
| --- | --- |
| I — delivery to authorized tester | **BLOCKED** (send flag off; founder must authorize address) |
| J — order + dedupe | PASS (unit tests); live **NOT_TESTED**
