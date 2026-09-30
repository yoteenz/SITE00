# IDNTY Intake — Forensic Map (Product Truth)

**Sprint:** `P0.SITE00.IDNTY-INTAKE-FORENSIC-MAP1`  
**Mode:** Forensic audit only — no production changes in this sprint artifact set.  
**Evidence standard:** Claims cite implementation paths; unproven items marked **UNKNOWN**.

Machine-readable companions (same folder):

- `IDNTY-INTAKE-QUESTION-INVENTORY.json`
- `IDNTY-INTAKE-ROUTE-MAP.json`
- `IDNTY-INTAKE-DATA-LINEAGE.json`
- `IDNTY-DIAGNOSTIC-OVERLAP-MATRIX.json`

---

## 1. Executive functional map

**Today, public IDNTY intake is a four-branch assessment wizard**, not a single linear questionnaire. The user first declares **which of four brand states** matches them (aligned with 00–03 Foundation / Refine / Evolve / Build Ready copy in `identity.ts` and `idnty-diagnostic.ts`). That choice routes into **state-specific step configs** in `idnty-assessment.ts` (15 questions total across branches). The live happy path is:

**State picker → landing → step(s) → review → discovery-result → recommended CTAs (BLDR / support).**

**Not on the public happy path today:**

- **`/idnty/:slug/complete`** exists but review navigates to **`discovery-result`**, not `complete`, and **`completeAssessment()`** (server `submit()`) is only invoked from **`IdentityLoreWorldReview`** — a component **not mounted** on public `/idnty/*` routes.
- **Brand World (19 lore) + Personality (15) registries** are **live on project routes** (`/projects/:slug/calibrate`, `/projects/:slug/personality-replay/*`). Public URLs under `/idnty/:slug/world/*` and `/personality/*` render **`PostPurchaseIntelligenceRedirect`** (display gate, not intake).

**Commercial:** Investment tiers and package rows are **DISPLAYED / CONFIGURED** as **`CUSTOM_QUOTE`** — not payment-ready checkout on the assessment happy path.

**Build Ready → BLDR:** Mobile diagnostic CTA **`build-ready` → `/bldr/start`** (`resolveIdntyStateDestination`). There is **no persisted “identity verified” flag** consumed by BLDR beyond optional **localStorage prefill** (`useBldrAssessment.readIdntyPrefill` / `readIdntyLoreSnapshot`).

---

## 2. Route map

| Route | Surface | Component | Auth / gates | Status |
|-------|---------|-----------|--------------|--------|
| `/idnty` | Mobile + desktop artboard | `Site00IdntyPage` | None | LIVE |
| `/idnty/state` | State selection | `IdntyStatePage` | None | LIVE |
| `/idnty/state/desktop` | Desktop preview | `IdntyStatePage` | None | LIVE |
| `/identity` | Alias | → `/idnty` | None | LEGACY_ALIAS |
| `/idnty/:stateSlug` | Assessment landing | `IdntyAssessmentLandingPage` | None | LIVE |
| `/idnty/:stateSlug/:stepId` | Step | `IdntyAssessmentStepPage` / mobile calibration | None | LIVE |
| `/idnty/:stateSlug/review` | Review | `IdntyAssessmentReviewPage` | None | LIVE |
| `/idnty/:stateSlug/discovery-result` | Discovery UI | `IdntyDiscoveryResultPage` | None | LIVE |
| `/idnty/:stateSlug/complete` | Complete + guest email | `IdntyAssessmentCompletePage` | None | REACHABLE, off happy path |
| `/idnty/:stateSlug/world/*` | Lore (public URL) | `PostPurchaseIntelligenceRedirect` | Post-purchase messaging | DISPLAY GATE |
| `/idnty/:stateSlug/personality/*` | Personality (public URL) | `PostPurchaseIntelligenceRedirect` | Same | DISPLAY GATE |
| `/idnty/sign-in-security` | Account | `IdntySignInSecurityPage` | None | LIVE |
| `/projects/:projectSlug/calibrate` | Project lore | `ProjectLoreCalibrationPage` | Project context | LIVE |
| `/projects/:projectSlug/personality-replay/*` | Personality replay | `ProjectPersonalityReplayPage` | Project context | LIVE |

