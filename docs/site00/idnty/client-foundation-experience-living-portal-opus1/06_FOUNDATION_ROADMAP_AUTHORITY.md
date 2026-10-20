# 06 — Foundation Roadmap Authority (Family C)

Boards: **M04**, TP01, TL01, D06, X04, M18, D18.

## Stages (locked client language)

| # | Stage | Done when (canonical) | Client sub-line |
|---|---|---|---|
| 1 | INTAKE RECEIVED | intake_state COMPLETE | YOUR REQUIREMENTS ARE WITH SITE 00. |
| 2 | FOUNDATION REVIEW | founder approves proposal (G-02) | SITE 00 REVIEWS WHAT YOU NEED. |
| 3 | PERSONALIZED PROPOSAL | client accepts current version | YOUR SCOPE, PRICED FOR YOUR BUSINESS. |
| 4 | APPROVAL & PAYMENT | payment_state PAID (webhook) | ACCEPT YOUR PROPOSAL AND PAY SECURELY. |
| 5 | FOUNDATION SETUP | project_state FINAL_VERIFICATION | DOMAIN, EMAIL, DNS, SECURITY, DEVICES. |
| 6 | FINAL VERIFICATION | completion_state COMPLETE | EVERYTHING IS CHECKED BEFORE HANDOFF. |
| 7 | COMPLETE | — | YOUR FOUNDATION IS ESTABLISHED. |

Derivation: `clientStage()` in `04`. The seven operational stages (`FOUNDATION_STAGE_ORDER` 01_DETAILS_RECEIVED … 07_FOUNDATION_COMPLETE) live **inside** client stage 5 as workstreams (`18`). They are not exposed as a second roadmap.

## Representation per tier

| Tier | Summary | Full list |
|---|---|---|
| M | 7 ticks (4px bars): black = done, red = current, grey = upcoming. Labels: "STAGE n OF 7 · NAME" / "NO PERCENTAGES. STAGES ONLY." | Vertical stage rows with a 1.5px connector |
| TP · TL · D · UW | 7-cell strip: dot, name, DONE / NOW / NEEDS YOU / WAITING / — | Same rows. On D/UW the workstreams sit beside them during setup |

## Dot grammar

DONE: black disc with a white check. CURRENT: 4px red ring. NEEDS YOU: red disc. WAITING ON PROVIDER: dashed ring. BLOCKED: red square with a white bar. UPCOMING: grey ring. The meaning never depends on colour alone: each dot carries a text label on the right (`cf-road__x`).

## Rules

- No percentages, no countdowns, no animated fill, no "x% complete".
- The current stage row gets a white fill and a 3px red inset bar.
- BLOCKED always says what unblocks it ("PAUSED: WE CAN'T REACH YOUR REGISTRAR WITHOUT YOUR APPROVAL.") and links to NEEDS YOU.
- Timing paragraph: "FOUNDATION SETUP TYPICALLY TAKES 2–3 BUSINESS DAYS. IT STARTS ONLY AFTER PAYMENT IS CONFIRMED AND WE HAVE WHAT WE NEED FROM YOU. DATES ARE NEVER GUARANTEED."

## Source

`P08Roadmap` / `P09StageDetail` exist unwired in `ProjectPortal.tsx`. Re-wire them, re-skin them to this grammar, and replace the six-step `foundationProgress` (intake-oriented) with the seven client stages for the portal. `foundationProgress` keeps its role inside P01–P03.
