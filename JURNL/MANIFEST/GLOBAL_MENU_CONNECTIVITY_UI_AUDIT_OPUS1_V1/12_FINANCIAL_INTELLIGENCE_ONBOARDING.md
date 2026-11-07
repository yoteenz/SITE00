# 12 · Financial intelligence onboarding

Evidence classes:
* **VERIFIED_CURRENT_CODE**: the current state. There is no classifier, no rules and no model client in `src/projects/jurnl`.
  Consent flags exist (FI audit 20).
* **DESIGN_REQUIREMENT**: the onboarding itself.

Functional source: FI audit 09 (purpose taxonomy), 11 (rule engine), 12 (confidence), 13 (corrections and versioning),
14 (splits), 15 (rideshare), 20 (AI boundary).

## What the user must understand (sprint §12), mapped to proof in the UI

| Understanding | Where it is shown |
|---|---|
| JURNL organizes supported synced activity automatically | IN-01 intro |
| Category and purpose are separate | IN-02 how it organizes (two axes) |
| Uncertain items come to the user | IN-03 review first classifications |
| Corrections teach JURNL, for this user only | IN-04 + rule proposal |
| Automation needs the user's approval | IN-06 enable automation |
| Amounts always come from the source | IN-02 footnote; every transaction detail |
| Tax treatment is separate from spending category | IN-05 business / personal context ("never an automatic deduction") |

## Candidate states, consolidated

The sprint lists 14 states. Several share a composition, so the count of new authorities is smaller than the count of states.

| State | Composition | Interaction | New authority? |
|---|---|---|---|
| IN-01 INTELLIGENCE INTRODUCTION | INTEL-A folio | page (first run after the first sync) | **yes**: batch B05 |
| IN-02 HOW JURNL ORGANIZES | INTEL-A variant (two-axis diagram: category × purpose) | page | **yes**: B05 (independent diagram art, text-free) |
| IN-03 REVIEW FIRST CLASSIFICATIONS | INTEL-B review queue | page, contained list | **yes**: B05 (shell reuses DOT 01 33 strips) |
| IN-04 CONFIRM BUSINESS / PERSONAL CONTEXT | INTEL-C question card | overlay | **yes**: B05 |
| IN-05 LEARNED RULE PROPOSAL | INTEL-D proposal | overlay (seal) | **yes**: B06 |
| IN-06 ENABLE AUTOMATION | INTEL-D variant | overlay | shares B06 |
| IN-07 REVIEW AUTOMATED RULES | RULES-A directory | page | **yes**: B07 |
| IN-08 CORRECT CLASSIFICATION | transaction detail sheet | overlay | reuse DOT 01 24 TRANSACTION CORRECTION |
| IN-09 TRANSACTION SPLIT | split editor | overlay | **yes**: B06 (no split composition exists) |
| IN-10 UNCERTAIN PURPOSE | INTEL-C variant | overlay | shares B05 |
| IN-11 RULE CONFLICT | caution | overlay | reuse caution (board 07 / DOT 01 36) |
| IN-12 DISABLE LEARNED RULE | rule detail action | overlay confirm | reuse DOT 01 25 confirmation |
| IN-13 UNDO CLASSIFICATION | inline + history | sheet | reuse DOT 01 37 CORRECTION REVERSAL CONFIRMATION |
| IN-14 ACTIVITY / EXPLANATION HISTORY | RULES-C history | page, contained list | **yes**: B07 |

## Boundaries (FI audit 20)

* **AI suggestions** are labelled as suggestions. They never post or change a ledger entry until the user confirms.
* **Quiet automation** happens only through an enabled, user-approved rule. Each auto-classified row says why: "CLASSIFIED AS BUSINESS FUEL BASED ON YOUR APPROVED RULE."
* **Suggestion service down.** Ingestion still commits, and the queue shows no suggestion rather than a fabricated one.
