# P0.JURNL.F01-PARENT-ASSET-HARVEST-PROOF1 — Summary

**Verdict: FAIL** (50% usable · threshold 80%)

One new F01.00 parent was generated (`z6y0GkA8kNuu8Egnk22P`) and assets were harvested **immediately** from that PNG with **zero** fallback asset regen.

## Passed (7)

- `ENTRY.ARCH.ARCHWAY.001`, `ENTRY.ARCH.COAST.001`
- `ENTRY.MATERIAL.TEXTILE.ROSE.001`, `ENTRY.MATERIAL.CURTAIN.001`
- `ENTRY.OBJECT.BUST.001`, `ENTRY.OBJECT.BOWL.001`
- `ENTRY.BOTANICAL.ACCENT.001`

## Failed (7)

- Materials: `PLASTER`, `TRAVERTINE`, `PAPER` (contamination / edge heuristics)
- Objects: `BOOKS`, `JURNLBOOK` (segmentation / alpha heuristics)
- Botanical: `FOREGROUND` (contamination)
- Light: `SUN` (overlay heuristic fail)

## Conclusion

**Hypothesis not supported:** harvesting from a freshly generated parent in the same run does **not** reliably produce implementation-ready isolated assets.

**Recommended next method:** **ASSET-FIRST GENERATION PIPELINE** (generate canonical assets first → compose parent → compose children from same library).

**Family 01 repair without regenerating children:** **NO** (not at ≥80% asset readiness via extraction alone).

See `HARVEST_CONTACT_SHEET.png` and `HARVEST_PROOF_REPORT.json`.
