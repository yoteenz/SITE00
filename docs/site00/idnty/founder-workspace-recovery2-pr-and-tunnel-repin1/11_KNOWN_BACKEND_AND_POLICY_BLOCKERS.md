# 11 — Known backend and policy blockers

From `config/referralPolicy.ts` and overlay registry flags:

| Capability | Status |
| --- | --- |
| AIO partner auto-active | **false** (`AIO_PARTNER_DISPLAY.autoActive`) |
| Commission execution | **EXTERNAL_MANUAL_RECORD_ONLY** |
| Payout execution | Policy-gated; overlays mark `blockedByPolicy` / `blockedByBackend` |
| Partner / ledger backends | Not fully operational — UI complete, actions blocked |
| Verified referral URL / print ready | Not production-ready |
| Physical card print | `RO-10` etc. blocked by policy |

**This sprint did not:** enable Stripe, run test payouts, or change referral policy.
