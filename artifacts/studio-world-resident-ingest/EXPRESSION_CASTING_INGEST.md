# EXPRESSION / CASTING INGEST

## Routes inspected

| Surface | Route | Change |
|---------|-------|--------|
| Expression root | `/production/:slug/expression` | Unchanged layout |
| Casting child | `/production/:slug/expression/casting` | Actors tab data source |
| Actors grandchild | tab `actors` inside Casting | **8 residents** + resident badge |
| Roles / Characters tabs | same route | Entry 002 client characters preserved |
| Character Fabrication | `/expression/character-fabrication` | SW-017 fabrication anchor; residents via intelligence layer |

## Data flow

```
FSBW canon dossiers
  → getStudioWorldSeason1ResidentDossiers()
  → projectResidentToStudioWorldActor()
  → getProductionCastingResidentTalentCatalogue() / listStudioWorldResidentTalentActors()
  → CastingScreen Actors tab
```

Lookup catalogue (`getStudioWorldActorCatalogue()`) = residents + preserved SW-017 for `actorFor()` / Entry 002.
