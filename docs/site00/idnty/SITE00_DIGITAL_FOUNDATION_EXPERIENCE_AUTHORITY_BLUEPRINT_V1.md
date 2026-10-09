# SITE 00 → IDNTY → DIGITAL FOUNDATION — Canonical Experience Authority Blueprint V1

| | |
|---|---|
| **Sprint** | `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V1-PARENT-CHILD-STATE-COMPONENT-AUTHORITY-AUDIT1` |
| **Agent** | OPUS |
| **Mode** | Product experience audit · visual authority reconciliation · read-only inspection · **no implementation** |
| **Date** | October 8, 2026 |
| **Repository inspected** | `yoteenz/SITE00` @ `8b936c08bfd36eecfd7c0678ebcce2a0f13e3f3d` (Sprint 02 merge, includes Sprint 01 `a7aa125a`) |
| **Production code changed** | None. This document is the only file added. |
| **Inputs** | 7 founder boards (Boards 01–05, Child Boards 04 and 05) plus the Composer contracts listed in §02 |

> **Note on the brief.** The sprint brief arrived cut off partway through **P06 — Required states**. P06 through P15 and both child boards are covered here from three sources: the boards themselves, `SITE00_DIGITAL_FOUNDATION_FIVE_BOARD_HANDOFF.md`, and the implemented contracts. Founder sections lost to the cut-off may change the P06–P15 conclusions. If they do, this document should be amended.

> **Test verification.** The container has no `node_modules`, so `vitest` could not run, and no packages were installed (inspection was read-only). Composer reported 22/22 passing. The two suites do contain 22 cases (`tests/digitalFoundationCommerce.test.ts`: 11, `tests/digitalFoundationOperations.test.ts`: 11), which matches that count. None of those tests import the HTTP handlers (see F-01).

---

## 00 — Executive verdict

1. **The 15-parent structure holds. No new parents are needed.** Both child boards are children of existing parents. **Child Board 04 is mislabelled**: its header reads "13A", but it is a child of **P11 (client completion)**, not P13 (founder pipeline). Its own footer reads `IDNTY / 011`. The canonical IDs are **P11.A Records Index**, **P11.B Record Detail** and **P12.A Digital Location Live**. Child Board 05 correctly maps to **P15.A / P15.B / P15.C**.
2. **The commerce and operations contracts are a strong semantic foundation. The client and founder visual layers do not exist yet.**
   - `DigitalFoundationArtifactPage.tsx` is a single-page functional shell.
   - The founder console is a list page and a detail page.
   - **P13, P14 and P15 have no UI at all**, only API actions.
   - Add-on editing (P04), approvals (P10), records (P11.A/B) and every checkout return state (P05) have no UI.
3. **Several contract defects must be fixed before any visual work. Each would make a faithful board implementation wrong or broken.** Full detail is in §07; the blockers are:
   - **F-01** The public artifact API imports a path outside the repo (`api/site00/digital-foundation-artifact.ts:18`). The module cannot load, so **P01 cannot render**.
   - **F-02** Persistence is in memory only. The Supabase migration exists but nothing uses it, and the operations tables do not exist. One personalized link cannot survive serverless cold starts.
   - **F-03** There is no client-side approval decision. **REQUEST CHANGE on P10 has no contract**, and completing a signature client action with any response marks the task COMPLETE.
   - **F-04** The public payload leaks operations events (escalation reasons, override reasons, scope hashes, task IDs) and the internal referral label.
   - **F-05** The surface resolver sends a **refunded** project back to the PROSPECT entry screen. It can never return COMPLETE or RECOMMENDATION.
   - **F-06** In production without a Stripe key, checkout falls back to a **simulated** session. Failure and refund webhooks cannot be matched to an artifact. A payment against a superseded quote is accepted.
   - **F-07** Quotes that need manual review, quotes that have expired, and custom lines priced at $0 can all be accepted and paid.
   - **F-08** P03 as drawn would **charge for included services**:
     - Checking "Email security — SPF, DKIM, DMARC" maps to `NEED_DNS_SECURITY`, which adds a $150 manual-review add-on.
     - Checking "Device setup" adds a $50 add-on for the device that is already included.
   - **F-09** There is no readiness-clock model. The boards' "3–5 business days **from today**" contradicts doctrine §03, and nothing in the source can state the canonical start condition.
4. **Many visual values are examples and must bind to data.** They include $775, 3–5, 2–3, "MAR 15, 2024 / 2026", task counts, KPI counts, GoDaddy, Google Workspace + Cloudflare, "5 addresses / 8 aliases / 3 devices" and "Anthony Transport LLC".
   - Where the boards contradict each other (P06 says 3–5 while P07 says 2–3 for the same client; P11 says 2024 while P11.A says 2026), the forecast and record contracts decide.
5. **Copy that promises capabilities the source does not have must change:**
   - "We'll notify you…", "Confirmation sent", "Download all records", the registrar documents and SETTINGS tab, "Run verification" as an automated check, and "AUTOMATED" mode labels.
   - The fix is the minimum copy change. The composition stays (§06 conflict tables).

---

## 01 — Authority model used in this document

```
PARENT (P01–P15)                 one of 15 canonical screens; owns a headline + index number
  └─ CHILD (P04.C3, P11.A …)     sheet, sub-view, child screen, or polymorphic body inside a parent
       └─ STATE (P05.S-CANCELED) data-derived condition that changes copy, CTA, or component variant
            └─ COMPONENT (DF-Cnn) reusable visual/interaction unit (§04)
                 └─ ASSET (DF-Ann) icon, object, image, document, font, motion family (§05)
```

The rest of the document uses these identifiers:

| Prefix | Meaning |
|---|---|
| **G-nn** | Gates (§03.4) |
| **F-nn** | Findings (§07). Severity is **BLOCKER / MAJOR / MINOR**. Owner is **COMPOSER** (contract), **OPUS** (visual) or **FOUNDER** (decision). |
| **D-nn** | Founder decisions required (§08) |

**Hierarchy rule applied.** Founder doctrine ranks above the implemented contracts, and both rank above the boards. When a board conflicts with a contract, the composition is preserved and the minimum correction is specified. When a contract conflicts with doctrine (for example, the readiness clock), the contract gap is recorded for Composer and the visual waits for the fix.

**Footer index rule** (derived from the boards; fixes the Child Board 04 collision):

| Screen class | Footer | Index rail |
|---|---|---|
| Parent | `IDNTY / 0NN` | `NN — LABEL` |
| Child screen | `IDNTY / 0NNX` (e.g. `011A`, `015C`) | `NNX — LABEL`, or `← LABEL` for detail views (P11.B) |
| Sheets and overlays | Inherit the parent footer | No rail |

---

## 02 — Source inspection record

Every expected path exists at `8b936c08`. None has moved. Additional files were discovered and inspected.

| Path | Status | Experience relevance |
|---|---|---|
| `docs/site00/idnty/SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1.md` | ✅ read | Product doctrine, flags, Stripe rules, credit, concept-preview label |
| `docs/site00/idnty/SITE00_DIGITAL_FOUNDATION_OPERATIONS_V1.md` | ✅ read | Execution modes, completion gate, visibility classes |
| `docs/site00/idnty/SITE00_DIGITAL_FOUNDATION_FIVE_BOARD_HANDOFF.md` | ✅ read | Parent → contract binding, established visual rhythm |
| `shared/site00-digital-foundation/types.ts` | ✅ read | Every client enum (artifact / payment / project / quote / credit / stage / action / approval) |
| `…/lifecycle.ts` | ✅ read | Allowed artifact transitions |
| `…/surface.ts` *(discovered)* | ✅ read | `resolveArtifactSurface` → parent routing (F-05) |
| `…/commercialConfig.ts` *(discovered)* | ✅ read | $500 base, 2–3 days, 14-day quote expiry, $200 / 30-day credit, `expedited_premium_minor: null` |
| `…/addonCatalog.ts` | ✅ read | 13 add-ons, prices, timeline modifiers, manual-review flags, one dependency |
| `…/quoteEngine.ts` | ✅ read | Lines, totals, versioning, removal validation. **Imports `node:crypto`, so it is not browser-safe** |
| `…/timelineEngine.ts` | ✅ read | Min/max day projection, `timeline_custom_review` |
| `…/projectStages.ts` | ✅ read | 7 stage codes and labels |
| `…/recommendationEngine.ts` | ✅ read | Need flags → add-ons; build recommendation (never returns `CUSTOM_BUILD`) |
| `…/referralSources.ts` | ✅ read | 6 referral kinds |
| `…/featureFlags.ts` *(discovered)* | ✅ read | 4 flags, all default on |
| `…/fixtures/scenarios.ts` *(discovered)* | ✅ read | Commerce fixtures A–M (QA states) |
| `…/operations/types.ts` | ✅ read | Runbook / task / verification / blocker / provider enums |
| `…/operations/runbookGenerator.ts` | ✅ read | Task set, dependency map, verification rules (F-31, F-32) |
| `…/operations/providers.ts` | ✅ read | 8 providers, `live_writes_enabled: false` everywhere |
| `…/operations/verificationEngine.ts` | ✅ read | Manual pass/fail evaluation |
| `…/operations/dependencyEngine.ts` | ✅ read | Readiness promotion |
| `…/operations/blockers.ts` | ✅ read | Blocker extraction (F-34) |
| `…/operations/stageRollup.ts` | ✅ read | Task → stage status (F-21) |
| `…/operations/ownershipGenerator.ts` | ✅ read | Ownership record (F-27) |
| `…/operations/completionGate.ts` *(discovered)* | ✅ read | 5-condition gate |
| `…/operations/forecast.ts` *(discovered)* | ✅ read | Forecast refinement (adds days only) |
| `…/operations/scopeHash.ts` *(discovered)* | ✅ read | Scope hash includes `project_config` (F-36) |
| `…/operations/contracts/p13Pipeline.ts` | ✅ read | `PipelineRow`, attention queries |
| `…/operations/contracts/p14ProjectCommand.ts` | ✅ read | Snapshot + 9 "answers" |
| `…/operations/contracts/p15ExecutionWorkbench.ts` | ✅ read | 7 buckets, mode grouping |
| `…/operations/fixtures/operationsScenarios.ts` *(discovered)* | ✅ read | OPS A–M hints |
| `api/_lib/digitalFoundation/service.ts` | ✅ read | Every commerce, portal and completion mutation |
| `api/_lib/digitalFoundation/operationsEngine.ts` *(discovered)* | ✅ read | Runbook runtime, task actions, P13–P15 views |
| `api/_lib/digitalFoundation/memoryStore.ts` *(discovered)* | ✅ read | **Sole persistence** (F-02) |
| `api/_lib/digitalFoundation/payment/types.ts` | ✅ read | Adapter interface (embedded checkout reserved, unused) |
| `api/_lib/digitalFoundation/payment/stripeHostedCheckout.ts` | ✅ read | Hosted checkout and simulated fallback (F-06) |
| `api/_lib/digitalFoundation/payment/webhookHandler.ts` | ✅ read | 4 handled event types |
| `api/site00/digital-foundation-artifact.ts` *(discovered)* | ✅ read | **Public API: 2 GET + 8 POST actions**. Broken import (F-01) |
| `api/site00/digital-foundation-stripe-webhook.ts` *(discovered)* | ✅ read | Signature-verified webhook |
| `api/admin/site00-foundation.ts` *(discovered)* | ✅ read | **Founder API: 6 GET + 18 POST actions**, admin-gated |
| `src/site00/pages/foundation/DigitalFoundationArtifactPage.tsx` *(discovered)* | ✅ read | Current client shell (`/foundation/:token`) |
| `src/site00/admin/pages/foundation/FoundationAdminListPage.tsx` / `…DetailPage.tsx` *(discovered)* | ✅ read | Current founder shell |
| `src/site00/styles/site00-digital-foundation.css` *(discovered)* | ✅ read | "Functional shell only" (114 lines, system font, no tokens) |
| `src/routes/Site00Routes.tsx:2386` / `Site00AdminRoutes.tsx:560` / `src/site00/config/routes.ts:44` | ✅ read | Route wiring: `Site00Layout` → `Site00PublicRouteShell` |
| `supabase/migrations/20261008160000_site00_digital_foundation_artifact_v1.sql` *(discovered)* | ✅ read | 11 commerce tables. **No operations tables. Not wired** |
| `tests/digitalFoundationCommerce.test.ts`, `tests/digitalFoundationOperations.test.ts` | ✅ read | 22 cases. No handler/route/UI tests |

### 02.1 — Source-to-experience mapping

**Legend:** ✅ contract exists and is usable · ◐ partial or semantically conflicting · ✕ missing.

#### Client parents (P01–P12)

| Parent / child | Read contract (payload field) | Write contract (public action → service) | Status |
|---|---|---|---|
| P01 Entry | `artifact.state`, `lead.*`, `referral_source`, `GET catalog → config` | `open` → `openArtifactByToken` (INVITED→OPENED, `LINK_OPENED`) | ◐ The handler module fails to load (F-01) |
| P02 Intake | `artifact.intake`, `intake_state` | `update-intake` → `updateIntake` | ◐ No validation. The UI never re-loads saved answers into the form. Blank fields overwrite saved values (F-14) |
| P03 Configurator | `intake.needs[]`, `intake.team_size`, `existing_domain` | `update-intake {markComplete:true}` → `completeIntake` → `recommendFromIntake` → quote v1 | ◐ Need → add-on semantics conflict (F-08). There is no reopen path (F-15) |
| P04 Recommendation | `quote` (authoritative), `recommendation` (narrative), `GET catalog` | `update-quote` → `updateQuoteSelections`; `remove-addon` → `removeQuoteAddon` | ◐ No review gate, expiry or dependency validation (F-07, F-17) |
| P05 Review + checkout | `quote`, `acceptance`, `payment_state`, `?checkout=` | `accept-quote` → `acceptQuote`; `start-checkout` → `createCheckoutSession` | ◐ Disclosure copy conflict (F-10). Cancel and pending states are indistinguishable (F-06) |
| P06 Activation | `payment_state`, `events[PAYMENT_CONFIRMED]`, `operations_summary` | ✕ No activation acknowledgement | ◐ No readiness clock (F-09) |
| P07 Overview | `operations_summary`, `stages`, `client_actions` | — | ◐ No "next step" field. `project_state` never moves (F-22) |
| P08 Roadmap | `stages[]` (rolled up from tasks) | — | ◐ Several stages show ACTIVE at once on day one (F-21) |
| P09 Stage detail | ✕ The public payload has no tasks | — | ✕ (F-20) |
| P10 Needs you + approval | `client_actions` (OPEN only), `approvals[]` | `complete-client-action` → `completeClientAction` | ✕ No approval decision (F-03). No signature data (F-25) |
| P11 Complete | `completion_state`, `completed_at`, `ownership_record`, `credit` | — | ◐ Surface unreachable (F-05). Ownership semantics (F-27) |
| P11.A Records | ◐ `ownership_record` only | ✕ No export | ✕ No records model (F-28) |
| P11.B Record detail | ◐ `domain`, `registrar`, `renewal_date` (always null) | ✕ | ✕ (F-28, F-29) |
| P12 Next threshold | `build_recommendation`, `build_readiness`, `credit`, `build_interest` | `build-interest` → `captureBuildInterest` | ◐ No path selection. Credit expiry is not enforced (F-30) |
| P12.A Location live | ✕ Out of the Digital Foundation domain | ✕ | ✕ Gated future (F-29) |

