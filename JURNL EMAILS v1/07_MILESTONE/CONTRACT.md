# A07 — YOU REACHED A MILESTONE

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** NOT_WIRED

**Family:** E04 MILESTONE / CELEBRATION · **message type:** MILESTONE_GOAL_FUNDED · **lineage:** CEREMONIAL

Acknowledge a real milestone — a goal fully set aside — warmly and precisely.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A07 |
| FAMILY | E04 MILESTONE / CELEBRATION |
| PURPOSE | Acknowledge a real milestone — a goal fully set aside — warmly and precisely. |
| TRIGGER_EVENT | GOAL_REACHED (STATE_EXISTS_EVENT_NOT_EMITTED) |
| ELIGIBILITY | Goal status became COMPLETE with completed_at; First time for this goal |
| SUPPRESSION_RULES | Goal deleted or reopened before send; Already sent for this goal; PRODUCT_SERVICE_UPDATES off |
| COOLDOWN | ONCE per goal |
| PERSONALIZATION_INPUTS | firstName, goalName, goalAmount, reachedOn (P2) |
| CTA_DESTINATION | goals/{goalId} |
| CONSENT_CLASS | LIFECYCLE_SERVICE · preference PRODUCT_SERVICE_UPDATES |
| PRIORITY | NORMAL |
| DUPLICATE_GUARD | A07:{userId}:{goalId} |
| DELIVERY_STATE | NOT_WIRED |

Source: Goal status COMPLETE with completed_at set by setGoalAside (src/projects/jurnl/data/f14); repository emits GOAL_UPDATED.

Needs before it can fire: Server-side transition detection (status → COMPLETE).

## States
| State | When | Differs by |
|---|---|---|
| GOAL_FUNDED | Goal COMPLETE | Only implemented state |
| BUFFER_ESTABLISHED | PROPOSED — no source event yet | Same template, seal and copy name the buffer |
| DEBT_PAID | PROPOSED — no source event yet | Same template, copy names the debt |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | You reached a milestone |
| PREHEADER | {goalName} is fully set aside and recorded in your plan. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address. |
| EYEBROW | MILESTONE |
| HEADLINE | YOU REACHED A MILESTONE. |
| MESSAGE_BODY | You have set aside the full {goalAmount} for {goalName}. It is recorded in your plan, and the money stays where you put it until you decide what comes next. |
| CTA | SEE YOUR GOAL → goals/{goalId} |
| FALLBACK_TEXT | You reached a milestone. ⏎  ⏎ {goalName}: {goalAmount}, fully set aside on {reachedOn}. ⏎  ⏎ See your goal: {goalUrl} |

## Composition
- **Artifact:** MILESTONE_CARD / CEREMONIAL_NOTE
- **Components (reading order):** EC01 HERO CORRESPONDENCE → EC09 MILESTONE SEAL → EC02 DECKLED NOTE → EC07 SINGLE CTA → EC16 EMAIL FOOTER → EC17 MARKETING PREFERENCES / UNSUBSCRIBE
- **Primary editorial gesture (options):** a ceremonial card with a wax or blind-embossed seal beside the live goal name
- **Secondary tactile detail (options):** a burgundy ribbon or brass medallion
- **Contrast anchor:** rich burgundy against warm cream
- **Environment:** CEREMONIAL lineage: a stronger still life (linen, brass, olive), one classical fragment at most.
- **Avoid:** confetti; trophies; badges; streaks; the amount inside the seal
- **Live HTML (never image):** headline, body, firstName, goalName, goalAmount, reachedOn, CTA, links, footer, unsubscribe / preferences

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L1 ceremonial still life | EMAIL_ENVIRONMENT | CREATE_NEW | Founds CEREMONIAL; all milestone states reuse it. |
| L2 milestone card shell | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Blank card. |
| seal | EMAIL_DECORATIVE_INSERT | CREATE_NEW | No text or numbers in the seal. |

Fixture: `FX_MILESTONE` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
