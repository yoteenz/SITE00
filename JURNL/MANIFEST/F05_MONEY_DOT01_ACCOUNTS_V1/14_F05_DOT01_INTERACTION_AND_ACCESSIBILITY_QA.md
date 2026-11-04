# 14 · Interaction and accessibility QA

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

| Check | Result | Where |
|---|---|---|
| axe: no serious or critical violations | **0** on 8 pages (directory, bank, card, history, detail, settings, review, needs review) and 3 overlays (record, capture, archive blocked) | `accessibility …` |
| Overlays | `role=dialog`, `aria-modal`, labelled by their title; focus moves to the first control; Tab cycles inside; Escape closes; focus returns to the opener; the page underneath keeps its state (URL filters, search text) | `overlays trap focus …` |
| Pages | the heading takes focus on arrival (for screen readers; no outline, it is not operable) | `Dot01Frame` |
| Keyboard reorder | MOVE UP / MOVE DOWN buttons per place (drag is a pointer convenience only) | `06 / 32 …` |
| Scan progress | `aria-live` status follows the engine's stages | `ReceiptFlow` |
| Typography | every visible text uppercase except the cursive subtitle, which is lowercase and at most one per page; checked on 8 pages and 2 overlays | `typography …`, `the dock appears …` |
| No circular tappable controls | 0 found (chips and buttons are square-rounded; the seal and dots are decorative) | `the dock appears …` |
| Global navigation | exactly HOME / MONEY / ADD / PLAN / CREDIT with MONEY active, where the authority draws it (01, 06, 31) | `the dock appears …` |
| Touch targets | none under 24 × 24 px at five sizes | `responsive …` |
| Inputs | ≥ 16 px type at five sizes | `responsive …` |
| Reduced motion | 0 moving animations on pages, overlays and after a save | `reduced motion …` |
| Text spacing | multi-line headings and card names read with real spaces ("CASH ON HAND", not "CASHON HAND"), found and fixed in this sprint | carousel 26, pilot 8 / 14 |
