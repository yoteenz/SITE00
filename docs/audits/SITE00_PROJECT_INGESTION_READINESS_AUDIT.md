# SITE 00 / Studio World — Project Ingestion Readiness Audit (P0.A)

**Date:** 2026-08-25  
**Mode:** Audit only — no Astral World build, no client repo, no schema changes  
**Target:** First real client WORLD project — **Astral World** (concept only; not ingested in this sprint)  
**Repo:** `github.com/yoteenz/SITE00`  
**Branch at audit:** `main` (clean working tree, build green)

---

## Executive summary

SITE 00 has **substantial production intelligence infrastructure** — intake persistence, brand lore, discovery gates, client studio lifecycle, world intake contracts, creative lineage, and Studio World generic engines — but it is **not yet ready to safely ingest Astral World as PROJECT 001**.

The platform can store **pre-project discovery truth** (IDNTY, BLDR, world guest intake) and run **paid SITE-class client studio** flows for dynamic slugs. It **cannot** yet run a full **WORLD** project through founder methodology, isolated asset vault, or production handoff without cross-contamination with NDXBOOK pilot surfaces.

**Verdict:**

| Gate | Result |
|------|--------|
| Astral World ingestion ready | **FALSE** |
| WORLD project type ready | **PARTIAL** |
| Project isolation ready | **FALSE** |
| Production handoff ready | **FALSE** |

**Recommended next sprint:** **P0.B — Project Core / `project_id` isolation**

---

## Core product principle (validated against repo)

Target model is **documented and partially encoded**:

- SITE 00 ingests → establishes truth → develops identity/world/blueprint → approvals → production handoff → independent client app.
- Client apps must **not** permanently live inside SITE 00 codebase (`motherboard/CORE.md`, `AGENTS.md`, `shared/site00-brand-lore/projectWorkspace/`).
- `studio-world` founder project explicitly notes boundary: *"STUDIO WORLD REMAINS A DISTINCT PRODUCT"* (`api/_lib/site00Projects/projectRegistry.ts` L35).

**Evidence of separation intent:** Three-layer `SITE00_LAYER` constants (`shared/site00-brand-lore/projectWorkspace/constants.ts` L12–17), intake synthesis gate blocking public discovery from creating production profiles (`shared/site00-project-discovery/intakeSynthesisGate.ts`).

**Evidence of separation gap:** 244 `slug !== 'ndxbook'` guards in `api/site00/projects.ts`; ASSTS vault has no `project_id`; `site00_creative_asset_records.project_id` is `text` not UUID FK.

---

## 1. Project-ingestion infrastructure that exists

### 1.1 Database — project-like entities

| Table | Migration | Purpose |
|-------|-----------|---------|
| `site00_organizations` | `20260818143000_site00_production_os.sql` | Org/brand container |
| `site00_projects` | same | Canonical project row: `slug`, `name`, `build_class`, `build_type`, `current_phase`, `metadata` |
| `site00_project_ingestions` | `20260820180000_site00_production_orchestration.sql` L359–378 | External project intake queue; `ingestion_state` default `RECONCILIATION_REQUIRED` |
| `site00_idnty_submissions` | `20260818180000` + lifecycle migrations | Identity pre-purchase intake |
| `site00_bldr_intakes` | same | Builder pre-purchase intake |
| `site00_brand_lore_profiles` | `20260821050000_site00_brand_lore_profiles.sql` | Durable brand intelligence SoR |
| `site00_project_intelligence` | `20260818143000` | Per-project intelligence snapshot |
| `site00_project_intelligence_manifests` | `20260823200000_site00_studio_world_execution.sql` | Post-purchase scope-derived manifests |
| `site00_intake_invites` / `site00_guest_intake_sessions` / `site00_world_intelligence_snapshots` | `20260823160000_site00_world_intake_foundation.sql` | World-class guest intake |
| `site00_creative_asset_records` (+ concept/franchise/canon) | `20260823120000_site00_creative_lineage.sql` | Creative lineage by org + brand_slug |
| `site00_logical_assets` (+ batches, versions) | `20260817103000_site00_assts_asset_factory.sql` | ASSTS global asset vault |
| `site00_studio_world_runs` | `20260823200000` | Durable Studio World execution envelope |

