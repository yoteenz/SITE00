# A01 — WELCOME TO JURNL

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** NOT_WIRED

**Family:** E01 WELCOME / ARRIVAL · **message type:** WELCOME · **lineage:** ARRIVAL

Mark the person’s arrival once their account is verified, and give one clear first step.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A01 |
| FAMILY | E01 WELCOME / ARRIVAL |
| PURPOSE | Mark the person’s arrival once their account is verified, and give one clear first step. |
| TRIGGER_EVENT | AUTH_EMAIL_CONFIRMED (STATE_EXISTS_EVENT_NOT_EMITTED) |
| ELIGIBILITY | Account verified for the first time; Not a design-preview account |
| SUPPRESSION_RULES | Already sent (ever); Account deleted; PRODUCT_SERVICE_UPDATES off |
| COOLDOWN | ONCE |
| PERSONALIZATION_INPUTS | firstName, setupStarted (P1) |
| CTA_DESTINATION | setup |
| CONSENT_CLASS | LIFECYCLE_SERVICE · preference PRODUCT_SERVICE_UPDATES |
| PRIORITY | NORMAL |
| DUPLICATE_GUARD | A01:{userId} |
| DELIVERY_STATE | NOT_WIRED |

Source: Supabase Auth user.email_confirmed_at → JurnlAccount.emailVerified (supabaseAuthAdapter.ts).

Needs before it can fire: Production auth mounted (mode="production"); Server-side hook on auth.users email_confirmed_at, or a first-verified-session check.

## States
| State | When | Differs by |
|---|---|---|
| SETUP_NOT_STARTED | Setup draft not started | CTA BEGIN SETUP → setup |
| SETUP_STARTED | Setup started before verification completed | CTA CONTINUE SETUP → setup (resumes at resumeAt) |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | Welcome to JURNL, {firstName} |
| PREHEADER | Your financial life, beautifully organized. Here is where to begin. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address. |
| EYEBROW | WELCOME |
| HEADLINE | YOUR JURNL IS OPEN. |
| MESSAGE_BODY | {firstName}, JURNL keeps your money in one calm place: what is safe to spend, what is coming, and what you are planning for. / Start with a few minutes of setup. JURNL works from what you tell it. Nothing is sold, and linked accounts stay optional. |
| CTA | BEGIN SETUP → setup |
| FALLBACK_TEXT | Welcome to JURNL. ⏎  ⏎ Your JURNL is open. Start with a few minutes of setup: {setupUrl} ⏎  ⏎ Nothing is sold, and linked accounts stay optional. |

## Composition
- **Artifact:** WELCOME_LETTER / INVITATION
- **Components (reading order):** EC01 HERO CORRESPONDENCE → EC02 DECKLED NOTE → EC07 SINGLE CTA → EC16 EMAIL FOOTER → EC17 MARKETING PREFERENCES / UNSUBSCRIBE
- **Primary editorial gesture (options):** a folded welcome letter on heavy cream stock, cropped off the top edge; an invitation card leaning on a stone ledge
- **Secondary tactile detail (options):** olive blind-emboss on the card; a burgundy registration strip along one edge
- **Contrast anchor:** deep olive / black editorial ink headline on cream
- **Environment:** ARRIVAL still life: morning light on stone and linen, one olive sprig — no arch.
- **Avoid:** app screenshots; feature lists; confetti; a full loggia view
- **Live HTML (never image):** headline, body, firstName, setupStarted, CTA, links, footer, unsubscribe / preferences

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L1 arrival still life | EMAIL_ENVIRONMENT | CREATE_NEW | Founds the ARRIVAL lineage; reused by A04. |
| L2 welcome letter shell (top + edges) | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Blank stock; headline and copy stay HTML. |
| olive emboss | EMAIL_DECORATIVE_INSERT | CREATE_NEW | Shared ARRIVAL mark. |

Fixture: `FX_WELCOME` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