**Brand state → assessment slug** (`idnty-assessment-brand-map.ts`):

| Brand card ID | Assessment slug |
|---------------|-----------------|
| `starting-at-zero` | `starting-at-zero` |
| `some-pieces` | `some-pieces-exist` |
| `ready-evolution` | `ready-for-evolution` |
| `build-ready` | `build-ready` |

**Per-state flow (implementation):**

```
ENTRY /idnty/state (or Origin → IDNTY, or /idnty hub)
  → pick brand state (desktop grid or IdntyMobileDiagnostic)
  → resolveIdntyStateDestination:
       build-ready → /bldr/start
       else → /idnty/{assessment-slug}[/desktop]
LANDING /idnty/{slug}
  → startState() + optional landing grid/list pre-selection
STEP(s) /idnty/{slug}/{stepId}
  → setStepAnswers + markStepComplete + intakeSync.autosave
REVIEW /idnty/{slug}/review
  → mobile: CONTINUE TO BRAND WORLD label → navigates discovery-result (not world)
DISCOVERY-RESULT /idnty/{slug}/discovery-result
  → diagnoseIdentityNeed + compileProjectRecommendation
  → CTAs from state.recommendedActions (BLDR state, support)
COMPLETION (optional route) /idnty/{slug}/complete
  → guest email capture; not wired from review submit
DOWNSTREAM
  → Manual links to BLDR/support; project lore/personality separate
```

**Legacy:** slug `needs-cohesion` redirects to `some-pieces-exist` with step remap (`migrateLegacyNeedsCohesionSlug`).

---

## 3. Complete question inventory (verbatim)

**Counts:**

| Registry | Steps / questions | Reachability |
|----------|-------------------|--------------|
| Public assessment (`IDNTY_ASSESSMENT_STATES`) | **15** (5+4+3+3) | LIVE |
| Lore (`IDNTY_LORE_QUESTIONS`) | **19** | LIVE project; UNREACHABLE public `/idnty/.../world` |
| Personality (`IDNTY_PERSONALITY_QUESTIONS`) | **15** | LIVE project replay; UNREACHABLE public `/idnty/.../personality` |

Full per-question fields (IDs, labels, options, validation, storage keys) are in **`IDNTY-INTAKE-QUESTION-INVENTORY.json`**. Below: verbatim assessment copy from `src/site00/config/idnty-assessment.ts`.

### 3.1 STARTING AT ZERO (`starting-at-zero`) — 5 steps

| ID | Title | Subtitle | Type | Required |
|----|-------|----------|------|----------|
| `project` | WHAT ARE YOU BUILDING? | SELECT ALL THAT APPLY. | multi | yes |
| `goal` | WHAT IS THE PRIMARY GOAL? | WHAT DOES SUCCESS LOOK LIKE? | multi | yes |
| `audience` | WHO IS YOUR AUDIENCE? | DESCRIBE YOUR IDEAL CUSTOMER OR USER. | textarea | yes |
| `timeline` | WHAT IS YOUR TIMELINE? | — | single | yes |
| `budget` | WHAT IS YOUR BUDGET RANGE? | — | single | yes |

Options: `IDNTY_PROJECT_TYPE_OPTIONS`, `IDNTY_GOAL_OPTIONS`, `IDNTY_TIMELINE_OPTIONS`, `IDNTY_BUDGET_OPTIONS` (same file).

### 3.2 SOME PIECES EXIST (`some-pieces-exist`) — 4 steps

| ID | Title | Type | Required |
|----|-------|------|----------|
| `assets` | WHAT DO YOU ALREADY HAVE? | multi | yes |
| `cohesion-diagnostic` | HOW WOULD YOU DESCRIBE WHAT YOU HAVE TODAY? | single | yes |
| `other-specify` | OTHER (PLEASE SPECIFY) | textarea | no |
| `gaps` | WHAT FEELS INCOMPLETE? | multi | no |

Options: `IDNTY_EXISTING_ASSET_OPTIONS`, `IDNTY_PIECES_DIAGNOSTIC_OPTIONS`, `IDNTY_COHESION_GAP_OPTIONS`.

