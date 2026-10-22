# Composer implementation handoff

**Status:** PROPOSED. **Do not start implementing** until the founder has recorded decisions in FOUNDER_APPROVAL_REGISTER.md for the phase you are entering. This sprint implemented nothing.

**Inputs:**
- boards in `boards/` (visual authority)
- COMPLETE_COMPONENT_INVENTORY.md and `registry/component-registry.json` (what to build)
- DATA_CONTRACT_MAPPING.md (where every value comes from)
- page specifications
- ACCESSIBILITY_AND_INTERACTION_CONTRACTS.md
- COVERAGE_AND_OMISSION_REPORT.md (what must not disappear)

## 0. Standing rules for every phase

**Do not change:**
- artifact creation
- public token handling
- Supabase persistence
- intake save and resume
- API response contracts
- backend session handling
- database grants
- client lifecycle transitions
- payment logic
- webhooks
- email send gates

These belong to the persistence workstream or are out of scope.

**Do not:**
- send email
- touch the staging database
- deploy to production
- merge into production routes before founder acceptance of that phase

**Data:**
- No fictional clients, sample counts or sample images as data. Gaps render as "—".
- Two fonts only, inside a workspace CSS scope (`.fw` or equivalent).
- No Martian Mono or Barlow inside the scope.
- Uppercase via CSS; case-sensitive values in a `data` class.

**Delivery:** one phase per PR, each behind a feature flag (proposed `SITE00_DF_FOUNDER_WORKSPACE_V1`, default off). R1–R7 keep working until the phase that replaces them is accepted.

**Every PR runs:** `npm run typecheck`, `npm test`, `npm run build`, plus the phase's Playwright specs. Existing DF tests must stay green, including:
- `tests/digitalFoundationAdminList.test.ts`
- `tests/digitalFoundationArtifactHandler.test.ts`
- `tests/founderReadinessE2e.test.ts`
- `api/admin/site00-foundation.preview-auth.test.ts`
- `src/utils/auth/site00AuthRedirect.test.ts`

**Visual tests** compare against the approved boards at the board viewports (390 × 844, 834 × 1112, 1194 × 834, 1440 × 900). They validate layout authority: regions, order, sizes and states, not merely DOM presence. Use Playwright screenshots with masks for live data, plus `@axe-core/playwright` (already a dev dependency).

## Phase plan

### Phase 0 · Baseline + contract protection

- **Depends on:** nothing. **Founder:** none.
- **Do:**
  - Verify routes R1–R7 at `392ac76d5` or later.
  - Record the API action list and response shapes for `list`, `detail`, `pipeline`, `project-command`, `workbench`, `readiness-report`, `email-timeline`, `messages`.
  - Confirm the persistence workstream status: which of G-03, G-04, G-07 and G-09 have closed.
  - Confirm the staging boundaries (Supabase ref = staging; test mode; allowlist).
  - Choose the final source root (proposed `src/site00/admin/founder-workspace/`).
  - Add the feature flag.
- **Tests:**
  - Contract snapshot tests for the response shapes above (read-only; mocked).
  - Route resolution tests for R1–R7, including the R7 auth return path (`site00AuthRedirect`).
  - A guard test that the workspace bundle performs **no mutating request on load**.
- **Accept:**
  - Snapshot tests are committed and green.
  - Nothing user-visible changed.

### Phase 1 · Global founder shell

- **Depends on:** 0. **Founder:** FD-W1, FD-W2, FD-W4, FD-W6, FD-W8, FD-W10, FD-W14, FD-W19, FD-W20.
- **Build:** SH-01…SH-16, SC-01…SC-18 (shared), the overlay host, the feedback host and the layout controller. Add the new static routes behind the flag, and the admin nav entry.
- **Tests:**
  - **Navigation:** every destination is reachable on phone, tablet and desktop.
  - **Route resolution:** new paths, plus R1–R7 still resolve.
  - **Browser refresh:** each destination survives a refresh.
  - **Founder authentication:** signed-out users are redirected; sign-out works.
  - **Keyboard:** ⌘K, ESC, tab order.
  - **Screen reader:** landmarks, nav names and badge text.
  - **No horizontal overflow** at 320–1920.
  - **Mobile overlays:** drawer, search, sheet focus trap.
  - **Visual:** boards 01, 02, 25 regions.
