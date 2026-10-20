# 15 — Recommendation Selection (Family J)

Boards: **M14**, TP03, TL03, D14, TL10.

## The five answers (every recommendation)

| Row | Example (DNS CLEANUP) |
|---|---|
| WHAT IT IS | REMOVE OLD RECORDS LEFT BY A PREVIOUS PROVIDER. |
| WHY FOR YOU | WE FOUND 4 CONFLICTING RECORDS ON YOUR DOMAIN. |
| NECESSARY? | REQUIRED FOR RELIABLE EMAIL. |
| COST | $150 · ONE TIME · EXAMPLE |
| IF YOU DECLINE | SENDS YOUR PROPOSAL BACK TO SITE 00 FOR REVIEW. |

Card anatomy:
- Header: icon, name, and a classification chip (`RECOMMENDED · REQUIRED` red, or `OPTIONAL` muted).
- The five rows (label column 132px).
- Footer: inclusion caption and an INCLUDE / DECLINE segmented control.
- Cards stack on M/TP, sit 2 across on TL and 3 across on D/UW.

## Behaviour

| Action | Optional item | Required item |
|---|---|---|
| INCLUDE ↔ DECLINE | Immediate quote update. Uses the existing `update-quote` / `remove-addon`, which creates v+1 server-side, with the new total in the truth strip | Opens OL-C05 "DECLINE DNS CLEANUP?" |
| Confirm decline | — | "DECLINE AND SEND FOR REVIEW" → the proposal goes back to FOUNDATION REVIEW; the stage returns to 2. Needs a server route (G-17) |
| Keep | — | Dialog closes, nothing changes |

While a required item is declined, the page shows an alert and the truth strip reads `PROPOSAL V2 → REVIEW · TOTAL SET AFTER REVIEW`. Acceptance and payment are unavailable until the new version arrives.

## Data

- Classification and reasons per add-on need a recommendation payload: `required`, `reason`, `decline_effect` (**G-25**). `recommendationEngine.ts` computes recommendations server-side but does not expose reasons to the client.
- `requires_manual_review` stays as it is today (AWAITING_FOUNDER_PRICING).
