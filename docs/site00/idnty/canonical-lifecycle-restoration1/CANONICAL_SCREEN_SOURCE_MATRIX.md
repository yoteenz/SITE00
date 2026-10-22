# Canonical screen source matrix (Phase 1)

**Version:** `2026-10-20-phase1-recovery1`  
**Branch:** `cursor/idnty-living-portal-one-pass-completion1-be3b`  
**Machine-readable:** `LIFECYCLE_RECONCILIATION_MATRIX.json`

| ID | Board title | Actor | Lifecycle | React source | Route | Class | Phase 1 | Phase 2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | WE NEED YOUR APPROVAL | Client | Active portal | `P10NeedsYou` | `/foundation/:token` NEEDS_YOU | A | Registry + fixtures | Opus visual |
| 11 | YOUR FOUNDATION IS COMPLETE | Client | Verified complete | `DigitalFoundationCompleteSurface` (embedded `COMPLETE` view) | `/foundation/:token` COMPLETE | B→A | Portal shell restored | Opus board 11 |
| 12 | YOUR DIGITAL LOCATION | Client | Build opportunity | Same surface § Board 12 | COMPLETE view | B→A | Server handoff to `/bldr/studio/blueprint` | Opus board 12 |
| 12A | DIGITAL LOCATION IS LIVE | Client | Downstream product | — | — | F | Inventory only | Separate product |
| 13A | RECORDS LIBRARY | Client | Portal | `RecordsLibrary` | RECORDS | A | Unchanged | Opus polish |
| 13A-D | RECORD DETAIL | Client | Portal | `RecordDetail` | RECORD | A | Unchanged | Opus polish |
| 13 | FOUNDATION PIPELINE | Founder | Operations | Admin pipeline routes | `/admin/site00/foundation/pipeline` | A/C | Mapped | Opus board 13 |
| 14 | PROJECT COMMAND | Founder | Operations | Project command shell | `/admin/site00/foundation/:id/command` | A/C | Mapped | Opus board 14 |
| 15 | EXECUTION WORKBENCH | Founder | Operations | Workbench + runbook engine | `.../workbench` | A/C | Mapped | Opus board 15 |
| 15A–C | RUNBOOK / TASK | Founder | Operations | Runbook engine tasks | Admin detail routes | A/C | Mapped | Opus 15A–C |
| Queue | Pre-activation queue | Client | Intake submitted → paid | `P03IntakeSubmitted`, P04–P06 | P03–P06 | A | Boundary preserved | — |
| Portal | Living foundation portal | Client | Post-activation | `P07–P10`, records | OVERVIEW…RECORDS | A | Continuity through COMPLETE | Opus shells |

**Legend:** A implemented · B misrouted (fixed in Phase 1 where noted) · F board-only · G superseded (none claimed without evidence).

Approved founder design boards in chat were **not re-attached in this VM**; visual authority uses repo materials under `docs/site00/idnty/visual-authority/` and review registry anchors.
