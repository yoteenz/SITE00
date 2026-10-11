# Builder intake implementation gaps V1

Gap register for follow-on sprints. **No code changes in audit sprint.**

---

## Summary counts

| Classification | Count |
| --- | --- |
| **CRITICAL** (P0) | 4 |
| **HIGH** | 5 |
| **MEDIUM** | 4 |
| **LOW** | 2 |

**Duplicated intake fields:** **5 clusters** (see DATA CONTRACT doc) — not 5 individual fields, but 5 semantic overlaps between legacy questionnaire, spatial rooms, and IDNTY.

---

## Gap register

### GAP-INT-001 — Spatial studio not bound to canonical intake

| | |
| --- | --- |
| **Description** | `/bldr/studio` never calls `useIntakeSync` / `startIntake`. |
| **Current** | localStorage only. |
| **Expected** | One `site00_bldr_intakes` row per session; autosave `SpatialBuilderState` + `BuilderSelection`. |
| **Source** | `useBuilderSpatialSession.ts`, `BldrSpatialStudioPage.tsx`, `useIntakeSync.ts` |
| **Severity** | CRITICAL |
| **Client impact** | Lost progress cross-device; founder never sees studio config. |
| **Owner** | COMPOSER |
| **Dependencies** | DATA CONTRACT submitted payload shape |
| **Sprint** | `P0.SITE00.BUILDER.INTAKE-SPATIAL-SERVER-BINDING.V1` |
| **Priority** | P0 |

### GAP-INT-002 — Submit for review is a no-op (spatial)

| | |
| --- | --- |
| **Description** | Submit button only re-saves localStorage. |
| **Current** | `persist(state)` on click. |
| **Expected** | `submitIntake` with blueprint snapshot when `submission_ready`. |
| **Source** | `BldrSpatialStudioPage.tsx`, `blueprintSessionContract.ts` |
| **Severity** | CRITICAL |
| **Client impact** | No founder queue entry; false confidence. |
| **Owner** | COMPOSER |
| **Dependencies** | GAP-INT-001 |
| **Sprint** | `P0.SITE00.BUILDER.BLUEPRINT-SUBMIT-WIREUP.V1` |
| **Priority** | P0 |

### GAP-INT-003 — Server draft not hydrated into Builder UI

| | |
| --- | --- |
| **Description** | Resume links go to routes but UI reads localStorage first. |
| **Current** | Guest/account pages show JSON; CONTINUE → `/bldr` or `sourceRoute`. |
| **Expected** | Load `draftPayload` into spatial or legacy UI on resume. |
| **Source** | `IntakeGuestAccessPage.tsx`, `AccountIntakeDetailPage.tsx`, `useBldrAssessment.ts` |
| **Severity** | CRITICAL |
| **Client impact** | “Saved on server” UX lie for multi-device. |
| **Owner** | COMPOSER (+ Opus resume UX) |
| **Dependencies** | GAP-INT-001 |
| **Sprint** | `P0.SITE00.BUILDER.INTAKE-RESUME-HYDRATION.V1` |
| **Priority** | P0 |

### GAP-INT-004 — Legacy submit payload ≠ Blueprint contract

| | |
| --- | --- |
| **Description** | Assessment submit stores questionnaire `answers`, not `BuilderSelection`. |
| **Current** | `submitIntake` copies draft as-is. |
| **Expected** | Submitted artifact includes blueprint + estimate version for founder review. |
| **Source** | `useBldrAssessment.ts`, `intakeService.submitIntake` |
| **Severity** | CRITICAL |
| **Client impact** | Founder cannot review estimator-aligned blueprint from primary live path. |
| **Owner** | COMPOSER |
| **Dependencies** | Mapping legacy → `BuilderSelection` or route all users to spatial |
| **Sprint** | `P0.SITE00.BUILDER.INTAKE-PAYLOAD-CANONICALIZATION.V1` |
| **Priority** | P0 |

### GAP-INT-005 — Dual configuration stores (local keys)

| | |
| --- | --- |
| **Description** | Assessment key vs spatial studio key vs server `answers`. |
| **Current** | Three sources of truth possible. |
| **Expected** | Server draft authoritative; locals are cache. |
| **Source** | `BLDR_ASSESSMENT_STORAGE_KEY`, `site00.bldr.spatialStudio.v1` |
| **Severity** | HIGH |
| **Client impact** | Conflicting configs; wrong estimate shown. |
| **Owner** | COMPOSER |
| **Dependencies** | GAP-INT-001, GAP-INT-003 |
| **Sprint** | Same as resume/binding |
| **Priority** | P1 |

### GAP-INT-006 — Post-submit client revision loop

| | |
| --- | --- |
| **Description** | No founder “request changes” → client edit → resubmit for Builder blueprint. |
| **Current** | Autosave rejected after submit. |
| **Expected** | Product-defined reopen or new revision intake linked to same `project_id`. |
| **Source** | `intakeService.autosaveIntake`, docs `BUILDER_BLUEPRINT_AND_ESTIMATE.md` |
| **Severity** | HIGH |
| **Client impact** | Stuck after submit; email/manual workaround. |
| **Owner** | COMPOSER + FOUNDER (policy) |
| **Dependencies** | GAP-INT-002 |
| **Sprint** | `P1.SITE00.BUILDER.BLUEPRINT-REVISION-LIFECYCLE.V1` |
| **Priority** | P1 |

