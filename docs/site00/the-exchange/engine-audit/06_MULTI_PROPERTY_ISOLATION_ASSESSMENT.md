# 06 — Multi-property isolation assessment

## Requirement

THE EXCHANGE canon, characters, assets, and schedules must **not** merge with NDXBOOK. NDXBOOK must **not** inherit Exchange lore.

## What works today

| Mechanism | Evidence | Maturity |
|-----------|----------|----------|
| Per-slug **capability sets** | `NDXBOOK_METHODOLOGY_CAPABILITIES` vs `ASTRAL_WORLD_*` in `shared/site00-projects/capabilities.ts` | **RUNTIME_CONNECTED** |
| API action gating | `projectCapabilityGuard.ts` on `projects.ts` actions | **TESTED** |
| Project resolver / DB id | `canonicalProject.ts`, `projectResolver.ts` | **RUNTIME_CONNECTED** |
| Generation project firewall | `assertProjectFirewall` in production guardrails | **TESTED** |
| Brand-agnostic routing table | `routingIsBrandAgnostic()` in `productionRouting.ts` | **TESTED** |

## Where isolation is weak (NDX-shaped engine)

| Risk | Evidence |
|------|----------|
| Expression golden fixtures | Entry 002/003 bootstraps, `entry002NarrativeSynthesisInput.ts`, public asset tree under `entry-002` |
| Proof brand constants | `NDXBOOK_PROOF_BRAND_ID` in expression constants |
| Character continuity defaults | `ndxCharacterContinuityPipeline` defaults `projectId: 'ndxbook'` |
| Film adapter | `ndxbookFilmAdapter.ts` — NDX-specific bible wiring |
| API coupling | ~28 references to `ndxbook` in `api/site00/projects.ts` (special cases) |
| Intelligence shortcuts | `projectIntelligenceService.ts` legacy completed modules for ndxbook (per audit JSON in repo) |
| In-memory stores | Entry/narrative stores are **not** namespaced to DB project id unless code passes slug consistently |

## Minimum changes (documentation only — **not implemented**)

1. Register **`the-exchange`** (or founder-chosen slug) with a **dedicated capability profile** — likely subset of `NDXBOOK_METHODOLOGY_CAPABILITIES` minus NDX-specific experiments.  
2. **Zero** Entry 002/003 bootstrap imports for Exchange routes.  
3. Asset root: `public/assets/expression-engine/the-exchange/` (or ASSTS prefix) — **never** under `entry-002`.  
4. Wire **Supabase** `site00_creative_entries` (or new tables) with `project_id` FK for durable canon.  
5. Provider jobs tagged with `projectId` + `propertyId` on all receipts (guardrails already classify by project).

## Verdict

| Dimension | Maturity |
|-----------|----------|
| Multi-property isolation | **PARTIAL** — platform gates exist; **creative pipeline defaults to NDXBOOK reference implementation** |
