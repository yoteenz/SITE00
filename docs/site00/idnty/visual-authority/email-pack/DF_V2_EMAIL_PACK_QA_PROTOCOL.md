# Digital Foundation V2 — email pack QA protocol

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GROK-COMPLETE-EMAIL-PACK-INVENTORY-CREATIVE-COVERAGE-AND-COST-AUDIT1`  
**Date:** 2026-10-11

Use this when Stage 1 boards exist. This audit has no boards to score. A shared hero is not a pass.

## Gates

| Gate | Pass |
| --- | --- |
| Coverage | All 20 registry ids have a Type B board. No extra id appears that this inventory marked not required. |
| Duplicate ids | One row per id. `payment-failed` is the Digital Foundation board, not the studio billing template. |
| Brand | Luminous white, black condensed type, SITE 00 red, architectural photography, fine rules, numbered sections. Marketing boards match the registered authority. Transactional boards match the H shell. |
| Uppercase | Subject, preheader, headline, body, button, labels, footer, and system lines are uppercase. Exceptions stay in original case: client name, email, domain, URL, client-entered message, legal identifier, and any data field that must keep its case. |
| Legibility | Uppercase body remains readable at 14px and above, with open line-height. |
| Transactional clarity | Payment, quote, completion, and records boards do not borrow each other’s claims. |
| Copy accuracy | No printed price, payment result, approval, progress percent, credit amount, domain status, or completion unless the token is bound and labeled. Design masters show tokens, not fixture numbers. |
| CTA | One primary button. Secondary is a text link or absent, as the registry says. |
| Dynamic fields | Missing values follow the fallback in the copy contract. Tokens are not baked into images. |
| Responsive | 600px desktop column and a fluid mobile column. Not a 9:16 phone frame. |
| Asset reuse | Lean boards cite H/I or the authority file. A new image exists only when the approved scenario lists that job. |
| Consent | Marketing boards show unsubscribe and preferences. Transactional service notices do not use that block to sneak in a campaign. M01 follows the educational preference. |
| Email feasibility | Live text survives image blocking. Layout is table-safe for Outlook. Dark mode is a Stage 2 test, not a claim on the white board. |
| Footer | No invented street address, phone, or from-address. Sender stays unresolved until founder registration. |

## Fail examples

- Counting DF-H03 as the desktop design for all fifteen operational and transactional ids.
- Counting DF-I02 as both the M06 design and the bldr-discovery design.
- Generating a new plate for quote-updated when quote-ready already has the archetype plate.
- Binding studio `payment-failed` HTML because the id matches.
- Sending M13 in place of `foundation-complete`.

## Records

Each reviewed board gets a status: `PENDING`, `REVISE`, or `APPROVED`. This audit leaves every Type B status at `TYPE B NOT STARTED`. Batch H and I founder review remains `PENDING` on the C–J index. Technical dimension QA on those six files stays `PASS` as recorded there.