### GAP-INT-007 — Founder refined estimate / quote stages

| | |
| --- | --- |
| **Description** | Estimator supports document kinds in docs; Builder intake API does not store founder overrides. |
| **Current** | INITIAL RANGE only via live estimator on client. |
| **Expected** | REFINED RANGE after review recorded with version lineage. |
| **Source** | `BUILDER_BLUEPRINT_AND_ESTIMATE.md`, `clientView.ts` |
| **Severity** | HIGH |
| **Client impact** | Client cannot see approved refined numbers in product. |
| **Owner** | COMPOSER |
| **Dependencies** | Submission + admin review |
| **Sprint** | `P1.SITE00.BUILDER.ESTIMATE-REVISION-RECORD.V1` |
| **Priority** | P1 |

### GAP-INT-008 — Builder post-submit commercial / project activation

| | |
| --- | --- |
| **Description** | IDNTY runs `activateIdentityCommercialAfterIntakeSubmit`; BUILDER has no equivalent. |
| **Current** | Manual convert in admin. |
| **Expected** | Defined handoff to project workspace with scope artifact. |
| **Source** | `intakeService.submitIntake`, `identityCommercial.ts` |
| **Severity** | HIGH |
| **Client impact** | Manual re-entry for production onboarding. |
| **Owner** | COMPOSER + FOUNDER |
| **Dependencies** | GAP-INT-002 |
| **Sprint** | `P1.SITE00.BUILDER.PROJECT-ACTIVATION.V1` |
| **Priority** | P1 |

### GAP-INT-009 — Admin dual surfaces

| | |
| --- | --- |
| **Description** | Canonical intake inbox vs legacy BLDR INTAKE admin pages. |
| **Current** | Both operate on related data; different actions. |
| **Expected** | Single founder workspace for blueprint review (product decision). |
| **Source** | `IntakeDetailPage.tsx`, `BldrIntakesPage.tsx`, `adminOperations.ts` |
| **Severity** | MEDIUM |
| **Client impact** | Founder confusion, duplicate review. |
| **Owner** | FOUNDER + COMPOSER |
| **Dependencies** | None |
| **Sprint** | `P2.SITE00.BUILDER.ADMIN-INBOX-CONSOLIDATION.V1` |
| **Priority** | P2 |

### GAP-INT-010 — `sourceRoute` / deep resume for studio

| | |
| --- | --- |
| **Description** | Intake start from studio should record `/bldr/studio` + intake id query. |
| **Current** | Legacy starts record classification path only. |
| **Expected** | Guest resume opens exact studio session. |
| **Source** | `useBldrAssessment.startClass`, guest resume pages |
| **Severity** | MEDIUM |
| **Client impact** | Wrong screen after email link. |
| **Owner** | COMPOSER |
| **Dependencies** | GAP-INT-001 |
| **Sprint** | Binding sprint |
| **Priority** | P1 |

### GAP-INT-011 — E2E intake + blueprint tests

| | |
| --- | --- |
| **Description** | No automated test for spatial submit → admin payload shape. |
| **Current** | Unit tests for mapping/snapshot only. |
| **Expected** | Handler test with memory store submitting canonical payload. |
| **Source** | `spatialStudio.test.ts`, `intakeService.test.ts` |
| **Severity** | MEDIUM |
| **Client impact** | Regressions undetected. |
| **Owner** | COMPOSER |
| **Dependencies** | GAP-INT-002 |
| **Sprint** | Wireup sprint |
| **Priority** | P1 |

### GAP-INT-012 — Approved visual experience

| | |
| --- | --- |
| **Description** | JPG fidelity spatial UX. |
| **Current** | Non-authoritative scaffold. |
| **Expected** | Opus implementation per wireframes. |
| **Source** | `components/bldr/spatial-studio/*`, wireframes in docs |
| **Severity** | MEDIUM (experience) |
| **Client impact** | Not production-ready UX. |
| **Owner** | OPUS |
| **Dependencies** | Hooks stable (see OPUS handoff) |
| **Sprint** | Original visual sprint |
| **Priority** | P0 experience |

### GAP-INT-013 — Production assets

| | |
| --- | --- |
| **Description** | Icons, architectural imagery for Build Object. |
| **Current** | Parameter contract only. |
| **Expected** | Grok-injected assets. |
| **Source** | `buildObjectContract.ts` |
| **Severity** | LOW |
| **Owner** | GROK |
| **Sprint** | Asset sprint when directed |
| **Priority** | P2 |

### GAP-INT-014 — Builder invitation product

| | |
| --- | --- |
| **Description** | Personalized invite links into Builder/intake. |
| **Current** | Guest access after intake started. |
| **Expected** | Founder-issued invite → pre-bound project context. |
| **Source** | N/A |
| **Severity** | LOW |
| **Owner** | FOUNDER + COMPOSER |
| **Priority** | P3 |

---

## Missing contracts (summary list)

1. Server autosave schema for `SpatialBuilderState` + `BuilderSelection` in `answers`
2. Submit validation mirroring `submission_blockers`
3. Resume hydration contract (server → hook initial state)
4. Submitted blueprint snapshot + frozen estimate record
5. Founder revision / resubmit state machine
6. Builder project activation hook (parity with IDNTY commercial activation scope)

---

## Critical gaps (short list)

- GAP-INT-001, GAP-INT-002, GAP-INT-003, GAP-INT-004
