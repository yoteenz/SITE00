# 14 · No page-level scroll and action reachability

| ID | UNREACHABLE / PAGE SCROLL — BEFORE | AFTER |
|---|---|---|
| 02 | 393x660: UNREACHABLE:d01-strip-details | none |
| 03 | 393x660: UNREACHABLE:d01-strip-details | none |
| 04 | 393x660: UNREACHABLE:d01-strip-details | none |
| 05 | 393x660: UNREACHABLE:d01-strip-details | none |
| 14 | 393x660: UNREACHABLE:d01-cancel | none |
| 22 | 393x660: UNREACHABLE:d01-add-first | none |
| 25 | 393x660: UNREACHABLE:d01-keep-active | none |
| 26 | 393x660: UNREACHABLE:d01-receipt-manual | 393x660: UNREACHABLE:d01-receipt-manual |
| 29 | 393x660: UNREACHABLE:d01-enter-manually | none |
| 32 | 393x660: UNREACHABLE:d01-save-order,d01-cancel-order | none |
| 34 | 393x660: UNREACHABLE:d01-receipt-manual | none |
| 35 | 393x660: UNREACHABLE:d01-back-accounts | none |

**Page-level scroll: 0 of 333 cells (AFTER). Unreachable-control cells: BEFORE 12 → AFTER 1.**

Fixes: (1) 02–05 action rows close up on short phones (`seatActionRows`, unit test R2 across 6 phone sizes); (2) every content region ends on screen and scrolls inside itself when it would run below the fold (`Dot01Frame`, `data-clamped`).
Remaining: 26 CAPTURE RECEIPT at 393 × 660 — its buttons are baked into the full SK03 render; ENTER MANUALLY is 17 px on screen (the rest below the fold). Fix needs a short-phone SK03 variant or a founder exception (report 19).
