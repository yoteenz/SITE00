# 05 · Record Transaction control audit (16)

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Control | Before | After | Status |
|---|---|---|---|
| Transaction type | native select | JURNL_SELECT (PURCHASE / MONEY IN / TRANSFER / CARD PAYMENT, same ids) | PASS |
| Merchant | sans input | serif input on a torn strip | PASS (row not drawn in the authority; required) |
| Amount | sans input | serif input, decimal keypad | PASS |
| Category | native select (iOS system menu) | JURNL_SELECT, parchment list, type-ahead | PASS |
| Date | native date (wheel / `11/04/2026`) | JURNL_DATE_PICKER (`NOV 4, 2026`) | PASS |
| Notes | sans input | serif input | PASS |
| Account | native select | JURNL_SELECT | PASS |
| Scan receipt | moss button | scan block (founder scan art + stacked actions) | PARTIAL (Batch 04 style) |
| Manual entry | cream button | stacked under scan | PASS |
| Validation | alert + uncertain borders | unchanged | PASS |
| Submission | RECORD TRANSACTION → review → save once | unchanged, now on screen at 393 × 852 | PASS |
| Cancellation | back chip / Escape | paper back tile + Escape | PASS |
| Unsaved changes | no prompt (existing behaviour) | unchanged | PARTIAL (no authority) |
