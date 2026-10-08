# A06 — A PURCHASE MAY NEED A SECOND LOOK

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** NOT_WIRED

**Family:** E05 REMINDER / NUDGE · **message type:** PURCHASE_SECOND_LOOK · **lineage:** DESK_NOTE

Tell the person that a purchase they saved no longer fits their plan as well as it did, and what they can do.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A06 |
| FAMILY | E05 REMINDER / NUDGE |
| PURPOSE | Tell the person that a purchase they saved no longer fits their plan as well as it did, and what they can do. |
| TRIGGER_EVENT | PURCHASE_ATTENTION_DETECTED (STATE_EXISTS_EVENT_NOT_EMITTED) |
| ELIGIBILITY | A saved purchase (status IDEA / PLANNING / READY) moved from FITS NOW to CLOSE or NOT YET; REMINDERS_NUDGES on |
| SUPPRESSION_RULES | The person checked or edited this purchase in the last 24 hours; Purchase PURCHASED or ARCHIVED; Any E05 nudge sent in the last 72 hours; REMINDERS_NUDGES off |
| COOLDOWN | P14D per purchase |
| PERSONALIZATION_INPUTS | purchaseName, purchaseAmount, category, affordability, fitsOn? (P2) |
| CTA_DESTINATION | purchases/{purchaseId} |
| CONSENT_CLASS | LIFECYCLE_SERVICE · preference REMINDERS_NUDGES |
| PRIORITY | NORMAL |
| DUPLICATE_GUARD | A06:{userId}:{purchaseId}:{affordability} |
| DELIVERY_STATE | NOT_WIRED |

Source: Saved purchases: purchasesStore.purchaseAffordability NOW / WAIT / NOT_YET; check tone classifyPurchaseCheck FIT / CHECK_IN / OVER (src/projects/jurnl/data/f10).

Needs before it can fire: Server-side affordability evaluation on snapshot change; REMINDERS_NUDGES preference.

## States
| State | When | Differs by |
|---|---|---|
| CLOSE | Affordability WAIT (CLOSE) | Copy offers waiting until {fitsOn} if known |
| NOT_YET | Affordability NOT_YET | Copy offers adjusting the amount or the plan |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | A purchase may need a second look |
| PREHEADER | Your plan changed since you saved it. You still have options. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address. |
| EYEBROW | PURCHASES |
| HEADLINE | THIS MAY NEED A SECOND LOOK. |
| MESSAGE_BODY | Your plan has changed since you saved {purchaseName}. Buying it now would change what is safe to spend. / You still have options: wait a little, adjust the amount, or keep it as planned. |
| CTA | REVIEW THIS PURCHASE → purchases/{purchaseId} |
| FALLBACK_TEXT | A purchase may need a second look. ⏎  ⏎ {purchaseName} ({purchaseAmount}, {category}) — your plan has changed since you saved it. You still have options. ⏎  ⏎ Review it: {purchaseUrl} |

## Composition
- **Artifact:** DESK_SLIP / SMALL_MEMO
- **Components (reading order):** EC02 DECKLED NOTE → EC12 STATUS NOTICE → EC11 DOSSIER / RECORD ROW → EC07 SINGLE CTA → EC16 EMAIL FOOTER → EC17 MARKETING PREFERENCES / UNSUBSCRIBE
- **Primary editorial gesture (options):** a small desk slip, set slightly askew, carrying the purchase as an index-card row
- **Secondary tactile detail (options):** a pencil line under the purchase name (decorative)
- **Contrast anchor:** burgundy status label (text), never a red alert
- **Environment:** NONE.
- **Avoid:** shame or fear language; “overspent”; alarm colours; urgency
- **Live HTML (never image):** headline, body, purchaseName, purchaseAmount, category, affordability, fitsOn?, CTA, links, footer, unsubscribe / preferences

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L2 desk slip shell | EMAIL_ARTIFACT_SHELL | DERIVE | Derived from the A03 pinned note stock. |

Fixture: `FX_PURCHASE_NUDGE` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