**Entity relationship (simplified):**

```
site00_organizations
  └── site00_projects (slug unique, build_class text, current_phase)
        ├── site00_project_intelligence
        ├── site00_project_intelligence_manifests
        ├── site00_studio_pipeline_state (via clientStudio activation)
        └── (nullable FK) site00_brand_lore_profiles.project_id

site00_project_ingestions  ← no project_id FK (orphan queue)

site00_idnty_submissions / site00_bldr_intakes
  └── lineage: organization_id, engagement_id (no FK), project_id (identity only)

site00_creative_asset_records
  └── organization_id + brand_slug + project_id (TEXT, not UUID FK)

site00_logical_assets  ← no project_id column (global SITE 00 vault)
```

### 1.2 API ingestion paths

| Path | File | Status |
|------|------|--------|
| Orchestration ingest | `POST api/admin/site00-orchestration` action `ingest-project` | **PARTIAL** — writes `site00_project_ingestions`; docs: *"Ingestion creates a record — it does not reconcile"* (`docs/site00/EXISTING_PROJECT_INGESTION.md` L46) |
| Intake autosave/submit | `api/_lib/site00Intakes/intakeService.ts` | **READY** — IDNTY/BLDR with synthesis gate |
| World guest intake | `api/site00/world-intake.ts` | **READY** — resolve/autosave/submit |
| Client activation | `api/site00/client-production.ts` → `activateClientProject` | **READY** — dynamic slug from DB |
| Founder methodology | `api/site00/projects.ts` (~5345 lines) | **BLOCKED for non-ndxbook** — 244 slug guards |

### 1.3 Documentation

- `docs/site00/EXISTING_PROJECT_INGESTION.md` — intake fields, reconciliation state
- `audit/SITE00_STUDIO_WORLD_MASTER_ASSURANCE_AUDIT.md` — prior system audit (2026-08-23)
- `audit/readiness-matrix.json` — machine-readable capability subset

---

## 2. Production pipeline — implemented vs conceptual

Target lifecycle: **ORIGIN → IDENTITY → WORLD → BLUEPRINT → ASSET APPROVAL → PRODUCTION HANDOFF**

### ORIGIN

| Dimension | State | Evidence |
|-----------|-------|----------|
| A. Data model | **PARTIAL** | IDNTY/BLDR tables; world intake tables; `site00_project_ingestions` without project link |
| B. UI | **PARTIAL** | `/idnty/*`, `/bldr/*`, `/intake/:token`; no unified "Origin workspace" per client project |
| C. Admin | **PARTIAL** | `api/admin/site00-client-intakes.ts` — world invite creation |
| D. Creative intelligence | **PARTIAL** | Builder diagnosis → `ProjectExperienceClass` (`shared/site00-project-discovery/builderDiagnosis.ts`) |
| E. Asset storage | **PARTIAL** | Intake uploads via intake services; no project-scoped origin vault |
| F. Approval | **MISSING** | Origin inputs not gated as "client truth approved" |
| G. Canon persistence | **PARTIAL** | Brand lore blocked until synthesis gate passes |
| H. Phase transition | **PARTIAL** | World intake → snapshot; orchestration → reconciliation queue only |
| I. Production output | **MISSING** | No origin export |

**Classification: PARTIAL**

### IDENTITY

| Dimension | State | Evidence |
|-----------|-------|----------|
| A. Data model | **READY** | `site00_brand_lore_profiles`, core direction formations migration |
| B. UI | **PARTIAL** | `/projects/:slug/calibrate`, creative-direction; ~38 Project*.tsx pages ndxbook-gated |
| C. Admin | **PARTIAL** | Founder calibration routes exist for ndxbook |
| D. Creative intelligence | **READY** (generic) / **NDXBOOK-bound** (methodology) | Brand lore services; Experiment D/F/G/H pipelines |
| E. Asset storage | **PARTIAL** | Creative lineage records; ASSTS global |
| F. Approval | **READY** (patterns) | Hero frame judgments, concept quarantine, synthesis gates |
| G. Canon persistence | **READY** | Brand lore profiles with provenance |
| H. Phase transition | **PARTIAL** | Client studio `IDENTITY_FOUNDATION_LOCKED` milestone exists (`clientStudio.ts` L10) |
| I. Production output | **MISSING** | No identity canon export package |

