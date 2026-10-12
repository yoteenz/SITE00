# FNDATN-01 — Data contracts

Every personalized value comes from the existing `DigitalFoundationArtifactPayload` (`shared/site00-digital-foundation/types.ts`). No new data model is introduced. When a required value is missing, the guard returns `eligible: false` with reasons, and the renderer refuses to render in send mode. Nothing is defaulted or invented.

Implementation: `shared/site00-correspondence-studio/fndatn01/contracts.ts` (`derive01` … `derive07`).

## Context

| Field | Rule |
| --- | --- |
| `siteOrigin` | Absolute `https://` origin. Any other value throws. |
| `now` | Valid date. Used for expiry, the reminder window, and the countdown `AS OF` time. |
| `timeZone`, `timeZoneLabel` | Used to format every timestamp. |

## Common fields (all emails)

| Field | Source |
| --- | --- |
| `firstName` | First word of `lead.contact_name`, falling back to `artifact.intake.contact_name`. `null` when absent; copy then omits the name. |
| `clientName` | Contact name, falling back to business name. |
| `foundationUrl` | `siteOrigin + digitalFoundationClientPath(public_token)` |
| `intakeUrl` | `siteOrigin + digitalFoundationClientIntakePath(public_token)` |

Base checks that block every email: no `public_token` (`NO_PUBLIC_TOKEN`) and an archived artifact (`ARTIFACT_ARCHIVED`).

<a id="email-01"></a>
## 01 — Invitation

| Field | Source |
| --- | --- |
| CTA | `intakeUrl` |
| Blocks | `FOUNDER_SEND_NOT_AUTHORIZED`, `INTAKE_ALREADY_SUBMITTED` |

<a id="email-02"></a>
## 02 — Intake Received

| Field | Source |
| --- | --- |
| `receivedAt` | Latest persisted `INTAKE_COMPLETED` event `created_at` |
| `reference` | `artifact.artifact_id` |
| Blocks | `INTAKE_NOT_SUBMITTED`, `NO_PERSISTED_INTAKE_COMPLETED_EVENT` |

<a id="email-03"></a>
## 03 — Recommendation & Quote

| Field | Source |
| --- | --- |
| `recommendation` | `recommendation.title`; `null` when absent and the card omits the RECOMMENDATION row (no default title) |
| `quoteAmount` | `quote.subtotal_minor` and `quote.currency` |
| `validUntil` | `quote.expires_at` |
| `addons` | `quote.selected_addons`, labelled through `findAddon` |
| `scope` | `FNDATN01_BASE_SCOPE` (the base Digital Foundation scope) |
| Blocks | `NO_QUOTE`, `QUOTE_NOT_FOUNDER_APPROVED`, `QUOTE_STATUS_*`, `QUOTE_HAS_NO_EXPIRATION`, `QUOTE_EXPIRED`, `QUOTE_HAS_NO_SUBTOTAL`, `ALREADY_PAID` |

<a id="email-04"></a>
## 04 — Payment Received

| Field | Source |
| --- | --- |
| `amount` | Paid quote subtotal and currency |
| `paidAt` | Latest `PAYMENT_CONFIRMED` event `created_at` |
| `reference` | `quote.quote_id` |
| `method` | `PAYMENT_CONFIRMED.payload.method_label` when present; otherwise the row is omitted |
| `activation` | `active` only with a `PROJECT_ACTIVATED` event and `project_state` past `NOT_STARTED`; otherwise `pending` |
| Blocks | `PAYMENT_STATE_*`, `NO_PERSISTED_PAYMENT_CONFIRMED_EVENT`, `NO_PAID_QUOTE` |

<a id="email-05"></a>
## 05 — Foundation Complete

