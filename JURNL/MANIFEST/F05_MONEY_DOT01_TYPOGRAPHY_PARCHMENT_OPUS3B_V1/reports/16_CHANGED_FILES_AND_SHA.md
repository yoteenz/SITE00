# 16 · Changed files and SHA

| | |
|---|---|
| Branch | `claude/jurnl-f05-dot01-artwork-typography-um0u93` |
| SHA_BEFORE | `8e0b8d86182ab56f3f1aa4cd1d268a2e7d415ac0` |
| Implementation commit | `7a1fb1c6bf15783a840d39ea7eacf18904c6e560` |
| SHA_AFTER (branch head, this report) | the commit that adds this line (see `git log -1` on the branch) |

## Runtime (presentation only)

| File | Change |
|---|---|
| `src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame.tsx` | `OVERLAY_HEADINGS` (text-safe zones, per-line measures), `heading="wide"` title paper (V9 asset 12, mirrored) + the redrawn SK03 seal, per-line `titleSize` (exported), `OVERLAY_CONTENT_WIDE`, `contentScale` (cap 1.25 → 1.75) |
| `src/projects/jurnl/runtime/screens/f05/dot01/jurnl-f05-dot01.css` | OPUS3A pill surfaces for `.d01-btn` (dark / cream / destructive / 37 torn), scan-block pills and type, strip label / value type and columns, select floor, OPUS3B heading boxes, grounding shadows (strips, fields, chips, reorder rows, scan block, seals, title paper), 16 scan art slot |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/EntrySheets.tsx` | 16 wide paper + own seal + own scan art; 18 / 19 own seals; 17 / 20 own seals; 20 / 29 wide paper; 29 title on one line |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/AccountSheets.tsx` | 30 ACCOUNT SETUP on one line on the wide paper |

## Lifted surfaces (crop + alpha of approved pixels; provenance `SCENES/F05_DOT01_PILL_SK03.json`)

`src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/`: `F05_DOT01_PILL_SK03_DARK.webp`, `F05_DOT01_PILL_SK03_CREAM.webp`,
`F05_DOT01_SEAL_SK03.webp`, `F05_DOT01_SEAL_16…20.webp`, `F05_DOT01_SCANART_16.webp`, `F05_DOT01_PILL_SK03.json`.

## Tests and tools

| File | |
|---|---|
| `tests/jurnlF05Dot01ArtworkType.test.ts` | new unit suite (10) |
| `e2e/jurnl/jurnl-f05-dot01-artwork-type.e2e.ts` | new E2E suite (R1, R2, H × 6, S1) |
| `playwright.config.ts` | the new suite added to the `small` project's list |
| `scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts` | `CONTROLS=1` / `TEXT=1` census (read-only) |
| `scripts/jurnl/f05-motion-pilot/probe_dot01_long_content.ts` | long-content / keyboard probe (read-only) |
| `scripts/jurnl/f05-motion-pilot/lift_dot01_sk03_parts.py` | the lifts |
| `scripts/jurnl/f05-motion-pilot/build_dot01_artwork_type_evidence.py` | evidence builder |
| `JURNL/MANIFEST/F05_MONEY_DOT01_INTERACTIVE_ARTWORK_OPUS3A_V1/**`, `…_TYPOGRAPHY_PARCHMENT_OPUS3B_V1/**` | reports, evidence, metrics, tools |

Not changed: `src/projects/jurnl/data/**` (ledger, services, model), the editorial / V3 overlays, the OPUS3 scenes. The two
generation ledgers a probe run rewrites (`F05_PARENT_GENERATION_LEDGER.json`, `F03_GENERATION_LEDGER.json`) were restored.
