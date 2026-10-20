# 09 — Backend Gap Reconciliation

Gap IDs are **not renumbered**. Every OPUS1 reference stays valid. Retired gaps keep their row, marked RETIRED.

| ID | OPUS1 gap | LOCK1 status | Note |
|---|---|---|---|
| **G-02** | Quote shown before founder approval | **ACTIVE · BLOCKING** | Pipeline re-affirmed (L-09): no payable quote before founder approval |
| **G-09** | No session / email-link / code reentry; no `/foundation/return` | **ACTIVE · BLOCKING** | Now the *only* secure return path besides an existing session (`06`) |
| **G-11** | Access-card id service (issue, revoke, version, hashed ids, `df_access_cards`) | **RETIRED** (L-05) | Removed from scope, phases, tables and tests. No card table is proposed |
| **G-12** | Bearer token: no expiry, rotation, hashing, revocation; CORS `*`; ARCHIVED still served | **ACTIVE · BLOCKING** | Unchanged. General link revocation produces the "LINK REPLACED" state |
| G-13 | No manifest / icons / theme-color; favicon missing | **ACTIVE · UPDATED** | Icons now come from the approved master (D1/D2) at the paths in `08`; manifest in `05` |
| G-14 | Email templates | **ACTIVE · UPDATED** | Post-submission email gains WHAT HAPPENS NEXT / WHEN WE'LL BE IN TOUCH / HOW TO RETURN; no card attachment |
| G-01, G-03–G-08, G-10, G-15–G-26 | as OPUS1 | **ACTIVE · UNCHANGED** | — |

Retired with G-11 (they were card-specific):
- QR payload and validation rules (OPUS1 `12`);
- card rate limits;
- the `card_id_hash` logging rule;
- the `df_access_cards` proposed table;
- OD-06 (wallet passes) and OD-07 (when the card is issued), both closed.

Kept although they were written alongside the card:
- rate limits on `/foundation/return` and on email challenges;
- non-enumerating responses;
- no token in logs or analytics.
