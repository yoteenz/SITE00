# Legacy defaults and fallbacks

Every place the Production Workspace path assumed NDXBOOK (or another project) when the active project was missing, and
what it does now. Rule: a missing project renders the project picker; a missing domain renders the project-scoped
NOT_ESTABLISHED state. Nothing falls back to NDXBOOK.

## Removed (workspace path)

| Location (main @ 2225bc99) | Default / fallback | Now |
|---|---|---|
| `ProductionAuthorityFrame.tsx` `projectSlugFromPath` | global tabs → `'ndxbook'` | `useActiveProjectId` (URL → tab choice → picker) |
| `ProductionAuthorityData.tsx` provider | `projectId` optional, default NDXBOOK | required |
| `chrome.tsx` `projectIdFromPath` | `'ndxbook'` for HUB / INBOX / LIBRARY / ACTIVITY | active project or `null` (SELECT) |
| `chrome.tsx` queued count | NDXBOOK attention (or all requests) | active project's NEEDS_YOU |
| `nav.tsx` hrefs | no project | `scopedTabHref(tab, project)` |
| `projectHostProfile.ts` `projectSwitchPath` | non-domain tab → `/design` | `projectSwitchTarget` keeps the tab |
| `model.ts` `hubDeepLink` | `entry=002` on any project; queue / libraries unscoped | `entry` only for NDXBOOK; scoped |
| `ProductionWorkspaceProjectHubPage.tsx` | `useParams` `projectSlug = 'ndxbook'`; `?? '002'` with a global context entry | route slug; stored entry only for its own project |
| `DesignChamber.tsx` (DesignModeBar, ViewportChamber, DesignChamber) | `projectSlug = 'ndxbook'` ×3 | route slug (`useDesignProjectSlug`) |
| `DesignChamber` default mode | `'brand'` chamber | DESIGN overview (graph) |
| `ExpressionBody.tsx:30`, `ExperienceBody.tsx:22`, `InboxBody.tsx:218`, `ActivityBody.tsx:141`, `expressionData.ts:37` | `?? 'ndxbook'` | `?? ''` (no project = nothing) |
| `ExpressionProductionShellPage.tsx` `ExpressionRoutes`, `ExperienceProductionShellPage.tsx` | `projectSlug = 'ndxbook'` | `''` |
| `ProductionWorkspaceContext.tsx` | `projectSlug … ?? 'ndxbook'` | `?? ''`; entry recorded under the route project |
| `productionContextStorage.ts` | `projectSlug ?? 'ndxbook'`; brand / campaign / entry carried across projects | no default; dropped on a project change |
| `ProductionHub.tsx:71` `initialHubState('ndxbook')` | machine view under any project | machine view mounts only for NDXBOOK (the default is now true by construction) |
| `ExperienceBody` hero | `'NDXBOOK'` label fallback | not routed (world graph) |
| `LibraryBody` | ENTRY 002 vault, `/production/ndxbook/design` | not routed (graph LIBRARY) |
| DESIGN viewport dev fixture | `/app/preview/fixture-app-ndxbook` for any non-runtime project | VIEWPORT offered to NDXBOOK + runtime projects only |
| `/production/<any>/design/<sub>` | NDXBOOK golden-reference reconstruction workspace | NDXBOOK only; others → their DESIGN overview |
| `useProductionHubData` | requests / activity of every project | filtered to the project (`activityProjectOf` for legacy rows: project id → asset-slot prefix → single project name; else excluded) |

## Remaining NDXBOOK-specific code (correct by scope, documented)

| Location | Why it is not a fallback |
|---|---|
| `DesignChamber.designModesFor` — `slug === 'ndxbook'` | NDXBOOK's own legacy chamber is offered only to NDXBOOK |
| `useEntry002Production.isEntry002Project` | Entry 002 belongs to NDXBOOK; used to decide whether the project has that production |
| `DesignProductionWorkspacePage.tsx`, `useDesignProductionNavigation.ts`, `TwinOpusDirectScreen.tsx`, `twinOpusDirectWorkspace.ts`, `useTwinOpusDirectProduction.ts` | `projectSlug = 'ndxbook'` defaults inside the NDXBOOK reconstruction workspace, now mounted only under `/production/ndxbook/design/<sub>` (the route param is always present) |
| `production-authority-registry.ts:97,116` | helper defaults; the only caller passes the project |
| `ReferenceShellSuspenseFallback.tsx:70` | loader fallback outside the Production Workspace |
| Evolve / admin / founder-workspace pages | separate products (NDXBOOK pilot tooling), not workspace projections |

## Link canonicalization (safety net)

NDXBOOK's Entry 002 bodies still contain unscoped links authored by earlier sprints (`/production/queue?view=…`,
`/production/activity?view=…`; their helpers `inboxHref` / `activityHref` are asserted by prior tests). The frame rewrites
any global URL without `?project=` to the project **this browser tab** last chose (sessionStorage), so such a link can
never open another tab's project. Verified live: an unscoped NDXBOOK lens link lands on `?project=ndxbook`.
