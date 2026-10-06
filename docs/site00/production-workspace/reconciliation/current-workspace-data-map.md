# Current workspace data map (forensic)

Every data source each root tab reads, as found on `main @ 2225bc99` (BEFORE) and as wired after this sprint (AFTER).
Source classification vocabulary:

`CANONICAL_PROJECT_SCOPED` · `CANONICAL_GLOBAL` · `LEGACY_PROJECT_SCOPED` · `LEGACY_NDX_DEFAULT` · `MOCK` · `STATIC_UI` ·
`UNSCOPED` · `STALE_PIPELINE` · `UNKNOWN`

## How the active project reached a tab (BEFORE)

| Route | Project resolution | Class |
|---|---|---|
| `/production` (HUB), `/production/queue` (INBOX), `/production/libraries`, `/production/activity` | none in the URL — `ProductionAuthorityFrame.projectSlugFromPath` returned `'ndxbook'` | `LEGACY_NDX_DEFAULT` |
| `/production/:slug/{design,experience,expression}` | path slug, but `useParams` defaults `= 'ndxbook'` in the layout, DesignChamber (×3), DesignModeBar, ExperienceBody, InboxBody, ExpressionBody | `LEGACY_NDX_DEFAULT` |
| Host chrome project chip | `projectIdFromPath` → `'ndxbook'` on every global tab | `LEGACY_NDX_DEFAULT` |
| Nav hrefs | `/production`, `/production/queue`, `/production/libraries`, `/production/activity` (no project); EXPERIENCE → `/experience/world` (empty child) | `UNSCOPED` |
| Project switch | `projectSwitchPath` kept only design / experience / expression, else `/production/<slug>/design` (tab not kept, query dropped) | `UNSCOPED` |
| Workspace context (entry / campaign) | `productionContextStorage` default `'ndxbook'`, entry not keyed to a project | `LEGACY_NDX_DEFAULT` |

## AFTER — one resolution for every tab

`path slug → ?project= → the project this browser tab last chose (sessionStorage) → last choice in any tab (localStorage)
→ NONE (project picker)`. Global routes without `?project=` are rewritten to carry it, so the address always states whose
truth is shown. There is no default project anywhere in the workspace path.

## Per tab

### HUB

| Panel / value | BEFORE source | Class | AFTER |
|---|---|---|---|
| Hero (ENTRY 002, tagline) | static copy + HubData | `STATIC_UI` + `LEGACY_NDX_DEFAULT` | NDXBOOK only (`HubBody` when `isEntry002`); other projects → `project-hub-head` (graph phase + next action) |
| ITEMS NEED YOU | `attention` incl. queued requests of **all** projects | `UNSCOPED` | NDXBOOK: project-filtered attention; others: graph `NEEDS_YOU` |
| ACTIVE ENTRY / CURRENT PHASE | Entry 002 builders | `LEGACY_PROJECT_SCOPED` | NDXBOOK only; others: `graph.phase` |
| BLOCKERS | `graph.blockers` (blocked + review + locked) linked to ACTIVITY root | `LEGACY_PROJECT_SCOPED` (poorly labelled) | links to ACTIVITY → BLOCKERS (the list it counts); others: `projectBlockers(graph)` |
| PRODUCTION OVERVIEW | Hub graph donut | `LEGACY_PROJECT_SCOPED` | NDXBOOK only; others: `project-hub-progress` (canonical stages) |
| RECENT ACTIVITY | global activity + 7 synthetic undated `state.*` rows shown as NOW | `UNSCOPED` + `MOCK` | project-filtered, dated events only; others: graph events |
| Machine view `?view=machine` | `initialHubState('ndxbook')` | `LEGACY_NDX_DEFAULT` | mounted only for NDXBOOK |

### INBOX

| Panel | BEFORE | Class | AFTER |
|---|---|---|---|
| NEEDS YOU / WATCHING / RESOLVED | `buildInboxObjects(attention, requests)`; requests unfiltered (`useProductionRequests()`) | `UNSCOPED` | NDXBOOK: requests filtered to the project; others: `ProjectInboxBody` over graph decisions + ledger |
| Item detail | Entry 002 nodes | `LEGACY_PROJECT_SCOPED` | others: `project-inbox-item` (node, blockers, materials, actions) |
| Messages / thread | shell | `MOCK` | unchanged for NDXBOOK, shown as unmounted |

### DESIGN