- **Accept:**
  - Shell matches boards 01, 02 and 25.
  - axe shows no serious or critical violations.
  - Fonts are limited to the two families inside the scope (computed-style check).

### Phase 2 · Overview

- **Depends on:** 1. **Founder:** FD-W11, FD-W12.
- **Build:** OV-01…OV-08 and the §4 review derivation as a shared selector, so the badge, signal and Reviews all use one source.
- **Tests:**
  - **Client registry retrieval:** signals derived from mocked `list` fixtures.
  - **Failed load:** shows "—", never 0.
  - **Synthetic exclusion.**
  - **Focus:** shows the oldest decision.
  - **Signal filter** works in place.
  - **Error recovery:** retry.
  - **Visual:** boards 03 and 04.
- **Accept:** the action is above the fold at 390 × 844 and 1440 × 900; there is no diagnostic content.

### Phase 3 · Foundations registry

- **Depends on:** 1 (2 recommended). **Founder:** FD-W3, FD-W5, FD-W11, FD-W12.
- **Build:** FN-01…FN-10, the create flow (OL-01, OL-02), the client preview inspector and the row menu. Map to `create-artifact` exactly as today, minus the hard-coded email.
- **Tests:**
  - **Create-client flow:**
    - validation;
    - busy state until the durable write;
    - DfPersistenceError copy;
    - link from `personalized_url`;
    - **no email sent.**
  - **Synthetic-client isolation:** default hidden; `?test=1` shows them.
  - **Search and filters** are client-side; typed text keeps its case.
  - **Desktop inspector behaviour:** open on select, ESC closes, `?sel=` survives refresh.
  - **Copy link:** clipboard success and fallback field.
  - **No regressions in persistent artifact links:** copied URL = `/foundation/<public_token>`.
  - **Visual:** boards 05–08.
- **Accept:** `window.prompt` and `prospect@example.com` are gone; R1 renders the registry when the flag is on.

### Phase 4 · Client record workspace

- **Depends on:** 3. **Founder:** FD-W3, FD-W5, FD-W9, FD-W11, FD-W17.
- **Build:** CR-01…CR-13 and the quote decision (OL-08, OL-09) and mark-complete (OL-10) overlays. Redirect R4 and R5 into `?section=operations`.
- **Tests:**
  - **Client record opening:** by id and on 404.
  - **Intake projection:** sections and case preserved.
  - **Quote state:**
    - lines and totals equal `quoteEngine` output;
    - expiry is never shown as link expiry;
    - locked after ACCEPTED.
  - **Approve:** confirmation names the consequence and calls `quote-commercial-ready` once.
  - **Revise:** shows the G-04 notice.
  - **Mark complete:** disabled while the gate is open; no hard-coded values.
  - **No accidental data mutation:** opening any section issues GET only.
  - **Visual:** boards 09–12.
- **Accept:** every R2 capability is present; R4 and R5 redirect.

### Phase 5 · Reviews workspace

- **Depends on:** 4 (shares record sections). **Founder:** FD-W9, FD-W15.
- **Build:** RV-01…RV-07, the decision controls (OL-08, OL-11) and the shared queue selector.
- **Tests:**
  - **Review queue retrieval:** each tab's derivation rule against fixtures.
  - **Review decisions:** each option calls exactly its API action; already-decided and failure states.
  - **No reject option exists.**
  - **Badge count** equals the queue length.
  - **Visual:** boards 13–16.
- **Accept:** the queue has a single source; decisions show server-confirmed resulting states.

### Phase 6 · Operations

- **Depends on:** 4. **Founder:** FD-W1 (if nav changes), FD-W5. **Persistence:** if G-04 is still open, every mutation carries the persistence notice.
- **Build:** OP-01…OP-11 and the task (OL-12) and blocker (OL-13) overlays. Redirect R3.
- **Tests:**
  - **Operations state:**
    - stage and task enums render all values;
    - dependencies match the `runbookGenerator` depMap;
    - VERIFICATION tasks → READY_TO_VERIFY on complete;
    - blocker categories are the real enum.
  - **G-04 notice** is present while open.
  - **Visual:** boards 17 and 18.
- **Accept:** no raw JSON remains; R3 redirects.

### Phase 7 · Correspondence

