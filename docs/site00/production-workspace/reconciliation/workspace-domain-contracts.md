# Workspace domain contracts

Seven projections of one project graph. The shell, the 7-tab nav, HUB typography-density authority, responsive
authorities, brand DNA and approved visual authorities are unchanged; graph surfaces reuse the INBOX / ACTIVITY panel grammar
(`.iax-*`) and the HUB type scale (`--pw-t0…t5`, `--pw-metric`, `--pw-gap`, `--pw-pad`).

## Tab semantics

| Tab | Contract | Implemented by |
|---|---|---|
| **HUB** | Project production control plane: real health, nodes, gates, blockers, next action. | NDXBOOK Entry 002 → `HubBody` (HUB authority); every other project → `ProjectHubBody` |
| **INBOX** | Real human decisions only. Counts are real; each item resolves to a node; acting on it updates the node and every other tab. | NDXBOOK → `InboxBody` (Entry 002 founder gate); others → `ProjectInboxBody` + workspace ledger |
| **DESIGN** | Site / digital-location design authority: page families, territories, responsive authorities. Method 01–08. | `ProjectDesignSurface` (overview, default for every project) + chamber modes the project has |
| **EXPERIENCE** | World-building / spatial / environment / interaction. | `ProjectExperienceSurface` |
| **EXPRESSION** | Project-conditional campaign, casting, narrative work. | Entry 002 expression routes when established; `domain-empty-expression` otherwise |
| **LIBRARY** | Canonical artifact archive with lineage. | `ProjectLibraryBody` (every project) |
| **ACTIVITY** | Real event ledger. | NDXBOOK → `ActivityBody` (dated recorded events only); others → `ProjectActivityBody` |

## DESIGN — site authority contract

Supported node types: `SITE · PAGE_FAMILY · PAGE · STATE · TAB · COMPONENT · VISUAL_TERRITORY · REFERENCE_AUTHORITY ·
PAGE_FAMILY_AUTHORITY · RESPONSIVE_AUTHORITY · ACTOR_MODE · COMPONENT_AUTHORITY · ICON_ASSET_SHEET · SITE_NAVIGATION ·
VISUAL_HIERARCHY · IMPLEMENTATION_REFERENCE · PAGE_TREE`.

Surface:

- **Overview (default, `/production/<p>/design`)** — header (families, domain reason), counts (NEED YOU · BLOCKED · IN REVIEW ·
  COMPLETE), **method strip 01–08** with the real number of families at each step (03 IGNORE LEGACY VISUALS is a rule, never
  a stage), page families (own authority preview, stage, status, next action), design node types, visual authorities.
- **Family (`?family=F02`)** — state facts (stage, status, authority, approval, implementation, QA, viewports, actor modes,
  next, source), decisions with actions, blockers, child nodes (actor modes, page tree), authorities & assets; OPEN DESIGN
  CHAMBER (projects with a chamber), OPEN IN VIEWPORT (implemented families of runtime projects), NODE HISTORY.
- **Modes** — `designModesFor(project)`: JURNL → its own family chamber in all six modes; NDXBOOK → its own legacy chamber;
  runtime projects → VIEWPORT; every other project → overview only. A requested mode the project lacks renders its overview.
- **Not established** → `domain-empty-design` (NDXBOOK, Astral World, Frontal Slayer, Studio World, SITE 00 today).

## EXPERIENCE — world contract

Supported: `WORLD · ZONE · ENVIRONMENT · ROOM · SCENE · PATH · PORTAL · INTERACTION · INHABITANT · WORLD_STATE · ACCESS_STATE ·
ENVIRONMENT_ASSET · SPATIAL_AUTHORITY · SCENE_AUTHORITY · NAVIGATION_MODEL · PRESENCE_MODEL · INTERACTION_CONTRACT`.

Surface: world header, **kind lenses with real counts** (only kinds the project has), world row, scenes (or the selected
kind), world authorities. `?scene=` → scene facts, decisions, blockers, objects / interactions, references, OPEN LIVE SCENE
(the mounted immersive route). Every former child route (`/experience/world|zones|environments|modules|simulations|assets|
review`) renders the same project world graph.

Mapped worlds: **Astral World** (scene contracts, object / hotspot registries, reference manifest). **Frontal Slayer
Mansion** and **Studio World** have no room / zone registry recorded → NOT_ESTABLISHED (no fake world structures).

## EXPRESSION — contract

Supported: `CAMPAIGN · ENTRY · NARRATIVE · ROLE · ACTOR · CHARACTER · CONTINUITY · CASTING_DECISION · LOOK · PERFORMANCE · SET
· EDITORIAL_CONCEPT · STORYBOARD · KEYFRAME · REEL · CAROUSEL · STORY · SOCIAL_OUTPUT · CHARACTER_AUTHORITY · MEDIA_AUTHORITY ·
CAMPAIGN_AUTHORITY`.

- Established only by the project's own expression nodes (NDXBOOK Entry 002 today, built live from the hub read).
- **JURNL with nothing established → `NO EXPRESSION WORKSPACE HAS BEEN ESTABLISHED FOR JURNL.`** — never NDX casting.
- Root and all 40 family routes are gated (`ExpressionDomainGate`); family screens are keyed by project; the stored entry is
  never carried to another project.
- Casting counts use catalogued actors only (ROLES CAST, CAST ASSIGNED); formats come from the entry plan.

## Empty / not-yet-established state contract

`DomainEmptyState`: **project** (`<PROJECT> · <DOMAIN>`), **domain label**, **headline**
(`NO <DOMAIN> WORKSPACE HAS BEEN ESTABLISHED FOR <PROJECT>.`), **why** (`DomainState.reason` — capability applicability +
"no node recorded"), **what establishes it** (`DOMAIN_ESTABLISH_HINT`), **action** (the project's HUB). Never another
project's panel.

## Breadcrumbs

Breadcrumbs and back links come from the graph: `← <PROJECT> DESIGN` / `← <PROJECT> EXPERIENCE` / `← INBOX` /
`← LIBRARY` / `← ACTIVITY`, and node rows carry `stage · status · next` from the node record. Expression family breadcrumbs
(`detailName`) render only for an established EXPRESSION project.
