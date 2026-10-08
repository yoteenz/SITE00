# SITE 00 platform economics

Version `1.0.0`. This is the commercial foundation. It does not move money, collect fees, or publish terms.

Legal language in this system is a placeholder. `LEGAL_REVIEW_REQUIRED` stays on until counsel approves it. Accounting treatment is a record set for a later professional review, not a tax position.

## Business model

SITE 00 can be paid in more than one way. Those ways stay separate:

| Revenue type | What it is |
|---|---|
| `BUILD_FEE` | One-time or milestone production compensation. This is the build investment. |
| `PLATFORM_USAGE_FEE` | Participation in eligible commerce processed through covered SITE 00 infrastructure. |
| `RECURRING_SERVICE_FEE` | Hosting, maintenance, support, analytics, content operations, or managed integrations, when contracted. |
| `CUSTOM_COMMERCIAL_FEE` | A founder-defined enterprise arrangement. |

A project can have a build fee and no platform fee. A project can keep a platform fee after the build scope is reduced, if covered infrastructure remains. Hypothetical future transaction fees are not added to the upfront build total.

## Platform fee doctrine

The default rate lives in `src/studioos/platform-economics/rate.ts` as integer basis points. The initial value is 200 basis points, displayed as `2.00%`. Application code does not multiply by a float and does not repeat that rate.

A project agreement may carry a different rate. Leaving the default requires a founder approval record: author, reason, and timestamp. Build-tier rate rules (simple / advanced / custom) are reserved and not activated.

```
PLATFORM_FEE = ELIGIBLE_TRANSACTION_AMOUNT × PROJECT_PLATFORM_FEE_RATE
```

Money is integer minor units. Rounding is half away from zero, using integer remainder against the 10,000 basis-point scale. Each agreement, transaction, and payout stores its own currency. Totals refuse to mix currencies. There is no implicit conversion and no assumption that the currency is USD.

## Eligible transaction volume

Eligible volume is successfully collected customer commerce processed through covered SITE 00 infrastructure.

Covered types: ecommerce, booking, membership, subscription, marketplace, service payment, invoice payment, portal payment, world commerce, and other approved commerce.

Default exclusions: taxes, refunds, reversed payments, chargebacks, gratuities, government fees, regulatory fees, and approved third-party pass-through charges.

Processor-fee treatment is `UNSPECIFIED` until the agreement sets `EXCLUDED` or `INCLUDED`. Unspecified processor fees are recorded and are not subtracted.

Collected funds are the default basis. An invoiced amount is not collected. An agreement can switch the basis to invoiced explicitly.

A subscription accrues on each successful collection, not once at signup.

Offline payments follow the agreement: not tracked, manually reported, fee applicable, or fee not applicable. Untracked offline payments are not invented.

A project with no covered transaction capability has `platformFeeApplicable = false`. No percentage fee is fabricated. A separate recurring service fee can still exist if it is contracted.

## Refunds and disputes

The default refund treatment reverses the platform fee in proportion to the eligible amount refunded. A refund that clears the remaining eligible amount reverses the remaining accrued fee exactly, so a full refund can return net accrual to zero. The original accrual entry is not edited. The reversal is a new ledger entry.

Chargebacks record `OPEN`, `WON`, and `LOST`. The default reverses the fee when the dispute is lost. An open dispute stays visible before that. Nothing is dropped from the ledger to hide a loss.

## Project agreement

`ProjectPlatformAgreement` is the commercial record for one project. Status moves in order:

`DRAFT` → `FOUNDER_REVIEW` → `OFFERED` → `CLIENT_REVIEW` → `ACCEPTED` → `ACTIVE`

From there it can be `SUSPENDED`, `ENDED`, or `SUPERSEDED`.

Acceptance requires a client acceptance timestamp. Activation requires both founder approval and client acceptance, and it only follows `ACCEPTED`. Saving a Builder configuration does not accept the agreement. Creating a quote does not activate it.

Every agreement stores the economics version, the commercial-terms version, and a calculation-config snapshot. Superseding an agreement writes a new row. Older ledger entries keep the snapshot they were calculated with.

