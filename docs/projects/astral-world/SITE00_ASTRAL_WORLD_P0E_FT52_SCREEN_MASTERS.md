# P0.E.FT5.2 — Astral World Canonical Screen Masters

## Why

Astral World's primary visual authority was supplied as **one large multi-screen reference board**. Composer had to interpret regions, infer geometry, and expand small crops — introducing drift.

FT5.2 adopts the existing **SITE 00 Visual Reconstruction (P0.VR.2)** pipeline so each route gets an individual **canonical screen master**.

## Reference hierarchy

| Level | Example | Purpose |
|-------|---------|---------|
| **SOURCE BOARD** | `astral-world-mobile-reference.png` | Creative source, extraction origin |
| **SCREEN SOURCE REGION** | `source-region.png` | Exact board crop for one screen |
| **CANONICAL SCREEN MASTER** | `canonical-master-v1.png` | **Implementation authority** for Composer |

## SITE 00 pipeline reuse

- **NOT created:** `AstralPageGenerator`, `AstralCanonicalScreenEngine`, parallel pipeline
- **REUSED:** `p0vr2/canonicalReferenceRegistry.ts`, `p0vr2/designScreenRegistry.ts`, FAL via `generationService.ts`, asset slots via FT4 manifest
- **Adapter:** `shared/site00-astral-world/screen-masters/vr2Adapter.ts` registers `WORLD_SCREEN` scope

`PARALLEL_ASTRAL_PIPELINE_CREATED: FALSE`

## Registry

- Map: `shared/site00-astral-world/screen-masters/boardToScreenMap.ts`
- Masters: `shared/site00-astral-world/screen-masters/registry.ts`
- Files: `docs/projects/astral-world/screen-masters/{mobile,desktop}/AW_*`

## Pilot

**AW_M_01_WORLD_ENTRY** @ 390px — World Entry / `/projects/astral-world/debug/world/home`

Extract: `node --import tsx scripts/astral-world-extract-screen-master.mjs AW_M_01_WORLD_ENTRY`

## FT5.1 reconciliation

All FT5.1 generation receipts preserved. Assets classified in `ft51Reconciliation.ts`:

- `SCREEN_ALIGNED_REUSABLE` — bind after screen-master QA
- `REQUIRES_REGENERATION` — regenerate against canonical master; **do not redesign screen**

## Authority resolution

`resolveScreenAuthority()` order:

1. Canonical screen master (when `MASTER_READY_FOR_REVIEW`+)
2. Founder-activated generated asset
3. Board crop fallback

Live routes compare against **individual screen master**, not whole board.
