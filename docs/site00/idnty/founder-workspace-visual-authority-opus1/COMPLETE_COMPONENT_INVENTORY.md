# Complete component inventory (registry)

**Status:** PROPOSED. No component is founder-approved. The registry is generated from `registry/registry_data.py` by `registry/build-registry.py`; the same data is in `registry/component-registry.json` and `registry/component-registry.csv` with all 19 required columns (§40).

**Count:** 124 components in 10 families: SHELL 16, OVERVIEW 8, FOUNDATIONS 10, CLIENT RECORD 13, REVIEWS 7, OPERATIONS 11, CORRESPONDENCE 8, SYSTEM 13, SHARED 18, OVERLAY 20.

**Reading a row:** `EXISTING SOURCE PATH` is what ships today (or `none`). `PROPOSED SOURCE PATH` is a suggested location under `src/site00/admin/founder-workspace/` that Composer confirms in Phase 0. `VISUAL AUTHORITY` names the boards in `boards/`. `INTERACTION STATES` are expanded in COMPONENT_STATE_MATRIX.md. `API DEPENDENCY` actions are on `/api/admin/site00-foundation` unless stated; `(G-xx)` marks a data gap from DATA_CONTRACT_MAPPING.md §9.

**Readiness rule:** a component is implementation-ready only when every column below is filled and its phase dependencies (COMPOSER_IMPLEMENTATION_HANDOFF.md) are met. Rows that depend on G-04 (operations persistence) are buildable, but their actions must surface the persistence limit honestly.

## Summary

| ID | Family | Component | Existing | Boards | Phase | Approval |
| --- | --- | --- | --- | --- | --- | --- |
| SH-01 | SHELL | FounderWorkspaceShell | src/site00/admin/components/shell/Site00AdminShell.tsx (R7 only) | 01 · 02 · 25 | 1 | PROPOSED |
| SH-02 | SHELL | FounderIdentity | src/site00/admin/components/shell/Site00AdminShell.tsx footer (static “OWNER / ADMIN”) | 01 · 02 | 1 | PROPOSED |
| SH-03 | SHELL | EnvironmentIndicator | none (static “ONLINE”) | 01 · 02 | 1 | PROPOSED |
| SH-04 | SHELL | GlobalSearch | src/site00/admin/components/operations/AdminSearchModal.tsx (production search) | 01 · 24 | 1 | PROPOSED |
| SH-05 | SHELL | NotificationCenter | Site00AdminHeader bell (no handler) | 01 · 24 | 1 | PROPOSED |
| SH-06 | SHELL | GlobalCreate | R1 “Create lead + link” (hard-coded email) | 01 · 07 · 08 | 1 | PROPOSED |
| SH-07 | SHELL | AccountMenu | none | 01 · 02 | 1 | PROPOSED |
| SH-08 | SHELL | BottomNav | none | 01 · 25 | 1 | PROPOSED |
| SH-09 | SHELL | WorkspaceMenuDrawer | none | 01 | 1 | PROPOSED |
| SH-10 | SHELL | IndexRail | none | 02 · 25 | 1 | PROPOSED |
| SH-11 | SHELL | Sidebar | src/site00/admin/components/shell (control-nav.ts — no DF item) | 02 · 25 | 1 | PROPOSED |
| SH-12 | SHELL | InspectorHost | none | 02 · 25 | 1 | PROPOSED |
| SH-13 | SHELL | OverlayHost | window.prompt · none | 24 | 1 | PROPOSED |
| SH-14 | SHELL | FeedbackHost | bare <p> errors | 24 | 1 | PROPOSED |
| SH-15 | SHELL | ResponsiveLayoutController | none | 25 | 1 | PROPOSED |
| SH-16 | SHELL | PageTitle (index rail + display headline) | none | 03–22 | 1 | PROPOSED |
| OV-01 | OVERVIEW | OverviewPage | none (admin /admin/site00 has no DF data) | 03 · 04 | 2 | PROPOSED |
| OV-02 | OVERVIEW | OperationalSignals | none | 03 · 04 | 2 | PROPOSED |
| OV-03 | OVERVIEW | CurrentFocus | none | 03 · 04 | 2 | PROPOSED |
| OV-04 | OVERVIEW | NeedsAttentionList | none | 03 · 04 | 2 | PROPOSED |
| OV-05 | OVERVIEW | ActiveFoundationsList | R1 table (state/payment/created) | 03 · 04 | 2 | PROPOSED |
| OV-06 | OVERVIEW | RecentActivity | R2 “Recent events” (last 10) | 03 · 04 | 2 | PROPOSED |
| OV-07 | OVERVIEW | NextMilestone | none | 04 | 2 | PROPOSED |
| OV-08 | OVERVIEW | OverviewEmptyErrorStates | none | 03 · 24 | 2 | PROPOSED |
| FN-01 | FOUNDATIONS | FoundationsRegistryPage | src/site00/admin/pages/foundation/FoundationAdminListPage.tsx | 05 · 06 | 3 | PROPOSED |
| FN-02 | FOUNDATIONS | RegistrySearch | none | 05 · 06 | 3 | PROPOSED |
| FN-03 | FOUNDATIONS | StatusViews | none | 05 · 06 | 3 | PROPOSED |
| FN-04 | FOUNDATIONS | FilterSortControls | none | 05 · 06 | 3 | PROPOSED |
| FN-05 | FOUNDATIONS | ClientRegistryRow | R1 table row | 05 · 06 · 25 | 3 | PROPOSED |
| FN-06 | FOUNDATIONS | ClientPreviewInspector | none | 02 · 06 | 3 | PROPOSED |
| FN-07 | FOUNDATIONS | CreateClientFlow | R1 create (prospect@example.com) + window.prompt | 07 · 08 | 3 | PROPOSED |
| FN-08 | FOUNDATIONS | DuplicateWarning | none | 07 | 3 | PROPOSED |
| FN-09 | FOUNDATIONS | RegistryStates | R1 bare <p> error; dev preview bootstrap | 05 · 24 | 3 | PROPOSED |
| FN-10 | FOUNDATIONS | RowActionMenu | none | 24 | 3 | PROPOSED |
| CR-01 | CLIENT RECORD | ClientRecordPage | src/site00/admin/pages/foundation/FoundationAdminDetailPage.tsx | 09 · 10 | 4 | PROPOSED |
| CR-02 | CLIENT RECORD | RecordHeader | R2 “Artifact {id8}” + dl | 09 · 10 | 4 | PROPOSED |
| CR-03 | CLIENT RECORD | QuickActions | R2 links (client intake, client home) | 09 · 10 | 4 | PROPOSED |
| CR-04 | CLIENT RECORD | JourneyTracker | none | 09 · 10 · 25 | 4 | PROPOSED |
| CR-05 | CLIENT RECORD | NextActionBlock | none | 09 · 10 | 4 | PROPOSED |
| CR-06 | CLIENT RECORD | IntakeSection | R2 “Submitted intake” dl | 11 | 4 | PROPOSED |
| CR-07 | CLIENT RECORD | RecommendationsSection | none | 11 | 4 | PROPOSED |
| CR-08 | CLIENT RECORD | QuoteSection | R2 “Quote v{n}” subtotal | 12 | 4 | PROPOSED |
| CR-09 | CLIENT RECORD | OperationsSection | src/site00/admin/pages/foundation/FoundationProjectCommandPage.tsx · FoundationWorkbenchPage.tsx (JSON) | 17 · 18 | 4 | PROPOSED |
| CR-10 | CLIENT RECORD | RecordsSection | R2 Mark foundation complete (hard-coded ownership) | 10 · 24 | 4 | PROPOSED |
| CR-11 | CLIENT RECORD | CommunicationsSection | none | 19 · 20 | 4 | PROPOSED |
| CR-12 | CLIENT RECORD | ActivitySection | R2 Recent events | 10 | 4 | PROPOSED |
| CR-13 | CLIENT RECORD | RecordSectionTabs | none | 09 · 10 | 4 | PROPOSED |
| RV-01 | REVIEWS | ReviewsQueuePage | none | 13 · 14 | 5 | PROPOSED |
| RV-02 | REVIEWS | ReviewCategoryTabs | none | 13 · 14 | 5 | PROPOSED |
| RV-03 | REVIEWS | ReviewItem | none | 13 · 14 | 5 | PROPOSED |
| RV-04 | REVIEWS | ReviewDetail | none | 15 · 16 | 5 | PROPOSED |
| RV-05 | REVIEWS | DecisionControls | none | 15 · 16 | 5 | PROPOSED |
| RV-06 | REVIEWS | ReviewHistory | none | 13 · 14 | 5 | PROPOSED |
| RV-07 | REVIEWS | ReviewStates | none | 13 · 24 | 5 | PROPOSED |
| OP-01 | OPERATIONS | OperationsPage | src/site00/admin/pages/foundation/FoundationPipelinePage.tsx (table) | 17 · 18 | 6 | PROPOSED |
| OP-02 | OPERATIONS | ActiveWorkGroups | R3 table rows | 17 | 6 | PROPOSED |
| OP-03 | OPERATIONS | StageRail | none (JSON) | 17 · 18 | 6 | PROPOSED |
| OP-04 | OPERATIONS | TaskRow | none (JSON) | 17 · 18 | 6 | PROPOSED |
| OP-05 | OPERATIONS | TaskInspector | none | 17 · 18 | 6 | PROPOSED |
| OP-06 | OPERATIONS | DependencyView | none | 18 | 6 | PROPOSED |
| OP-07 | OPERATIONS | VerificationCenter | none | 18 | 6 | PROPOSED |
| OP-08 | OPERATIONS | ClientActionRequirements | none | 17 · 18 | 6 | PROPOSED |
| OP-09 | OPERATIONS | BlockerControls | none | 17 | 6 | PROPOSED |
| OP-10 | OPERATIONS | RunbookSetup | none | 18 | 6 | PROPOSED |
| OP-11 | OPERATIONS | StageUpdate | none | 18 | 6 | PROPOSED |
| CO-01 | CORRESPONDENCE | CorrespondencePage | src/site00/admin/pages/foundation/CommunicationsCommandPage.tsx (static text) | 19 · 20 | 7 | PROPOSED |
| CO-02 | CORRESPONDENCE | CommunicationActivity | none | 19 · 20 | 7 | PROPOSED |
| CO-03 | CORRESPONDENCE | ClientThread | none | 19 · 20 | 7 | PROPOSED |
| CO-04 | CORRESPONDENCE | LifecycleMap | R6 text + eventMap.ts | 19 · 20 | 7 | PROPOSED |
| CO-05 | CORRESPONDENCE | EmailPreview | R7 invitation preview | 20 | 7 | PROPOSED |
| CO-06 | CORRESPONDENCE | OutboundApproval (gated send) | R7 approval checkbox + inconsistent lifecycle send | 19 · 20 · 23 | 7 | PROPOSED |
| CO-07 | CORRESPONDENCE | StudioLink | Correspondence Studio (own chrome) | 19 | 7 | PROPOSED |
| CO-08 | CORRESPONDENCE | CommunicationPreferences (read) | none (client sets via public link) | 20 | 7 | PROPOSED |
| SY-01 | SYSTEM | SystemPage | src/site00/admin/pages/foundation/FoundationReadinessPage.tsx | 21 · 22 | 8 | PROPOSED |
| SY-02 | SYSTEM | ReadinessVerdict | R7 overall status line | 21 · 22 | 8 | PROPOSED |
| SY-03 | SYSTEM | ModuleCard + ModuleDetail | R7 sections | 21 · 22 | 8 | PROPOSED |
| SY-04 | SYSTEM | StagingStack | R7 :146-203 | 21 | 8 | PROPOSED |
| SY-05 | SYSTEM | Integrations | R7 (Stripe key mode, Resend) | 21 | 8 | PROPOSED |
| SY-06 | SYSTEM | DatabaseSecurityProbe | R7 :205-222 | 21 | 8 | PROPOSED |
| SY-07 | SYSTEM | ReadinessReport | R7 :224-259 | 22 | 8 | PROPOSED |
| SY-08 | SYSTEM | TechnicalConfiguration | R7 :261-290 (env groups + legacy presence) | 22 | 8 | PROPOSED |
| SY-09 | SYSTEM | BuildMeta | R7 :292-294 | 21 · 22 | 8 | PROPOSED |
| SY-10 | SYSTEM | TestLab · CreateSyntheticClient | R7 :301-322 | 23 | 8 | PROPOSED |
| SY-11 | SYSTEM | TestLab · Journey | R7 :326-362 | 23 | 8 | PROPOSED |
| SY-12 | SYSTEM | TestLab · EmailEvents | R7 :363-462 | 23 | 8 | PROPOSED |
| SY-13 | SYSTEM | TestLab · ContinuityChecks | none (proposed, unverified) | 23 | 8 | PROPOSED · DEPENDS ON PERSISTENCE WORKSTREAM |
| SC-01 | SHARED | ClientPlate (identity) | none | 27 | 1 | PROPOSED |
| SC-02 | SHARED | StatusMark + StatusLabel | none | 27 | 1 | PROPOSED |
| SC-03 | SHARED | PhaseSegments + Journey | none | 25 · 27 | 1 | PROPOSED |
| SC-04 | SHARED | StatusChip | none | 21 · 27 | 1 | PROPOSED |
| SC-05 | SHARED | ActivityRow | R2 events list | 27 | 1 | PROPOSED |
| SC-06 | SHARED | Button | native buttons | 24 · 27 | 1 | PROPOSED |
| SC-07 | SHARED | Field | native inputs | 07 · 27 | 1 | PROPOSED |
| SC-08 | SHARED | ActionMenu | none | 24 | 1 | PROPOSED |
| SC-09 | SHARED | Sheet | none | 24 | 1 | PROPOSED |
| SC-10 | SHARED | Tabs + SegmentedControl | Correspondence Studio tabs | 27 | 1 | PROPOSED |
| SC-11 | SHARED | Dialog + Confirmation | none (unconfirmed actions) | 24 | 1 | PROPOSED |
| SC-12 | SHARED | EmptyState | none | 24 | 1 | PROPOSED |
| SC-13 | SHARED | Skeleton + StaleBanner | “Loading…” text | 24 | 1 | PROPOSED |
| SC-14 | SHARED | Toast | none | 24 | 1 | PROPOSED |
| SC-15 | SHARED | ErrorBanner + TechnicalDetail | role=alert <p> | 24 | 1 | PROPOSED |
| SC-16 | SHARED | ThresholdObject (decorative) | src/site00/foundation-client/objects.tsx | 03–22 | 1 | IMPLEMENTED (DF client) · USE PROPOSED |
| SC-17 | SHARED | KeyValueList | R2 dl | 27 | 1 | PROPOSED |
| SC-18 | SHARED | LinkBlock (copy) | window.prompt | 08 · 24 | 1 | PROPOSED |
| OL-01 | OVERLAY | Create foundation (sheet / dialog) | none | 07 · 08 | 1 | PROPOSED |
| OL-02 | OVERLAY | Link ready | none | 07 · 08 | 3 | PROPOSED |
| OL-03 | OVERLAY | Workspace menu drawer | none | 01 | 1 | PROPOSED |
| OL-04 | OVERLAY | Search / command palette | AdminSearchModal.tsx | 01 · 24 | 1 | PROPOSED |
| OL-05 | OVERLAY | Notification center | none | 01 · 24 | 1 | PROPOSED |
| OL-06 | OVERLAY | Row action menu | none | 24 | 3 | PROPOSED |
| OL-07 | OVERLAY | Filter / sort | none | 05 · 06 | 3 | PROPOSED |
| OL-08 | OVERLAY | Approve quote confirmation | none | 12 · 15 | 4 | PROPOSED |
| OL-09 | OVERLAY | Revise quote / manual adjustment | none | 12 | 4 | PROPOSED |
| OL-10 | OVERLAY | Mark foundation complete | none | 24 | 4 | PROPOSED |
| OL-11 | OVERLAY | Request changes / add note | none | 15 · 16 | 5 | PROPOSED |
| OL-12 | OVERLAY | Task detail | none | 17 | 6 | PROPOSED |
| OL-13 | OVERLAY | Set blocker | none | 17 | 6 | PROPOSED |
| OL-14 | OVERLAY | Compose message | none | 19 | 7 | PROPOSED |
| OL-15 | OVERLAY | Send (gated, approval tick) | none | 19 · 23 | 7 | PROPOSED |
| OL-16 | OVERLAY | System module detail | none | 21 · 22 | 8 | PROPOSED |
| OL-17 | OVERLAY | Reset test data confirmation | none | 23 | 8 | PROPOSED |
| OL-18 | OVERLAY | Account menu | none | 02 | 1 | PROPOSED |
| OL-19 | OVERLAY | Client preview (inspector as sheet) | none | 25 | 3 | PROPOSED |
| OL-20 | OVERLAY | Technical error detail | none | 24 | 1 | PROPOSED |

