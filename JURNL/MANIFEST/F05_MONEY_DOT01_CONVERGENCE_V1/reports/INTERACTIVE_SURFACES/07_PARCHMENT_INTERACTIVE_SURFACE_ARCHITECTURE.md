# 07 · Parchment interactive surface architecture (proposed specification)

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

**DESIGN_AUTHORITY_REQUIRED:** no authority draws an open menu; this is the specification implemented for founder approval, not an approved design.

| Part | Specification |
|---|---|
| Surface | founder large parchment sheet (motion PNG 14), 9-sliced, drop shadow 0 10 16 / 0 2 3 |
| Width | max(field width, 220 px; 300 px for the calendar), clamped to the stage − 16 |
| Anchor | 6 px under the field; flips above when below < min(want, 240) and above is larger; floor = dock top on 06 / 31 |
| Options | serif 600 16 px, 0.05 em, rows ≥ 44 px, 1 px ink rules, olive tick for the selected value, olive tint + left rule for the active one |
| Motion | 160 ms rise (6 px), none under reduced motion |
| Dismissal | outside pointer, Escape (does not close the overlay), Tab, choice |
| Layer | stage `.jrn-d01` (fixed, untransformed), z 80 |
