# 02 · Capability recovery matrix

Each item comes from the OPUS1 audit (PR #1716): 5 regressions, 12 hidden capabilities, 10 placeholders. The "now" column describes
the behaviour on this branch, and every row has a test that exercises it.

## Confirmed menu regressions (5/5 fixed)

| Id | Regression | Now | Test |
|---|---|---|---|
| MR-1 | Display currency sat 2 taps deep, under PREFERENCES | 1 tap: YOUR FINANCES › CURRENCY & EXCHANGE. The row shows the live code | E2E R1, R3 |
| MR-2 | Bank connection status sat 2 taps deep, under PREFERENCES | 1 tap: CONNECTED ACCOUNTS & SYNC. Honest status plus YOUR POCKETS | E2E R1, R9 · unit H1 |
| MR-3 | Ask JURNL context sat 2 taps deep, under PREFERENCES | ASK JURNL row (1 tap) links to PRIVACY & CONSENTS, which holds the context switch | E2E R5 · unit C5 |
| MR-4 | Safe to Spend buffer sat 2 taps deep, under PREFERENCES | 1 tap: SAFE TO SPEND BUFFER. The row shows the amount kept aside | E2E R1, R4 |
| MR-5 | Exchange-rate disclosure (rate and update time) removed | Restored under the currency list: rate, update date, cached state, source, and the no-rate state | E2E R3 |

## Hidden or moved capabilities (12/12 reachable after onboarding)

| # | Capability | Where it was | Where it is now |
|---|---|---|---|
| 1 | Display currency | under PREFERENCES | CURRENCY & EXCHANGE |
| 2 | Connection status | under PREFERENCES | CONNECTED ACCOUNTS & SYNC |
| 3 | Ask JURNL context | under PREFERENCES | PRIVACY & CONSENTS › ASK JURNL CONTEXT (its own consent) |
| 4 | Safe to Spend buffer | under PREFERENCES | SAFE TO SPEND BUFFER |
| 5 | AI access | onboarding F01.11 only | PRIVACY & CONSENTS › AI ACCESS |
| 6 | Data export request | onboarding F01.11 only | PRIVACY & CONSENTS › DATA EXPORT (honest: not available, nothing requested) |
| 7 | Delete account | onboarding F01.11 only | PRIVACY & CONSENTS › REMOVE ACCESS › DELETE ACCOUNT (confirmation) |
| 8 | Revoke third-party access | onboarding F01.11 only | REMOVE ACCESS › REVOKE ("NO CONNECTED ACCOUNTS TO REVOKE") |
| 9 | Disable AI | onboarding F01.11 only | REMOVE ACCESS › DISABLE AI FEATURES (now also synced to the consent records) |
| 10 | Biometric | onboarding F01.12 only | PREFERENCES › SIGN-IN & SECURITY › FACE ID |
| 11 | Device trust | onboarding F01.12 only | PREFERENCES › TRUSTED DEVICE |
| 12 | Session revoke | onboarding F01.12 only | PREFERENCES › SIGNED-IN SESSIONS |

The onboarding screens and routes are unchanged. The same components run in either place: they take a `ToolNav` (close / open)
instead of the onboarding overlay. Covered by E2E R6.

## Placeholder destinations (10/10 remediated)

The placeholders used a toast or a dead button. Each one now opens a surface.

| # | Placeholder | Was | Now |
|---|---|---|---|
| 1 | HELP & SUPPORT (menu) | toast "NOT IN THIS PREVIEW YET" | HELP & SUPPORT folio. It states plainly that support is not available and that there is no channel, then links to in-app answers (connections, buffer, privacy, terms) |
| 2 | HELP & SUPPORT (ACCOUNT page) | toast | the same folio |
| 3 | PROFILE (ACCOUNT page) | toast | PROFILE folio: name and email, and "CHANGING YOUR NAME OR EMAIL IS NOT AVAILABLE YET" |
| 4 | NOTIFICATIONS | toast | PREFERENCES ("JURNL DOES NOT SEND NOTIFICATIONS YET") |
| 5 | SECURITY | toast | the FACE ID tool (F01.12) |
| 6 | CALENDAR (week start, date format) | toast | PREFERENCES ("NOT ADJUSTABLE YET") |
| 7 | DATA EXPORT | toast | the honest export sheet |
| 8 | LEGAL | toast | TERMS & POLICIES folio ("NOT PUBLISHED IN THIS PREVIEW YET") plus a link to your consents |
| 9 | MANAGE MEMBERSHIP | row with no handler | a static row, explicitly not a control: "NOT AVAILABLE YET · NO BILLING IS SET UP" |
| 10 | UNLOCK no-op | `onClick={() => undefined}` button | the feature card is a description (`div`), not a button |

Covered by E2E R8 and unit H3 / H4. No email address, phone number, request id or rule was invented.
