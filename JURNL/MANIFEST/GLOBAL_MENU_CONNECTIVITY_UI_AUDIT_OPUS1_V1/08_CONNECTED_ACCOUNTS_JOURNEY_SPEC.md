# 08 · Connected accounts journey (JURNL-owned, provider-agnostic)

Evidence classes:
* **DESIGN_REQUIREMENT**: the journey itself.
* **VERIFIED_CURRENT_CODE**: the current-state facts.
* **VERIFIED_VISUAL_AUTHORITY**: the reuse candidates.

Functional source: Financial Intelligence Foundation Audit, PR #1715 @ `5aeeee0a4`, documents 03, 04, 05, 18 and 19
(`JURNL/MANIFEST/FINANCIAL_INTELLIGENCE_FOUNDATION_AUDIT_V1/`). Read in full in 29. This spec is the UI layer over that
contract. It does not change the contract.

## What exists today (inspected tree `4ddbac6ce`)

| Fact | Evidence |
|---|---|
| No bank provider exists | `src/projects/jurnl/data/foundation/connectionProvider.ts` exports `JURNL_BANK_CONNECTION_PROVIDER = { provider_id: 'jurnl.bank.none', availability: 'PROVIDER_UNAVAILABLE', capabilities: [] }`. Status union: `PROVIDER_UNAVAILABLE`, `MANUAL_ONLY`, `MOCK_DEV`, `CONNECTION_IN_PROGRESS`, `CONNECTED`, `REAUTH_REQUIRED`, `CONNECTION_ERROR`. |
| The only "connect" UI is F02 SETUP, and it is simulated | `SetupScreens.tsx:264` `JurnlChoice … trigger="setup-connect" onSelect={() => openOverlay('permission')}`. `:284` `patchSetup({ accounts: 'CONNECTED' })`. `honestAccountsConnectionLabel('CONNECTED')` returns **`PREVIEW ONLY — NO LIVE BANK LINK`**. FI audit blocker B12. |
| Accounts carry a connected flag that is never true | `data/foundation/accounts.ts:26` `is_connected: boolean`. It is set `false` in `accountSeed.ts:41` and `accountMutations.ts:40`. `SourceType = 'MANUAL' \| 'IMPORT' \| 'CONNECTED' \| 'MOCK'` (`categories.ts:36`). |
| Detail pages say so honestly | DOT 01 `DetailPages.tsx:146`: `INSTITUTION OR SOURCE` = `CONNECTED` only if `is_connected`, otherwise `ENTERED BY YOU`, sub `NO BANK CONNECTION`. |
| Consent flag exists | `data/foundation/consent.ts` `LINKED_ACCOUNTS`, written from the setup draft (`repository/consentSync.ts:10`). |
| F02 permission copy contradicts connected-first | Authority `JURNL/F02_SETUP/INTERACTIONS/F02.IN.PERMISSION.jpg` reads "WHAT A LINK MAY READ: ACCOUNT NAMES · BALANCES · **NOT YOUR TRANSACTIONS**". `F02.ST.CONNECTED.jpg` reads "ACCOUNT LINKED. ONLY THE NAME." The FI audit's product correction (doc 01) supersedes this: supported accounts must import transactions. |

**CONNECTED_BANKING_STATUS: SIMULATED.** The only path is the F02 setup preview. Every pocket is MANUAL_ONLY in practice.

## Boundary (sprint §08, FI audit 03 / 19)

| Owner | Responsibility |
|---|---|
| **PROVIDER_HOSTED** | Institution sign-in, OAuth consent, MFA, credential entry, the provider's own account picker (if the provider requires it). JURNL never draws these and never collects a bank credential. |
| **JURNL** | Why connect; what JURNL will read; institution discovery before handoff (provider search widget or JURNL list); the handoff interstitial; return and processing; account selection (JURNL-side inclusion); pocket mapping; history window; sync progress; imported-activity review; reconciliation; health; reauthorization prompts; disconnect; consent revocation; manual-only alternative; error recovery. |

Two rules hold everywhere:
* **Provider-agnostic.** JURNL stores the provider id, item id and account id (FI audit 05 ingestion port). Copy says "your bank's secure sign-in", never a vendor name, unless the founder selects one (OD-01).
* **Honest status.** An account is transaction-enabled only after a successful transaction sync (FI audit 04). Never "LIVE" or "REAL-TIME". Always show "UPDATED <time>".

## The 30 proposed slots, consolidated into 12 compositions

A composition is one visual authority (shell plus independent art). It serves several functional states through live text and
controls. The full state table is 09 and the screen inventory is 20.

