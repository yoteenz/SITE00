# JURNL identity — founder review V2

## 01 — Source and provenance

- **Canonical frame:** `src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png` @ `f29774719…`
- **Evidence pages:** Safe to Spend reference, ENTRY Welcome sprig alignment
- **Superseded:** `public/site00/projects/jurnl/brand/jurnl-logo-official.png` (vertical botanical)

## 02 — Original F09 approved authority

See review ZIP folder `01_f09_lockup/` (copy of source PNG).

## 03 — Recovered candidate (V1)

Committed layers: `LOCKUP_SPRIG.png`, `LOCKUP_WORD.png` — pixel-identical to deterministic re-extract (V1 fidelity report).

## 04 — V2 clean extraction

V2 candidates in `JURNL/MANIFEST/IDENTITY_RECOVERY_V2/assets/` — **byte-identical** to committed layers (same haze recipe as `export_assets.py`). No generative cleanup applied.

## 05–06 — Components

Sprig and wordmark PNGs (see ZIP folders `05_sprig/` `06_wordmark/`).

## 07 — Comparison

`JURNL/MANIFEST/IDENTITY_RECOVERY_V1/JURNL_CANONICAL_IDENTITY_COMPARISON_BOARD.jpg` + V2 `JURNL_CANONICAL_IDENTITY_FIDELITY_BOARD.jpg`.

## 08 — Transparency inspection

`JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_CANONICAL_IDENTITY_TRANSPARENCY_QA.jpg` — white, ivory, grey, charcoal, checker.

**Finding:** No high-luminance “plaster fill” pixels inside ink; **partial** low-alpha edge tint (~64 sprig / ~22 word edge pixels near plaster color).

## 09 — Recomposition

Layer composite MAE **0** vs haze-treated lockup on ink mask. Full plaster matte **not** reproduced (expected).

## 10 — Technical QA summary

`JURNL/MANIFEST/IDENTITY_RECOVERY_V2/reports/JURNL_CANONICAL_ASSET_TECHNICAL_REPORT.json`

| Check | Result |
| --- | --- |
| Design lineage | **CONFIRMED** |
| Layer fidelity | **PASS** |
| Clean primary (universal PNG) | **PARTIAL** |
| Full F09 frame as logo | **BLOCKED** |

## 11 — Registration status

`RECOVERED_IDENTITY_REGISTRY.json` — separate fields for design vs production vs migration. **Founder confirmation still pending.**

## 12 — Downstream migration

See `JURNL_CANONICAL_IDENTITY_MIGRATION_MATRIX.md`. **No runtime changes** in this sprint.

## 13 — Outstanding decisions

1. Confirm **F09 horizontal lockup** as canonical identity lineage (design).
2. Accept **edge tolerance** for layer reuse on arbitrary backgrounds, or require a historical transparent master if one exists off-repo.
3. Authorize **runtime swap** of `JurnlLogo` away from vertical PNG (separate sprint).
4. Set `ready_for_corrected_generation` (reference manifest) — **not** automatic with this sprint.

## Reference pack readiness (no regeneration)

| Family lane | Status |
| --- | --- |
| **TODAY** | **BLOCKED** — F03 parent/plate gate + `ready_for_corrected_generation: false` |
| **ACTIVITY** | **BLOCKED** — same |
| **SETUP** | **BLOCKED** — founder/page-authority gates |
| **EMAIL** | **BLOCKED** — pack hygiene + identity founder review |
