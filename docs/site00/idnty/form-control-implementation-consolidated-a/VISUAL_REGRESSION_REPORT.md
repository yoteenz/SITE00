# Visual regression report — Consolidated A

## Pipeline

- **Tool:** Playwright Chromium (not iPhone Safari).
- **Script:** `scripts/df-consolidated-a-visual-capture.mjs` + ad-hoc P03 service capture.
- **Route:** `/foundation/review#df-r-P02` (contact phone), `#df-r-P03` (System B service row).
- **Artifacts:** `/opt/cursor/artifacts/df-consolidated-a-visual/`

## Captures (2026-10-19)

| File | Viewport | Subject |
| --- | --- | --- |
| `CA-390x844-p02-contact-empty.png` | 390×844 | CONTACT NUMBER field |
| `CA-390x844-p02-phone-missing-error.png` | 390×844 | Missing phone after continue |
| `CA-390x844-p02-phone-invalid-error.png` | 390×844 | Invalid phone message |
| `CA-390x844-p02-intl-phone.png` | 390×844 | International valid input |
| `CA-390x844-p03-system-b-service.png` | 390×844 | Service row selection (System B) |
| `CA-320x700-p02-*` | 320×700 | Same P02 states (narrow) |
| `CA-834x1112-p02-*` | 834×1112 | Tablet portrait P02 |
| `CA-1194x834-p02-*` | 1194×834 | Tablet landscape P02 |
| `CA-1440x900-p02-*` | 1440×900 | Desktop P02 |

## Authority comparison

Compared against Opus2 boards **02 (text inputs)**, **03 (choice controls)**, **05 (validation)** at a structural level:

- Required asterisk on CONTACT NUMBER.
- Approved helper and error copy (uppercase).
- System B: ink box + red period when checked (P03 service row).

## Not captured in this run

- Save chip failure simulation (requires QA API harness route).
- Completion CTA full checkout flow (review harness static screens only).
- Disclosure checkbox on activation screen (separate review anchor; covered by component tests).

## Device truthfulness

| Check | Status |
| --- | --- |
| Mobile visual (Chromium) | PASS — artifacts present |
| Tablet visual | PASS |
| Desktop visual | PASS |
| Actual iPhone Safari | NOT RUN |
| VoiceOver | NOT RUN |
