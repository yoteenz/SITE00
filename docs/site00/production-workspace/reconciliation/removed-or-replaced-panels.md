# Removed or replaced panels

Every audited panel with its classification and what happened to it. Generated from `AUDITED_PANELS`
(`shared/site00-production-graph/panelContracts.ts`); a panel is not preserved just because it exists.

`LibraryBody.tsx` and `ExperienceBody.tsx` are no longer routed (LIBRARY and EXPERIENCE render graph projections for every
project); their source files stay only because earlier sprints' tests import their exports. "Removed" below means removed
from what any route renders. Totals:

| Disposition | Count |
|---|---|
| REMOVED | 8 |
| REPLACED | 8 |
| UNMOUNTED | 1 |
| REWRITTEN | 16 |
| GATED_TO_OWN_PROJECT | 33 |
| KEPT | 3 |
| OPEN | 5 |

## Removed (8)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `experience-unresolved-spatial-issues` | ExperienceBody | PROJECT_LEAK | showed Expression blockers as spatial issues |
| `library-categories` | LibraryBody | MOCK | arbitrary category mapping |
| `library-vault` | LibraryBody | DECORATIVE · PROJECT_LEAK | — |
| `library-open-authority` | LibraryBody | PROJECT_LEAK | hard /production/ndxbook/design |
| `library-most-used` | LibraryBody | MOCK | — |
| `library-collections` | LibraryBody | DECORATIVE | — |
| `library-actors` | LibraryBody | REAL_BUT_POORLY_SCOPED · PROJECT_LEAK | catalogue lives in EXPRESSION → CASTING |
| `library-empty-categories` | LibraryBody | DECORATIVE | — |

## Replaced by a graph panel (8)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `design-chamber (non-ingested)` | DesignChamber | MOCK · DECORATIVE · PROJECT_LEAK | project-design-* overview; chamber modes only where the project has them |
| `experience-root` | ExperienceBody | DECORATIVE · PROJECT_LEAK | project-experience-* (world graph) / domain-empty-experience |
| `experience-capsules` | ExperienceBody | REAL_BUT_POORLY_LABELLED | kinds lens with real counts |
| `expression (non-established project)` | ExpressionBody + families | PROJECT_LEAK | domain-empty-expression |
| `library-tabs` | LibraryBody | MOCK | project-library-artifacts status lenses |
| `library-facts` | LibraryBody | MOCK · REAL_BUT_POORLY_LABELLED | project-library-artifact lineage |
| `library-recent` | LibraryBody | REAL_BUT_POORLY_LABELLED · PROJECT_LEAK | project-library-artifacts |
| `library-lineage-flow` | LibraryBody | MOCK | project-library-artifact lineage |

## Unmounted (source kept) (1)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `experience-children` | ExperienceProductionShellPage | DECORATIVE | every /experience/<sub> renders the project world graph |

## Rewritten (same panel, new contract) (16)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `hub-live-updated` | HubBody | REAL_BUT_POORLY_SCOPED | activity now project-filtered (activityProjectOf) |
| `hub-items-need-you` | HubBody | PROJECT_LEAK | attention excludes other projects’ requests; others → project-hub-counts |
| `hub-blockers` | HubBody | REAL_BUT_POORLY_LABELLED | links to ACTIVITY → BLOCKERS, the list it counts |
| `hub-activity` | HubBody | PROJECT_LEAK · REAL_BUT_POORLY_LABELLED | 7 undated synthetic NOW rows removed; dated recorded events only |
| `production-chrome-project` | chrome | PROJECT_LEAK | shows the active project; switch keeps the tab |
| `production-attention-count` | chrome | PROJECT_LEAK | graph NEEDS_YOU count of the active project |
| `nav-activity-dot` | nav | DECORATIVE | dot only when the project has a non-source event in the last 24 h |
| `nav-hrefs` | nav | PROJECT_LEAK | every tab href carries the active project |
| `inbox-incoming` | InboxBody | PROJECT_LEAK · DUPLICATE | requests filtered to the project |
| `inbox-general-request-href` | InboxBody | UNRESOLVED | /production/<p> now resolves to the project HUB |
| `expression-travel formats` | ExpressionBody | MOCK | formats = entry plan format adaptations |
| `casting-root-overview` | CastingFamily | UNRESOLVED | ROLES CAST / CAST ASSIGNED count catalogued actors only |
| `expression-breadcrumb detail` | ExpressionProductionShellPage | PROJECT_LEAK | family routes render only for an established EXPRESSION project |
| `expression family state` | ExpressionFamilyScreen | PROJECT_LEAK | keyed by project — child state never survives a switch |
| `activity-feed` | ActivityBody | PROJECT_LEAK · REAL_BUT_POORLY_LABELLED | no synthetic state rows; activity project-filtered |
| `activity-today` | ActivityBody | REAL_BUT_POORLY_LABELLED | TODAY counts dated events only |