## Component tree

```
SHELL
  ├── SH-01 FounderWorkspaceShell
  ├── SH-02 FounderIdentity  ← SH-01
  ├── SH-03 EnvironmentIndicator  ← SH-01
  ├── SH-04 GlobalSearch  ← SH-01
  ├── SH-05 NotificationCenter  ← SH-01
  ├── SH-06 GlobalCreate  ← SH-01
  ├── SH-07 AccountMenu  ← SH-02
  ├── SH-08 BottomNav  ← SH-01
  ├── SH-09 WorkspaceMenuDrawer  ← SH-01
  ├── SH-10 IndexRail  ← SH-01
  ├── SH-11 Sidebar  ← SH-01
  ├── SH-12 InspectorHost  ← SH-01
  ├── SH-13 OverlayHost  ← SH-01
  ├── SH-14 FeedbackHost  ← SH-01
  ├── SH-15 ResponsiveLayoutController  ← SH-01
  ├── SH-16 PageTitle (index rail + display headline)  ← SH-01
OVERVIEW
  ├── OV-01 OverviewPage  ← SH-01
  ├── OV-02 OperationalSignals  ← OV-01
  ├── OV-03 CurrentFocus  ← OV-01
  ├── OV-04 NeedsAttentionList  ← OV-01
  ├── OV-05 ActiveFoundationsList  ← OV-01
  ├── OV-06 RecentActivity  ← OV-01
  ├── OV-07 NextMilestone  ← OV-01
  ├── OV-08 OverviewEmptyErrorStates  ← OV-01
FOUNDATIONS
  ├── FN-01 FoundationsRegistryPage  ← SH-01
  ├── FN-02 RegistrySearch  ← FN-01
  ├── FN-03 StatusViews  ← FN-01
  ├── FN-04 FilterSortControls  ← FN-01
  ├── FN-05 ClientRegistryRow  ← FN-01
  ├── FN-06 ClientPreviewInspector  ← SH-12
  ├── FN-07 CreateClientFlow  ← SH-06
  ├── FN-08 DuplicateWarning  ← FN-07
  ├── FN-09 RegistryStates  ← FN-01
  ├── FN-10 RowActionMenu  ← FN-05
CLIENT RECORD
  ├── CR-01 ClientRecordPage  ← SH-01
  ├── CR-02 RecordHeader  ← CR-01
  ├── CR-03 QuickActions  ← CR-01
  ├── CR-04 JourneyTracker  ← CR-01
  ├── CR-05 NextActionBlock  ← CR-01
  ├── CR-06 IntakeSection  ← CR-01
  ├── CR-07 RecommendationsSection  ← CR-01
  ├── CR-08 QuoteSection  ← CR-01
  ├── CR-09 OperationsSection  ← CR-01
  ├── CR-10 RecordsSection  ← CR-01
  ├── CR-11 CommunicationsSection  ← CR-01
  ├── CR-12 ActivitySection  ← CR-01
  ├── CR-13 RecordSectionTabs  ← CR-01
REVIEWS
  ├── RV-01 ReviewsQueuePage  ← SH-01
  ├── RV-02 ReviewCategoryTabs  ← RV-01
  ├── RV-03 ReviewItem  ← RV-01
  ├── RV-04 ReviewDetail  ← RV-01
  ├── RV-05 DecisionControls  ← RV-04
  ├── RV-06 ReviewHistory  ← RV-01
  ├── RV-07 ReviewStates  ← RV-01
OPERATIONS
  ├── OP-01 OperationsPage  ← SH-01
  ├── OP-02 ActiveWorkGroups  ← OP-01
  ├── OP-03 StageRail  ← OP-01
  ├── OP-04 TaskRow  ← OP-03
  ├── OP-05 TaskInspector  ← SH-12
  ├── OP-06 DependencyView  ← OP-01
  ├── OP-07 VerificationCenter  ← OP-01
  ├── OP-08 ClientActionRequirements  ← OP-01
  ├── OP-09 BlockerControls  ← OP-05
  ├── OP-10 RunbookSetup  ← OP-01
  ├── OP-11 StageUpdate  ← OP-03
CORRESPONDENCE
  ├── CO-01 CorrespondencePage  ← SH-01
  ├── CO-02 CommunicationActivity  ← CO-01
  ├── CO-03 ClientThread  ← CO-01
  ├── CO-04 LifecycleMap  ← CO-01
  ├── CO-05 EmailPreview  ← CO-01
  ├── CO-06 OutboundApproval (gated send)  ← CO-05
  ├── CO-07 StudioLink  ← CO-01
  ├── CO-08 CommunicationPreferences (read)  ← CO-03
SYSTEM
  ├── SY-01 SystemPage  ← SH-01
  ├── SY-02 ReadinessVerdict  ← SY-01
  ├── SY-03 ModuleCard + ModuleDetail  ← SY-01
  ├── SY-04 StagingStack  ← SY-01
  ├── SY-05 Integrations  ← SY-01
  ├── SY-06 DatabaseSecurityProbe  ← SY-01
  ├── SY-07 ReadinessReport  ← SY-01
  ├── SY-08 TechnicalConfiguration  ← SY-01
  ├── SY-09 BuildMeta  ← SY-01
  ├── SY-10 TestLab · CreateSyntheticClient  ← SY-01
  ├── SY-11 TestLab · Journey  ← SY-01
  ├── SY-12 TestLab · EmailEvents  ← SY-01
  ├── SY-13 TestLab · ContinuityChecks  ← SY-01
SHARED
  ├── SC-01 ClientPlate (identity)
  ├── SC-02 StatusMark + StatusLabel
  ├── SC-03 PhaseSegments + Journey
  ├── SC-04 StatusChip
  ├── SC-05 ActivityRow
  ├── SC-06 Button
  ├── SC-07 Field
  ├── SC-08 ActionMenu
  ├── SC-09 Sheet  ← SH-13
  ├── SC-10 Tabs + SegmentedControl
  ├── SC-11 Dialog + Confirmation  ← SH-13
  ├── SC-12 EmptyState
  ├── SC-13 Skeleton + StaleBanner
  ├── SC-14 Toast  ← SH-14
  ├── SC-15 ErrorBanner + TechnicalDetail
  ├── SC-16 ThresholdObject (decorative)
  ├── SC-17 KeyValueList
  ├── SC-18 LinkBlock (copy)
OVERLAY
  ├── OL-01 Create foundation (sheet / dialog)  ← SH-06
  ├── OL-02 Link ready  ← FN-07
  ├── OL-03 Workspace menu drawer  ← SH-09
  ├── OL-04 Search / command palette  ← SH-04
  ├── OL-05 Notification center  ← SH-05
  ├── OL-06 Row action menu  ← FN-10
  ├── OL-07 Filter / sort  ← FN-04
  ├── OL-08 Approve quote confirmation  ← CR-08
  ├── OL-09 Revise quote / manual adjustment  ← CR-08
  ├── OL-10 Mark foundation complete  ← CR-10
  ├── OL-11 Request changes / add note  ← RV-05
  ├── OL-12 Task detail  ← OP-05
  ├── OL-13 Set blocker  ← OP-09
  ├── OL-14 Compose message  ← CO-03
  ├── OL-15 Send (gated, approval tick)  ← CO-06
  ├── OL-16 System module detail  ← SY-03
  ├── OL-17 Reset test data confirmation  ← SY-11
  ├── OL-18 Account menu  ← SH-07
  ├── OL-19 Client preview (inspector as sheet)  ← FN-06
  ├── OL-20 Technical error detail  ← SC-15
```

