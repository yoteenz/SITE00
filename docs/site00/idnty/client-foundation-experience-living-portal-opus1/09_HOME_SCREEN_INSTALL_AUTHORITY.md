# 09 — Home Screen Install Authority (Family F)

Boards: **M08**, AH01–AH04, TP08, TL08, D10.

> **LOCK1:** the CTA is **SAVE YOUR FOUNDATION**, the icon is the founder-approved master (derivatives in LOCK1 `02`), the access card is retired, and the binding contract is [LOCK1 05](../client-foundation-digital-access-authority-lock1/05_HOME_SCREEN_INSTALL_CONTRACT.md). This document stays as design rationale.

Access priority is locked: **home screen › email.** SAVE YOUR FOUNDATION is the primary convenience and is listed first everywhere a way back is offered: the review page, overview, menu, desktop sidebar and status column.

## Platform behaviour

| Platform (detected) | What the client sees | Button? |
|---|---|---|
| iOS / iPadOS Safari | Sheet "SAVE YOUR FOUNDATION · IPHONE": 01 TAP SHARE (inline Share glyph), 02 CHOOSE "ADD TO HOME SCREEN", 03 TAP ADD. Note: "SITE 00 CAN'T ADD IT FOR YOU — IPHONE ONLY ALLOWS THIS FROM THE SHARE MENU." | **No** |
| iOS other browsers | Same steps with "OPEN THIS PAGE IN SAFARI FIRST" as step 00 (verify per iOS version before shipping, OD-03) | No |
| Android, `beforeinstallprompt` fired | Sheet with "ADD TO HOME SCREEN". The button calls the stored event's `prompt()`, then the browser shows its own confirmation | **Yes** — only this case |
| Android, no prompt (Firefox, Samsung or criteria unmet) | Menu steps: open browser menu (⋮) → "ADD TO HOME SCREEN" / "INSTALL APP" → confirm | No |
| Desktop | "KEEP YOUR FOUNDATION ONE CLICK AWAY": bookmark with ⌘D / Ctrl D, name it MY FOUNDATION, and the phone alternatives | No |
| Already installed (`display-mode: standalone` or `navigator.standalone`) | "ON YOUR HOME SCREEN" panel; SAVE entries hidden everywhere | — |

**Never** show an INSTALL button that does not call a real browser API. Never claim the app is "installed" without the browser's own confirmation; listen for the `appinstalled` event.

## Sheet anatomy

- Grab handle (M).
- Title and close.
- Preview row: the 58px icon, "MY FOUNDATION", "SITE00.COM · OPENS YOUR FOUNDATION".
- Numbered steps in red display numerals.
- An optional CTA.
- A platform note.
- On M and TP the sheet docks to the bottom. On TL+ it is a centred 560 dialog.
- On boards, an OS toolbar specimen highlights where Share or ⋮ lives. This is a board annotation, not product UI.

## Start route and secure reentry

- `start_url = /foundation/return?src=home`. It never contains the bearer token.
- With a valid session cookie, `/foundation/return` resolves the session's artifact and renders the portal. The URL bar stays `/foundation/return`.
- Without one, it shows the reentry page "CONFIRM IT'S YOU" (`13`).
- iOS standalone web apps have their own cookie jar. The first launch from the home screen therefore usually needs email confirmation, which is why reentry offers a **6-digit code** in addition to the link: links open in Safari, not in the standalone app.

## Interaction (CF-HOME-SHEET)

| Field | Value |
|---|---|
| Purpose | Get the client a one-tap way back |
| Trigger | SAVE YOUR FOUNDATION in the menu, sidebar, review page or status column |
| Initial state | Sheet closed; platform detected on open |
| Data dependency | UA + `beforeinstallprompt` presence + display-mode |
| Action | Android: `deferredPrompt.prompt()`. Others: none (instructions) |
| Loading | none |
| Success | Android: `appinstalled` → toast "MY FOUNDATION IS ON YOUR HOME SCREEN" |
| Error | Prompt dismissed: sheet stays with the menu steps |
| Disabled | Hidden when standalone |
| Responsive | Bottom sheet (M/TP) · dialog (TL+) |
| Accessibility | `role=dialog`, `aria-modal`, focus trap, Esc closes, focus returns to the trigger |
| Security | No token in the manifest, start_url, icon or shortcut name |
| Owner | Composer (client) + static assets (`10`) |

## Prerequisites (G-13)

- The static manifest at `/foundation-manifest.webmanifest`, linked **only** on `/foundation/*` pages.
- Icons and apple-touch-icon.
- `<meta name="theme-color" content="#f3f2ef">`, `apple-mobile-web-app-title = MY FOUNDATION`, `apple-mobile-web-app-capable`.
- No service worker is required for installability on modern Chromium. One may come later for offline, but it must never cache authenticated payloads.
