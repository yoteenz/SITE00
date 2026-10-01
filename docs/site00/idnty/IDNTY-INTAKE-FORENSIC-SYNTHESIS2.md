# IDNTY Intake Forensic Synthesis 2

**Sprint:** `P0.SITE00.IDNTY-INTAKE-FORENSIC-SYNTHESIS2`  
**Date:** 2026-09-30  
**Mode:** Read + report only — no production changes.

Companion machine artifacts: `IDNTY-INTAKE-CONTENT-DISPOSITION.json`, `IDNTY-BUILD-READY-VERIFICATION-GAP.md`, `IDNTY-ASSESSMENT-LORE-PERSONALITY-BOUNDARY.md`, `IDNTY-INTAKE-CHAMBER-CONTENT-INPUT.json`, `IDNTY-INTAKE-MIGRATION-IMPACT.json`.

---

## A. Executive forensic verdict

Public IDNTY today is a **four-branch discovery assessment** (15 steps) fronted by **`/idnty/state`** (same 00–03 semantics as the new Diagnostic). It **autosaves drafts** to `site00_idnty_submissions` but the **public happy path never calls `intakeSync.submit()`** — review CTAs only navigate to **`discovery-result`**. **BUILD READY** copy promises verification; implementation is **self-reported checkbox inventory** (mobile) and **BLDR-scoping questions** (desktop steps) with **no uploads, no authority record, no SUBMITTED lifecycle** on happy path. **REFINE** is the most identity-native branch (used by `diagnoseIdentityNeed`). **FOUNDATION `project`/`goal`** primarily feed **builder experience-class diagnosis** and **BLDR localStorage prefill**, not identity diagnosis. **Lore (19) + Personality (15)** are **project-scoped**, post-activation — not part of public assessment.

**Verdict:** Safe to make Diagnostic the state front door; **do not collapse** the 15 questions without disposition review. **BUILD READY** requires **new verification capability** before product promise matches code.

---

## D. Section F — Shared / Unique matrix

| # | State | Step ID | Question | Classification | Same schema elsewhere | Consumers | Rec influence | BLDR influence |
|---|-------|---------|----------|----------------|---------------------|-----------|---------------|----------------|
| 1 | 00 | project | WHAT ARE YOU BUILDING? | STATE_SPECIFIC | — | `compileBuilderScopeDiagnosis` (experienceClass); BLDR prefill `type` | None (identity fixed FOUNDATION) | **HIGH** |
| 2 | 00 | goal | WHAT IS THE PRIMARY GOAL? | STATE_SPECIFIC | — | Display/recommendation additions only | Low | Low |
| 3 | 00 | audience | WHO IS YOUR AUDIENCE? | STATE_SPECIFIC | Lore `role`/`feeling` (different) | BLDR prefill `content` prefix | Low | Medium |
| 4 | 00 | timeline | WHAT IS YOUR TIMELINE? | SHARED_MULTI_STATE | 02, 03 `timeline` | BLDR prefill `timeline`; commercial context | Low | Medium |
| 5 | 00 | budget | WHAT IS YOUR BUDGET RANGE? | STATE_SPECIFIC | — | BLDR prefill `budget`; commercial | Low | Medium |
| 6 | 01 | assets | WHAT DO YOU ALREADY HAVE? | STATE_SPECIFIC | Mobile 03 landing (duplicate UX) | `diagnoseIdentityNeed` indirect | Medium | Low |
| 7 | 01 | cohesion-diagnostic | HOW WOULD YOU DESCRIBE… | STATE_SPECIFIC | — | **`diagnoseIdentityNeed`** | **HIGH** | None |
| 8 | 01 | other-specify | OTHER (PLEASE SPECIFY) | STATE_SPECIFIC | — | Display/admin draft | Low | None |
| 9 | 01 | gaps | WHAT FEELS INCOMPLETE? | STATE_SPECIFIC | — | **`diagnoseIdentityNeed`** (≥3) | **HIGH** | None |
| 10 | 02 | pathways | HOW WE CAN HELP YOU EVOLVE | STATE_SPECIFIC | Landing pre-select | Display; identity refinement class | Medium | Mixed options |
| 11 | 02 | goals | WHAT ARE YOUR EVOLUTION GOALS? | STATE_SPECIFIC | — | Display | Low | None |
| 12 | 02 | timeline | WHAT IS YOUR TIMELINE? | SHARED_MULTI_STATE | 00, 03 | BLDR prefill | Low | Medium |
| 13 | 03 | services | HOW CAN SITE 00 BUILD… | STATE_SPECIFIC | — | `diagnoseIdentityNeed` (build-ready branch) | Low | **HIGH** (BLDR-like) |
| 14 | 03 | scope | DESCRIBE WHAT NEEDS TO BE BUILT | STATE_SPECIFIC | — | Display | None | **HIGH** |
| 15 | 03 | timeline | WHAT IS YOUR TIMELINE? | SHARED_MULTI_STATE | 00, 02 | BLDR prefill | Low | Medium |

**Timeline normalization note:** Three separate step records in branch manifests; **same option array** (`IDNTY_TIMELINE_OPTIONS`), **same key** `timeline`, persisted under `answers.{stateSlug}.timeline` — not a single shared field today.