| Comp | Slots served | Interaction | Entry | Reuse candidate (VERIFIED_VISUAL_AUTHORITY) | New authority? |
|---|---|---|---|---|---|
| **CX-01 CONNECT YOUR MONEY** | 01 CONNECT YOUR MONEY · 27 MANUAL-ONLY POCKET ALTERNATIVE | page (SK01 family) | menu CONNECTED ACCOUNTS & SYNC (empty); MONEY empty state; F02.02 | DOT 01 **22 EMPTY ACCOUNTS** (two-action empty folio: primary + secondary pill, vignette). Its live text becomes CONNECT AN INSTITUTION / ADD A MANUAL POCKET. | **No**: reuse 22's composition. The vignette (wallet and coins) stays. |
| **CX-02 WHY CONNECT** | 02 WHY CONNECT (permission explanation) | overlay (SK03) | CX-01 primary | DOT 01 **21 ACCOUNT PURPOSE PREFERENCES** overlay (title paper, rows with marks). F02.IN.PERMISSION is the functional ancestor, but its family and copy are superseded. | **No**: SK03 overlay with live rows (WHAT JURNL READS / WHAT IT NEVER DOES / YOU CAN DISCONNECT). |
| **CX-03 FIND YOUR INSTITUTION** | 03 SUPPORTED INSTITUTION DISCOVERY · 19 PROVIDER UNSUPPORTED | page + search (contained scroll) | CX-02 continue | DOT 01 **31 TRANSACTION SEARCH AND FILTER** (search field, rows) | **Yes, partial**: needs an institution-row shell variant (neutral bank glyph, no third-party logos baked in). Batch B01. |
| **CX-04 SECURE HANDOFF** | 04 PROVIDER AUTHORIZATION HANDOFF (JURNL interstitial only) | overlay | institution tap | none. Board 07 caution is a blocking error, not a calm handoff. | **Yes**: "YOU'LL SIGN IN WITH YOUR BANK, NOT WITH JURNL" interstitial. The provider screen itself is PROVIDER_HOSTED and **must not be drawn**. Batch B01. |
| **CX-05 RETURNING / PROCESSING** | 05 CONNECTION RETURN · 09 INITIAL SYNC PROGRESS · 22 PARTIAL SYNC | page with progress motif | provider return URL | DOT 01 **27 SCANNING RECEIPT** structure (progress folio) | **Yes**: independent L3 sync motif (text-free). The shell is reused from 27. Batch B02. |
| **CX-06 CHOOSE ACCOUNTS** | 06 SELECT ELIGIBLE ACCOUNTS | page, list (contained scroll) | after processing | DOT 01 **32 REORDER ACCOUNTS** (rows with kind art) | **No**: rows gain an INCLUDE mark and a status chip. |
| **CX-07 MAP TO POCKETS** | 07 ACCOUNT PURPOSE / POCKET MAPPING · 24 DUPLICATE / MATCH REVIEW | overlay per account | CX-06 continue | DOT 01 **30 ACCOUNT SETUP DETAILS** (form strips) + **29 RECEIPT EXCEPTION DUPLICATE** (side-by-side match) | **No**, for both. |
| **CX-08 HISTORY AND SYNC** | 08 IMPORT HISTORY / SYNC PREFERENCES · 29 IMPORTED HISTORY COVERAGE | overlay | CX-07 continue; account details | DOT 01 30 strips for preferences | **Yes, partial**: the coverage timeline (requested window vs returned window) has no existing composition. Batch B03. |
| **CX-09 REVIEW IMPORTED ACTIVITY** | 10 IMPORTED ACTIVITY REVIEW · 23 RECONCILIATION REQUIRED | page | after first sync | DOT 01 **33 TRANSACTION REVIEW** + **23 BALANCE ADJUSTMENT REVIEW** | **No**. |
| **CX-10 CONNECTED** | 11 CONNECTION SUCCESS | overlay | after review or skip | SK03 overlay with seal (as DOT 01 archived / done states) | **No**. |
| **CX-11 CONNECTED ACCOUNT** | 12 CONNECTED ACCOUNT DETAILS · 14 CONNECTION HEALTH · 15 REFRESH / SYNC STATUS · 28 RECONNECT | page (SK02) | MONEY pocket; menu list | DOT 01 **12 ACCOUNT DETAILS AND SETTINGS** + **35 ACCOUNT NEEDS REVIEW** | **No**: new rows: INSTITUTION, LAST SYNC, HEALTH, BALANCE SOURCE, RECONNECT. |
| **CX-12 CONNECTED ACCOUNTS & SYNC** | 13 MANAGE CONNECTED ACCOUNTS · 30 MULTIPLE-INSTITUTION MANAGEMENT | page (menu destination) | menu YOUR FINANCES | DOT 01 **06 ALL ACCOUNTS** is pocket-centric, not institution-centric | **Yes**: grouped by institution, with health summary and ADD INSTITUTION. Batch B03. |
| **CX-13 CONNECTION PROBLEM** | 16 REAUTHORIZATION REQUIRED · 17 TRANSACTIONS UNAVAILABLE · 18 BALANCES UNAVAILABLE · 20 CONNECTION FAILED · 21 CONNECTION INTERRUPTED | overlay (caution) | health chip; sync failure | DOT 01 **36 ARCHIVE BLOCKED** / board **07** caution (oxblood, medallion, parchment card) + **34 RECEIPT CAPTURE FAILURE** | **No**: one caution composition, with five live variants (title, explanation, primary action). |
| **CX-14 DISCONNECT** | 25 DISCONNECT ACCOUNT · 26 REVOKE CONNECTION CONSENT | overlay (destructive confirm) | account details; privacy | DOT 01 **25 ACCOUNT ARCHIVE CONFIRMATION** | **No**: two choices: KEEP HISTORY (default) / REMOVE ELIGIBLE IMPORTED DATA. |

