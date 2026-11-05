# 12 · V3 / editorial overlay compatibility

The text-containment contract was applied to the DOT 01 V9 overlays (14–37) and pages through their own frame
(`Dot01Frame.tsx`) and stylesheet; the OPUS2 editorial compositions (`runtime/surfaces/editorial/**`: global menu, search drawer,
MONEY action sheet, ADD A POCKET, MOVE MONEY, manage-pocket fragment, archive-blocked caution) were **not restyled**. Their own
containment was already asserted by OPUS2 (`tests/jurnlEditorialOverlays.test.tsx` O1–O5, `e2e/jurnl/jurnl-editorial-overlays.e2e.ts`
A1–A4, B1–B5: every label uppercase, decorative layers `aria-hidden` and never hit, close + primary on screen at 393 × 660, no page
scroll), and both suites are re-run on this branch (report 13 / OPUS3A report 14).

Nothing was flattened: the torn folios, the oxblood caution with its stone, the olive depth, the engraved objects and the
asymmetric fragments of the editorial overlays keep their geometry; no rectangular card or border was introduced anywhere.