#### Founder parents (P13–P15)

| Parent / child | Read contract (`GET action=`) | Write contract (admin action → service) | Status |
|---|---|---|---|
| P13 Pipeline | `list`, `pipeline` → `getPipelineView` | `create-artifact`, `materialize-fixture` | ◐ Attention queries over-match (F-33). Stale blockers (F-34) |
| P14 Project command | `project-command`, `detail`, `completion-gate` | `update-quote`, `manual-adjustment`, `client-action`, `approval-request/resolve`, `set-providers`, `generate/activate-runbook`, `mark-complete` | ◐ `set-providers` wipes progress (F-36). No credit, override or preview actions (F-38) |
| P15 Workbench | `workbench` → `getWorkbenchView` | `start-task`, `complete-task`, `verify-task`, `escalate-task`, `set-blocker` | ◐ FAILED tasks vanish from every bucket (F-35). No unblock or skip (F-37) |
| P15.A Runbook at a glance | `workbench.buckets`, `by_mode`, `project-command.runbook` | `generate-runbook`, `activate-runbook` | ◐ NOT_READY tasks are uncounted (F-35) |
| P15.B Runbook tasks | `project-command.tasks` | — | ◐ The board's dependency graph differs from the generator (F-32) |
| P15.C Task detail | `tasks[i]`, `verificationRules`, `verificationResults` (not exposed separately) | `verify-task` | ✕ No per-task rules or expected values (F-31) |

---

## 03 — Global experience architecture

### 03.1 — One link, many parents

`/foundation/:token` stays the single personalized link. The server decides the **surface** with `resolveArtifactSurface`. The client chooses the **parent** inside that surface. This blueprint makes that split explicit:

| Server surface | Default parent (landing) | Other parents reachable on this surface |
|---|---|---|
| `PROSPECT` | P01 | P02 (after BEGIN) |
| `INTAKE` | P02 (resume) | P03 |
| `RECOMMENDATION` | P04 | **Unreachable today**: `completeIntake` moves RECOMMENDATION_READY → QUOTE_READY in one call (`service.ts:212–248`) |
| `QUOTE` | P04, or P05 when an acceptance exists for an older version (re-accept state) | P05, and P03 via the reopen-intake path (F-15) |
| `CHECKOUT` | P05 in the `ACCEPTED_AWAITING_PAYMENT` state | P04 is read-only (the quote is locked) |
| `PORTAL` | P06 once, until activation is acknowledged; then P07. **P10 overrides both** when `needs_you_count > 0` and the client arrives from a notification deep link | P07, P08, P09, P10 |
| `COMPLETE` | P11 | P11.A, P11.B, P12 |
| `BUILD_UPSELL` | P11 if not yet viewed, otherwise P12 | P11, P11.A, P11.B, P12, and P12.A only when a linked build is live (future) |
| *(missing)* `PAUSED` / `REFUNDED` / `ARCHIVED` / `INVALID` | State variants of P07 or P01 (§06) | — (F-05) |

**Recommended view addressing** (proposal; the token remains the only identity and no PII goes in the path):
`/foundation/:token` (resolves to the default parent) · `/intake` · `/configure` · `/recommendation` · `/review` · `/activation` · `/overview` · `/roadmap` · `/stage/:stageCode` · `/needs-you` · `/needs-you/:requestId` · `/complete` · `/records` · `/records/:recordKey` · `/location`.

The client guards each view against the surface. A view that is not allowed redirects to the default parent. Deep links can then be used for notifications later (F-26).

### 03.2 — Client navigation graph

```
P01 ─BEGIN─▶ P02 ─CONTINUE─▶ P03 ─VIEW MY RECOMMENDATION (completeIntake)─▶ P04
                 ▲               ▲                                           │ ▲
                 └──EDIT─────────┴────EDIT MY NEEDS (reopen-intake, F-15)────┘ │
P04 ─CONTINUE TO REVIEW─▶ P05 ─PROCEED TO CHECKOUT─▶ [Stripe hosted] ─▶ P05(return: pending/canceled/failed)
                                                                     └─(webhook PAID)─▶ P06
P06 ─VIEW PROJECT OVERVIEW─▶ P07 ⇄ P08 ⇄ P09        (any of P06–P09) ─NEEDS YOU─▶ P10 ─(resolve)─▶ back
(completion gate passed)  ─▶ P11 ─VIEW RECORDS─▶ P11.A ─row─▶ P11.B
                             P11 ─WHAT'S NEXT (missing on board, F-29)─▶ P12 ─path─▶ build handoff
                                                                          P12.A (gated: linked build LIVE)
Hamburger menu (undefined on every board, F-40): surface-permitted parents + Help/Contact + copy link
```

### 03.3 — Founder navigation graph

```
P13 Pipeline ─row / attention item─▶ P14 Project Command ─OPEN EXECUTION WORKBENCH─▶ P15 Workbench
     │                                   │ RUNBOOK row ─▶ P15.A ─OPEN RUNBOOK─▶ P15.B ─task row─▶ P15.C
     └─ NEW FOUNDATION LINK (missing on board, F-39)        P15 ─VIEW RUNBOOK─▶ P15.B  (skip P15.A; see §07.3)
P14 ─PREVIEW AS CLIENT─▶ /foundation/:token?preview=founder   (must not set OPENED; F-12)
```

### 03.4 — Approval and verification gates

| Gate | Where | Condition (canonical) | Implemented? |
|---|---|---|---|
| **G01** Intake completeness | P03 → P04 | `business_name`, `contact_name`, `current_email` present. Exactly one domain path chosen. `existing_domain` present when the path is OWN_DOMAIN | ✕ `completeIntake` accepts an empty intake |
| **G02** Scope review | P04/P05 → checkout | No line with `requires_manual_review`, **or** the founder has confirmed the quote | ✕ (F-07, D-01) |
| **G03** Acceptance | P05 | All 3 canonical disclosures (exact strings, `service.ts:310`) | ✅ |
| **G04** Quote validity | P05 → checkout | `now < quote.expires_at`. The accepted version equals the current version | ✕ Expiry is never checked. The version is checked only through quote status |
| **G05** Payment | Stripe → P06 | Webhook (or verified simulation) only; never the redirect | ✅ (simulation leaks into production, F-06) |
| **G06** Readiness clock | P06–P08 | Intake complete, required info received, access/authorization received, domain approved where applicable, payment confirmed | ✕ (F-09) |
| **G07** Client action | P10 | Each CLIENT_ACTION task has its `ClientActionRequest` COMPLETED | ✅ (completes on any response, F-03) |
| **G08** Approval | P10 | Domain and signature `ApprovalRecord` APPROVED (versioned) | ◐ Founder-only resolution. Matched on subject string. Not linked to tasks |
| **G09** Task dependency | P15 | `dependencies_satisfied` | ✅ |
| **G10** Verification | P15 → P14 | Every required rule PASS, or a founder override with a reason | ◐ Pass/fail is manual, one flag covers every rule on the task (F-31), and the override has no API (F-38) |
| **G11** Completion | P14 → P11 | Runbook active, tasks done, rules pass, approvals resolved, ownership present. A founder override needs a reason | ✅ The override is not surfaced to the client (F-27) |
| **G12** Credit | P12 | `status=AVAILABLE` and `now < expires_at` | ◐ Expiry is manual only |
| **G13** Build handoff | P12 | `completion_state=COMPLETE`. Build is optional and never a prerequisite | ✅ |

---

## 04 — Reusable component inventory (DF-C)

Shared by client and founder unless noted. The **Parents** column lists every parent that uses the component.

### Host shell

| ID | Component | Variants | Parents |
|---|---|---|---|
| DF-C01 | **Host header**: `SITE 00` / `DIGITAL FOUNDATION` + menu glyph | client, founder | all |
| DF-C02 | **Index rail**: red numeral, rule, uppercase label | parent `NN`, child `NNX`, back `←` | all |
| DF-C03 | **Display headline**: condensed uppercase with the **red terminal period** | 2–4 lines; long-word fit (P11.A "LOCATION") | all |
| DF-C04 | **Lede**: tracked uppercase small text, emphasis on key words | — | all |
| DF-C05 | **Threshold object slot** (asset host, DF-A01–A03) | hero, corner, complete-burst, doorway | all |
| DF-C06 | **Primary CTA bar**: red, tracked label, arrow | default, busy, disabled, done | all |
| DF-C07 | **Secondary CTA** | red outline (REQUEST CHANGE, SAVE FOR LATER), black fill (P12.A VISIT) | P10, P12, P12.A |
| DF-C08 | **Trust line**: lock + three-beat phrase | per-parent copy (§06) | all |
| DF-C09 | **Footer index**: `SITE 00` —— `IDNTY / 0NN[X]` | — | all |

### Client modules

| ID | Component | Variants | Parents |
|---|---|---|---|
| DF-C10 | **Form field** | text, select, email, phone mask, error, disabled-after-payment | P02, P03 reveals, P10 |
| DF-C11 | **Service tile row**: icon, title, subtitle, control | control = checkbox, locked-included, path selector, stepper, chevron, arrow-box | P03 |
| DF-C12 | **Included row**: icon, label, `INCLUDED`, red check disc | — | P04, P05.C1 |
| DF-C13 | **Add-on row**: icon, label/sub, control, price delta | checkbox, quantity stepper, `REVIEWED` marker, `QUOTED AFTER REVIEW`, dependency-locked | P04, P04.C1 |
| DF-C14 | **Investment / turnaround split**: big numerals and derived caption | ready, updating, review-required, custom-review | P04 |
| DF-C15 | **Spec row**: icon, label/sub, value column | value text, value numeral, chevron | P05, P06, P14 |
| DF-C16 | **Acknowledgment row** | unchecked, checked, locked (accepted) | P05 |
| DF-C17 | **Status card**: large disc/cube icon, title, body | confirmed (red check), project status (cube), paused | P06, P07 |
| DF-C18 | **Navigation row**: icon, eyebrow, value, chevron | default, attention (red), inert (no chevron) | P07, P12, P14, P15 |
| DF-C19 | **Badge triad**: three icon + two-line label cells | entry scope, activation proof | P01, P06 |
| DF-C20 | **Stage rail**: vertical nodes, icon, title/sub, status pill | node complete, active, needs-you, provider-wait, paused, upcoming | P08 |
| DF-C21 | **Status pill** (semantic tones, §05.1) | 7 tones | P08, P09, P11, P11.A, P13–P15 |
| DF-C22 | **Checklist item**: node, title/sub, pill | complete, in-progress (red ring), pending, upcoming, needs-you | P09, P15.C |
| DF-C23 | **Action card**: document icon, title, body, status pill | per `ClientActionType` | P10 |
| DF-C24 | **Signature preview**: structured render, not an image | name, title, business, email, phone, web, optional client mark | P10.C1 |
| DF-C25 | **Decision pair**: APPROVE (fill) + REQUEST CHANGE (outline) with note sheet | — | P10 |
| DF-C26 | **Alert line**: red `!` disc and message | decision required, blocked, expired | P04, P05, P10, P13 |
| DF-C27 | **Record row**: icon, title, meta, date, pill, chevron | — | P11, P11.A |
| DF-C28 | **Tab bar**: red underline on the active tab | 4–5 tabs | P11.A, P11.B, P15.B, P15.C |
| DF-C29 | **Detail table**: label/value rows with a source/verified marker | — | P11.B, P15.C |
| DF-C30 | **Document row**: icon, name, type/size, download | generated summary only (F-28) | P11.B |
| DF-C31 | **Concept preview frame**: device mockups with the **mandatory "CONCEPT PREVIEW — NOT FINAL DESIGN" label** | label cannot be removed | P12 |
| DF-C32 | **Credit card**: ticket icon, amount, "USE BY {date}" | available, reserved, applied, expired, void | P12, P14 |

### Founder modules

| ID | Component | Variants | Parents |
|---|---|---|---|
| DF-C33 | **KPI grid**: numerals, red when attention is needed | 3×2 | P13, P15.A |
| DF-C34 | **Pipeline row**: icon, client, stage, status pill, chevron | — | P13 |
| DF-C35 | **Attention row**: alert/clock/blocked icon, client, reason | — | P13 |
| DF-C36 | **Execution task row**: icon, title, mode chip, status chip, chevron | — | P15, P15.B |
| DF-C37 | **Mode chip** | AUTOMATED (hidden in V1), ASSISTED, CLIENT ACTION, EXTERNAL MANUAL, VERIFICATION | P15, P15.A–C |
| DF-C38 | **Metric triad**: rules expected / passing / match state | — | P15 |
| DF-C39 | **Value copy field**: monospaced truncated value + copy | — | P15.C |
| DF-C40 | **Progress bar**: red fill + % | — | P15.B |
| DF-C41 | **Runbook table**: #, task, mode, status, depends-on | — | P15.B |
| DF-C42 | **Next action row**: play / up-right icon, label, chevron | — | P15, P15.C |

### Utilities

