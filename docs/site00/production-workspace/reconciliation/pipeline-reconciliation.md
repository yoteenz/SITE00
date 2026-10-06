# Pipeline reconciliation

The canonical production progression is a **graph**, not a rigid line: a node passes only the steps its type needs (a backend
node has no visual authority; a world scene has spatial authority, not page territories).

## Canonical pipeline (`PIPELINE_ORDER`, `graph.ts`)

```
INTAKE / SOURCE TRUTH → STRUCTURE → FAMILY / PRODUCT / WORLD / PAGE TREE → EXPERIENCE CONTRACT → FAMILY LOCK
  ├─ expression branch: NARRATIVE → CASTING → LOOK → PERFORMANCE → SET ──────────────┐
  └─ VISUAL AUTHORITY DEVELOPMENT → FOUNDER VERDICT → AUTHORITY PACKAGE              │
       → ACTOR / MODE DERIVATION → RESPONSIVE DERIVATION                             │
       → PAGE / COMPONENT / INTERACTION CONTRACT | WORLD / SCENE / ASSET CONTRACT     │
       → (STORYBOARD → KEYFRAMES) ◀──────────────────────────────────────────────────┘
       → ICON / ASSET SHEET → IMPLEMENTATION → QA / E2E → REFINEMENT → FOUNDER APPROVAL → LIVE → LIVE AUTHORITY PROMOTION
```

**Project phase** = the earliest open top-level `pipeline_step` in that order. **Next action** = the highest-priority
NEEDS_YOU decision, else a studio-owned blocker's required action, else the first incomplete node's next action.

## Node state model

Canonical stages (`NODE_STAGES`): `PLANNED → STRUCTURED → FUNCTIONAL → EXPRESSION_READY → AUTHORITY_READY →
VISUALLY_IMPLEMENTED → QA_READY → APPROVED → LIVE`. Operational status: `NOT_STARTED · LOCKED · ACTIVE · REVIEW_REQUIRED ·
BLOCKED · COMPLETE`. Granular source states map onto these — they are never deleted.

Node fields: `project_id, node_id, node_type, label, parent_id, family_id, domain, workspace_domains, current_stage,
pipeline_step, status, status_detail, authority_status, approval_status, implementation_status, qa_status, live_status,
dependencies, blockers[], upstream_nodes, downstream_nodes, actor_scope, viewport_scope, artifact_ids, source_truth_ids,
last_event, next_required_action, route, preview_artifact_id`.

Blocker fields: `node · reason · upstream · severity · owner · required_action · downstream_effect`.

## Source states → canonical (per adapter)

### Family production contracts (JURNL F01–F16) — `adapters/familyContracts.ts`

| Contract state | Status | Step | Decision / blocker |
|---|---|---|---|
| authority REQUIRED | BLOCKED | VISUAL_AUTHORITY_DEVELOPMENT | blocker `VISUAL_AUTHORITY_REQUIRED` (STUDIO) |
| authority IN_REVIEW / IN_DEVELOPMENT | REVIEW_REQUIRED | FOUNDER_VERDICT | `AUTHORITY_VERDICT` NEEDS_YOU |
| implemented + live QA PASS + no founder approval | REVIEW_REQUIRED | FOUNDER_APPROVAL | `IMPLEMENTATION_ACCEPTANCE` NEEDS_YOU |
| implemented, QA not run | ACTIVE | QA | — |
| authority approved, not implemented | ACTIVE | IMPLEMENTATION | — |
| founder approved + implemented + QA | COMPLETE | FOUNDER_APPROVAL | — |

JURNL today: 16 families · 12 BLOCKED (no visual authority) · 3 at founder verdict · 1 (F01) awaiting acceptance ·
4 NEEDS YOU · 49 artifacts (35 canonical) · phase **VISUAL AUTHORITY DEVELOPMENT**.

### Visual-authority package (AIO IFTA) — `adapters/visualAuthority.ts`

Family node + actor-mode `PAGE_FAMILY_AUTHORITY` nodes (CLIENT parent at FOUNDER_VERDICT, others ACTOR_MODE_DERIVATION) +
`PAGE_TREE` node (AUTHORITY_PACKAGE until confirmed) with an `.open-decisions` gate. Open questions → NEEDS_YOU, decided →
RESOLVED, page-tree confirmation WATCHING until no question is open (then NEEDS_YOU). AIO today (after the founder lock merged in
#1403): 5 nodes, 17 decisions RESOLVED, 1 NEEDS YOU (confirm the page tree — the gate is `PAGE_TREE_CONFIRMATION_REQUIRED`),
3 verdict events, 60 artifacts. The graph followed the source truth with no code change (before #1403: 10 NEEDS YOU,
1 WATCHING, 7 RESOLVED).

### Expression production (NDXBOOK Entry 002, live) — `adapters/expressionProduction.ts`

ENTRY node + 7 department nodes (NARRATIVE · CASTING · LOOK · PERFORMANCE · SET · STORYBOARD · KEYFRAMES) on the expression
branch + ROLE nodes (cast only when the actor is catalogued). LOCKED departments carry a blocker whose `upstream` is the
unmet department. Founder attention → NEEDS_YOU; studio requests → WATCHING; recorded activity of the project → events.

### World system (Astral World) — `adapters/astralWorld.ts`

WORLD → 9 SCENEs → objects (3 ZONE, 2 PORTAL, 1 ENVIRONMENT_ASSET, 1 PRESENCE_MODEL) and 19 hotspot INTERACTIONs. Scenes are IMPLEMENTED with
an immersive route (QA NOT_RUN); reference-manifest entries become SCENE / world authority artifacts. Astral World today:
36 nodes, 11 artifacts.

## DESIGN method projection (`methods.ts`)

| Step | Pipeline steps |
|---|---|
| 01 LOAD BRAND DNA | INTAKE, STRUCTURE |
| 02 LOAD EXPERIENCE CONTRACT | TREE, EXPERIENCE_CONTRACT, FAMILY_LOCK |
| 03 IGNORE LEGACY VISUALS | rule — no node sits here |
| 04 CREATE 3 DISTINCT COMPOSITION TERRITORIES | VISUAL_AUTHORITY_DEVELOPMENT with authority REQUIRED |
| 05 GENERATE / ASSEMBLE REFERENCE AUTHORITIES | VISUAL_AUTHORITY_DEVELOPMENT with authority in development |
| 06 FOUNDER CHOOSES / REVISES | FOUNDER_VERDICT |
| 07 LOCK FINAL PAGE-FAMILY AUTHORITY | AUTHORITY_PACKAGE, ACTOR_MODE_DERIVATION, RESPONSIVE_DERIVATION, PAGE_CONTRACT, ASSET_SHEET |
| 08 IMPLEMENT | IMPLEMENTATION, QA, REFINEMENT, FOUNDER_APPROVAL, LIVE, LIVE_AUTHORITY_PROMOTION |

JURNL: 04 → 12 · 06 → 3 · 08 → 1 (sum 16). AIO: the IFTA family at 07 (authority package, page tree awaiting confirmation).

## Obsolete pipelines

| Pipeline | State |
|---|---|
| Generic DESIGN chamber pipeline (`designChamberConfig.ts`, 6 hard-coded steps per mode) | `MOCK` — no longer shown outside NDXBOOK's own chamber; the DESIGN method strip replaces it |
| Asset slot manifest | `STALE_PIPELINE` — LIBRARY reads artifact records, not the manifest |
| Expression downstream deliverables (`state` hard `PLANNED`) | `OBSOLETE_PIPELINE` — open (REMAINING) |
