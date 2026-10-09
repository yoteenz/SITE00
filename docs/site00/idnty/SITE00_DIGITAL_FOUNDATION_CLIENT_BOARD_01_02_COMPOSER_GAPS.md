# Digital Foundation — Composer contract gap report (Board 01 + Board 02 client)

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V1-OPUS-CLIENT-ENTRY-INTAKE-COMMERCE-VISUAL-IMPLEMENTATION1`
**From:** Opus (presentation). **To:** Composer (backend, persistence, engines, payments).
**Scope of the evidence:**

- Composer's contracts as they stand on `main` @ `d76723b0`: `api/site00/digital-foundation-artifact.ts`, `api/_lib/digitalFoundation/*`, `shared/site00-digital-foundation/*`.
- The live browser QA in `df-client-board-01-02-qa/`, which runs the real handler on the memory store.

No backend file was changed in this sprint. Every gap below is either worked around **in the presentation layer only**, or surfaced to the client truthfully. None is papered over.

## Severity legend

| Severity | Meaning |
|---|---|
| **P0** | Money or data integrity. Fix before any real client pays |
| **P1** | Client-visible correctness or a founder workflow that cannot be completed in the UI |
| **P2** | Missing field or affordance. The board shows something the contract can't back |
| **INFO** | Behaviour to know about; no change required |

## Gaps

| ID | Sev | Gap | Evidence | Client-side handling today | Requested change |
|---|---|---|---|---|---|
| CG-01 | **P0** | **A second Stripe Checkout session can be opened while one is pending.** `assessQuotePayability` doesn't look at `payment_state`, so `start-checkout` succeeds again on `CHECKOUT_PENDING`. If both sessions are paid, `confirmPaymentFromWebhook` silently ignores the second payment: no refund, no event | `service.ts` `createCheckoutSession`; `quoteReadiness.ts`. QA Q25 opens a session, and a new one can be created | P05 **PAYMENT PENDING** makes "CHECK PAYMENT STATUS" the primary action. Reopening checkout needs an explicit "I DIDN'T FINISH CHECKOUT" confirmation | Reuse the open session's URL (or expire it) before creating another. Record and alert on a duplicate `checkout.session.completed` for an already-PAID artifact |
| CG-02 | **P0** | **Saves are acknowledged before they are durable.** `schedulePersist` is fire-and-forget: the API returns 200 and a Supabase failure is only logged. On serverless, the write can be lost after the response | `service.ts` `schedulePersist` | P02/P03 show **SAVED** only after the server's 200. That is the strongest truth the contract offers, and it is not a durability guarantee | Await `persistArtifactGraph` in mutating actions (or return a `persisted` flag), and fail the request when persistence fails |
| CG-03 | **P0** | **The founder quote adjustment after acceptance is non-atomic.** `applyManualQuoteAdjustment` writes the new quote version and points the artifact at it, *then* throws `INVALID_ARTIFACT_TRANSITION:AWAITING_PAYMENT->QUOTE_READY`. The founder sees an error; the change is live | QA Q29: the error came back, v2 ($550) became current, acceptance stayed on v1 | Version mismatch puts P05 in **SCOPE CHANGED**: the client must re-accept, then checkout uses the new price (verified) | Allow `AWAITING_PAYMENT → QUOTE_READY` (or validate before mutating). Return the new quote |
| CG-04 | P1 | **The readiness clock starts at payment.** `confirmPaymentFromWebhook` sets `readiness_satisfied_at = production_started_at = now` even while `missing_requirements` and open client actions exist. `timeline_readiness.readiness_satisfied` is therefore true immediately after payment | `service.ts` `confirmPaymentFromWebhook`; QA Q21 (`needs_you=3` yet a production start is stamped) | P06 never treats `readiness_satisfied` alone as "in production". **PRODUCTION READY** needs zero open actions, zero missing requirements and a start stamp; otherwise it shows **AWAITING REQUIRED INFORMATION / CLIENT AUTHORIZATION** and "ONCE WE HAVE WHAT WE NEED" | Stamp readiness only when `missing_requirements` is empty and no client action is open (doctrine §03, disclosure 3) |
| CG-05 | P1 | **Business-rule errors return HTTP 500.** Only messages containing `NOT_FOUND` / `REQUIRED` are mapped. `MANUAL_REVIEW_PENDING`, `QUOTE_LOCKED`, `QUOTE_EXPIRED` and `PAYMENT_NOT_CONFIGURED` look like server crashes | `digital-foundation-artifact.ts` catch block; QA Q17 (`500 MANUAL_REVIEW_PENDING`) | The client reads the error code, not the status, and shows client copy | 409/422 for business rules, 503 for `PAYMENT_NOT_CONFIGURED` |
| CG-06 | P1 | **`update-intake` returns a stale payload.** The response object builds `payload` before it calls `updateIntake` | `digital-foundation-artifact.ts` `case 'update-intake'` | The client ignores the response payload and re-reads | Compute `payload` after the update |
| CG-07 | P1 | **The founder admin UI cannot confirm pricing.** `quote-commercial-ready` exists in `api/admin/site00-foundation.ts`, but nothing in `src/` calls it. P05 **AWAITING FOUNDER PRICING** clears only through that action | `grep quote-commercial-ready src/` → none | The client shows the waiting state and "CHECK FOR UPDATES" | Add "CONFIRM PRICING" (and manual adjustment) to the founder project view (Board 05 / P14) |
| CG-08 | P1 | **No re-quote path for an accepted quote that expires.** `update-quote` throws `QUOTE_LOCKED`, and the founder path hits CG-03 | `service.ts` `updateQuoteSelections` | P05 **QUOTE EXPIRED** (accepted) says SITE 00 must reissue it. Unaccepted expired quotes refresh from P04 with the same selections | An un-accept / reissue action |
| CG-09 | P1 | **No reopen-intake action.** Completing again from `QUOTE_READY` throws, so there is no "EDIT MY NEEDS" after P04. `update-intake` *is* accepted after the quote exists, but it does not rebuild the quote, so the intake and quote can silently diverge | audit F-15; `service.ts` `updateIntake` / `completeIntake` | P02/P03 are not offered once the quote exists. Add-ons stay editable on P04 | `reopen-intake` that supersedes the quote. Reject `update-intake` after completion unless the intake is reopened |
| CG-10 | P2 | **The Team-of-2 mailbox count over-counts.** `NEED_MULTI_MAILBOX` adds `max(2, team_size − 1)` additional mailboxes, so 2 people get 2 extra mailboxes (3 total) | QA Q10 (team 2 → `ADDITIONAL_MAILBOX×2`) | The client can lower the quantity on P04 with the stepper | Use `team_size − 1` |
| CG-11 | P2 | **No `business_location` field.** The P02 board shows BUSINESS LOCATION | `types.ts` `DigitalFoundationIntake`; audit D-09 | The field is **omitted**, not faked (recorded as a visual mismatch) | Add `business_location` (city / region) or confirm removal |
| CG-12 | P2 | **No industry vocabulary.** `industry` is free text | audit D-09 | P02 offers a 10-item uppercase list (pending founder approval). An existing custom value is preserved | Confirm the list or provide an enum |
| CG-13 | P2 | **No activation acknowledgment.** There is no `activation_acknowledged_at`, so "show P06 once" cannot be server state | audit F-19 | A per-browser flag (`localStorage`, wrapped in try/catch) decides whether the link opens on P06 or the overview. Failure only re-shows P06 | `acknowledge-activation` action and field |
| CG-14 | P2 | **No notifications.** The board's "CONFIRMATION SENT" is not true today | audit F-26 | The badge reads **PORTAL READY** | Notification templates (DF-A14) |
| CG-15 | P2 | **No terms document**; only `terms_version = df-terms-v1` | audit F-11 | P05 renders the three canonical disclosures. No terms link is shown | A terms document plus its version |
| CG-16 | P2 | **Cancel is indistinguishable from pending on the server.** `payment_state` stays `CHECKOUT_PENDING` until the `checkout.session.expired` webhook | `service.ts` `recordCheckoutExpired` | `?checkout=cancel` drives **PAYMENT CANCELLED**; without it the link shows **PAYMENT PENDING** | Record a cancel return (or expire the session on cancel) |
| CG-17 | INFO | **Flags default ON.** `SITE00_DIGITAL_FOUNDATION_*` flags default to enabled and are not set in CI or production env. Merging this branch exposes the new client UI on production for any valid token | `featureFlags.ts` `envTruthy(..., true)` | The client honours `VITE_SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1=0` with an "unavailable" panel. No new flag was added | Founder + Composer decide exposure **before merge** (e.g. set `…ARTIFACT_V1=0` in production env) |
| CG-18 | INFO | **Opening the payload is a side effect.** `GET payload` marks INVITED → OPENED, so a founder preview counts as an open | `getClientArtifactPayloadByToken` → `openArtifactByToken` | — | A non-mutating preview read (audit F-12) |
| CG-19 | INFO | **Simulated checkout outside production.** Without a Stripe key, non-production returns `success_url&simulated_checkout=1` and never marks PAID | `stripeHostedCheckout.ts` | P06 shows "TEST CHECKOUT — NO PAYMENT WAS TAKEN" and never claims success | None. This is the correct behaviour |
| CG-20 | INFO | **The RECOMMENDATION surface is unreachable.** `completeIntake` jumps to `QUOTE_READY` | `service.ts` `completeIntake` | P04 handles both surfaces | None |

## Verified as correct (no gap)

- **Quote and timeline binding.** Every P04/P05 price, total and range comes from `payload.quote`. Add-on unit prices come from the server catalog. Totals are never computed in the browser (QA Q10, Q12, Q13).
- **Manual-review gate.** The server refuses checkout with `MANUAL_REVIEW_PENDING` until `markQuoteCommerciallyReady` (QA Q17, Q18).
- **Payment truth.** PAID comes only from the webhook path. A redirect alone leaves `CHECKOUT_PENDING` (QA Q19–Q21).
- **Client projection.** No `events`, no `referral_source`, no internal labels (QA Q23 and unit test).
- **Dependency check.** `remove-addon` is used for single removals. `ADDON_REQUIRED` is surfaced (QA Q14, Q15).