**Classification: PARTIAL** — architecture supports unfinalized identity at intake (world intake `BRAND_LORE` section allows incomplete state); methodology surfaces are ndxbook-only.

### WORLD

| Dimension | State | Evidence |
|-----------|-------|----------|
| A. Data model | **PARTIAL** | World intake snapshots; `WORLD_MODULES` in manifest compiler; formation contracts only |
| B. UI | **MISSING** (runtime) | BLDR `/bldr/world/*` is pre-project intake, not project-scoped formation |
| C. Admin | **PARTIAL** | `markReadyForFutureWorldFormation` admin action |
| D. Creative intelligence | **BLOCKED** | `WORLD_FORMATION_IMPLEMENTED = false` (`shared/site00-brand-lore/worldFormation/futureContracts.ts` L6) |
| E. Asset storage | **MISSING** | No world-environment asset schema per project |
| F. Approval | **MISSING** | No world canon approval workflow |
| G. Canon persistence | **SCaffolded** | 11-stage contract pipeline L11–23 same file |
| H. Phase transition | **BLOCKED** | Readiness stops at `WORLD_FORMATION_READY` (`shared/site00-world-intake/readiness.ts`) |
| I. Production output | **MISSING** | No world handoff |

**Classification: MISSING** for runtime; **PARTIAL** for intake contracts.

Reusable concepts: `CreativeConceptTerritory` (Experiment D), `WorldExpressionSystem` references in brand-lore tests, `manifestCompiler.ts` L40–45 `WORLD_MODULES` list (20+ module IDs).

### BLUEPRINT

| Dimension | State | Evidence |
|-----------|-------|----------|
| A. Data model | **PARTIAL** | Client studio stages include blueprint; creative direction formations |
| B. UI | **PARTIAL** | `/studio/:slug/blueprint` (client); `/projects/:slug/creative-direction` (founder) |
| C. Admin | **PARTIAL** | Milestone `BLUEPRINT_APPROVED`, `BLUEPRINT_DIRECTION_SELECTED` |
| D. Creative intelligence | **PARTIAL** | P1 contract compilation (`shared/site00-studio-world-production/p1/contractCompilation.ts`) — controlled proof scope |
| E–I | **PARTIAL** | Deliverable slots in production OS; no generic multi-direction blueprint for WORLD |

**Classification: PARTIAL** — client studio blueprint spine exists; founder A/B/C/Option D largely NDXBOOK experiment stack.

### ASSET APPROVAL

| Dimension | State | Evidence |
|-----------|-------|----------|
| A. Data model | **READY** (global ASSTS) / **PARTIAL** (lineage) | `site00_logical_assets`; `site00_creative_asset_records` |
| B. UI | **READY** (ASSTS) / **PARTIAL** (studio) | `/assts`, `/studio/:slug/assets`, `/reviews/:reviewId` |
| C. Admin | **READY** | `api/admin/site00-assts.ts` |
| D–G | **PARTIAL** | Judgment/revision in NDXBOOK content-ops; ASSTS has status/version/approval fields |
| H–I | **MISSING** | No project-isolated vault; no export |

**Classification: PARTIAL**

### PRODUCTION HANDOFF

| Dimension | State | Evidence |
|-----------|-------|----------|
| All | **MISSING** (generic) | Recipe deliverable `developer_handoff` seeded NOT_READY; Composer orchestration stub per master audit; NDXBOOK-specific handoff docs only |

**Classification: MISSING**

---

## 3. Project type system

### Target types: IDENTITY | SITE | PRODUCT | WORLD

**No canonical four-value enum exists end-to-end.**

Three parallel systems:

1. **`ProjectExperienceClass`** (scope/manifests) — `shared/site00-world-intake/constants.ts` L15–23:
   `SITE | APPLICATION | IMMERSIVE_SITE | WORLD | UNRESOLVED`
   DB CHECK on `site00_intake_invites.project_experience_class`.

