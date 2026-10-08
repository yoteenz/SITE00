# A03 — FINISH SETTING UP JURNL

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** NOT_WIRED

**Family:** E05 REMINDER / NUDGE (with GUIDANCE / EDUCATION traits) · **message type:** SETUP_REMINDER · **lineage:** DESK_NOTE

Bring back someone who started setup and stopped, with only the steps they have left.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A03 |
| FAMILY | E05 REMINDER / NUDGE |
| PURPOSE | Bring back someone who started setup and stopped, with only the steps they have left. |
| TRIGGER_EVENT | SETUP_INCOMPLETE (PROPOSED) |
| ELIGIBILITY | Account verified; Setup started, not finished; 48 hours since verification |
| SUPPRESSION_RULES | Setup finished; Signed in within the last 24 hours; Already sent twice; PRODUCT_SERVICE_UPDATES off |
| COOLDOWN | P7D (maximum two sends) |
| PERSONALIZATION_INPUTS | firstName, remainingSteps[], resumeAt (P1) |
| CTA_DESTINATION | setup |
| CONSENT_CLASS | LIFECYCLE_SERVICE · preference PRODUCT_SERVICE_UPDATES |
| PRIORITY | NORMAL |
| DUPLICATE_GUARD | A03:{userId}:{sendNumber} |
| DELIVERY_STATE | NOT_WIRED |

Source: Setup draft (src/projects/jurnl/data/f02/setupDraft.ts): started / resumeAt. There is no "setup finished" flag; repository SETUP_COMPLETED fires on every patch.

Needs before it can fire: A real setup-finished flag in the setup draft / snapshot; Scheduled job reading jurnl_user_snapshots.

## States
| State | When | Differs by |
|---|---|---|
| EARLY | Most steps remaining | Checklist shows all remaining steps |
| NEARLY_DONE | One or two steps remaining | Headline: ALMOST THERE. |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | Your JURNL is waiting where you left it |
| PREHEADER | A few minutes finishes your setup, right where you stopped. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address. |
| EYEBROW | SETUP |
| HEADLINE | PICK UP WHERE YOU LEFT OFF. |
| MESSAGE_BODY | You started setting up JURNL. Finishing it lets JURNL show what is safe to spend, with your own numbers. |
| CTA | FINISH SETUP → setup |
| FALLBACK_TEXT | Your JURNL is waiting where you left it. ⏎  ⏎ Steps left: {remainingSteps} ⏎  ⏎ Finish setup: {setupUrl} |

## Composition
- **Artifact:** PINNED_NOTE / ANNOTATED_NOTE
- **Components (reading order):** EC02 DECKLED NOTE → EC06 CHECKLIST / STEPS → EC07 SINGLE CTA → EC16 EMAIL FOOTER → EC17 MARKETING PREFERENCES / UNSUBSCRIBE
- **Primary editorial gesture (options):** a pinned note with the remaining steps set like a printed checklist
- **Secondary tactile detail (options):** a brass clip or pin; pencil tick marks beside finished steps (decorative only)
- **Contrast anchor:** deep olive numerals
- **Environment:** NONE — a desk-surface crop at most.
- **Avoid:** guilt (“you forgot”); progress bars as images; countdowns
- **Live HTML (never image):** headline, body, firstName, remainingSteps[], resumeAt, CTA, links, footer, unsubscribe / preferences

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L2 pinned note shell | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Founds DESK_NOTE; derived by A06. |
| brass clip | EMAIL_DECORATIVE_INSERT | CREATE_NEW | Shared DESK_NOTE detail. |

Fixture: `FX_FINISH_SETUP` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
