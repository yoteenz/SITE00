# 04 — Media project registry reconciliation

Canonical independent media keys: `shared/site00-media-projects/independentMediaProjects.ts`

Reconciliation applied on **existing** `the-exchange` key:

1. `managedProjectRegistry.ts` — spine project row
2. `orgRegistry.ts` + `evolveService.ts` — index-visible org context
3. `projectIndexOrder.ts` — founder portfolio order
4. `projectResolver.ts` — surfaces + phase + activity
5. `listProductionManagedProjects()` — Production switcher + Hub fallback
6. `isMarketingClientOrg` — excludes `SERIALIZED_FICTION` from EVOLVE marketing client surfaces

No second THE EXCHANGE project created.
