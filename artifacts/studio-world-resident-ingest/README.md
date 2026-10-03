# Studio World Season 1 Resident Ingest — INGEST1

**Sprint:** `P0.STUDIOOS.PRODUCTION.EXPRESSION.STUDIOWORLD-RESIDENT-INGEST1`  
**Source authority:** FSBW `P0.STUDIOWORLD.SEASON1.CORE-ENSEMBLE-CANON1` (reference paths — canon not vendored into SITE00).

## SITE00 projection code

- `shared/site00-studio-world/resident-intelligence/season1-ensemble/`
- `src/studio-os/production/resident-intelligence/studio-world-season1/` (re-export)
- Acting catalogue wiring: `shared/site00-studio-world/acting-catalogue/seedCatalogue.ts`, `productionCastingCatalogue.ts`

## UI touchpoints

- Production → Expression → Casting → **Actors** (`ExpressionSubScreens.tsx`)
- Library → Actor Catalogue collection count (`LibraryBody.tsx`)

## Tests

`tests/studioWorldSeason1ResidentIngest1.test.ts`
