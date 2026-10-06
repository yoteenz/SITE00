# Panel intelligence audit

Every Production Workspace panel has an explicit data contract (`shared/site00-production-graph/panelContracts.ts`,
exported as `panel-contracts.json`).

## The eleven questions → PanelContract fields

| # | Question | Field(s) |
|---|---|---|
| 1 | What exactly am I showing? | `display_purpose` |
| 2 | What node / scope does this data belong to? | `node_scope` (+ `project_id: ACTIVE_PROJECT`) |
| 3 | Why does this information matter here? | `display_purpose` (second clause) |
| 4 | What source of truth produced it? | `source_of_truth`, `query_source`, `data_dependencies`, `artifact_dependencies` |
| 5 | What action can the user take? | `primary_action`, `secondary_actions` |
| 6 | What state transition occurs after that action? | `state_transition` |
| 7 | What other workspace surfaces change as a result? | `downstream_effects` |
| 8 | Empty state? | `empty_state` |
| 9 | Error state? | `error_state` |
| 10 | Loading state? | `loading_state` |
| 11 | Project-scope rule? | `visibility_rule`, `refresh_rule` |

Shared rules every graph panel inherits:

- **Scope** — reads only `useProjectGraphData()` (the active project's graph); `getWorkspacePanelData` throws
  `PROJECT_SCOPE_VIOLATION` on a foreign graph; no fallback project.
- **Loading** — static source truth assembles synchronously; NDXBOOK's live part adds its nodes when the hub read resolves.
  Counts never show a placeholder number.
- **Error** — an adapter without truth contributes nothing: the panel renders its project-scoped empty state.
- **Refresh** — re-derives on project change, workspace-ledger event (`site00:production-workspace-ledger`) and storage sync.

## Graph panels (24, all `REAL_CANONICAL`)

| Tab | Panel (test id) | Shows | Action → transition |
|---|---|---|---|
| HUB | `project-hub-head` | current phase (earliest open pipeline step) + single next action | open next action |
| HUB | `project-hub-counts` | NEED YOU · BLOCKERS · IN REVIEW · COMPLETE — each a list length, each a link to that list | open list |
| HUB | `project-hub-progress` | top-level nodes on canonical stages with real stage counts | open node history |
| HUB | `project-hub-domains` | DESIGN / EXPERIENCE / EXPRESSION established or NOT ESTABLISHED (reason) | open the domain |
| HUB | `project-hub-needs-you` | highest-priority founder decisions | open in INBOX |
| HUB | `project-hub-blockers` | blocker: node · reason · upstream · severity · owner · action · downstream effect | ACTIVITY → BLOCKERS |
| HUB | `project-hub-events` | latest dated events | ACTIVITY |
| INBOX | `project-inbox-lenses` | NEEDS YOU / WATCHING / RESOLVED / ALL counts | lens |
| INBOX | `project-inbox-list` | real human decisions, each resolving to one node | APPROVE / REQUEST REVISION / REJECT / MARK DECIDED → ledger (see cross-tab map) |
| INBOX | `project-inbox-item` | decision + node + blockers + materials under decision | same + OPEN IN <DOMAIN> |
| LIBRARY | `project-library-artifacts` | artifact records by status | open lineage |
| LIBRARY | `project-library-artifact` | full lineage of one artifact | open source node |
| ACTIVITY | `project-activity-feed` | events ALL / APPROVALS / UPDATES / DECISIONS | lens |
| ACTIVITY | `project-activity-blockers` | every real blocker | — |
| ACTIVITY | `project-activity-node` | node state, events, decisions, blockers, connected nodes, artifacts | OPEN IN <DOMAIN> |
| DESIGN | `project-design-method` | method 01–08 with families per step (03 = rule) | filter by step |
| DESIGN | `project-design-families` | page families with stage / status / next / own preview | open family |
| DESIGN | `project-design-family` | family state, decisions, blockers, child nodes, authorities, assets | decide · chamber · viewport · history |
| DESIGN | `project-design-authorities` | the project's visual authorities | LIBRARY lineage |
| EXPERIENCE | `project-experience-nodes` | world graph by spatial kind | open scene · kind lens |
| EXPERIENCE | `project-experience-scene` | scene state, objects / interactions, references | OPEN LIVE SCENE · history |
| all work domains | `domain-empty` | NO <DOMAIN> WORKSPACE HAS BEEN ESTABLISHED FOR <PROJECT> + why + what establishes it | project HUB |
| any | `production-project-select` | no project chosen → choose | sets ACTIVE_PROJECT |
| chrome | `production-attention-count` | ITEMS NEED YOU = INBOX NEEDS YOU length | open INBOX |

## Audited panels (74)

Classification counts (a panel may carry more than one): `PROJECT_LEAK` 23 · `MOCK` 16 · `REAL_BUT_POORLY_SCOPED` 13 ·
`DECORATIVE` 11 · `REAL_BUT_POORLY_LABELLED` 10 · `REAL_CANONICAL` 5 · `DUPLICATE` 5 · `LEGACY` 4 · `UNRESOLVED` 2 ·
`OBSOLETE_PIPELINE` 2.

Disposition counts: `GATED_TO_OWN_PROJECT` 33 · `REWRITTEN` 16 · `REPLACED` 8 · `REMOVED` 8 · `OPEN` 5 · `KEPT` 3 ·
`UNMOUNTED` 1.

Guard (test): a panel classified `PROJECT_LEAK` is never `KEPT`. The full table is
[removed-or-replaced-panels.md](removed-or-replaced-panels.md) and `panel-contracts.json`.

## Counts are real

| Count | Before | After (queryable) |
|---|---|---|
| ITEMS NEED YOU (header) | NDXBOOK attention on every tab (incl. other projects' requests) | active project's `NEEDS_YOU` decisions = the INBOX NEEDS YOU list |
| BLOCKERS (HUB) | NDX node statuses, linked to ACTIVITY root | NDXBOOK: link opens the exact list; others: `projectBlockers` with reason / upstream / severity / owner / action / effect |
| AVAILABLE TALENT | studio catalogue (global by design) | kept — the catalogue is the studio's talent pool; media fixed in #1400 |
| ROLES CAST / CAST ASSIGNED | counted a phantom actor id absent from the 7-actor catalogue | catalogued actors only |
| TODAY (ACTIVITY) | ≥ 7 always (synthetic rows) | dated events in the last 24 h |
| DESIGN method step counts | — | families at that step (sum = families in the method) |
| EXPERIENCE kinds | constant "7 sub-workspaces" | nodes of that kind |

Tests: `E — count integrity` (graph + rendered) assert every HUB count equals the rendered list it opens.
