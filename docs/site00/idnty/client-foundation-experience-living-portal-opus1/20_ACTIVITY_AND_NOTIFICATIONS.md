# 20 — Activity and Notifications (Families Q, R)

Boards: **M19, M20**, D20, UW01, X09, X12.

## Activity timeline (Q)

- **Entries come from recorded events only.** Each has a time, a client-language title, an optional sub-line and a small source tag on boards (for example `PAYMENT_CONFIRMED`, a board annotation only).
- Client-safe event allow-list: LINK_OPENED (as "FOUNDATION LINK OPENED") · INTAKE_STARTED · INTAKE_COMPLETED · QUOTE_CREATED · QUOTE_UPDATED · QUOTE_ACCEPTED · PAYMENT_CONFIRMED · PAYMENT_FAILED · PROJECT_ACTIVATED · STAGE_STARTED · STAGE_COMPLETED · CLIENT_ACTION_REQUESTED · CLIENT_ACTION_COMPLETED · FOUNDATION_VERIFIED · FOUNDATION_COMPLETED · BUILD_INTEREST_CAPTURED.
- Never shown: TASK_*, RUNBOOK_*, CREDIT_CREATED (commission), internal notes, founder identity beyond "SITE 00".
- Today `clientProjection` strips `events`, so a projected `client_activity[]` is needed (**G-08**).
- Placement: its own `ACTIVITY` view on all tiers; persistent in the UW status column; in the D status column on completion.

## Status refresh (X09)

- `STATUS AS OF h:mm` is the time of the last successful payload fetch (client clock, or server `fetched_at` once G-19 exists). The REFRESH link re-fetches.
- Busy: "CHECKING FOR UPDATES…".
- Failure: toast "COULDN'T REFRESH · SHOWING STATUS AS OF h:mm"; the last known state stays.
- Offline: banner "YOU'RE OFFLINE · SHOWING STATUS AS OF h:mm" with RETRY.
- **Never** "JUST UPDATED", "LIVE", pulsing dots or auto-incrementing timers.
- Auto-refresh: on `visibilitychange` to visible, at most once per 60 s. No polling loops, except the existing post-payment verification (10 × 3 s).

## Notifications (R)

- **Email is primary.** UPDATES BY EMAIL (the `COMM_PREFS` view; `CommunicationPreferences` exists unwired; API `update-communication-preferences` exists):
  - PROJECT ESSENTIALS: on and locked while the project is open.
  - STAGE UPDATES: on by default.
  - FROM SITE 00 LATER: off by default. This is marketing consent, matching `requires_consent: MARKETING` in `eventMap.ts`.
- **Push:** "NOT AVAILABLE YET · A FUTURE OPTION. EMAIL STAYS PRIMARY." **No permission prompt on first load, or ever, until push exists and is opted into from this page.**

## Email designs (design only — nothing sent; sending stays disabled)

| Email | Subject | CTA | Trigger (eventMap) |
|---|---|---|---|
| Taking shape | **YOUR FOUNDATION IS TAKING SHAPE** | **VIEW MY FOUNDATION** | INTAKE_COMPLETED (replaces FNDATN-01 #02 copy) |
| Proposal ready | YOUR PERSONALIZED PROPOSAL IS READY | VIEW MY FOUNDATION | QUOTE_CREATED after founder approval |
| Underway | YOUR FOUNDATION IS UNDERWAY | VIEW MY FOUNDATION | PAYMENT_CONFIRMED |
| Needs you | YOUR FOUNDATION NEEDS ONE THING FROM YOU | VIEW MY FOUNDATION | CLIENT_ACTION_REQUESTED |
| Sign-in | YOUR SITE 00 SIGN-IN LINK | OPEN MY FOUNDATION | reentry request (new, G-09/G-14) |

Every email uses the same structure:
1. Masthead SITE 00 / DIGITAL FOUNDATION.
2. Crown object.
3. Rail, headline, lede.
4. Facts block (where relevant).
5. CTA, with the note "THIS BUTTON ASKS YOU TO CONFIRM YOUR EMAIL IF YOU'RE ON A NEW DEVICE. IT IS NOT A PASSWORD."
6. Footer with REF and the essential-email statement.

CTA links point to `/foundation/return?src=email&e=<event>`, not the bearer token, once G-09 lands. Until then the existing token link is used, as today.