## Registry

### SHELL

#### SH-01 · FounderWorkspaceShell

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-01 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | FounderWorkspaceShell |
| EXISTING SOURCE PATH | src/site00/admin/components/shell/Site00AdminShell.tsx (R7 only) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/FounderWorkspaceShell.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | SH-02…SH-14 |
| PURPOSE | One host for all six destinations, overlays and feedback |
| VISUAL AUTHORITY | Boards 01 · 02 · 25 |
| INTERACTION STATES | default · hover · focus-visible · active/current · badge |
| MOBILE VARIANT | Header + stage + bottom nav |
| TABLET VARIANT | Rail + stage (+ dock ≥1100) |
| DESKTOP VARIANT | Sidebar 232 + stage + inspector 392 |
| DATA SOURCE | Admin session |
| API DEPENDENCY | resolveAdminAuth (AdminGuard) |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Shell error boundary keeps “[ ADMIN · INITIALIZATION FAILED ]” recovery (Reload / Return to sign-in) |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-02 · FounderIdentity

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-02 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | FounderIdentity |
| EXISTING SOURCE PATH | src/site00/admin/components/shell/Site00AdminShell.tsx footer (static “OWNER / ADMIN”) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/FounderIdentity.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | SH-07 |
| PURPOSE | Shows who is signed in; opens account menu |
| VISUAL AUTHORITY | Boards 01 · 02 |
| INTERACTION STATES | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| MOBILE VARIANT | In MENU drawer |
| TABLET VARIANT | Rail foot plate |
| DESKTOP VARIANT | Sidebar foot |
| DATA SOURCE | Supabase auth session (email = data) |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-03 · EnvironmentIndicator

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-03 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | EnvironmentIndicator |
| EXISTING SOURCE PATH | none (static “ONLINE”) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/EnvironmentIndicator.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | — |
| PURPOSE | STAGING tag from the real deployment identity |
| VISUAL AUTHORITY | Boards 01 · 02 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Header tag |
| TABLET VARIANT | Rail tooltip |
| DESKTOP VARIANT | Brand tag |
| DATA SOURCE | readiness-report deployment identity |
| API DEPENDENCY | /api/admin/site00-foundation readiness-report |
| ACCESSIBILITY CONTRACT | text, not colour, carries meaning; icon decorative; contrast ≥ 4.5:1 |
| ERROR HANDLING | Unknown → “ENV UNKNOWN” (muted), never assumes production |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-04 · GlobalSearch

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-04 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | GlobalSearch |
| EXISTING SOURCE PATH | src/site00/admin/components/operations/AdminSearchModal.tsx (production search) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/WorkspaceSearch.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | OL-04 |
| PURPOSE | Find client / review / destination |
| VISUAL AUTHORITY | Boards 01 · 24 |
| INTERACTION STATES | idle · focus · typing · results · no results · min-length hint · error |
| MOBILE VARIANT | Full-screen search |
| TABLET VARIANT | Palette 620 |
| DESKTOP VARIANT | Topbar field + ⌘K palette |
| DATA SOURCE | list (+ detail for names, G-01); review derivation |
| API DEPENDENCY | /api/admin/site00-foundation list |
| ACCESSIBILITY CONTRACT | combobox + listbox; ↑↓ ↵ ESC; results announced |
| ERROR HANDLING | Error row in results + retry; min-length hint kept from AdminSearchModal |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-05 · NotificationCenter

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-05 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | NotificationCenter |
| EXISTING SOURCE PATH | Site00AdminHeader bell (no handler) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/NotificationCenter.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | OL-05 |
| PURPOSE | Founder decisions first, then recent movement |
| VISUAL AUTHORITY | Boards 01 · 24 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Popover |
| DESKTOP VARIANT | Popover |
| DATA SOURCE | Derived: §4 review items + events (G-03, G-10) |
| API DEPENDENCY | /api/admin/site00-foundation list/detail |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-06 · GlobalCreate

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-06 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | GlobalCreate |
| EXISTING SOURCE PATH | R1 “Create lead + link” (hard-coded email) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/CreateEntry.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | OL-01 |
| PURPOSE | Single entry for new foundation / synthetic client |
| VISUAL AUTHORITY | Boards 01 · 07 · 08 |
| INTERACTION STATES | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| MOBILE VARIANT | Centre red block → sheet |
| TABLET VARIANT | Rail + → dialog |
| DESKTOP VARIANT | NEW FOUNDATION → dialog |
| DATA SOURCE | — |
| API DEPENDENCY | create-artifact · create-test-client |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-07 · AccountMenu

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-07 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | AccountMenu |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/AccountMenu.tsx` |
| PARENT COMPONENT | SH-02 |
| CHILD COMPONENTS | — |
| PURPOSE | Identity, environment, tools, sign out |
| VISUAL AUTHORITY | Boards 01 · 02 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Inside MENU drawer |
| TABLET VARIANT | Menu |
| DESKTOP VARIANT | Menu |
| DATA SOURCE | Session |
| API DEPENDENCY | Supabase signOut |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Sign-out failure → error toast; session kept |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-08 · BottomNav

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-08 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | BottomNav |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/BottomNav.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | — |
| PURPOSE | HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM |
| VISUAL AUTHORITY | Boards 01 · 25 |
| INTERACTION STATES | default · hover · focus-visible · active/current · badge |
| MOBILE VARIANT | Visible |
| TABLET VARIANT | Hidden |
| DESKTOP VARIANT | Hidden |
| DATA SOURCE | Review count |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | nav landmark; aria-current="page"; 44×44 targets; badge text read as “3 founder decisions” |
| ERROR HANDLING | Count unknown → no badge |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-09 · WorkspaceMenuDrawer

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-09 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | WorkspaceMenuDrawer |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/WorkspaceDrawer.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | SH-07 |
| PURPOSE | All six destinations incl. OPERATIONS + CORRESPONDENCE, tools, account |
| VISUAL AUTHORITY | Boards 01 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Right drawer 86% |
| TABLET VARIANT | — |
| DESKTOP VARIANT | — |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-10 · IndexRail

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-10 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | IndexRail |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/IndexRail.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Tablet navigation, 72 px, index-labelled |
| VISUAL AUTHORITY | Boards 02 · 25 |
| INTERACTION STATES | default · hover · focus-visible · active/current · badge |
| MOBILE VARIANT | — |
| TABLET VARIANT | Visible |
| DESKTOP VARIANT | — |
| DATA SOURCE | Review count |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | nav landmark; aria-current="page"; 44×44 targets; badge text read as “3 founder decisions” |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-11 · Sidebar

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-11 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | Sidebar |
| EXISTING SOURCE PATH | src/site00/admin/components/shell (control-nav.ts — no DF item) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/Sidebar.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | SH-02 |
| PURPOSE | Desktop navigation + NEW FOUNDATION + tools |
| VISUAL AUTHORITY | Boards 02 · 25 |
| INTERACTION STATES | default · hover · focus-visible · active/current · badge |
| MOBILE VARIANT | — |
| TABLET VARIANT | — |
| DESKTOP VARIANT | Visible 232 |
| DATA SOURCE | Review count |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | nav landmark; aria-current="page"; 44×44 targets; badge text read as “3 founder decisions” |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-12 · InspectorHost

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-12 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | InspectorHost |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/InspectorHost.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | FN-05 · RV-04 · OP-05 · SY-03 |
| PURPOSE | Docks the selected context; becomes a sheet below the threshold |
| VISUAL AUTHORITY | Boards 02 · 25 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / push |
| TABLET VARIANT | Right sheet or dock (≥1100) |
| DESKTOP VARIANT | Dock 392 |
| DATA SOURCE | Selection |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Inner component handles errors |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-13 · OverlayHost

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-13 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | OverlayHost |
| EXISTING SOURCE PATH | window.prompt · none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/OverlayHost.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | OL-* |
| PURPOSE | Single portal for sheets, dialogs, menus |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheets |
| TABLET VARIANT | Dialogs |
| DESKTOP VARIANT | Dialogs |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-14 · FeedbackHost

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-14 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | FeedbackHost |
| EXISTING SOURCE PATH | bare <p> errors |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/FeedbackHost.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | SC-14 |
| PURPOSE | Toasts + page banners |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | success · error (persists) · dismissed |
| MOBILE VARIANT | Above nav |
| TABLET VARIANT | Bottom-left of stage |
| DESKTOP VARIANT | Bottom-left of stage |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=status (success) / role=alert (error); not the only feedback for errors |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-15 · ResponsiveLayoutController

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-15 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | ResponsiveLayoutController |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/useWorkspaceLayout.ts` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Chooses phone / rail / sidebar and dock vs sheet by width |
| VISUAL AUTHORITY | Boards 25 |
| INTERACTION STATES | phone <768 · rail 768–1279 · sidebar ≥1280 · dock if width−nav ≥1100 |
| MOBILE VARIANT | <768 |
| TABLET VARIANT | 768–1279 |
| DESKTOP VARIANT | ≥1280 |
| DATA SOURCE | matchMedia |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | aria-hidden; never carries data |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SH-16 · PageTitle (index rail + display headline)

