# SITE 00 Project Ingestion Readiness Matrix (P0.A)

**Date:** 2026-08-25  
**Audit:** P0.A — Project Ingestion Readiness (Astral World as first WORLD client)  
**Full report:** [SITE00_PROJECT_INGESTION_READINESS_AUDIT.md](./SITE00_PROJECT_INGESTION_READINESS_AUDIT.md)  
**Machine-readable:** [site00-project-ingestion-readiness.json](./site00-project-ingestion-readiness.json)

---

## Readiness legend

| Value | Meaning |
|-------|---------|
| **READY** | Data model + UI/API + persistence wired; usable for generic client without ndxbook hacks |
| **PARTIAL** | Significant pieces exist; gaps block safe Astral World ingestion or production |
| **MISSING** | Not implemented or schema-only |
| **BLOCKED** | Explicitly deferred (`WORLD_FORMATION_IMPLEMENTED=false`) or ndxbook-gated |

---

## Matrix

| CAPABILITY | CURRENT STATE | EVIDENCE | READINESS | BLOCKER | MINIMUM NEXT STEP |
|------------|---------------|----------|-----------|---------|-------------------|
| **PROJECT RECORD** | `site00_projects` table + client activation creates rows dynamically; founder registry is 4 hardcoded slugs | `supabase/migrations/20260818143000_site00_production_os.sql` L5–26; `api/_lib/site00Production/clientStudio.ts` `activateClientProject` L552–665; `api/_lib/site00Projects/projectRegistry.ts` L17–56 | **PARTIAL** | No Astral row; founder registry code-first | Create `astral-world` org + project row with metadata refs in P0.B |
| **PROJECT TYPE** | Three parallel enums: `ProjectExperienceClass`, `build_class` (text), `project_type` (text on ingestions only); duplicate type in `productionScope.ts` | `shared/site00-world-intake/constants.ts` L15–23; `shared/site00-brand-lore/experienceExpression/productionScope.ts` L7; `20260820180000` L365 | **PARTIAL** | No canonical IDENTITY\|SITE\|PRODUCT\|WORLD CHECK; enum fragmentation | Unify types; add `project_type` CHECK on `site00_projects` (P0.B) |
| **ORIGIN** | IDNTY/BLDR/world guest intake persist; orchestration ingestion queue without project link | `site00_idnty_submissions`, `site00_bldr_intakes`, `20260823160000`; `docs/site00/EXISTING_PROJECT_INGESTION.md` L46; `historyService.ts` L42–77 | **PARTIAL** | Ingestion does not reconcile or link `project_id` | Link intake → project; Origin workspace per client (P0.C) |
| **CLIENT TRUTH** | World intake JSONB + synthesis gate blocks premature canon; no explicit client-truth table | `intakeSynthesisGate.ts` L15–28; `handoff.ts` prefill.canonized; `FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION` | **PARTIAL** | No queryable client-truth layer per project | Tag intake session data as CLIENT_TRUTH; prevent auto-synthesis (P0.C) |
| **BRAND INTELLIGENCE** | Brand lore profiles durable in Supabase with provenance | `20260821050000_site00_brand_lore_profiles.sql`; `intakeService.ts` L269–291 | **READY** (storage) / **PARTIAL** (access) | Methodology UI ndxbook-gated | Parameterize brand lore routes by project capability (P0.B) |
| **IDENTITY** | IDNTY flows, calibration, creative direction, core direction formations | `/projects/:slug/calibrate`; `20260822140000`; ~38 Project pages ndxbook-gated | **PARTIAL** | Founder identity methodology locked to ndxbook | Capability registry + Astral identity route access (P0.B) |
| **WORLD** | Intake + readiness contracts + WORLD_MODULES in manifest; runtime formation explicitly false | `futureContracts.ts` L6 `WORLD_FORMATION_IMPLEMENTED=false`; `manifestCompiler.ts` L40–45; `20260823160000` header | **MISSING** (runtime) | World formation not implemented | Manual world canon workflow + `build_class=WORLD` template (P0.E); formation later |
| **BLUEPRINT** | Client studio blueprint stage + milestones; founder A/B/C via NDX experiments | `clientStudio.ts` L10–12 milestones; `/studio/:slug/blueprint`; P1 `contractCompilation.ts` | **PARTIAL** | Multi-direction blueprint not generic for WORLD | Project-scoped blueprint record linked to studio stage (P0.F) |
| **ASSET VAULT** | ASSTS global vault functional; creative lineage org+brand_slug scoped; studio client reviews | `20260817103000` (no project_id); `20260823120000`; `/assts`; `/studio/:slug/assets` | **PARTIAL** | ASSTS not project-isolated; ndxbook content-ops hardcoded | Project-scoped vault namespace (P0.F) |
| **APPROVALS** | Judgment patterns in experiments, ASSTS status, content-ops approvals, hero frame judgments | `20260823140000_site00_founder_judgment_revision.sql`; ASSTS approval fields; ndxbook API judgments | **PARTIAL** | Approval flows not wired for generic WORLD project | Reuse judgment schema with `project_id` FK (P0.F) |
| **CANON** | Brand lore canon, workspace canon layers, creative lineage canon tables | `projectWorkspaceCanon.ts`; lineage canon tables in `20260823120000` | **PARTIAL** | World canon missing; ASSTS global locks | Canon designation per project slug (P0.D) |
| **PROJECT BIBLE** | Composable from intake + lore + manifests + pipeline state; no compiled view | See audit §10 sources table | **PARTIAL** | No single read model; Composer stub | Bible compiler read-model (P0.D) |
| **PROJECT ISOLATION** | Client studio ownership check works; 244 API ndxbook guards; ASSTS global | `api/site00/projects.ts` (244 guards); 38+ UI pages; `site00_logical_assets` no project_id | **FALSE** | Cross-project contamination risk | Capability registry replacing slug checks (P0.B) |
| **STUDIO WORLD INTEGRATION** | ~364 files generic engines in repo; NDX adapters; FSBW legacy import; external bridge | `shared/site00-studio-world-production/`; `ndxbookLegacyImportService.ts`; `audit/SITE00_STUDIO_WORLD_MASTER_ASSURANCE_AUDIT.md` | **PARTIAL** | Persistence gaps; Composer stub; ndxbook-specific surfaces | Durable runs + generic adapters (post-ingestion) |
| **PRODUCTION HANDOFF** | Deliverable slot exists; NDXBOOK doc handoff; no generic export compiler | `developer_handoff` seed NOT_READY; `NDXBOOK_SITE00_HANDOFF.md`; master audit Composer stub | **MISSING** | No approved project package pipeline | Handoff package schema + export job (P0.G) |
| **REPO OUTPUT** | Orchestration tracks external repos; no scaffold generator | `repositoryInventory.ts`; `EXISTING_PROJECT_INGESTION.md` | **MISSING** | No code export | Scaffold spec in handoff package (P0.G) |
| **SUPABASE ISOLATION** | Shared Supabase during migration; RLS on SITE00 tables | `motherboard/CORE.md`; per-table RLS policies | **MISSING** (client) | Client projects need own Supabase at production | Document refs in project metadata; provision at handoff |
| **VERCEL ISOLATION** | SITE 00 SPA on GoDaddy; API on Railway | `AGENTS.md` production split table | **MISSING** (client) | Client apps need own Vercel/host | Handoff package includes deploy spec (P0.G) |

