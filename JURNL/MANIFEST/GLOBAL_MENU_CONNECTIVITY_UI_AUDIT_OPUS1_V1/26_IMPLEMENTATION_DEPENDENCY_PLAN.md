# 26 · Implementation dependency plan (not executed)

The phases follow sprint §31. They are re-ordered by source evidence, with dependencies on the Financial Intelligence Foundation
Audit (FIA, PR #1715) phases 0–7 made explicit.

```
            ┌──────────── A  restore menu visibility & routing (UI only) ───────────┐
            │                                                                        │
            │   B  design missing authorities (Grok/OpenArt, founder-approved) ──┐   │
            │                                                                   │   │
FIA Phase 0 ┼─► C  provider-agnostic connection UI contracts (mock-free) ◄──────┘   │
(baseline,  │        │                                                               │
 merge order│        ▼                                                               │
 OD-10)     │   D  ingestion integration  ◄── FIA Phase 1–2 + vendor OD-01 + webhook host OD-07
            │        │
            │        ▼
            │   E  classification & rule-management UX ◄── FIA Phase 3–4
            │        │
            │        ▼
            │   F  connect Safe to Spend, currency, privacy, Ask JURNL to the intelligence ◄── FIA Phase 5–6
            │        │
            └──────► G  end-to-end, security, accessibility validation ◄── FIA Phase 7
```

## Phase A: restore menu visibility and routing

This phase can start now, independently. Owner: Composer/Opus engineering.

Scope (smallest safe restorations, 05):
* Menu rows for the capabilities now hidden under PREFERENCES: CURRENCY & EXCHANGE, SAFE TO SPEND BUFFER, CONNECTED ACCOUNTS
  & SYNC (honest MANUAL / PREVIEW status) and ASK JURNL. Each opens the **existing** sheet or card. No duplicate pages.
* PRIVACY & DATA renamed to PRIVACY & CONSENTS, linking the hidden F01.11 tools (export request, delete account, disable AI).
* SECURITY, linking F01.12.
* HELP & SUPPORT stays an honest placeholder until B, but with copy that says so on a surface, not a toast.

Fixes:
* Sign-out: confirm, close, redirect.
* The ASK JURNL CONTEXT toggle-off defect.
* The currency failure message.
* The add-ons dead button: label it NOT AVAILABLE YET or remove the affordance.

Dependency: none on FIA. Visual: uses the existing board-08 menu composition with contained list scrolling (06). No new artwork.

Tests: extend `e2e/jurnl/jurnl-global-interactive-v3.e2e.ts` and `jurnl-editorial-overlays.e2e.ts` B4, so that every menu row reaches its
destination.

## Phase B: design the missing authorities

Owner: Grok/OpenArt with founder approval. This phase can start now, in parallel with A.

Inputs: 22 (batches), 23 (shell and SIDEKICK requirements), 21 (reuse).

Gate: **founder approval per batch** before any implementation uses it. Generation is not executed in this sprint.

## Phase C: provider-agnostic connection UI contracts

Owner: engineering. It starts after A and the B batches B01–B04 are approved.

Scope:
* Build CX-01…CX-14 against a **provider port interface** with an explicit `PROVIDER_UNAVAILABLE` implementation (the current
  `JURNL_BANK_CONNECTION_PROVIDER`).
* Every state is reachable in a design-preview mode clearly marked PREVIEW (never shown as connected).
* Remove the F02 simulated `patchSetup({accounts:'CONNECTED'})` path or label it, per FD-05.

Dependency: FIA Phase 0 (baseline convergence, merge order OD-10), because the account model must include the provider ids (FIA 05 port).

## Phase D: integrate financial ingestion

Owner: engineering. It is blocked until the backend is approved.

Dependencies:
* FIA Phase 1 (ingestion and health) and Phase 2 (identity and reconciliation).
* Vendor selection OD-01.
* Webhook host and secret store OD-07.
* History window OD-08.
* Sample-account purge OD-09.

UI: CX-05, CX-09, the I-01…I-16 states (11) and health chips.

## Phase E: classification and rule-management UX

Owner: engineering. Dependency: FIA Phase 3 (deterministic categories and user rules) and Phase 4 (learning).

Surfaces: INTEL-A…D and RULES-A…C (12, 13, 18). Batches B05–B07.

## Phase F: connect Safe to Spend, currency, privacy, Ask JURNL

Owner: engineering. Dependencies:
* FIA Phase 5 (recurrence and forecast) for Safe to Spend.
* OD-04 (multi-currency) for currency.
* FIA 19 for privacy.
* FIA 20 and a founder AI-provider decision for Ask JURNL.

## Phase G: end-to-end, security and accessibility validation

Owner: engineering plus the founder. Dependency: FIA Phase 7 (hardening) and the 40-scenario test contract (FIA 22).

## What can run independently now

* **A** (routing restoration).
* **B** (authority design).
* Doc-level founder decisions (28).

**C–G** wait on FIA Phase 0 and the vendor decision.

## Dependency on FIA documents

| This audit | FIA document |
|---|---|
| 08 / 09 / 10 | 03, 04, 05, 18, 24 |
| 11 | 06, 07, 08, 17 |
| 12 / 13 / 18 | 09–15, 20 |
| 14 (buffer) | 21 (cross-DOT matrix) |
| 25 | 19 |
