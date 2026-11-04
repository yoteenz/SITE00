# 04 · Shared SIDEKICK mapping

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

| SIDEKICK | Pixel pair | Used by | How |
|---|---|---|---|
| **SK01** · parent MONEY | authority 01 | 01 | The layered parent: SK01's text-free environment with the title paper, seal and four card papers as alpha layers (`F05_MOTION_*`, profile `SK01`). The four card papers' art also identifies each account kind in lists. SK01's torn nav paper is the dock paper on 01, 06 and 31. |
| **SK02** · account details | authority 02 | 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 22, 31, 32, 35 | `F05_DOT01_SK02_FIELD`: SK02 with its own papers removed and the olive field rebuilt underneath. SK02's papers (balance, stats, scenic, three strips) are alpha layers placed at their own coordinates. On 02 that reproduces the authority, and the other pages arrange the same papers or the paper kit. |
| **SK03** · receipt and overlays | authority 26 | 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 33, 34, 36, 37 | 26 runs on the **full** SK03: frame, strip and both button shapes stay baked, and the lettering, viewfinder corners, the user's photo and the controls are live. Every other overlay uses `F05_DOT01_SK03_FIELD` (papers removed, field rebuilt) with the paper kit. |

## Permanent identity

- **JURNL tag:** the small torn upper-left identity paper stays in every SIDEKICK, and its lettering is live text.
- **No ghosting:** no SIDEKICK carries baked lettering or controls. Extraction checked for ghost text (`qa/dot01_extraction_report.json`).

## Where the SIDEKICKs differ from the authorities

- **Measured differences:** 34 authorities were rendered separately from the SIDEKICKs, with their statue region differing by 15–57 % (doc 02).
- **Visible effect:**
  - their seal icons vary per screen, while the SIDEKICKs carry one laurel seal;
  - their stone and foliage details differ slightly.
- **What the runtime does:** it uses the SIDEKICKs, as the contract directs, and records each difference in doc 13. Substituting older artwork or generating replacements is not authorized.
