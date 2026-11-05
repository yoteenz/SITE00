# 27 · Regression and product risk register

| Id | Type | Risk / regression | Evidence | Severity | Mitigation |
|---|---|---|---|---|---|
| MR-1…4 | REGRESSION | currency, connection, Ask context and buffer moved behind PREFERENCES | 05 RC-1 (`653fb65a5` → `3fac5e546`) | HIGH | Phase A menu rows |
| MR-5 | REGRESSION | exchange-rate disclosure removed | 05 RC-2 (`d2915e32d` → `4c1d19378`) | MEDIUM | render `disclosure` / `lastError` |
| R-01 | PRODUCT | F02 preview CONNECTED mistaken for a real bank link | `SetupScreens.tsx:284`; FIA R1 / B12 | HIGH | status enum; transaction-enabled only after sync |
| R-02 | PRODUCT | F02 permission authority promises "NOT YOUR TRANSACTIONS", contradicting connected-first | `F02.IN.PERMISSION.jpg` | MEDIUM | FD-05; new CX-02 copy |
| R-03 | FINANCIAL | buffer currency unit (D-02) | `safeToSpend.ts:144-147` | HIGH | convert or enter in canonical currency |
| R-04 | PRIVACY | Ask context OFF can revert (D-01) | `consentSync.ts:21-22` | HIGH | fix before any real AI provider |
| R-05 | PRIVACY | export confirmation with no backend (D-05) | `SecurityScreens.tsx:346-348` | HIGH (trust) | honest copy / DATA REQUEST STATUS |
| R-06 | PRIVACY | consents persisted but not enforced (D-06) | `consentSync.ts` (no consumer) | MEDIUM | consumers before connectivity |
| R-07 | DESIGN | a generic parchment template becomes the default for all new screens | the sprint canon | MEDIUM | 23 lists 11 distinct shells; founder review per batch |
| R-08 | DESIGN | provider UI impersonated in authorities | sprint §08 | HIGH | CX-04 interstitial only; PROVIDER_HOSTED never drawn |
| R-09 | AUTHORITY | `c34ef288f` re-skinned the APPROVED F09 drawer with pending board-06 imagery and re-pointed a replica test | `c34ef288f` | MEDIUM | FD-12 before merging that branch |
| R-10 | AUTHORITY | V3 menu (not approved) is live on the tunnel; board 08 pending | V3 README; OPUS2 report 13 | MEDIUM | FD-01 |
| R-11 | PRODUCT | coverage claims for Uber Pro Card / Lyft Direct | FIA 05 (CSV flag only; Lyft Direct UNKNOWN) | MEDIUM | PROVIDER_UNSUPPORTED until verified |
| R-12 | PRODUCT | "LIVE / REAL-TIME" copy for delayed data | sprint §11 | MEDIUM | freshness language (11) |
| R-13 | PROCESS | audit mistaken for a merge of #1705/#1706/#1713/#1714 | FIA R10 | MEDIUM | docs-only branch from `main`; nothing merged |
| R-14 | UX | sign out without confirm or redirect (D-03) | `store.tsx:209-213` | LOW | Phase A |
| R-15 | UX | dead / no-op controls (D-04) | `GlobalMenu.tsx:158,211` | LOW | label or remove |
| R-16 | IA | the menu grows past the viewport | 06 | LOW | contained list scroll; no page scroll |