| ID | Component | Variants | Parents |
|---|---|---|---|
| DF-C43 | **Hero media frame** with external-link affordance | domain plate (DF-A08); never a site screenshot unless a site is live | P11.B, P12.A |
| DF-C44 | **Record header card**: globe, title, domain, pill | — | P11.B |
| DF-C45 | **Bottom sheet** for children that are not full screens | add-on catalog, terms, forecast, note | P04, P05, P07, P10 |
| DF-C46 | **Inline save / sync status** | saving, saved {time}, failed, offline | P02, P03, P04 |
| DF-C47 | **System panels** | loading skeleton, invalid link, disabled (503), error + retry | all |
| DF-C48 | **Menu drawer** (contents undefined on every board, F-40) | client, founder | all |

**Reuse candidates in the repo (to verify during implementation):** `src/site00/components/mobile/Site00MobileHeader.tsx`, `Site00MobileMenuDrawer.tsx`, `src/site00/components/shell/Site00PageFooter.tsx`, the condensed font family already self-hosted (`/site00/fonts/barlow-condensed/*`), and the IDNTY mobile modules (`IdntyProgression`, `IdntyInvestment`) as precedent for the stage rail and investment block. The route already sits inside `Site00Layout` → `Site00PublicRouteShell`.

---

## 05 — Asset families (DF-A)

| ID | Family | Board evidence | Rule / gap |
|---|---|---|---|
| DF-A01 | **Threshold hero object**: glass cube, red vertical plates, "01 DIGITAL FOUNDATION" plate, marble plinth | P01 | One hero render. Must not carry client data |
| DF-A02 | **Corner threshold object**: red glass columns behind headlines | P04–P15, children | Variants: STANDARD, COMPLETE-BURST (P11 fragment burst), DOORWAY (P12). Reduced-motion still frame required |
| DF-A03 | **Footer corner fragment**: red prism at bottom right | P02 onward | Purely decorative. Must not collide with the CTA at 320 px |
| DF-A04 | **Architectural wash**: concrete / glass background, low contrast | all | Must keep text contrast AA on the lede |
| DF-A05 | **Icon set** (stroke, black; red for alert) | all | **Canonical icon map required, F-41.** ⇄ means *migration* on P03 but *domain transfer* on P04. Envelope is reused for *professional email* and *additional mailbox*. Migration is ⇄ on P03 and a cloud on P04 |
| DF-A06 | **Status disc set**: red check disc, black check disc, red ring, outline ring, red `!`, blocked ⊖ | P04, P08, P09, P10, P13, P15.C | One set for client and founder |
| DF-A07 | **Concept preview mockups**: laptop and phone | P12 | Per-client composition. **No generation contract exists** (founder-uploaded or template). The label is mandatory |
| DF-A08 | **Domain plate**: client name and domain on a threshold plate | P11.B hero | Replaces the "website screenshot" reading (F-29) |
| DF-A09 | **Signature render**: structured data, not an image | P10 | The handwritten mark is **optional, client-supplied, never generated** (D-06) |
| DF-A10 | **Typography**: condensed display (headlines) + tracked uppercase grotesk (body, labels) | all | Reuse the SITE 00 font tokens. The current DF CSS uses `system-ui` and must be replaced |
| DF-A11 | **Motion**: CTA press, sheet, P06 confirmation, P11 burst | P06, P11 | `prefers-reduced-motion` already respected in the shell (`data-reduced-motion`) |
| DF-A12 | **Documents**: generated ownership summary (print/PDF) | P11.A, P11.B | **Provider-issued PDFs are not SITE 00 assets** (F-28) |
| DF-A13 | **Payment receipt** | P05, P11.A Payments tab | Stripe-hosted. SITE 00 stores no receipt URL today |
| DF-A14 | **Notification templates** (email/SMS) | implied by "we'll notify you" | **Do not exist** (F-26) |

### 05.1 — Functional status palette (D-03)

The boards introduce **green** pills (COMPLETE, ACTIVE, VERIFIED, PROTECTED, CONFIGURED, PASS) and a **blue** tile (VERIFYING on P15.A). The established rhythm in the handoff doc is **WHITE / BLACK / RED**. Proposed semantic tones, held for founder ratification:

| Tone | Meaning | Board color | Rhythm-only fallback |
|---|---|---|---|
| `done` | COMPLETE · VERIFIED · PASS · ACTIVE (record) · PROTECTED · CONFIGURED | green tint | black text on light grey + black check |
| `active` | IN PROGRESS · ACTIVE (stage) | red tint | red text on red tint |
| `needs` | NEEDS YOU · AWAITING APPROVAL · CLIENT ACTION · AWAITING PAYMENT | red tint / red outline | red outline |
| `wait` | UPCOMING · PENDING · NOT READY | grey | grey |
| `provider` | WAITING ON PROVIDER · DNS PROPAGATION | grey | grey + clock glyph |
| `verify` | VERIFYING · READY TO VERIFY | blue tint | black outline |
| `paused` | BLOCKED (client sees "PAUSED") · FAILED (founder) | red | red fill, white text |

---

## 06 — Parent-by-parent canonical blueprint

Each parent is specified by:

- **Purpose**
- **Gate**: the surface and condition under which it renders
- **Data**: contract fields
- **Children**
- **States**
- **Interactions**: action → endpoint → effect
- **Conflicts**: what the visual says → what the source says → the minimum correction

---

### BOARD 01 — ENTRY / INTAKE / CONFIGURE

#### P01 — FOUNDATION ENTRY · `YOUR DIGITAL FOUNDATION STARTS HERE.` · `IDNTY / 001`

**Purpose.** Introduce the product, establish scope and trust, and start the relationship.

**Gate.** Surface `PROSPECT`: `state ∈ {INVITED, OPENED}` and `intake_state = NOT_STARTED`.

**Data.**

| Need | Source |
|---|---|
| Personalization | `lead.business_name`, `lead.contact_name` |
| Copy values | `config.base_price_minor` (`STARTING AT $500`, optional), `config.base_min/max_business_days` |
| Attribution (server-side only) | `artifact.referral_source_id` |

**Children.**

| ID | Child | Notes |
|---|---|---|
| P01.C1 | Personalized invitation line | `PREPARED FOR {BUSINESS}`. Hidden when the lead has no business name |
| P01.C2 | Scope triad (DF-C19) | Domain & ownership · Professional email · Security & setup |
| P01.C3 | BEGIN CTA | → P02 |
| P01.C4 | Trust line | `SECURE. GUIDED. DONE FOR YOU.` |
| P01.C5 | Resume banner | Only when the client returns while `INTAKE_IN_PROGRESS`; normally the resolver skips P01 then |

**States.**

| State | Derivation | Treatment |
|---|---|---|
| `S-LOADING` | Payload pending | DF-C47 skeleton with the shell visible |
| `S-INVALID-LINK` | 404 `ARTIFACT_NOT_FOUND` | Shell, "THIS LINK ISN'T ACTIVE", contact path (F-40). No CTA |
| `S-DISABLED` | 503 flag off | "DIGITAL FOUNDATION IS TEMPORARILY UNAVAILABLE" |
| `S-ARCHIVED` | `state = ARCHIVED` | **Missing today** (resolves to PROSPECT). Show "THIS FOUNDATION LINK HAS BEEN CLOSED" with a contact path |
| `S-FIRST-OPEN` | `INVITED` → `OPENED` on load | Same as default. Event `LINK_OPENED` |
| `S-PERSONALIZED` / `S-ANONYMOUS` | `lead.business_name` present or absent | Show or hide P01.C1 |

**Interactions.**

| Trigger | Call | Effect |
|---|---|---|
| Load | `GET payload` | Marks OPENED |
| BEGIN | Today: client-only step change | **Recommended:** `update-intake {}`, which moves `INTAKE_IN_PROGRESS` and fires `INTAKE_STARTED`, so a reload resumes at P02 instead of P01 |

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "DONE FOR YOU. IN 2–3 DAYS." | 2–3 *business* days, starting once information, access and payment are in (doctrine §03, disclosure 3) | "DONE FOR YOU. TYPICALLY 2–3 BUSINESS DAYS ONCE EVERYTHING IS IN." Values bound to config |
| Referral attribution (not drawn) | `referral_source.label` is internal ("Sister / REA") | Never render the referral label to the client (D-08). Strip it from the public payload (F-04) |

---

#### P02 — BUSINESS INTAKE · `TELL US ABOUT YOUR BUSINESS.` · `IDNTY / 002`

**Purpose.** Collect the business and contact facts required for the recommendation and the future SITE 00 client record.

**Gate.** Surface `INTAKE` or `PROSPECT` after BEGIN. **Locked** once `payment_state = PAID` (`INTAKE_LOCKED_AFTER_PAYMENT`).

**Field contract** (board field → canonical field):

| Board field | Contract field | Required (G01) | Note |
|---|---|---|---|
| Business name | `business_name` | **Yes** | `legal_business_name` optional, as a second line under "Legal name if different" |
| Business type | `industry` | No | Select list. Values are not defined anywhere (gap, D-09) |
| Business location | ✕ **No field** | No | Add `business_location` (city/state) or remove the field (D-09) |
| Primary contact | `contact_name` | **Yes** | — |
| Email address | `current_email` | **Yes** | Label "BEST EMAIL TO REACH YOU". The placeholder must not assume a business address (`you@example.com`) |
| Phone number | `phone` | No | Mask only; no verification |
| *(not drawn)* Team size | `team_size` | No | **Moved to P03**: "HOW MANY PEOPLE NEED EMAIL?" |
| *(not drawn)* Existing domain / registrar / email provider | `existing_domain`, `existing_registrar`, `existing_email_provider` | Conditional | **Moved to P03** as conditional reveals on the domain and email tiles |

**States.**

| State | Treatment |
|---|---|
| `S-EMPTY` | Default |
| `S-RESUMED` | Form loaded with `artifact.intake`. **Broken today: the form never loads saved answers (F-14)** |
| `S-DIRTY` | — |
| `S-SAVING` / `S-SAVED {time}` | DF-C46 |
| `S-FIELD-ERROR` | Inline, under the field |
| `S-SUBMIT-ERROR` | DF-C26 + retry |
| `S-LOCKED-AFTER-PAYMENT` | Read-only summary + "CHANGES? CONTACT SITE 00" |

**Interactions.**

| Trigger | Call | Effect |
|---|---|---|
| Autosave or CONTINUE | `update-intake {intake: dirtyFieldsOnly}` | Saves without completing. Does **not** call `completeIntake` |
| CONTINUE | — | → P03 |

**Conflicts.** The trust line `YOUR INFORMATION IS SECURE.` must be paired with "WE NEVER ASK FOR PASSWORDS" (doctrine; already in the shell copy).

---

#### P03 — FOUNDATION CONFIGURATOR · `SELECT WHAT YOU NEED.` · `IDNTY / 003`

**Purpose.** Capture *needs* (`intake.needs[]` plus the conditional facts) that drive `recommendFromIntake`. **P03 does not select quote lines.** The quote is produced only when P03 is submitted.

**The selection-model ruling** the brief asked for.

The board shows eight equal optional checkboxes. The source says otherwise:

- `site00_handles` (`recommendationEngine.ts:13`) and the runbook (`runbookGenerator.ts`) always include domain consultation, primary mailbox, aliases, MX/SPF/DKIM/DMARC, one signature, one primary device, the ownership record and the build-readiness check.
- `NEED_PRO_EMAIL`, `NEED_ALIASES` and `NEED_SIGNATURE` have **no effect** in any engine.
- `NEED_DNS_SECURITY` adds **ADVANCED_DNS_CLEANUP ($150, manual review)** (`:54`).
- `NEED_DEVICE` adds **ADDITIONAL_DEVICE_SETUP ($50)** for the device that is already included (`:51`).

So the tiles **must** split into four classes, keeping the board's tile list composition:

| Class | Tiles (board order kept) | Control | Engine binding |
|---|---|---|---|
| **CORE FOUNDATION** (always included, not toggleable) | Professional email · Email aliases · Email security (SPF/DKIM/DMARC) · Email signature | Locked check + `INCLUDED` | None. Shown for comprehension only |
| **INCLUDED, NEEDS A CHOICE** | **Domain** (required single choice) · **Device setup** (1 included) · mailbox count | Path selector; stepper ≥ 1; "people who need email" | Domain path → `NEED_DOMAIN` \| `OWN_DOMAIN` (+ `existing_domain`, `existing_registrar`) \| `LOST_DOMAIN` \| *transfer* (✕ no flag, F-16) \| `UNSURE`. Devices > 1 → ADDITIONAL_DEVICE_SETUP × (n−1). Mailboxes → `team_size` / `NEED_MULTI_MAILBOX` |
| **CONFIGURABLE, MAY ADD TO SCOPE** | Email migration · "My domain already runs a website or other service" · "My DNS is messy or shared" | Checkbox + `PAID ADD-ON` / `REVIEWED` micro-label | `NEED_MIGRATION`, `HAVE_WEBSITE`, `NEED_DNS_SECURITY` (**renamed semantics**: cleanup, not baseline security) |
| **ADDITIONAL SERVICES** (child sheet P03.C1) | Eventual website · Branding · Not sure | Checkbox | `EVENTUAL_WEBSITE` (feeds P12), `NEED_BRANDING` (no engine effect), `UNSURE` (clarification call) |

**Children.**

| ID | Child |
|---|---|
| P03.C1 | Additional services sheet (DF-C45) |
| P03.C2 | Domain path reveal: domain + registrar fields; *preferred names* for REGISTER NEW (✕ no field, F-16) |
| P03.C3 | Email reveal: current provider, people count, *provider preference* (✕ no field, D-12) |
| P03.C4 | Migration reveal: source provider (`existing_email_provider`) |

**Validation (G01).**

- Exactly one domain path.
- OWN_DOMAIN requires `existing_domain`.
- `NEED_DOMAIN` and `OWN_DOMAIN` are mutually exclusive. The engine tolerates both; the UI must not.

**States.**

| State | Treatment |
|---|---|
| `S-DEFAULT` | — |
| `S-PATH-MISSING` | DF-C26: "CHOOSE HOW WE HANDLE YOUR DOMAIN" |
| `S-SUBMITTING` | CTA busy |
| `S-REOPENED` | Arrived from P04 "EDIT MY NEEDS". Banner: "CHANGING YOUR NEEDS WILL REBUILD YOUR RECOMMENDATION" |
| `S-LOCKED` | After acceptance. Read-only |

