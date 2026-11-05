# 18 · Classification & learning rules: UX specification

Evidence classes:
* **DESIGN_REQUIREMENT** for every state below.
* **VERIFIED_CURRENT_CODE** that nothing exists: no rule table, no rule UI, no classifier in `src/projects/jurnl` at `4ddbac6ce` (FI audit 01 /
  11). Categories exist as a taxonomy for manual entry (`data/foundation/categories.ts`).

Functional mapping: FI audit 11 (lifecycle and scopes), 12 (confidence classes), 13 (correction and versioning), 14 (splits),
09 (purpose taxonomy), 20 (AI boundary). This spec adds no capability those documents do not define.

## Menu entry

The menu entry is **YOUR INTELLIGENCE → CLASSIFICATION & LEARNING RULES** (proposed, 06). It opens RULES-A. It does not open a duplicate of any
existing settings page, because none exists.

## States

| State | Surface | Shows | Controls | FI audit source |
|---|---|---|---|---|
| RULE DIRECTORY | RULES-A page, contained list | enabled / proposed / disabled rules; scope in words; match count; last match | open rule; filter | 11 lifecycle 6–9 |
| RULE DETAIL | RULES-B page | scope (narrowest first), outputs (category, subcategory, purpose, business context), version, evidence count | EDIT SCOPE · TURN OFF · VIEW MATCHES | 11 schema |
| RULE PROPOSAL | INTEL-D overlay | candidate after the eligibility policy (default: 3 consistent confirmations, "not proof") | REVIEW RULE · NOT NOW | 11 step 5 |
| APPROVE RULE | INTEL-D variant | the effect on **future** matches only; "never sets an amount; never marks a deduction" | APPROVE & TURN ON · EDIT · DISMISS | 11 step 6; safeguards |
| EDIT RULE | RULES-B sheet | narrower or broader scope with an explanation of each | SAVE AS NEW VERSION | 13 versioning |
| DISABLE RULE | confirm (reuse DOT 01 25) | what stops; history kept | TURN OFF · KEEP | 11 step 9 |
| RULE CONFLICT | caution (reuse board 07 / DOT 01 36) | two enabled rules disagree, or a match conflicts with its rule | CHOOSE RULE · REVIEW TRANSACTION | 11 (a narrower rule wins), 12 queue |
| CLASSIFICATION HISTORY | RULES-C page | per transaction: provider fact → rule / user / AI suggestion → current value, with times | UNDO | 13 |
| UNDO AUTOMATIC CLASSIFICATION | inline + confirm (reuse DOT 01 37) | the value before and after | UNDO | 13 |
| CORRECTION HISTORY | RULES-C filter | the user's corrections, with which rule versions they reviewed | — | 13 |
| BULK CORRECTION PREVIEW | RULES-B sheet | "APPLY TO 14 PAST TRANSACTIONS?" with the list; never silent | APPLY · ONLY FUTURE | 20 "reclassify history only with bulk-confirm" |
| REVIEW UNCLASSIFIED ACTIVITY | INTEL-B queue | LOW-confidence items, priority order per FI audit 12 | answer / skip | 12 queue priority |
| SOURCE EVIDENCE | RULES-B section | the confirming transaction ids, receipts on device, provider MCC (only if sent) | open evidence | 11 evidence references |

## Copy rules (FI audit 12)

* **HIGH (rule match):** "CLASSIFIED AS BUSINESS FUEL BASED ON YOUR APPROVED RULE." Name the rule. Never "JURNL is sure."
* **MEDIUM:** a reason in plain words.
* **LOW:** a question.
* **AI suggestion:** labelled SUGGESTION until the user confirms (confidence class AI_SUGGESTION, no book effect).

## Things this UI must never offer

* A rule that sets an amount.
* A tax determination.
* A cross-user rule.
* A rule built from fewer confirmations than policy.
* A deletion of rule history.