That is 14 compositions for 30 slots (CX-13 and CX-14 were split out of the earlier "12" count once reuse was checked).
**New connectivity authorities required: 5 compositions** (CX-03, CX-04, CX-05 motif, CX-08 coverage, CX-12). The
other 9 reuse DOT 01 / board compositions with live content.

## Journey (happy path and branches)

```
MENU · CONNECTED ACCOUNTS & SYNC ─┐            MONEY empty / ADD A POCKET ─┐       F02.02 setup ─┐
                                  ▼                                        ▼                     ▼
                        CX-01 CONNECT YOUR MONEY ── ADD A MANUAL POCKET ──► existing ADD A POCKET (board 02)
                                  │ CONNECT AN INSTITUTION
                                  ▼
                        CX-02 WHY CONNECT ── NOT NOW ──► back
                                  │ CONTINUE (consent acknowledged: LINKED_ACCOUNTS + data scopes)
                                  ▼
                        CX-03 FIND YOUR INSTITUTION ── not supported ──► CX-03 unsupported variant ──► manual pocket
                                  │ select
                                  ▼
                        CX-04 SECURE HANDOFF ──► [PROVIDER_HOSTED sign-in / MFA / consent] ── cancel ──► CX-13 INTERRUPTED
                                  │ provider returns public token / code
                                  ▼
                        CX-05 PROCESSING ── fails ──► CX-13 FAILED
                                  ▼
                        CX-06 CHOOSE ACCOUNTS (discovered → selected)
                                  ▼
                        CX-07 MAP TO POCKETS (new pocket │ link to existing pocket │ possible duplicate)
                                  ▼
                        CX-08 HISTORY AND SYNC (window offered = what the provider allows; OD-08)
                                  ▼
                        CX-05 INITIAL SYNC (backfill) ── partial ──► CX-05 partial variant
                                  ▼
                        CX-09 REVIEW IMPORTED ACTIVITY (duplicates, manual matches, uncertain purpose)
                                  ▼
                        CX-10 CONNECTED ──► CX-11 CONNECTED ACCOUNT / CX-12 list
```

Ongoing: CX-11 health → CX-13 variants → reconnect (CX-04 again with the same item) or disconnect (CX-14).

## Account types (sprint §09)

| Type | Connection UX need | Status today |
|---|---|---|
| CHECKING, SAVINGS | standard flow | MANUAL_ONLY |
| CREDIT CARD | liability; the provider's limit and balance owed are shown when supplied; card payments are transfers, never spending (FI audit 17) | MANUAL_ONLY |
| ELIGIBLE DEBIT-LINKED, DIGITAL BANK, CREDIT UNION | standard flow; coverage per institution | UNKNOWN coverage |
| RIDESHARE PAYOUT CARD (Uber Pro Card, Lyft Direct) | flagged as a payout card in pocket mapping (existing `RIDESHARE PAY` choice in ADD A POCKET). Uber Pro Card appears in one public Plaid coverage snapshot (FI audit 05). **Lyft Direct is UNKNOWN.** Never shown as supported without verification. | MANUAL_ONLY |
| MANUAL POCKET | first-class alternative, never a dead end (CX-01 secondary, CX-03 unsupported) | ACTIVE (`createManualAccount`) |
| OTHER SUPPORTED ACCOUNT | via discovery only | UNKNOWN |

## Distinctions the UI must keep (sprint §09)

Each is a separate, visible status. They are never collapsed:

* **Discovery to connection**: DISCOVERED (CX-06 row) → SELECTED (mark) → CONNECTED (item healthy).
* **Data availability**: BALANCES AVAILABLE · TRANSACTIONS AVAILABLE · TRANSACTIONS UNAVAILABLE.
* **Problems**: SYNC DELAYED (as-of shown) · REAUTHORIZATION_REQUIRED · PROVIDER_UNSUPPORTED.
* **No connection**: MANUAL_ONLY.

The full map to FI audit 04 statuses is in 09.
