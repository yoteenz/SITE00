# IDNTY form control — Phase 1 implementation

**Sprint:** `P0.SITE00.IDNTY.FORM-CONTROL-IMPLEMENTATION.COMPOSER-PHASE1`  
**Integration base:** `cursor/idnty-founder-readiness-e2e-be3b` (includes persistence repair `a99d914d` / PR #1657)  
**Authority reference:** Opus2 commit `c5a773381` (PR #1658 draft — documentation retrieved selectively, not blind-merged)

Phase 1 delivers shared tokens, label primitives, focus/error normalization, and verified audit fixes **NF-01**, **NF-02**, and **C-1**, plus checkbox edge **NF-06** preparation. It does **not** implement Phase 2–4 behavior (Business Type sheet, System B checkboxes, required phone).

## Deliverables in this folder

| File | Purpose |
| --- | --- |
| `IMPLEMENTATION_DIFF.md` | What changed in production paths |
| `TOKEN_MAPPING.md` | Canonical `--df-*` tokens added or aliased |
| `COMPONENT_CHANGE_MATRIX.md` | Component-level before/after |
| `NF01_NF02_C1_VERIFICATION.md` | Measured fixes vs authority findings |
| `ACCESSIBILITY_VERIFICATION.md` | aria / focus / error associations |
| `RESPONSIVE_VERIFICATION.md` | Viewport checks |
| `VISUAL_REGRESSION_REPORT.md` | Screenshots and computed-style notes |
| `PERSISTENCE_REGRESSION_REPORT.md` | #1657 protection |
| `PHASE2_READINESS.md` | Selector sheet / listbox prerequisites |
| `FOUNDER_ACCEPTANCE_CHECKLIST.md` | Founder sign-off list |

## Visual evidence

Captured from workspace Vite (`127.0.0.1:5175`) at `/foundation/review#df-r-P02`:

- `/opt/cursor/artifacts/df-phase1-visual/p02-mobile-390.png`
- `/opt/cursor/artifacts/df-phase1-visual/p02-mobile-320.png`
- `/opt/cursor/artifacts/df-phase1-visual/p02-tablet-834.png`
- `/opt/cursor/artifacts/df-phase1-visual/p02-desktop-1440.png`

Re-run: `DF_CAPTURE_BASE=http://127.0.0.1:5175 node scripts/df-phase1-visual-capture.mjs`