**Process strip:** SHARED_ALL_STATES (UI chrome, not a question).

**Landing/scanner duplicates (H7):** TECHNICAL_DUPLICATE / SEMANTIC_DUPLICATE — pre-fill first step or navigate; see Hypothesis 7 table in synthesis receipt.

---

## E. Section G — Diagnostic overlap (strict)

| Step ID | State | Classification | Why |
|---------|-------|----------------|-----|
| *(state slug)* | all | **DUPLICATED_BY_DIAGNOSTIC** | Diagnostic selects 00–03 ↔ assessment branch slug; removes `/idnty/state` re-pick only. |
| project | 00 | NOT_INFERABLE_FROM_DIAGNOSTIC | Build-type multi-select not implied by FOUNDATION declaration. |
| goal | 00 | NOT_INFERABLE_FROM_DIAGNOSTIC | |
| audience | 00 | NOT_INFERABLE_FROM_DIAGNOSTIC | |
| timeline | 00,02,03 | NOT_INFERABLE_FROM_DIAGNOSTIC | |
| budget | 00 | NOT_INFERABLE_FROM_DIAGNOSTIC | |
| assets | 01 | PARTIALLY_INFERABLE_FROM_DIAGNOSTIC | 01 implies partial brand; **not** which assets. |
| cohesion-diagnostic | 01 | NOT_INFERABLE_FROM_DIAGNOSTIC | Scattered/cohesive/missing not determined by declaration alone. |
| other-specify | 01 | NOT_INFERABLE_FROM_DIAGNOSTIC | |
| gaps | 01 | PARTIALLY_INFERABLE_FROM_DIAGNOSTIC | “Incomplete/cohesive” theme only; not which gaps. |
| pathways | 02 | PARTIALLY_INFERABLE_FROM_DIAGNOSTIC | EVOLVE intent; not which pathways. |
| goals | 02 | NOT_INFERABLE_FROM_DIAGNOSTIC | |
| services | 03 | PARTIALLY_INFERABLE_FROM_DIAGNOSTIC | BUILD READY intent; not capability mix. |
| scope | 03 | NOT_INFERABLE_FROM_DIAGNOSTIC | |

**Removable without information loss after Diagnostic:** explicit **state picker** at `/idnty/state` and **branch-choice UI** that only re-asks declaration (not step-level answers).

---

## F–H, I, J

See dedicated files: `IDNTY-BUILD-READY-VERIFICATION-GAP.md`, `IDNTY-ASSESSMENT-LORE-PERSONALITY-BOUNDARY.md`, and sections in this doc matching receipt I–J (submission trace documented in FORENSIC-MAP + verified: `IdntyAssessmentReviewPage.handleSubmit` → navigate only; `completeAssessment` only `IdentityLoreWorldReview`).

---

## Hypothesis test results

| # | Result | Evidence |
|---|--------|----------|
| H1 | **Supported (B+C+D)** | `diagnoseIdentityNeed` ignores `project` for 00; `IdntyDiscoveryResultPage` passes `answers.project` to `compileBuilderScopeDiagnosis`; `readIdntyPrefill` maps `project`→BLDR `type`. |
| H2 | **Supported** | `cohesion-diagnostic`, `gaps` drive `diagnoseIdentityNeed`; `other-specify` optional, always in step order, no downstream logic found. |
| H3 | **Supported (mixed options)** | Pathway option classification in CONTENT-DISPOSITION.json per option. |
| H4 | **Supported** | Steps are services/scope/timeline; editorial promises verify identity system. |
| H5 | **Supported (no real verification)** | `computeInventorySummary` = selected/total %; ≥60% → `/bldr/start`; no uploads; statuses computed in UI only. |
| H6 | **Supported** | All 15 NOT_INFERABLE or PARTIAL only — none fully duplicated except state slug. |
| H7 | **Supported** | Landing `persistSelection` writes first step; 00 mobile scanner navigates to steps — **D MERGE / A TRANSITION** recommendations. |
| H8 | **Supported** | Review CTAs navigate; no submit; mobile label `CONTINUE TO BRAND WORLD` → `discovery-result`. |

---

## O. Proposed future flow feasibility

| Arrow | Status |
|-------|--------|
| ORIGIN → IDNTY | SUPPORTED_BY_CURRENT_ARCHITECTURE |
| FOUR-STATE DIAGNOSTIC → slug | PARTIALLY_SUPPORTED (exists at `/idnty/state`; new visual Diagnostic not wired) |
| slug → INTAKE CHAMBER | PARTIALLY_SUPPORTED (branch configs exist; chamber not) |
| REVIEW → REAL SUBMISSION | REQUIRES_NEW_PRODUCT_CAPABILITY (wire submit like BLDR) |
| 00–02 → custom quote | PARTIALLY_WIRED (`CUSTOM_QUOTE`, no checkout on path) |
| 03 → VERIFICATION → VERIFIED → BLDR | REQUIRES_NEW_PRODUCT_CAPABILITY |

---

*Full content disposition, migration, and chamber input: JSON companions in this folder.*
