# OPUS3 · curated clean artwork, child environments on the shared OV08 environment

Sprint: P0.JURNL.GLOBAL-OVERLAYS.CLEAN-ARTWORK-CURATED-MOUNT-AND-CHILD-ENVIRONMENT-CONVERGENCE.OPUS3 (draft, founder review).

| Doc | Contents |
|---|---|
| `01_PROVENANCE_SHA256.md` | the 15 curated files, their SHA-256, the runtime copies and their SHA-256 / encoding |
| `02_SOURCE_TO_RUNTIME_MOUNT_MAP.md` | which art each surface draws, its layer and its live regions |
| `03_CONDITIONAL_ASSET_DISPOSITION.md` | the per-file review of the conditional Buffer / Privacy pieces |
| `04_AUTHORITY_COMPARISON.md` | every surface rechecked against its founder authority after the founder correction |
| `05_REMAINING_LIMITATIONS.md` | what still needs art or a decision |
| `06_VALIDATION.md` | typecheck, build, unit, E2E (pre-existing failures separated), runtime captures |
| `derive_report.json` | the machine report of `scripts/jurnl/global-menu/derive_clean_artwork.py` |
| `captures/` | before / after strips at six viewports and the authority-vs-runtime pairs |

Reproduce: `python3 -I scripts/jurnl/global-menu/derive_clean_artwork.py JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3 src/projects/jurnl/runtime/global/overlays/clean`
· captures: `npx tsx scripts/jurnl/global-menu/capture_opus3_states.ts <out>` against the dev server on :5174.