| Column | Value |
| --- | --- |
| COMPONENT ID | SH-16 |
| PAGE FAMILY | SHELL |
| COMPONENT NAME | PageTitle (index rail + display headline) |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shell/PageTitle.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | SC-16 |
| PURPOSE | Index · headline · red period · optional threshold object |
| VISUAL AUTHORITY | Boards 03–22 |
| INTERACTION STATES | default |
| MOBILE VARIANT | H1 50 |
| TABLET VARIANT | H1 50–68 |
| DESKTOP VARIANT | H1 68 |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### OVERVIEW

#### OV-01 · OverviewPage

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-01 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | OverviewPage |
| EXISTING SOURCE PATH | none (admin /admin/site00 has no DF data) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/OverviewPage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | OV-02…OV-08 |
| PURPOSE | What needs the founder now |
| VISUAL AUTHORITY | Boards 03 · 04 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Single column |
| TABLET VARIANT | Single column |
| DESKTOP VARIANT | Focus + rail + active work |
| DATA SOURCE | list · §4 derivation |
| API DEPENDENCY | /api/admin/site00-foundation list |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-02 · OperationalSignals

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-02 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | OperationalSignals |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/Signals.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | — |
| PURPOSE | ACTIVE · NEEDS REVIEW · AWAITING CLIENT · COMPLETE; each filters Foundations |
| VISUAL AUTHORITY | Boards 03 · 04 |
| INTERACTION STATES | default · selected · attention (red when >0) · loading · error “—” |
| MOBILE VARIANT | 4-up compact |
| TABLET VARIANT | 4-up |
| DESKTOP VARIANT | Rail beside title |
| DATA SOURCE | DATA_CONTRACT_MAPPING §3 |
| API DEPENDENCY | /api/admin/site00-foundation list |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-03 · CurrentFocus

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-03 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | CurrentFocus |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/CurrentFocus.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | SC-01 |
| PURPOSE | The single oldest founder decision with its action |
| VISUAL AUTHORITY | Boards 03 · 04 |
| INTERACTION STATES | decision pending · none pending (calm state) · loading · error |
| MOBILE VARIANT | Card |
| TABLET VARIANT | Card |
| DESKTOP VARIANT | Wide card |
| DATA SOURCE | §4 review queue |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-04 · NeedsAttentionList

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-04 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | NeedsAttentionList |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/NeedsAttention.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | SC-01 |
| PURPOSE | Remaining decisions + blocked items |
| VISUAL AUTHORITY | Boards 03 · 04 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | List |
| DATA SOURCE | §4 + blockers |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-05 · ActiveFoundationsList

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-05 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | ActiveFoundationsList |
| EXISTING SOURCE PATH | R1 table (state/payment/created) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/ActiveWork.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | FN-03 |
| PURPOSE | Clients in motion, whose move, next action |
| VISUAL AUTHORITY | Boards 03 · 04 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Card rows |
| TABLET VARIANT | Dense rows |
| DESKTOP VARIANT | Table |
| DATA SOURCE | list (+ G-01) |
| API DEPENDENCY | /api/admin/site00-foundation list |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-06 · RecentActivity

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-06 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | RecentActivity |
| EXISTING SOURCE PATH | R2 “Recent events” (last 10) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/RecentMovement.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | SC-05 |
| PURPOSE | Movement across clients |
| VISUAL AUTHORITY | Boards 03 · 04 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Collapsed |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Side column |
| DATA SOURCE | detail.events (memory-only, G-03) |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-07 · NextMilestone

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-07 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | NextMilestone |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/NextMilestone.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Next stage completion across active projects |
| VISUAL AUTHORITY | Boards 04 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Hidden (in focus) |
| TABLET VARIANT | Panel |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | pipeline.next_action (G-04) |
| API DEPENDENCY | /api/admin/site00-foundation pipeline |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OV-08 · OverviewEmptyErrorStates

| Column | Value |
| --- | --- |
| COMPONENT ID | OV-08 |
| PAGE FAMILY | OVERVIEW |
| COMPONENT NAME | OverviewEmptyErrorStates |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overview/OverviewStates.tsx` |
| PARENT COMPONENT | OV-01 |
| CHILD COMPONENTS | SC-12 · SC-13 |
| PURPOSE | First use, all clear, load failure |
| VISUAL AUTHORITY | Boards 03 · 24 |
| INTERACTION STATES | empty (first use) · all clear · error + retry · stale |
| MOBILE VARIANT | Inline |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 2 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### FOUNDATIONS

#### FN-01 · FoundationsRegistryPage

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-01 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | FoundationsRegistryPage |
| EXISTING SOURCE PATH | `src/site00/admin/pages/foundation/FoundationAdminListPage.tsx` |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/FoundationsPage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | FN-02…FN-09 |
| PURPOSE | All client foundations |
| VISUAL AUTHORITY | Boards 05 · 06 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Card list |
| TABLET VARIANT | Dense rows |
| DESKTOP VARIANT | Table + inspector |
| DATA SOURCE | list |
| API DEPENDENCY | /api/admin/site00-foundation list (src/site00/admin/services/foundationAdminApi.ts) |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-02 · RegistrySearch

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-02 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | RegistrySearch |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/RegistrySearch.tsx` |
| PARENT COMPONENT | FN-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Filter by business, email, domain |
| VISUAL AUTHORITY | Boards 05 · 06 |
| INTERACTION STATES | idle · focus · typing · results · no results · min-length hint · error |
| MOBILE VARIANT | Field |
| TABLET VARIANT | Field |
| DESKTOP VARIANT | Field |
| DATA SOURCE | list (client-side filter) |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | combobox + listbox; ↑↓ ↵ ESC; results announced |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-03 · StatusViews

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-03 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | StatusViews |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/StatusViews.tsx` |
| PARENT COMPONENT | FN-01 |
| CHILD COMPONENTS | SC-10 |
| PURPOSE | ALL · INVITED · INTAKE · REVIEW · QUOTE · ACTIVE · COMPLETE |
| VISUAL AUTHORITY | Boards 05 · 06 |
| INTERACTION STATES | default · hover · focus-visible · selected · with count · overflow scroll |
| MOBILE VARIANT | Scrolling tabs |
| TABLET VARIANT | Tabs |
| DESKTOP VARIANT | Tabs |
| DATA SOURCE | Display phases §2 |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | tablist/tab/tabpanel; arrow keys move; counts included in tab name |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-04 · FilterSortControls

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-04 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | FilterSortControls |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/FilterSheet.tsx` |
| PARENT COMPONENT | FN-01 |
| CHILD COMPONENTS | OL-07 |
| PURPOSE | Whose move, phase, test clients, sort |
| VISUAL AUTHORITY | Boards 05 · 06 |
| INTERACTION STATES | closed · open · applied (count) · reset |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Popover |
| DESKTOP VARIANT | Popover |
| DATA SOURCE | list |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-05 · ClientRegistryRow

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-05 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | ClientRegistryRow |
| EXISTING SOURCE PATH | R1 table row |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/ClientRow.tsx` |
| PARENT COMPONENT | FN-01 |
| CHILD COMPONENTS | SC-01 · SC-02 · SC-03 |
| PURPOSE | Identity, status, phase, whose move, last activity |
| VISUAL AUTHORITY | Boards 05 · 06 · 25 |
| INTERACTION STATES | default · hover · focus-visible · selected · loading (skeleton) · stale |
| MOBILE VARIANT | Card row |
| TABLET VARIANT | Dense row |
| DESKTOP VARIANT | Table row |
| DATA SOURCE | list (+ G-01 name/industry) |
| API DEPENDENCY | /api/admin/site00-foundation list |
| ACCESSIBILITY CONTRACT | row is a link/button with an accessible name = client + status + whose move; chevron decorative |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-06 · ClientPreviewInspector

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-06 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | ClientPreviewInspector |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/ClientInspector.tsx` |
| PARENT COMPONENT | SH-12 |
| CHILD COMPONENTS | SC-03 · SC-05 |
| PURPOSE | Selected client summary without leaving the list |
| VISUAL AUTHORITY | Boards 02 · 06 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Push to record |
| TABLET VARIANT | Sheet / dock |
| DESKTOP VARIANT | Dock 392 |
| DATA SOURCE | detail |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-07 · CreateClientFlow

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-07 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | CreateClientFlow |
| EXISTING SOURCE PATH | R1 create (prospect@example.com) + window.prompt |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/CreateFoundation.tsx` |
| PARENT COMPONENT | SH-06 |
| CHILD COMPONENTS | OL-01 · OL-02 |
| PURPOSE | Create artifact + personal link |
| VISUAL AUTHORITY | Boards 07 · 08 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Full-screen form |
| TABLET VARIANT | Dialog |
| DESKTOP VARIANT | Dialog |
| DATA SOURCE | create-artifact response (personalized_url) |
| API DEPENDENCY | /api/admin/site00-foundation create-artifact |
| ACCESSIBILITY CONTRACT | label for/id; aria-invalid + aria-describedby to error; inputmode/autocomplete per type; case-sensitive values never CSS-uppercased |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-08 · DuplicateWarning

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-08 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | DuplicateWarning |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/DuplicateNotice.tsx` |
| PARENT COMPONENT | FN-07 |
| CHILD COMPONENTS | — |
| PURPOSE | Client-side match on email in loaded list (no API dedupe, G-11) |
| VISUAL AUTHORITY | Boards 07 |
| INTERACTION STATES | none · possible match |
| MOBILE VARIANT | Banner |
| TABLET VARIANT | Banner |
| DESKTOP VARIANT | Banner |
| DATA SOURCE | list (loaded rows) |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-09 · RegistryStates

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-09 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | RegistryStates |
| EXISTING SOURCE PATH | R1 bare <p> error; dev preview bootstrap |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/RegistryStates.tsx` |
| PARENT COMPONENT | FN-01 |
| CHILD COMPONENTS | SC-12 · SC-13 |
| PURPOSE | Loading, empty, filtered-empty, error, stale |
| VISUAL AUTHORITY | Boards 05 · 24 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Inline |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | — |
| API DEPENDENCY | /api/dev/site00-digital-foundation-preview-bootstrap (dev only, kept) |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### FN-10 · RowActionMenu

| Column | Value |
| --- | --- |
| COMPONENT ID | FN-10 |
| PAGE FAMILY | FOUNDATIONS |
| COMPONENT NAME | RowActionMenu |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/foundations/RowMenu.tsx` |
| PARENT COMPONENT | FN-05 |
| CHILD COMPONENTS | OL-06 |
| PURPOSE | Open, copy link, client view, message; resend/archive shown unavailable |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Action sheet |
| TABLET VARIANT | Menu |
| DESKTOP VARIANT | Menu |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Unavailable by policy → disabled-by-policy control naming the gate; never a silent no-op |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### CLIENT RECORD

