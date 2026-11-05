# 12 — Confidence and review policy

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

Confidence is a class grounded in evidence. It is not a model score. No numeric confidence is defined, because no method has been validated. The receipt field `ocr_confidence` is an OCR implementation detail and is not this policy.

| Class | Meaning | May affect the book |
| --- | --- | --- |
| PROVIDER_FACT | Amount, currency, dates, status, raw description, account, as returned and verified. | Yes, through the ledger gate. |
| DETERMINISTIC_RULE | Identity, transfer match with both ids, settlement transition, split sum check. | Yes. |
| USER_CONFIRMED | The user confirmed this event. | Yes, for classification and for explicit merges. |
| LEARNED_RULE | An enabled rule this owner approved. | Classification only. |
| AI_SUGGESTION | A model proposal. | No, until the user confirms. |
| UNVERIFIED | Guess, missing data, or similarity. | No. |

## Behavior

- HIGH: an enabled, well-scoped, user-approved rule matches, or the fact is a provider or deterministic fact. Apply quietly. Explanation: "Classified as business fuel based on your approved rule." Name the rule. Do not say the model is sure.
- MEDIUM: a suggestion with a specific reason, such as a likely series or a one-sided transfer. Minimal review. Do not post a second economic event.
- LOW: purpose or match is unconfirmed. Ask. Leave the axis unknown.

## Queue priority

Uncertain purpose, conflicting rules, unexplained balance difference, possible duplicate, mixed purchase, unsupported recurrence, transfer mismatch, missing evidence, tax-relevant ambiguity.

Routine HIGH imports do not ask. The queue must not repeat a question the enabled rule already answers.

## Copy

Use the concrete sentences from the sprint: the approved-rule sentence, "This may be a personal purchase. Review?", and "This payment appears to match your credit-card transfer." Do not write generic AI certainty.
