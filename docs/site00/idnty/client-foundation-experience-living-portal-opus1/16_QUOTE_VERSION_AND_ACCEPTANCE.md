# 16 — Quote Version and Acceptance (Family K)

Boards: **M15**, TP03, TL04, D15, X07.

## Versioning (exists server-side; made visible)

| Event | Server (today) | Client (authority) |
|---|---|---|
| Client toggles optional item | `updateQuoteSelections` → v+1, previous SUPERSEDED | new total; version chip increments |
| Founder adjusts | `applyManualQuoteAdjustment` → v+1 | "YOUR PROPOSAL WAS UPDATED" notice + founder note |
| Acceptance recorded | `acceptQuote` records version, terms `df-terms-v1`, IP, UA | "ACCEPTED" page with ACCEPTED BY / WHEN |
| Quote changes after the client opened the page | `ACCEPTANCE_VERSION_MISMATCH` / `QUOTE_SUPERSEDED` | "YOUR PROPOSAL CHANGED SINCE YOU OPENED THIS PAGE…" and the CTA becomes REVIEW PROPOSAL V3 |
| Quote expired (read-time `expires_at`, 14 days) | `QUOTE_EXPIRED` | "THIS PROPOSAL HAS EXPIRED…" with CTA ASK FOR A FRESH PROPOSAL |
| Superseded version payment attempt | webhook guard / payability check | impossible from the UI: superseded versions render struck and offer no action |

## Acceptance page

- **Hero:** "ACCEPT PROPOSAL V2."; lede "YOU ARE ACCEPTING THIS EXACT VERSION — ITS SCOPE, PRICE AND TERMS. IF ANYTHING CHANGES, YOU'LL ACCEPT A NEW VERSION."
- **YOU ARE ACCEPTING:** proposal version + issued time, total, turnaround, terms (`DF-TERMS-V1`).
- **CONFIRM:** the three server-required disclosures, verbatim from `DF_DISCLOSURES`:
  1. I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.
  2. I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.
  3. I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.
- **CTA:** ACCEPT PROPOSAL V2. It is disabled (grey, `aria-disabled`) until all three are confirmed, with "CONFIRM ALL THREE TO CONTINUE · n OF 3 CONFIRMED."
- **Accepted state:** RECORDED panel (ACCEPTED BY contact, WHEN), then CONTINUE TO SECURE PAYMENT.

## Interaction (CF-ACCEPT)

| Field | Value |
|---|---|
| Trigger | ACCEPT PROPOSAL V# |
| Data | `quote.quote_version`, disclosures |
| Loading | "ACCEPTING…" |
| Success | Accepted state; stage stays 4; NEEDS YOU item becomes COMPLETE PAYMENT |
| Error | `checkoutErrorCopy` mapping (exists). On a version mismatch, the page re-renders as "CHANGED" |
| Disabled | Fewer than 3 disclosures · expired · superseded · founder pricing pending |
| Security | The server re-checks the version (exists) |