### 3.3 READY FOR EVOLUTION (`ready-for-evolution`) — 3 steps

| ID | Title | Type | Required |
|----|-------|------|----------|
| `pathways` | HOW WE CAN HELP YOU EVOLVE | multi | yes |
| `goals` | WHAT ARE YOUR EVOLUTION GOALS? | textarea | yes |
| `timeline` | WHAT IS YOUR TIMELINE? | single | yes |

### 3.4 BUILD READY (`build-ready`) — 3 steps

| ID | Title | Type | Required |
|----|-------|------|----------|
| `services` | HOW CAN SITE 00 BUILD YOUR VISION? | multi | yes |
| `scope` | DESCRIBE WHAT NEEDS TO BE BUILT | textarea | yes |
| `timeline` | WHAT IS YOUR TIMELINE? | single | yes |

**Validation (all assessment steps):** `IdntyStepForm.validateStep` — required textarea: **`THIS FIELD IS REQUIRED.`**; required select: **`SELECT AT LEAST ONE OPTION.`**

**Lore + personality verbatim:** see `shared/site00-brand-lore/idnty-lore-questions.ts` and `idnty-personality-questions.ts` (exported in JSON inventory).

---

## 4. Intake hierarchy

**TOTAL SECTIONS (public assessment):** 4 (one per `IdntyAssessmentStateId`)  
**TOTAL STEPS (public):** 15  
**TOTAL QUESTIONS (all registries):** 49 (15 + 19 + 15)

Each **section** = one brand state config (`IdntyAssessmentStateConfig`):

- **Purpose:** Declared in `declaration` + `editorialBody` per state.
- **Completion criteria:** All `required` steps pass validation; user reaches review then discovery-result. No server submit on that path.
- **State dependencies:** `useIdntyAssessment.startState(stateId)` sets `identityState`; answers keyed by state id under `answers[stateId][stepId]`.

**Linear vs conditional:**

- **Linear** within each state's `steps[]` order.
- **Conditional:** `other-specify` and `gaps` optional on some-pieces-exist; lore flow uses **`resolveActiveLoreSteps`** (adaptivity) on project calibrate — not on public assessment.
- **Hidden/system:** `diagnoseIdentityNeed` derives classification from answers (not shown as a question).
- **Derived:** `compileProjectRecommendation`, `compileBuilderScopeDiagnosis` on discovery-result page.

---

## 5. Branching and conditional logic

**Top-level branch (user-visible):** Four brand states — **already equivalent** to planned Diagnostic 00–03 labels (`IDNTY_BRAND_STATES`, `IDNTY_INVESTMENT_ACTIONS`, `IDNTY_HANDOFF_COPY`).

**Within some-pieces-exist:**

```
IF cohesion-diagnostic IN (scattered-pieces, missing-key-pieces)
  THEN diagnoseIdentityNeed → IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED
ELSE IF gaps selected count >= 3
  THEN IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED
ELSE
  THEN IDENTITY_REFINEMENT_RECOMMENDED
```

**Within build-ready:**

```
IF services selection includes identity/brand-ish ids (string match)
  THEN IDENTITY_REFINEMENT_RECOMMENDED
ELSE
  THEN IDENTITY_NOT_REQUIRED
```

**starting-at-zero:** always `IDENTITY_FOUNDATION_RECOMMENDED`.  
**ready-for-evolution:** always `IDENTITY_REFINEMENT_RECOMMENDED`.

**Pricing/package:** No branch changes price at runtime; tiers are static display (`IDNTY_INVESTMENT_TIERS`).

**Routing:**

- `build-ready` brand card → **`/bldr/start`** (skips assessment entry).
- Other states → assessment slug path.

---

## 6. Asset / upload inventory

| Asset type | Collection method | Upload? | Storage |
|------------|-------------------|---------|---------|
| Logo, colors, typography, etc. | Multi-select `IDNTY_EXISTING_ASSET_OPTIONS` | **No file upload** | Answer ids in localStorage + draftPayload |
| Reference / moodboard / files | **Not implemented** in IDNTY assessment UI | No | — |

**File upload in IDNTY intake components:** **NONE FOUND** (grep / component review).

---

## 7. Brand intelligence taxonomy (implementation-backed)

