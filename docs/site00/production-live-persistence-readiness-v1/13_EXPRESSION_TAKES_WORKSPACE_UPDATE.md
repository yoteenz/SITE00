# 13 — EXPRESSION → TAKES workspace update

Sprint §25, §26, §28. Files:

- `src/site00/components/productionAuthority/expression/families/ProductionTakes.tsx`
- `src/site00/styles/site00-production-takes.css`
- `shared/site00-production-spine/workspace.ts`, `view.ts`

## 1. What changed

- **Readiness, six rows.** TECHNICALLY READY, CREATIVELY APPROVED, FINANCIALLY AUTHORIZED, GENERATION RUNNING, TAKE READY FOR REVIEW, TAKE APPROVED. Each row has its own YES / NOT YET and the specific checks that are not met. There is no combined "READY" badge.
  - **Technically ready:** durable record store, private master bucket, production setup records, provider route.
  - **Creatively approved:** the creative founder decisions and the shot's references.
  - **Financially authorized:** the budget decision, the founder budget, a quote within 24 h per job, and the video job's authorization.
  - **Running / review / approved:** from the jobs and takes themselves.
- **Generation plan.** Each job shows model, quote, and "PLANNING" when the quote is older than 24 h. The hover title shows purpose, mode and settings.
- **Budget rows.** Estimate (marked "NOT A QUOTE"), authorized, committed (UNKNOWN when any attempt's spend is unknown, never 0), and actual.
- **Storage row.** Where a master would go (adapter and bucket; TEST in fixtures).
- **Take facts.** Intended edit duration ("4 S OF 5 S") and the continuity findings.
- **History.** Each decision shows the role, the before → after state, and the time.

## 2. Generate stays disabled (§26)

The GENERATE button is enabled only when the server says the next job's dispatch would pass. Today it never does:

- the live route is DISABLED;
- the dispatch endpoint also needs the founder role;
- the dispatch endpoint also needs every gate check.

Its reasons (`PROVIDER_EXECUTION_DISABLED +8 MORE`) are shown and listed in its title. The founder can open SH01, read the requirements, references, approvals, estimate, plan, missing dependencies, storage destination and the take workflow, and nothing on the screen can start a paid generation.

## 3. UX authority (§28)

- **No new global tab.** It is the existing EXPRESSION → CAST + PERFORMANCE → TAKES route.
- **No full-page scroll.** Panels scroll inside themselves.
- **No circular primary buttons.**
- **Every control acts or states why it cannot.**
- **Test data is labelled** "TEST FIXTURE DATA — NOT THE PRODUCTION CATALOGUE".
- **No server filesystem paths.** The workspace no longer shows them (store descriptions are relative).

## 4. Viewport check

`scripts/production/takes-viewport-check.ts` against Vite on 127.0.0.1:5191, Chromium 1.63 (Playwright), with the spine API routed in-process:

| Viewport | Page fits | Frame fits | Controls on screen | Round buttons | Readiness rows | Interaction (written to the store) |
| --- | --- | --- | --- | --- | --- | --- |
| 390 × 844 (touch) | yes | yes | yes | 0 | 6 | tap HOLD → HELD |
| 834 × 1194 (touch) | yes | yes | yes | 0 | 6 | — |
| 1440 × 900 | yes | yes | yes | 0 | 6 | keyboard APPROVE → APPROVED |
| 2560 × 1440 | yes | yes | yes | 0 | 6 | click SELECT FOR EDIT → selected, 3 approvals |
| live catalogue 390 / 1440 | yes | yes | yes | 0 | 6 | none (no takes; GENERATE disabled) |

Failures: none. Screenshots are in the full evidence package.

**Unchanged and reported:** the 7 px secondary text on mobile comes from the HUB density authority shared by every family. It was not changed here.
