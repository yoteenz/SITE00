# Founder review pack — Digital Foundation boards 10–15C (Phase 2)

Every screen below is a real React component. Screenshots come from Playwright captures of the live routes on the local preview API and of the `/foundation/review` gallery. None is a mock or a placeholder.

- Screenshots: `/opt/cursor/artifacts/df-phase2/routes/<name>-<width>.png` at 320, 390, 834, 1440 and 1920.
- Gallery shots: `/opt/cursor/artifacts/df-phase2/gallery/<anchor>-<width>.png` at 390 and 1440.
- Report: `/opt/cursor/artifacts/df-phase2/capture-report.json` (view, state, overflow and page errors per capture).
- Regenerate: `DF_BASE=http://127.0.0.1:5180 node scripts/df-phase2-capture.mjs`, with the dev server started using a private `SITE00_DF_PREVIEW_SNAPSHOT_PATH`.
- Gallery route: `/foundation/review#<anchor>`. Every action there is inert ("REVIEW MODE — NOTHING WAS SENT.").
- Board files: `docs/site00/idnty/canonical-lifecycle-restoration1/boards/`.

Status words:
- **Wired**: the screen calls the real existing contract.
- **Partly wired**: the screen renders real data, and some actions are disabled with an honest note.
- **Catalog only**: there is a registry entry and no implementation.

## CLIENT

| Screen | Source | Board | Route captures | Gallery | Functional status |
| --- | --- | --- | --- | --- | --- |
| 10 We need your approval | `src/site00/foundation-client/parents/ProjectPortal.tsx#P10NeedsYou` | `BOARD_10_11_12_CLIENT.jpg` | `board-10-approval-*`, `portal-10-needs-you-active-*` | `df-r-needs-you-approval` | Wired. APPROVE / REQUEST CHANGE call `completeClientAction`. |
| 11 Your foundation is complete | `src/site00/foundation-client/parents/FoundationMilestone.tsx#P11FoundationComplete` | `BOARD_10_11_12_CLIENT.jpg` | `board-11-complete-*` | `df-r-complete` | Wired. Rows are evidence-based. |
| 12 Your digital location | `FoundationMilestone.tsx#P12DigitalLocation` | `BOARD_10_11_12_CLIENT.jpg` | `board-12-location-*` | `df-r-location` | Wired through the Phase 1 handoff and `captureBuildInterest`. |
| 13A Your records | `ProjectPortal.tsx#RecordsLibrary` | `BOARD_13A_DETAIL_12A_CLIENT.jpg` | `board-13a-records-*`, `portal-13a-records-active-*` | `df-r-RECORDS` | Partly wired. DOWNLOAD ALL is disabled. |
| 13A Record detail | `ProjectPortal.tsx#RecordDetail` | `BOARD_13A_DETAIL_12A_CLIENT.jpg` | `board-13a-record-detail-*`, `board-13a-record-history-*` | `df-r-record-domain` | Partly wired. DOWNLOAD is disabled. |
| Portal: overview, roadmap and needs you (active) | `ProjectPortal.tsx` | (Phase 1 portal) | `portal-07-overview-active-*`, `portal-08-roadmap-*`, `portal-10-needs-you-active-*` | `df-r-client-portal` | Wired. |
| Portal after completion | `ProjectPortal.tsx` | (Phase 1 portal) | `portal-07-overview-complete-*`, `post-complete-roadmap-*`, `post-complete-needs-you-*` | `df-r-client-portal-complete` | Wired. All four areas stay reachable. |
| Temporary queue: quote and activation | `src/site00/foundation-client/parents/*` (unchanged) | (Phase 1) | `queue-quote-recommendation-*`, `queue-06-activation-*` | (existing entries) | Wired. Unchanged. |

Known differences:
- **Board 10**:
  - The red bottom CTA is BACK TO OVERVIEW. The decisions are the APPROVE / REQUEST CHANGE pair.
  - The approval is the primary row.
  - The signature mark uses the italic text face. It is never a signature image.
