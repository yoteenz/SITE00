# SITE 00 / Studio World — Master Assurance Audit

**Date:** 2026-08-23  
**Mode:** Audit only — no large-scale remediation performed  
**Audit confidence:** HIGH (codebase evidence) / MEDIUM (production runtime — not live-spend verified)  
**Tests at audit time:** 1508 pass · build pass

---

## Executive summary

SITE 00 / Studio World is **not one coherent operational product yet**. It is a **constellation of sophisticated subsystems** — many with strong types, gates, tests, and methodology contracts — that are **not fully joined at the persistence and live-verification layers**.

What genuinely works today:

- **Brand intelligence persistence** (Brand Lore → Supabase) with synthesis gates blocking public discovery from creating production profiles
- **Discovery → recommendation → post-purchase intelligence manifest** architecture (recent, well-tested)
- **Experimental integrity patterns** for Experiment D (frozen) and Experiment F (blind formation, quarantine, concept-before-direction)
- **Visual reference + workspace canon methodology** as code contracts (authority roles, host/client separation, implementation contracts)

What is **overstated as ready**:

- **Experience Expression + Visual Development** — UI and services exist; runs live in **process memory** and vanish on API restart
- **Reference-conditioned generation** — adapter code passes `image_urls` to GPT Image 2 edit; **no recorded live production proof**
- **ORCHESTRATE IMPLEMENTATION** — returns an ID; **does not dispatch to Composer**
- **Implementation fidelity loop** — evaluator returns `NOT_EVALUATED` by design until evidence wired
- **1508 tests** — strong for gates and constants; **heavy provider mock** → false production confidence

**Single biggest architectural risk:** Ephemeral in-memory stores for the exact workflows the product sells (creative runs, proofs, experiments).

**Recommended next action (P0):** **Durable Run Persistence Sprint** — migrate Experiment E, visual development, project intelligence, and visual reference memory to Supabase using existing `storeAdapter` patterns.

---

## North star alignment

| Intended chain stage | Repository status | Readiness |
|---------------------|-------------------|-----------|
| Commercial discovery | Implemented + gated | INTEGRATED |
| Purchase / activation | Partial (pilot shortcuts) | LIVE_PATH_UNVERIFIED |
| Deep project intelligence | Manifest compiler exists | IMPLEMENTED_ISOLATED (memory) |
| Shared brand intelligence | Brand Lore Supabase | LIVE_PATH_VERIFIED |
| Concept formation | Experiment F integrated | INTEGRATED (persistence fragile) |
| Expression / visual dev | Full service stack | LIVE_PATH_UNVERIFIED |
| Asset production (FAL) | Code complete | LIVE_PATH_UNVERIFIED |
| Founder approval | Gates exist | INTEGRATED |
| Implementation contract | Compiler works | INTEGRATED |
| Composer orchestration | **Stub** | SCAFFOLDED |
| Fidelity review | **Scaffold** | SCAFFOLDED |
| World Formation | Contracts only | SCAFFOLDED (correct) |

The **GRAPHIC → PAGE** branch is furthest along conceptually; **PAGE → PRODUCT → WORLD** lacks formal Product Expression and runtime World Formation (correctly deferred).

---

## System capability inventory

Machine-readable: `audit/readiness-matrix.json`, `audit/system-capability-inventory.json` (subset).

**Counts (key capabilities audited):** 30 discovered · 1 production-ready · 12 integrated · 5 scaffolded · 9 live-path-unverified · 1 deprecated

---

## Dependency graph (actual, not aspirational)

See `audit/system-dependency-graph.json`.

**Critical runtime gaps:**

1. `VisualReferencePackage` → `FAL` — wired in code; **live proof absent**
2. `ImplementationContract` → `Composer` — **no consumer**
3. `Composer` → `FidelityReview` — **not implemented**

**Duplicate source-of-truth risks:**

- Experiment/run state: memory vs Supabase vs `site00_methodology_validation_runs` JSONB
- Commercial state: payment records vs `ndxbook`/`frontal-slayer` pilot shortcuts

---

## Top 10 risks

| # | ID | Title | Severity |
|---|-----|-------|----------|
| 01 | MA-001 | Ephemeral memory stores for critical creative runs | CRITICAL |
| 02 | MA-002 | Composer orchestration stub | CRITICAL |
| 03 | MA-006 | Test suite false readiness (mock-heavy) | HIGH |
| 04 | MA-007 | Reference-conditioned FAL never live-verified | HIGH |
| 05 | MA-008 | Playwright capture unverified on Railway | HIGH |
| 06 | MA-003 | Implementation fidelity never evaluates | HIGH |
| 07 | MA-005 | NDXBOOK-only runtime hardcoding | HIGH |
| 08 | MA-009 | No unified run telemetry / cost ledger | HIGH |
| 09 | MA-004 | MEMORY.md merge conflict (fixed in audit) | HIGH |
| 10 | MA-010 | Concept orthogonality V2 heuristic-only | MEDIUM |

Full findings: `audit/findings.json` (20 documented with remediation detail).

---

## Domain summaries

### Experimental integrity

- **Experiment C:** Superseded — read-only legacy carousel path
- **Experiment D:** Strong preservation — frozen snapshot v1, overlay interpretation, historical six intact
- **Experiment E:** Methodology rich; **always memory store** — research records not durable
- **Experiment F:** Strong blind formation / quarantine; Supabase fallback silent → memory