---

## Lifecycle phase matrix (A–I)

| Phase | A Data | B UI | C Admin | D Intelligence | E Storage | F Approval | G Canon | H Transition | I Output | Overall |
|-------|--------|------|---------|----------------|-----------|------------|---------|--------------|----------|---------|
| ORIGIN | P | P | P | P | P | M | P | P | M | **PARTIAL** |
| IDENTITY | R | P | P | P | P | R | R | P | M | **PARTIAL** |
| WORLD | P | M | P | B | M | M | S | B | M | **MISSING** |
| BLUEPRINT | P | P | P | P | P | P | P | P | M | **PARTIAL** |
| ASSET APPROVAL | R/P | R/P | R | P | P | P | P | P | M | **PARTIAL** |
| PRODUCTION HANDOFF | M | M | M | S | M | M | M | M | M | **MISSING** |

*R=Ready, P=Partial, M=Missing, B=Blocked, S=Scaffolded*

---

## Minimum viable ingestion gate summary

| Requirement | Timing |
|-------------|--------|
| Project record + org for Astral World | **REQUIRED BEFORE INGESTION** |
| Client truth storage without canonization | **REQUIRED BEFORE INGESTION** |
| Project isolation (no ndxbook bleed) | **REQUIRED BEFORE INGESTION** |
| Experience class → WORLD_MODULES mapping | **REQUIRED BEFORE INGESTION** |
| World formation runtime | **REQUIRED BEFORE PRODUCTION** |
| Project-scoped asset vault | **REQUIRED BEFORE PRODUCTION** |
| Production handoff package | **REQUIRED BEFORE PRODUCTION** |
| Independent Supabase/Vercel | **REQUIRED BEFORE PRODUCTION** |
| Automated repo creation | **POST-MVP** |
| Composer autonomous dispatch | **POST-MVP** |

---

## Recommended next sprint

**P0.B — Project Core / `project_id` isolation**

1. Add formal `project_type` on `site00_projects`
2. Replace `slug !== 'ndxbook'` with capability registry
3. Unify `ProjectExperienceClass` exports
4. Create Astral World project stub (metadata only — no world build)