- **Depends on:** 1, 4. **Founder:** FD-W13, FD-W16.
- **Build:** CO-01…CO-08, the gated send sheet (OL-15) and the thread composer (OL-14). Link Correspondence Studio unchanged.
- **Tests:**
  - **Communication permissions:**
    - the send control only renders when gates 1–5 pass;
    - otherwise `SEND DISABLED · <REASON>`;
    - the approval tick is required for every send, including lifecycle sends;
    - the client message rule (PAID) is shown;
    - DELIVERED only from webhook status.
  - **No email is sent in tests** (the API is mocked; assert no `dispatch-test-email` call without the tick).
  - **Visual:** boards 19 and 20.
- **Accept:** R6 renders the page; the Studio is untouched.

### Phase 8 · System + test lab

- **Depends on:** 1. **Founder:** FD-W7, FD-W18.
- **Build:** SY-01…SY-13, the module detail (OL-16) and reset confirmation (OL-17).
- **Tests:**
  - **System health reporting:**
    - every readiness check maps to the right chip;
    - **API health is never green from a catalog response**;
    - send flag ON → UNVERIFIED;
    - no env values or secrets in the DOM (scan for key prefixes).
  - **Synthetic-client isolation:** test actions are disabled for non-synthetic artifacts.
  - **Reset:** requires confirmation and typing RESET.
  - **R7 auth return path** still resolves.
  - **Visual:** boards 21–23.
- **Accept:** every R7 function is present (COVERAGE_AND_OMISSION_REPORT.md §D). R7 retirement happens only after the founder accepts parity (FD-W7).

### Phase 9 · Responsive + accessibility hardening

- **Depends on:** 2–8.
- **Do:**
  - Run the full matrix at 320, 375, 390, 430, 768, 834, 1024, 1194, 1280, 1440 and 1920.
  - Check rotation (inspector ↔ sheet keeps content).
  - Check 200 % zoom and iOS text size.
  - Run keyboard-only passes and **VoiceOver on a real iPhone (Safari) and Mac**.
  - Check reduced motion.
  - Exercise every error state from the state matrix.
- **Tests:**
  - **Responsive layout:** regions per breakpoint.
  - **Keyboard access**, **screen-reader access** and **no horizontal overflow** across the full matrix.
  - **Error recovery** for every list and action.
- **Accept:** axe shows no serious or critical issues; manual VoiceOver and iPhone Safari checklists are signed off with device and OS versions recorded.

### Phase 10 · Visual regression + founder acceptance

- **Depends on:** 9.
- **Do:**
  - Capture the implementation at board viewports with fixture data.
  - Compare to the approved boards side by side.
  - Log differences.
  - Present to the founder per review round.
  - Remove the flag only after acceptance.
- **Accept:** written founder acceptance per round, recorded in the approval register.

## Test checklist (§43 coverage)

| §43 requirement | Phase |
| --- | --- |
| Navigation | 1 |
| Route resolution | 0, 1 |
| Browser refresh | 1, 3 |
| Founder authentication | 1 |
| Client registry retrieval | 2, 3 |
| Create-client flow | 3 |
| Synthetic-client isolation | 3, 8 |
| Client record opening | 4 |
| Intake projection | 4 |
| Review queue retrieval | 5 |
| Review decisions | 5 |
| Quote state | 4 |
| Operations state | 6 |
| Communication permissions | 7 |
| System health reporting | 8 |
| Error recovery | 2, 9 |
| Mobile overlays | 1, 9 |
| Desktop inspector behaviour | 3 |
| Keyboard access | 1, 9 |
| Screen-reader access | 1, 9 |
| Responsive layout | 9 |
| No horizontal overflow | 1, 9 |
| No accidental data mutation | 0, 4 |
| No regressions in persistent artifact links | 3 |

## Dependencies on other workstreams

| Item | Owner | Effect if not done |
| --- | --- | --- |
| G-03 events persisted | Persistence workstream | Activity and history reset on restart (labelled) |
| G-04 ops, approvals, client actions persisted | Persistence workstream | Mutations carry the "not saved on restart" notice |
| G-07 pipeline and detail read from Supabase | Persistence workstream | Inspector content may be stale after a restart |
| G-09 send intents persisted | Persistence workstream | Delivery history resets on restart (labelled) |
| G-01 `list` enrichment | Backend sprint (founder approval) | Registry needs N detail calls or `pipeline` |
| G-05, G-06, G-11 | Founder + backend | Actions stay unavailable / client-side only |
| G-08 probes | Optional backend | API health and Stripe webhook stay UNVERIFIED |