#### CR-01 · ClientRecordPage

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-01 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | ClientRecordPage |
| EXISTING SOURCE PATH | `src/site00/admin/pages/foundation/FoundationAdminDetailPage.tsx` |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/ClientRecordPage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | CR-02…CR-13 |
| PURPOSE | Complete contextual workspace for one client |
| VISUAL AUTHORITY | Boards 09 · 10 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Pushed page, 5 tabs |
| TABLET VARIANT | 8 tabs |
| DESKTOP VARIANT | 8 tabs + side column |
| DATA SOURCE | detail |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-02 · RecordHeader

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-02 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | RecordHeader |
| EXISTING SOURCE PATH | R2 “Artifact {id8}” + dl |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/RecordHeader.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | SC-01 · SC-02 |
| PURPOSE | Plate, name, category, status, step n of 8, email (data) |
| VISUAL AUTHORITY | Boards 09 · 10 |
| INTERACTION STATES | default · test client (hatched) · blocked · complete |
| MOBILE VARIANT | Band + header |
| TABLET VARIANT | Header |
| DESKTOP VARIANT | Header |
| DATA SOURCE | detail + lead |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-03 · QuickActions

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-03 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | QuickActions |
| EXISTING SOURCE PATH | R2 links (client intake, client home) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/QuickActions.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | — |
| PURPOSE | COPY LINK · CLIENT VIEW · MESSAGE · RESEND (N/A G-05) · MORE |
| VISUAL AUTHORITY | Boards 09 · 10 |
| INTERACTION STATES | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| MOBILE VARIANT | 5-up grid |
| TABLET VARIANT | Inline buttons |
| DESKTOP VARIANT | Header buttons |
| DATA SOURCE | public_token |
| API DEPENDENCY | — (copy client-side) · send-message |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Unavailable by policy → disabled-by-policy control naming the gate; never a silent no-op |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-04 · JourneyTracker

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-04 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | JourneyTracker |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/Journey.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | SC-03 |
| PURPOSE | Eight display phases with dates |
| VISUAL AUTHORITY | Boards 09 · 10 · 25 |
| INTERACTION STATES | founder · client · work · blocked · done · idle · test |
| MOBILE VARIANT | Segments + step |
| TABLET VARIANT | Short labels |
| DESKTOP VARIANT | Full + dates |
| DATA SOURCE | §2 mapping |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | mark is aria-hidden; adjacent text carries the meaning |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-05 · NextActionBlock

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-05 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | NextActionBlock |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/NextAction.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Whose move + the one next action |
| VISUAL AUTHORITY | Boards 09 · 10 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Card |
| TABLET VARIANT | Card |
| DESKTOP VARIANT | Card |
| DATA SOURCE | §2 whose move |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-06 · IntakeSection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-06 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | IntakeSection |
| EXISTING SOURCE PATH | R2 “Submitted intake” dl |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/IntakeSection.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Submitted intake grouped by step; progress by phase, no % |
| VISUAL AUTHORITY | Boards 11 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Collapsible groups |
| TABLET VARIANT | Groups |
| DESKTOP VARIANT | Two-column |
| DATA SOURCE | detail.intake |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-07 · RecommendationsSection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-07 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | RecommendationsSection |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/Recommendations.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Engine output, manual-review reasons |
| VISUAL AUTHORITY | Boards 11 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | List + reasons |
| DATA SOURCE | detail.recommendation |
| API DEPENDENCY | /api/admin/site00-foundation detail · update-quote |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-08 · QuoteSection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-08 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | QuoteSection |
| EXISTING SOURCE PATH | R2 “Quote v{n}” subtotal |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/QuoteSection.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | OL-08 · OL-09 |
| PURPOSE | Lines, totals, expiry, versions, approve / revise |
| VISUAL AUTHORITY | Boards 12 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Fixed decision bar |
| TABLET VARIANT | Panel + decision |
| DESKTOP VARIANT | Quote + decision column |
| DATA SOURCE | detail.quote · commercialConfig · addonCatalog |
| API DEPENDENCY | update-quote · quote-commercial-ready · manual-adjustment (G-04) |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-09 · OperationsSection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-09 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | OperationsSection |
| EXISTING SOURCE PATH | src/site00/admin/pages/foundation/FoundationProjectCommandPage.tsx · FoundationWorkbenchPage.tsx (JSON) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/OperationsSection.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | OP-03 · OP-04 |
| PURPOSE | Stages and tasks for this client |
| VISUAL AUTHORITY | Boards 17 · 18 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Stage + tasks |
| TABLET VARIANT | Stage + tasks |
| DESKTOP VARIANT | Runbook view |
| DATA SOURCE | project-command · workbench |
| API DEPENDENCY | /api/admin/site00-foundation project-command · workbench |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-10 · RecordsSection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-10 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | RecordsSection |
| EXISTING SOURCE PATH | R2 Mark foundation complete (hard-coded ownership) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/RecordsSection.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | OL-10 |
| PURPOSE | Ownership records, completion gate, mark complete |
| VISUAL AUTHORITY | Boards 10 · 24 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | List + confirm sheet |
| TABLET VARIANT | Panel |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | completion-gate |
| API DEPENDENCY | completion-gate · mark-complete (G-04) |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-11 · CommunicationsSection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-11 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | CommunicationsSection |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/ClientMessages.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | CO-03 |
| PURPOSE | Per-client messages and email intents |
| VISUAL AUTHORITY | Boards 19 · 20 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Thread |
| TABLET VARIANT | Thread |
| DESKTOP VARIANT | Thread |
| DATA SOURCE | messages · email-timeline |
| API DEPENDENCY | messages · send-message |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-12 · ActivitySection

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-12 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | ActivitySection |
| EXISTING SOURCE PATH | R2 Recent events |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/Activity.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | SC-05 |
| PURPOSE | Full event history |
| VISUAL AUTHORITY | Boards 10 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | List |
| DATA SOURCE | detail.events (G-03) |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CR-13 · RecordSectionTabs

| Column | Value |
| --- | --- |
| COMPONENT ID | CR-13 |
| PAGE FAMILY | CLIENT RECORD |
| COMPONENT NAME | RecordSectionTabs |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/record/SectionTabs.tsx` |
| PARENT COMPONENT | CR-01 |
| CHILD COMPONENTS | SC-10 |
| PURPOSE | OVERVIEW · INTAKE · RECOMMENDATIONS · QUOTE · OPERATIONS · RECORDS · COMMUNICATIONS · ACTIVITY |
| VISUAL AUTHORITY | Boards 09 · 10 |
| INTERACTION STATES | default · hover · focus-visible · selected · with count · overflow scroll |
| MOBILE VARIANT | 5 + MORE |
| TABLET VARIANT | 8 |
| DESKTOP VARIANT | 8 |
| DATA SOURCE | ?section= |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | tablist/tab/tabpanel; arrow keys move; counts included in tab name |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### REVIEWS

#### RV-01 · ReviewsQueuePage

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-01 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | ReviewsQueuePage |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/ReviewsPage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | RV-02…RV-07 |
| PURPOSE | All founder decisions in one queue |
| VISUAL AUTHORITY | Boards 13 · 14 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Card list |
| TABLET VARIANT | List (+ dock) |
| DESKTOP VARIANT | List + inspector |
| DATA SOURCE | §4 derivation |
| API DEPENDENCY | /api/admin/site00-foundation list · detail |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### RV-02 · ReviewCategoryTabs

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-02 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | ReviewCategoryTabs |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/ReviewTabs.tsx` |
| PARENT COMPONENT | RV-01 |
| CHILD COMPONENTS | SC-10 |
| PURPOSE | ALL · INTAKES · RECOMMEND · QUOTES · REQUESTS · EXCEPTIONS · HISTORY |
| VISUAL AUTHORITY | Boards 13 · 14 |
| INTERACTION STATES | default · hover · focus-visible · selected · with count · overflow scroll |
| MOBILE VARIANT | Scrolling |
| TABLET VARIANT | Tabs |
| DESKTOP VARIANT | Tabs |
| DATA SOURCE | §4 |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | tablist/tab/tabpanel; arrow keys move; counts included in tab name |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### RV-03 · ReviewItem

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-03 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | ReviewItem |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/ReviewItem.tsx` |
| PARENT COMPONENT | RV-01 |
| CHILD COMPONENTS | SC-01 |
| PURPOSE | Type, client, why it needs you, age, primary action |
| VISUAL AUTHORITY | Boards 13 · 14 |
| INTERACTION STATES | default · hover · focus-visible · selected · loading (skeleton) · stale |
| MOBILE VARIANT | Card + ink action |
| TABLET VARIANT | Row |
| DESKTOP VARIANT | Row |
| DATA SOURCE | §4 item |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | row is a link/button with an accessible name = client + status + whose move; chevron decorative |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### RV-04 · ReviewDetail

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-04 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | ReviewDetail |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/ReviewDetail.tsx` |
| PARENT COMPONENT | RV-01 |
| CHILD COMPONENTS | RV-05 · CR-04 |
| PURPOSE | Understand → compare → decide → confirm |
| VISUAL AUTHORITY | Boards 15 · 16 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Pushed page + fixed bar |
| TABLET VARIANT | Dock / page |
| DESKTOP VARIANT | Inspector / page |
| DATA SOURCE | detail + §4 item |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### RV-05 · DecisionControls

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-05 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | DecisionControls |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/DecisionBar.tsx` |
| PARENT COMPONENT | RV-04 |
| CHILD COMPONENTS | OL-08 · OL-11 |
| PURPOSE | APPROVE / REQUEST CHANGES / ADD NOTE; only API-backed outcomes |
| VISUAL AUTHORITY | Boards 15 · 16 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Fixed bar |
| TABLET VARIANT | Foot |
| DESKTOP VARIANT | Inspector foot |
| DATA SOURCE | — |
| API DEPENDENCY | quote-commercial-ready · approval-resolve (G-04) · update-quote |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### RV-06 · ReviewHistory

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-06 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | ReviewHistory |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/ReviewHistory.tsx` |
| PARENT COMPONENT | RV-01 |
| CHILD COMPONENTS | SC-05 |
| PURPOSE | Resolved approvals, ready quotes, verified tasks |
| VISUAL AUTHORITY | Boards 13 · 14 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Tab |
| TABLET VARIANT | Tab |
| DESKTOP VARIANT | Tab |
| DATA SOURCE | events (G-03) |
| API DEPENDENCY | /api/admin/site00-foundation detail |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### RV-07 · ReviewStates

