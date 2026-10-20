# 07 — Needs You Authority (Family D)

Boards: **M05, M06**, TP06, TL06, D07, D08, UW05, X10.

## Purpose

This area holds only the steps that need the client's **decision, access or details**. It is never a to-do list of SITE 00's own work.

## Action states (five)

| State | Visual | Canonical source | CTA |
|---|---|---|---|
| OPEN | red border, red filled-dot chip | `ClientActionRequest.status = OPEN`, no draft, no response | START |
| IN PROGRESS | ink chip | OPEN + saved draft (**G-04**) | CONTINUE |
| SUBMITTED | dotted-ring chip | OPEN + `response` set, awaiting SITE 00 (**G-05**: payload must include it; today only OPEN without response is meaningful) | VIEW WHAT YOU SENT |
| RESOLVED | grey disc chip, transparent card, muted title | COMPLETED (**G-05**: payload filters to OPEN today) | — |
| BLOCKED | red left bar 4px, solid red chip | dependency on another open action (**G-06**) | — (says what blocks it) |

CANCELLED actions are not shown.

## List composition

- The hero (no object): "WHAT NEEDS YOU". When empty: "ALL CLEAR" with "THERE IS NOTHING FOR YOU TO DO. SITE 00 IS WORKING ON YOUR FOUNDATION."
- A state legend: all five chips, on the populated list only.
- Open, in-progress, submitted and blocked items first, ordered by `created_at`. Then a RESOLVED section.
- Note: "BLOCKED STEPS OPEN AUTOMATICALLY WHEN THE STEP BEFORE THEM IS DONE. SUBMITTED STEPS ARE WITH SITE 00."
- Desktop status column: the single step holding up setup, with a START button.

## Before payment

The proposal and payment steps appear as NEEDS YOU items ("REVIEW YOUR PROPOSAL", "COMPLETE PAYMENT"), and founder questions appear as CUSTOM_REQUEST items. These items are derived from the lifecycle, not stored as client actions, except founder questions, which are stored.

## Action detail (`ACTION` view)

- Back link (NEEDS YOU), rail `03 NEEDS YOU · ACTION`, headline in plain words ("CONNECT YOUR REGISTRAR").
- One sentence on why it is needed and what the client keeps ("YOU STAY THE OWNER").
- A spec block of facts: domain, and what SITE 00 gets ("DNS ONLY · NO BILLING ACCESS").
- Fields, a consent checkbox, SUBMIT APPROVAL and I NEED HELP.
- Permanent note: "NEVER SHARE A PASSWORD HERE. SITE 00 WILL NEVER ASK FOR ONE IN THIS PORTAL."

The submitted and blocked variants are on M06 and D08.

## Interaction

The SUBMIT control:
- Busy text: "SUBMITTING…".
- Success: the view moves to SUBMITTED, with the toast "SENT TO SITE 00".
- Error: "THAT DIDN'T SEND — IT'S STILL HERE — TRY AGAIN", with input kept.
- Disabled until required fields and consent are set.
- Focus moves to the result heading.

API: `complete-client-action` (exists), session-bound once G-09 lands.

## Source

`P10NeedsYou` exists unwired; its APPROVE / REQUEST CHANGES / SUBMIT INFORMATION call `completeClientAction`. Composer re-wires it and maps the five states.
