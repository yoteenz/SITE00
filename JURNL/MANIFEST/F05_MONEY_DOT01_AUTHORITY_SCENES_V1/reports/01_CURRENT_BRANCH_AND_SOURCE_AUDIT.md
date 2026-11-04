# 01 · Current branch and source audit

Sprint `P0.JURNL.F05-MONEY.DOT01.AUTHORITY-FIRST-SHELL-AND-COMPOSITION-RECONSTRUCTION.OPUS2`. No merge, no deployment, no
production database access, no image generation, no paid provider call.

## Branches and pull requests (read 2026-11-04, GitHub)

| Ref | Head | State | Role in this sprint |
|---|---|---|---|
| #1713 `cursor/jurnl-financial-safety-integration-4e5a` | `f7e2739c` | open, draft | **financial base** (latest financially safe candidate). Not modified. |
| #1707 `claude/jurnl-f05-money-motion-pilot-um0u93` | `0e930112` | open, draft | DOT 01 + OPUS1 (Batch 05 / 06). Not modified. |
| #1709 `cursor/jurnl-f05-money-full-bleed-layout-4e5a` | `ad7ac177` | open | short-phone fixes; already carried by #1713 (below). Not modified. |
| #1712 `cursor/jurnl-f05-type-minus-2px-4e5a` | `7752eae2` | open | MONEY type −2 px. **Not** in this base (see 22). |
| #1708 `cursor/jurnl-founder-entitlements-isolated-v1-4e5a` | `470fc09a` | open, draft | unrelated (entitlements). Not touched. |
| **this sprint** `claude/jurnl-f05-dot01-authority-scenes-um0u93` | see 21 | new, isolated | the work below |

The isolated branch is `f7e2739c` (#1713) + a cherry-pick of the OPUS1 commit `0e930112` (→ `3604d2e7`, same patch-id)
+ this sprint's commit. Nothing was force-pushed; no existing branch was rewritten.

## What the financial base carries (verified)

* `313fe861` canonical card overpay guard and cabinet safe archive (#1713's own fix).
* #1709's two short-phone fixes as cherry-picks: `cbb75d80` (viewport-anchored fixed stages) has the **same patch-id**
  as `ad7ac177`; `24ed0392` (width-first phone scale) carries `f05MotionLayout.ts` **line-for-line** identical to
  `b818257c`, with its `Dot01Frame.tsx` hunk adapted to the DOT 01 frame on this base.
* Canonical settlement (transfer settlement, card payment settlement, Safe to Spend) from #1705 / #1706 underneath.

## Source authorities

V9 handoff package `01_MOBILE_SCREEN_AUTHORITIES/` — 37 screen PNGs + 3 SIDEKICK PNGs, lossless, 941 × 1672 each. These
are the only reference for composition; the runtime never mounts one as a page. SHA-256 (first 16 hex):

| ID | file | sha256 |
|---|---|---|
| 01 | 01_MONEY_DOT01_VIEW_ALL_ACCOUNTS | 12b95e927026c8db |
| 02 | 02_BANK_ACCOUNT | 019fc2d773722ab9 |
| 03 | 03_RIDESHARE_CARD | 68895b97db856b29 |
| 04 | 04_CASH_ON_HAND | 9ecd23edf73e12f9 |
| 05 | 05_CREDIT_CARD | ec4d6ab724b599ae |
| 06 | 06_ALL_ACCOUNTS | 4161e4075db14d2e |
| 07 | 07_BANK_TRANSACTION_HISTORY | 7f70b6cd62512508 |
| 08 | 08_RIDESHARE_ACTIVITY | af2d15e1bb698360 |
| 09 | 09_CASH_USAGE_HISTORY | 406db89d39d0bf1b |
| 10 | 10_CREDIT_CARD_ACTIVITY | bc675a7604b0afba |
| 11 | 11_TRANSACTION_DETAIL | ef2c511cbbe854b4 |
| 12 | 12_ACCOUNT_DETAILS_AND_SETTINGS | 13224a23c779ca78 |
| 13 | 13_ACCOUNT_BALANCE_REVIEW | 4921b6df6d0a6d3e |
| 14 | 14_ADD_ACCOUNT | 39dfbb1f46ec5e84 |
| 15 | 15_EDIT_ACCOUNT | 4c9f849c29868efd |
| 16 | 16_RECORD_BANK_TRANSACTION | 67fa6d71ed592d9f |
| 17 | 17_ADD_CASH | 16f57d4cf45367e6 |
| 18 | 18_RECORD_CASH_SPENDING | 58dd22f1b67dacb1 |
| 19 | 19_RECORD_CREDIT_CARD_PURCHASE | 6c2e155f37912619 |
| 20 | 20_RECORD_CREDIT_CARD_PAYMENT | 21ec530c85fe396d |
| 21 | 21_ACCOUNT_PURPOSE_PREFERENCES | f8e55e1acb99b721 |
| 22 | 22_EMPTY_ACCOUNTS | 4f70fa1e61de3b38 |
| 23 | 23_BALANCE_ADJUSTMENT_REVIEW | b128a2c24d224d30 |
| 24 | 24_TRANSACTION_CORRECTION_REVERSAL | 6d03d0220a3b0841 |
| 25 | 25_ACCOUNT_ARCHIVE_CONFIRMATION | c226c511301675d9 |
| 26 | 26_CAPTURE_RECEIPT | 8ee919a64720529f |
| 27 | 27_SCANNING_RECEIPT | d13dfcce46be6c1e |
| 28 | 28_REVIEW_EXTRACTED_PURCHASE | 6b552fd8d8a2bd11 |
| 29 | 29_RECEIPT_EXCEPTION_DUPLICATE | 883740919c39619f |
| 30 | 30_ACCOUNT_SETUP_DETAILS | c12ec558c4844e4b |
| 31 | 31_TRANSACTION_SEARCH_AND_FILTER | 341e66162b6b70c4 |
| 32 | 32_REORDER_ACCOUNTS | 0cda0a43bbe9a6fd |
| 33 | 33_TRANSACTION_REVIEW | 3831a61bb0a281a5 |
| 34 | 34_RECEIPT_CAPTURE_FAILURE | f14076c887e54ece |
| 35 | 35_ACCOUNT_NEEDS_REVIEW | 26b5211c5aa45604 |
| 36 | 36_ARCHIVE_BLOCKED | e98abf8a073fce7b |
| 37 | 37_CORRECTION_REVERSAL_CONFIRMATION | a0f6655e06bb5ac7 |
| SK01 | SIDEKICK_SK01_PARENT_MONEY | b68e5012f29fd47a |
| SK02 | SIDEKICK_SK02_ACCOUNT_DETAILS | 547d2c70ea811f0f |
| SK03 | SIDEKICK_SK03_RECEIPT_OVERLAYS | c11b040fe2af4ddc |

Full hashes of 03 / 04 / 05 are recorded in `src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENES.json`.
