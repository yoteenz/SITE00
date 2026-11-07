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