2. **`build_class`** — free text on `site00_projects`, `site00_bldr_intakes`, production recipes.
   Client studio templates: `SITE`, `IDENTITY`, `EVOLVE` (`clientStudio.ts` L227–256).

3. **`project_type`** — free text on `site00_project_ingestions` only (`20260820180000` L365).

**Duplicate enum collision:** `shared/site00-brand-lore/experienceExpression/productionScope.ts` L7 defines a *second* `ProjectExperienceClass` with `IMMERSIVE | CUSTOM_BUILD` instead of `IMMERSIVE_SITE | UNRESOLVED`.

**Slug overrides bypass discovery:**

```typescript
// api/_lib/site00ProjectIntelligence/projectIntelligenceService.ts L28–33
const DEFAULT_EXPERIENCE_CLASS_BY_SLUG = {
  ndxbook: 'IMMERSIVE_SITE',
  'frontal-slayer': 'WORLD',
  'all-in-one-enterprises': 'SITE',
  'studio-world': 'SITE',
};
```

**Cleanest insertion point for formal `PROJECT_TYPE`:**

- Extend `site00_projects` with constrained `project_type` CHECK matching target four-value model.
- Map `ProjectExperienceClass` (world-intake) ↔ `project_type` at activation/ingestion boundary.
- Consolidate duplicate type in `productionScope.ts` to import from `site00-world-intake/constants.ts`.
- Use `manifestCompiler.ts` `deriveModulesForScope()` as module assignment source of truth.

**Astral World mapping:** `project_type = WORLD`, `ProjectExperienceClass = WORLD`, `build_class = WORLD` (new template needed in clientStudio).

---

## 4. Three-layer truth model

### Target layers

1. **CLIENT TRUTH** — what client supplied  
2. **BRAND / PROJECT TRUTH** — formally approved canon  
3. **CREATIVE EXPLORATION** — SITE 00 proposals not yet approved  

### Repo approximation

| Layer | Repo construct | File evidence |
|-------|----------------|---------------|
| Host canon | `SITE00_LAYER.GLOBAL_HOST_CANON` | `projectWorkspace/constants.ts` L14 |
| Project workspace canon | `SITE00_LAYER.PROJECT_WORKSPACE_CANON` | L15; mutations blocked in `projectWorkspaceCanon.ts` |
| Client expression | `SITE00_LAYER.CLIENT_PROJECT_EXPRESSION` | L16; `clientProjectExpressionProfile.ts` |
| Discovery vs production | `shouldSynthesizeBrandLoreFromIntake()` | `intakeSynthesisGate.ts` L15–21 |
| Public discovery invariant | `publicDiscoveryCreatesZeroProductionProfiles(): true` | L27–28 |
| Handoff prefill | `prefill.canonized === false` | `shared/site00-project-discovery/handoff.ts` |
| Founder hypothesis | `FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION = 'FOUNDER_PROPOSED_CONCEPT'` | `world-intake/constants.ts` L61 |

**Classification: PARTIAL**

The three-layer model is **encoded in methodology constants and gates** but **not unified** as explicit `CLIENT_TRUTH | PROJECT_TRUTH | CREATIVE_EXPLORATION` records queryable per project. Astral World origin inputs (tarot environments, subscription model, reader marketplace) would today land in world intake JSONB or ingestion metadata without a dedicated client-truth schema.

**Reuse opportunity:** World intake sections (`BUSINESS`, `OFFERINGS`, `EXPERIENCE`, `WORLD_READINESS`) + brand lore provenance fields + synthesis gate = minimal client-truth layer without new tables (short term).

---

## 5. Origin phase (Astral World inputs)

Astral World required origin fields map to existing storage:

| Astral input | Current storage | Persists? |
|--------------|-----------------|-----------|
| Project name | `site00_projects.name` or ingestion `project_name` | Yes (on create) |
| Project type WORLD | `site00_intake_invites.project_experience_class` or ingestion `project_type` (free text) | Partial |
| Client concept notes | World intake session JSONB / ingestion metadata | Yes (guest intake) |
| Visual references | Creative lineage / intake uploads | Partial |
| Three environments | World intake `EXPERIENCE` section | Yes (structured intake) |
| Business model | World intake `BUSINESS`, `OFFERINGS` | Yes |
| Identity not finalized | Allowed — synthesis gate blocks premature canon | Yes |

