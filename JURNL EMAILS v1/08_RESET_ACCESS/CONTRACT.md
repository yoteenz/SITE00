# A08 — RESET YOUR ACCESS

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** PROVIDER_OWNED

**Family:** E06 SECURITY / ACCOUNT / TRANSACTIONAL · **message type:** PASSWORD_RESET · **lineage:** SECURE_CORRESPONDENCE

Let the person choose a new password, and tell them what to do if they did not ask.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A08 |
| FAMILY | E06 SECURITY / ACCOUNT / TRANSACTIONAL |
| PURPOSE | Let the person choose a new password, and tell them what to do if they did not ask. |
| TRIGGER_EVENT | AUTH_PASSWORD_RESET_REQUESTED (EXISTS_PROVIDER_OWNED) |
| ELIGIBILITY | Reset requested on F01.05 for an existing account |
| SUPPRESSION_RULES | Provider rate limit reached |
| COOLDOWN | PT60S (provider rate limit governs) |
| PERSONALIZATION_INPUTS | recipientEmail, recoveryUrl, requestedAt, linkExpiry (P1) |
| CTA_DESTINATION | entry/new-password |
| CONSENT_CLASS | TRANSACTIONAL · preference ACCOUNT_SECURITY |
| PRIORITY | CRITICAL |
| DUPLICATE_GUARD | Provider-owned (Supabase Auth); one active recovery link per address |
| DELIVERY_STATE | PROVIDER_OWNED |

Source: supabase.auth.resetPasswordForEmail in supabaseAuthAdapter.ts (F01.05 SEND RESET LINK); Supabase sends its "Reset password" template.

Needs before it can fire: Supabase custom template or Send Email Hook; redirectTo pointing at entry/new-password; Handling the PASSWORD_RECOVERY auth event (not handled today).

## States
| State | When | Differs by |
|---|---|---|
| REQUESTED | Reset requested | Only state |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | Reset your JURNL password |
| PREHEADER | Use this link to choose a new password. If you did not ask, ignore this email. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach monitored support. The footer says JURNL will never ask for a password or code by email. |
| EYEBROW | ACCOUNT |
| HEADLINE | RESET YOUR ACCESS. |
| MESSAGE_BODY | We received a request to reset the password for {recipientEmail}. |
| CTA | CHOOSE A NEW PASSWORD → {recoveryUrl} → entry/new-password |
| NOTICE | Requested {requestedAt}. This link expires {linkExpiry}. If you did not ask to reset your password, ignore this email; your password stays the same. |
| FALLBACK_TEXT | Reset your JURNL password. ⏎  ⏎ We received a request to reset the password for {recipientEmail}. Choose a new password: {recoveryUrl} ⏎  ⏎ This link expires {linkExpiry}. If you did not ask, ignore this email; your password stays the same. |

## Composition
- **Artifact:** ACCESS_CREDENTIAL / FORMAL_NOTICE
- **Components (reading order):** EC02 DECKLED NOTE → EC07 SINGLE CTA → EC13 SECURITY NOTICE → EC16 EMAIL FOOTER
- **Primary editorial gesture (options):** the SECURE_CORRESPONDENCE card, reused, with a formal notice layout
- **Secondary tactile detail (options):** the shared blind emboss
- **Contrast anchor:** black ink headline and an olive button
- **Environment:** NONE.
- **Avoid:** environment art; urgency theatre; marketing
- **Live HTML (never image):** headline, body, recipientEmail, recoveryUrl, requestedAt, linkExpiry, CTA, links, footer, security notice

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L2 correspondence card shell | EMAIL_ARTIFACT_SHELL | REUSE | From A02. |
| blind emboss mark | EMAIL_DECORATIVE_INSERT | REUSE | From A02. |

Fixture: `FX_RESET` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