| Category | Assessment questions |
|----------|---------------------|
| Project / deliverable type | `project` (00) |
| Goals | `goal` (00), `goals` (02) |
| Audience | `audience` (00) |
| Timeline | `timeline` (00, 02, 03) |
| Budget | `budget` (00) |
| Existing assets (self-reported) | `assets`, `other-specify` (01) |
| Cohesion / maturity | `cohesion-diagnostic`, `gaps` (01) |
| Evolution pathways | `pathways` (02) |
| Build scope / services | `services`, `scope` (03) |
| Emotional / worldview | Lore: `feeling`, `role`, `belief`, … (19 steps) |
| Personality / voice behavior | Personality: 15 steps |
| Competitive / positioning | **Not dedicated assessment fields** (partial via lore `enemy`, `belief`) |

---

## 8. Package / service / pricing logic

| Item | Source | Status |
|------|--------|--------|
| IDNTY_INVESTMENT_TIERS | `identity.ts` | DISPLAYED (FROM $2,500 / $1,750 / $3,500 / NO IDNTY PURCHASE) |
| listIdentityCommercialPackages | `shared/site00-identity-commercial/inventory.ts` | CONFIGURED, `commercialMode: 'CUSTOM_QUOTE'` |
| Query param commercial context | `identityCommercialContext.ts` | PARTIALLY WIRED into draftPayload |
| site00_idnty_submissions.commercial_state | migration `20260929160000` | CONFIGURED (DB) |
| identity-commercial API | `api/_lib/site00Intakes/identityCommercial.ts` | PARTIALLY WIRED |
| Stripe / checkout on assessment happy path | — | **NOT PAYMENT READY** (no checkout step in review/discovery) |

**Payment provider on public intake path:** **UNKNOWN / not wired** for self-serve purchase.

---

## 9. Persistence / save / resume

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Anonymous | localStorage `site00_idnty_assessment_v1` | Full record: answers, lore, personality, completedSteps, submissionStatus |
| Server draft | `useIntakeSync('IDENTITY','site00-idnty')` | Keys: `site00-idnty-server-intake-id`, guest token; debounced autosave |
| Supabase | `site00_idnty_submissions` | status lifecycle, draft_payload, commercial_state, project_id columns (migrations) |
| Resume | `resumeTarget` in hook | Incomplete draft → `/idnty/{slug}/{currentStep}` |
| Cross-device | Guest email + server intake | Partial; requires guest flow / sign-in for claim — **full cross-device UNKNOWN** |
| Versioning | Storage key `_v1` | No migration beyond needs-cohesion |

**Autosave:** On each `setStepAnswers`, lore/personality updates, and `ensureStarted` on landing.

**Manual save:** "SAVE & EXIT" on starting-at-zero landing → `/idnty` with partial answers persisted.

---

## 10. Review and submission

| Stage | Behavior | Source |
|-------|----------|--------|
| Review | Editable summary, per-step EDIT | `IdentityCalibrationMobileReview`, desktop review page |
| Submit label | "CONTINUE TO BRAND WORLD" | **Misleading** — goes to `discovery-result` |
| discovery-result | Recommendation panel; no payment | `IdntyDiscoveryResultPage` |
| completeAssessment / submit() | Sets submissionStatus + API submit | **Only** `IdentityLoreWorldReview` — **DEAD on public tree** |
| Guest email | On `/complete` and mobile complete component | `IntakeGuestAccessCapture` |
| Project creation | Not automatic on discovery-result | **UNKNOWN** auto-create; commercial bootstrap via separate API |

**LAST QUESTION → REVIEW → discovery-result → (optional CTAs) — no mandatory SUBMITTED intake on happy path.**

---

## 11. Downstream consumers

See **`IDNTY-INTAKE-DATA-LINEAGE.json`**. Summary:

| Consumer | Wiring |
|----------|--------|
| `diagnoseIdentityNeed` / `compileProjectRecommendation` | LIVE |
| Discovery UI | LIVE |
| `useBldrAssessment` localStorage prefill | PARTIAL |
| Admin Intakes / supabaseStore | PARTIAL (data written; ops workflows separate) |
| Project lore / personality pipelines | LIVE (project routes) |
| BLDR mandatory IDNTY | **NO** — build-ready bypasses assessment entry |
| Identity workspace `/projects/:slug/identity` | DISPLAY / module shell — **deep read of assessment answers UNKNOWN** |