**Interactions.**

| Trigger | Call | Effect |
|---|---|---|
| VIEW MY RECOMMENDATION | `update-intake {intake, needs, markComplete: true}` | `completeIntake` → recommendation + quote v1 (`CLIENT_REVIEW`) → P04 |

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| Every tile is an optional checkbox | Core items are always included (`site00_handles`) | Locked `INCLUDED` treatment for core tiles; tile list kept |
| "Email security — SPF, DKIM, DMARC setup" toggleable | Baseline security is core. `NEED_DNS_SECURITY` means paid cleanup | Core tile; separate "messy / shared DNS" option (F-08) |
| "Device setup" toggleable | One device included; NEED_DEVICE currently charges $50 | Stepper starting at 1 included; engine fix (F-08) |
| "Domain — register, transfer or connect" as a checkbox | Domain path is a required single choice; transfer has no flag | Path selector (F-16) |
| Additional services → arrow box | — | Opens P03.C1 |

---

### BOARD 02 — RECOMMEND / REVIEW / ACTIVATE

#### P04 — RECOMMENDATION · `YOUR RECOMMENDED FOUNDATION.` · `IDNTY / 004`

**Purpose.** Reveal the personalized scope and allow the final customization of paid add-ons.

**Gate.** Surface `QUOTE` (the `RECOMMENDATION` surface is unreachable, F-05). The quote status must be in `{DRAFT, READY, CLIENT_REVIEW}`. Read-only once ACCEPTED.

**Binding rule (critical).** `payload.recommendation` is **recomputed from the intake on every read** (`service.ts:678–681`). Its `recommended_addons` and `projected_investment_minor` therefore describe the *original* recommendation, not the current selection.

- **All prices, totals and timelines bind to `payload.quote`.**
- `recommendation` provides only the narrative: `site00_handles`, `client_must_provide`, `third_party_costs`, `manual_review_reasons`, and the `RECOMMENDED` badge on lines.

**Composition** (board kept).

1. **Included list** (DF-C12). Six rows from `site00_handles`, mapped to the board labels: Domain & ownership · Professional email · Email aliases · Security & authentication · Email signature · Device setup (1 device).
2. **Additional features** (DF-C13). The board shows 4 contextual rows. The canonical rule:
   - Show every line already in `quote.selected_addons`.
   - Plus up to 4 relevant catalog entries chosen by need flags.
   - Plus **"VIEW ALL ADD-ONS"** → P04.C1, the full catalog sheet grouped as Domain / Email / Setup / Priority / Custom.
3. **Projected investment and turnaround** (DF-C14).

**Add-on rendering contract.**

| Catalog item | Control | Price label | Immediate effect | Founder confirmation |
|---|---|---|---|---|
| ADDITIONAL_MAILBOX ($75 × qty) | **Stepper** (not a checkbox; `quantity_unit`) | `+$75 EACH` | Price only (0 days) | No |
| ADDITIONAL_DEVICE_SETUP ($50 × qty) | **Stepper** ("devices beyond the first") | `+$50 EACH` | Price only | No |
| ADDITIONAL_DOMAIN ($100, +1 d) | Checkbox | `+$100` | Price + timeline | No |
| DOMAIN_TRANSFER ($100, +2 d) | Checkbox | `+$100` | Price + timeline | No |
| ADVANCED_EMAIL_ROUTING ($100, +1 d) | Checkbox | `+$100` | Price + timeline | No |
| LEGACY_EMAIL_MIGRATION ($200, +2 d, review) | Checkbox + `REVIEWED` | `+$200` | Price + timeline + `REQUIRES REVIEW` | **Yes (D-01)** |
| MULTI_USER_WORKSPACE_SETUP ($150, +1 d, review) | Checkbox + `REVIEWED` | `+$150` | Same | **Yes** |
| STAFF_SIGNATURE_SYSTEM ($150, +1 d, review; **requires MULTI_USER**) | Checkbox, dependency-locked | `+$150` | Auto-explain the dependency | **Yes** |
| ADVANCED_DNS_CLEANUP / EXISTING_SITE_DOMAIN_CONFLICT ($150, +2 d, review) | Checkbox + `REVIEWED` | `+$150` | Same | **Yes** |
| DOMAIN_RECOVERY ($150, +5 d, review) | Checkbox + `REVIEWED` | `FROM $150` | Same | **Yes** |
| EXPEDITED_FOUNDATION (premium `null`, −1 d, review) | **Hidden** unless `expedited_premium_minor` is set (D-11) | — | — | **Yes** |
| CUSTOM_FOUNDATION_WORK ($0, +5 d, review) | Checkbox | **`QUOTED AFTER REVIEW`, never `+$0`** | Timeline + review | **Yes; checkout blocked** |

**Derived values (never hardcode).**

| Value | Derivation |
|---|---|
| Total | `quote.subtotal_minor` |
| Caption | `${base} + ${addon_total} add-ons`, plus `+ ${adj} scope adjustment` when `manual_adjustments_minor ≠ 0` (the board caption would otherwise not sum) |
| Turnaround | `projected_min_days–projected_max_days BUSINESS DAYS` |
| Delta | `+${projected_max_days − config.base_max_business_days} DAYS (ADD-ONS)` |
| Review suffix | When `timeline_custom_review`, append `· CONFIRMED AFTER REVIEW`. **Do not** replace the range with "Custom review", as the current shell does |

**Arithmetic check of the board example.** $500 + $75 (one mailbox) + $200 (migration) = **$775**. Timeline 2–3 → **3–5**. Both are engine-correct. **However**, migration sets `timeline_custom_review = true`, so the board is missing the `REQUIRES REVIEW` / `CONFIRMED AFTER REVIEW` marker. That is the minimum correction.

**Children.**

| ID | Child |
|---|---|
| P04.C1 | Full add-on catalog sheet |
| P04.C2 | "What SITE 00 handles / what you provide / third-party costs" sheet, from `recommendation` |
| P04.C3 | Pricing explanation sheet (base, lines, adjustments) |
| P04.C4 | Timeline explanation sheet: business days, review, and **when the clock starts** (G06) |
| P04.C5 | "EDIT MY NEEDS" → P03 reopen (F-15) |

**States.**

| State | Derivation | Treatment |
|---|---|---|
| `S-READY` | Quote `CLIENT_REVIEW`, no review lines | CTA enabled |
| `S-UPDATING` | `update-quote` in flight | Totals dimmed with a hairline loader. Debounce about 400 ms (each call creates a new quote version, F-18) |
| `S-UPDATE-FAILED` | API error | Revert the control, DF-C26 |
| `S-DEPENDENCY-BLOCKED` | `ADDON_REQUIRED:` error, or a client-side dependency | Inline explanation on the locked row |
| `S-REVIEW-REQUIRED` | Any `requires_manual_review` line | DF-C26: "SOME ITEMS ARE CONFIRMED BY SITE 00 BEFORE CHECKOUT". CTA still → P05 (review only) |
| `S-FOUNDER-ADJUSTED` | `manual_adjustments_minor ≠ 0` | Adjustment line visible |
| `S-EXPIRED` | `now ≥ expires_at` | **Not enforced server-side (F-07).** "THIS QUOTE EXPIRED — REFRESH IT" → `update-quote` with the same selections |
| `S-LOCKED` | Quote ACCEPTED / PAID | Read-only. Controls removed |

**Interactions.**

| Trigger | Call | Effect |
|---|---|---|
| Toggle or stepper | `update-quote {selections: fullSet}` | New version; the previous version is SUPERSEDED |
| Remove a recommended line | `remove-addon {addon_id}` | Server dependency check |
| CONTINUE TO REVIEW | — | View change only → P05 |

---

#### P05 — REVIEW + CHECKOUT · `READY TO MOVE FORWARD.` · `IDNTY / 005`

**Purpose.** Final scope, commercial disclosure, explicit acceptance, and Stripe-hosted checkout handoff. **No embedded card form** (the adapter reserves `STRIPE_EMBEDDED_CHECKOUT`, which is unused and stays unused).

**Gate.** Surface `QUOTE` (pre-acceptance) or `CHECKOUT` (`AWAITING_PAYMENT`).

**Composition** (board kept). DF-C15 spec rows:

| Row | Binding |
|---|---|
| Service | "DIGITAL FOUNDATION · INCLUDES {n} ADD-ONS" → P05.C1 |
| Investment | `subtotal_minor`, "TOTAL DUE TODAY", caption |
| Turnaround | Range + clock-start note |
| Third-party costs | "BILLED SEPARATELY" → P05.C3 |
| Payment | "SECURE STRIPE CHECKOUT" |

Below the rows: three DF-C16 acknowledgments, then the CTA.

**Disclosure ruling (F-10).** The server accepts **only these three exact strings** (`service.ts:310–316`):

1. `I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.`
2. `I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.`
3. `I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.`

The board's three are different. One of them ("I understand payment activates production") **contradicts doctrine §03**. Minimum correction: keep the 3-checkbox composition and render the canonical text. To allow shorter display copy later, Composer should move to disclosure IDs (`DF_DISC_SCOPE_V1`, `DF_DISC_THIRD_PARTY_V1`, `DF_DISC_CLOCK_V1`).

**Other row corrections.**

| Visual | Correction |
|---|---|
| "PAYMENT — ACTIVATES PRODUCTION" | "ACTIVATES YOUR PROJECT" + "TURNAROUND BEGINS ONCE INFORMATION, ACCESS AND PAYMENT ARE IN" |
| "I agree to the terms" | `terms_version = df-terms-v1` exists, but **no terms document exists** (F-11). P05.C2 terms sheet required before launch |

**Children.**

| ID | Child |
|---|---|
| P05.C1 | Scope detail sheet: included, lines, quantities, quote version, `client_must_provide` (the readiness checklist) |
| P05.C2 | Terms sheet |
| P05.C3 | Third-party cost explainer: `third_party_costs` + `third_party_cost_notice` |

**States** (the full payment state set the brief requires).

| State | Derivation | Treatment / CTA |
|---|---|---|
| `S-REVIEW` | Not accepted | CTA disabled until 3/3 acknowledged |
| `S-REVIEW-BLOCKED` | G02 fails (D-01) | CTA "REQUEST CONFIRMATION". Founder confirms in P14 |
| `S-ACCEPTING` | `accept-quote` in flight | Busy |
| `S-ACCEPTED-AWAITING-PAYMENT` | `CHECKOUT` surface; acceptance version = quote version | Acknowledgments locked/checked. CTA "COMPLETE PAYMENT". **Also the returning-client state** |
| `S-CREATING-SESSION` → `S-REDIRECTING` | `start-checkout` | "OPENING SECURE CHECKOUT…" → `window.location = checkout_url` |
| `S-RETURN-CONFIRMING` | `?checkout=return` and `payment_state ≠ PAID` | "CONFIRMING YOUR PAYMENT". Poll the payload (e.g. 3 s × 10). Never mark paid from the redirect |
| `S-RETURN-SLOW` | Poll exhausted | "PAYMENT RECEIVED BY STRIPE IS STILL CONFIRMING — THIS PAGE WILL UPDATE" + refresh |
| `S-CANCELED` | `?checkout=cancel` | "CHECKOUT CANCELED — NOTHING WAS CHARGED" + "TRY AGAIN". **The server cannot tell canceled from pending** (`payment_state` stays `CHECKOUT_PENDING`, F-06) |
| `S-FAILED` | `payment_state = FAILED` | DF-C26 + "TRY AGAIN" (`start-checkout` is allowed again). **Rarely reachable today** (F-06) |
| `S-PAYMENT-UNAVAILABLE` | `PAYMENT_NOT_CONFIGURED` / `PROVIDER_ERROR` | "CHECKOUT IS UNAVAILABLE RIGHT NOW" + contact |
| `S-QUOTE-CHANGED` | `acceptance.quote_version < quote.quote_version` (founder `manual-adjustment` returns the artifact to QUOTE_READY) | "YOUR SCOPE WAS UPDATED — REVIEW AND ACCEPT AGAIN". Diff of the changed lines |
| `S-EXPIRED` | `now ≥ expires_at` | As in P04 (F-07) |
| → P06 | Webhook `PAID` | Surface `PORTAL` |

---

#### P06 — ACTIVATION · `YOUR FOUNDATION IS ACTIVE.` · `IDNTY / 006`

**Purpose.** The one-time threshold moment: payment confirmed server-side, project active, and the same link is now the portal.

**Gate.** Surface `PORTAL` **and** activation not yet acknowledged.

The contract has no persisted activation state: `confirmPaymentFromWebhook` goes PAID → PROJECT_ACTIVE → IN_PROGRESS in one call (`service.ts:388–440`). **Missing: an `activation_acknowledged_at` field and an `acknowledge-activation` action (F-19).** Until they exist, show P06 when `?checkout=return` and PAID, or when the most recent `PAYMENT_CONFIRMED` event is newer than the last portal visit (client-local fallback).

**Composition** (board kept): DF-C17 confirmation card, DF-C15 spec rows, DF-C19 proof triad, CTA.

| Row | Binding |
|---|---|
| Client | `intake.business_name` (fallback `lead.business_name`) |
| Service | "DIGITAL FOUNDATION" |
| Payment status | "CONFIRMED" (`payment_state=PAID`) |
| Current phase | Client label of `operations_summary.current_stage` |
| Estimated turnaround | `forecast.current_min–max` + **clock-start clause** |
| Next | Contextual: the first open Needs You title, or "WE'LL BEGIN SETUP" |

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "3–5 BUSINESS DAYS **FROM TODAY**" | Clock starts at the G06 readiness conditions, not at payment (doctrine §03, disclosure 3) | "3–5 BUSINESS DAYS ONCE WE HAVE WHAT WE NEED". When Needs You is open: "STARTS WHEN YOUR {n} ITEM(S) ARE DONE" |
| "NEXT: WE'LL COMPLETE YOUR SETUP" | For the canonical base path (`NEED_DOMAIN`), activation **immediately** creates a CHOOSE_DOMAIN Needs You (`domain_availability` is a dependency-free CLIENT_ACTION) | "NEXT: CHOOSE YOUR DOMAIN" → P10 when `needs_you_count > 0` |
| Badge "CONFIRMATION SENT" | No notification system exists (F-26). A Stripe receipt is not guaranteed | Replace with "PORTAL READY" (this link) until notifications exist |
| Badge "PAYMENT VERIFIED" | ✅ webhook-only | Keep |
| Board example "3–5" vs P07 "2–3" for the same client | `refineForecast` only adds days. 2–3 after 3–5 is impossible | Both bind to `forecast` |

