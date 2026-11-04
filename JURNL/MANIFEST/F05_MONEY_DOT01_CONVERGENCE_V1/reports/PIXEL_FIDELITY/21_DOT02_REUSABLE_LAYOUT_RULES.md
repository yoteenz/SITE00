# 21 · Reusable layout rules for DOT 02

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

1. **One heading rule per environment:** pages (SK02 class) and overlays (SK03 class) each have one heading box and one size rule; per-screen offsets are not allowed.
2. **Chips by authority surface** (`chipTone` / `tone`), laid out from the right edge at fixed widths; art through the registry.
3. **One overlay content region** (`OVERLAY_CONTENT`) for every sheet; primary actions may sit on the landscape as drawn.
4. **Fields:** `fields="strips"` or sheet, `fieldIcons` / `stripIcons` ink or tiles — set per screen from the authority, never by habit.
5. **No native popups:** every select and date uses JURNL_SELECT / JURNL_DATE_PICKER (stage-layer popover).
6. **Micro-assets only through `MicroIcon` + registry IDs**, with the line glyph as fallback; DOT 02 reserves its IDs (DOT 01 audit doc 17) before generation.
7. **Stat words follow the authority** over canonical values; no new arithmetic in screens.
8. **Account-kind compositions are distinct** when the authority says so (lesson of 03–05): build the composition per kind from the start.
9. **Verification:** 471 × 836 triptychs + the probe at 10 viewports + the interactive-state probe for every new control.
