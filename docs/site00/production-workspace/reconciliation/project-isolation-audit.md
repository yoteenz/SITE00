# Project isolation audit

Rule: **NO CROSS-PROJECT DATA FALLBACK. EVER.** NDXBOOK must never fill JURNL, SITE 00, AIO, Frontal Slayer, Astral World
or any other project.

## Isolation mechanism

1. **Active project from the URL.** Every root tab carries the project (`projectScope.ts`):

   | Tab | URL |
   |---|---|
   | HUB | `/production?project=<p>` (`/production/<p>` redirects here) |
   | INBOX | `/production/queue?project=<p>[&view=]` |
   | DESIGN | `/production/<p>/design[?mode=]` |
   | EXPERIENCE | `/production/<p>/experience` |
   | EXPRESSION | `/production/<p>/expression` |
   | LIBRARY | `/production/libraries?project=<p>` |
   | ACTIVITY | `/production/activity?project=<p>[&view=]` |

2. **No default project.** Resolution: path slug → `?project=` → this tab's last choice (sessionStorage) → last choice in any
   tab (localStorage) → **none = project picker** (`ProjectSelectState`). The frame rewrites a global URL without a
   project to carry the resolved one.
3. **One graph per project.** `assembleProjectGraph` keeps only rows whose `project_id` is the project; anything else is
   counted in `foreign_dropped` (test: an AIO part injected into JURNL is dropped, JURNL is unchanged).
4. **Panel queries are scoped.** `getWorkspacePanelData` throws `PROJECT_SCOPE_VIOLATION` when asked for a project the graph
   is not.
5. **NDXBOOK bodies only render NDXBOOK.** `HubBody` / `InboxBody` / `ActivityBody` (Entry 002 authority bodies) render only
   when `isEntry002`; every other project renders the graph projection. EXPRESSION family routes are gated on the domain
   being established. The NDXBOOK machine view (`?view=machine`) mounts only for NDXBOOK.
6. **Ledger actions are keyed.** A workspace action belongs to one project; replay ignores other projects' actions and
   actions naming nodes the project does not have.

## Leaks found and fixed

| # | Where (main) | Leak | Fix |
|---|---|---|---|
| 1 | `ProductionAuthorityFrame.tsx:28-31,76` | global tabs read `'ndxbook'` | active project from URL / tab choice / picker |
| 2 | `chrome.tsx:58-64` | project chip + ITEMS NEED YOU = NDXBOOK on every global tab | chip = active project; count = graph `NEEDS_YOU` |
| 3 | `nav.tsx:16-23`, `model.ts:137-142` | nav hrefs without project; EXPERIENCE → empty child | `productionNavHref(id, project)` → `scopedTabHref` |
| 4 | `projectHostProfile.ts:48-57` | switch dropped the tab (→ DESIGN) | `projectSwitchTarget` keeps the tab |
| 5 | `useProductionHubData.ts:69,161-193` | requests + activity of every project | filtered by project (`activityProjectOf`) |
| 6 | `InboxBody.tsx:210,218` | unfiltered requests, `?? 'ndxbook'` | filtered; no default |
| 7 | `ActivityBody.tsx:99-110` | 7 undated synthetic rows (NOW) in the feed + TODAY | dated recorded events only |
| 8 | `DesignChamber.tsx:36,283,623` | `useParams` default `'ndxbook'`; generic chamber with NDX GROTESK for every project | route project only; modes only where the project has them |
| 9 | `DesignChamber` viewport (JURNL) | ON YOUR TABLE cards → NDXBOOK reconstruction workspace | hidden under a runtime project viewport |
| 10 | `/production/<any>/design/workspace` | NDXBOOK golden-reference workspace under any project | NDXBOOK only; others → their DESIGN overview |
| 11 | `ExperienceBody.tsx:22,29` | hero fallback NDXBOOK; Expression blockers shown as spatial issues | replaced by the world graph |
| 12 | `ExpressionProductionShellPage.tsx:55-71` | breadcrumb resolved Entry 002 role / actor ids under JURNL | family routes gated on EXPRESSION established |
| 13 | `ExpressionSubScreens.tsx:73-82` | family `useState` survived a project switch | `key={slug}` |
| 14 | `ProductionWorkspaceProjectHubPage.tsx:28`, `ExpressionProductionShellPage.tsx:96` | `context.entryId ?? '002'` from another project | stored entry used only for its own project |
| 15 | `productionContextStorage.ts:19`, `ProductionWorkspaceContext.tsx` | default `'ndxbook'`; entry / campaign carried across projects | no default; dropped on project change; recorded under the route project |
| 16 | `LibraryBody.tsx` | ENTRY 002 vault, hard `/production/ndxbook/design` | LIBRARY = graph artifacts for every project |
| 17 | `model.ts:129` (`hubDeepLink`) | `entry=002` on any project | only for NDXBOOK |
| 18 | `expressionData.ts:37`, `ExpressionBody.tsx:30`, `ActivityBody.tsx:141` | `?? 'ndxbook'` | `?? ''` |

