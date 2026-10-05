# CASTING_THUMBNAIL authority (Season 1)

**Sprint:** P0.STUDIOOS.PRODUCTION.EXPRESSION.CASTING-THUMBNAIL-AUTHORITY1

## Authority class

| Field | Value |
|-------|--------|
| `authorityType` | `CASTING_THUMBNAIL` |
| `status` | `FOUNDER_APPROVED` |
| `scope` | `SITE00_PRODUCTION_EXPRESSION_CASTING` |
| `primary` | `true` (Casting → Actors list only) |

## Runtime path

- Assets: `public/site00/studio-world-residents/casting-thumbnails-v1/`
- Registry: `shared/site00-studio-world/resident-intelligence/season1-ensemble/castingThumbnailAuthority.ts`
- Projection: `getResidentVisualProjection(id).productionVisuals.castingThumbnail`
- Casting URL: `resolveCastingCardImage(sourceResidentId)`

## Separation rule

| Context | Authority |
|---------|-----------|
| SITE00 Casting → Actors | `CASTING_THUMBNAIL` (white tee, red collar, white studio) |
| Studio World inhabit / natural identity | `season1-v1` natural-habitat, closeups, uniforms, alternates (unchanged) |