**States.**

| State | Treatment |
|---|---|
| `S-ACTIVATED-READY` | No Needs You |
| `S-ACTIVATED-NEEDS-YOU` | Primary CTA → P10 |
| `S-ACTIVATING` | PAID but runbook absent: "SETTING UP YOUR PROJECT". Possible if runbook generation fails after PAID; a webhook retry then skips generation (F-19) |
| `S-REFUNDED` / `S-DISPUTED` | `payment_state ∈ {REFUNDED, DISPUTED}`. **Missing surface (F-05).** "THIS PROJECT IS PAUSED" + contact |

---

### BOARD 03 — CLIENT PORTAL CORE

#### P07 — PROJECT OVERVIEW · `YOUR FOUNDATION IS IN PRODUCTION.` · `IDNTY / 007`

**Purpose.** The portal home. Status, current stage, next step, what the client owes, and the forecast.

**Gate.** Surface `PORTAL`, activation acknowledged.

**Data.** `operations_summary` (current stage, `needs_you_count`, projected-completion string), `stages[]`, `client_actions`, `approvals`, and the forecast reason (**not in the payload today**; add a client-safe mapping).

**Composition** (board kept): DF-C17 status card + 4 DF-C18 rows + CTA.

**Client project-status derivation** (do **not** use `artifact.project_state`; it never leaves ACTIVE, F-22):

| Client status | Rule |
|---|---|
| `NEEDS YOU` | Any open client action or REQUESTED approval addressed to the client |
| `PAUSED` | Any stage BLOCKED. Client copy is "WE'RE RESOLVING AN ISSUE", never `blocked_reason` |
| `WAITING ON PROVIDER` | Any stage NEEDS_PROVIDER (DNS propagation: "CHANGES CAN TAKE UP TO 48 HOURS") |
| `FINAL CHECKS` | The earliest non-complete stage is `06_FINAL_VERIFICATION` |
| `ACTIVE` | Otherwise |

**Rows.**

| Row | Rule |
|---|---|
| Current stage | Earliest non-complete stage → P09 |
| Next step | The following stage in `FOUNDATION_STAGE_ORDER` (derived; no field) → P08 anchored |
| Needs you | Count + first title → P10. When zero: inert "NONE RIGHT NOW" (no chevron) |
| Estimated completion | Forecast → P07.C1 forecast sheet (reason, original vs current, clock start) |

**CTA rule.** `needs_you_count > 0` → "REVIEW WHAT'S NEEDED" (→ P10). Otherwise "VIEW ROADMAP" (board).

**Children.**

| ID | Child |
|---|---|
| P07.C1 | Forecast sheet |
| P07.C2 | Recent activity sheet (**client-safe events only**, F-04). Not on the board; recommended |

**States.** `S-ACTIVE`, `S-NEEDS-YOU`, `S-WAITING-PROVIDER`, `S-PAUSED`, `S-FINAL-CHECKS`, `S-FORECAST-EXTENDED` (current max > original max), `S-STALE`.

`S-STALE` exists because `getArtifactPayload` runs `syncDerivedState` *after* reading the stages (`service.ts:688`), so every response can be one mutation behind (F-23).

---

#### P08 — ROADMAP · `FOLLOW YOUR FOUNDATION.` · `IDNTY / 008`

**Purpose.** The ordered seven-stage journey with status.

**Data.** `stages[]` from `rollupStagesFromTasks`. Stage subtitles depend on the domain path:

| Path | Domain stage subtitle |
|---|---|
| NEED_DOMAIN | REGISTRATION + SETUP |
| OWN_DOMAIN | CONNECT YOUR DOMAIN |
| Transfer | TRANSFER + SETUP |
| LOST_DOMAIN | RECOVERY + SETUP |

**Stage pill mapping** (DF-C20 + DF-C21).

| `ProjectStageStatus` | Client label | Node |
|---|---|---|
| COMPLETE | COMPLETE | Black check disc |
| IN_PROGRESS | ACTIVE | Red disc |
| NEEDS_CLIENT | NEEDS YOU | Red ring |
| NEEDS_PROVIDER | WAITING ON PROVIDER | Grey ring + clock |
| BLOCKED | PAUSED | Red ⊖ |
| WAITING | UPCOMING | Outline ring |

**Conflict (F-21, MAJOR).** The board shows **one** ACTIVE stage and says "SITE 00 MOVES THROUGH EACH STAGE IN SEQUENCE." The rollup counts a READY (not started) task as IN_PROGRESS (`stageRollup.ts:15–20`), and many tasks have no dependencies. On activation for fixture A_BASE the roadmap would show:

> 01 ACTIVE · 02 NEEDS YOU · 03 ACTIVE · 04 UPCOMING · 05 ACTIVE · **06 FINAL VERIFICATION ACTIVE** · 07 UPCOMING

`ownership_record` has no dependencies, so stage 06 is "active" on day one.

Minimum correction, in this order:

1. **Composer:** READY-only stages roll up as WAITING; and `ownership_record` depends on the verification tasks (D-07).
2. **Copy:** "IN SEQUENCE" → "STAGE BY STAGE — SOME WORK RUNS IN PARALLEL."

**Children.**

| ID | Child |
|---|---|
| P08.C1 | Tap a stage → P09 for that stage |
| P08.C2 | Forecast module → P07.C1 |

**Copy conflict.** "WE'LL NOTIFY YOU IF APPROVAL IS NEEDED" assumes a notification system that does not exist (F-26). Use "CHECK THIS LINK — ANYTHING WE NEED SHOWS HERE" until it does.

**States.** `S-ON-TRACK`, `S-NEEDS-YOU`, `S-DELAYED`, `S-PAUSED`, `S-COMPLETE`.

**CTA.** "VIEW STAGE DETAIL" → P09 (current stage). When Needs You is open → P10.

---

#### P09 — STAGE DETAIL · `{STAGE} IN PROGRESS.` · `IDNTY / 009`

**Purpose.** A client-safe checklist for one stage. The board example is DOMAIN SETUP IN PROGRESS. The headline is templated from the stage label and the stage state:

`{LABEL} IN PROGRESS.` · `{LABEL} NEEDS YOU.` · `{LABEL} COMPLETE.` · `{LABEL} IS NEXT.`

**Data. ✕ None today (F-20, BLOCKER for P09).** The public payload carries **no tasks**. The handoff calls for a "client-safe subset", but most tasks default to `INTERNAL_ONLY` (`runbookGenerator.ts:28`). A CLIENT_SAFE-only filter for the Domain stage would return only "Registrar security / 2FA guidance" and "Domain availability and selection". **Required contract** (D-02):

```
client_tasks: Array<{
  task_ref: string;                 // opaque, not the internal task_id
  stage: ProjectStageCode;
  client_label: string;             // canonical client wording per task_type
  client_sub: string | null;
  client_status: 'COMPLETE' | 'IN_PROGRESS' | 'PENDING' | 'UPCOMING' | 'NEEDS_YOU' | 'WAITING_PROVIDER' | 'RESOLVING';
  needs_you_request_id: string | null;
}>
```

It must never carry `internal_notes`, `blocked_reason`, `provider_id`, `result_metadata` or `assigned_actor`.

**Task status → client status.**

| `ExecutionTaskStatus` | Client status |
|---|---|
| COMPLETE, VERIFIED | COMPLETE |
| IN_PROGRESS, READY_TO_VERIFY, VERIFYING | IN PROGRESS |
| READY | PENDING |
| NOT_READY | UPCOMING |
| WAITING_CLIENT | NEEDS YOU |
| WAITING_PROVIDER | WAITING ON PROVIDER |
| BLOCKED, FAILED | RESOLVING |
| SKIPPED, SUPERSEDED | Hidden |

**Composition** (board kept): stage header card (globe, STAGE / STATUS / owner cell), DF-C22 checklist, "NEXT: {following stage}" row, Needs-you row, CTA.

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "OWNER — SITE 00" | Doctrine: SITE 00 must not claim ownership of client infrastructure | Relabel the cell **"HANDLED BY"**: SITE 00 · YOU · PROVIDER, derived from the active modes |
| Checklist "Domain path confirmed / Registrar access / Domain connection / Ownership check" | Path-dependent tasks. "Registrar access" exists only on OWN_DOMAIN; the register path has availability → registration → ownership → registrar security | Labels come from `client_label` per task, not from the board |
| CTA "VIEW RECORDS" mid-project | Records exist only after completion (P11) | CTA "BACK TO ROADMAP", or "VIEW {NEXT STAGE}" when the stage is complete |
| "WE'LL NOTIFY YOU IF THIS CHANGES." | No notifications (F-26) | "THIS PAGE UPDATES AS WE WORK." |

**Children.**

| ID | Child |
|---|---|
| P09.C1 | Inline expand on a checklist item (client-safe description) |
| P09.C2 | Needs-you row → P10 item |

**States.**

| State | Notes |
|---|---|
| `S-IN-PROGRESS` | — |
| `S-NEEDS-YOU` | — |
| `S-WAITING-PROVIDER` | Propagation copy |
| `S-RESOLVING` | — |
| `S-COMPLETE` | — |
| `S-UPCOMING` | Preview of what will happen |
| `S-EMPTY-STAGE` | A stage with no tasks, e.g. stage 01 when business details are already verified |

---

### BOARD 04 — CLIENT ACTION / COMPLETION / NEXT THRESHOLD

#### P10 — NEEDS YOU + APPROVAL · `WE NEED YOUR APPROVAL.` / `WE NEED YOUR INPUT.` · `IDNTY / 010`

**Purpose.** One parent for every client obligation: approvals *and* information/access requests.

The headline is templated:

| Condition | Headline |
|---|---|
| Any item is an approval | "WE NEED YOUR APPROVAL." |
| Otherwise | "WE NEED YOUR INPUT." |
| Several items | "{N} THINGS NEED YOU." |

**Gate.** Surface `PORTAL`, with an open `client_actions` entry or a client-addressed REQUESTED `approvals` entry.

**Structural ruling.** P10 has two layers:

- **Queue layer** (P10 parent): DF-C23 card per item + count line ("1 ITEM REQUIRES YOUR DECISION").
- **Decision layer** (P10.Cn, polymorphic by `ClientActionType`).

With exactly one item, the board shows both layers stacked, so the inline decision pair duplicates the primary CTA "REVIEW APPROVAL" (§07.3).

**Resolution.** The inline DF-C25 pair **is** the decision. After the decision, the primary CTA becomes "NEXT ITEM" or "BACK TO PROJECT". With several items, cards show "REVIEW" only.

**Polymorphic children.**

| Child | `ClientActionType` | Body | Response contract | Contract status |
|---|---|---|---|---|
| **P10.C1** Signature approval | APPROVE_SIGNATURE | DF-C24 preview, version tag | `APPROVED` or `REVISION_REQUESTED + note` | ✕ No public approval action (F-03). ✕ No signature data (F-25) |
| P10.C2 Choose domain | CHOOSE_DOMAIN | Up to 3 founder-curated candidates + "suggest another" | `{domain}` | ◐ Candidates have no source (registry SEARCH exists; no live calls) |
| P10.C3 Approve domain | APPROVE_DOMAIN | Exact spelling, registrar, **yearly cost paid by you** | approve / change | ◐ Not generated by the runbook. Approval subject match is a string |
| P10.C4 Access / authorization | PROVIDE_DOMAIN_ACCESS · AUTHORIZE_PROVIDER · PROVIDE_PROVIDER_ACCESS | Step guide: "invite SITE 00 as a delegate". **No password or secret inputs** | `{confirmed: true, note?}` | ◐ PROVIDE_PROVIDER_ACCESS is never generated (F-31a) |
| P10.C5 Transfer authorization | AUTHORIZE_DOMAIN_TRANSFER | Authorization statement + unlock steps. **Do not collect the EPP auth code in the form** (credential-class secret) | `{authorized: true}` | ◐ |
| P10.C6 Email address | CHOOSE_EMAIL_ADDRESS · CONFIRM_EMAIL_ADDRESS · CONFIRM_PRIMARY_EMAIL | Local-part picker `@{domain}` | `{address}` | ◐ Never generated by the runbook |
| P10.C7 DNS change approval | APPROVE_DNS_CHANGE | Plain-language change summary (existing site conflict) | approve / question | ◐ Never generated |
| P10.C8 Device | CONNECT_DEVICE · COMPLETE_DEVICE_SETUP | Device guide steps | `{done: true, device_label}` | ✅ Generated from DEVICE_SETUP |
| P10.C9 Recovery email | CONFIRM_RECOVERY_EMAIL | — | `{email}` | ◐ Mapped, but recovery is EXTERNAL_MANUAL, so it is never generated |
| P10.C10 Business details | PROVIDE_BUSINESS_DETAILS | Read-only intake + requested fields (intake is locked after payment; the answer goes in the response) | `{fields}` | ✅ Founder-created |
| P10.C11 Final record review | REVIEW_FINAL_RECORD | P11.A preview | approve / question | ◐ Never generated |
| P10.C12 Custom | CUSTOM_REQUEST | Title/detail + free text | `{text}` | ✅ |

**Required interaction contract (F-03).** Add a public action:

```
resolve-approval { approval_id, decision: 'APPROVED' | 'REVISION_REQUESTED', note? }
```

It records the client as the actor. It also requires:

- `ApprovalRecord` linked to its task (`task.approval_id` is never set today).
- `APPROVED` → the linked task COMPLETE.
- `REVISION_REQUESTED` → the producing task (`signature_create`) back to READY and the approval `version + 1` on re-request.
- `complete-client-action` must **refuse** an APPROVE_* type, or treat a revision response as non-completing.

**States.**