| Column | Value |
| --- | --- |
| COMPONENT ID | RV-07 |
| PAGE FAMILY | REVIEWS |
| COMPONENT NAME | ReviewStates |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/reviews/ReviewStates.tsx` |
| PARENT COMPONENT | RV-01 |
| CHILD COMPONENTS | SC-12 |
| PURPOSE | All clear, loading, error |
| VISUAL AUTHORITY | Boards 13 · 24 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Inline |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### OPERATIONS

#### OP-01 · OperationsPage

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-01 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | OperationsPage |
| EXISTING SOURCE PATH | src/site00/admin/pages/foundation/FoundationPipelinePage.tsx (table) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/OperationsPage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | OP-02…OP-09 |
| PURPOSE | Active fulfilment across clients |
| VISUAL AUTHORITY | Boards 17 · 18 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Grouped list |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Runbook workspace |
| DATA SOURCE | pipeline |
| API DEPENDENCY | /api/admin/site00-foundation pipeline |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-02 · ActiveWorkGroups

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-02 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | ActiveWorkGroups |
| EXISTING SOURCE PATH | R3 table rows |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/ActiveWork.tsx` |
| PARENT COMPONENT | OP-01 |
| CHILD COMPONENTS | FN-05 |
| PURPOSE | Projects by state with the next startable task |
| VISUAL AUTHORITY | Boards 17 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Groups |
| TABLET VARIANT | Groups |
| DESKTOP VARIANT | Table |
| DATA SOURCE | pipeline |
| API DEPENDENCY | /api/admin/site00-foundation pipeline |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-03 · StageRail

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-03 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | StageRail |
| EXISTING SOURCE PATH | none (JSON) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/StageRail.tsx` |
| PARENT COMPONENT | OP-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Seven stages 01_DETAILS_RECEIVED … 07_FOUNDATION_COMPLETE |
| VISUAL AUTHORITY | Boards 17 · 18 |
| INTERACTION STATES | done · current · blocked · future |
| MOBILE VARIANT | Scroll strip |
| TABLET VARIANT | Strip |
| DESKTOP VARIANT | Strip |
| DATA SOURCE | projectStages.ts |
| API DEPENDENCY | /api/admin/site00-foundation project-command |
| ACCESSIBILITY CONTRACT | tablist/tab/tabpanel; arrow keys move; counts included in tab name |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-04 · TaskRow

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-04 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | TaskRow |
| EXISTING SOURCE PATH | none (JSON) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/TaskRow.tsx` |
| PARENT COMPONENT | OP-03 |
| CHILD COMPONENTS | — |
| PURPOSE | Task, execution mode, status, dependency |
| VISUAL AUTHORITY | Boards 17 · 18 |
| INTERACTION STATES | NOT_READY · READY · IN_PROGRESS · WAITING_CLIENT · WAITING_PROVIDER · BLOCKED · READY_TO_VERIFY · VERIFIED · FAILED · COMPLETE |
| MOBILE VARIANT | Row |
| TABLET VARIANT | Row |
| DESKTOP VARIANT | Row |
| DATA SOURCE | workbench |
| API DEPENDENCY | /api/admin/site00-foundation workbench |
| ACCESSIBILITY CONTRACT | row is a link/button with an accessible name = client + status + whose move; chevron decorative |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-05 · TaskInspector

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-05 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | TaskInspector |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/TaskInspector.tsx` |
| PARENT COMPONENT | SH-12 |
| CHILD COMPONENTS | OL-12 · OL-13 |
| PURPOSE | Instructions, metadata, actions |
| VISUAL AUTHORITY | Boards 17 · 18 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Sheet / dock |
| DESKTOP VARIANT | Dock |
| DATA SOURCE | workbench task |
| API DEPENDENCY | start-task · complete-task · verify-task · escalate-task · set-blocker (G-04) |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-06 · DependencyView

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-06 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | DependencyView |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/Dependencies.tsx` |
| PARENT COMPONENT | OP-01 |
| CHILD COMPONENTS | — |
| PURPOSE | dns_verify ← mx/spf/dkim/dmarc; final ← dns/send/receive/ownership |
| VISUAL AUTHORITY | Boards 18 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | List |
| TABLET VARIANT | Diagram |
| DESKTOP VARIANT | Diagram |
| DATA SOURCE | runbookGenerator depMap |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-07 · VerificationCenter

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-07 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | VerificationCenter |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/Verification.tsx` |
| PARENT COMPONENT | OP-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Verification checks and completion-gate reasons |
| VISUAL AUTHORITY | Boards 18 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Section |
| TABLET VARIANT | Section |
| DESKTOP VARIANT | Side column |
| DATA SOURCE | completion-gate |
| API DEPENDENCY | /api/admin/site00-foundation completion-gate |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-08 · ClientActionRequirements

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-08 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | ClientActionRequirements |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/ClientActions.tsx` |
| PARENT COMPONENT | OP-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Open client actions (e.g. APPROVE_DNS_CHANGE) |
| VISUAL AUTHORITY | Boards 17 · 18 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Side column |
| DATA SOURCE | detail.client_actions |
| API DEPENDENCY | client-action (G-04) |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-09 · BlockerControls

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-09 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | BlockerControls |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/BlockerSheet.tsx` |
| PARENT COMPONENT | OP-05 |
| CHILD COMPONENTS | OL-13 |
| PURPOSE | BlockerCategory + reason |
| VISUAL AUTHORITY | Boards 17 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Dialog |
| DESKTOP VARIANT | Dialog |
| DATA SOURCE | BlockerCategory |
| API DEPENDENCY | set-blocker (G-04) |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-10 · RunbookSetup

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-10 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | RunbookSetup |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/RunbookSetup.tsx` |
| PARENT COMPONENT | OP-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Generate / activate runbook, set providers |
| VISUAL AUTHORITY | Boards 18 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Dialog |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | — |
| API DEPENDENCY | generate-runbook · activate-runbook · set-providers (G-04) |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OP-11 · StageUpdate

| Column | Value |
| --- | --- |
| COMPONENT ID | OP-11 |
| PAGE FAMILY | OPERATIONS |
| COMPONENT NAME | StageUpdate |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/operations/StageUpdate.tsx` |
| PARENT COMPONENT | OP-03 |
| CHILD COMPONENTS | — |
| PURPOSE | Manual stage status update |
| VISUAL AUTHORITY | Boards 18 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Dialog |
| DESKTOP VARIANT | Inspector |
| DATA SOURCE | projectStages |
| API DEPENDENCY | update-stage (G-04) |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### CORRESPONDENCE

#### CO-01 · CorrespondencePage

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-01 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | CorrespondencePage |
| EXISTING SOURCE PATH | src/site00/admin/pages/foundation/CommunicationsCommandPage.tsx (static text) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/CorrespondencePage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | CO-02…CO-08 |
| PURPOSE | All client communication + send policy |
| VISUAL AUTHORITY | Boards 19 · 20 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | List + preview |
| DATA SOURCE | messages · email-timeline |
| API DEPENDENCY | /api/admin/site00-foundation messages · email-timeline |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-02 · CommunicationActivity

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-02 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | CommunicationActivity |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/Activity.tsx` |
| PARENT COMPONENT | CO-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Intents with SendIntentStatus |
| VISUAL AUTHORITY | Boards 19 · 20 |
| INTERACTION STATES | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Table |
| DATA SOURCE | email-timeline (G-09) |
| API DEPENDENCY | /api/admin/site00-foundation email-timeline |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-03 · ClientThread

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-03 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | ClientThread |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/Thread.tsx` |
| PARENT COMPONENT | CO-01 |
| CHILD COMPONENTS | OL-14 |
| PURPOSE | Per-client messages (client can send once PAID) |
| VISUAL AUTHORITY | Boards 19 · 20 |
| INTERACTION STATES | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| MOBILE VARIANT | Pushed thread |
| TABLET VARIANT | Thread |
| DESKTOP VARIANT | Thread |
| DATA SOURCE | messages |
| API DEPENDENCY | messages · send-message |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-04 · LifecycleMap

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-04 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | LifecycleMap |
| EXISTING SOURCE PATH | R6 text + eventMap.ts |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/LifecycleMap.tsx` |
| PARENT COMPONENT | CO-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Every lifecycle event, template id, enabled:false |
| VISUAL AUTHORITY | Boards 19 · 20 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Table |
| DATA SOURCE | communications/eventMap.ts |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-05 · EmailPreview

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-05 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | EmailPreview |
| EXISTING SOURCE PATH | R7 invitation preview |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/EmailPreview.tsx` |
| PARENT COMPONENT | CO-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Rendered template + recipient (masked), link validity |
| VISUAL AUTHORITY | Boards 20 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Dock |
| DESKTOP VARIANT | Inspector |
| DATA SOURCE | prepare-test-invitation |
| API DEPENDENCY | /api/admin/site00-foundation prepare-test-invitation |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-06 · OutboundApproval (gated send)

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-06 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | OutboundApproval (gated send) |
| EXISTING SOURCE PATH | R7 approval checkbox + inconsistent lifecycle send |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/SendGate.tsx` |
| PARENT COMPONENT | CO-05 |
| CHILD COMPONENTS | OL-15 |
| PURPOSE | One approval tick for every send; gates 1–5 shown |
| VISUAL AUTHORITY | Boards 19 · 20 · 23 |
| INTERACTION STATES | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Dialog |
| DESKTOP VARIANT | Inspector foot |
| DATA SOURCE | deliveryWorker gates |
| API DEPENDENCY | dispatch-test-email (founder_approved_send) |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Unavailable by policy → disabled-by-policy control naming the gate; never a silent no-op |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-07 · StudioLink

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-07 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | StudioLink |
| EXISTING SOURCE PATH | Correspondence Studio (own chrome) |
| PROPOSED SOURCE PATH | unchanged · linked |
| PARENT COMPONENT | CO-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Templates, campaigns, pack review stay in the Studio |
| VISUAL AUTHORITY | Boards 19 |
| INTERACTION STATES | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| MOBILE VARIANT | Row |
| TABLET VARIANT | Row |
| DESKTOP VARIANT | Button |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### CO-08 · CommunicationPreferences (read)