**Blockers:**

- No **project-bound Origin workspace** linking intake → `site00_projects` row for Astral World slug.
- Orchestration ingestion does not auto-create project or link `project_id`.
- No explicit "preserve as client truth, do not canonize" flag beyond synthesis gate.

**Origin readiness: PARTIAL**

---

## 6. Identity phase

**Exists:**

- IDNTY assessment flows (`/idnty/:slug`)
- Brand lore profiles with `source_intake_type`, `readiness_state`
- Creative direction at `/projects/:slug/creative-direction`
- Calibration at `/projects/:slug/calibrate`
- Core direction formations (`20260822140000_site00_core_direction_formations.sql`)
- Experiment D/F/G/H concept territory pipelines (NDXBOOK-gated)

**Supports unfinalized identity at ingestion:** Yes — world intake collects brand lore before activation; synthesis gate prevents production profile creation from public discovery alone.

**Identity readiness: PARTIAL**

---

## 7. World phase (critical)

**WORLD is understood architecturally but not implemented at runtime.**

Evidence:

```typescript
// shared/site00-brand-lore/worldFormation/futureContracts.ts L6–7
export const WORLD_FORMATION_IMPLEMENTED = false as const;
```

Migration header `20260823160000_site00_world_intake_foundation.sql` L2: *"World Formation pipeline NOT implemented here."*

**Module contracts exist** for WORLD scope (`manifestCompiler.ts` L40–45):

`WORLD_READINESS`, `WORLD_ENTRY_INTENT`, `WORLD_SPATIAL_INTENT`, `WORLD_NAVIGATION`, `WORLD_PERSISTENCE`, `WORLD_SOCIAL_PRESENCE`, `WORLD_CONTENT_CREATION`, `WORLD_GAME_DEPTH`, `WORLD_HARD_BOUNDARIES`, etc.

**Graph evolution path GRAPHIC → PAGE → PRODUCT → WORLD:**

- GRAPHIC/PAGE: Experiment D/F/G, brand presentation — **INTEGRATED** (ndxbook)
- PRODUCT: Application modules in manifest compiler — **PARTIAL**
- WORLD: Intake + readiness only — **BLOCKED**

**World readiness: MISSING** (formation); **PARTIAL** (intake/readiness contracts)

---

## 8. Blueprint phase

**Client Studio spine** (`clientStudio.ts`):

- Stages for SITE/IDENTITY/EVOLVE build classes
- Routes: `/studio/:slug/blueprint`, assets, build, qa, launch
- Milestones: `BLUEPRINT_APPROVED`, `BLUEPRINT_DIRECTION_SELECTED`

**Founder blueprint / direction comparison:**

- Experiment G directions/finalists pages — ndxbook only
- P1 contract compilation — projects-index controlled proof, not generic client scaffold

**Blueprint readiness: PARTIAL**

---

## 9. Asset Vault / approval

### ASSTS (`/assts`)

- Tables: `site00_logical_assets`, `site00_asset_versions`, `site00_batches`, `site00_asset_slots`
- **No `project_id`** — global SITE 00 operator vault
- Admin API: `api/admin/site00-assts.ts`
- Status workflow: QUEUED → approval/lock fields on asset + version rows

### Creative lineage

- `site00_creative_asset_records`: scoped by `organization_id` + `brand_slug`; `project_id text` (not FK)
- Suitable for NDXBOOK-style brand isolation, not UUID-project isolation

### Studio client reviews

- `/studio/:projectSlug/assets`, `/reviews/:reviewId` — dynamic slug, DB-backed

### NDXBOOK content-ops

- Approval flows hardcoded `projectId: 'ndxbook'` throughout `api/site00/projects.ts`

**For Astral World isolated vault:** Must add project scoping to asset records OR namespace by org+slug with dedicated Astral org; ASSTS pattern does not isolate today.

