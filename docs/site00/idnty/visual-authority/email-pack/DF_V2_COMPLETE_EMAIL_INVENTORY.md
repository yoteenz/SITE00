# Digital Foundation V2 — complete email inventory

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GROK-COMPLETE-EMAIL-PACK-INVENTORY-CREATIVE-COVERAGE-AND-COST-AUDIT1`  
**Date:** 2026-10-11  
**Base SHA:** `3cd487e2968f7add0ff953475f878668305e5c3f` (`origin/main` at audit start)  
**Registry:** `DF_V2_COMPLETE_EMAIL_TEMPLATE_REGISTRY.json`

This inventory lists emails the Digital Foundation product actually names. It does not treat a visual reference as a template, and it does not treat a template id as implemented HTML.

## What exists

| Source | What it is | What it is not |
| --- | --- | --- |
| `shared/site00-digital-foundation/communications/eventMap.ts` | 17 template ids on lifecycle events, plus `LINK_OPENED` with an empty list. Every row is `enabled: false`. | A live send map. |
| `docs/site00/idnty/DIGITAL_FOUNDATION_V2_EMAIL_TEMPLATE_MANIFEST.json` | Partial aliases T01, T07, T08, T13, T14, T17, T23 and journeys M01, M06, M13. | A full T01–T29 or M01–M15 catalog. The file says those ranges are not listed. |
| `api/_lib/digitalFoundation/communications/dispatch.ts` | Dry-run intent queue. Sends only when a mapping is enabled and the matching flag is on. Flags default off. | An HTML renderer. |
| `shared/site00-email/` | Studio email pack and `/admin/site00/debug/email-pack`. | The Digital Foundation lifecycle pack. |
| Batches H and I | Six Type A images. | Twenty finished emails. |

`getTemplateById` in the studio registry returns undefined for every Digital Foundation id except `payment-failed`. That one string also names a studio billing template. The studio copy is sentence case and is not the Digital Foundation design. Count of implemented Digital Foundation templates: **0**.

## Required set (20)

Transactional ids on the event map: **12**.

`personal-foundation-invitation`, `intake-started`, `intake-completed`, `quote-ready`, `quote-updated`, `quote-accepted`, `checkout-link-ready`, `payment-confirmed`, `payment-failed`, `project-activated`, `foundation-complete`, `records-available`.

Operational ids on the event map: **3**.

`client-action-required`, `approval-requested`, `approval-completed`.

Marketing rows with a source: **5**.

| Id | Source | Class |
| --- | --- | --- |
| `foundation-credit-issued` | Event `CREDIT_CREATED` | Existing contract |
| `bldr-discovery` | Event `BUILD_INTEREST_CAPTURED` | Existing contract |
| `M01` | Manifest, no `site00_template_id`, no event | Planned contract |
| `M06` | Manifest, no event | Planned contract |
| `M13` | Manifest, no event | Planned contract |

Additional required emails beyond that sourced set: **0**.

The previous audit’s fifteen transactional and operational ids are all still present. No fifteenth id was renamed or removed.

## Manifest aliases (not extra emails)

| Manifest id | Template id | Status in manifest |
| --- | --- | --- |
| T01 | `personal-foundation-invitation` | CANDIDATE |
| T07 | null | UNMAPPED. Name “RECOMMENDATION READY”. Not given an id here. |
| T08 | `quote-ready` | CANDIDATE |
| T13 | `payment-confirmed` | CANDIDATE |
| T14 | `payment-failed` | CANDIDATE |
| T17 | `client-action-required` | CANDIDATE |
| T23 | `foundation-complete` | CANDIDATE |
| M01 | none | CONTRACT_ONLY |
| M06 | none | CONTRACT_ONLY |
| M13 | none | CONTRACT_ONLY |

## Duplicate semantics (kept as one email)

| Pair | Decision |
| --- | --- |
| `approval-completed` on `CLIENT_ACTION_COMPLETED`, and event `APPROVED` with no template | One email. `APPROVED` does not get a second id. |
| `foundation-complete` and `M13` | Different jobs. Completion is transactional. M13 is a marketing follow-up. |
| `bldr-discovery` and `M06` | Different jobs. Discovery fires when interest is captured. M06 is an introduction with no event. They share the DF-I02 plate and still need two Type B designs. |
| Studio `payment-failed` and Digital Foundation `payment-failed` | Same string, different products. The Digital Foundation row is not implemented. |

## Not required

These were checked because the sprint named them or because an event exists. They are not rows in the registry.

| Item | Class | Why |
| --- | --- | --- |
| `LINK_OPENED` | Not required | Operational event. Template list is empty on purpose. |
| `INTAKE_UPDATED` | Not required | No template. A mail on every save would be a different product. |
| `REFUND_RECORDED` | Proposed gap | Event exists. No Digital Foundation template id. Studio `refund-recorded` is a different pack and is `enabled: false`. |
| `REVISION_REQUESTED` | Proposed gap | Event exists. No Digital Foundation template id. |
| `BUILD_BOOKED` | Proposed gap | Event exists. No template. `bldr-discovery` must not claim a booking. |
| `STAGE_*`, `TASK_*`, `RUNBOOK_*`, `FORECAST_CHANGED`, `PROVIDER_HANDOFF_OPENED`, `FINAL_VERIFICATION_STARTED` | Not required | No client email contract. |
| T07 recommendation ready | Proposed gap | Named, `site00_template_id` null. No id invented. |
| M02–M05, M07–M12, M14–M15 | Not required | Not in the manifest. The lineage note “M01–M15 contracts only” does not list those ids. |
| Digital ownership education | Not required | No Digital Foundation email contract. |
| Digital location opportunities | Not required | Studio templates such as `location-live` are not on the Digital Foundation map. |
| Business ambition / business growth | Not required | Intake and bridge code exist. No email id. Lineage audit: ambition UI unwired. |
| Retention / re-engagement | Not required | Studio templates `re-engagement` and `abandoned-intake`. Not on the Digital Foundation map. |
| `shared/site00-invitation-system/` and `/invite/:code` | Out of pack | Different invitation product. The Digital Foundation invitation is `ARTIFACT_CREATED` → `personal-foundation-invitation`. |

## Marketing classification

| Journey | Class |
| --- | --- |
| Foundation education (`M01`) | Planned contract. Consent target is the client `educational` preference, which the project portal already stores. |
| Digital ownership education | Not required |
| BLDR discovery (`bldr-discovery`) | Existing contract. Marketing consent plus the interest event. |
| Foundation credit (`foundation-credit-issued`) | Existing contract. Marketing consent. |
| Digital location opportunities | Not required |
| Business ambition | Not required |
| Business growth | Not required |
| BLDR introduction (`M06`) | Planned contract. Marketing consent. |
| Post-completion follow-up (`M13`) | Planned contract. Marketing consent. Completion receipt stays `foundation-complete`. |
| Retention and re-engagement | Not required for this pack |

## Implementation snapshot

- Preview routes `/admin/site00/debug/email-pack` render the studio pack.
- Dispatch never calls `renderEmailTemplate`.
- Consent and suppression types exist. Durable Supabase tables for intents and consent were still missing at the lineage audit. The queue is in memory.
- Client preferences (`marketing_opt_in`, `project_operations`, `educational`) save through the foundation client. Marketing defaults off.
- All fifteen known transactional and operational ids were re-read on this SHA and match the list above.

## Type coverage

| Type | Count |
| --- | --- |
| A — visual authority | 6 email images (H01–H03, I01–I03) plus the registered marketing authority |
| B — complete email design | 0 of 20 |
| C — implemented HTML | 0 of 20 |
