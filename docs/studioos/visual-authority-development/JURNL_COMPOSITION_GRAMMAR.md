# JURNL Composition Grammar

**Sprint:** P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1
**Source of truth:** `shared/studioos-visual-authority/projects/jurnl/composition-grammar.ts`. `JURNL_COMPOSITION_GRAMMAR.json` is generated.

The JURNL creative-direction profile says what JURNL is made of. This grammar says how those things are arranged on a 393×852 page, so the product reads first and the world enriches it.

## Rules

| # | Rule | In practice |
|---|---|---|
| G01 | ARCHITECTURAL FRAME | The page sits in a built place. Architecture frames from the perimeter; it is never busy texture behind the signal. |
| G02 | TACTILE FINANCIAL OBJECT | One made object carries the metaphor and real data. It takes 12–50 % of the stage, never the whole page. |
| G03 | EDITORIAL HIERARCHY | Function label → state → figure → why. One display figure in the serif; at most five type sizes. |
| G04 | QUIET CENTRAL CLARITY | The signal sits in the upper half on a quiet field and is understood in under two seconds. |
| G05 | PERIPHERAL ENVIRONMENTAL RICHNESS | Foliage, a window, light on plaster and the bleed carry the richness. The centre stays legible. |
| G06 | CONTROLLED MATERIAL LAYERING | At most four material families, each with a job. |
| G07 | BESPOKE GRAPHIC DESIGN | Survey rules, inlaid rules, plate labels, legend swatches. No stock cards, pills or chart widgets. |
| G08 | FUNCTIONAL NEGATIVE SPACE | Empty space is reserved and named for a job (the open floor is the money). It is never leftover. |
| G09 | SUBTLE WIT | One relationship that rewards a second look, carried by the object, not the copy. |

## Lessons from the founder comparison concept (rules, not a template)

- The product read first even though the page was rich. → The signal sits on a reserved quiet field in the upper half.
- The environment framed the page rather than becoming it. → The metaphor scope is OBJECT or ZONE by default.
- Every word, number, icon and nav cell was exact. → Precision UI is deterministic.
- The logo was the real mark, placed with intent. → The official asset is composited, never redrawn.
- There was a secondary module with real depth. → Every blueprint has a SECONDARY_PRODUCT zone with real data.
- Density was balanced. → The density rule below.
- Its copy and features were its own. → They enter only through founder decisions: D-F09-PRIMARY-ACTION-LABEL, D-F09-PURCHASES-BRIDGE and D-F09-AVAILABLE-DATE.

## Density rule (`checkJurnlDensity`)

- Product content spans at least two thirds of the stage height.
- The signature object takes 12–50 % of the stage.
- At least 6 % of the stage is reserved negative space.
- At most four material families and five type sizes.

**Too sparse:** a number, a button and a wallpaper.
**Too busy:** text competing with texture, an object eating the stage, two focal points above the fold.

## Geometry (all JURNL mobile pages)

- **Frame:** 393×852 pt.
- **Status bar:** 0–54.
- **Chrome row:** 59–95. Back, account and ask are square-rounded icon buttons; there is no centred wordmark.
- **Stage:** x 26.5–366.5, y 108–714.
- **Edge:** an empty strip at 714–754.
- **Nav:** 762–806. Five equal cells: HOME · MONEY · + · PLAN · CREDIT.
- **Home indicator:** at the bottom.
- **9:16 plate:** the viewport is the central 82 % of the width.