**Asset vault readiness: PARTIAL**

---

## 10. Project Bible

**No single `project_bible` table or compiled view exists.**

Composable from existing records:

| Bible section | Existing source |
|---------------|-----------------|
| 01 Origin | IDNTY/BLDR/world intake submissions |
| 02 Client truth | World intake session JSONB (pre-synthesis) |
| 03 Brand truth | `site00_brand_lore_profiles` (post-gate) |
| 04 Product truth | Project intelligence manifest modules |
| 05 World truth | World intelligence snapshots (pre-formation) |
| 06 Visual canon | Creative lineage + ASSTS approved versions |
| 07 Interaction canon | Implementation contracts (scaffold) |
| 08 Asset canon | Lineage canon tables + ASSTS locks |
| 09 Architecture | P1/surface contracts |
| 10 Production status | `site00_studio_pipeline_state`, deliverables |
| 11 Decision history | Intake events, founder judgment tables (`20260823140000`) |

**Compiled Project Bible view:** Not implemented; feasible as read-model aggregation sprint.

**Composer readability:** Master audit notes Composer orchestration is **stub** — bible alone insufficient until handoff pipeline exists.

**Project bible readiness: PARTIAL**

---

## 11. Project isolation — contamination risks

### Founder registry (code-first, 4 slugs)

`api/_lib/site00Projects/projectRegistry.ts` — `frontal-slayer`, `studio-world`, `ndxbook`, `all-in-one-enterprises`

`shared/site00-projects/types.ts` — union type mirrors registry.

### Hardcoded ndxbook gates

| Location | Count | Risk |
|----------|-------|------|
| `api/site00/projects.ts` `slug !== 'ndxbook'` | **244** | New project cannot use methodology APIs |
| `api/site00/projects.ts` `projectId: 'ndxbook'` | **50+** | Server ignores route slug |
| `src/site00/pages/Project*.tsx` `projectSlug !== 'ndxbook'` | **~38 files** | UI early-return |
| `projectIntelligenceService.ts` slug overrides | 4 slugs | Bypasses generic diagnosis |
| `productionScope.ts` `defaultNdxbookProductionScope()` | default | NDX assumptions leak |

### Global / weak-scoped data

| System | Scope | Risk |
|--------|-------|------|
| ASSTS logical assets | Global | Cross-project asset mixing |
| FAL generation lineage | Often ndxbook-scoped in tests/API | Wrong attribution |
| Studio World runs | `site00_studio_world_runs` — check project_id usage | Medium |
| Cache keys / in-memory stores | Per master audit | Ephemeral cross-request bleed on restart |

### What works for isolation

- Client studio: `clientOwnsProject()` email/user check (`clientStudio.ts` L151–156)
- Dynamic slug routes under `/studio/:slug/*`
- Creative lineage: org + brand_slug separation
- RLS on Supabase tables (service_role policies)

**Project isolation readiness: FALSE**

---

## 12. Studio World relationship

Classification per capability (sample):

| Capability | Classification | Location |
|------------|----------------|----------|
| Character visual casting engine | **STUDIO_WORLD_GENERIC** | `shared/site00-studio-world-production/characterVisualCasting/` |
| Brand lore / concept territory | **STUDIO_WORLD_GENERIC** | `shared/site00-brand-lore/` |
| NDX content operations | **NDXBOOK_SPECIFIC** | `shared/site00-brand-lore/contentOperations/`, API ndxbook gates |
| NDX embodied character | **NDXBOOK_SPECIFIC** | `shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/` |
| World formation contracts | **STUDIO_WORLD_GENERIC** (deferred) | `worldFormation/futureContracts.ts` |
| Legacy FSBW import | **LEGACY_FSBW** | `api/_lib/site00Evolve/providers/ndxbookLegacyImportService.ts` |
| External Studio World adapter | **DUPLICATED** (bridge) | `api/_lib/studioWorld/` |
| Project intelligence manifest | **SITE00_NATIVE** | `shared/site00-project-intelligence/` |
| ASSTS asset factory | **SITE00_NATIVE** | `supabase/migrations/20260817103000_*` |

