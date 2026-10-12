# FNDATN-01 — Template and event mapping

Pack: `SITE 00 / DIGITAL FOUNDATION / FOUNDATIONAL CORRESPONDENCE / PACK 01` (`FNDATN-01`).
Source attachment: `SITE00_FNDATN_7_EMAILS_UNDER_4MB_5cf4.zip` (14 device authorities).

Status: `FOUNDER VISUAL AUTHORITY SUPPLIED / HTML IMPLEMENTATION PENDING VALIDATION / FINAL FOUNDER APPROVAL PENDING`.

Code of record:

- Pack, triggers, eligibility text: `shared/site00-correspondence-studio/fndatn01/pack.ts`
- Eligibility guards and personalization: `shared/site00-correspondence-studio/fndatn01/contracts.ts`
- Renderers: `shared/site00-correspondence-studio/fndatn01/emails.ts`, `render.ts`
- Version registration: `shared/site00-correspondence-studio/import/fndatn01PackImport.ts`

Registering this pack registers templates and trigger contracts only. Every FNDATN-01 trigger is `dispatch_enabled: false`. `shared/site00-digital-foundation/emails/eventMap.ts` is unchanged, and delivery stays dry-run.

## Summary

| # | Email | Template id | Template | Trigger | Role |
| --- | --- | --- | --- | --- | --- |
| 01 | Foundation Invitation | `personal-foundation-invitation` | existing | `ARTIFACT_CREATED` + founder authorization | lifecycle |
| 02 | Intake Received | `intake-completed` | existing | `INTAKE_COMPLETED` | lifecycle |
| 03 | Recommendation & Quote | `quote-ready` | existing | `QUOTE_CREATED` | lifecycle |
| 04 | Payment Received / Project Activated | `payment-confirmed` | existing | `PAYMENT_CONFIRMED` | lifecycle |
| 05 | Foundation Complete / Delivered | `foundation-complete` | existing | `FOUNDATION_COMPLETED` | lifecycle |
| 06 | Resume Your Intake | `intake-resume-reminder` | new | derived `INTAKE_RESUME_REMINDER_DUE` (48 h inactivity) | conditional recovery |
| 07 | Quote Expiry Reminder | `quote-expiry-reminder` | new | derived `QUOTE_EXPIRY_REMINDER_DUE` (72 h window) | conditional recovery |

The two derived conditions are not artifact events, and nothing schedules them yet. The studio labels them `NOT SCHEDULED`.

## Versioning

Each template gets the version `<template_id>@fndatn-01` in `review_state: founder_review`, and it becomes that template's `current_version_id`. Earlier versions (V1, V2 benchmark, R2 A/B/C, R3 editorial, R4 premium) stay in `versions[]`, unchanged. `project-activated` keeps R4 as its current version, because activation is a separate contract.

The two new templates (06 and 07) have only the FNDATN-01 version.

<a id="email-01"></a>
## 01 — Foundation Invitation

- Template: `personal-foundation-invitation`
- Trigger: `ARTIFACT_CREATED`. The founder must authorize the send (`founderAuthorized`).
- Eligible when the artifact has a public token, is not archived, and the intake is not yet submitted.
- CTA: `BEGIN YOUR FOUNDATION`, linking to `/foundation/{public_token}?step=intake`, the persistent intake URL from `digitalFoundationClientIntakePath`.
- No payment step. No token or recipient address is ever invented. Previews use a disposable fixture token.

<a id="email-02"></a>
## 02 — Intake Received

- Template: `intake-completed`
- Trigger: `INTAKE_COMPLETED`.
- Eligible when `intake_state === 'COMPLETE'` and a persisted `INTAKE_COMPLETED` event exists. The received timestamp comes from that event, and the reference is the artifact id.
- `intake-started` stays a separate contract.

<a id="email-03"></a>
## 03 — Recommendation & Quote

- Template: `quote-ready`
- Trigger: `QUOTE_CREATED`.
- Eligible when the quote is founder commercial ready, has status `READY` or `CLIENT_REVIEW`, a subtotal above 0, and a real `expires_at` in the future. The artifact must not already be paid.
- Amount and currency come from `quote.subtotal_minor` and `quote.currency`. Valid-until comes from `quote.expires_at`. Add-ons come from `quote.selected_addons` and the add-on catalog. There is no hardcoded $500.

<a id="email-04"></a>
## 04 — Payment Received / Project Activated

- Template: `payment-confirmed`
- Trigger: `PAYMENT_CONFIRMED`.
- Eligible when `payment_state === 'PAID'`, a persisted `PAYMENT_CONFIRMED` event exists, and the quote status is `PAID`.
- Activation copy appears only when a `PROJECT_ACTIVATED` event exists and `project_state` is past `NOT_STARTED`. Otherwise the email renders the `ACTIVATION PENDING` state. The studio exposes both states through the version state select.
- The payment method appears only when the event payload carries `method_label`. No card number is ever fabricated.
- CTA: `OPEN YOUR FOUNDATION`. The receipt and the PAID seal are kept.
- `project-activated` stays a separate contract. Stripe and payment logic are unchanged.

<a id="email-05"></a>
## 05 — Foundation Complete / Delivered

- Template: `foundation-complete`
- Trigger: `FOUNDATION_COMPLETED`.
- Eligible only when `completion_state === 'COMPLETE'`, an ownership record exists, a `FOUNDATION_COMPLETED` event exists, and all five items are verified: domain, email, security, device, and records. Each item requires its stage to be complete and a value present in the record.
- If any item is pending, the email is ineligible (`<ITEM>_PENDING_VERIFICATION`).

<a id="email-06"></a>
## 06 — Resume Your Intake

- Template: `intake-resume-reminder` (new)
- Trigger: derived `INTAKE_RESUME_REMINDER_DUE`, after 48 hours without activity (`FNDATN01_REMINDER_POLICY.intake_resume_after_hours`).
- Eligible when `intake_state === 'IN_PROGRESS'`, saved answers exist, there is no `INTAKE_COMPLETED` event, the inactivity delay has been reached, and no reminder has been sent for this activity window.
- Never sent after submission or when nothing is saved. The progress tracker has four steps and no payment step.

<a id="email-07"></a>
## 07 — Quote Expiry Reminder

- Template: `quote-expiry-reminder` (new)
- Trigger: derived `QUOTE_EXPIRY_REMINDER_DUE`, within 72 hours of the real `expires_at` (`FNDATN01_REMINDER_POLICY.quote_expiry_window_hours`).
- Eligible when the quote has status `READY` or `CLIENT_REVIEW`, is founder ready, has a subtotal above 0, has not expired, and is inside the window. It is not sent when the quote is accepted, paid, or in checkout.
- The countdown is static (days, hours, minutes) with an `AS OF` time and the `VALID UNTIL` date. No JavaScript.
