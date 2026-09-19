# SITE 00 — Parent–Child Experience Inheritance (P0.PCI.1)

**Parent landing = visual/experience authority. Child = function/content authority.**

System-level engine for discovering route families, extracting parent experience grammar, classifying child function, generating convergence plans, and QA-ing branch coherence — without manually restyling each child page.

## Doctrine

- Keep the function. Inherit the experience.
- Do not protect incorrect child visuals.
- Do not force children into identical layouts.
- Do not clone the parent page literally.
- Every child should feel like the same world, product, design system, and creative intelligence — adapted to the child's job.

## Module

| File | Role |
|------|------|
| `parentChildExperienceInheritance/types.ts` | `ParentExperienceAuthority`, `InheritanceMode`, `ChildConvergencePlan`, `ParentChildRouteGraph` |
| `routeGraphDiscovery.ts` | `ParentChildRouteGraph` — routes, tabs, modals, drawers, embedded surfaces |
| `parentAuthorityExtractor.ts` | Extract visual + interaction + composition grammar (not tokens-only) |
| `parentAuthorityResolver.ts` | Resolve experience parent per child (URL depth is not blind default) |
| `childSurfaceClassifier.ts` | `ChildSurfaceClassifier` — functional archetypes |
| `inheritanceModes.ts` | `INHERIT_FULL`, `INHERIT_GRAMMAR`, `SPECIALIZED_CHILD`, `HOST_LOCKED`, `EXEMPT_WITH_REASON` |
| `convergencePlanBuilder.ts` | Per-child `ChildConvergencePlan` |
| `convergenceApplier.ts` | Safe batch migration manifest (dry-run default) |
| `inheritanceQA.ts` | Branch cohesion QA |
| `inheritanceStore.ts` | Run lineage + exceptions (in-memory) |
| `parentChildExperienceInheritanceEngine.ts` | Primary orchestrator |
| `site00RouteFamilies.ts` | SITE 00 bootstrap registries (Project OS, Design MORE hub) |

## Pipeline

1. **Discover** route tree (`ParentChildRouteGraph`)
2. **Extract** parent authority (`ParentExperienceAuthority`)
3. **Resolve** experience parent per child
4. **Classify** child archetype
5. **Assign** inheritance mode
6. **Generate** convergence plans
7. **Apply** migration manifest (dry-run safe)
8. **QA** branch cohesion

## Relationship to P0.VR.7

`pageCompletionIntelligence/` ensures visible interactions resolve to child surfaces/routes. **P0.PCI.1** ensures those child surfaces **inherit parent experience grammar** — complementary, not duplicate.

## Tests

```bash
npm test -- tests/parentChildExperienceInheritanceP0PCI1.test.ts
```

## Known gaps (next sprint)

- Wire convergence applier to CSS/component migration runners
- Admin debug panel for inheritance runs
- Playwright branch cohesion screenshot matrix
- Persist runs to Supabase (currently in-memory store)
