# 16 · Privacy & consents audit

**PRIVACY_CONSENTS_STATUS: ACTIVE_BUT_PARTIAL.**
* Consents are stored and versioned, but no runtime consumer gates on the three setup consents.
* The strongest tools (export request, delete account, disable AI, revoke) live only in onboarding F01.11 and are hidden from the menu.
* One export confirmation is misleading.

## Current (VERIFIED_CURRENT_CODE @ `4ddbac6ce`)

| Item | Evidence | Status |
|---|---|---|
| Consent model: 9 types, versioned `CONSENT_VERSION = '2026-10-05'`; AI_* and ASK_JURNL_CONTEXT default DENIED | `data/foundation/consent.ts:3-48` | implemented |
| Menu PRIVACY & DATA → `ConsentsSheet`: REMEMBER SETUP, LINKED ACCOUNTS OPTIONAL, NOTHING SOLD | `runtime/global/GlobalMenu.tsx:86`; `AccountScreens.tsx:72-92`; `patchSetup` → `syncSetupConsentsToRepository` (`data/f02/setupDraft.ts:60`, `repository/consentSync.ts:7-12`) | ACTIVE_BUT_PARTIAL. Persisted, **no consumer**. NOTHING SOLD can be switched off. |
| Same sheet from the ACCOUNT page 2 and the drawer | `AccountScreens.tsx:248, :410` | 3 entry points |
| ASK JURNL CONTEXT consent | toggle-off defect (`AccountScreens.tsx:54-60` × `consentSync.ts:21-22`; gate `askJurnl.ts:39`) | ACTIVE_BUT_PARTIAL (defect PRV-D1) |
| AI access toggles `privacy-ai-*`, save | F01.11 `runtime/screens/SecurityScreens.tsx:217-405` | IMPLEMENTED_BUT_HIDDEN |
| Data export request `privacy-export-request` | `SecurityScreens.tsx:346-348` sets `device.exportRequested` but shows "WE'LL SEND YOUR DATA TO YOUR EMAIL SOON." (`data/f01/copy.ts:313`) with **no backend** | HIDDEN and **misleading** (PRV-D2) |
| ACCOUNT page DATA EXPORT | `AccountScreens.tsx:263` `notYet` | PRESENT_BUT_PLACEHOLDER |
| Delete account `privacy-delete-account` → `DeleteAccountModal` → `auth.deleteAccount` | local adapter deletes the local record (`runtime/state/adapters.ts:194-199`); Supabase adapter returns `{ ok:false, code:'NOT_CONFIGURED' }` (`supabaseAuthAdapter.ts:78`) | HIDDEN; partial |
| Revoke third-party access `privacy-remove-revoke` | note only: "NO CONNECTED ACCOUNTS TO REVOKE." (`SecurityScreens.tsx:386`) | HIDDEN; honest placeholder |
| LEGAL / TERMS & POLICIES | `AccountScreens.tsx:265` `notYet`; F01 terms copy is headings only (`copy.ts:84-86`) | PRESENT_BUT_PLACEHOLDER |
| Planned surface | `docs/jurnl/structural-completion/JURNL_GLOBAL_SYSTEMS_MAP.json` `systems[16]` GS.SETTINGS: "PROFILE, DISPLAY CURRENCY, AI ACCESS, CONSENTS, DATA EXPORT, DELETE ACCOUNT, SESSIONS, SIGN OUT"; PRIVACY / SECURITY / EXPORT / DELETE marked MISSING | DOCUMENTED (DESIGN_REQUIREMENT) |

## Connected-data extension (DESIGN_REQUIREMENT, FI audit 19)

| Need | Surface | Today |
|---|---|---|
| VIEW CONSENTS | PRIVACY & CONSENTS center: every consent with state, version and time | partial (3 of 9 shown) |
| REVIEW BANK ACCESS | per institution: products granted (balances, transactions), accounts included, since when | NOT_PRESENT (no provider) |
| UPDATE PERMISSIONS | per item: include / exclude accounts; transactions on / off where the provider allows | NOT_PRESENT |
| WITHDRAW CONSENT | CS-26 | flag exists (LINKED_ACCOUNTS) |
| DISCONNECT | CS-25 | NOT_PRESENT |
| DELETE ELIGIBLE DATA | CS-25 option 2; account deletion revokes provider items first | NOT_PRESENT |
| EXPLAIN DATA USAGE | what JURNL reads, why, retention; AI interpretation consent separate from learning-rule preference | partial (copy in F01.11) |
| DATA REQUEST STATUS | export and deletion requests with REQUESTED → IN PROGRESS → COMPLETE / FAILED | NOT_PRESENT; today's export copy is misleading |
| AUDIT LOG | consent and connection changes with times | NOT_PRESENT (ledger audit exists: `settings.ledgerAudit`) |

Rule: provider deletion or revocation is never reported as successful without confirmation from the underlying system (sprint §16). The PRV-D2 copy
violates this today for export.

## Composition

PRIVACY & CONSENTS center: one folio (batch B08), plus DATA REQUEST STATUS in batch B09. The current sheet is a plain `JurnlDrawer`.
F02.07 BOUNDARIES (`JURNL/F02_SETUP/CHILDREN/F02.07_BOUNDARIES.jpg`, "WHAT JURNL MAY KEEP") is a setup-family ancestor for the consent rows.
