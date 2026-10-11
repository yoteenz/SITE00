# Digital Foundation V2 — email archetype matrix

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GROK-COMPLETE-EMAIL-PACK-INVENTORY-CREATIVE-COVERAGE-AND-COST-AUDIT1`  
**Date:** 2026-10-11

Archetypes were closed after reading `eventMap.ts`. A shared archetype supports several templates. Each template still gets its own Type B design. One shell is not fifteen finished emails.

Distinct archetypes: **13**.

## Transactional and operational (9)

| Archetype | Templates | Why it is one family |
| --- | --- | --- |
| INVITATION | `personal-foundation-invitation` | First access message. Consent is null because the message is the link. |
| INTAKE_PROGRESS | `intake-started`, `intake-completed` | Same intake room. Copy must not blur “open” and “received”. |
| QUOTE_AND_ACCEPTANCE | `quote-ready`, `quote-updated`, `quote-accepted` | Same commercial document. Three states. |
| CHECKOUT_AND_PAYMENT | `checkout-link-ready`, `payment-confirmed`, `payment-failed` | Money states. Each state has its own subject and must not borrow another state’s claim. |
| PROJECT_ACTIVATION | `project-activated` | Project open. Not payment, not completion. |
| ACTION_REQUIRED | `client-action-required` | One open client action. |
| APPROVAL | `approval-requested`, `approval-completed` | Decision requested, then action recorded. Event `APPROVED` stays inside this family and does not add a template. |
| COMPLETION | `foundation-complete` | Service completion receipt. |
| RECORDS_AVAILABLE | `records-available` | Verification, then records. |

`LINK_OPENED` did not become a family. It has no template.

## Marketing (4)

All four inherit architectural editorial × blueprint dispatch. They are compositions inside one family, not four brands.

| Archetype | Templates | Plate already in hand |
| --- | --- | --- |
| EDITORIAL_EDUCATION | `M01` | DF-I01 |
| BLDR_JOURNEY | `M06`, `bldr-discovery` | DF-I02 for both. Two Type B specs. |
| PROGRESS_AND_OPPORTUNITY | `foundation-credit-issued` | No campaign plate. Authority file plus I01 modules on the lean plan. |
| POST_COMPLETION_JOURNEY | `M13` | DF-I03 |

Rejected as archetypes for this pack, because no source contract names them:

- Digital location showcase
- Founder letter
- Re-engagement

The approved authority image is the family reference. It is not itself an email template.

## Minimum distinct compositions

| Layer | Lean | Balanced | Premium |
| --- | --- | --- | --- |
| Type B design specs | 20 | 20 | 20 |
| New OpenArt compositions | 0 | 1 (credit) | 4 (invitation, quote anchor, activation, credit) |
| Marketing plates reused | I01, I02, I03, authority | I01, I02, I03, plus one new credit plate | Same as balanced |
| Transactional plates reused | H01, H02, H03 | H01, H02, H03 | H01–H03, plus three new archetype plates |

Quote-updated and quote-accepted use the quote-ready premium plate if that plate is approved. They do not get their own generations.

## Shared modules

Every Type B design uses the same module set:

1. Wordmark region for the official SITE 00 mark. No substitute mark.
2. Numbered section labels.
3. One primary button.
4. Optional secondary text link.
5. Token block for dynamic fields.
6. Footer: service notice, or marketing unsubscribe and preferences.
7. Luminous white field, monumental black condensed headlines, SITE 00 red for the action.

Transactional designs use the H shell. Marketing designs use the I plates and the registered authority. They do not swap families.
