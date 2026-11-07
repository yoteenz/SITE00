# F05 MONEY · CANONICAL UTILITY ICON FAMILY · OPUS1

SPRINT: P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1
STATUS: IMPLEMENTED · FOUNDER APPROVAL PENDING · DO NOT MERGE · DO NOT DEPLOY

The four founder-supplied utility artworks (CLOSE, MENU, SEARCH, ADD) are now the visuals of these live controls:

- the MONEY parent's SEARCH, ADD and MENU;
- the seven overlay closes whose authorities draw the cream / gold circular close.

| File | What |
|---|---|
| `01_SOURCE_ASSET_AUDIT.md` | the four PNGs: hashes, true-alpha check, measured geometry, the mechanical derivation |
| `02_FOUR_ASSET_REGISTRY.json` | one record per asset: ID, source and production files, size, transparency, provenance, SHA-256, targets, accessibility, status |
| `03_UTILITY_BUTTON_COMPONENT.md` | `JurnlUtilityArtButton`: contract, sizing, hit areas, motion, the global hamburger claim |
| `04_SCREEN_MOUNT_MAP.csv` | every target, mounted or not, with the reason |
| `05_RESPONSIVE_VALIDATION.md` | 360×640 to 1440×900: discs, targets, page scroll, before and after |
| `06_FUNCTIONAL_REGRESSION_RESULTS.md` | typecheck, build, unit and E2E, against the BEFORE head |
| `11_KNOWN_GAPS.md` | what remains, and who decides |
| `derive_report.json` | machine output of `scripts/jurnl/utility-icons/derive_utility_icons.py` |
| `PREVIEW_*.jpg` | supplied PNG vs runtime vs live render; the header row before and after |

- Masters: `JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS/` (byte-for-byte, with `SHA256SUMS.txt`).
- Runtime: `src/projects/jurnl/runtime/global/utilityArt/`.
- Screenshots (BEFORE / AFTER, device scale 3) are in the evidence ZIPs.
