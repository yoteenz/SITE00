# 24 · Routing and functional ownership

## Current routing (VERIFIED_CURRENT_CODE @ `4ddbac6ce`)

```
f09-menu (JurnlCornerChrome.tsx:79; hidden on '', entry*, setup*)
 └─ panel 'menu' → GlobalMenu
     ├─ menu-account      → go('account') ─────────────► AccountScreen (3 pages; paged in local state)
     ├─ menu-preferences  → panel 'preferences' ────────► AccountDrawer (the only opener)
     │                       ├─ drawer-profile/account → go('account')
     │                       ├─ drawer-currency        → CurrencySheet
     │                       ├─ drawer-connection      → go('money/places')
     │                       ├─ drawer-ask-context     → consent toggle
     │                       ├─ drawer-buffer(-save)   → settings.safeToSpendBuffer
     │                       ├─ drawer-privacy         → ConsentsSheet
     │                       └─ drawer-sign-out        → signOut()
     ├─ menu-privacy      → panel 'privacy' → ConsentsSheet (back → menu)
     ├─ menu-membership   → MembershipFolio (back → menu)
     ├─ menu-add-ons      → AddOnCollection → UnlockFolio (back → add-ons)
     ├─ menu-help         → toast NOT IN THIS PREVIEW YET
     └─ menu-sign-out     → signOut()
Routes: account · money/places · money/places/:placeId/settings · entry/privacy (F01.11) · entry/security (F01.12)
No routes for preferences, privacy or settings; panels are not deep-linkable.
Dock (ProductNav.tsx:18-24): HOME F03 · MONEY F05 · ADD quick-add · PLAN F08 · CREDIT F12 (no duplicates in the menu)
```

## Proposed routing (Phase A; existing owners only)

| Menu row | Target | Mechanism |
|---|---|---|
| CONNECTED ACCOUNTS & SYNC | status folio now → CX-12 later | panel `connections` (new); its SET UP → `money/places` |
| CURRENCY & EXCHANGE | `CurrencySheet` | panel `currency` |
| SAFE TO SPEND BUFFER | buffer folio (reuses the drawer card logic) | panel `buffer` |
| ASK JURNL | `AskJurnlSheet` | panel `ask` |
| PREFERENCES | ACCOUNT page 2 items + SECURITY → `entry/security` tools (as a settings surface, not onboarding) | per FD-01 |
| PRIVACY & CONSENTS | `ConsentsSheet` + F01.11 tools | panel `privacy` |

Every panel's close returns to the menu. Panels become deep-linkable through `?panel=` (optional; FD-02).

## Ownership boundaries

| Owner | Responsibility (sprint §30) |
|---|---|
| **Composer / Opus engineering** | routing; data integration; connected-account flows against the provider port; real controls; financial state; form validation; consent persistence and consumers (D-06); accessibility; live typography; responsive geometry (`--jb` board units); intelligence integration; the fixes D-01…D-08 |
| **Grok / OpenArt production** | the 28 screen authorities in batches B01–B07; inner shells IS-01…IS-11; independent art IA-01…IA-04; the optional SK04; text-free; provenance ledgers |
| **Founder** | design approval per batch; new functionality approvals; provider selection (OD-01); membership decisions; consent model (FD-03); production deployment authorization |

Visual design approval is not software readiness. An approved authority does not make its state functional.
