# 01 · Branch and runtime baseline

## Branches inspected (origin, 2026-11-04)

| Ref | SHA | What it is |
|---|---|---|
| `cursor/jurnl-financial-safety-integration-4e5a` (#1713 candidate) | `f7e2739c6` | canonical financial safety (card overpay guard, cabinet archive safety) |
| `claude/jurnl-f05-dot01-authority-scenes-um0u93` (OPUS2) | `4d222f7c0` | OPUS2: 03 / 04 / 05 authority scene bands; pushed, no PR |
| `claude/jurnl-global-interactive-v3-um0u93` (V3, OPUS1) | `3fac5e546` | V3 interactive system, global menu, membership, zero-balance archive (`HELD_BALANCE`) |
| `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` | `d6992b3fc` | Cursor merge (19:17 UTC) of its MONEY parent work (`7752eae2f`: accounts rail, PENDING / INCOMING copy, the 2 px MONEY type nudge) with V3 `3fac5e546` |
| `preview/tunnel` | `e413590e1` (2026-11-02) | contains **no DOT 01 code** (`git cat-file` on DirectoryPage.tsx fails) |

Lineage: `f7e2739c6` ⊂ `3604d2e72` ⊂ `4d222f7c0` (OPUS2) ⊂ `3fac5e546` (V3) ⊂ `d6992b3fc`.

## OPUS2 status — VERIFIED EXECUTED, PARTIAL
`4d222f7c0` is on origin. It rebuilt 03 / 04 / 05 from authority scene bands (scripts/jurnl/f05-motion-pilot/extract_dot01_account_scenes.py,
families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_0{3,4,5}.webp) and reported PARTIAL. It classified 06 as AUTHORITY_MATCH_CANDIDATE:
**that classification is withdrawn here** (06 was on SK02_FIELD with no lower landscape; report 06).

## Base chosen
`d6992b3fc` — the newest coherent head that contains every required line (financial safety, archive safeguards, OPUS2 compositions,
V3, the asset registries) and, by name and timing, the build the founder was shown. The founder's ALL ACCOUNTS screenshot cannot be
from `preview/tunnel` (no DOT 01 there); the live tunnel's serving SHA is **UNVERIFIED** (no access to the founder's tunnel
connector; not reconfigured). Work is on a new isolated branch `claude/jurnl-f05-dot01-shell-convergence-um0u93` created from
`d6992b3fc`; no other agent's branch was written to, nothing force-pushed.

## Runtime used for evidence
Vite dev (:5174) for the 37-state probe and the count captures; production build `vite preview` (:5176) for E2E. Synthetic
worlds only (e2e/jurnl/helpers). DOT 01 is reached as the runtime does: `?parent=motion` (session flag `jurnl.f05.parent`).