| Panel | BEFORE | Class | AFTER |
|---|---|---|---|
| Default (no `?mode`) | `useDesignMode` → `brand` chamber | `STATIC_UI` | graph DESIGN overview (method 01–08, page families, authorities) for every project |
| Chamber modes (non-ingested projects) | `designChamberConfig.ts` copy, plates, NDX GROTESK typography | `MOCK` + `LEGACY_NDX_DEFAULT` | offered only where the project has them (`designModesFor`): JURNL (own family chamber), NDXBOOK (own legacy chamber), runtime projects (VIEWPORT) |
| JURNL chamber | `ProjectFamilyChamber` (F01 only) | `CANONICAL_PROJECT_SCOPED` (poorly scoped) | kept; DESIGN overview now covers F01–F16 |
| DESIGN PIPELINE / ON YOUR TABLE | hard-coded config cards → NDXBOOK reconstruction workspace | `MOCK` | hidden under a runtime project's VIEWPORT |
| `/design/<sub>` workspace | `TwinOpusDirectScreen` (NDXBOOK golden reference) for any slug | `LEGACY_NDX_DEFAULT` | NDXBOOK only; other projects resolve to their DESIGN overview |
| VIEWPORT (non-runtime) | dev fixture `/app/preview/fixture-app-ndxbook` | `LEGACY_NDX_DEFAULT` | offered to NDXBOOK + runtime projects only |

### EXPERIENCE

| Panel | BEFORE | Class | AFTER |
|---|---|---|---|
| Root hero, capsules, ACTIVE ENVIRONMENT | static copy; capsule labels ≠ targets; constant "7 sub-workspaces" | `STATIC_UI` + `MOCK` | `ProjectExperienceSurface`: world graph (WORLD → SCENE → ZONE / PORTAL / INTERACTION …) with real counts |
| UNRESOLVED SPATIAL ISSUES | Expression hub blockers | `UNSCOPED` (wrong domain) | removed |
| Children `/experience/{world,…}` | copy + plate + "NO WORKSPACE SURFACE MOUNTED" | `STATIC_UI` | every child renders the project world graph / NOT_ESTABLISHED |
| World data | `shared/site00-astral-world/scenes/*` existed, unused by the workspace | `CANONICAL_PROJECT_SCOPED` (unused) | Astral World adapter → 36 nodes, 11 artifacts |

### EXPRESSION

| Panel | BEFORE | Class | AFTER |
|---|---|---|---|
| Root + 40 family routes for any slug | `useEntry002Production()` (no slug) + `isEntry002Project(slug)`; breadcrumb `detailName()` resolved Entry 002 ids for any slug | `LEGACY_NDX_DEFAULT` | gated: only a project whose EXPRESSION is established renders them; others → `domain-empty-expression` |
| FORMAT STUDIO chips | 6 hard-coded formats | `MOCK` | the entry plan's real format adaptations |
| CAST ASSIGNED / ROLES CAST | counted a phantom actor id absent from the catalogue | `UNKNOWN` (defect) | catalogued actors only |
| Entry | `?entry ?? context.entryId ?? '002'`, context not keyed to project | `LEGACY_NDX_DEFAULT` | stored entry used only for the project it was chosen in |

### LIBRARY

| Panel | BEFORE | Class | AFTER |
|---|---|---|---|
| Tabs, categories, facts, collections, most used | static | `MOCK` / `STATIC_UI` | `ProjectLibraryBody` — artifact records of the project graph with status lenses |
| Vault ("ENTRY 002 CANONICAL ASSET") | static | `LEGACY_NDX_DEFAULT` | removed |
| Lineage | link to ACTIVITY | `MOCK` | `project-library-artifact`: source node, type, status, authority, derived from, supersedes, used by, viewport, actor mode, file, source of truth |
| Asset slot manifest | not read by LIBRARY | `STALE_PIPELINE` | not used (artifacts come from source truth / receipts) |

### ACTIVITY

| Panel | BEFORE | Class | AFTER |
|---|---|---|---|
| Feed | `productionActivityStore` (no project key) + all requests + 7 synthetic state rows | `UNSCOPED` + `MOCK` | NDXBOOK: project-attributed (`activityProjectOf`), dated only; others: graph events |
| TODAY | ≥ 7 always (synthetic rows) | `MOCK` | dated events in the last 24 h |
| Blockers lens | node statuses | `LEGACY_PROJECT_SCOPED` | others: `project-activity-blockers` with reason / upstream / severity / owner / action / effect |
| Activity dot in nav | always on | `STATIC_UI` | only when the project has a non-source event in the last 24 h |

## Stores

| Store | Key | Project key | AFTER |
|---|---|---|---|
| `productionActivityStore` | `site00.production.activity.v1` | none → **added** `projectId` on new rows; legacy rows attributed by slot prefix / single project name, else excluded | `CANONICAL_PROJECT_SCOPED` |
| `productionRequestStore` | `site00.production.requests.v1` | `projectSlug` (never read) | filtered on every reader in the workspace |
| Workspace ledger | `site00.production.workspace-ledger.v1` | `project_id` on every action | new — replayed only over its own project |
| Active project | `site00.production.active-project.v1` | — | new — sessionStorage (per tab) then localStorage |
| Workspace context | `site00-production-workspace-context-v1` | `projectSlug`; brand / campaign / entry now dropped on a project change | `CANONICAL_PROJECT_SCOPED` |
