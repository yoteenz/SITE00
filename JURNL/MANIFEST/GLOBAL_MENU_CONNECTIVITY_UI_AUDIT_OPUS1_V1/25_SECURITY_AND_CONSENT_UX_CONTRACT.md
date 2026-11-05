# 25 · Security and consent UX contract (connectivity states)

Evidence classes:
* **DESIGN_REQUIREMENT**, with the boundary from FI audit 19 (security, privacy, tenancy) and 03 (no credentials).
* **VERIFIED_CURRENT_CODE** for the current consent records: `data/foundation/consent.ts` (LINKED_ACCOUNTS, ASK_JURNL_CONTEXT, AI_* flags,
  DATA_REMEMBER, NO_DATA_SALE) and `repository/consentSync.ts`.

## Global rules

1. **No bank credentials in JURNL UI.** No password, PIN, MFA code, security question or account-number entry field exists in any
   JURNL-owned component. Institution authentication is PROVIDER_HOSTED.
2. **Tokens never reach the client.** The provider public token or code is exchanged server-side. No access token is rendered,
   logged or stored in the device repository (`jurnl.repository.v{N}.{userId}`).
3. **Consent is real only when a provider item exists** and the user selected accounts (FI audit 03). The F02 preview patch is not a
   consent to a bank.
4. **Revocation is reported honestly.** States read REQUESTED until the provider or system confirms. Copy never says "deleted at your
   bank".
5. **Tenancy.** Rules, imports and suggestions are per owner. No UI shows another user's data, and no "people like you" learning exists.

## Per state (connection states from 09)

| State | User permission | Provider permission | Data shown | Sensitive fields | Token boundary | Consent acknowledgment | Error recovery | Disconnect behaviour | Account-deletion implication |
|---|---|---|---|---|---|---|---|---|---|
| CS-02 WHY CONNECT | acknowledge LINKED_ACCOUNTS + scopes (balances, transactions, identity of accounts) | — | scope list | none | none yet | explicit CONTINUE; stored with time and version | NOT NOW | — | — |
| CS-03 FIND INSTITUTION | — | provider directory | names | none | none | — | retry | — | — |
| CS-05 / CS-06 HANDOFF + SIGN-IN | continue | institution OAuth / MFA (provider) | provider UI | credentials: **provider only** | provider session; JURNL receives only a public token or code | provider's own | CS-21 interrupted | — | — |
| CS-07 PROCESSING | — | item creation | progress | none | server-side exchange | — | CS-20 | — | — |
| CS-08 CHOOSE ACCOUNTS | select accounts | accounts product | name, type, **mask (last 4 only)**, balance if supplied | mask, balance | none | selection stored | — | unselected accounts are not imported | — |
| CS-09 / CS-10 MAP / DUPLICATE | confirm mapping | — | pocket names, masks | mask | none | — | — | — | — |
| CS-11 HISTORY WINDOW | choose window | transactions product | window | none | none | the window choice is stored | — | — | — |
| CS-14 REVIEW IMPORTED | confirm or correct | — | descriptions, amounts | descriptions | none | — | — | — | — |
| CS-17 DETAILS / HEALTH | — | — | institution, mask, as-of | mask | none | — | CS-20 / CS-22 | link to CS-25 | — |
| CS-22 REAUTH | continue | provider update mode | institution | none | provider session | provider's own | LATER | — | — |
| CS-25 DISCONNECT | confirm; choose keep vs remove eligible imported data | item removal call | what stays, what goes | none | server revokes provider item | confirmation stored | status REQUESTED → CONFIRMED / FAILED | pocket → MANUAL_ONLY; imported rows labelled | — |
| CS-26 REVOKE CONSENT | withdraw LINKED_ACCOUNTS | removal of every item | every connection affected | none | as above | withdrawal stored with time | as above | every connected pocket → MANUAL_ONLY | — |
| ACCOUNT DELETION (F01.11 `privacy-delete-account`, `auth.deleteAccount`) | confirm | removal of every item **first** | consequences | none | provider items revoked before auth deletion | stored | blocked if revocation fails, with an explanation | all | account data deleted per policy; provider revocation must be confirmed |

## Consent model gaps found (see 16)

* The three setup consents are persisted, but **no runtime consumer gates on them** (agent trace at `4ddbac6ce`).
* The ASK JURNL CONTEXT toggle can fail to stay OFF (toggle-off defect, `AccountScreens.tsx:54-60` × `consentSync.ts:21-22`).
* Until both are fixed, no connectivity consent can be built on these records.

Founder decision FD-03 approves the consent model.
