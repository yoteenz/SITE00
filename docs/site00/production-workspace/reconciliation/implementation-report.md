# Implementation report

Sprint `P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1` · mode ARCHITECTURE +
FORENSIC AUDIT + SYSTEM RECONCILIATION + IMPLEMENTATION · base `main @ 2225bc99` · branch
`cursor/production-workspace-project-isolation-panel-intelligence1-4f59`.

## What changed

1. **Canonical project graph** (`shared/site00-production-graph/`): node / artifact / decision / event / blocker model with
   canonical stages and pipeline; four source-truth adapters (JURNL family contracts, AIO IFTA visual-authority package,
   NDXBOOK Entry 002 expression production — live, Astral World scene system); assembly that drops foreign rows; phase and
   next action; capability map; DESIGN method / EXPERIENCE kinds; the one panel query; PanelContract registry.
2. **Project isolation**: active project from the URL → this tab's choice → any tab's choice → picker (no default project);
   every tab href scoped; switching keeps the tab and drops child state; requests and activity filtered to the project;
   ITEMS NEED YOU = the project's NEEDS YOU list; the activity dot only on real recent events.
3. **Seven projections**: HUB / INBOX / ACTIVITY → NDXBOOK's Entry 002 bodies only for NDXBOOK, graph projections for every
   other project; LIBRARY = graph artifacts with lineage for every project; DESIGN = graph overview by default (method
   01–08, families, authorities, family detail with actions), chamber modes only where the project has them; EXPERIENCE =
   world graph; EXPRESSION gated on the domain being established (JURNL → empty state).
4. **Cross-tab**: founder decisions are project-keyed WorkspaceActions replayed over the graph — approve / revise / reject /
   resolve propagate to HUB, INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY, ACTIVITY and the host chrome.
5. **NDXBOOK sanitize**: no synthetic NOW rows in ACTIVITY / HUB feeds (TODAY counts dated events); INBOX only its own
   requests; HUB BLOCKERS opens the list it counts; formats from the entry plan; CAST ASSIGNED / ROLES CAST count catalogued
   actors only; expression screens keyed by project; entry / campaign never carried across projects.
6. **Reload fix (pre-existing, site-wide)**: the static boot watchdog removed React's loader portal on browser reload →
   `removeChild` crash → blank page on every route (reproduced on `main`, dev and production build). It now asks the gate to
   reveal instead.

## §37 FINAL REPORT

