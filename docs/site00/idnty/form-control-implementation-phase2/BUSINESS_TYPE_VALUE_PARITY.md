# Business Type value parity

**Source:** `BUSINESS_TYPES` in `src/site00/foundation-client/model.ts` (unchanged).

| # | Value |
| --- | --- |
| 1 | PROFESSIONAL SERVICES |
| 2 | CONSTRUCTION + TRADES |
| 3 | TRANSPORTATION + LOGISTICS |
| 4 | HEALTH + WELLNESS |
| 5 | FOOD + HOSPITALITY |
| 6 | RETAIL + E-COMMERCE |
| 7 | REAL ESTATE |
| 8 | CREATIVE + MEDIA |
| 9 | NONPROFIT |
| 10 | OTHER |

**Legacy:** values not in the list render as `{VALUE} · ON FILE · NOT IN THE LIST` with `value` equal to the stored string (no `__custom` token in IdntySelect path).

**Payload:** `intakeFromDraft` / `updateIntake` still read/write `industry` string unchanged.
