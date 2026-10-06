# F09 SAFE TO SPEND — Territory Distinctness Matrix

**Result: PASS on every pair.**

There are two independent tests:
1. **The sprint's ten-dimension matrix** (below): all ten dimensions differ for every pair.
2. **The gate's own evaluator** (`checkTerritoryDistinctness`, run in `tests/jurnlF09VisualAuthorityTerritoryProof1.test.ts`).
   - Result: `TERRITORIES_DISTINCT`.
   - Every pair differs on **6 of 6** structural dimensions: spatial logic, primary zone, visual hierarchy, interaction emphasis, information density and media relationship.
   - The gate requires ≥ 3, including spatial logic or primary zone.

What is held constant on purpose, so the three stay one product:
- The F09 function: same data, states and actions.
- CENTER_STAGE geometry.
- Nav and chrome.
- Palette and type pair.
- Uppercase copy.
- Square-rounded controls.
- Emerald primary action.

None of those is counted as a difference.

## Ten-dimension matrix

| Dimension | T01 THE OPEN FLOOR | T02 THE PLAIN ANSWER | T03 THE OPEN ENVELOPE |
|---|---|---|---|
| PRIMARY OBJECT | A drawn room: open floor = value, walls = held back | A generated answer sentence; the figure is its 2nd line | One open envelope with the figure on its slip |
| LAYOUT GRAMMAR | Proportional plan drawing with dimension line, door, legend and title block | Typographic column: lead · figure · rule · after-clause · reading · footnote | Object stage: one large object over a row of small objects |
| SPATIAL AXIS | Radial / concentric, centre-out | Linear, vertical reading flow (left-aligned) | Depth (z) + scale gradient, top object → bottom row |
| DATA HIERARCHY | Proportion first (open vs held area), figure inside it | Figure as a word, then the named conditions | Open object (figure) vs sealed objects (labels), count + state |
| USER ENTRY POINT | Centre of the room (the floor) | Top-left of the column ("YOU CAN SPEND") | The raised slip |
| PRIMARY ACTION LOCATION | On the + axis, directly under the drawn door | Full width, lower stage, after the reading | Full width, under the sealed row |
| SECONDARY DATA TREATMENT | Unnamed wall courses (area); names appear in place | Openable words; amounts open inline as chips | Labelled sealed envelopes; amounts sealed until opened |
| EDITORIAL ROLE | Drawing caption in a title block, after the legend | Em-dash footnote at the end | Addressee line printed on the open envelope |
| IMAGERY ROLE | Perimeter only: plaster, daylight, olive at the right edge | Ground material the answer is cut into (travertine) + perimeter shade | Inside the object (flap liner) + linen ground |
| INTERACTION RHYTHM | Spatial inspection: tap a course → named in place; the door opens to the breakdown | Inline disclosure: open one word at a time; the sentence reflows | Object manipulation: open a seal → slip rises; breakdown opens all |

## Pair proofs

**01 ↔ 02: DISTINCT.**
- T01 is a spatial, proportional drawing read from the centre. T02 is a sentence read top-down.
- Held-back items are unnamed **area** in T01 and named **words** in T02.
- The figure lives inside a structure (T01) vs inside a grammar (T02).
- Imagery is perimeter (T01) vs ground material (T02).
- **Swap test.** Swapping their palette or ground produces neither page. Removing the drawing removes T01; removing the sentence removes T02.

**01 ↔ 03: DISTINCT.**
- Both express "held vs clear", which is the F09 truth, but:
  - T01 encodes it as a **continuous proportion** in one object.
  - T03 encodes it as **discrete objects and their open / closed state**, with no proportion at all.
- Axis: concentric vs depth plus scale.
- Interaction: inspect in place vs open an object.
- **Swap test.** T03 has no area encoding; T01 has no objects to open.

**02 ↔ 03: DISTINCT.**
- Language vs object.
- Held-back items as words with inline amounts vs labelled sealed objects.
- Entry: top-left reading vs the raised slip.
- Editorial: footnote vs printed on the object.
- Imagery: ground material vs object interior.

## Gate evaluator output

Exported in `F09_TERRITORY_PROOF_REGISTRY.json → step_checks.territories`.

| Pair | Differing structural dimensions | Distinct |
|---|---|---|
| T01 ↔ T02 | 6 / 6 | YES |
| T01 ↔ T03 | 6 / 6 | YES |
| T02 ↔ T03 | 6 / 6 | YES |

## Same-product check

All three:
- carry the same chrome (BACK TO TODAY · JURNL · ACCOUNT · ASK JURNL)
- carry the same nav (HOME current · MONEY · + · PLAN · CREDIT)
- use the same field width and axis
- use the same labels (SAFE TO SPEND · CLEAR TO SPEND · HELD BACK · SEE THE FULL BREAKDOWN · CHANGE WHAT’S HELD · PLAN)
- use the same emerald figure and primary
- use the same display serif + tracked sans
- use the same JURNL materials: plaster, travertine, linen and paper

## Closest risks

- **T02 drifting into a hero-number page.** Its identity is the sentence grammar.
- **T03's sealed row drifting into a card grid.** Its identity is the envelope geometry and seals.
