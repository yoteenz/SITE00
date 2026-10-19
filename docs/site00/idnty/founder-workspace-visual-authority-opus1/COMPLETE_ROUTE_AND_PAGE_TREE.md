# Complete route and page tree

**Status:** PROPOSED. Visual authority: board 26. Route decisions are open as **FD-W6** (landing route and scheme) and **FD-W7** (Readiness Desk retirement).

## 1. Current routes (audited)

All routes sit under `/admin` → `AdminGuard` → `AdminSuspense` (`src/App.tsx:22-25`) and are defined in `src/routes/Site00AdminRoutes.tsx`. Route constants live in `src/site00/config/routes.ts`.

| # | Path | Constant | Page (`src/site00/admin/pages/foundation/`) | Shell | Notes |
| --- | --- | --- | --- | --- | --- |
| R1 | `/admin/site00/foundation` | `digitalFoundationAdmin` :50 | `FoundationAdminListPage.tsx` | none | Create lead + link (hard-coded email), table, `window.prompt` |
| R2 | `/admin/site00/foundation/:id` | `digitalFoundationAdminDetail` :51 | `FoundationAdminDetailPage.tsx` | none | State dl, intake, quote, events, mark complete |
| R3 | `/admin/site00/foundation/pipeline` | `digitalFoundationPipeline` :52 | `FoundationPipelinePage.tsx` | none | Business / payment / stage / next action / blocker |
| R4 | `/admin/site00/foundation/:id/command` | `digitalFoundationProjectCommand` :53 | `FoundationProjectCommandPage.tsx` | none | Raw JSON |
| R5 | `/admin/site00/foundation/:id/workbench` | `digitalFoundationWorkbench` :54 | `FoundationWorkbenchPage.tsx` | none | Raw JSON |
| R6 | `/admin/site00/foundation/communications` | `digitalFoundationCommunications` :55 | `CommunicationsCommandPage.tsx` | none | Static policy text + links |
| R7 | `/admin/site00/foundation-readiness` | `digitalFoundationReadiness` :56 | `FoundationReadinessPage.tsx` | `Site00AdminShell` | Readiness Desk; **auth-email return path** (`src/utils/auth/site00AuthRedirect.ts:8-17`) |

Adjacent routes outside the workspace stay unchanged: Correspondence Studio (`/admin/site00/correspondence-studio[/:project[/:campaign[/:email]]]`), intakes (`/admin/site00/intakes…`, `/client-intakes`, `/bldr-intakes…`), the admin dashboard (`/admin/site00`), email debug (`/admin/site00/debug/email-pack`), and the public client routes (`/foundation/:token`, `/foundation/review`, `/invite/:code`). The unrouted constant `invitationAdmin` (`/admin/site00/invitation`) stays unrouted; it is not part of this workspace.

## 2. Proposed route map

New destinations are **static segments** under `/admin/site00/foundation`. R3 (`/pipeline`) and R6 (`/communications`) already use this pattern beside `/:id`; React Router ranks static segments above dynamic ones, so artifact IDs cannot collide with them. **Every existing URL keeps resolving.**

| Destination | Path | Query state | Origin |
| --- | --- | --- | --- |
| 01 OVERVIEW | `/admin/site00/foundation/overview` | — | NEW |
| 02 FOUNDATIONS · registry | `/admin/site00/foundation` | `?view=invited\|intake\|review\|quote\|active\|complete`, `?q=`, `?test=1`, `?sort=` | R1 path kept |
| 02 · client record | `/admin/site00/foundation/:id` | `?section=overview\|intake\|recommendations\|quote\|operations\|records\|communications\|activity` | R2 path kept |
| 03 REVIEWS | `/admin/site00/foundation/reviews` | `?tab=intakes\|recommend\|quotes\|requests\|exceptions\|history` | NEW |
| 03 · review detail | `/admin/site00/foundation/reviews/:kind/:id` | — | NEW |
| 04 OPERATIONS | `/admin/site00/foundation/operations` | `?state=active\|blocked\|verify` | NEW |
| 05 CORRESPONDENCE | `/admin/site00/foundation/communications` | `?tab=messages\|invitations\|lifecycle\|delivery` | R6 path kept |
| 06 SYSTEM | `/admin/site00/foundation/system` | `?tab=overview\|stack\|integrations\|security\|test-lab\|report` | NEW |

### Disposition of every existing route

