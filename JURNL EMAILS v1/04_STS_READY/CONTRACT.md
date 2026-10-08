# A04 — YOUR SAFE TO SPEND IS READY

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** NOT_WIRED

**Family:** E01 WELCOME / ARRIVAL (with GUIDANCE / EDUCATION traits) · **message type:** SAFE_TO_SPEND_READY · **lineage:** ARRIVAL

Tell the person their Safe to Spend is real now, show it, and explain in one line how it is made.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A04 |
| FAMILY | E01 WELCOME / ARRIVAL |
| PURPOSE | Tell the person their Safe to Spend is real now, show it, and explain in one line how it is made. |
| TRIGGER_EVENT | SAFE_TO_SPEND_READY (STATE_EXISTS_EVENT_NOT_EMITTED) |
| ELIGIBILITY | First time completeness is COMPLETE; Value > 0; Not within 12 hours of A01 |
| SUPPRESSION_RULES | Already sent (ever); Completeness not COMPLETE at send time; PRODUCT_SERVICE_UPDATES off |
| COOLDOWN | ONCE |
| PERSONALIZATION_INPUTS | firstName, safeToSpend, availableThrough, asOf, currency (P2) |
| CTA_DESTINATION | safe/why |
| CONSENT_CLASS | LIFECYCLE_SERVICE · preference PRODUCT_SERVICE_UPDATES |
| PRIORITY | NORMAL |
| DUPLICATE_GUARD | A04:{userId} |
| DELIVERY_STATE | NOT_WIRED |

Source: computeSafeToSpend (src/projects/jurnl/data/f09/safeToSpend.ts) completeness COMPLETE; repository emits SAFE_TO_SPEND_RECALCULATED in memory.

Needs before it can fire: Server-side recomputation or a persisted first-ready marker in the snapshot.

## States
| State | When | Differs by |
|---|---|---|
| READY | Completeness COMPLETE and value > 0 | Only state; other completeness values never send |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | Your Safe to Spend is ready |
| PREHEADER | See what is safe to spend now, and how JURNL got there. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address. |
| EYEBROW | SAFE TO SPEND |
| HEADLINE | YOUR NUMBER IS READY. |
| MESSAGE_BODY | This is what is left after what is coming and what you chose to protect. It updates as your money moves. |
| CTA | SEE WHY THIS AMOUNT → safe/why |
| SECONDARY | OPEN TODAY → today |
| FALLBACK_TEXT | Your Safe to Spend is ready. ⏎  ⏎ Safe to spend: {safeToSpend}, available through {availableThrough} (as of {asOf}). ⏎  ⏎ See why: {safeWhyUrl} |

## Composition
- **Artifact:** ENTRY_CARD / EDITORIAL_EXPLAINER
- **Components (reading order):** EC01 HERO CORRESPONDENCE → EC03 FINANCIAL SNAPSHOT → EC02 DECKLED NOTE → EC08 DUAL CTA → EC16 EMAIL FOOTER → EC17 MARKETING PREFERENCES / UNSUBSCRIBE
- **Primary editorial gesture (options):** an entry card that frames the live figure like a printed certificate
- **Secondary tactile detail (options):** a margin annotation line pointing to the figure (decorative rule only)
- **Contrast anchor:** the live serif figure in black ink
- **Environment:** ARRIVAL lineage (reused from A01), cropped differently.
- **Avoid:** the figure inside an image; the STS folder from the app as a screenshot
- **Live HTML (never image):** headline, body, firstName, safeToSpend, availableThrough, asOf, currency, CTA, links, footer, unsubscribe / preferences

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L1 arrival still life | EMAIL_ENVIRONMENT | REUSE | From A01, new crop. |
| L2 entry card shell | EMAIL_ARTIFACT_SHELL | DERIVE | Derived from the A01 letter stock. |

Fixture: `FX_STS_READY` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
