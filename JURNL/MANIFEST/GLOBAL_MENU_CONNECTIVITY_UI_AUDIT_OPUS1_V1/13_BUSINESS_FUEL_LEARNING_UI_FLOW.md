# 13 · Business fuel learning: UI flow (acceptance case)

Evidence class: DESIGN_REQUIREMENT. The rules come from FI audit 10 (business fuel learning contract) and 11 (rule engine).
No logic is built here.

The reference event:

| Field | Value |
|---|---|
| Merchant | SHELL |
| Amount | $42.80 |
| Account | Connected checking |
| Status | posted |

JURNL suggests TRANSPORTATION → FUEL **only** if the provider sent a fuel MCC or the user or a receipt confirmed it. The merchant
name alone does not establish fuel (FI audit 10).

Purpose suggested: RIDESHARE OPERATING EXPENSE. Business context: UNCONFIRMED.

## Screens and overlays

| Step | Surface | Live content | Controls | Writes |
|---|---|---|---|---|
| F-1 FIRST CONFIRMATION | INTEL-C question card over the transaction | "SHELL · $42.80 · CONNECTED CHECKING". The question: *was this for business-related driving?* | BUSINESS DRIVING (UBER · LYFT · BOTH) · PERSONAL · MIXED · NOT SURE | the classification on this event only; one piece of evidence |
| F-2 SIMILAR TRANSACTION | same card, with "YOU SAID BUSINESS LAST TIME" | prior answer shown as context, not applied | same choices | second piece of evidence |
| F-3 RULE SUGGESTION | INTEL-D proposal (after 3 consistent confirmations of the same narrow scope) | the scope in words: "SHELL · CONNECTED CHECKING · FUEL"; the 3 evidence rows | REVIEW RULE · NOT NOW | nothing |
| F-4 RULE APPROVAL | INTEL-D variant | scope (editable narrower or broader), effect on future matches only, "never sets an amount, never marks a deduction" | APPROVE & TURN ON · EDIT · DISMISS | rule version 1, enabled |
| F-5 AUTO-CLASSIFIED RESULT | the transaction row and detail | quiet label "BUSINESS FUEL · YOUR RULE" + the explanation line | WHY? · CHANGE | `learned_rule_id` + version on the event |
| F-6 CORRECTION | detail sheet (reuse DOT 01 24) | the original rule result and the user's new choice | SAVE CORRECTION · ALSO REVIEW THE RULE | correction + rule review flag |
| F-7 MIXED PURCHASE | split editor (B06) | the purchase split into business / personal parts; the sum must equal $42.80 | SAVE SPLIT | split; **no ratio learned from one receipt** |
| F-8 RULE DISABLE | rule detail (B07) → confirm (reuse 25) | the rule, its match count, last match | TURN OFF · KEEP | rule disabled; history kept |

## Conflict handling

When a later Shell purchase conflicts with the rule (a different account, a convenience-store MCC, or an amount far outside the usual), it is
**flagged** with "THIS MAY BE A PERSONAL PURCHASE. REVIEW?" rather than classified (FI audit 12 copy). It never takes the prior class silently.

## Refusals carried into the UI

* No "deductible" checkbox anywhere.
* No rule from one or two answers.
* No rule across users.
* "SHELL" alone is never the scope offered first.
