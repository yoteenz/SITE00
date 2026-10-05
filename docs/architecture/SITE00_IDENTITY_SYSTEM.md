# SITE 00 Identity System

**Status:** Implemented P0.D (2026-08-25)  
**Predecessor:** P0.C Origin + Client Truth Ingestion

---

## Core governance rule

Three distinct truth layers must never collapse:

```
CLIENT / FOUNDER TRUTH  ≠  CREATIVE EXPLORATION  ≠  PROJECT CANON
```

No generated identity proposal becomes canonical without an explicit promotion event.

---

## Architecture

```
PROJECT (site00_projects)
  → IDENTITY PHASE (site00_identity_phases)
    → IDENTITY BRIEF (site00_identity_briefs — derived, is_canonical=false)
    → IDENTITY TERRITORIES (site00_identity_territories — CREATIVE_EXPLORATION)
      → JUDGMENTS (site00_identity_judgments)
      → CANON PROMOTION (site00_identity_canon_promotions → site00_canon_records)
  → WORLD HIERARCHY (site00_world_hierarchy_nodes — WORLD → DISTRICT → DESTINATION → EXPERIENCE)
```

---

## Identity phase states

| Status | Meaning |
|--------|---------|
| NOT_STARTED | Phase record exists but exploration not begun |
| IN_PROGRESS | Identity exploration active |
| AWAITING_REVIEW | Judgments recorded; founder review pending |
| PARTIALLY_APPROVED | Some fields promoted to canon |
| COMPLETE | Full identity canon approved |

---

## Project lifecycle transition

After successful Identity phase entry (from `ORIGIN_INGESTED`):

`ORIGIN_INGESTED` → `IDENTITY_IN_PROGRESS`

Does **not** auto-transition to `IDENTITY_COMPLETE` without explicit canon promotion.

---

## Identity territories

Each territory is a coherent identity strategy — not a random name suggestion.

| Field | Purpose |
|-------|---------|
| `territory_key` | Stable project-scoped key |
| `working_label` | Human-readable exploration label |
| `strategic_premise` | Core strategic differentiation |
| `payload` | Master/district direction fields |
| `status` | PROPOSED → SELECTED/REVISED/REJECTED → PROMOTED |
| `source_truth_refs` | Links to client truth record IDs |
| `creative_hypotheses` | Explicit non-canonical hypotheses |

---

## Hierarchical identity

```
MASTER BRAND CANON (Astral World)
  → DISTRICT EXPRESSION (Astréa)
    → DESTINATION EXPRESSION (Tarot Suite, Astral Mall, Coffee Shop)
      → EXPERIENCE (readers/services — future)
```

Master brand and district identities share DNA but allow district-specific expression.

---

## Judgment semantics

| Judgment | Territory status |
|----------|------------------|
| UNREVIEWED | PROPOSED |
| SELECT | SELECTED |
| REVISE | REVISED |
| REJECT | REJECTED (preserved, non-canonical) |
| HYBRIDIZE | Option D — hybridize or generate additional directions |

---

## Host vs client firewall

`shared/site00-identity/hostFirewall.ts` blocks SITE 00 host traits from client canon:

- SITE 00 red, Martian Mono, host shell typography, host navigation patterns

---

## API actions (`api/site00/projects`)

| Action | Method | Capability | Purpose |
|--------|--------|------------|---------|
| `identity_enter` | POST | BRAND_INTELLIGENCE | Enter identity phase, seed brief/territories/hierarchy |
| `identity_brief` | GET | BRAND_INTELLIGENCE | Latest derived identity brief |
| `identity_territories` | GET | BRAND_INTELLIGENCE | List project-scoped territories |
| `identity_judgment` | POST | JUDGMENTS | Record SELECT/REVISE/REJECT/HYBRIDIZE |
| `canon_promote_identity` | POST | JUDGMENTS | Explicit promotion to identity canon |
| `world_hierarchy` | GET | PROJECT_INTELLIGENCE | WORLD → DISTRICT → DESTINATION tree |
| `project_bible` | GET | PROJECT_INTELLIGENCE | Compiled project truth view |

---

## UI

Route: `/projects/:slug/identity` — `ProjectIdentityPage.tsx`

Founder can view Origin context, world hierarchy, identity brief, territories, judgments, and canon state.

---

## Key files

| Path | Role |
|------|------|
| `api/_lib/site00Projects/identity/identityPhaseService.ts` | Phase entry, territory seeding, judgments |
| `api/_lib/site00Projects/identity/identityBriefService.ts` | Brief derivation from client truth |
| `api/_lib/site00Projects/identity/worldHierarchyService.ts` | Hierarchy node seeding |
| `api/_lib/site00Projects/identity/canonPromotionService.ts` | Explicit canon promotion |
| `api/_lib/site00Projects/identity/projectBibleCompiler.ts` | Compiled Bible view |
| `shared/site00-identity/types.ts` | Generic identity types |
| `shared/site00-identity/astralWorldIdentity.ts` | Astral World seed territories + hierarchy truth |
