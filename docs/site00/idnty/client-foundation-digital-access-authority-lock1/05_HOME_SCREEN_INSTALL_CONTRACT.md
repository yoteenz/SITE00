# 05 — Home Screen Install Contract

## CTA and placement

- **Label:** `SAVE YOUR FOUNDATION` (L-06). Sheet titles: `SAVE YOUR FOUNDATION · IPHONE`, `SAVE YOUR FOUNDATION · ANDROID`. Desktop: `KEEP YOUR FOUNDATION ONE CLICK AWAY`.
- **Contextual, never forced (L-07).** It appears:
  - in the post-intake review page's COME BACK ANYTIME panel;
  - on the payment-confirmed page as a secondary CTA;
  - in the menu drawer;
  - in the desktop sidebar.

  It is never a blocking modal, never shown on first paint before the client has seen their status, and hidden when already installed (`display-mode: standalone` or `navigator.standalone`).
- **Order of return methods everywhere:** 01 HOME SCREEN › 02 EMAIL.

## Platform behaviour

| Platform | Behaviour | Install button? |
|---|---|---|
| iPhone / iPad Safari | Sheet: 01 TAP SHARE (inline Share glyph), 02 CHOOSE "ADD TO HOME SCREEN", 03 TAP ADD TO CONFIRM. Note: "SITE 00 CAN'T ADD IT FOR YOU — IPHONE ONLY ALLOWS THIS FROM SAFARI'S SHARE MENU." | **No.** iOS has no programmatic install prompt |
| iOS other browsers | Add step 00 "OPEN THIS PAGE IN SAFARI" unless verified otherwise for the client's iOS version (OD-03) | No |
| Android, `beforeinstallprompt` captured | Sheet with ADD TO HOME SCREEN, which calls the stored event's `prompt()`; the browser shows its own confirmation. On `appinstalled`, toast "MY FOUNDATION IS ON YOUR HOME SCREEN" (OL-C14) | **Yes — only here** |
| Android, no prompt | Menu steps: ⋮ → ADD TO HOME SCREEN / INSTALL APP → confirm | No |
| Desktop | Bookmark ⌘D / Ctrl D, name it MY FOUNDATION; "ON YOUR PHONE? OPEN ANY SITE 00 EMAIL, TAP VIEW MY FOUNDATION, THEN SAVE YOUR FOUNDATION" | No |
| Installed | Panel "ON YOUR HOME SCREEN"; save entries hidden | — |

## Manifest (static, identical for every client)

```json
{
  "id": "/foundation/return",
  "name": "SITE 00 · MY FOUNDATION",
  "short_name": "MY FOUNDATION",
  "start_url": "/foundation/return?src=home",
  "scope": "/foundation/",
  "display": "standalone",
  "background_color": "#f3f2ef",
  "theme_color": "#f3f2ef",
  "icons": [
    { "src": "/site00/idnty/foundation/foundation-icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/site00/idnty/foundation/foundation-icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/site00/idnty/foundation/foundation-icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Head tags, **only** on `/foundation/*` pages:

```html
<link rel="manifest" href="/foundation-manifest.webmanifest">
<link rel="apple-touch-icon" href="/site00/idnty/foundation/apple-touch-icon-foundation-180.png">
<meta name="theme-color" content="#f3f2ef">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="MY FOUNDATION">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

## The token-free start route (verified against source)

- Current canonical routes (`src/site00/config/routes.ts`): `/foundation/:token`, plus the literal `/foundation/review`, which is registered before `:token` in `Site00Routes.tsx`.
- `/foundation/return` follows the same literal-before-param pattern. Tokens are 32-character base64url, so the literal cannot collide.
- **Compatible. Retained.**
- iOS saves the **current URL** when a page has no manifest. That is why the token must leave the address bar: after the session exchange, `history.replaceState` to `/foundation/return` (`06`). Then even a manual "Add to Home Screen" stores no token.

## Native splash vs SITE 00 launch

The browser or OS owns the install-launch splash:
- **Android** generates it from `background_color`, the icon and `name`.
- **iOS** shows a blank or startup image while the web app loads.

SITE 00 does **not** promise control of these. The approved launch image is SITE 00's **own** in-app launch experience (`07`).

Optionally, best-effort iOS `apple-touch-startup-image` links may use **cover crops of the approved master** at device sizes, all portrait. A cover crop removes only side margins, so it is not a material change, and it never covers the safe zones (verified in `12`). They are flaky across iOS versions, so they are optional (OD-11).
