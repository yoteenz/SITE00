# 12 · Global functional copy replacement matrix

Full table: `12_FUNCTIONAL_COPY_REPLACEMENT_MATRIX.csv` (65 rows).

| Origin | Rows |
| --- | --- |
| The 22 strings flagged in `PRODUCT_UTILITY_AUDIT_V1/JURNL_PLAIN_LANGUAGE_AUDIT.csv` | 22 — each has a decision |
| Priority rows from the #1704 matrix | 6 |
| Tagline | 1 (kept) |
| Additional functional strings found while implementing | 36 |

| Decision | Count |
| --- | --- |
| REPLACED | 46 |
| KEPT_ALREADY_PLAIN | 9 |
| KEPT_EDITORIAL (brand voice, approved replica positions) | 8 |
| OUT_OF_SCOPE_F01 | 2 |

Rules followed: fact → meaning → action; counts and amounts only from records (no fictional "2 bills"); no internal codes on screen (`NEEDS_SETUP`, `PARTIAL`, `ACCOUNTS`, `SETUP`, `MOCK`, `DERIVED`, `F07`, transaction ids); words used: CASH, BANK ACCOUNT, CREDIT CARD, INCOME, TRANSFER, PAYMENT, SUBSCRIPTION, BILL, SET ASIDE, AVAILABLE, DUE, PAID. **PLAN TODAY. GROW FREELY.** is unchanged. Family questions (`parents/catalog.ts`) stay in the editorial tier; the #1704 proposals for them are still awaiting the founder.

Number note: this brief and the #1704 PR body say "38 flagged". The committed CSV / meta file flags **22**. This matrix uses the file.

Tests updated because they pinned replaced copy: `jurnlF03F04Runtime` (status line, SEE WHY rows, Activity empty / no-match), `jurnlRootAuthorityReconstruction1` (TODAY status line, F08 "WHERE YOUR MONEY IS ASSIGNED." / "SET MONEY ASIDE").