## Stale-state invalidation

A project switch keeps the TAB and drops every project-dependent child state (`projectSwitchTarget`). Lens views that do
not depend on the project are kept: INBOX `view`, ACTIVITY `view`, DESIGN `mode` (a project without that mode renders its
overview).

| State | Where | On switch |
|---|---|---|
| selected item / notice / thread | INBOX `?item` `?notice` `?thread` | dropped |
| milestone / node | ACTIVITY `?milestone` `?node` | dropped |
| artifact / status lens | LIBRARY `?artifact` `?status` | dropped |
| family / method / screen / state / inspect / preset | DESIGN query | dropped (mode kept) |
| scene / kind | EXPERIENCE query | dropped |
| entry / format / role / actor / character | EXPRESSION path + query | dropped (lands on EXPRESSION root) |
| expression family component state | `useState` | remounted (`key={slug}`) |
| entry / campaign context | localStorage | not carried across projects |
| counts, blockers, inbox items, activity feed, derived metrics, preview media | graph | re-derived from the new project's graph (one provider per project) |
| a stale id from another project in the URL | any `?item / ?artifact / ?node / ?family / ?scene` | resolves to ITEM / ARTIFACT / NODE / FAMILY / SPATIAL NODE NOT FOUND — never another project's record (test C) |

## Route validity (live, 3 viewports)

| Flow | Result |
|---|---|
| Switch NDXBOOK → JURNL from the host chip on each of the 7 tabs | tab kept, child state dropped — 21 / 21 |
| Cold load of a scoped URL | project kept — 3 / 3 |
| Browser reload | project kept — 3 / 3 (after the loader fix below) |
| Back / forward between projects | each step restores its project — 3 / 3 |
| Direct URL without project | resolves to this tab's project — 3 / 3 |
| Unscoped legacy link inside an NDXBOOK body | resolves to NDXBOOK — 3 / 3 |
| `/production/<p>` | → `/production?project=<p>` — 3 / 3 |
| NDXBOOK reconstruction workspace under JURNL | → JURNL DESIGN overview — 3 / 3 |
| A mode the project lacks (`AIO ?mode=brand`) | AIO DESIGN overview — 3 / 3 |
| No project chosen | picker — 1 / 1 |

### Browser reload (pre-existing site-wide crash, fixed)

A browser reload replays the cold-start immersive loader while the session is already complete. The static watchdog
`public/site00-assts-boot-recovery.js` then removed the React-owned `.site00-immersive-loader` portal node, and React's own
unmount threw `NotFoundError: removeChild` — a blank page on **every** route (reproduced on `main`, dev and production
build). The watchdog now dispatches the gate's `site00-force-reveal-loader` event so React unmounts its own portal (the
rule already written in `dispatchSite00ForceRevealLoader`). Direct DOM removal remains only for the true recovery path
(React never mounted).
