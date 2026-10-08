# Digital Foundation — Five-board visual authority handoff (OPUS)

Semantic map for visual/experience authority. **Composer did not design UI** — this document binds operational truth to future boards.

## BOARD 01 — Client entry / intake / configure

- **P01 Foundation Entry** — prospect / value / BEGIN
- **P02 Business Intake** — intake fields + needs flags (no passwords)
- **P03 Foundation Configurator** — needs checkboxes driving recommendation (quote engine)

**Operational binding:** intake + needs → scope hash input; no runbook until paid.

## BOARD 02 — Client recommend / review / activate

- **P04 Recommendation** — YOUR DIGITAL FOUNDATION summary
- **P05 Review + Checkout** — quote edit, disclosures, Stripe hosted checkout
- **P06 Activation** — payment confirmed (server-side); artifact becomes portal-capable

**Operational binding:** quote version + acceptance; runbook generated on activation.

## BOARD 03 — Client portal core

- **P07 Project Overview** — payment confirmed, operations_summary (stage, needs-you count, forecast)
- **P08 Roadmap** — rolled-up project stages (derived from tasks)
- **P09 Stage Detail** — client-safe subset of tasks for current stage

**Operational binding:** `rollupStagesFromTasks`; never show INTERNAL_ONLY task notes.

## BOARD 04 — Client action / complete / next

- **P10 Needs you + Approval** — CLIENT_ACTION tasks ↔ existing Needs you / approvals
- **P11 Foundation Complete** — completion gate passed; ownership record client-safe fields
- **P12 Next Threshold / Digital Location** — build recommendation, concept preview label, Foundation credit

**Operational binding:** completion gate + ownership generator; credit unchanged from V1.

## BOARD 05 — Founder operations

- **P13 Foundation Pipeline** — `getPipelineView()` / `pipelineAttentionQueries`
- **P14 Project Command** — `getProjectCommandSnapshot()` / `projectCommandAnswers()`
- **P15 Execution Workbench** — `getWorkbenchView()` buckets + execution mode grouping

**Operational binding:** full task/runbook/verification/blocker/forecast visibility; provider registry read-only.

## Established visual rhythm (founder — do not replace in Opus)

MOBILE ONLY · UPPERCASE · WHITE / BLACK / RED · SITE 00 HOST SHELL · ARCHITECTURAL WHITE SPACE · RED THRESHOLD OBJECT · GLASS / FOUNDATION PLATE · CONDENSED HIGH-CONTRAST TYPOGRAPHY · PRECISE EDITORIAL GEOMETRY

## OPUS next sprint

`P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V1-FIVE-BOARD-VISUAL-AUTHORITY1` — express boards 01–05 using this semantic map and live contracts.
