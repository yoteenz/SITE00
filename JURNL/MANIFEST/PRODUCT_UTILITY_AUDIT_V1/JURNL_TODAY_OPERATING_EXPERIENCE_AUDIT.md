# JURNL TODAY operating experience audit (F03)

**Screen:** `HomeScreens.tsx` · route `today` · `F03.00`

## Founder five questions — current coverage

| Question | TODAY answer today | Gap |
| --- | --- | --- |
| What money do I have? | Safe-to-spend signal (derived) | Hidden mock when setup skipped |
| What do I need to pay? | Up to **2** upcoming rows + expand | Not full picture; no funded state |
| What money set aside? | Not on parent; must open F09 WHY | **Missing on TODAY** |
| What is coming next? | First upcoming + “RENT IS CLOSE” heuristic | Abstract attention copy |
| What can I spend? | Primary STS number | Good when COMPLETE |

## Recommended hierarchy (within approved composition)

| Priority | Content | Placement |
| --- | --- | --- |
| A | Financial position (STS + completeness badge) | Existing signal zone |
| B | Next 1–3 commitments with **amounts and dates** | Expand upcoming (already partial) |
| C | Funding progress for nearest bill | **New module** — requires data model |
| D | Actions (add bill, set aside, mark paid) | Contextual links to F07/F08 — not six-family tour |
| E | Recent activity | Link to F04 (exists) |
| F | Editorial parent question | Demote below task copy (`jrn-lang__task` first) |

**FUNCTIONAL_LAYOUT_REFINEMENT_REQUIRED** — not a visual redesign: add funding facts once model exists; tighten `jrn-lang__state` strings.

## Classification

**EXISTING_BUT_UNCLEAR** — useful anchor but not a daily operating console.
