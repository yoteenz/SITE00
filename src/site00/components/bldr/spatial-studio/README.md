# Non-authoritative visual scaffold (Composer)

**Owner for visual/experience:** Opus  
**Owner for contracts/data:** `src/site00/builder-experience/spatialStudio/`

These React components and `site00-builder-spatial-studio.css` are **temporary scaffolding** so the technical session hook and estimator integration could be exercised. They are **not** founder-approved visual authority.

Opus should replace this presentation layer while consuming:

- `useBuilderSpatialSession()` from `spatialStudio/useBuilderSpatialSession.ts`
- `buildObjectParametersFromSpatialState()` from `spatialStudio/buildObjectContract.ts`
- `snapshotFromSpatialState()` from `spatialStudio/blueprintSessionContract.ts`

Do not duplicate selection or estimate math in new UI.
