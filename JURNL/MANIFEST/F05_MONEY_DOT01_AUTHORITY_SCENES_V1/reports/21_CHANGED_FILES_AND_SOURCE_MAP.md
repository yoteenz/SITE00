# 21 · Changed files and source map

Branch `claude/jurnl-f05-dot01-authority-scenes-um0u93`: `f7e2739c` (#1713) → `3604d2e7` (OPUS1 cherry-pick, same
patch as #1707 `0e930112`) → this sprint's commit (SHA in the final response).

## Runtime

| File | Change |
|---|---|
| `src/projects/jurnl/runtime/screens/f05/dot01/accountScenes.ts` | **new** — the four account compositions (02 SK02 · 03 / 04 / 05 authority scene band), `seatActionRows`, row constants |
| `src/projects/jurnl/runtime/screens/f05/dot01/AccountPage.tsx` | shared data / actions / chips / hold kept; geometry and art now come from the page's composition; `CARD_ART` thumbnails removed; 03 rows SPENDABLE / PENDING / CARD STATUS, 04 LAST UPDATED (authority wording); strip papers seated per viewport |
| `src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame.tsx` | content region clamped to the screen on short phones (scrolls inside itself, `data-clamped`); an overlay opens on its first content control (fixes a pre-existing production-only focus defect, report 12) |
| `src/projects/jurnl/runtime/screens/f05/dot01/jurnl-f05-dot01.css` | stat figure size var, strip label size var, scene summary rows, upright OWED with longer rules, tight-row icons |
| `src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/` | **new** — `F05_DOT01_SCENE_03/04/05.webp`, `F05_DOT01_SEAL_03.webp`, `F05_DOT01_SCENES.json` (520 KB total) |

## Tools (deterministic; Python with `python -I`, TypeScript with `npx tsx`)

| File | Purpose |
|---|---|
| `scripts/jurnl/f05-motion-pilot/extract_dot01_account_scenes.py` | lifts the scene bands from the lossless authorities; reconstructs only live-text pixels; writes the geometry JSON |
| `scripts/jurnl/f05-motion-pilot/compare_dot01_account_scenes.py` | text-masked comparison of 02–05 in authority px |
| `scripts/jurnl/f05-motion-pilot/compare_dot01_all_screens.py` | unmasked structural comparison of all 37 |
| `scripts/jurnl/f05-motion-pilot/build_dot01_scene_evidence.py` | evidence sheets (before / after, enlarged, overlay, diff, layers, source map) |
| `scripts/jurnl/f05-motion-pilot/capture_dot01_account_boards.ts` | DSF board capture of 02–05 + DOM rects in board px |
| `scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts` | read-only 37-state × N-viewport probe (scroll, reachability, captures) |

## Tests

| File | Change |
|---|---|
| `tests/jurnlF05AccountScenes.test.ts` | **new** — A1–A5 compositions, R1–R3 action rows on 6 phone sizes (8 tests) |
| existing tests | **unchanged**; none weakened |

## Evidence

`JURNL/MANIFEST/F05_MONEY_DOT01_AUTHORITY_SCENES_V1/` (reports 01–22, evidence, metrics).

## Source map (what every pixel of 03–05 comes from)

| Region | Source | Approval |
|---|---|---|
| environment, heading paper, bust, arch, lemons, bottom landscape | V9 SK02 (papers lifted) | V9 handoff |
| scene band (objects, parchment, rules, engraving, botanicals, ground) | the screen's own V9 authority PNG, text pixels reconstructed | V9 handoff (authority) — founder confirmation D1 |
| 03 car seal | V9 authority 03 | idem |
| action-row papers | V9 SK02 strips | V9 handoff |
| row icons | founder micro-assets Batches 01–04 / vector fallbacks | founder (Batches 01–04) |
| all text, figures, chips | live DOM | — |

Side-effect ledgers rewritten by the unit suite (`F05_PARENT_GENERATION_LEDGER.json`, `F03_GENERATION_LEDGER.json`)
were restored before commit.
