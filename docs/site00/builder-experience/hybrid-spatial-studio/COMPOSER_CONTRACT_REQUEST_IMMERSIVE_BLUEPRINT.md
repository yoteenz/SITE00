# Composer contract request — Immersive Blueprint (optional, surgical)

The sprint `P0.SITE00.BLDR.BLUEPRINT.V1-IMMERSIVE-TAB-BEHAVIOR-AND-SPATIAL-INFORMATION-RECOVERY1` shipped without any contract change. Every binding comes from fields the client already receives, plus the Builder registry (see `SPATIAL_INTERACTION_MATRIX.md`).

Two small, additive, client-safe fields would let the Blueprint bind to the contract directly instead of re-deriving from the registry. **Neither is required for what ships now.** Opus does not change estimator math, persistence or submission; this is a request for Composer.

## R1 — Production phase order (labels only, no durations)

**Why.** TIMELINE shows an *illustrative* assembly order of the model. The order is CORE → DIRECTION → PAGES → FEATURES → COMPLETE, consistent with the canonical copy ("each main experience is approved before its detail views"; "integration, final checks, launch"). The estimator has the real phase sequence, `ProjectEstimateResult.phases`: INCEPTION, BLUEPRINT, AUTHORITY DEVELOPMENT, PRODUCTION, INTEGRATION, RESPONSIVE QA, FINAL QA, CLIENT REVIEW, LAUNCH. It deliberately stays out of `ClientBlueprintEstimate` and `BuilderEstimateView`, so the studio cannot follow it today.

**Ask.** Add to `BuilderEstimateView` (in `src/site00/builder-experience/clientView.ts`):

```ts
/** The production phases in order, as the client may see them. Labels only: no weeks, no dates. */
phaseOrder: { id: string; label: string; clientDependency: boolean }[];
```

The values come from `run(selectedConfig).phases.map(({ id, label, clientDependency }) => ({ id, label, clientDependency }))`.

**Must not include:** `minimumWeeks`, `estimatedWeeks` or `parallelizable`. These would imply a schedule. The estimate copy stays "not a quote and not a schedule".

**Studio follow-up (Opus):** name the TIMELINE stages after `phaseOrder` and group the model's assembly under them. This removes the "illustrative order" caveat for the order, though not for timing.

## R2 — Where each page comes from (provenance on Blueprint items)

**Why.** PAGES lights the volume a page lives in. The studio derives each page's source from the same registry that `builderBlueprint` uses: `STRUCTURE.starterExperiences`, `CAPABILITY.addsExperiences` and `comesWith`. It then matches the snapshot's items by group and label. That holds today and is unit-tested, but it duplicates logic `builderBlueprint` already runs.

**Ask.** Extend each `BlueprintView.experiences[].items[]` entry with:

```ts
id: ExperienceId;
/** What brings this page into the proposal. */
source: { kind: 'STRUCTURE'; structure: StructuralArchetypeId } | { kind: 'CAPABILITY'; capability: CapabilityId };
```

The same can be done for `capabilities[]`:

```ts
id: CapabilityId;
via: CapabilityId | null; // the capability it comes with
```

**Studio follow-up (Opus):** read `source`, `id` and `via` instead of re-deriving them. The label matching and the registry walk in `anatomy.ts` go away.

## Not requested

- **Estimates, ranges, windows and confidence:** these are used exactly as delivered.
- **Persistence, submission, review states and auth:** untouched.
- **A geometry or "module" field on the contract:** the Build Object stays a presentation of the proposal. Its element ids are a studio concern.