- **Board 11**:
  - Row subs show the real domain and mailbox.
  - A NEXT THRESHOLD outline CTA was added.
  - On the `M_COMPLETE_CREDIT` fixture, DOMAIN and EMAIL read IN PROGRESS. That fixture is completed by founder override, without stages 02 and 03 closing, and the rows never invent ACTIVE.
- **Board 12**:
  - A RETURN TO MY PORTAL text action was added.
  - The concept preview uses the approved chamber art, not a generated site mock.
  - No build-path prices are shown. The only money shown is the `$200` credit amount.
- **Board 13A**:
  - Downloads are disabled.
  - The footer reads `013A`; the board shows `011`.
  - The record detail has no auto-renew or privacy fields, because those fields do not exist.

## FOUNDER

| Screen | Source | Board | Route captures | Gallery | Functional status |
| --- | --- | --- | --- | --- | --- |
| 13 Foundation pipeline | `src/site00/admin/pages/foundation/boards/FounderBoards.tsx#FounderPipelineBoard` | `BOARD_13_14_15_FOUNDER.jpg` | `board-13-pipeline-*` | `df-r-founder-foundation_pipeline` | Wired to the read model `getPipelineView`. |
| 14 Project command | `FounderBoards.tsx#FounderProjectCommandBoard` | `BOARD_13_14_15_FOUNDER.jpg` | `board-14-project-command-*` | `df-r-founder-project_command` | Wired to the read models. |
| 15 Execution workbench | `FounderBoards.tsx#FounderWorkbenchBoard` | `BOARD_13_14_15_FOUNDER.jpg` | `board-15-workbench-*` | `df-r-founder-execution_workbench` | Partly wired. START TASK is wired; RUN VERIFICATION is disabled. |
| 15A Runbook at a glance | `FounderBoards.tsx#FounderRunbookOverviewBoard` | `BOARD_15A_15B_15C_FOUNDER.jpg` | `board-15a-runbook-*` | `df-r-founder-runbook_overview` | Wired to the read model `getRunbookView`. |
| 15B Runbook detail | `FounderBoards.tsx#FounderRunbookDetailBoard` | `BOARD_15A_15B_15C_FOUNDER.jpg` | `board-15b-runbook-detail-*` | `df-r-founder-runbook_detail` | Wired to the read model. |
| 15C Task detail | `FounderBoards.tsx#FounderTaskDetailBoard` | `BOARD_15A_15B_15C_FOUNDER.jpg` | `board-15c-task-detail-*` | `df-r-founder-runbook_task_detail` | Partly wired. START and MARK EXECUTED are wired; RUN VERIFICATION is disabled. |

Live routes: `/admin/site00/foundation/pipeline` and `/admin/site00/foundation/:id/{command,workbench,runbook,runbook/tasks,runbook/tasks/:taskId}`.

Known differences:
- **Board 14**: credit reads "—" / NOT ELIGIBLE until the project is complete.
- **Board 15B**: below 599px each row wraps to two lines, with dependencies on the second line. The board shows a single line.
- **Board 15C**:
  - Expected and current values read NOT SET, because the engine rules carry no expected values.
  - There is no EST. TIME field.
  - The headline is `{TASK TITLE} TASK DETAIL`.
- **Boards 15 and 15C**: RUN VERIFICATION is disabled. No verification pass is fabricated.

## CROSS-PRODUCT

| Screen | Owner | Board | Status |
| --- | --- | --- | --- |
| 12A Your digital location is live | SITE 00 Digital Location product (`DF_REVIEW_PRODUCT.SITE00_DIGITAL_LOCATION`) | `BOARD_13A_DETAIL_12A_CLIENT.jpg` | Catalog only. The registry entry `df-r-digital-location-live` keeps the board, with no implementation in the IDNTY Digital Foundation workstream. |

## What to review

1. Confirm or override each known difference above.
2. Check board-to-React likeness at 390 (phone) and 1440 (desktop) first, then 320, 834 and 1920.
3. Sign off gate R (founder visual approval). It is the only gate left open.
