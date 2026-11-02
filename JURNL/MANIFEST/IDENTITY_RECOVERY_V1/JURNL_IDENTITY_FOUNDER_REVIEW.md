# JURNL identity — founder review

## What was recovered

The approved horizontal identity is **`F09_LOCKUP.png`**: olive sprig over outlined **JURNL**. It matches the lockup on the Safe to Spend reference and the sprig on ENTRY Welcome.

Committed reusable components (exact extraction, reproducible):

- `LOCKUP_SPRIG.png`
- `LOCKUP_WORD.png`

## What stays superseded

- Vertical `jurnl-logo-official.png` and all duplicates listed in `SUPERSEDED_REFERENCE_LIST.md`
- F02 horizontal rose rearrangements and the painted SETUP rose lockup

## Fidelity

Component extraction passes (`component_fidelity_pass: true`). See `reports/JURNL_IDENTITY_FIDELITY_REPORT.json` and `JURNL_CANONICAL_IDENTITY_COMPARISON_BOARD.jpg`.

## Decisions requested

1. Confirm **`F09_LOCKUP.png` + sprig/word layers** as the **RECOVERED_CANONICAL_CANDIDATE** for JURNL image-to-image identity (replacing the vertical file in attach lists only).
2. Confirm whether **`jurnl-logo-official.png` runtime consumers** (F01 package `JurnlLogo`) should migrate to the horizontal treatment in a **separate approved sprint** (not done here).
3. Confirm whether a **clean isolated lockup PNG** (no plaster) should be cut from an approved full-page authority in a follow-up extraction pass, or whether layers + live type remain sufficient.

## Until confirmation

- `registration_status`: `RECOVERED_CANDIDATE_FOUNDER_CONFIRMATION_PENDING`
- `ready_for_corrected_generation` on the hygiene manifest stays **false**
- No TODAY / ACTIVITY / SETUP / EMAIL regeneration
