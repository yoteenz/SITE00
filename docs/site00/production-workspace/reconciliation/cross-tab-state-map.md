# Cross-tab state map

A founder action in the workspace is a **WorkspaceAction** in the project's ledger (`shared/site00-production-graph/ledger.ts`,
persisted project-keyed by `src/site00/production/workspaceLedgerStore.ts`). The graph is re-assembled from source truth +
the project's own ledger, so one action changes every projection at once — no tab keeps its own copy.

```
INBOX / DESIGN decision ─▶ recordWorkspaceAction({project_id, kind, node_id, item_id, note})
                         ─▶ localStorage site00.production.workspace-ledger.v1 + event site00:production-workspace-ledger
                         ─▶ useProjectGraph re-assembles THIS project's graph ─▶ HUB · INBOX · DESIGN · EXPERIENCE ·
                                                                                   EXPRESSION · LIBRARY · ACTIVITY · chrome
```

## Actions and their effects

| Action | Node | Artifacts (LIBRARY) | Decisions (INBOX) | Blockers (HUB / downstream) | Events (ACTIVITY) |
|---|---|---|---|---|---|
| **APPROVE** | approval APPROVED, authority LOCKED; COMPLETE when implemented + QA PASS, else ACTIVE at IMPLEMENTATION ("implementation unblocked") | IN_REVIEW / REVISE → **CANONICAL** (authority LOCKED) | item → RESOLVED; other open items on the node resolve | founder-owned blockers removed; every downstream blocker whose upstream is the node removed (node UNLOCKED) | APPROVED · PROMOTED_TO_AUTHORITY (per artifact) · UNLOCKED · RESOLVED |
| **REQUEST_REVISION** | BLOCKED, approval REVISION_REQUESTED, authority IN_DEVELOPMENT | IN_REVIEW, canonical authorities and world assets of the node → **REVISE** | item → RESOLVED (verdict); new `REVISE <node>` REVIEW_REQUEST → **WATCHING** (studio owes it) | HIGH blocker on the node (owner STUDIO); each downstream node held (`Waiting on <node> revision`) | REVISED · RESOLVED |
| **REJECT** | BLOCKED, approval REJECTED | as above | as above | as above ("Rework the authority from territories") | REJECTED · RESOLVED |
| **RESOLVE** (open question) | — | — | item → RESOLVED (DECIDED) | `.open-decisions` gate recomputed: when none is open the page tree becomes REVIEW_REQUIRED and its confirmation moves WATCHING → **NEEDS_YOU** | DECIDED · RESOLVED · UNLOCKED |

Scope: an action for another project, or naming a node the project does not have, is ignored (test).

## The founder's example flows (proved)

### 1. DESIGN authority approved

| Expected | Proof |
|---|---|
| authority artifact status updates | node `authority_status` LOCKED |
| LIBRARY promotes artifact | no artifact of the node left IN_REVIEW (→ CANONICAL) |
| ACTIVITY records approval | `APPROVED` + `RESOLVED` events, origin WORKSPACE |
| HUB gate advances | NEED YOU count − 1 (rendered `project-hub-count-needs-you`) |
| INBOX approval item resolves | item in RESOLVED lens, gone from NEEDS YOU |
| implementation becomes unblocked | node ACTIVE at IMPLEMENTATION ("Authority locked by founder — implementation unblocked") |

Tests: `productionProjectGraph › APPROVE a JURNL authority verdict`, `productionProjectIsolation › D — …` (HUB / INBOX /
ACTIVITY / DESIGN rendered after the action).

### 2. EXPERIENCE world asset rejected

| Expected | Proof |
|---|---|
| node becomes blocked / revise | scene BLOCKED, approval REJECTED |
| HUB reflects blocker | blockers + 1 + downstream held nodes |
| INBOX adds review / revision item | `REVISE <scene>` REVIEW_REQUEST in WATCHING |
| LIBRARY marks artifact REVISE | the scene's world asset → REVISE |
| ACTIVITY records verdict | `REJECTED` event on the scene |
| downstream scene cannot become authority-ready | every downstream node carries a blocker with `upstream = scene` |

Test: `productionProjectGraph › EXPERIENCE world asset rejected`.

### 3. EXPRESSION casting role approved

| Expected | Proof |
|---|---|
| casting state updates | CASTING node approval APPROVED |
| LIBRARY stores approved authority | casting artifacts IN_REVIEW → CANONICAL (when present) |
| ACTIVITY logs cast decision | `APPROVED`, `UNLOCKED`, `RESOLVED` events |
| HUB reflects downstream readiness | LOOK's blocker with `upstream = CASTING` removed |
| INBOX removes casting decision | NEEDS YOU empty |
| continuity state updates | continuity is not a graph node yet (Entry 002 continuity lives in the cast state) — **REMAINING** |

Test: `productionProjectGraph › EXPRESSION casting approved`. NDXBOOK's live INBOX keeps its own Entry 002 founder gate
(`decideStoryboard` → expression engine); the ledger path is exercised on the graph.

## Where actions are offered

| Surface | Actions |
|---|---|
| INBOX NEEDS YOU list (non-NDX) | the item's own actions (APPROVE / REQUEST REVISION / REJECT / MARK DECIDED) with an optional note and a confirm step |
| INBOX item detail | same |
| DESIGN family detail | decisions of the family and its children (actor modes, page tree) |
| EXPERIENCE scene detail | decisions on the scene when one exists |

Decision actions are dispatched only inside their own project (`useWorkspaceActionDispatch` refuses an item of another
project).