| Route | Disposition | Behaviour after implementation |
| --- | --- | --- |
| R1 | PRESERVED · same path | Renders 02 FOUNDATIONS |
| R2 | PRESERVED · same path | Renders the client record |
| R3 | MOVED · redirect | `→ /admin/site00/foundation/operations` (path keeps resolving) |
| R4 | MOVED · redirect | `→ /admin/site00/foundation/:id?section=operations` |
| R5 | MOVED · redirect | `→ /admin/site00/foundation/:id?section=operations&view=tasks` |
| R6 | PRESERVED · same path | Renders 05 CORRESPONDENCE |
| R7 | PRESERVED · same path | Keeps rendering the Readiness Desk until FD-W7 accepts SYSTEM parity; afterwards renders 06 SYSTEM (TEST LAB + READINESS REPORT) at the same path. The auth return path must keep resolving either way. |

**Admin navigation entry (FD-W6).** Recommended: one "DIGITAL FOUNDATION" item in the admin control navigation (`src/site00/admin/config/control-nav.ts`) pointing at `/admin/site00/foundation/overview`. Today no admin nav item reaches any DF page.

**Refresh and deep links.** Every view state that a founder might share or refresh lives in the path or query (section, tab, view, selection `?sel=<id>` on desktop). Overlays do not; refresh closes them.

## 3. Page tree

Minimum conceptual coverage from the sprint (§07), extended by the source audit. Registry IDs (COMPLETE_COMPONENT_INVENTORY.md) in brackets.

