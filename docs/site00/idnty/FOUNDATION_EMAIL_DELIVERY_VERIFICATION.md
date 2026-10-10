# Foundation email delivery verification

## Current state (PR #1574 lineage on launch branch)

- Event map + template manifest under `shared/site00-digital-foundation/communications/`.
- `enqueueCommunicationsForEvent` in `api/_lib/digitalFoundation/communications/dispatch.ts`:
  - Default **DRY_RUN** when `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` / related flags are off.
  - Send intents stored in **memory** (`memoryStore.sendIntents`).
- Founder **Communications Command** UI route added (preview/admin).
- **No delivery worker** calling Resend/SendGrid/etc. in this path for DF V2 comms.

## Tests

- `tests/digitalFoundationCommunications.test.ts` — intent creation, idempotency — **PASS** (no provider).

## Gate B transactional events (required)

WELCOME, INTAKE RECEIVED, QUOTE READY, PAYMENT CONFIRMED, PROJECT ACTIVATED, NEW PROJECT MESSAGE, APPROVAL REQUESTED, CLIENT RESPONSE RECEIVED, FOUNDATION COMPLETE — **none** proven to a real test inbox.

## Checklist

| Item | Status |
| --- | --- |
| Durable send intent table | **MISSING** (memory) |
| Provider adapter | **MISSING** for DF V2 dispatch |
| Platform email infra reuse | **UNVERIFIED** — search shows separate legacy paths; not wired in dispatch |
| Duplicate suppression | PASS (idempotency keys, tests) |
| Marketing sends | **DISABLED** (flags off) |
| SPF/DKIM authentication | **UNVERIFIED** |

## Result

**FAIL** — cannot claim transactional email delivery for launch.