---

## 12. Diagnostic duplication analysis

See **`IDNTY-DIAGNOSTIC-OVERLAP-MATRIX.json`**.

**Summary:** Choosing brand state at `/idnty/state` **already duplicates** the planned Westworld Diagnostic outcome (same four codes in `IDNTY_INVESTMENT_ACTIONS`). Step-level questions (project type, assets list, scope, etc.) remain **not** answered by diagnostic alone → **SAFE TO PREPOPULATE: mostly NO**; state slug **YES** if diagnostic replaces state picker.

---

## 13. Foundation / Refine / Evolve matrix

Matrix rows in **`IDNTY-DIAGNOSTIC-OVERLAP-MATRIX.json`** (`foundationRefineEvolveMatrix`).

**Common spine today:** Shared shell (`IdntyAssessmentShell`), shared process strip, shared review/discovery pattern — **but question sets are state-specific**, not one shared spine + modules.

**Could existing configs support spine + modules without changing business truth?** **Analysis-only yes:** lore/personality already shared across states; assessment steps are already partitioned by state id — merging UI spine is a presentation change, not data model change.

---

## 14. Build Ready / BLDR handoff

| Question | Finding |
|----------|---------|
| Identity verified concept? | Copy only: `IDNTY_INVESTMENT_ACTIONS['build-ready'].verified`, `statusLabel: IDENTITY VERIFIED` |
| Who verifies? | **No automated verification** — user self-selects build-ready |
| Upload existing brand kit? | **No upload** on build-ready steps |
| Bypass IDNTY? | **Yes** — routed to `/bldr/start` |
| BLDR requires IDNTY? | **No enforced gate** in code reviewed |
| BLDR reads identity data? | **Partial** — localStorage lore/answers prefill in `useBldrAssessment` |
| Verification persists? | **No dedicated field** — `submissionStatus` local only if user completed lore review path |

**03 BUILD READY → ENTER BLDR:** **Feasible today** via `resolveIdntyStateDestination` → `/bldr/start`; **identity authority handoff to BLDR is weak** (localStorage snapshot, not server-verified canon).

---

## 15. Data model inventory

| Artifact | Location | Status |
|----------|----------|--------|
| `IdntyAssessmentRecord` | `useIdntyAssessment.ts` | ACTIVE |
| `IdntyAssessmentStateConfig` | `idnty-assessment.ts` | ACTIVE |
| `IntakeType`, `IntakeStatus` | `shared/site00-intakes/types.ts` | ACTIVE |
| `site00_idnty_submissions` | Supabase migrations | ACTIVE |
| `IdentityPackageRow` | `shared/site00-identity-commercial/inventory.ts` | ACTIVE |
| `IdentityLoreMobileStep` / `IdentityLoreWorldReview` | components/idnty/lore | **UNREACHABLE** (no router import) |
| Legacy `needs-cohesion` | idnty-assessment migrations | LEGACY redirect |

---

## 16. Current UX screen map (functional)

| Screen | Purpose | Primary action | Progress |
|--------|---------|----------------|----------|
| IdntyStatePage | Pick 00–03 state | CTA → assessment or BLDR | Investment rail |
| Assessment landing | Preview steps / pre-select grid | NEXT → first step | Landing type varies |
| Step page | Answer one question | NEXT STEP | Step index / calibration console |
| Review | Confirm answers | CONTINUE TO BRAND WORLD → discovery-result | REVIEW rail |
| Discovery result | Show recommendation | Links to BLDR/support | Complete rail |
| Complete (route) | Summary + email | Recommended actions | ASSESSMENT COMPLETE |
| PostPurchaseIntelligenceRedirect | Block lore/personality on public URL | Return links | N/A |

**Mobile vs desktop:** Desktop uses artboard paths (`/desktop` suffix helpers in `routes.ts`); mobile uses calibration layout components under `components/idnty/calibration/`.

---

## 17. Legacy / dead / duplicate flows

