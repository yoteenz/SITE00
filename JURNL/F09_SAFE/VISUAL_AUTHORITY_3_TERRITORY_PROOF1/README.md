# JURNL F09 SAFE TO SPEND — Visual Authority 3-Territory Proof 1

**Sprint:** `P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1` · 2026-10-06

**Purpose.** This is the first JURNL family to re-enter the Visual Authority Development pipeline. It is a controlled test: can JURNL's upstream contracts produce three strong, distinct, brand-true SAFE TO SPEND compositions with zero legacy visual leakage?

**End state:**
- 3 TERRITORIES PRODUCED
- 3 REFERENCE CANDIDATES PRODUCED
- FOUNDER REVIEW REQUIRED (verdict PENDING)

**What this package does not do:**
- No winner is selected.
- No `PAGE_FAMILY_AUTHORITY` is locked.
- No page is implemented and no production JURNL UI changed.
- No OpenArt was used and no paid generation ran.

**Start with the [founder review pack](F09_FOUNDER_REVIEW_PACK.md).**

## Contents

| File | What |
|---|---|
| [F09_FOUNDER_REVIEW_PACK.md](F09_FOUNDER_REVIEW_PACK.md) | The three territories side by side, what to judge, verdict options, open decisions |
| [F09_SOURCE_MAP.md](F09_SOURCE_MAP.md) | Every source used: role, canonical status, contribution |
| [F09_EXPERIENCE_SUMMARY.md](F09_EXPERIENCE_SUMMARY.md) | The experience truth: decision, five-second content, states, actions, dependencies |
| [F09_LEGACY_VISUAL_FIREWALL.md](F09_LEGACY_VISUAL_FIREWALL.md) | How the firewall was enforced; functional facts retained; LEGACY_VISUAL_LEAK = 0 |
| [F09_TERRITORY_01_CONTRACT.md](F09_TERRITORY_01_CONTRACT.md) | 01 THE OPEN FLOOR |
| [F09_TERRITORY_02_CONTRACT.md](F09_TERRITORY_02_CONTRACT.md) | 02 THE PLAIN ANSWER |
| [F09_TERRITORY_03_CONTRACT.md](F09_TERRITORY_03_CONTRACT.md) | 03 THE OPEN ENVELOPE |
| [F09_TERRITORY_DISTINCTNESS_MATRIX.md](F09_TERRITORY_DISTINCTNESS_MATRIX.md) | Ten-dimension matrix + the gate evaluator (6 / 6 on every pair) |
| [F09_UPSTREAM_CONTRACT_SCORECARD.md](F09_UPSTREAM_CONTRACT_SCORECARD.md) | **Primary deliverable:** contract scores and the verdict PARTIAL |
| `F09_TERRITORY_PROOF_REGISTRY.json` | Generated from `shared/studioos-visual-authority/projects/jurnl/f09-safe-to-spend.ts` (do not edit by hand) |
| `F09_GENERATION_LEDGER.json` · `RENDER_LOG.json` | Renders, re-renders and cost |
| `REFERENCE_CANDIDATES/` | The 3 mobile candidates (393×852 @3x), the review board, and the HTML / CSS / SVG sources |
| `BLUR_TEST/` | Imagery-removed and imagery-blurred variants + the board (QA evidence, not candidates) |

## Reproduce

```bash
node scripts/jurnl/f09-territory-proof-render.mjs              # re-render candidates, blur test, boards
npx tsx scripts/studioos/jurnl-f09-territory-proof-export.ts   # regenerate F09_TERRITORY_PROOF_REGISTRY.json
npx vitest run tests/jurnlF09VisualAuthorityTerritoryProof1.test.ts
```

## Lineage

**Older F09 artifacts are kept, not overwritten.** The following stay as they were:
- `JURNL/F09_SAFE/MANIFEST/*`: brief, expression tree, plate occupancy, parent authority (ENV.LOGGIA, founder UNREVIEWED), generation ledger
- the refinement-2 F09 composition (TENSION_THRESHOLD)

**Nothing is superseded yet.** If the founder selects or combines a territory, the new F09 CLIENT parent authority supersedes:
- the ENV.LOGGIA parent authority
- the TENSION_THRESHOLD live composition

That supersession is recorded only after the verdict.

**Reference candidates are authorities, not runtime assets.** Nothing under `src/` references this folder, and a test enforces it.