### Concept / direction / format hierarchy

Experiment F correctly enforces concept-before-direction. Experiment D historically collapsed directions into pseudo-concepts (documented). Risk: V2 orthogonality uses **local heuristics**, not Sonnet set audit — may repeat D failure mode at PASS.

### Discovery → purchase → intelligence

`intakeSynthesisGate` is real and tested. **Purchase ≠ readiness** encoded. Pilot commercial shortcuts weaken end-to-end verification.

### Visual reference intelligence

Excellent contract layer (authority, conflict hierarchy, provider registry). **Capture + reference-conditioned generation** = LIVE_VERIFICATION_REQUIRED.

### Implementation chain

`prepareVisualDevelopmentImplementation` compiles real contracts. `orchestrateVisualDevelopmentImplementation` is a **placeholder**. Do not treat ORCHESTRATE button as production automation.

### Providers

Anthropic: multiple live call sites; formation accounting partial.  
FAL: correct GPT Image 2 / edit split; vitest bypass.  
Playwright: optional import; deployment dependency unclear.

### Security / multi-tenancy

Project isolation via auth on API routes — OK for pilot. Most creative endpoints **ndxbook-only**. No payload minimization policy for AI providers. Concurrency/judgment races unaddressed.

### World Formation

Correctly unimplemented. Contracts extensive; missing explicit blockers for presence/sync/economy/moderation — see MA-013.

---

## Continue / pause matrix

| Workstream | Status | Why |
|------------|--------|-----|
| NDXBOOK Six-Concept Reformation | **CONTINUE_WITH_CAUTION** | Methodology ready; persist runs before research conclusions |
| Projects UX / Visual Reference | **CONTINUE_WITH_CAUTION** | Do not claim production-ready until live FAL+capture proof |
| Public discovery | **SAFE_TO_CONTINUE** | Gates solid |
| Post-purchase intelligence | **CONTINUE_WITH_CAUTION** | Persist manifest |
| Experience Expression | **CONTINUE_WITH_CAUTION** | Memory-only |
| Experience Asset Direction | **CONTINUE_WITH_CAUTION** | Same pipeline |
| Implementation orchestration | **PAUSE_PENDING_FIX** | Composer stub |
| Product Expression | **BLOCKED** | Not defined; prerequisites missing |
| World Formation | **BLOCKED** | Correctly deferred |

---

## Strategic answers (from repository evidence)

1. **Coherent product vs disconnected systems?** Several systems, **not fully joined** — persistence and orchestration gaps.
2. **Studio World genuinely functioning?** **Brand intelligence + discovery gates + experiment integrity contracts** — yes. **End-to-end creative production ops** — no.
3. **Overstated readiness?** Visual dev, reference intelligence, test PASS, ORCHESTRATE button, Experiment E durability.
4. **Biggest architecture risk?** Ephemeral stores for sold workflows.
5. **Biggest methodology risk?** Heuristic concept orthogonality may repeat Experiment D false PASS.
6. **Biggest UX/product risk?** Founder-facing actions imply automation that stops at JSON/contracts.
7. **Biggest scale risk?** Memory stores + ndxbook hardcoding + no run ledger.
8. **Biggest AI/provider risk?** Unverified reference-conditioned edit; model deprecation without unified capability registry enforcement at runtime.
9. **Most important missing capability?** **Durable run persistence + unified execution telemetry.**
10. **Overbuilt?** World Formation future contracts (appropriate as scaffold); duplicate storeAdapter boilerplate.
11. **Underbuilt?** Composer dispatch, fidelity loop, Product Expression, generation ledger.
12. **Do NOT build yet?** World Formation runtime, Product Expression implementation, autonomous canon promotion.
13. **SELECT WORLD legitimacy?** Requires presence/economy/moderation/sync architecture — not present; risk of expensive immersive site tier.
14. **Reliable autonomous creative direction?** Requires durable state + live-verified gates + cost ledger + non-heuristic distinctiveness audit.
15. **Minimum trustworthy corrections?** P0 persistence + live verification registry + fix orchestration stub before scaling founder reliance.

---

## Remediation roadmap

See `audit/remediation-roadmap.json` for P0–P5 sprint groupings.

---

## Audit artifacts index

| File | Purpose |
|------|---------|
| `audit/findings.json` | 20 findings with severity, evidence, remediation |
| `audit/readiness-matrix.json` | Capability readiness classifications |
| `audit/system-dependency-graph.json` | End-to-end graph + gaps |
| `audit/provider-capability-audit.json` | Provider matrix + live gaps |
| `audit/live-verification-gaps.json` | LIVE_VERIFICATION_REQUIRED list |
| `audit/provenance-audit.json` | Source of truth + leakage risks |
| `audit/state-machine-audit.json` | Lifecycle coherence |
| `audit/remediation-roadmap.json` | P0–P5 + continue/pause matrix |

---

## Tests / build

- **Existing:** 1508 tests pass — classified mostly UNIT_LOGIC + PROVIDER_MOCK + EXPERIMENT_INTEGRITY
- **New audit tests:** `audit/auditArtifacts.test.ts` — artifact file integrity only
- **BUILD:** pass at audit time
- **No large remediation performed:** true
- **WORLD_FORMATION_IMPLEMENTED:** false