```
SPRINT          P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1
STATUS          COMPLETE
BRANCH          cursor/production-workspace-project-isolation-panel-intelligence1-4f59
BASE SHA        2225bc99

FORENSIC
ROOT TABS AUDITED                   7 / 7
DEFAULT/OVERVIEW STATES AUDITED     7 / 7 (DESIGN default changed: brand chamber → graph overview)
CHILD STATES AUDITED                78 child routes / view states (40 EXPRESSION, 6 DESIGN modes + JURNL chamber, 7 EXPERIENCE, INBOX / LIBRARY / ACTIVITY views + details, HUB machine)
PANELS AUDITED                      74 legacy panels classified + 24 graph panel contracts
MOCK PANELS FOUND                   16
LEGACY PANELS FOUND                 4
PROJECT-LEAK SOURCES FOUND          23 panels · 18 leak sources fixed (project-isolation-audit.md)
NDXBOOK DEFAULT FALLBACKS FOUND     27 sites in 20 groups — all removed from the workspace path
STALE PIPELINE ASSUMPTIONS FOUND    3 (DESIGN chamber pipeline, asset slot manifest, expression deliverables)

PROJECT ISOLATION
NDX→JURNL LEAK TEST                 PASS — 7 tabs render only JURNL (render + live, 0 NDX strings, 0 foreign data-project)
JURNL→NDX LEAK TEST                 PASS — NDXBOOK tabs show only NDXBOOK; JURNL ids never resolve elsewhere
PROJECT SWITCH ROUTING TEST         PASS — 21 / 21 live switches keep the tab, drop child state
STALE CHILD STATE TEST              PASS — foreign ?item / ?artifact / ?node / ?family / ?scene → NOT FOUND
DIRECT ROUTE PROJECT TEST           PASS — direct / cold load / reload / back-forward / unscoped URL keep the project

DOMAIN CONTRACTS
HUB         control plane: phase, next action, real counts, stages, domains, needs-you, blockers, events
INBOX       real decisions only, each → one node; approve / revise / reject / decide through the ledger
DESIGN      site authority: method 01–08, families, authorities, family detail; modes only where the project has them
EXPERIENCE  world graph: WORLD → SCENE → ZONE / PORTAL / INTERACTION …; scene detail; NOT_ESTABLISHED otherwise
EXPRESSION  project-conditional; JURNL / AIO / others → "NO EXPRESSION WORKSPACE HAS BEEN ESTABLISHED FOR <P>."
LIBRARY     artifact archive generated from records, status lenses, full lineage
ACTIVITY    event ledger (source / request / workspace origin), blockers, node history

CROSS-TAB
APPROVAL PROPAGATION    PASS (DESIGN approve; EXPRESSION casting approve)
BLOCKER PROPAGATION     PASS (revise / reject block the node + hold downstream; approve unlocks downstream)
INBOX RESOLUTION        PASS
LIBRARY PROMOTION       PASS (IN_REVIEW → CANONICAL; reject → REVISE)
ACTIVITY GENERATION     PASS (APPROVED / PROMOTED / UNLOCKED / REVISED / REJECTED / DECIDED / RESOLVED)
HUB GATE UPDATE         PASS (NEED YOU − 1, blockers ±, page-tree gate recompute)

MEDIA
CASTING OVERVIEW        PASS — counts catalogued actors only
AVAILABLE TALENT        PASS — 7 PORTRAIT faces (fixed in #1400, re-verified ×3 viewports)
LEAD AUTHORITY          PASS — REFERENCE_AUTHORITY, not cover-cropped
OTHER FIXED MEDIA SLOTS graph thumbnails / tiles / lineage preview contained + role-tagged; RECORDED · NOT MOUNTED / MISSING states

RESPONSIVE
MOBILE   393×852    35 / 35 routes PASS · 0 overflow
TABLET   834×1194   35 / 35 routes PASS · 0 overflow
DESKTOP  1440×900   35 / 35 routes PASS · 0 overflow

TESTS
UNIT                productionProjectGraph 23 / 23
INTEGRATION         productionProjectIsolation 32 / 32 (A–H on the real surfaces)
E2E                 project-isolation-qa: 105 / 105 routes · 49 / 49 flows
PROJECT ISOLATION   PASS
CROSS-TAB           PASS (3 founder example flows + AIO resolve)
MEDIA               PASS
ROUTE PERSISTENCE   PASS
WORKSPACE BASELINE  17 files: only the 2 pre-existing failures (same as main)
FULL SUITE          10 630 tests · 0 new failures vs main · tsc clean

REMOVED
MOCK DATA SOURCES       LIBRARY static tabs / categories / collections / most-used / lineage-flow; generic DESIGN chamber outside NDXBOOK; 6 hard-coded formats; synthetic activity rows
LEGACY FALLBACKS        27 'ndxbook' defaults; project-less global tabs; tab-dropping switch
DECORATIVE PANELS       EXPERIENCE hero / capsules / children; LIBRARY vault / collections / empty categories
OBSOLETE PIPELINE LOGIC DESIGN chamber pipeline outside NDXBOOK; NDXBOOK reconstruction workspace under other projects

REMAINING
REAL UNIMPLEMENTED PROJECT DOMAINS  NDXBOOK DESIGN; Studio World EXPERIENCE; Frontal Slayer Mansion EXPERIENCE; SITE 00 graph
KNOWN EMPTY STATES                  Studio World / Frontal Slayer / SITE 00 (all tabs); JURNL + AIO EXPERIENCE / EXPRESSION; Astral World DESIGN / EXPRESSION; NDXBOOK DESIGN / EXPERIENCE
KNOWN FOLLOW-UP ITEMS               see "Remaining" below

FINAL VERDICT
PRODUCTION WORKSPACE      CONNECTED
PROJECT ISOLATION         PASS
PANEL INTELLIGENCE        PASS
PIPELINE RECONCILIATION   PASS
READY FOR FOUNDER REVIEW  YES
```

## Remaining (honest)

| Item | Why open |
|---|---|
| NDXBOOK DESIGN truth | the twin golden master is a reconstruction workspace, not a recorded page-family authority — mapping it needs a founder call on what counts as NDXBOOK's site authority |
| Studio World / Frontal Slayer Mansion EXPERIENCE | no zone / room registry exists; the sprint forbids inventing world structures |
| `ProjectFamilyChamber` (JURNL modes) | still F01-centred with literal denominators; the DESIGN overview covers F01–F16 truthfully |
| Continuity as graph nodes | Entry 002 continuity lives in cast state, not yet a node |
| NDXBOOK legacy bodies | HubBody / InboxBody / ActivityBody keep NDX-only panels classified `GATED_TO_OWN_PROJECT` (e.g. NEW ENTRY tile without create path, messages shell, ARCHIVED 0) |
| Expression downstream deliverables, sets literals, storyboard sequence frames | `OPEN` in the panel registry |
| Ledger persistence | workspace actions persist per browser (localStorage) for non-NDX projects; a server ledger is the next step for shared truth |
| Unscoped links inside NDXBOOK bodies | canonicalized per tab (sessionStorage) — safe, but the helpers could carry the project explicitly |

## Full suite

`npx vitest run` on the branch merged with `main @ 61a5e901`: **10 630 tests in 2 243 files**. 107 failures, of which 106 are
on `main`'s pre-existing failure list and 1 was this sprint's — `productionHubDescendantsOpus1 › every HUB action targets an
existing production route` (its allow-list predated the HUB BLOCKERS link to the existing ACTIVITY → BLOCKERS lens); the
allow-list now includes that lens → **0 new failures**. Workspace baseline (17 files, 374 tests): only the 2 pre-existing
failures (`productionAuthorityAlignmentSonnet1R1`, `productionAuthorityConvergenceOpus1` — host-chrome scaling, also on
`main`). `tsc --noEmit` clean.