| Column | Value |
| --- | --- |
| COMPONENT ID | CO-08 |
| PAGE FAMILY | CORRESPONDENCE |
| COMPONENT NAME | CommunicationPreferences (read) |
| EXISTING SOURCE PATH | none (client sets via public link) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/correspondence/Consents.tsx` |
| PARENT COMPONENT | CO-03 |
| CHILD COMPONENTS | — |
| PURPOSE | Client consent state shown read-only |
| VISUAL AUTHORITY | Boards 20 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Row |
| TABLET VARIANT | Row |
| DESKTOP VARIANT | Row |
| DATA SOURCE | communication preferences (G-09) |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | text, not colour, carries meaning; icon decorative; contrast ≥ 4.5:1 |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### SYSTEM

#### SY-01 · SystemPage

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-01 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | SystemPage |
| EXISTING SOURCE PATH | `src/site00/admin/pages/foundation/FoundationReadinessPage.tsx` |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/SystemPage.tsx` |
| PARENT COMPONENT | SH-01 |
| CHILD COMPONENTS | SY-02…SY-12 |
| PURPOSE | Category-first diagnostics |
| VISUAL AUTHORITY | Boards 21 · 22 |
| INTERACTION STATES | loading · populated · empty · error + retry · partial (data gap labelled) |
| MOBILE VARIANT | Tabs + modules |
| TABLET VARIANT | Tabs + modules |
| DESKTOP VARIANT | Tabs + 4-col modules + inspector |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | /api/admin/site00-foundation readiness-report (src/site00/admin/services/foundationReadinessApi.ts) |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-02 · ReadinessVerdict

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-02 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | ReadinessVerdict |
| EXISTING SOURCE PATH | R7 overall status line |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/Verdict.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | One verdict + counts |
| VISUAL AUTHORITY | Boards 21 · 22 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Card |
| TABLET VARIANT | Card |
| DESKTOP VARIANT | Band |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-03 · ModuleCard + ModuleDetail

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-03 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | ModuleCard + ModuleDetail |
| EXISTING SOURCE PATH | R7 sections |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/Module.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | OL-16 |
| PURPOSE | STACK · PERSISTENCE · DB SECURITY · EMAIL · DKIM · STRIPE · API HEALTH · E2E |
| VISUAL AUTHORITY | Boards 21 · 22 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Grid 2 + sheet |
| TABLET VARIANT | Grid + sheet |
| DESKTOP VARIANT | Grid 4 + inspector |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-04 · StagingStack

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-04 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | StagingStack |
| EXISTING SOURCE PATH | R7 :146-203 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/Stack.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Frontend, API, Supabase ref, persistence, origin, E2E |
| VISUAL AUTHORITY | Boards 21 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Tab |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-05 · Integrations

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-05 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | Integrations |
| EXISTING SOURCE PATH | R7 (Stripe key mode, Resend) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/Integrations.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Stripe, Resend, GoDaddy DNS by provider |
| VISUAL AUTHORITY | Boards 21 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Groups |
| TABLET VARIANT | Groups |
| DESKTOP VARIANT | Tab |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-06 · DatabaseSecurityProbe

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-06 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | DatabaseSecurityProbe |
| EXISTING SOURCE PATH | R7 :205-222 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/Security.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | RLS probe, service role, exposure, founder session |
| VISUAL AUTHORITY | Boards 21 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Groups |
| TABLET VARIANT | Groups |
| DESKTOP VARIANT | Tab |
| DATA SOURCE | stagingDatabaseSecurityProbe |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-07 · ReadinessReport

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-07 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | ReadinessReport |
| EXISTING SOURCE PATH | R7 :224-259 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/Report.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Ready / Action required / Blocked / Unverified |
| VISUAL AUTHORITY | Boards 22 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Stacked |
| TABLET VARIANT | Stacked |
| DESKTOP VARIANT | 4 columns |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-08 · TechnicalConfiguration

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-08 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | TechnicalConfiguration |
| EXISTING SOURCE PATH | R7 :261-290 (env groups + legacy presence) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/TechConfig.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Env names, purpose, state — never values |
| VISUAL AUTHORITY | Boards 22 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Pushed page |
| TABLET VARIANT | Section |
| DESKTOP VARIANT | Details table |
| DATA SOURCE | stagingEnvConfig |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Section-level error with RETRY; rest of page stays usable |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-09 · BuildMeta

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-09 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | BuildMeta |
| EXISTING SOURCE PATH | R7 :292-294 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/BuildMeta.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | API build commit + marker (data) |
| VISUAL AUTHORITY | Boards 21 · 22 |
| INTERACTION STATES | present · unknown |
| MOBILE VARIANT | Line |
| TABLET VARIANT | Line |
| DESKTOP VARIANT | Line |
| DATA SOURCE | readiness-report |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-10 · TestLab · CreateSyntheticClient

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-10 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | TestLab · CreateSyntheticClient |
| EXISTING SOURCE PATH | R7 :301-322 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/testlab/CreateTestClient.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Allowlisted synthetic client |
| VISUAL AUTHORITY | Boards 23 |
| INTERACTION STATES | empty · placeholder · focus · filled · invalid · read-only · disabled |
| MOBILE VARIANT | Form |
| TABLET VARIANT | Form |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | — |
| API DEPENDENCY | create-test-client |
| ACCESSIBILITY CONTRACT | label for/id; aria-invalid + aria-describedby to error; inputmode/autocomplete per type; case-sensitive values never CSS-uppercased |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-11 · TestLab · Journey

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-11 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | TestLab · Journey |
| EXISTING SOURCE PATH | R7 :326-362 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/testlab/TestJourney.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | OL-17 |
| PURPOSE | State/intake/payment/surface + test steps + reset |
| VISUAL AUTHORITY | Boards 23 |
| INTERACTION STATES | available · confirming · busy · success · error · unavailable (reason) |
| MOBILE VARIANT | Card |
| TABLET VARIANT | Card |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | test-journey |
| API DEPENDENCY | advance-test-intake · advance-test-quote · reset-test-data |
| ACCESSIBILITY CONTRACT | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-12 · TestLab · EmailEvents

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-12 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | TestLab · EmailEvents |
| EXISTING SOURCE PATH | R7 :363-462 |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/testlab/EmailEvents.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | CO-05 · CO-06 |
| PURPOSE | Email events table, invitation preview, gated sends |
| VISUAL AUTHORITY | Boards 23 |
| INTERACTION STATES | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) |
| MOBILE VARIANT | List + sheet |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | email-timeline |
| API DEPENDENCY | prepare-test-invitation · dispatch-test-email |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SY-13 · TestLab · ContinuityChecks

