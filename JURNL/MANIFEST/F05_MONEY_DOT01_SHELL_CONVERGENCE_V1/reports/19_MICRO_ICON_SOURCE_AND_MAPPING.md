# 19 · Micro-icon source and mapping

Census: the 37-state probe records every visible icon (393 × 852) with its control, real source, rendered size and colour.
Source classes: AUTHORITY_LIFT (exact authority pixels: 06 ADD / REORDER), MICRO_ASSET (registry ID, Batches 01–06; founder or
candidate art — not founder-approved), DOCK_COMPONENT (canonical dock vectors, kept: the authority draws flat engraved line glyphs
and Batch 06 NAV is an exact reuse, not a better source), INLINE_SVG (line glyph fallback).

ICONS_MATCHING_AUTHORITY is counted strictly: only AUTHORITY_LIFT icons are proven identical to the authority. MICRO_ASSET icons
are approved-source candidates (shape-checked by the B05 / B06 qualification), not proven. INLINE_SVG icons are fallbacks: where an
approved source exists they are defects; where none exists they are source gaps (report 27). Rejected / correction-required Grok
art (B05-02 gloss, B05-03 leaves, B06-02 halo, Batch 04 glossy set) is not mounted.

## Census totals (after, 393 × 852, every visible icon in the 37 states)

| Source class | Count |
|---|---|
| AUTHORITY_LIFT | 2 |
| DOCK_COMPONENT | 15 |
| INLINE_SVG | 257 |
| MICRO_ASSET | 48 |

## Every icon

