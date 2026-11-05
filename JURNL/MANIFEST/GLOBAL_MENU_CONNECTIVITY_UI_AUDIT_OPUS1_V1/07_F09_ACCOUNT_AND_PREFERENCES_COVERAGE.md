# 07 · F09 ACCOUNT family and preferences coverage

The F09 ACCOUNT family is the **approved** owner of account settings: REFERENCE_REPLICA1 refs 03–06, role APPROVED in
`JURNL/F09_SAFE/REFERENCE_REPLICA1/REPLICA_MANIFEST.json`. Runtime: `runtime/screens/AccountScreens.tsx` (AccountScreen, 3 pages;
AccountDrawer). Its layout is `layout/referenceLayout.ts` (REF_ACCT1/2/3) and `layout/overlayReferenceLayout.ts` (OVR_DRAWER).

## Canonical ownership (the menu links to these, and creates no duplicates)

| Capability | Canonical owner (existing) | Other current entries (duplicates to keep as links only) | Menu row (06) |
|---|---|---|---|
| Profile | ACCOUNT page 1 PROFILE card (placeholder edit) | drawer PROFILE → page | ACCOUNT & PROFILE |
| Display currency | `CurrencySheet` | page 1 + drawer | CURRENCY & EXCHANGE |
| Connection status | `honestAccountsConnectionLabel` + `money/places`; future CX-12 | page 1 + drawer | CONNECTED ACCOUNTS & SYNC |
| Ask JURNL context consent | consent record `ASK_JURNL_CONTEXT` | page 1 + drawer toggles | PRIVACY & CONSENTS (AI section) |
| Safe to Spend buffer | `settings.safeToSpendBuffer` read by F09 `safeToSpend.ts` | page 1, drawer, F09 hold sheet | SAFE TO SPEND BUFFER |
| Privacy & consents | `ConsentsSheet` (3 setup consents) + F01.11 tools (hidden) | menu, page 2, drawer | PRIVACY & CONSENTS |
| Notifications | page 2 (placeholder) | — | PREFERENCES |
| Security | F01.12 primer (hidden) / page 2 placeholder | — | PREFERENCES → SECURITY |
| Week start & date format | page 2 (placeholder) | — | PREFERENCES |
| Data export / delete account | F01.11 (hidden; export copy misleading, delete NOT_CONFIGURED on Supabase) / page 3 placeholder | — | PRIVACY & CONSENTS |
| Help & support / Legal | page 3 placeholders; menu toast | — | HELP & SUPPORT |
| Sign out | `signOut()` | menu, page 3, drawer | SIGN OUT |
| Per-pocket settings | DOT 01 `SettingsPage` (`money/places/:placeId/settings`) | — | none (reached from a pocket) |
| Membership / add-ons | V3 folios | — | MY MEMBERSHIP / EXPLORE ADD-ONS |
| Classification rules | none (future RULES-A) | — | CLASSIFICATION & LEARNING RULES |

## Preservation rules for implementation

* The F09 ACCOUNT page and drawer stay as approved replicas. Menu rows **link into them**; they are not rebuilt elsewhere.
* PREFERENCES must not remain a hidden container for financial settings (RC-1).
* Exception to flag: `c34ef288f` (this agent's editorial-overlay branch, **not** on the tunnel tip) re-skinned the F09 drawer with board-06 imagery and
  changed the replica test's shell assertion. The F09 drawer is APPROVED and board 06 is pending, so this must not reach the tunnel without
  founder decision **FD-12**.
