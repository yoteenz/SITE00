# 29 · Changed files and SHA map

Base `d6992b3fc` → branch `claude/jurnl-f05-dot01-shell-convergence-um0u93` (SHA in the final response; this package is part of
that commit). No financial, ledger, server, Supabase or V3 file changed.

| File | Change |
|---|---|
| `src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame.tsx` | new env SK01_FIELD (F05_MOTION_SIDEKICK, sheet tile at the parent's seam 1190, SK01 title paper + seal layers, baked nav paper with one owner + empty geometry marker); `absorb` (short-screen seam overlap, then height fit); per-env tile seating |
| `src/projects/jurnl/runtime/screens/f05/dot01/directoryScene.ts` (new) | the 06 / 22 scene-coordinate contract: kind papers, action surfaces, cells per count, zone, absorb, max crop, type sizes, 22 band / seam / boxes |
| `src/projects/jurnl/runtime/screens/f05/dot01/DirectoryPage.tsx` | 06 seated in board px on SK01_FIELD (DirectoryPaper, DirectoryAction); 22 EmptyBoard from its own band; LEARN ACCOUNT TYPES overlay; reorder (32) unchanged |
| `src/projects/jurnl/runtime/screens/f05/dot01/jurnl-f05-dot01.css` | `.d01-dir*` (06) and `.d01-empty*` (22) board styles; overlap feather; nav-paper marker |
| `src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/` (new files) | CARD06_{BANK,PAYOUT,CASH,CREDIT}, ACTION06_{ADD,REORDER}, ICON06_{ADD,REORDER}, SCENE_22, SCENE_22_TILE, SEAL_22 (WebP, alpha), F05_DOT01_SCENE06.json (source SHA-256, boxes, masked boxes) |
| `scripts/jurnl/f05-motion-pilot/extract_dot01_directory_scene.py` (new) | the deterministic lift (GrabCut + Telea inpainting of live-text pixels only; SHA-256 checked against the V9 manifest) |
| `scripts/jurnl/f05-motion-pilot/capture_dot01_directory_counts.ts` (new) | 06 at 0 / 1 / 2 / 3 / 4 / 5 / 7 pockets: screenshots + board rects |
| `scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts` | 25 reached under the zero-balance archive policy (`many-zero` world); ICONS=1 icon census |
| `tests/jurnlF05DirectoryScene.test.ts` (new) | 9 contract tests (C1–C7, E1–E2) |
| `e2e/jurnl/jurnl-f05-dot01-directory.e2e.ts` (new) | 06 with 1 / 2 / 4 / 7 pockets, art per kind, 22 journeys |
| `playwright.config.ts` | the new spec added to the `small` project list |
| `JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1/` | this package |
