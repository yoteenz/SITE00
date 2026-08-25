# SITE 00 Project Capabilities (P0.B)

**Module:** `shared/site00-projects/capabilities.ts`  
**Guard:** `api/_lib/site00Projects/projectCapabilityGuard.ts`

---

## Principle

**Project classification ≠ runtime capability.**

Example: `project_type = WORLD` does **not** grant `WORLD_FORMATION` (runtime flag remains `false`).

---

## Capability list

| Capability | Description |
|------------|-------------|
| `PROJECT_CORE` | Base project record resolution |
| `ORIGIN_INGESTION` | Intake/orchestration registration |
| `CLIENT_TRUTH` | Raw client-supplied non-canon storage |
| `BRAND_INTELLIGENCE` | Brand intelligence surfaces |
| `BRAND_LORE` | Lore profiles, calibration |
| `CREATIVE_APPETITE` | Creative appetite intake |
| `PERSONALITY_REPLAY` | Personality replay methodology |
| `CANONICAL_CREATIVE_RANGE` | Canonical range validation |
| `CANONICAL_CAROUSEL_EXPANSION` | Carousel expansion |
| `CREATIVE_CONCEPT_TERRITORIES` | Experiments D/F/G |
| `BRAND_CHARACTER` | Experiment H / brand character |
| `BRAND_MARKETING_EXPRESSION` | Marketing expression experiments |
| `CONTENT_OPERATIONS` | Content ops pipeline |
| `CAMPAIGN_PRODUCTION` | Campaign board |
| `FOUNDER_CREATIVE_INGESTION` | Founder creative ingestion |
| `FILM_PRODUCTION` | Film production pilots |
| `CINEMATIC_REALISM_LAB` | Realism lab |
| `DAILY_PUBLISHING` | Daily publishing cadence |
| `CULTURAL_INTELLIGENCE` | Cultural intelligence |
| `MOTION_CHARACTER` | Book language / motion |
| `EMBODIED_CHARACTER_DISCOVERY` | Embodied character discovery |
| `FOUNDER_CHARACTER_DISCOVERY` | Founder character discovery |
| `CHARACTER_CONTINUITY` | Character continuity pipeline |
| `CHARACTER_VISUAL_CASTING` | Visual casting / bible |
| `EXPERIENCE_EXPRESSION` | Experiment E |
| `CREATIVE_LINEAGE` | Creative lineage / launch seed |
| `JUDGMENTS` | Founder judgment forensic |
| `CANONICAL_SNAPSHOTS` | Snapshot systems |
| `GENERATION` | FAL generation surfaces |
| `PROJECT_INTELLIGENCE` | Intelligence manifests |
| `STUDIO_WORLD_EXECUTION` | Studio World runs |
| `PROJECT_WORKSPACE` | Project workspace / hero frame |
| `BLUEPRINT` | Blueprint stage (future generic) |
| `ASSET_VAULT` | Project-scoped vault (future) |
| `WORLD_FORMATION` | **Always false** — deferred |
| `PRODUCTION_HANDOFF` | **Always false** — deferred |

---

## Per-project capability sets

### NDXBOOK

All methodology capabilities in `NDXBOOK_METHODOLOGY_CAPABILITIES` — preserves pre-P0.B behavior via capability checks instead of `slug !== 'ndxbook'`.

### Astral World (`astral-world`)

```
PROJECT_CORE
ORIGIN_INGESTION
CLIENT_TRUTH
PROJECT_INTELLIGENCE
```

Explicitly **excludes** methodology, world formation, production handoff.

### Unknown slug

`PROJECT_CORE` only.

---

## API enforcement

**Before P0.B:** 244× `if (slug !== 'ndxbook')` in `api/site00/projects.ts`

**After P0.B:** 0 architectural slug guards — replaced with:

```typescript
denyUnlessActionCapability(res, slug, action, source)
denyUnlessProjectCapability(res, slug, capability, source)
```

Action → capability mapping: `capabilityForAction()` in `capabilities.ts`

---

## UI enforcement

Methodology pages use `hasProjectCapability(projectSlug, CAP)` instead of `projectSlug !== 'ndxbook'`.

---

## NDXBOOK preservation

NDXBOOK receives all capabilities it previously had. Safeguards are **generalized**, not removed. NDXBOOK-specific **brand content** and experiment records are unchanged.

---

## Future capabilities

Grant via `CAPABILITY_BY_SLUG` registry or DB-driven config (post-P0.B). Do not set `WORLD_FORMATION` or `PRODUCTION_HANDOFF` true until runtime exists.