| Item | Stage | Value |
| --- | --- | --- |
| Domain | `02_DOMAIN` | `ownership_record.domain` |
| Email | `03_PROFESSIONAL_EMAIL` | `ownership_record.primary_mailbox` |
| Security | `04_DNS_SECURITY` | `ownership_record.security_status` or `dns_status` |
| Device | `05_DEVICE_SIGNATURE` | Stage complete |
| Records | `06_FINAL_VERIFICATION` | Ownership record plus a `FOUNDATION_VERIFIED` event |

An item is verified only when its stage is `COMPLETE` and its value is present. Blocks: `COMPLETION_NOT_VERIFIED`, `NO_OWNERSHIP_RECORD`, `NO_FOUNDATION_COMPLETED_EVENT`, and `<ITEM>_PENDING_VERIFICATION`.

<a id="email-06"></a>
## 06 — Resume Intake

| Field | Source |
| --- | --- |
| `savedAt` | `artifact.last_activity_at` |
| `steps` | Invitation (opened or sent), Intake (in progress), Recommendation (pending), Complete (pending). No payment step. |
| Blocks | `INTAKE_STATE_*`, `INTAKE_ALREADY_SUBMITTED`, `NO_SAVED_INTAKE`, `NO_LAST_ACTIVITY`, `REMINDER_DELAY_NOT_REACHED`, `REMINDER_ALREADY_SENT` |

<a id="email-07"></a>
## 07 — Quote Expiry

| Field | Source |
| --- | --- |
| `quoteAmount` | Quote subtotal and currency |
| `issuedAt` | `quote.created_at` |
| `validUntil` | `quote.expires_at`, date and time (countdown caption, preheader) |
| `validUntilDate` | `quote.expires_at`, date only (quote card) |
| `remaining` | `expires_at − now`, as days, hours, and minutes (static) |
| `asOf` | `now` |
| Blocks | `NO_QUOTE`, `QUOTE_STATUS_*`, `QUOTE_NOT_FOUNDER_APPROVED`, `QUOTE_HAS_NO_SUBTOTAL`, `QUOTE_HAS_NO_EXPIRATION`, `QUOTE_EXPIRED`, `REMINDER_WINDOW_NOT_REACHED`, `PAYMENT_STATE_PAID`, `PAYMENT_STATE_CHECKOUT_PENDING`, `QUOTE_ALREADY_ACCEPTED` |

## Where the fields render

Card fields are live text placed on the paper card inside the hero art (`cards.ts`, `CARD_SPECS`), not in a data grid below it. See `FNDATN_01_ARTIFACT_DATA.md` for the field map per email and device.

## Demo scenarios (review only)

`shared/site00-correspondence-studio/fndatn01/fixtures.ts` holds one nonproduction timeline for a fictional client (`Jordan Avery`, `Avery Studio`, `.invalid` addresses, `demo` ids, a token that resolves to nothing) and seven snapshots of it: `INVITED`, `INTAKE_IN_PROGRESS`, `INTAKE_SUBMITTED`, `QUOTE_READY_UNPAID`, `QUOTE_EXPIRING_UNPAID`, `PAID_PROJECT_ACTIVE`, `FOUNDATION_VERIFIED_COMPLETE`. Every snapshot shares the same artifact, quote ($1,334.00 USD), references and dates, and has its own `now`, the instant its email could legitimately be sent. `PAID_PROJECT_ACTIVE` has an `activation_pending` variant without the `PROJECT_ACTIVATED` event. The intake-in-progress snapshot has no quote and no payment.

The committed review previews under `public/site00-correspondence-studio/fndatn-01/` are rendered from these scenarios by `scripts/correspondence-studio/fndatn01/render-previews.ts`, each labelled `DEMO DATA` with its scenario name in the inbox note and in the studio's data-state selector. A test fails if the committed HTML drifts from the renderer.

Send mode throws on any payload `isFndatn01DemoPayload` recognises (demo artifact, token, lead or actor), so demo values can never reach a client. In send mode a missing value is never replaced with a demo value: an optional field drops its row, a required one makes the email ineligible.