| # | Control | Source class | Source | Rendered (css px) | Colour | Vector signature |
|---|---|---|---|---|---|---|
| 01 | f09-menu | INLINE_SVG | INLINE_SVG | 15×12 | rgb(247, 240, 228) | M0 1.5h40M0 13h40M0 24 |
| 01 | f05m-place-bank | INLINE_SVG | INLINE_SVG | 7×11 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 01 | f05m-place-ride | INLINE_SVG | INLINE_SVG | 7×11 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 01 | f05m-place-cash | INLINE_SVG | INLINE_SVG | 7×11 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 01 | f05m-place-visa | INLINE_SVG | INLINE_SVG | 7×11 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 01 | f05m-move | INLINE_SVG | INLINE_SVG | 21×15 | rgb(28, 22, 16) | M3 9h30m-7-6 7 6-7 6M3 |
| 01 | f05m-view-all | INLINE_SVG | INLINE_SVG | 29×24 | rgb(28, 22, 16) | M1.5 21h34 |
| 01 | f05m-view-all | INLINE_SVG | INLINE_SVG | 21×13 | rgb(28, 22, 16) | M2 14h38M28 3l12 11-12 |
| 01 | f05m-prev | INLINE_SVG | INLINE_SVG | 18×35 | rgb(31, 24, 16) | M12 2L2 12l10 10 |
| 01 | f05m-next | INLINE_SVG | INLINE_SVG | 18×35 | rgb(31, 24, 16) | M2 2l10 10L2 22 |
| 01 | f05m-search | INLINE_SVG | INLINE_SVG | 16×16 | rgb(247, 240, 228) | M15.5 15.5L21 21 |
| 01 | f05m-actions | INLINE_SVG | INLINE_SVG | 16×16 | rgb(247, 240, 228) | M12 4v16M4 12h16 |
| 01 | nav-home | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M11.7 2.38Q4.22 6.53 2 |
| 01 | nav-money | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(244, 239, 228) | M2.8 8.53h18.4 |
| 01 | nav-add | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M12 4.2v15.6M4.2 12h15 |
| 01 | nav-plan | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M20.06 2.76C8.43 5.4 4 |
| 01 | nav-credit | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M4.35 21V16.96 |
| 02 | d01-strip-history | INLINE_SVG | INLINE_SVG | 46×37 | rgb(59, 42, 24) | M3 5.5C5.5 4.5 8.5 4.5 |
| 02 | d01-strip-history | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 02 | d01-strip-move | MICRO_ASSET | F05.D01.ICON.COINS.STACK | 46×37 | rgb(59, 42, 24) |  |
| 02 | d01-strip-move | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 02 | d01-strip-details | MICRO_ASSET | F05.D01.ICON.BANK.COLUMN | 46×37 | rgb(59, 42, 24) |  |
| 02 | d01-strip-details | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 02 | d01-manage | INLINE_SVG | INLINE_SVG | 15×15 | rgb(28, 22, 16) | <circle cx="5" cy="12" |
| 02 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 03 | d01-strip-history | MICRO_ASSET | F05.D01.ICON.HISTORY.LEDGER | 46×46 | rgb(59, 42, 24) |  |
| 03 | d01-strip-history | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 03 | d01-strip-manage | MICRO_ASSET | F05.D01.ICON.CREDIT.CARD | 46×37 | rgb(59, 42, 24) |  |
| 03 | d01-strip-manage | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 03 | d01-strip-details | INLINE_SVG | INLINE_SVG | 46×37 | rgb(59, 42, 24) | M12 10.5v6M12 7.2v.3 |
| 03 | d01-strip-details | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 03 | d01-manage | INLINE_SVG | INLINE_SVG | 15×15 | rgb(28, 22, 16) | <circle cx="5" cy="12" |
| 03 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 04 | d01-strip-add-cash | MICRO_ASSET | F05.D01.ICON.COINS.STACK | 46×37 | rgb(59, 42, 24) |  |
| 04 | d01-strip-add-cash | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 04 | d01-strip-spend | MICRO_ASSET | F05.D01.ICON.RECEIPT.INK | 46×49 | rgb(59, 42, 24) |  |
| 04 | d01-strip-spend | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 04 | d01-strip-history | INLINE_SVG | INLINE_SVG | 46×37 | rgb(59, 42, 24) | M4 20V10M9.5 20V6M15 2 |
| 04 | d01-strip-history | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 04 | d01-strip-details | INLINE_SVG | INLINE_SVG | 46×37 | rgb(59, 42, 24) | M12 10.5v6M12 7.2v.3 |
| 04 | d01-strip-details | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 04 | d01-manage | INLINE_SVG | INLINE_SVG | 15×15 | rgb(28, 22, 16) | <circle cx="5" cy="12" |
| 04 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 05 | d01-strip-pay | INLINE_SVG | INLINE_SVG | 22×22 | rgb(243, 232, 210) | M3 9.5 12 4l9 5.5M5 10 |
| 05 | d01-strip-pay | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 05 | d01-strip-purchase | INLINE_SVG | INLINE_SVG | 22×22 | rgb(243, 232, 210) | M3.5 9 5 4h14l1.5 5M4  |
| 05 | d01-strip-purchase | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 05 | d01-strip-history | INLINE_SVG | INLINE_SVG | 22×22 | rgb(243, 232, 210) | M6 2.5h12v19l-2-1.4-2  |
| 05 | d01-strip-history | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 05 | d01-strip-details | INLINE_SVG | INLINE_SVG | 22×22 | rgb(243, 232, 210) | M2.5 9.5h19M6 15h4 |
| 05 | d01-strip-details | INLINE_SVG | INLINE_SVG | 12×20 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 05 | d01-manage | INLINE_SVG | INLINE_SVG | 15×15 | rgb(28, 22, 16) | <circle cx="5" cy="12" |
| 05 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 06 | d01-add-account | AUTHORITY_LIFT | F05_DOT01_ICON06_ADD.webp | 36×34 | rgb(21, 23, 28) |  |
| 06 | d01-reorder | AUTHORITY_LIFT | F05_DOT01_ICON06_REORDER.webp | 34×33 | rgb(21, 23, 28) |  |
| 06 | d01-back | INLINE_SVG | INLINE_SVG | 15×15 | rgb(255, 241, 220) | M19 12H6m6-6-6 6 6 6 |
| 06 | nav-home | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M11.7 2.38Q4.22 6.53 2 |
| 06 | nav-money | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(244, 239, 228) | M2.8 8.53h18.4 |
| 06 | nav-add | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M12 4.2v15.6M4.2 12h15 |
| 06 | nav-plan | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M20.06 2.76C8.43 5.4 4 |
| 06 | nav-credit | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M4.35 21V16.96 |
| 07 | d01-back | INLINE_SVG | INLINE_SVG | 15×15 | rgb(255, 241, 220) | M19 12H6m6-6-6 6 6 6 |
| 07 | d01-tx-tx-xfer-e2e-scheduled-out | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 07 | d01-tx-tx-e2e-grocer | MICRO_ASSET | F05.D01.ICON.CATEGORY.GROCERY | 30×30 | rgb(28, 22, 16) |  |
| 07 | d01-tx-tx-xfer-e2e-pending-out | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 07 | d01-tx-tx-xfer-e2e-transit-in | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 07 | d01-tx-tx-d01-trattoria | MICRO_ASSET | F05.D01.ICON.CATEGORY.DINING | 30×31 | rgb(28, 22, 16) |  |
| 07 | d01-tx-tx-d01-utility | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 07 | d01-tx-tx-d01-books | MICRO_ASSET | F05.D01.ICON.PURCHASE.BASKET | 30×31 | rgb(28, 22, 16) |  |
| 07 | d01-record | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M12 5v14M5 12h14 |
| 08 | d01-back | INLINE_SVG | INLINE_SVG | 15×15 | rgb(255, 241, 220) | M19 12H6m6-6-6 6 6 6 |
| 08 | d01-tx-tx-xfer-e2e-scheduled-in | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 08 | d01-tx-tx-xfer-e2e-transit-out | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 08 | d01-tx-tx-e2e-fuel | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 08 | d01-record | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M12 5v14M5 12h14 |
| 08 | d01-history-scan | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M3 8.5h4l2-3h6l2 3h4V1 |
| 09 | d01-back | INLINE_SVG | INLINE_SVG | 15×15 | rgb(255, 241, 220) | M19 12H6m6-6-6 6 6 6 |
| 09 | d01-tx-tx-d01-coffee | MICRO_ASSET | F05.D01.ICON.CATEGORY.DINING | 30×31 | rgb(28, 22, 16) |  |
| 09 | d01-tx-tx-xfer-e2e-pending-in | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 09 | d01-tx-tx-d01-market | MICRO_ASSET | F05.D01.ICON.FOOD.BASKET | 30×30 | rgb(28, 22, 16) |  |
| 09 | d01-record | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M12 5v14M5 12h14 |
| 09 | d01-history-scan | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M3 8.5h4l2-3h6l2 3h4V1 |
| 10 | d01-back | INLINE_SVG | INLINE_SVG | 15×15 | rgb(255, 241, 220) | M19 12H6m6-6-6 6 6 6 |
| 10 | d01-tx-tx-d01-vesuvio | MICRO_ASSET | F05.D01.ICON.CATEGORY.DINING | 30×31 | rgb(28, 22, 16) |  |
| 10 | d01-tx-tx-d01-fuel | MICRO_ASSET | F05.D01.ICON.FUEL.PUMP | 30×31 | rgb(28, 22, 16) |  |
| 10 | d01-record | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M12 5v14M5 12h14 |
| 10 | d01-history-scan | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M3 8.5h4l2-3h6l2 3h4V1 |
| 11 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M12 10.5v6M12 7.2v.3 |
| 11 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | m4.5 12.5 5 5L20 7 |
| 11 | d01-tx-edit | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M4 20h4l11-11-4-4L4 16 |
| 11 | d01-tx-edit | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 11 | d01-tx-category | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M3 12.5V4h8.5L21 13.5  |
| 11 | d01-tx-category | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 11 | d01-tx-correct | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M20 8a8 8 0 0 0-14.5-2 |
| 11 | d01-tx-correct | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 12 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M4 5h16M6 5c0 1.6-1 2. |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M20 8a8 8 0 0 0-14.5-2 |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M12 4v16M6 20h12M4 8h1 |
| 12 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 12 | d01-rename | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 12 | d01-rename | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 12 | d01-purposes | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 12 | d01-purposes | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 12 | d01-balance-review | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M12 4v16M6 20h12M4 8h1 |
| 12 | d01-balance-review | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 12 | d01-archive | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M5 8.5V20h14V8.5M9.5 1 |
| 12 | d01-archive | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 13 | d01-back | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 13 | — | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 13 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M12 4v16M6 20h12M4 8h1 |
| 13 | d01-review-recent | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M3 5.5C5.5 4.5 8.5 4.5 |
| 13 | d01-review-recent | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 13 | d01-add-adjustment | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M12 5v14M5 12h14 |
| 13 | d01-add-adjustment | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 13 | d01-mark-reconciled | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 14 | d01-add-account-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 14 | d01-create-account | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 15 | d01-edit-account-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 15 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 15 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M4 20V10M9.5 20V6M15 2 |
| 15 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 15 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 15 | d01-save-changes | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 15 | d01-edit-archive | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M5 8.5V20h14V8.5M9.5 1 |
| 16 | d01-record-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 16 | — | MICRO_ASSET | F05.D01.ICON.SCAN.CAMERA | 126×100 | rgb(28, 22, 16) |  |
| 16 | d01-scan-receipt | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M3 8.5h4l2-3h6l2 3h4V1 |
| 16 | d01-manual-entry | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M4 8h14m-4-4 4 4-4 4M2 |
| 16 | d01-type | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3.5 9 5 4h14l1.5 5M4  |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3.5 7v3.5c0 1.2 2.5 2 |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3 12.5V4h8.5L21 13.5  |
| 16 | d01-category | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3.5 10h17M8 3v4M16 3v |
| 16 | d01-date | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M5 3.5h14v17H5zM8.5 8h |
| 16 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3 9.5 12 4l9 5.5M5 10 |
| 16 | d01-account | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 16 | d01-review-save | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 17 | d01-add-cash-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 17 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 17 | d01-cash-source | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 17 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 17 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 17 | d01-cash-review | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 18 | d01-record-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 18 | — | MICRO_ASSET | F05.D01.ICON.SCAN.CAMERA | 126×100 | rgb(28, 22, 16) |  |
| 18 | d01-scan-receipt | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M3 8.5h4l2-3h6l2 3h4V1 |
| 18 | d01-manual-entry | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 18 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 18 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 18 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 18 | d01-category | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 18 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 18 | d01-date | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 18 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 18 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 18 | d01-account | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 18 | d01-review-save | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 19 | d01-record-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 19 | — | MICRO_ASSET | F05.D01.ICON.SCAN.CAMERA | 126×100 | rgb(28, 22, 16) |  |
| 19 | d01-scan-receipt | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M3 8.5h4l2-3h6l2 3h4V1 |
| 19 | d01-manual-entry | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 19 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 19 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 19 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 19 | d01-category | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 19 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 19 | d01-date | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 19 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 19 | — | INLINE_SVG | INLINE_SVG | 21×21 | rgb(28, 22, 16) | M2.5 9.5h19M6 15h4 |
| 19 | d01-account | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 19 | d01-review-save | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 20 | d01-card-payment-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 20 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3 9.5 12 4l9 5.5M5 10 |
| 20 | d01-pay-from | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 20 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M2.5 9.5h19M6 15h4 |
| 20 | d01-pay-card | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 20 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3.5 7v3.5c0 1.2 2.5 2 |
| 20 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M3.5 10h17M8 3v4M16 3v |
| 20 | d01-pay-date | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 20 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | m4.5 12.5 5 5L20 7 |
| 20 | d01-pay-status | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 20 | — | INLINE_SVG | INLINE_SVG | 18×18 | rgb(243, 232, 210) | M5 3.5h14v17H5zM8.5 8h |
| 20 | d01-pay-review | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 21 | d01-purposes-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 21 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 21 | d01-save-purposes | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 22 | d01-back | INLINE_SVG | INLINE_SVG | 15×15 | rgb(255, 241, 220) | M19 12H6m6-6-6 6 6 6 |
| 23 | d01-adjust-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 23 | — | INLINE_SVG | INLINE_SVG | 23×23 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 23 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 23 | d01-adjust-reason | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 23 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 23 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 23 | d01-save-adjustment | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 24 | d01-correct-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 24 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 24 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 24 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 24 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 24 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 24 | d01-correct-edit | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M4 20h4l11-11-4-4L4 16 |
| 24 | d01-correct-edit | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 24 | d01-correct-account | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M3 9.5 12 4l9 5.5M5 10 |
| 24 | d01-correct-account | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 24 | d01-correct-category | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M3 12.5V4h8.5L21 13.5  |
| 24 | d01-correct-category | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 24 | d01-correct-duplicate | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M16 8V5a1 1 0 0 0-1-1H |
| 24 | d01-correct-duplicate | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 24 | d01-correct-delete | INLINE_SVG | INLINE_SVG | 20×20 | rgb(243, 232, 210) | M4 6.5h16M9 6.5V4h6v2. |
| 24 | d01-correct-delete | INLINE_SVG | INLINE_SVG | 9×16 | rgb(28, 22, 16) | M2 2l10 10L2 22 |
| 25 | d01-archive-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 25 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 25 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | m4.5 12.5 5 5L20 7 |
| 25 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | m4.5 12.5 5 5L20 7 |
| 25 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | m4.5 12.5 5 5L20 7 |
| 25 | d01-archive-confirm | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M5 8.5V20h14V8.5M9.5 1 |
| 26 | d01-receipt-take | INLINE_SVG | INLINE_SVG | 28×28 | rgb(243, 231, 207) | M3 8.5h4l2-3h6l2 3h4V1 |
| 26 | d01-receipt-upload | INLINE_SVG | INLINE_SVG | 24×24 | rgb(28, 22, 16) | M12 16V4m-5 5 5-5 5 5M |
| 26 | d01-receipt-capture-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 27 | d01-review-purchase-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 27 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 27 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 27 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 27 | d01-category | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 27 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 27 | d01-date | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 27 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 27 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 27 | d01-account | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 27 | d01-review-save | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 27 | d01-scan-again | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M3 8.5h4l2-3h6l2 3h4V1 |
| 28 | d01-review-purchase-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 28 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 28 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 28 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 28 | d01-category | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 28 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 28 | d01-date | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 28 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 28 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 28 | d01-account | INLINE_SVG | INLINE_SVG | 18×18 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 28 | d01-review-save | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 28 | d01-scan-again | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M3 8.5h4l2-3h6l2 3h4V1 |
| 29 | d01-receipt-duplicate-close | MICRO_ASSET | F05.D01.CTRL.BACK.PARCHMENT.LIGHT | 39×35 | rgb(28, 22, 16) |  |
| 29 | d01-use-existing | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M16 8V5a1 1 0 0 0-1-1H |
| 29 | d01-save-as-new | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M12 5v14M5 12h14 |
| 29 | d01-fix-details | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 30 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 30 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 30 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 30 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M8 10.5V7.5a4 4 0 0 1  |
| 30 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 31 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 31 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 31 | d01-filter-from | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 31 | d01-filter-to | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 31 | d01-filter-account | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 31 | d01-filter-type | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 31 | d01-filter-category | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 31 | d01-filter-status | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 31 | d01-filter-sort | INLINE_SVG | INLINE_SVG | 14×14 | rgb(28, 22, 16) | m6 9 6 6 6-6 |
| 31 | d01-tx-tx-xfer-e2e-scheduled-in | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 31 | d01-tx-tx-xfer-e2e-scheduled-out | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 31 | d01-tx-tx-d01-coffee | MICRO_ASSET | F05.D01.ICON.CATEGORY.DINING | 30×31 | rgb(28, 22, 16) |  |
| 31 | d01-tx-tx-e2e-grocer | MICRO_ASSET | F05.D01.ICON.CATEGORY.GROCERY | 30×30 | rgb(28, 22, 16) |  |
| 31 | d01-tx-tx-xfer-e2e-pending-in | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 31 | d01-tx-tx-xfer-e2e-pending-out | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 31 | d01-tx-tx-xfer-e2e-transit-in | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | M4 8h14m-4-4 4 4-4 4M2 |
| 31 | nav-home | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M11.7 2.38Q4.22 6.53 2 |
| 31 | nav-money | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(244, 239, 228) | M2.8 8.53h18.4 |
| 31 | nav-add | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M12 4.2v15.6M4.2 12h15 |
| 31 | nav-plan | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M20.06 2.76C8.43 5.4 4 |
| 31 | nav-credit | DOCK_COMPONENT | DOCK_COMPONENT | 23×23 | rgb(27, 24, 20) | M4.35 21V16.96 |
| 32 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 32 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 32 | d01-up-bank | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 14 6-6 6 6 |
| 32 | d01-down-bank | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 10 6 6 6-6 |
| 32 | d01-up-ride | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 14 6-6 6 6 |
| 32 | d01-down-ride | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 10 6 6 6-6 |
| 32 | d01-up-cash | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 14 6-6 6 6 |
| 32 | d01-down-cash | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 10 6 6 6-6 |
| 32 | d01-up-visa | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 14 6-6 6 6 |
| 32 | d01-down-visa | INLINE_SVG | INLINE_SVG | 22×22 | rgb(28, 22, 16) | m6 10 6 6 6-6 |
| 33 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 33 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 7v3.5c0 1.2 2.5 2 |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 10h17M8 3v4M16 3v |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 12.5V4h8.5L21 13.5  |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M12 10.5v6M12 7.2v.3 |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3.5 9 5 4h14l1.5 5M4  |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M6 2.5h12v19l-2-1.4-2  |
| 33 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 33 | d01-save-transaction | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
| 34 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 34 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 34 | d01-receipt-retry | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M3 8.5h4l2-3h6l2 3h4V1 |
| 34 | d01-receipt-upload | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M12 16V4m-5 5 5-5 5 5M |
| 34 | d01-receipt-manual | INLINE_SVG | INLINE_SVG | 13×13 | rgb(28, 22, 16) | M4 20h4l11-11-4-4L4 16 |
| 35 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 35 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 35 | d01-review-account | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | M15.5 15.5 21 21 |
| 36 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 36 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 36 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M3 9.5 12 4l9 5.5M5 10 |
| 37 | d01-search | INLINE_SVG | INLINE_SVG | 20×20 | rgb(246, 236, 216) | M15.5 15.5L21 21 |
| 37 | d01-add | MICRO_ASSET | F05.D01.ICON.PLUS.FRAMED | 32×30 | rgb(255, 241, 220) |  |
| 37 | — | INLINE_SVG | INLINE_SVG | 20×20 | rgb(28, 22, 16) | M5 3.5h14v17H5zM8.5 8h |
| 37 | d01-confirm-update | INLINE_SVG | INLINE_SVG | 13×13 | rgb(246, 238, 221) | m4.5 12.5 5 5L20 7 |
