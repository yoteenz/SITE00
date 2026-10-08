# Consent model: transactional / lifecycle / marketing firewall

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

Source truth: JURNL has no email consent, no email preferences and no unsubscribe concept today. The consent keys that exist (`DATA_REMEMBER`, `LINKED_ACCOUNTS`, `NO_DATA_SALE`, the AI keys, `ASK_JURNL_CONTEXT`) are not email permissions; `settings.notificationsEnabled` is stored but unused; the NOTIFICATIONS row on the account page is not implemented. This model adds nothing to live consent.

## Classes

### TRANSACTIONAL

Required to deliver a service the person asked for, or to keep their account secure. Sent because of a specific action or a security event.

- Examples: verify email; reset access; security alert; account change confirmation; data export ready
- Requires opt-in: NO · unsubscribe required: NO · marketing content: FORBIDDEN · sends when marketing declined: YES
- Never contains promotional, editorial or cross-sell content (no EC01 environment art, EC05, EC08, EC10, EC17).
- Never requires a marketing subscription to be delivered.
- Security links are never wrapped by click tracking.
- States what happened, when, and what to do if it was not the recipient.

### LIFECYCLE_SERVICE

Helps the person use the service they signed up for: arrival, setup guidance, briefs, reminders, real milestones.

- Examples: welcome; finish setup; Safe to Spend ready; weekly brief; purchase second look; milestone reached
- Requires opt-in: NO · unsubscribe required: YES · marketing content: FORBIDDEN · sends when marketing declined: YES
- Classify carefully: a lifecycle email is about the person’s own account and data, never about selling.
- Recurring or optional lifecycle mail (briefs, reminders, milestones) is sent only while its preference category is on, and carries a category unsubscribe (EC17).
- One-time arrival mail (welcome) carries a preferences link in the footer.
- No promotions, offers or campaign content; a product mention is allowed only when it is the next step for this person.

### MARKETING

Optional storytelling and promotion: campaigns, launches, editorial.

- Examples: feature launch; seasonal planning story; JURNL editorial
- Requires opt-in: YES · unsubscribe required: YES · marketing content: ALLOWED · sends when marketing declined: NO
- Sent only with explicit marketing consent recorded with version, timestamp and source.
- One-click unsubscribe (RFC 8058 List-Unsubscribe-Post) and a visible footer link.
- Never carries personal financial figures or account/security content.

## Firewall
- Every message contract declares exactly one consent class.
- Family and consent class must agree: E06 is TRANSACTIONAL only; E07 is MARKETING only; E01, E03, E04 and E05 are LIFECYCLE_SERVICE.
- A component may appear only in the consent classes it lists (components.ts).
- Marketing content never enters TRANSACTIONAL mail, and a TRANSACTIONAL email never becomes a carrier for lifecycle or marketing modules.
- When classification is uncertain, choose the stricter class and record why.

## Preference categories (conceptual)
| Category | Class | Default | User can turn off | Supported today | Proposed consent key |
|---|---|---|---|---|---|
| ACCOUNT & SECURITY | TRANSACTIONAL | ON | NO | NO | — |
| PRODUCT / SERVICE UPDATES | LIFECYCLE_SERVICE | ON | YES | NO | EMAIL_SERVICE_UPDATES |
| FINANCIAL BRIEFS | LIFECYCLE_SERVICE | OFF | YES | NO | EMAIL_FINANCIAL_BRIEFS |
| REMINDERS & NUDGES | LIFECYCLE_SERVICE | OFF | YES | NO | EMAIL_REMINDERS |
| JURNL EDITORIAL | MARKETING | OFF | YES | NO | EMAIL_EDITORIAL_MARKETING |

- Do not expose a category in the product until backend truth supports storing and honouring it.
- ACCOUNT & SECURITY is always on and is not shown as a toggle; it is explained in the preference centre.
- Opt-ins for FINANCIAL BRIEFS, REMINDERS & NUDGES and JURNL EDITORIAL default to off until the founder decides otherwise and the consent copy is approved.
- When implemented, email consent uses the existing consent record shape (consent_type, status, version, granted_at, revoked_at, source) through repository.patchConsent — no parallel consent system.
- settings.notificationsEnabled may become the master switch for non-transactional mail; it must not gate TRANSACTIONAL mail.
- Unsubscribe applies immediately and is idempotent; it never signs the person out or touches other consents.