| Flow | Status |
|------|--------|
| `/identity` alias | LIVE redirect |
| `needs-cohesion` slug | REACHABLE → migrates to some-pieces-exist |
| Public `/idnty/.../world`, `/personality` | REACHABLE but **not intake** (redirect component) |
| `IdentityLoreMobileStep`, `IdentityLoreWorldReview` | **DEAD CODE** on public router (exported only) |
| Project lore calibrate | LIVE (canonical lore intake) |
| Project personality replay | LIVE (canonical personality intake) |
| `/idnty/:slug/complete` without submit | **PARTIAL** — UI without happy-path wiring |

---

## 18. Unknowns / founder decisions

1. Should **discovery-result** call **`intakeSync.submit()`** to match BLDR behavior?
2. Is **CONTINUE TO BRAND WORLD** copy intentional or legacy mismatch?
3. Should **build-ready** require asset upload or verification before BLDR?
4. When does **`commercial_state`** transition to paid / entitled?
5. Should **Diagnostic** replace `/idnty/state` picker only, or also skip overlapping steps?
6. **Project auto-bootstrap** from anonymous intake — policy **UNKNOWN**.

---

## 19. Source file index

| Area | Path |
|------|------|
| Assessment config | `src/site00/config/idnty-assessment.ts` |
| Brand states / tiers | `src/site00/config/identity.ts` |
| Diagnostic CTAs | `src/site00/config/idnty-diagnostic.ts` |
| State → slug map | `src/site00/config/idnty-assessment-brand-map.ts` |
| Router | `src/site00/pages/idnty/assessment/IdntyAssessmentRouterPage.tsx` |
| Routes | `src/routes/Site00Routes.tsx`, `src/site00/config/routes.ts` |
| Hook | `src/site00/hooks/useIdntyAssessment.ts`, `useIntakeSync.ts` |
| Forms | `src/site00/components/idnty-assessment/IdntyStepForm.tsx` |
| Review / complete mobile | `src/site00/components/idnty/calibration/*` |
| Discovery | `shared/site00-project-discovery/identityDiagnosis.ts` |
| Lore / personality registry | `shared/site00-brand-lore/idnty-lore-questions.ts`, `idnty-personality-questions.ts` |
| Project lore flow | `src/site00/components/projects/ProjectLoreCalibrationFlow.tsx` |
| BLDR prefill | `src/site00/hooks/useBldrAssessment.ts` |
| Intake API store | `api/_lib/site00Intakes/supabaseStore.ts` |
| Commercial | `shared/site00-identity-commercial/inventory.ts`, `api/_lib/site00Intakes/identityCommercial.ts` |

---

## Product truth summary (canonical)

**TODAY, IDNTY WORKS LIKE THIS:**

```
ENTRY (/idnty, /idnty/state, Origin IDNTY panel)
  ↓
Brand state 00–03 (same semantic as planned Diagnostic)
  ↓
build-ready → /bldr/start OR other → /idnty/{slug} assessment
  ↓
Landing → 3–5 questions (state-specific) → review → discovery-result
  ↓
Recommended CTAs (BLDR state, support) — no checkout on path
```

**WHAT IDNTY KNOWS BEFORE INTAKE:** URL commercial query params (optional); prior localStorage draft; selected brand state after picker.

**WHAT IDNTY COLLECTS DURING INTAKE:** State-specific assessment answers; optionally lore/personality on **project** routes; not files.

**WHAT IDNTY CREATES:** localStorage record; server draft row (autosave); discovery classifications (in-memory display).

**WHAT IDNTY STORES:** `site00_idnty_assessment_v1`, `site00-idnty-server-intake-id`, `site00_idnty_submissions.draft_payload`.

**WHAT IDNTY SENDS DOWNSTREAM:** Partial draft to Supabase; recommendation strings to UI; optional BLDR prefill from localStorage.

**WHAT THE USER SEES AFTER COMPLETION:** Discovery result + links (mobile complete UI mirrors summary); guest email prompt on complete route/components — **not** a purchase confirmation.

---

*Generated for Creative Direction — Intake Chamber redesign prep. Re-run `npx tsx scripts/generate-idnty-forensic-artifacts.ts` to refresh JSON from source configs.*
