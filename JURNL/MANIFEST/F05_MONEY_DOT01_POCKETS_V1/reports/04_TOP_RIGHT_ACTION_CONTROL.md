# 04 · Top-right action control (ENTRY B)

## What it is

A **MANAGE POCKET** chip on every active Pocket page (02–05), in the page's chip row at the top right, immediately left of BACK.

- **Same control language as BACK.** It is a `Dot01Chip` with the authority's torn paper tile (`paper` tone, 88 board px), ink glyph and drop shadow: square-rounded, no circle, no glass. Its glyph is three filled ink dots (`ChipIcon` `'more'`).
- **Placement.** Chips are laid out from the right edge: `CHIP_RIGHT` 902, gap 26 board px. BACK keeps the exact place the authority draws it, and MANAGE POCKET sits one chip to its left at the same top. E2E T06 checks this: same y (±2 px), right edge ≤ BACK's left edge, top 15 % of the viewport.
- **Accessibility.** The accessible name is **MANAGE POCKET**, with `aria-haspopup="menu"` and `aria-expanded` that follows the menu. It is a real `<button>`, reachable by Tab, and Enter / Space open the menu with focus on its first item. Escape closes and returns focus to the chip.
- **One manager.** It calls the same `usePocketManager().open(id, anchor)` as the long press, so the menu, rename and delete are one workflow.

## Glyph source

No Batch 01–04 micro-asset is an overflow / more glyph (registry `runtime/screens/f05/microAssets.ts`). The three dots are drawn in the same ink line-glyph set the chips already use for BACK, SEARCH and ADD. No artwork was generated.

**Founder request:** an engraved "more" glyph for Batch 05 / 06. It will mount through the registry with no screen change.

## Where it is not

- Overlays (they keep their single CLOSE chip).
- 06 / 30–37 (their authorities draw search + add).
- Archived Pocket pages, which render POCKET NOT FOUND.

The existing chip test in `jurnl-f05-dot01.e2e.ts` now expects `['d01-manage', 'd01-back']` on a Pocket page; every other chip row is unchanged.

Screenshot: `SCREENSHOTS/393x852/T06-pocket-detail-overflow-chip.webp`, `T06-pocket-detail-menu.webp`.
