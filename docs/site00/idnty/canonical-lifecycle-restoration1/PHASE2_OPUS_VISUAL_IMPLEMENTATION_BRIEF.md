# Phase 2 — Opus visual implementation brief

**Input authority:** Founder-approved boards 10–15C (chat attachments; reattach if missing from repo).  
**Functional truth:** Phase 1 sources below — do not redesign lifecycle or routing.

## Client boards

### Board 10 — WE NEED YOUR APPROVAL

- **Component:** `src/site00/foundation-client/parents/ProjectPortal.tsx` → `P10NeedsYou`
- **Shell:** `FoundationClient` + `DfFrame` view `NEEDS_YOU`
- **Data:** `payload.client_actions` (APPROVE_SIGNATURE, APPROVE_DNS_CHANGE, …), `completeClientAction` API
- **Actions:** Approve / Request change (authorized POST)
- **Review:** `df-r-needs-you-approval`
- **Deliverable:** Full board 10 composition on existing action model

### Board 11 — YOUR FOUNDATION IS COMPLETE

- **Component:** `DigitalFoundationCompleteSurface` embedded at view `COMPLETE`
- **Data:** `ownership_record`, completion gate satisfied server-side
- **Deliverable:** Replace concept preview with approved board 11; keep portal nav

### Board 12 — YOUR DIGITAL LOCATION

- **Same component** (section under COMPLETE view)
- **Data:** `build_readiness`, `build_recommendation`, verified `credit`, handoff CTA
- **Deliverable:** Approved path tiles + CTA; handoff already functional

### Board 13A / detail

- **Components:** `RecordsLibrary`, `RecordDetail`
- **Data:** `buildClientRecords(payload)`
- **Deliverable:** Approved records library and detail layouts

## Founder boards 13–15C

| Board | Runtime anchor | Contract files |
| --- | --- | --- |
| 13 Pipeline | `/admin/site00/foundation/pipeline` | `operations/contracts/p13Pipeline.ts` |
| 14 Command | `.../command` | `p14ProjectCommand.ts` |
| 15 Workbench | `.../workbench` | `p15ExecutionWorkbench.ts` |
| 15A–C Runbook | Runbook engine + task detail | `operations/runbookGenerator.ts`, task routes |

## Board 12A

**Separate product** (`SITE00_DIGITAL_LOCATION`). Do not render on foundation complete alone.

## Test fixtures

Use `shared/site00-digital-foundation/fixtures/scenarios.ts` — scenario `M_COMPLETE_CREDIT` for completion + credit. Review gallery: `/foundation/review` continuous zones.

## Constraints for Opus

- Do not replace living portal with queue cards
- Do not modify `/bldr/studio` five-tab authority (PR #1672)
- Preserve uppercase client copy convention and approved architecture artwork paths
