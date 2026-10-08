# A02 — VERIFY YOUR EMAIL

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** PROVIDER_OWNED

**Family:** E06 SECURITY / ACCOUNT / TRANSACTIONAL · **message type:** EMAIL_VERIFICATION · **lineage:** SECURE_CORRESPONDENCE

Confirm the person owns the address before the account opens.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A02 |
| FAMILY | E06 SECURITY / ACCOUNT / TRANSACTIONAL |
| PURPOSE | Confirm the person owns the address before the account opens. |
| TRIGGER_EVENT | AUTH_SIGNUP_CONFIRMATION_REQUESTED (EXISTS_PROVIDER_OWNED) |
| ELIGIBILITY | Sign-up or RESEND EMAIL on F01.02 |
| SUPPRESSION_RULES | Address already verified; Provider rate limit reached |
| COOLDOWN | PT60S (provider rate limit governs resends) |
| PERSONALIZATION_INPUTS | recipientEmail, confirmationUrl, linkExpiry (P1) |
| CTA_DESTINATION | entry/verify-email |
| CONSENT_CLASS | TRANSACTIONAL · preference ACCOUNT_SECURITY |
| PRIORITY | CRITICAL |
| DUPLICATE_GUARD | Provider-owned (Supabase Auth); one active confirmation link per address |
| DELIVERY_STATE | PROVIDER_OWNED |

Source: supabase.auth.signUp and supabase.auth.resend({ type: "signup" }) in supabaseAuthAdapter.ts; Supabase sends its "Confirm signup" template.

Needs before it can fire: Supabase custom email template or Send Email Hook to apply the JURNL authority; emailRedirectTo pointing at the JURNL verify route.

## States
| State | When | Differs by |
|---|---|---|
| FIRST_SEND | On sign-up | Standard copy |
| RESEND | RESEND EMAIL | Notice adds: “This replaces the earlier link.” |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | Verify your email for JURNL |
| PREHEADER | One step to open your account. If this was not you, ignore this email. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach monitored support. The footer says JURNL will never ask for a password or code by email. |
| EYEBROW | ACCOUNT |
| HEADLINE | VERIFY YOUR EMAIL. |
| MESSAGE_BODY | Confirm that {recipientEmail} is yours to finish opening your JURNL account. |
| CTA | VERIFY MY EMAIL → {confirmationUrl} → entry/verify-email |
| NOTICE | This link expires {linkExpiry}. If you did not create a JURNL account, ignore this email; no account opens without this step. |
| FALLBACK_TEXT | Verify your email for JURNL. ⏎  ⏎ Confirm that {recipientEmail} is yours: {confirmationUrl} ⏎  ⏎ This link expires {linkExpiry}. If you did not create a JURNL account, ignore this email. |

## Composition
- **Artifact:** ACCESS_CREDENTIAL / PRIVATE_CORRESPONDENCE
- **Components (reading order):** EC02 DECKLED NOTE → EC07 SINGLE CTA → EC13 SECURITY NOTICE → EC16 EMAIL FOOTER
- **Primary editorial gesture (options):** a private correspondence card, plain and centred, with generous margins
- **Secondary tactile detail (options):** a single blind emboss of the JURNL mark
- **Contrast anchor:** black ink headline and an olive button
- **Environment:** NONE — security mail carries no environment art.
- **Avoid:** environment art; marketing; red alert colours; anything that looks like phishing
- **Live HTML (never image):** headline, body, recipientEmail, confirmationUrl, linkExpiry, CTA, links, footer, security notice

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L2 correspondence card shell | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Founds SECURE_CORRESPONDENCE; reused by A08. |
| blind emboss mark | EMAIL_DECORATIVE_INSERT | CREATE_NEW | Shared security mark. |

Fixture: `FX_VERIFY` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
