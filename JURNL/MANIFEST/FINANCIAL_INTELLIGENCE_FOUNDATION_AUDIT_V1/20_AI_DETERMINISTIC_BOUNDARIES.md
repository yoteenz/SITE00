# 20 — AI and deterministic boundaries

Inspected tree: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf`
Worktree: `/tmp/site00-jurnl-integration-wt`
Default branch `main` @ `e413590e1` does not contain `src/projects/jurnl/data/ledger/accounting.ts`.
None of the financial-OS pull requests below are merged to `main`.
Tagline: PLAN TODAY. GROW FREELY.
Sprint: P0.JURNL.FINANCIAL-INTELLIGENCE.CONNECTED-TRANSACTION-UNDERSTANDING-AND-ADAPTIVE-LEARNING-FOUNDATION.AUDIT1
Application code: unchanged. Database: unchanged. Paid calls: none.


Evidence classes:

- VERIFIED_IN_REPOSITORY — read in the inspected tree.
- VERIFIED_IN_TESTS — covered by a named test in that tree.
- VERIFIED_WITH_PROVIDER_DOCS — public page read on 4 Nov 2026 (America/Chicago). Not a live JURNL connection.
- DESIGN_REQUIREMENT — required by this sprint. Not implemented.
- PROPOSED_ARCHITECTURE — design for a later implementation sprint. Not implemented.
- UNKNOWN — not established by repository evidence or a cited source.
- BLOCKED — needs a founder or vendor decision before build.

## What exists

VERIFIED_IN_REPOSITORY. Consent flags `AI_PERSONALIZED`, `AI_CATEGORIZATION`, `AI_BUDGET`, `AI_NATURAL_LANGUAGE`, `AI_MARKET_TRENDS`, and `ASK_JURNL_CONTEXT` are stored from device settings. No Anthropic, OpenAI, or other model client is referenced under `src/projects/jurnl`. Receipt OCR is a device reader with a timeout and a manual fallback (`ReceiptFlow.tsx`). It can fail closed to manual entry. It is not a financial intelligence engine.

## May, later

Suggest a normalized merchant, a category, a purpose, a pattern, a series, or a rule. Explain uncertainty. Point at a discrepancy. Draft an insight.

## Must not

Invent a transaction. Change a source amount. Rewrite a provider balance. Bypass settlement. Create a ledger entry without the deterministic gate. Mark a deduction verified. Reclassify history without the bulk-confirm flow. Read tokens or another tenant's rows.

## Owns the facts

Deterministic code owns source truth, amounts, minor units, identity, balance integrity, settlement, split totals, permissions, idempotency, and audit history.

If the suggestion service is down, ingestion still commits (scenario 39). The review queue shows no suggestion rather than a fabricated one.