## Gated to the one project whose truth it shows (33)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `authority-hero` | HubBody | DECORATIVE · PROJECT_LEAK | NDXBOOK only; other projects → project-hub-head |
| `hub-active-entry` | HubBody | PROJECT_LEAK | Entry 002 shown only under NDXBOOK |
| `hub-current-phase` | HubBody | REAL_BUT_POORLY_LABELLED | others → project-hub-head phase |
| `hub-overview` | HubBody | REAL_CANONICAL | others → project-hub-progress |
| `hub-components` | HubBody | REAL_BUT_POORLY_SCOPED | 8 storyboard frames = 8 mounted receipts (real files) |
| `hub-entries` | HubBody | LEGACY · MOCK | NEW ENTRY tile has no create path (REMAINING) |
| `hub-operations` | HubBody | REAL_BUT_POORLY_SCOPED | others → project-hub-needs-you |
| `hub-open-machine` | HubBody | LEGACY | machine view only for NDXBOOK |
| `hub-machine` | ProductionHub | LEGACY · PROJECT_LEAK | /production?project=ndxbook&view=machine only |
| `hub-modes` | ProductionHub | DECORATIVE | — |
| `hub-filmstrip` | ProductionHub | REAL_BUT_POORLY_SCOPED | 8 placeholder cells until the pipeline reports panels |
| `hub-compare` | ProductionHub | MOCK | KEY FINDINGS / CONTINUITY hard UNAVAILABLE (REMAINING) |
| `hub-table` | ProductionHub | DUPLICATE | — |
| `inbox-tabs` | InboxBody | REAL_CANONICAL | others → project-inbox-lenses |
| `inbox-focus` | InboxBody | REAL_BUT_POORLY_SCOPED | others → project-inbox-needs-you |
| `inbox-attention` | InboxBody | REAL_BUT_POORLY_LABELLED | — |
| `inbox-resolved-rail` | InboxBody | REAL_BUT_POORLY_SCOPED | activity now project-filtered |
| `inbox-watching` | InboxBody | REAL_CANONICAL | — |
| `inbox-resolved` | InboxBody | REAL_BUT_POORLY_SCOPED | ARCHIVED hard 0 (REMAINING) |
| `inbox-messages` | InboxBody | MOCK | messages not connected — shown as unmounted |
| `inbox-system` | InboxBody | REAL_BUT_POORLY_SCOPED | — |
| `inbox-item-detail` | InboxBody | REAL_BUT_POORLY_SCOPED | others → project-inbox-item |
| `inbox-thread` | InboxBody | MOCK | — |
| `design-pipeline` | DesignChamber | MOCK | NDXBOOK legacy chamber; hidden under a runtime project viewport |
| `design-table` | DesignChamber | MOCK · PROJECT_LEAK | cards opened NDXBOOK reconstruction workspace from JURNL viewport — hidden there |
| `design-workspace (/design/<sub>)` | TwinOpusDirectScreen | LEGACY · OBSOLETE_PIPELINE · PROJECT_LEAK | NDXBOOK only; other projects resolve to their DESIGN overview |
| `design-viewport (non-runtime)` | ViewportChamber | PROJECT_LEAK | dev fixture was NDXBOOK; VIEWPORT offered to NDXBOOK + runtime projects only |
| `expression-hero` | ExpressionBody | DECORATIVE | — |
| `activity-blockers` | ActivityBody | REAL_BUT_POORLY_LABELLED | others → project-activity-blockers |
| `activity-milestones` | ActivityBody | DUPLICATE | — |
| `activity-pending-review` | ActivityBody | DUPLICATE | INBOX is where decisions are acted on |
| `activity-comment-filters` | ActivityBody | DECORATIVE | comments unmounted, shown as such |
| `activity-related` | ActivityBody | DUPLICATE | — |

## Kept (canonical) (3)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `design-viewport (runtime)` | ViewportChamber | REAL_CANONICAL | — |
| `casting-available-talent` | CastingFamily | REAL_BUT_POORLY_SCOPED | catalogue is global by design (studio talent); media fixed in #1400 |
| `casting-lead-authority` | CastingFamily | REAL_CANONICAL | media fixed in #1400 |

## Open — not resolved this sprint (REMAINING) (5)

| Panel | Surface | Classification | Note |
|---|---|---|---|
| `project-family-chamber` | ProjectFamilyChamber | REAL_BUT_POORLY_SCOPED | uses F01 only + literal denominators (REMAINING); DESIGN overview now covers F01–F16 |
| `expression-active NEW ENTRY` | ExpressionBody | MOCK | no create path (REMAINING) |
| `sets hierarchy` | SetsFamily | MOCK | hard-coded literals (REMAINING) |
| `storyboard sequence frames` | StoryboardFamily | REAL_BUT_POORLY_SCOPED | same 8 frames for every sequence (REMAINING) |
| `downstream deliverables` | DeliverablesFamily | OBSOLETE_PIPELINE · MOCK | state hard PLANNED (REMAINING) |

## Superseded test expectations

| Test | Was | Now | Why |
|---|---|---|---|
| `jurnlF01ProjectIngestion` | switch from `/production/queue` lands on `/production/jurnl/design` | `/production/queue?project=jurnl` | a project switch keeps the tab (founder decision) |
| `productionInboxAuthorityFamilyOpus2 › 13` | chrome source contains `pathname.startsWith('/production/queue')` | `workspaceTabOf('/production/queue') === 'INBOX'` + `tab === 'INBOX'` branch | the active tab is resolved by the shared project-scope module |
