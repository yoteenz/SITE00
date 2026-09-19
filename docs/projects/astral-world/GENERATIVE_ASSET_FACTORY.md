# Astral World — Generative Asset Factory

P0.E.FT4 introduces an **asset-aware** Astral World where visual slots request, generate, validate, persist, and adopt cinematic assets through existing SITE 00 FAL infrastructure.

## Architecture

```
UI slot (AstralScene / AstralPortrait)
  → getAstralAsset / useAstralAssets
  → resolution: ACTIVE → READY → reference crop → fallback

Admin API (founder/debug)
  → queueAstralAssetGeneration
  → buildFalImageInput + fal.queue.submit
  → poll + uploadSite00AssetBuffer
  → asset record ACTIVE

Public API
  → /api/site00/astral-world-assets (URLs only, no provider metadata)
```

## Reused infrastructure

- `shared/site00-visual-generation/falImageModels.ts` — GPT Image 2 T2I + edit
- `api/_lib/site00Assts/storage.ts` — Supabase asset storage
- `api/_lib/studioBuilderGeneration.ts` — FAL queue poll + result fetch
- `api/_lib/site00Evolve/falBackgroundJob.ts` — async background work

## Governance

Generation ≠ canon. All assets remain `CREATIVE_EXPLORATION` / `FOUNDER_FAST_TRACK`.

## Debug controls

Append `?debug=1` on Astral World routes for generation status panel + Generate Missing P0.

Admin API: `/api/admin/site00-astral-world-generation`