The payee is a beneficiary record (`SITE00_PLATFORM`, `FOUNDING_ENTITY`, or `APPROVED_REVENUE_PARTICIPANT`) with a legal-entity reference. Bank account numbers are rejected. The founder's personal bank account is not stored.

## Ledger, payouts, and statements

The ledger is append-only. Events include capture, accrual, adjustment, refund, chargeback, reversal, payout created, and manual adjustment. Manual adjustments require a reason, an author, a timestamp, and a linked entry.

Processor events are idempotent. Replaying the same provider event returns the original entries and does not accrue twice.

Accrual is per collected transaction. Payout batches group a period (`WEEKLY`, `SEMI_MONTHLY`, `MONTHLY`, or `CUSTOM`). A batch in this version is `DRAFT`, with `paidAt` empty and `liveMovement` false. Completing a payout is refused.

Statements default to a month. A statement stores the ledger entry ids and a snapshot hash so it can be rebuilt. Historical statements are not rewritten when rules change.

Given one source transaction, the explainer returns gross, exclusions, eligible amount, rate, platform fee, adjustments, and net.

## Who can read it

`SITE00_FOUNDER` and `SITE00_AUTHORIZED_FINANCE` can read the portfolio. `CLIENT_OWNER` and `CLIENT_AUTHORIZED_FINANCE` can read only their own organization. A client read of another client's project is denied.

## Builder, Blueprint, and estimate

The estimator still prices the build. Platform usage is a separate field on the client estimate and on the Builder estimate view. Commerce, membership, booking, payments, and marketplace features mark the project transaction-capable and disclose the default rate, plus "Learn how this works," before a quote exists.

The Blueprint carries commerce, platform, platform usage, payment processing, and ongoing support as their own lines. Saved variants keep the build range, the platform configuration, and the ongoing-service configuration independently. Cutting the build range does not remove platform usage while covered infrastructure remains.

Internal surfaces, not new root navigation:

- Project: Studio OS → Project → Commercial → Platform economics, at `/admin/site00/projects/:projectId/commercial`
- Portfolio: Studio OS → Operations / Finance → Platform revenue, at `/admin/site00/finance/platform`

The portfolio page runs the fixture harness. It does not present those fixtures as live revenue.

## AIO

AIO is the first consumer. It does not own a second fee formula. An AIO service collection is ingested by the shared books with consumer `AIO`.

Future AIO location, not built as visual authority in this version:

AIO Office → More → Billing → Platform / revenue share

Views reserved there: overview, transactions, accruals, payouts, adjustments, statements.

AIO Office → Reports → Financial / revenue may later aggregate fees. Reports do not own the ledger.

## Processor boundary

`PlatformPaymentProvider` is processor-neutral. The Stripe Connect adapter implements that boundary and refuses every call that would create an account, take a payment, split funds, transfer, or pay out. Fee math on the adapter calls the same quote function as the ledger. No Stripe SDK client is constructed.

## Activation boundary

This version does not:

- create production connected accounts
- route live customer money
- send payouts
- change existing live payment flows
- collect platform fees
- change production processor settings
- publish public terms

Draft product copy is returned by `draftPlatformCopy()` with `published: false`. It is shown on the internal platform-revenue page and marked draft.

## Where the code lives

| Piece | Path |
|---|---|
| Version and commercial-terms draft id | `src/studioos/platform-economics/version.ts` |
| Default rate | `src/studioos/platform-economics/rate.ts` |
| Minor-unit money | `src/studioos/platform-economics/money.ts` |
| Agreement, ledger, accrual, reversal, payout, statement | `src/studioos/platform-economics/books.ts` |
| Eligibility and fee formula | `src/studioos/platform-economics/eligibility.ts` |
| Permissions | `src/studioos/platform-economics/permissions.ts` |
| Processor boundary | `src/studioos/platform-economics/processor.ts` |
| Stripe Connect stub | `src/studioos/platform-economics/stripeConnect.ts` |
| Blueprint, estimate, Builder, budget, public draft | `src/studioos/platform-economics/disclosure.ts` |
| AIO adapter | `src/studioos/platform-economics/aio.ts` |
| Fixture harness | `src/studioos/platform-economics/harness.ts` |
