# 18 — Project Operations Experience (Families B-after-payment, N)

Boards: **M03, M18**, TP05, TL05, D04, D05, D18, UW04.

## Overview postures after payment

| Canonical | Headline | Lede | Status column next step |
|---|---|---|---|
| PROJECT_ACTIVE / IN_PROGRESS | YOUR FOUNDATION IS UNDERWAY | PAYMENT CONFIRMED BY STRIPE. SITE 00 IS SETTING UP YOUR DOMAIN, EMAIL AND SECURITY. | the current SITE 00 workstream |
| WAITING_ON_CLIENT | YOUR FOUNDATION NEEDS YOU | SETUP IS PAUSED ON ONE STEP ONLY YOU CAN TAKE. IT TAKES ABOUT TWO MINUTES. | the open action + CTA |
| WAITING_ON_PROVIDER | YOUR FOUNDATION IS UNDERWAY | WE'RE WAITING ON YOUR DOMAIN REGISTRAR TO CONFIRM A CHANGE. NOTHING IS NEEDED FROM YOU. | "PROVIDERS USUALLY CONFIRM WITHIN A BUSINESS DAY. WE CAN'T SPEED THIS UP, AND WE WON'T GUESS A TIME." |
| FINAL_VERIFICATION | FINAL VERIFICATION | EVERY PART OF YOUR FOUNDATION IS BEING CHECKED BEFORE HANDOFF. | SITE 00 FINISHES VERIFICATION |

"ABOUT TWO MINUTES" is an estimate of the client's own effort, defined per action type (G-06 metadata). It is not a project ETA.

## Workstreams (eight, real state only)

| Workstream | Source (CLIENT_SAFE projection of runbook/stages, G-07) |
|---|---|
| DOMAIN | 02_DOMAIN stage + domain ownership record |
| OWNERSHIP | ownership record (registrant / admin contact) |
| EMAIL | 03_PROFESSIONAL_EMAIL |
| DNS | 04_DNS_SECURITY (DNS tasks) |
| SECURITY | 04_DNS_SECURITY (SPF/DKIM/DMARC/2-step) |
| DEVICE | 05_DEVICE_SIGNATURE |
| VERIFICATION | 06_FINAL_VERIFICATION |
| RECORDS | `buildClientRecords` count ready vs pending |

Chips: DONE · IN PROGRESS · NEEDS YOU · WAITING ON PROVIDER · BLOCKED · NOT STARTED. A workstream with no recorded work shows NOT STARTED, in a dashed, muted card. **Nothing is animated as progress.** Grid: 4 across on D/UW, 2 on TL and in the D roadmap side column, 2 on TP, 1 on M.

## Fulfillment expectations

- "FOUNDATION SETUP TYPICALLY TAKES 2–3 BUSINESS DAYS."
- It starts only after payment and readiness (required information and access). This matches `timeline_readiness.production_started_at` and `missing_requirements`, which exist.
- The truth strip shows STARTED (`production_started_at`) or "PAUSED" while waiting on the client.
- No guaranteed date, no countdown, no date picker.

## Never shown to the client

INTERNAL_ONLY tasks, `internal_notes`, provider ticket ids, founder workload, margin, raw provider error text.