Prior audit: `audit/SITE00_STUDIO_WORLD_MASTER_ASSURANCE_AUDIT.md` — constellation of subsystems, persistence gaps, Composer stub.

**Studio World integration readiness: PARTIAL**

---

## 13. Production handoff

**Does not exist as generic pipeline.**

Partial pieces:

- Production OS deliverable slot `developer_handoff` (`20260818143000` L424)
- P1 contract compilation for controlled surface proof
- Experience implementation contract + evaluator scaffold (autonomous mutation disabled)
- NDXBOOK handoff doc: `docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.md`
- Orchestration: repo inventory, launch manifests, reconciliation (`docs/site00/EXISTING_PROJECT_INGESTION.md`)

### Approved Project Package (target — not implemented)

Should contain at minimum:

- Project metadata (`site00_projects` row + classification)
- Brand canon (`site00_brand_lore_profiles` approved snapshot)
- World canon (future — world formation output)
- Blueprint / P1 / surface contracts
- Design tokens (if compiled)
- Approved assets manifest (URLs + lineage IDs)
- Route architecture
- Feature requirements (intelligence manifest modules)
- Interaction rules
- Production constraints
- Lineage references
- Project bible snapshot JSON
- Target repo scaffold spec (not repo itself)

**Production handoff readiness: FALSE**

---

## 14. How Astral World should be represented

**Inside SITE 00 (ingestion phase):**

```
site00_organizations (client org — e.g. astral-world)
  └── site00_projects (slug: astral-world, project_type: WORLD, build_class: WORLD)
        ├── site00_intake_invites (WORLD_DISCOVERY, experience_class: WORLD)
        ├── site00_guest_intake_sessions (client truth JSONB — pre-canon)
        ├── site00_world_intelligence_snapshots
        ├── site00_brand_lore_profiles (only after synthesis gate + approval)
        ├── site00_project_intelligence_manifests (WORLD_MODULES)
        └── site00_creative_asset_records (organization_id + brand_slug: astral-world)
```

**At production time (independent):**

- Separate GitHub repo `astral-world` (or client-chosen name)
- Dedicated Supabase project
- Dedicated Vercel project
- SITE 00 stores **references** (URLs, refs, handoff package URI) in `site00_projects.metadata` or future `site00_production_handoffs` table

**Do not:** Add Astral routes/pages to SITE 00 SPA bundle as permanent product surface.

---

## 15. Route / UI forensics

### Pre-project discovery (functional, persisted)

| Route | Purpose | Persistence |
|-------|---------|-------------|
| `/` | ORIGIN home | N/A |
| `/idnty/state`, `/idnty/:slug` | Identity assessment | `site00_idnty_submissions` |
| `/bldr/state`, `/bldr/*` | Builder assessment | `site00_bldr_intakes` |
| `/intake/:token` | World guest intake | `site00_guest_intake_sessions` |

### Founder project methodology (ndxbook-gated)

| Route pattern | Count | Wired |
|---------------|-------|-------|
| `/projects/:projectSlug/*` | 40+ sub-routes in `routes.ts` | API gated to ndxbook |

### Client studio (dynamic slug, functional)

| Route | Purpose |
|-------|---------|
| `/studio/:slug/*` | Client production lifecycle |
| `/studio/:slug/blueprint` | Blueprint stage |
| `/studio/:slug/assets` | Asset review |

### Global operator

| Route | Purpose | Project scope |
|-------|---------|---------------|
| `/assts` | Asset vault | **Global** |
| `/admin/site00` | Admin dashboard | Mixed |
| `/control/*` | Control plane | Global |

### Placeholder / scaffold (per master audit)

- Composer orchestration
- Implementation fidelity autonomous loop
- World formation runtime

---

## 16. Codebase health (audit snapshot)

| Check | Result |
|-------|--------|
| Branch | `main`, clean |
| Build | **Green** (`npm run build` ✓) |
| Tests | **3017 pass / 3 fail** (pre-existing, unrelated) |
| Failed tests | `founderCreativeIngestionP0CB1B.test.ts`, `founderWorkspaceP0.test.ts`, +1 |
| FSBW references | Legacy import service only; orchestration registry notes external repo |
| Dead routes | Some experiment pages ndxbook-only with no alternate project |
| Env assumptions | Shared Supabase during migration (`motherboard/CORE.md`); production API Railway |

