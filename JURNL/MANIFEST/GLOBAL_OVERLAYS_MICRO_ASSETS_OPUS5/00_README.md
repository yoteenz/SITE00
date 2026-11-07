# GLOBAL OVERLAYS · CANONICAL MICRO-ASSETS AND UTILITY BUTTONS · OPUS5

SPRINT: P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5
STATUS: DRAFT · FOUNDER APPROVAL PENDING · DO NOT MERGE · DO NOT DEPLOY · NO DATABASE MUTATIONS

The handoff's GROK2 micro-assets now stand where line glyphs and generic backings stood. They go only where the surface under them is clean and its authority draws them:
- **CH02 PRIVACY:** icons, chevrons, and the switch track and thumb;
- **OV08 MENU:** icons and chevrons;
- **OV02 ADD A POCKET:** type icons, check disc, CANCEL and SAVE papers;
- **OV03 MOVE MONEY:** source and destination marks, CANCEL and RECORD papers;
- **OV04 MANAGE POCKET:** pencil, trash and chevrons;
- **OV05 SEARCH:** field magnifier, filter and result marks;
- **CH01 BUFFER:** the (i) mark;
- **OV01 MONEY ACTION:** chevrons.

The rest is held, blocked or gated, with the reason recorded for each item:
- OV07 is BLOCKED_ARTWORK;
- OV06 is protected under F09 / FD-12;
- three candidates are gated for founder review;
- a few masters are unfit or duplicate a role.

| File | What |
|---|---|
| `01_MOUNTED_ASSET_REGISTRY.csv` | all 70 handoff files: hash, screen, status, fidelity, mount location or the reason it is not mounted, the runtime file and its hash |
| `02_SCREEN_OWNERSHIP_MATRIX.csv` | per screen and element: layer (L0–L3), owner (baked / independent / live / GROK2 / founder utility), whether the background already paints it, the decision |
| `03_FOUNDER_APPROVAL_AND_BLOCKERS.md` | decisions for the founder, the exact blockers, held and unfit files, the glyphs still generic |
| `04_BEFORE_AFTER_RUNTIME.md` | the screen proofs and comparisons (images in the evidence ZIPs; two previews here) |
| `05_RESPONSIVE_AND_FOCUS_QA.md` | six viewports, focus, keyboard and reduced motion |
| `06_TEST_RESULTS.md` | typecheck, build, unit and E2E against the base head |
| `07_SOURCE_IMAGE_HASHES.csv` | the manifest SHA-256 and the verified SHA-256 of every handoff file |
| `derive_report.json` | machine output of `scripts/jurnl/overlays-opus5/derive_overlay_micro_art.py` |

Files:
- **Masters:** `JURNL/GLOBAL_EIGHT_OVERLAYS/MICRO_ASSETS_GROK2/`. These are the 59 masters and 3 candidates, byte-for-byte, plus the handoff manifests and `SHA256SUMS.txt`.
- **Runtime:** `src/projects/jurnl/runtime/global/overlayArt/`. There are 38 lossless WebPs and the generated registry.
- **Components:** `components/JurnlMicroArt.tsx` (`JurnlMicroArt`, `JurnlArtToggle`) and `components/jurnl-micro-art.css`.