| State | Treatment |
|---|---|
| `S-QUEUE` | — |
| `S-DECIDING` | — |
| `S-SUBMITTING` | — |
| `S-SUBMITTED` | "THANK YOU — WE'LL CONTINUE" |
| `S-REVISION-REQUESTED` | "WE'RE UPDATING IT — YOU'LL SEE VERSION {v+1} HERE" |
| `S-NEW-VERSION` | — |
| `S-ALREADY-RESOLVED` | Stale tab |
| `S-CANCELLED` | — |
| `S-ERROR` | — |
| `S-EMPTY` | "NOTHING NEEDS YOU RIGHT NOW" + back to P07 |

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| Handwritten "Anthony" signature mark | The scope is an email signature block. A generated handwritten mark raises authenticity concerns | Remove, or show only a client-supplied mark (D-06) |
| Contact data in the preview (email, phone, website) | Must come from the intake and the chosen primary address, never board values | Bind |
| Client action titles | Today they reuse internal task titles in past tense ("Email signature approved"; F-24) | `client_label` request phrasing ("APPROVE YOUR EMAIL SIGNATURE") |

---

#### P11 — FOUNDATION COMPLETE · `YOUR FOUNDATION IS COMPLETE.` · `IDNTY / 011`

**Purpose.** Verified delivery and an ownership statement. **This is a valid end state without any further purchase.**

**Gate.** `completion_state = COMPLETE`.

The resolver returns `BUILD_UPSELL` on every completion because `markFoundationComplete` always moves to `BUILD_OPPORTUNITY` (`service.ts:611`; `surface.ts:7`). P11 must therefore be the landing for *both* surfaces until viewed (F-05).

**Composition** (board kept): DF-C27 five delivery rows, record summary table, a "VIEW RECORDS" row, CTA.

**Delivery row derivation** (replace the weak derivations).

| Row | Today | Canonical |
|---|---|---|
| Domain — REGISTERED + ACTIVE | `ownership_record.domain` present | DOMAIN_OWNERSHIP_CONFIRMED PASS (+ DOMAIN_RESOLVES when available) |
| Professional email — CONFIGURED + DELIVERING | `primary_mailbox` present | MAILBOX_ACTIVE + SEND_TEST_PASS + RECEIVE_TEST_PASS |
| DNS — CONFIGURED | **Any** PASS result (`ownershipGenerator.ts:12`) | MX_MATCHES_EXPECTED PASS |
| Email security — PROTECTED | **Any** PASS result | SPF + DKIM match + DMARC_PRESENT PASS |
| Digital ownership — VERIFIED | Record present | Gate G11 passed **without override**. Override → "VERIFIED BY SITE 00 REVIEW" (honesty marker, F-27) |

**Record summary corrections (F-27).**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "OWNER — ANTHONY TRANSPORT LLC" | `ownership_record.owner = intake.contact_name` (a person) | Owner = `legal_business_name ?? business_name`. Add "PRIMARY CONTACT" separately |
| Primary mailbox shown as the professional address | `primary_mailbox = intake.current_email`, the client's *old* contact email | Source from the PRIMARY_MAILBOX task result |
| "ACCESS MODEL — FULL OWNERSHIP" | `'Client-owned account with SITE 00 setup assistance'` | Keep "FULL OWNERSHIP". Add a "SITE 00 ACCESS: REMOVED / RETAINED (revocable)" field (✕ missing) |
| "COMPLETED ON MAR 15, 2024" (P11.A says 2026) | `artifact.completed_at` | Bind |
| Green ACTIVE pills (live state) | A snapshot at completion. SITE 00 does not monitor afterwards | Pill copy "VERIFIED {date}" |

**Navigation conflict.** The "VIEW RECORDS" row and the "VIEW RECORDS" CTA duplicate each other, and **P11 has no route to P12** (F-29). Minimum correction:

- The row becomes a "WHAT'S NEXT FOR YOUR DOMAIN →" row to P12.
- The CTA stays "VIEW RECORDS" → P11.A.

**States.**

| State | Notes |
|---|---|
| `S-COMPLETE-VERIFIED` | — |
| `S-COMPLETE-OVERRIDE` | — |
| `S-COMPLETE-CREDIT` | Credit teaser line |
| `S-COMPLETE-BUILD-INTEREST` | Interest already captured |
| `S-COMPLETE-REFUNDED` | Edge case: refund after completion |

##### P11.A — RECORDS INDEX · `YOUR RECORDS ALL IN ONE PLACE.` · `IDNTY / 011A` *(board label "13A", corrected)*

**Purpose.** Every delivered record, filterable.

**Data. ✕ No records model (F-28).** Required derived contract (Composer):

```
FoundationRecord {
  record_key: 'DOMAIN' | 'EMAIL' | 'ALIASES' | 'DNS_SECURITY' | 'SIGNATURE' | 'DEVICES' | 'PAYMENT';
  category: 'DOMAIN' | 'EMAIL' | 'SECURITY' | 'PAYMENTS';
  title: string;
  summary: string;              // "5 ADDRESSES CONFIGURED" — derived from quote/task quantities
  status: 'VERIFIED' | 'PENDING' | 'NOT_INCLUDED';
  configured_at: string | null; // the source task's completed_at / verified_at
  fields: Array<{label: string; value: string | null; source: 'TASK' | 'VERIFICATION' | 'FOUNDER' | 'INTAKE'; verified_at: string | null}>;
}
```

**Record sources.**

| Record | Source |
|---|---|
| Domain | DOMAIN_REGISTRATION / DOMAIN_OWNERSHIP tasks |
| Email | PRIMARY_MAILBOX + ADDITIONAL_MAILBOXES quantity (1 + qty) |
| Aliases | `ownership_record.aliases` (the generator always leaves it empty today) |
| DNS + security | DNS_VERIFICATION `verified_at` |
| Signature | SIGNATURE_APPROVED |
| Devices | DEVICE_SETUP tasks (1 + ADDITIONAL_DEVICE qty) |
| Payment | Quote version, `subtotal`, acceptance and `PAYMENT_CONFIRMED` events |

**Tabs** (DF-C28, board kept): ALL · DOMAIN · EMAIL · SECURITY · PAYMENTS. Each tab has an empty state.

**CTA conflict.** "DOWNLOAD ALL RECORDS" has no export contract. Minimum correction for V1: "DOWNLOAD OWNERSHIP SUMMARY", a generated print/PDF of the records above (DF-A12).

##### P11.B — RECORD DETAIL · `← VIEW MY RECORDS` · `IDNTY / 011B`

**Purpose.** One record in depth. The board example is DOMAIN REGISTRATION.

**Conflicts (F-28, F-29).**

| Visual | Source truth | Minimum correction |
|---|---|---|
| Registrar "GoDaddy", registration and expiration dates, auto-renew, privacy protection | Only `domain` and `registrar` (as a provider ID) exist. `renewal_date` is always null. No registrar READ calls happen in V1 | Render fields with `source`/`verified_at`. Unknown values show "NOT RECORDED — CHECK YOUR REGISTRAR". Founder-entered values are marked as such |
| DOCUMENTS tab: "Registration confirmation PDF 245 KB", "DNS settings summary", "Ownership verification" | No document storage. Registrar confirmations belong to the client's own registrar account | DOCUMENTS = the generated SITE 00 summary only, plus "FIND YOUR REGISTRAR RECEIPT" guidance |
| SETTINGS tab | Implies SITE 00 manages registrar settings. No live writes; the client owns the account | Rename to **"WHERE TO MANAGE"**: link-out and steps |
| HISTORY tab | — | Client-safe events for this record |
| Hero: building image with the client's name and an external-link icon | Implies a live website at the domain. Digital Foundation delivers no site | DF-A08 domain plate. The external link appears only if DOMAIN_RESOLVES passed, and opens the bare domain |
| CTA "DOWNLOAD RECORD" | No export contract | "DOWNLOAD SUMMARY" |

---

#### P12 — NEXT THRESHOLD · `YOUR DIGITAL LOCATION.` · `IDNTY / 012`

**Purpose.** An optional, respectful next step: what could live at the domain, with the Foundation credit. **The Foundation is already complete. This parent must never read as a gate.**

**Gate.** `completion_state = COMPLETE` and the `BUILD_UPSELL_V1` flag.

**Data.** `artifact.build_recommendation` (`SIMPLE_BUILD | ADVANCED_BUILD | NONE`; the engine never emits `CUSTOM_BUILD`), `build_readiness`, `credit`, `build_interest`.

**Composition** (board kept): DF-C31 concept preview with the label (exists on the board ✅), DF-C32 credit card, three DF-C18 path rows, CTA, secondary CTA, trust line "YOUR FOUNDATION REMAINS ACTIVE."

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "$200 FOUNDATION CREDIT — VALID FOR 30 DAYS" | `credit.amount_minor`, `credit.expires_at` | "USE BY {date}". The amount is bound |
| CTA "VIEW MY DIGITAL LOCATION" → P12.A "IS LIVE" | Nothing is live. `build-interest` only records an interest enum | CTA "START MY DIGITAL LOCATION" (records `INTERESTED` + the chosen path) |
| Path rows SIMPLE / ADVANCED / CUSTOM | `captureBuildInterest` stores no path (F-30). No BLDR canon for these three labels was found in `shared/site00-bldr-classification` | Add `build_interest_path`. The recommended path gets a `RECOMMENDED` badge |
| Concept preview with client-specific imagery (truck) | No concept-generation contract or asset pipeline (DF-A07) | Founder-supplied or template composition. The label is mandatory |

**States.**

| State | Treatment |
|---|---|
| `S-RECOMMENDED-{SIMPLE\|ADVANCED}` | — |
| `S-NO-BUILD-NEEDED` | `build_recommendation = NONE`. Headline kept. Body: "NOTHING ELSE IS REQUIRED. WHEN YOU'RE READY, START HERE." No credit urgency |
| `S-CREDIT-AVAILABLE / RESERVED / APPLIED / EXPIRED / VOID / NONE` | Expiry is computed client-side from the date; there is no scheduler |
| `S-INTEREST-SAVED` | "SAVED — IT'LL BE HERE" |
| `S-INTEREST-CAPTURED` | "SITE 00 WILL REACH OUT", since there is no notification channel. Contact copy only |
| `S-BOOKED` | — |

##### P12.A — DIGITAL LOCATION LIVE · `YOUR DIGITAL LOCATION IS LIVE.` · `IDNTY / 012A` — **gated future, out of Digital Foundation V1**

**Ruling.** This screen depicts the outcome of a **SITE 00 BLDR build**: a live site, site customization, analytics. None of it exists in the Digital Foundation contracts. The only link to a build is `credit.applied_project_id`.

- **Gate:** a linked build project in `LIVE` status (✕ no contract).
- **Duplicate:** its rows "Domain settings / Email management / Security settings" duplicate P11.A/P11.B. When built, those rows must deep-link into P11.A, not into new management surfaces.
- **Ownership:** classify as a **BLDR child surfaced inside the artifact** (D-05).

---

### BOARD 05 — FOUNDER OPERATIONS (admin-gated, `requireAdmin`)

#### P13 — FOUNDATION PIPELINE · `FOUNDATION PIPELINE.` · `IDNTY / 013`

**Purpose.** Portfolio visibility: the funnel, what needs the founder, and blockers.

**Data.** `GET pipeline` → `{rows: PipelineRow[], attention}`; `GET list`.

**KPI grid** (DF-C33) with canonical derivations:

| Board tile | Derivation | Note |
|---|---|---|
| OPENED | `artifact.opened_at ≠ null` (cumulative) | — |
| QUOTED | `quote_id ≠ null` | — |
| ACTIVE | `payment_state = PAID ∧ completion_state ≠ COMPLETE` | — |
| NEEDS YOU | The founder queue: tasks READY in ASSISTED/EXTERNAL_MANUAL mode, READY_TO_VERIFY, FAILED, REVISION_REQUESTED approvals, review-required quotes (G02) | **`attention.needs_founder` today = `blocker ∨ IN_PROGRESS`, which is nearly every active project (F-33)** |
| BLOCKED | Tasks with `status = BLOCKED` | Today it includes stale `blocker_category` (F-34) |
| BUILD LEADS | `build_interest ∈ {INTERESTED, BOOKED}` | — |

**Pipeline status enum** (✕ none exists; derived). The board's CONFIGURING / AWAITING PAYMENT / IN PRODUCTION / NEEDS CLIENT includes a duplicate: CONFIGURING and IN PRODUCTION both mean "active". Canonical derived enum:

`INVITED · OPENED · INTAKE · QUOTED · REVIEW REQUIRED · AWAITING PAYMENT · ACTIVE · NEEDS CLIENT · WAITING PROVIDER · BLOCKED · VERIFYING · COMPLETE · BUILD LEAD · PAUSED (refund/dispute) · ARCHIVED`

Pre-payment rows show the funnel state. The board's "DISCOVERY" is not a stage.

**Row binding.**

| Field | Binding |
|---|---|
| Business | `intake.business_name ?? lead.business_name`. The list page creates leads without a business name |
| Stage | Earliest non-complete rolled stage. `PipelineRow.current_stage` uses the first IN_PROGRESS *task* and is null when everything is merely READY |

**Children.**

| ID | Child |
|---|---|
| P13.C1 | KPI drill-down: filtered list |
| P13.C2 | Row → P14 |
| P13.C3 | Attention item → P14 anchored to the blocker/action |
| P13.C4 | **NEW FOUNDATION LINK** sheet: contact, business, referral kind → copy personalized URL. **Missing from the board (F-39)**; exists in the current list page |
| P13.C5 | Fixture materializer (QA, non-production only) |

**Copy.** "PAYMENT PENDING · SEND LINK" → "COPY LINK". There is no send channel (F-26).

**CTA.** "VIEW PROJECT COMMAND" with no selected project is ambiguous. Rows navigate. The primary CTA becomes "NEW FOUNDATION LINK", or opens the top attention item.

**States.** `S-EMPTY` (no artifacts: "CREATE YOUR FIRST FOUNDATION LINK"), `S-LOADING`, `S-FORBIDDEN` (403), `S-ERROR`.

---

#### P14 — PROJECT COMMAND · `PROJECT COMMAND.` · `IDNTY / 014`

**Purpose.** A single-engagement control center. It answers the nine `projectCommandAnswers` questions.

**Data.** `GET project-command`, `GET detail`, `GET completion-gate`.