---

## 17. Minimum viable ingestion gate

Before Astral World enters as PROJECT 001:

### REQUIRED BEFORE INGESTION

1. **Project record + org** — `site00_projects` + `site00_organizations` for `astral-world` with `project_type=WORLD`.
2. **Client truth storage** — world intake invite linked to project; origin inputs persist without canonization.
3. **Project isolation baseline** — replace slug guards with capability registry OR dedicated Astral API namespace; no ndxbook API bleed.
4. **Experience class mapping** — unify enums; set `ProjectExperienceClass=WORLD` → `WORLD_MODULES` manifest.

### REQUIRED BEFORE PRODUCTION (not ingestion)

1. **World formation runtime** (or scoped manual world canon workflow).
2. **Project-scoped asset vault** with approval export.
3. **Production handoff package compiler** + independent repo scaffold spec.
4. **Project bible compiled snapshot** for Composer/consumers.
5. **Supabase/Vercel isolation** provisioned for client app.

### POST-MVP

- Automated GitHub repo creation
- Automated Supabase/Vercel provisioning
- Full Composer dispatch
- Generic multi-client founder methodology without per-project gates

### OPTIONAL

- Unified Origin admin UI
- Real-time cross-repo reconciliation
- FAL live-spend verification gates

---

## 18. Proposed implementation sequence

Evidence-adjusted sprints:

| Sprint | Focus | Dependency |
|--------|-------|------------|
| **P0.B** | Project Core — `project_id` isolation, capability registry, enum unification, Astral project row | Audit complete |
| **P0.C** | Origin + Client Truth — link intake → project, client-truth layer on world intake JSONB, ingestion reconciliation FK | P0.B |
| **P0.D** | Project Canon / Bible — read-model compiler from existing tables | P0.C |
| **P0.E** | WORLD type support — `build_class=WORLD` studio template, world module activation, manual world canon workflow (pre-formation) | P0.B |
| **P0.F** | Project-scoped Blueprint + Asset Vault — namespace ASSTS or parallel project vault | P0.B |
| **P0.G** | Production Handoff Package — manifest export, scaffold spec, handoff record table | P0.D, P0.F |

### Proposed migrations (names only — not applied)

| Migration | Purpose |
|-----------|---------|
| `20260826_site00_project_type_enum.sql` | Add `project_type` CHECK on `site00_projects` |
| `20260826_site00_ingestion_project_link.sql` | Add `project_id` FK to `site00_project_ingestions` |
| `20260826_site00_project_asset_scope.sql` | Add `project_id` to `site00_logical_assets` or create `site00_project_assets` |
| `20260826_site00_client_truth_snapshots.sql` | Optional explicit client-truth table keyed by project |
| `20260826_site00_production_handoffs.sql` | Handoff package records + artifact URIs |

---

## 19. References

- `api/_lib/site00Projects/projectRegistry.ts`
- `api/_lib/site00Production/clientStudio.ts`
- `api/_lib/site00Orchestration/historyService.ts`
- `api/site00/projects.ts`
- `shared/site00-world-intake/constants.ts`
- `shared/site00-brand-lore/worldFormation/futureContracts.ts`
- `shared/site00-project-intelligence/manifestCompiler.ts`
- `shared/site00-brand-lore/projectWorkspace/constants.ts`
- `shared/site00-project-discovery/intakeSynthesisGate.ts`
- `supabase/migrations/20260818143000_site00_production_os.sql`
- `supabase/migrations/20260820180000_site00_production_orchestration.sql`
- `supabase/migrations/20260823160000_site00_world_intake_foundation.sql`
- `supabase/migrations/20260817103000_site00_assts_asset_factory.sql`
- `supabase/migrations/20260823120000_site00_creative_lineage.sql`
- `audit/SITE00_STUDIO_WORLD_MASTER_ASSURANCE_AUDIT.md`
- `docs/site00/EXISTING_PROJECT_INGESTION.md`
