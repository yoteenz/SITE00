# 06 — Transaction ingestion architecture

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

PROPOSED_ARCHITECTURE. The current repository has none of these stages. `pushServerSnapshot` is a separate path and must not be used as the bank pipeline.

## Stages

### 1. Provider event or poll

Input: webhook or a scheduled cursor pull. Output: a fetch job. Owner: server ingestion worker. Persistence: webhook receipt with provider delivery id. Idempotency: delivery id plus item id. Failure: store the error, do not touch the ledger. Retry: provider-documented retry, then the cursor pull. Audit: receipt time and outcome. Lineage: provider only. Security: verify signature before parsing. Test: scenario 29.

### 2. Raw provider record

Input: provider transaction, account, or removal object. Output: immutable raw row. Owner: ingestion. Persistence: `provider_raw_event`, keyed by provider, item, and source id, with payload hash. Idempotency: unique source id. Failure: keep the payload and mark parse failed. Retry: safe. Audit: payload hash. Security: server only, encrypted at rest, never sent to a model. Test: scenarios 29 and 30.

### 3. Normalization

Input: raw row. Output: normalized draft (amount in minor units, currency, dates, status, description). Owner: deterministic mapper per provider. Persistence: normalized columns beside the raw id. Failure: quarantine the row. The raw row remains. Test: scenario 32.

### 4. Identity and deduplication

Input: normalized draft plus existing canonical identities. Output: insert, update, or review-required match. Owner: identity service. Idempotency: provider transaction id. Never merchant plus amount alone. Test: scenarios 04, 06, 15.

### 5. Pending and posted matching

Input: removal plus new posted row, or `pending_transaction_id`. Output: one live canonical event and a voided pending link. Owner: identity service. Test: scenarios 05 and 31. This stage implements the Plaid behavior cited in document 05. It must also accept a provider that uses one id for both states.

### 6. Canonical financial event

Input: identity result. Output: the canonical event in document 07. Owner: ledger gate. This is the first stage allowed to affect financial truth, and only through the deterministic rules in documents 08, 17, and 18. Classification failure must not roll this back (scenario 39).

### 7. Classification

Input: canonical event plus the owner's enabled rules. Output: type, if not already determined, and category suggestion. Owner: rules engine. Persistence: classification record, not an overwrite of raw amount. Failure: leave purpose unconfirmed.

### 8. Purpose interpretation

Input: classification plus context. Output: purpose, activity, allocation suggestion, or a review question. Owner: rules first, model second. A model suggestion is never applied as a fact.

### 9. Reconciliation

Input: canonical events, transfer intents, card payments, provider balances. Output: settlement state and unreconciled difference. Owner: existing settlement state machine, extended to accept provider evidence. It does not gain a silent auto-complete.

### 10. Derivations and insights

Input: reconciled canonical events. Output: MONEY, commitments, outlook, review queue. Owner: read models. They do not write source amounts.

## Hard gate

A provider import cannot change a balance except by creating or updating a canonical event that passes the accounting function. It cannot add itself on top of an already authoritative provider balance. See document 18.