**Row mapping** (board's 8 rows kept, relabelled where the founder/client semantics collide):

| Board row | Canonical binding | Child |
|---|---|---|
| CLIENT | `intake.business_name`, contact | — |
| PAYMENT / CURRENT STAGE / TIMELINE | `payment_state`, rolled stage, forecast | — |
| SCOPE | `purchased_scope.selected_addons` → catalog labels | **P14.C1**: lines, version history, manual adjustment, **review confirmation (G02)** |
| RUNBOOK · {n} TASKS | Non-superseded task count. The base NEED_DOMAIN runbook generates **21 tasks** (board "14" is illustrative) | → **P15.A** |
| NEEDS YOU → **CLIENT OWES** | `what_client_owes`. "Needs you" on a founder surface means the founder (F-33); the client queue is "client owes" | **P14.C3**: create a client action |
| *(not drawn)* **WE OWE** | `what_we_owe_client` | Folded into the RUNBOOK subtitle ("21 TASKS · 3 READY") |
| APPROVALS | Count by status | **P14.C4**: request / resolve, versions |
| PROVIDERS | `ProjectOperationsConfig` → registry labels | **P14.C5**: set providers. **Warning: this supersedes the runbook and resets every task (F-36)** |
| VERIFICATION · n OF m PASS | Required rules with PASS or override / required rules. The base runbook has **9** rules (board "7" is illustrative) | **P14.C6**: rules, results, **overrides (✕ no API, F-38)** |
| BLOCKERS | `extractBlockers` (corrected per F-34) | **P14.C7** |
| RECORDS | `ownership_record` presence | **P14.C8**: generate / edit ownership |
| BUILD RECOMMENDATION / FOUNDATION CREDIT | `build_recommendation`, credit | **P14.C9**: reserve, apply, expire. **✕ No admin actions** (the service functions exist, F-38) |

**Missing children.**

| ID | Child |
|---|---|
| **P14.C10** | Completion gate: the `assessArtifactCompletion` reasons. CTA "COMPLETE FOUNDATION". Override requires a reason |
| **P14.C11** | Full event ledger |
| **P14.C12** | Client link: copy, **preview as client without marking OPENED (F-12)** |

**CTA rule.**

| Condition | CTA |
|---|---|
| Gate passes | "COMPLETE FOUNDATION" |
| Pre-payment | "REVIEW SCOPE" |
| Otherwise | "OPEN EXECUTION WORKBENCH" (board) |

**States.** `S-PRE-PAYMENT` (intake/quote/awaiting payment: the board assumes paid), `S-REVIEW-REQUIRED`, `S-ACTIVE`, `S-RUNBOOK-NOT-ACTIVE` (after set-providers, F-36), `S-GATE-READY`, `S-COMPLETE`, `S-PAUSED` (refund/dispute).

---

#### P15 — EXECUTION WORKBENCH · `RUN THE FOUNDATION.` · `IDNTY / 015`

**Purpose.** Task orchestration for the current stage, by status bucket and execution mode.

**Data.** `GET workbench` → `{buckets, by_mode, command}`.

**Composition** (board kept): current-stage card, DF-C36 task rows, DF-C38 metric triad, runbook row, next-action row, CTA.

**Conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "SPF RECORD — AUTOMATED — PASS" | Runbook SPF is ASSISTED. AUTOMATED has `live_writes_enabled: false` in V1, and no task is AUTOMATED | Mode from the task. The AUTOMATED chip is hidden in V1 |
| "GOOGLE ADMIN ACCESS — CLIENT ACTION" | The runbook generates **no provider-access task** (PROVIDE_PROVIDER_ACCESS is never produced). Doctrine scope lists "provider access" | Composer adds an access task per selected provider (F-31a) |
| "REGISTRAR LOCK CHECK — EXTERNAL MANUAL" | The closest task is `registrar_security` "Registrar security / 2FA guidance" (ASSISTED) | Bind to real tasks; the label comes from the task |
| Status column mixes PASS / RECEIVED / READY / PENDING | Task status and verification result are different enums | Two signals: **status chip** (task) + **result glyph** on VERIFICATION tasks only |
| "EXPECTED VALUE 7/7 · CURRENT VALUE 5/7 · MATCH STATE ON TRACK" | Per-rule `expected_value` / `current_value` strings. `match_state ∈ {UNKNOWN, MATCH, MISMATCH, MISSING}` | Relabel "RULES 9 · PASSING 5 · STATE ON TRACK / ATTENTION" (derived) |
| "RUN VERIFICATION" | `verify-task {pass: boolean}` is a manual declaration; no resolver lookup exists | "RECORD VERIFICATION RESULT" until an automated check exists |

**Bucket gap (F-35).** `groupWorkbenchTasks` has no bucket for **FAILED** or **NOT_READY**, so failed tasks disappear from the workbench. Add `failed` (counted as attention) and `upcoming`.

**Missing task actions (F-37).**

- Clear blocker / resume.
- Skip task (SKIPPED exists).
- Retry after FAILED (works only implicitly through `complete-task`).
- Per-rule verification result (today one `pass` flag applies to every rule on the task).

**States.**

| State | Notes |
|---|---|
| `S-NO-RUNBOOK` | Pre-payment: "RUNBOOK GENERATES ON PAYMENT" |
| `S-RUNBOOK-READY-NOT-ACTIVE` | CTA "ACTIVATE RUNBOOK" |
| `S-ACTIVE` | — |
| `S-FAILED-TASKS` | — |
| `S-ESCALATED` | — |
| `S-ALL-COMPLETE` | CTA → P14.C10 gate |
| `S-SUPERSEDED-HISTORY` | View-only |

##### P15.A — RUNBOOK AT A GLANCE · `YOUR RUNBOOK AT A GLANCE.` · `IDNTY / 015A`

**Data.** Runbook + buckets + `by_mode`.

**Tile conflict.** The board's tiles (TOTAL / READY / IN PROGRESS / BLOCKED / VERIFYING / COMPLETED) sum only because the example omits NOT_READY tasks. On a real runbook most tasks start NOT_READY.

- Add an **UPCOMING** tile and a **FAILED** tile (F-35), or define TOTAL as the sum of the shown tiles.
- Mode counts must show **AUTOMATED 0** in V1.
- The name "DOMAIN + EMAIL FOUNDATION" must derive from scope (base or with add-ons).

**CTA.** "OPEN RUNBOOK" → P15.B.

##### P15.B — RUNBOOK TASKS · `DOMAIN + EMAIL FOUNDATION RUNBOOK.` · `IDNTY / 015B`

**Data.** Ordered tasks, numbered by generation order (stable `task_key` order), dependency IDs rendered as numbers.

**Tabs** (board kept): OVERVIEW · TASKS · DEPENDENCIES · VERIFICATION.

**Dependency graph conflict (F-32; founder/Composer decision D-07).**

| Task | Board depends on | Generator `depMap` | Ruling |
|---|---|---|---|
| DKIM | MX, SPF | `primary_mailbox` | **Keep the generator.** The provider issues the DKIM key after mailbox/workspace setup |
| DMARC | DKIM | `spf` | **Adopt the board, as DMARC depends on SPF + DKIM** (alignment needs both) → Composer change |
| Signature approval | DKIM | `signature_create` | **Keep the generator** |
| Send test | DMARC, signature approval | `mx` | **Keep the generator** |
| Ownership record | Send test, receive test | *(none)* | **Adopt the board**; it also fixes F-21 |

**Other conflicts.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| Modes AUTO / MANUAL | Enum: ASSISTED / EXTERNAL_MANUAL / VERIFICATION / CLIENT_ACTION | Bind to the task's mode |
| Status PENDING | No such status; the enum value is NOT_READY | Render NOT_READY as "UPCOMING" |
| "5 / 10 · 50%" | — | (COMPLETE + VERIFIED + SKIPPED) / non-superseded total |

**CTA.** "VIEW VERIFICATION FLOW" → VERIFICATION tab.

##### P15.C — TASK DETAIL · `{TASK} TASK DETAIL.` · `IDNTY / 015C`

**Tabs** (board kept): DETAIL · EXECUTION · DEPENDENCIES · VERIFICATION.

**Data gaps (F-31).**

- **Per-task rules exist only on VERIFICATION-mode tasks.** The `MX_CONFIGURE` rule branch is dead code (`runbookGenerator.ts:490–494`; MX is ASSISTED). A DKIM task therefore has **no** rule, no expected value and no current value.
- `expected_value` is **always null**. The generator has no provider-derived record values.
- "EST. TIME 5–10 MINUTES" has no field.
- The checklist steps (format valid / detected / propagation / validation / unlocks) are not `VerificationCheckKind` values. Only `DKIM_PRESENT` and `DKIM_MATCHES_EXPECTED` exist.

**Copy and binding corrections.**

| Visual | Source truth | Minimum correction |
|---|---|---|
| "OWNER — ANTHONY TRANSPORT LLC" on an ASSISTED task | The assignee is the founder (`assigned_actor`); the client owns the DNS zone | Two cells: "ASSIGNED: SITE 00" · "ZONE OWNER: CLIENT" |
| "UNLOCKS DMARC RECORD (TASK 06)" | — | Derive from reverse dependencies |
| DKIM `p=` value | A public key; safe for the founder surface | DF-C39 copy field. Never needed on client surfaces |

**CTA.** "RECORD VERIFICATION RESULT" (manual V1) with PASS / FAIL + observed value. FAIL requires a reason.

---

## 07 — Findings register

### 07.1 — Contract findings (Composer)

| ID | Sev | Finding | Evidence | Minimum fix |
|---|---|---|---|---|
| **F-01** | BLOCKER | The public API imports `../../../shared/...quoteEngine.js`, which resolves **outside the repo**. The handler module cannot load, so every client parent is dead. Tests don't import handlers, so 22/22 hides it | `api/site00/digital-foundation-artifact.ts:18` (siblings correctly use `../../shared`) | `../../shared/site00-digital-foundation/quoteEngine.js`. Add a handler smoke test |
| **F-02** | BLOCKER | All state lives in a process-memory singleton. The Supabase migration (11 tables) is unused. No operations tables exist (runbooks, tasks, rules, results, overrides, forecasts, project config). On serverless, one link cannot persist across invocations | `memoryStore.ts`; no `supabase` usage in `api/_lib/digitalFoundation/` | Repository layer over the migration + an operations migration |
| **F-03** | BLOCKER | No client approval decision. `complete-client-action` completes the linked task on **any** response, so REQUEST CHANGE would approve. `task.approval_id` is never set. The gate matches approvals by subject substring | `service.ts:483–505`, `completionGate.ts` | `resolve-approval` public action; approval ↔ task link; revision loop |
| **F-04** | BLOCKER | The public payload returns raw events (operations `actor: 'OPERATIONS'`, escalation `reason`, override `reason`, `scope_hash`, task IDs) and the internal referral label | `service.ts:708`, `operationsEngine.ts:23–32` | Client-safe event allowlist + strip `referral_source` from the public payload |
| **F-05** | MAJOR | Surface resolver: refunded or disputed → `PROSPECT` (P01 BEGIN). Archived → `PROSPECT`. `COMPLETE` is unreachable (always BUILD_OPPORTUNITY). `RECOMMENDATION` is unreachable | `surface.ts`, `service.ts:450–457, 611, 212–248` | Add PAUSED / ARCHIVED surfaces. COMPLETE when `build_interest = NONE` |
| **F-06** | MAJOR | (a) Production without a Stripe key falls back to a **simulated** checkout. (b) Session metadata does not reach the PaymentIntent (`payment_intent_data[metadata]` is unset), so `payment_intent.payment_failed` and `charge.refunded` cannot find the artifact. (c) Cancel and expiry are not recorded (`checkout.session.expired` is unhandled). (d) The webhook marks a **superseded** quote PAID without an amount or version check | `stripeHostedCheckout.ts:74–83`, `webhookHandler.ts`, `service.ts:388–415` | Production guard; PI metadata; handle expiry; reject a superseded or mismatched quote |
| **F-07** | MAJOR | `acceptQuote` and `createCheckoutSession` ignore `requires_manual_review`, `expires_at` and $0 custom lines | `service.ts:297–386` | G02 + G04 |
| **F-08** | MAJOR | `NEED_DEVICE` charges ADDITIONAL_DEVICE_SETUP for the included first device, and the runbook then creates two device tasks. `NEED_DNS_SECURITY` (labelled "DNS / email security help" in the shell and "Email security — SPF, DKIM, DMARC setup" on the board) adds a $150 manual-review cleanup for included baseline security | `recommendationEngine.ts:13–21, 51–60` | Device add-on only for devices beyond the first. Re-map the DNS flag semantics (P03 ruling) |
| **F-09** | MAJOR | No readiness-clock model (doctrine §03). The forecast starts at payment and is expressed as a duration string, not a date | `forecast.ts`, `service.ts:701–706` | `readiness: {intake, info, access, domain_approval, payment}` + `clock_started_at` + projected date |
| F-10 | MAJOR | The board disclosures differ from the server's exact-string disclosures. The board's "payment activates production" contradicts doctrine | `service.ts:310–316` | Render canonical text; move to disclosure IDs |
| F-11 | MAJOR | `terms_version` exists but no terms content exists | `commercialConfig.ts` | Terms document (founder) |
| F-12 | MINOR | Any payload read marks INVITED → OPENED, including founder clicks on "Public" | `service.ts:151–166` | `preview=founder` read path |
| F-13 | MINOR | Error → HTTP mapping turns domain errors (`QUOTE_LOCKED`, `INTAKE_LOCKED_AFTER_PAYMENT`, `CHECKOUT_NOT_ALLOWED`, `INVALID_ARTIFACT_TRANSITION`) into 500s | `digital-foundation-artifact.ts` catch | 409/422 mapping so the UI can render states |
| F-14 | MAJOR | Intake save/resume is broken in the shell: the form never loads saved answers, and blank fields overwrite saved values | `DigitalFoundationArtifactPage.tsx:60–65, 97–100` | Load from the payload; patch only dirty fields |
| F-15 | MAJOR | No reopen-intake. Re-completing intake from QUOTE_READY throws `INVALID_ARTIFACT_TRANSITION`. Editing without completing leaves the quote stale while the recommendation changes | `service.ts:168–248`, `lifecycle.ts` | `reopen-intake`: QUOTE_READY → RECOMMENDATION_READY → INTAKE_IN_PROGRESS, supersede the quote |
| F-16 | MINOR | No intake representation for domain *transfer* or for preferred domain names (P03 "register, transfer or connect"; the brief's "domain choices") | `types.ts` IntakeNeedFlag | `NEED_TRANSFER` flag → DOMAIN_TRANSFER; `preferred_domains[]` |
| F-17 | MINOR | `update-quote` accepts selections that violate dependencies (only `remove-addon` validates) | `service.ts:250–295` | Validate on update |
| F-18 | MINOR | Every add-on click creates a new quote version. `quoteEngine` imports `node:crypto`, so the browser cannot preview locally | `quoteEngine.ts:1` | Browser-safe pure pricing module; debounce |
| F-19 | MINOR | No activation acknowledgement. If runbook generation fails after PAID, a webhook retry skips generation | `service.ts:388–440` | `activation_acknowledged_at`; idempotent runbook ensure |
| **F-20** | BLOCKER (P09) | The public payload has no task projection | `getArtifactPayload` | `client_tasks` contract (P09) |
| F-21 | MAJOR | The rollup counts READY as IN_PROGRESS, and `ownership_record` has no dependencies, so several stages are "active" on day one | `stageRollup.ts:15–20`, `runbookGenerator.ts:465–479` | READY-only → WAITING; ownership dependencies |
| F-22 | MINOR | `artifact.project_state` and the WAITING_ON_* artifact states never update from operations | `operationsEngine.ts:145–163` | Derive or sync |
| F-23 | MINOR | `syncDerivedState` runs asynchronously *after* the payload reads the stages, so responses can be stale | `service.ts:686–689, 502` | Sync before read |
| F-24 | MINOR | Client action titles and details reuse internal task wording, e.g. "Email signature approved" and "Domain availability and selection" | `operationsEngine.ts:120–143` | `client_label` / `client_detail` per task type, phrased as requests |
| F-25 | MAJOR | No signature data contract (preview fields, version) | — | `signature_create.result_metadata` schema + client projection |
| F-26 | MAJOR | No notification system. Copy on P06, P08, P09 and P13 promises notifications | — | Copy correction now; notification contract later |
| F-27 | MAJOR | Ownership record: `primary_mailbox = current_email` (the old address), `owner = contact_name` (a person), and DNS/security derived from *any* PASS. A founder override is invisible to the client | `ownershipGenerator.ts:12–23` | Per-check derivation; `verification_basis`; `site00_access_status` |
| F-28 | MAJOR | No records model, document storage or export | — | `FoundationRecord[]` + a generated summary |
| F-29 | MAJOR | P12.A depicts BLDR outcomes. No P11 → P12 navigation on the board | — | Gate P12.A; add a P11 row to P12 |
| F-30 | MINOR | `captureBuildInterest` stores no chosen path. Credit expiry is manual; there is no scheduler | `service.ts:627–642, 723` | `build_interest_path`; date-derived expiry |
| F-31 | MAJOR | Per-config-task verification rules are missing (dead MX branch). `expected_value` is always null. One pass flag covers every rule on a task. (a) No provider-access task in the runbook | `runbookGenerator.ts:489–515`, `operationsEngine.ts:212–243` | Rules per configure task; per-rule results; access tasks |
| F-32 | MINOR | The DMARC dependency (SPF only) is weaker than best practice (SPF + DKIM) | `runbookGenerator.ts:471` | D-07 |
| F-33 | MAJOR | `pipelineAttentionQueries`: `needs_founder` = blocker ∨ IN_PROGRESS (nearly everything); `waiting_clients` = any READY task on a paid project | `p13Pipeline.ts:60–70` | Founder-queue and open-client-action definitions (P13) |
| F-34 | MAJOR | Stale blockers: `extractBlockers` counts any `blocker_category`. A verification FAIL then PASS, or an escalation, leaves the category set permanently, and the forecast stays extended | `blockers.ts:13`, `operationsEngine.ts:195–243` | Clear the category on resolution; count only BLOCKED/FAILED |
| F-35 | MAJOR | Workbench buckets omit FAILED and NOT_READY | `p15ExecutionWorkbench.ts:14–25` | Add buckets |
| F-36 | MAJOR | `set-providers` supersedes the runbook (`scopeHash` includes `project_config`). Completed work resets to NOT_READY, the new runbook stays READY (not ACTIVE), and old client actions stay OPEN, which duplicates Needs You | `operationsEngine.ts:338–346, 58–102` | Carry state over by `task_key`; cancel orphaned requests; re-activate |
| F-37 | MINOR | No unblock, skip or explicit retry task actions | admin API | Add actions |
| F-38 | MINOR | No admin actions for credit reserve/apply/expire or manual verification override (the service functions exist) | `api/admin/site00-foundation.ts` | Expose |

### 07.2 — Visual authority findings (Opus / Founder)

| ID | Finding | Resolution |
|---|---|---|
| F-39 | P13 has no "create link" entry; the founder's primary acquisition action is missing | P13.C4 + primary CTA |
| F-40 | The hamburger menu contents are undefined on all 15 boards. No help/contact path exists anywhere | Define DF-C48 per surface. Add "QUESTIONS? CONTACT SITE 00" to the menu and the error states |
| F-41 | Icon collisions across boards (⇄, envelope, cloud) | Canonical icon map (DF-A05) |
| F-42 | Child Board 04 is labelled "13A" with a footer of `011` | Renumber 11A / 11B / 12A |
| F-43 | Board example values contradict each other (3–5 vs 2–3 for the same client; 2024 vs 2026) | Bind everything to data (§00.4) |
| F-44 | The boards introduce green and blue status color outside WHITE/BLACK/RED | D-03 |
| F-45 | Only the happy path is drawn. **No board covers** loading, error, invalid link, expired quote, review-required, checkout canceled/pending/failed, quote changed, refund/pause, needs-you on P07/P08, revision requested, override completion, no-build-needed, credit expired, empty pipeline, pre-payment P14/P15, failed tasks | §07.4 list |
| F-46 | Founder boards are mobile. The current founder console renders in the desktop admin shell (`Site00AdminRoutes`) | D-10 |

### 07.3 — Unnecessary duplicates

| Duplicate | Resolution |
|---|---|
| P10 inline APPROVE / REQUEST CHANGE **and** primary "REVIEW APPROVAL" | The inline pair is the decision. The primary CTA turns into navigation |
| P11 "VIEW RECORDS" row **and** "VIEW RECORDS" CTA | The row becomes the P12 entry |
| P09 CTA "VIEW RECORDS" duplicates P11 (and is premature) | Remove from P09 |
| P12.A Domain / Email / Security settings rows vs P11.A/P11.B | Deep-link into P11.A |
| P13 statuses CONFIGURING vs IN PRODUCTION | One canonical "ACTIVE" |
| P15 "VIEW RUNBOOK" → P15.A "OPEN RUNBOOK" → P15.B: three hops to the task table | P15 → P15.B directly. P15.A is reached from the P14 RUNBOOK row |
| P15.A execution-mode counts vs P15 `by_mode` | One component (DF-C33 variant), two placements |
| Forecast shown on P06, P07 and P08 with different example values | One forecast binding + one sheet (P07.C1) |
| Signature approval as both `ClientActionRequest(APPROVE_SIGNATURE)` and `ApprovalRecord` | ApprovalRecord is authoritative; the client action is its queue entry (F-03) |
| P03 needs tiles vs P04 included list | Same labels, same icons; P03 core tiles visually match P04 included rows |

### 07.4 — Missing experiences (must be designed; no board exists)

1. Invalid / closed / disabled link (P01 states).
2. Intake validation and resume (P02).
3. Reopen needs after recommendation (P03 `S-REOPENED`).
4. The full add-on catalog sheet (P04.C1) and quantity steppers.
5. Review-required quote (P04 and P05, plus the founder side in P14.C1).
6. Expired quote (P04/P05).
7. Checkout: confirming, slow, canceled, failed, unavailable, quote changed (P05).
8. Terms sheet (P05.C2).
9. Activation with Needs You; activating; paused/refunded (P06).
10. Portal: needs-you, provider-wait, paused, final-checks and delayed variants (P07/P08).
11. P09 for each of the 7 stages (only Domain is drawn).
12. P10 children C2–C12 (only signature is drawn), queue of N items, submitted, revision, empty.
13. P11 override-honesty variant; P11 → P12 navigation.
14. P11.A empty tabs; the ownership summary document (DF-A12).
15. P12 no-build-needed; credit expired/applied; interest captured.
16. P13 empty pipeline; new-link sheet.
17. P14 pre-payment; completion gate; override with reason; client preview.
18. P15 no runbook; runbook not active; failed / escalated / blocked tasks; skip/unblock.
19. Menu drawer (client, founder) and the help/contact path.
20. Desktop presentation for the client artifact (rhythm says MOBILE ONLY; confirm it uses the SITE 00 mobile artboard shell on desktop).

---

## 08 — Founder decisions required (not invented here)

| ID | Decision | Recommendation |
|---|---|---|
| D-01 | Do manual-review add-ons block checkout until the founder confirms? | **Yes for all manual-review lines.** There is no partial-refund or extra-charge flow if the price moves after payment |
| D-02 | What may the client see of the runbook on P09? | All non-superseded tasks, with canonical client labels; never notes, reasons or providers |
| D-03 | Ratify a functional status palette (green `done`, blue `verify`), or keep the strict WHITE/BLACK/RED fallback | Ratify green for `done` only; drop blue |
| D-04 | Notification channel (email/SMS) for Needs You and completion | Needed before launch. Until then, correct the copy (F-26) |
| D-05 | Which product owns P12.A? | BLDR, surfaced inside the artifact when a linked build is live |
| D-06 | Handwritten signature mark | Remove, or allow a client-supplied mark only |
| D-07 | Dependency changes: DMARC after SPF + DKIM; ownership record after the tests | Adopt both |
| D-08 | May the client ever see the referral source? | No |
| D-09 | Business type list and business location field on P02 | Keep both optional; define the industry list; location as city/state |
| D-10 | Founder operations form factor | Mobile-first inside the admin shell, per Board 05 |
| D-11 | Offer Expedited? | Hidden until `expedited_premium_minor` is set |
| D-12 | Capture an email provider preference at P03? | Optional "GOOGLE / MICROSOFT / NOT SURE" feeding the founder's provider choice |

---

## 09 — Canonical state catalog (all enums, with the parents that render them)

| Enum (source) | Values → parent |
|---|---|
| `DigitalFoundationArtifactState` (17) | INVITED, OPENED → P01 · INTAKE_IN_PROGRESS → P02/P03 · INTAKE_COMPLETE, RECOMMENDATION_READY (transient) · QUOTE_READY, AWAITING_ACCEPTANCE → P04/P05 · AWAITING_PAYMENT → P05 · PAID, PROJECT_ACTIVE (transient) → P06 · IN_PROGRESS, WAITING_ON_CLIENT, WAITING_ON_PROVIDER (never set, F-22) → P07–P10 · FINAL_VERIFICATION (transient) → P07 · COMPLETE, BUILD_OPPORTUNITY → P11/P12 · ARCHIVED → P01 `S-ARCHIVED` |
| `PaymentState` (6) | NONE → P01–P04 · CHECKOUT_PENDING → P05 confirming/canceled · PAID → P06+ · FAILED → P05 `S-FAILED` · REFUNDED, DISPUTED → `S-PAUSED` (missing) |
| `QuoteStatus` (7) | DRAFT, READY, CLIENT_REVIEW → P04 · ACCEPTED → P05 locked · SUPERSEDED → history (P14.C1) · EXPIRED (never set) → P04/P05 `S-EXPIRED` · PAID → P11.A Payments |
| `IntakeState` (3) | NOT_STARTED → P01 · IN_PROGRESS → P02/P03 · COMPLETE → P04+ |
| `CompletionState` (3) | NOT_STARTED / IN_PROGRESS → portal · COMPLETE → P11 |
| `ProjectStageStatus` (6) | → P08 nodes, P09 header (§06 P08 table) |
| `ClientActionRequest.status` (3) | OPEN → P10 queue · COMPLETED → P10 `S-SUBMITTED`, P07 activity · CANCELLED → P10 `S-CANCELLED` |
| `ApprovalRecord.status` (3) | REQUESTED → P10 · APPROVED → P09/P11 · REVISION_REQUESTED → P10 `S-REVISION-REQUESTED` |
| `FoundationBuildCreditStatus` (5) | → P12, P14.C9 |
| `BuildInterestState` (4) | → P12, P13 BUILD LEADS |
| `BuildRecommendationLevel` (4) | SIMPLE / ADVANCED / NONE → P12 (CUSTOM is never emitted) |
| `RunbookStatus` (9) | DRAFT (transient), READY → P15 `S-RUNBOOK-READY-NOT-ACTIVE` · ACTIVE → P15 · BLOCKED / WAITING_CLIENT / WAITING_PROVIDER / VERIFYING (never set) · COMPLETE → P14 · SUPERSEDED → history |
| `ExecutionTaskStatus` (13) | → P15 / P15.B / P15.C chips; client projection (P09 table) |
| `ExecutionMode` (5) | → DF-C37 (AUTOMATED hidden in V1) |
| `VerificationStatus` (6) | → P15.C result glyph, P14.C6 |
| `BlockerCategory` (10) | → P13 / P14.C7 (founder only); client sees "RESOLVING" / "PAUSED" |
| `ReferralFunnelStage` (9) | → P13 KPIs (founder only) |

---

## 10 — Recommended sequencing

1. **Composer, contract hotfix sprint** (before any visual build): F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-20, F-14, F-15. Plus a handler smoke test that imports both API modules.
2. **Founder decisions:** D-01 through D-12, terms content (F-11), notification stance (F-26).
3. **Opus, visual authority build:**
   - Shell components DF-C01–C09 and assets DF-A01–A06, A10.
   - Then Board 01 → 02 → 03 → 04 with every state in §06.
   - Then Board 05 on the corrected P13 attention contract (F-33, F-34, F-35).
4. **Composer, operations follow-up:** F-21, F-31, F-32, F-36, F-37, F-38, records model F-28, build path F-30.

Composition, typography, threshold objects and red/black/white rhythm are preserved throughout. Every correction above is the minimum change to copy, binding or control type that makes a board faithful to the implemented and doctrinal truth.
