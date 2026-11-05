# 01 · Baseline and source authority

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Field | Value |
|---|---|
| Implementation branch (verified with `git ls-remote` at sprint start) | `claude/jurnl-f05-money-motion-pilot-um0u93` — still the complete DOT 01 (the integration head `ad7ac177` lacks the founder child-page correction; DOT 01 audit doc 01) |
| SHA_BEFORE | `f23032ac71536de7f2d549b9527d6dd623c29816` |
| SHA_AFTER | `be8718b760ef6d8896573339f0db887c8af788fb` |
| PR | #1707, draft, stacked on #1706 → #1705 |
| Financial integration | canonical ledger (#1705 / #1706) unchanged; DOT 01 reads it through `data/f05/dot01/*` |
| Asset registry (before) | none for micro-assets; `dot01Assets.ts` for SIDEKICK / motion layers |
| SIDEKICKs | SK01 / SK02 / SK03 originals re-hashed: match the V9 manifest (DOT 01 audit doc 09) |
| Motion | DOT 01 motion system (9 / 11 / 4 keyframes, reduced-motion guarded) |
| Routes | `money?parent=motion`, `money/places[/:id[/history|settings|review|attention]]`, `money/entries/:id`, `money/transactions` + overlays |
| Preview / tunnel source | per `AGENTS.md` the tunnel serves `origin/preview/tunnel` (worktree `/tmp/site00-preview-main`), which equals `main` `e413590e` — no DOT 01. Not reachable from this container (addendum doc 01) |
| Screenshot comparison infrastructure | `scripts/jurnl/f05-motion-pilot/compare_dot01.py` (unchanged) + the 37-state probe (scratch) at 471 × 836 |

## Source authorities inspected (actual files)

| Source | Files | Verified |
|---|---|---|
| 37 mobile screen authorities | `JURNL/F05_MONEY_DOT01/INPUT_V9/AUTHORITIES/*.webp` (941 × 1672) | used for every comparison |
| 3 SIDEKICKs | `INPUT_V9/SIDEKICKS/*.png` | SHA-256 = V9 manifest |
| 22 motion PNGs | runtime derivatives in `families/F05_MONEY/DOT01/` | 22 / 22 alpha-verified (DOT 01 doc 05) |
| 40 micro-assets (Batches 01–04) | founder ZIP `…MASTER_LITE_40_ICONS.zip` (SHA-256 `59c2b6a4…`), 768 × 768 LITE | 40 / 40 RGBA, real alpha, unique hashes; full-resolution originals not supplied |
| Micro-asset audit pack | founder ZIP `…MICRO_ASSET_AUDIT_CONTACT_OVERLAY_AND_ASSETS_V1.zip` (SHA-256 `77c3554a…`) | 69-ID registry and screen map used as the slot authority |
| Batch 05 / Batch 06 | — | **PENDING GENERATION** (not supplied; nothing invented) |

**Rendering environment:** Chromium (Playwright, pre-installed), device scale factor 1 for comparisons, 2 for interactive-state evidence; reduced motion for still captures; synthetic data only; dev server `vite --port 5174`. Authorities and captures are compared at the authorities' own 9:16 (471 × 836), so no aspect-ratio difference is read as a layout error.
