# Digital Foundation V2 — email pack production plan

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GROK-COMPLETE-EMAIL-PACK-INVENTORY-CREATIVE-COVERAGE-AND-COST-AUDIT1`  
**Date:** 2026-10-11  
**Recommended scenario:** LEAN  
**This sprint produced the plan only.** The pack below is not created here.

## Scenarios

| | Lean | Balanced | Premium |
| --- | --- | --- | --- |
| Email templates | 20 | 20 | 20 |
| Type B design compositions | 20 | 20 | 20 |
| New image generations | 0 | 1 (`foundation-credit-issued`) | 4 (invitation, quote-ready, project-activated, credit) |
| Regeneration allowance | 0 | 1 | 2 |
| OpenArt credits | 0 | 634 | 1902 |
| USD | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Production sequence | Stage 1 design pass. Provider queue empty. | Stage 1 design pass, then 1 image job and 1 reserve slot. | Stage 1 design pass, then 4 image jobs and 2 reserve slots. |
| Deliverables | 20 design boards, shared H/I assets, copy contracts, contact sheet, manifest, one ZIP | Lean deliverables plus one credit plate | Lean deliverables plus four plates |

Responsive contracts: 2 per template (40) in every scenario. Premium exploration of a new plate is a crop note on that plate, not a second billed aspect.

Lean is recommended. The six existing email images plus the registered authority can carry every Type B board. Balanced is the upgrade if the founder wants a credit plate that is not the education image. Premium is the upgrade if invitation, quote, and activation each need their own photograph. None of the three reuses the 6340 C–J approval.

## Stage 1 — design pack

After budget approval (lean needs no credit spend; it still needs a founder go-ahead to design):

- One Type B board per required email.
- Subject, preheader, hierarchy, uppercase copy, token map, CTA, footer.
- Mobile and desktop contracts from `DF_V2_EMAIL_RESPONSIVE_REQUIREMENTS.md`.
- Shared assets referenced, not regenerated.
- Contact sheet, manifest, provenance for any new plate, review guide.
- One master ZIP. Category ZIPs only when the category folder has real files.

Future folder (do not create empty placeholders now):

```
SITE00_DF_V2_EMAIL_PACK/
  TRANSACTIONAL/
  OPERATIONAL/
  MARKETING/
  SHARED_ASSETS/
  CONTACT_SHEETS/
  MANIFESTS/
  PROMPTS/
  REVIEW_GUIDE/
```

Founder reviews the ZIP before Stage 2.

## Stage 2 — HTML

Only after the Stage 1 designs are approved. An implementation agent builds HTML, lifecycle bindings, personalization, client previews, links, delivery guards, accessibility, and suppression. Live sending stays off until a separate approval. Flags in `featureFlags.ts` stay default off.

Stage 2 dependencies already known:

- `enabled: false` on every event-map row.
- Send flags default off.
- No durable consent or send-intent tables (memory queue only, per the lineage audit).
- `{{preference_url}}` does not exist. Preferences save inside the foundation client.
- Sender from-address is unregistered.
- `payment-failed` must not bind the studio template of the same id.
- M01, M06, and M13 have no event binding. Do not invent triggers to force a send.

## Explicitly out of this plan’s current authorization

Paid generation, HTML implementation, live sends, merge, and deploy.