```
FOUNDER WORKSPACE
├── GLOBAL APPLICATION SHELL [SH-01]
│   ├── FOUNDER IDENTITY [SH-02] ─ ACCOUNT MENU [SH-07 · OL-18]
│   ├── ENVIRONMENT INDICATOR [SH-03]
│   ├── GLOBAL SEARCH / COMMAND ENTRY [SH-04 · OL-04]
│   ├── NOTIFICATION CENTER [SH-05 · OL-05]
│   ├── GLOBAL CREATE ACTION [SH-06 · OL-01 · OL-02]
│   ├── NAVIGATION SYSTEM: BOTTOM NAV [SH-08] · MENU DRAWER [SH-09 · OL-03] · RAIL [SH-10] · SIDEBAR [SH-11]
│   ├── WORKSPACE CONTENT HOST + PAGE TITLE [SH-16]
│   ├── CONTEXTUAL INSPECTOR HOST [SH-12]
│   ├── MODAL / SHEET HOST [SH-13]
│   ├── GLOBAL FEEDBACK HOST [SH-14]
│   └── RESPONSIVE LAYOUT CONTROLLER [SH-15]
├── 01 / OVERVIEW [OV-01]
│   ├── OVERVIEW HEADER (page title)
│   ├── OPERATIONAL SNAPSHOT · signals [OV-02]
│   ├── CURRENT FOCUS [OV-03]
│   ├── NEEDS ATTENTION [OV-04]
│   ├── ACTIVE FOUNDATIONS [OV-05]
│   ├── RECENT ACTIVITY [OV-06]
│   ├── NEXT MILESTONE [OV-07]
│   ├── QUICK CREATE (shell create) [SH-06]
│   └── EMPTY / ERROR / STALE STATES [OV-08]
├── 02 / FOUNDATIONS [FN-01]
│   ├── CLIENT REGISTRY · rows [FN-05]
│   ├── SEARCH [FN-02] · STATUS VIEWS [FN-03] · FILTERS + SORT [FN-04 · OL-07]
│   ├── CREATE CLIENT [FN-07] + DUPLICATE NOTICE [FN-08] + LINK READY [OL-02]
│   ├── ROW ACTIONS [FN-10 · OL-06]
│   ├── CLIENT PREVIEW · inspector [FN-06 · OL-19]
│   ├── CLIENT RECORD [CR-01]
│   │   ├── HEADER [CR-02] · QUICK ACTIONS [CR-03] · JOURNEY [CR-04] · NEXT ACTION [CR-05] · SECTION TABS [CR-13]
│   │   ├── OVERVIEW
│   │   ├── INTAKE [CR-06]
│   │   ├── RECOMMENDATIONS [CR-07]
│   │   ├── QUOTE [CR-08] ─ APPROVE [OL-08] · REVISE [OL-09]
│   │   ├── OPERATIONS [CR-09] (former R4 + R5)
│   │   ├── RECORDS [CR-10] ─ MARK COMPLETE [OL-10]
│   │   ├── COMMUNICATIONS [CR-11]
│   │   └── ACTIVITY [CR-12]
│   └── REGISTRY STATES [FN-09]
├── 03 / REVIEWS [RV-01]
│   ├── REVIEW QUEUE · tabs [RV-02] · items [RV-03]
│   │   └── INTAKES · RECOMMENDATIONS · QUOTES · CLIENT REQUESTS · EXCEPTIONS (verification, blocked, payment)
│   ├── REVIEW DETAIL [RV-04]
│   ├── APPROVAL DECISIONS [RV-05 · OL-08 · OL-11]
│   ├── REVIEW HISTORY [RV-06]
│   └── REVIEW STATES [RV-07]
├── 04 / OPERATIONS [OP-01]
│   ├── OPERATIONS OVERVIEW + ACTIVE WORK [OP-02] (former R3)
│   ├── RUNBOOK WORKSPACE · stage rail [OP-03] · runbook setup [OP-10] · stage update [OP-11]
│   ├── EXECUTION TASKS [OP-04] · task inspector [OP-05 · OL-12]
│   ├── DEPENDENCIES [OP-06]
│   ├── VERIFICATION CENTER [OP-07]
│   ├── OWNERSHIP RECORDS (record RECORDS section [CR-10])
│   ├── PROVIDER ACTIONS (set-providers in [OP-10])
│   ├── CLIENT ACTION REQUIREMENTS [OP-08]
│   ├── MILESTONES (stage rail + next milestone [OV-07])
│   ├── BLOCKERS [OP-09 · OL-13]
│   └── OPERATIONS STATES (list/panel state sets)
├── 05 / CORRESPONDENCE [CO-01]
│   ├── CORRESPONDENCE OVERVIEW + policy banner
│   ├── CLIENT CONVERSATIONS [CO-03 · OL-14]
│   ├── INVITATIONS (prepare + preview) [CO-05]
│   ├── EMAIL TEMPLATES → Correspondence Studio [CO-07]
│   ├── LIFECYCLE COMMUNICATIONS [CO-04]
│   ├── DELIVERY STATUS [CO-02]
│   ├── OUTBOUND APPROVAL [CO-06 · OL-15]
│   ├── MESSAGE HISTORY (thread + activity)
│   ├── COMMUNICATION SETTINGS (consents, read-only) [CO-08]
│   └── CORRESPONDENCE STATES
├── 06 / SYSTEM [SY-01]
│   ├── SYSTEM OVERVIEW · verdict [SY-02] · modules [SY-03 · OL-16]
│   ├── STAGING STACK [SY-04] (API HEALTH, SUPABASE, PERSISTENCE)
│   ├── INTEGRATIONS [SY-05] (EMAIL PROVIDER, DOMAIN / DNS, STRIPE, WEBHOOKS)
│   ├── DATABASE SECURITY [SY-06]
│   ├── ENVIRONMENT CONFIGURATION [SY-08] · BUILD META [SY-09]
│   ├── TEST LAB [SY-10 · SY-11 · SY-12 · SY-13 · OL-17]
│   ├── READINESS REPORT [SY-07]
│   ├── DIAGNOSTICS (module detail + technical error detail [OL-20])
│   └── SYSTEM STATES
└── SHARED INTERACTION COMPONENTS [SC-01…SC-18]
    ├── CLIENT IDENTITY [SC-01] · STATUS INDICATORS [SC-02 · SC-04] · PROGRESS SYSTEM [SC-03]
    ├── ACTIVITY ROWS [SC-05] · TASK ROWS [OP-04] · KEY/VALUE [SC-17] · LINK BLOCK [SC-18]
    ├── ACTION MENUS [SC-08] · SEARCH CONTROLS [SH-04] · FILTER CONTROLS [FN-04] · TABS [SC-10]
    ├── DETAIL INSPECTORS [SH-12] · REVIEW CONTROLS [RV-05]
    ├── MODALS + CONFIRMATIONS [SC-11] · SHEETS [SC-09] · NOTIFICATIONS [SH-05] · TOASTS [SC-14]
    ├── ERROR STATES [SC-15] · LOADING STATES [SC-13] · EMPTY STATES [SC-12]
    └── RESPONSIVE VARIANTS (RESPONSIVE_COMPONENT_MATRIX.md)
```

## 4. Primary flows through the tree

| Flow | Path | Phone taps |
| --- | --- | --- |
| Decide | Overview focus → review detail → approve (confirm) → toast → next decision | 3 |
| Create | Create → form → link ready (copy / client view) → record | 3 |
| Find | Search → client → record section | 2 |
| Unblock | Notification (blocked) → record operations → task → set or clear blocker | 4 |
| Diagnose | System verdict → module → next action → re-run report | 3 |
| Test | System test lab → create synthetic → journey steps → gated send → reset (confirm) | 5 |
