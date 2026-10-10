# Email asset scope

Email art is **not** a 9:16 product screen. HTML implementation stays out of scope.

## What the repo actually lists

Transactional and operational template ids on `DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP` (`eventMap.ts`):

`personal-foundation-invitation`, `intake-started`, `intake-completed`, `quote-ready`, `quote-updated`, `quote-accepted`, `checkout-link-ready`, `payment-confirmed`, `payment-failed`, `project-activated`, `client-action-required`, `approval-completed`, `approval-requested`, `foundation-complete`, `records-available`.

That is **15** ids. `LINK_OPENED` has an empty template list.

Marketing ids on the same map: `foundation-credit-issued`, `bldr-discovery`.

`DIGITAL_FOUNDATION_V2_EMAIL_TEMPLATE_MANIFEST.json` also names journeys M01 education, M06 BLDR introduction, M13 post-completion. Several T-numbers in that file are unmapped. The note in the file says T01–T29 and M01–M15 are **not** fully listed. This estimate uses only rows that exist in code or that manifest. It does not invent the missing T/M numbers as images.

## What not to generate

- One image per merge-field variant (name, amount, domain).
- Client names, payment amounts, or private records baked into art.
- A 9:16 phone UI for each template.

## Planned images

| Scenario | Email images | What they are |
| --- | --- | --- |
| Lean | 1 | One reusable header/family graphic for all transactional HTML |
| Balanced | 6 | Transactional: header + mobile layout + desktop layout. Marketing: one layout each for education, BLDR intro, post-completion |
| Premium | 19 | Transactional header + six archetype layouts × mobile and desktop (13) plus three marketing campaigns × two viewports (6) |

Aspect for these jobs in the cost matrix: **16:9**, 4k, high, image-to-image, **317 credits** (verified 2026-10-10). A shorter email crop can be specified in the prompt; the provider still bills the job, not a separate email SKU.

The founder-approved marketing poster is not registered. Chat delivery re-encoded it twice, and neither file matches the expected SHA256. Balanced marketing count stays **3** until that file is committed as raw bytes. See `docs/site00/idnty/visual-authority/marketing-email/MARKETING_EMAIL_AUTHORITY_CHECKSUM_RECOVERY.md`.