| Column | Value |
| --- | --- |
| COMPONENT ID | SY-13 |
| PAGE FAMILY | SYSTEM |
| COMPONENT NAME | TestLab · ContinuityChecks |
| EXISTING SOURCE PATH | none (proposed, unverified) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/system/testlab/Continuity.tsx` |
| PARENT COMPONENT | SY-01 |
| CHILD COMPONENTS | — |
| PURPOSE | Restart / link / resume checks, shown UNVERIFIED until a probe exists |
| VISUAL AUTHORITY | Boards 23 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | List |
| TABLET VARIANT | List |
| DESKTOP VARIANT | Panel |
| DATA SOURCE | none yet |
| API DEPENDENCY | none (persistence workstream) |
| ACCESSIBILITY CONTRACT | text, not colour, carries meaning; icon decorative; contrast ≥ 4.5:1 |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED · DEPENDS ON PERSISTENCE WORKSTREAM |

### SHARED

#### SC-01 · ClientPlate (identity)

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-01 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | ClientPlate (identity) |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/ClientPlate.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Initials + threshold sliver; attention / test variants |
| VISUAL AUTHORITY | Boards 27 |
| INTERACTION STATES | default · attention · test · sm/md/lg |
| MOBILE VARIANT | 42 |
| TABLET VARIANT | 42 |
| DESKTOP VARIANT | 32–64 |
| DATA SOURCE | business name |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | aria-hidden; never carries data |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-02 · StatusMark + StatusLabel

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-02 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | StatusMark + StatusLabel |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Status.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Whose move |
| VISUAL AUTHORITY | Boards 27 |
| INTERACTION STATES | founder · client · work · blocked · done · idle · test |
| MOBILE VARIANT | Same |
| TABLET VARIANT | Same |
| DESKTOP VARIANT | Same |
| DATA SOURCE | §2 |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | mark is aria-hidden; adjacent text carries the meaning |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-03 · PhaseSegments + Journey

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-03 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | PhaseSegments + Journey |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Progress.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Eight phases, no percentages |
| VISUAL AUTHORITY | Boards 25 · 27 |
| INTERACTION STATES | founder · client · work · blocked · done · idle · test |
| MOBILE VARIANT | Segments |
| TABLET VARIANT | Short journey |
| DESKTOP VARIANT | Full journey |
| DATA SOURCE | §2 |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | mark is aria-hidden; adjacent text carries the meaning |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-04 · StatusChip

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-04 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | StatusChip |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Chip.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Condition of a thing |
| VISUAL AUTHORITY | Boards 21 · 27 |
| INTERACTION STATES | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| MOBILE VARIANT | Same |
| TABLET VARIANT | Same |
| DESKTOP VARIANT | Same |
| DATA SOURCE | varies |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | text, not colour, carries meaning; icon decorative; contrast ≥ 4.5:1 |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-05 · ActivityRow

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-05 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | ActivityRow |
| EXISTING SOURCE PATH | R2 events list |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/ActivityRow.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Time · mark · event · detail |
| VISUAL AUTHORITY | Boards 27 |
| INTERACTION STATES | default · hover · focus-visible · selected · loading (skeleton) · stale |
| MOBILE VARIANT | Row |
| TABLET VARIANT | Row |
| DESKTOP VARIANT | Row |
| DATA SOURCE | events |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | row is a link/button with an accessible name = client + status + whose move; chevron decorative |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-06 · Button

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-06 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Button |
| EXISTING SOURCE PATH | native buttons |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Button.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Ink / red / outline / ghost; busy; disabled-by-policy |
| VISUAL AUTHORITY | Boards 24 · 27 |
| INTERACTION STATES | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| MOBILE VARIANT | 44 h |
| TABLET VARIANT | 44 h |
| DESKTOP VARIANT | 40–44 h |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-07 · Field

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-07 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Field |
| EXISTING SOURCE PATH | native inputs |
| PROPOSED SOURCE PATH | src/site00/admin/founder-workspace/shared/Field.tsx (from form-control authority) |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Text / email / domain / select fields |
| VISUAL AUTHORITY | Boards 07 · 27 |
| INTERACTION STATES | empty · placeholder · focus · filled · invalid · read-only · disabled |
| MOBILE VARIANT | Full width |
| TABLET VARIANT | Grid |
| DESKTOP VARIANT | Grid |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | label for/id; aria-invalid + aria-describedby to error; inputmode/autocomplete per type; case-sensitive values never CSS-uppercased |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-08 · ActionMenu

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-08 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | ActionMenu |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/ActionMenu.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Row / account / more menus |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Action sheet |
| TABLET VARIANT | Menu |
| DESKTOP VARIANT | Menu |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Unavailable by policy → disabled-by-policy control naming the gate; never a silent no-op |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-09 · Sheet

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-09 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Sheet |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Sheet.tsx` |
| PARENT COMPONENT | SH-13 |
| CHILD COMPONENTS | — |
| PURPOSE | Mobile overlay container |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Bottom sheet |
| TABLET VARIANT | Right sheet |
| DESKTOP VARIANT | — |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-10 · Tabs + SegmentedControl

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-10 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Tabs + SegmentedControl |
| EXISTING SOURCE PATH | Correspondence Studio tabs |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Tabs.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Section and filter switching |
| VISUAL AUTHORITY | Boards 27 |
| INTERACTION STATES | default · hover · focus-visible · selected · with count · overflow scroll |
| MOBILE VARIANT | Scroll |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | tablist/tab/tabpanel; arrow keys move; counts included in tab name |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-11 · Dialog + Confirmation

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-11 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Dialog + Confirmation |
| EXISTING SOURCE PATH | none (unconfirmed actions) |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Dialog.tsx` |
| PARENT COMPONENT | SH-13 |
| CHILD COMPONENTS | — |
| PURPOSE | Confirm external / destructive effects |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet |
| TABLET VARIANT | Dialog 440 |
| DESKTOP VARIANT | Dialog 440 |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-12 · EmptyState

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-12 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | EmptyState |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/EmptyState.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Teach the one next action |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | first use · filtered empty · all clear |
| MOBILE VARIANT | Inline |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-13 · Skeleton + StaleBanner

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-13 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Skeleton + StaleBanner |
| EXISTING SOURCE PATH | “Loading…” text |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Loading.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Loading geometry + stale labelling |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | loading · stale · offline |
| MOBILE VARIANT | Inline |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-14 · Toast

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-14 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | Toast |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/Toast.tsx` |
| PARENT COMPONENT | SH-14 |
| CHILD COMPONENTS | — |
| PURPOSE | Outcome confirmation |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | success · error (persists) · dismissed |
| MOBILE VARIANT | Above nav |
| TABLET VARIANT | Stage |
| DESKTOP VARIANT | Stage |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=status (success) / role=alert (error); not the only feedback for errors |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-15 · ErrorBanner + TechnicalDetail

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-15 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | ErrorBanner + TechnicalDetail |
| EXISTING SOURCE PATH | role=alert <p> |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/ErrorBanner.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Plain line + RETRY + optional detail (no secrets) |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | error · retrying · detail open |
| MOBILE VARIANT | Inline |
| TABLET VARIANT | Inline |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | error response |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | role=status (success) / role=alert (error); not the only feedback for errors |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-16 · ThresholdObject (decorative)

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-16 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | ThresholdObject (decorative) |
| EXISTING SOURCE PATH | `src/site00/foundation-client/objects.tsx` |
| PROPOSED SOURCE PATH | reuse objects.tsx |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | One architectural accent per destination |
| VISUAL AUTHORITY | Boards 03–22 |
| INTERACTION STATES | default |
| MOBILE VARIANT | Small |
| TABLET VARIANT | Small |
| DESKTOP VARIANT | Medium |
| DATA SOURCE | — |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | aria-hidden; never carries data |
| ERROR HANDLING | Presentational; no own error state |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | IMPLEMENTED (DF client) · USE PROPOSED |

#### SC-17 · KeyValueList

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-17 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | KeyValueList |
| EXISTING SOURCE PATH | R2 dl |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/KeyValue.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Label / value pairs; data values unchanged case |
| VISUAL AUTHORITY | Boards 27 |
| INTERACTION STATES | default · data · gap “—” |
| MOBILE VARIANT | Stacked |
| TABLET VARIANT | Two-col |
| DESKTOP VARIANT | Two-col |
| DATA SOURCE | varies |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | section with heading; heading levels follow page outline |
| ERROR HANDLING | Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### SC-18 · LinkBlock (copy)

| Column | Value |
| --- | --- |
| COMPONENT ID | SC-18 |
| PAGE FAMILY | SHARED |
| COMPONENT NAME | LinkBlock (copy) |
| EXISTING SOURCE PATH | `window.prompt` |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/shared/LinkBlock.tsx` |
| PARENT COMPONENT | — |
| CHILD COMPONENTS | — |
| PURPOSE | Visible personal link + copy |
| VISUAL AUTHORITY | Boards 08 · 24 |
| INTERACTION STATES | default · copied · copy failed |
| MOBILE VARIANT | Block |
| TABLET VARIANT | Block |
| DESKTOP VARIANT | Inline |
| DATA SOURCE | public_token |
| API DEPENDENCY | — |
| ACCESSIBILITY CONTRACT | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

### OVERLAY

#### OL-01 · Create foundation (sheet / dialog)

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-01 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Create foundation (sheet / dialog) |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SH-06 |
| CHILD COMPONENTS | — |
| PURPOSE | Create foundation (sheet / dialog) |
| VISUAL AUTHORITY | Boards 07 · 08 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-02 · Link ready

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-02 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Link ready |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | FN-07 |
| CHILD COMPONENTS | — |
| PURPOSE | Link ready |
| VISUAL AUTHORITY | Boards 07 · 08 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-03 · Workspace menu drawer

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-03 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Workspace menu drawer |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SH-09 |
| CHILD COMPONENTS | — |
| PURPOSE | Workspace menu drawer |
| VISUAL AUTHORITY | Boards 01 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-04 · Search / command palette

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-04 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Search / command palette |
| EXISTING SOURCE PATH | `AdminSearchModal.tsx` |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SH-04 |
| CHILD COMPONENTS | — |
| PURPOSE | Search / command palette |
| VISUAL AUTHORITY | Boards 01 · 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-05 · Notification center

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-05 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Notification center |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SH-05 |
| CHILD COMPONENTS | — |
| PURPOSE | Notification center |
| VISUAL AUTHORITY | Boards 01 · 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-06 · Row action menu

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-06 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Row action menu |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | FN-10 |
| CHILD COMPONENTS | — |
| PURPOSE | Row action menu |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-07 · Filter / sort

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-07 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Filter / sort |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | FN-04 |
| CHILD COMPONENTS | — |
| PURPOSE | Filter / sort |
| VISUAL AUTHORITY | Boards 05 · 06 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-08 · Approve quote confirmation

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-08 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Approve quote confirmation |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | CR-08 |
| CHILD COMPONENTS | — |
| PURPOSE | Approve quote confirmation |
| VISUAL AUTHORITY | Boards 12 · 15 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-09 · Revise quote / manual adjustment

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-09 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Revise quote / manual adjustment |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | CR-08 |
| CHILD COMPONENTS | — |
| PURPOSE | Revise quote / manual adjustment |
| VISUAL AUTHORITY | Boards 12 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-10 · Mark foundation complete

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-10 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Mark foundation complete |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | CR-10 |
| CHILD COMPONENTS | — |
| PURPOSE | Mark foundation complete |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 4 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-11 · Request changes / add note

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-11 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Request changes / add note |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | RV-05 |
| CHILD COMPONENTS | — |
| PURPOSE | Request changes / add note |
| VISUAL AUTHORITY | Boards 15 · 16 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 5 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-12 · Task detail

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-12 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Task detail |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | OP-05 |
| CHILD COMPONENTS | — |
| PURPOSE | Task detail |
| VISUAL AUTHORITY | Boards 17 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-13 · Set blocker

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-13 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Set blocker |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | OP-09 |
| CHILD COMPONENTS | — |
| PURPOSE | Set blocker |
| VISUAL AUTHORITY | Boards 17 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 6 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-14 · Compose message

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-14 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Compose message |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | CO-03 |
| CHILD COMPONENTS | — |
| PURPOSE | Compose message |
| VISUAL AUTHORITY | Boards 19 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-15 · Send (gated, approval tick)

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-15 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Send (gated, approval tick) |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | CO-06 |
| CHILD COMPONENTS | — |
| PURPOSE | Send (gated, approval tick) |
| VISUAL AUTHORITY | Boards 19 · 23 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 7 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-16 · System module detail

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-16 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | System module detail |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SY-03 |
| CHILD COMPONENTS | — |
| PURPOSE | System module detail |
| VISUAL AUTHORITY | Boards 21 · 22 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-17 · Reset test data confirmation

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-17 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Reset test data confirmation |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SY-11 |
| CHILD COMPONENTS | — |
| PURPOSE | Reset test data confirmation |
| VISUAL AUTHORITY | Boards 23 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 8 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-18 · Account menu

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-18 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Account menu |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SH-07 |
| CHILD COMPONENTS | — |
| PURPOSE | Account menu |
| VISUAL AUTHORITY | Boards 02 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-19 · Client preview (inspector as sheet)

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-19 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Client preview (inspector as sheet) |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | FN-06 |
| CHILD COMPONENTS | — |
| PURPOSE | Client preview (inspector as sheet) |
| VISUAL AUTHORITY | Boards 25 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 3 |
| FOUNDER APPROVAL STATUS | PROPOSED |

#### OL-20 · Technical error detail

| Column | Value |
| --- | --- |
| COMPONENT ID | OL-20 |
| PAGE FAMILY | OVERLAY |
| COMPONENT NAME | Technical error detail |
| EXISTING SOURCE PATH | none |
| PROPOSED SOURCE PATH | `src/site00/admin/founder-workspace/overlays/` |
| PARENT COMPONENT | SC-15 |
| CHILD COMPONENTS | — |
| PURPOSE | Technical error detail |
| VISUAL AUTHORITY | Boards 24 |
| INTERACTION STATES | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| MOBILE VARIANT | Sheet / full screen |
| TABLET VARIANT | Dialog / right sheet |
| DESKTOP VARIANT | Dialog / popover / inspector |
| DATA SOURCE | per parent |
| API DEPENDENCY | per parent |
| ACCESSIBILITY CONTRACT | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| ERROR HANDLING | Action failure → inline error at the control + error toast; form keeps values; no optimistic success |
| IMPLEMENTATION PHASE | 1 |
| FOUNDER APPROVAL STATUS | PROPOSED |

