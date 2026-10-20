# 10 — Home Screen Icon and Launch

Board: **AH05**, plus M08 and AH02.

## Icon

The icon is built only from existing SITE 00 grammar, so **no new logo** is introduced:
- the display-face numerals "00" ('SITE 00 Display' 900) top left;
- the red-glass bar (gradient `#f0474d → #d3121b → #a80c13`, the `DfCrownObject` palette) rising from the bottom edge on the right;
- the red square period bottom left.

| Asset | Size | Background | Notes |
|---|---|---|---|
| `foundation-icon-192.png` | 192 | `#f3f2ef` | purpose `any` |
| `foundation-icon-512.png` | 512 | `#f3f2ef` | purpose `any` |
| `foundation-icon-maskable-512.png` | 512 | `#f3f2ef` | all marks inside the central 80% safe zone |
| `apple-touch-icon-foundation.png` | 180 | `#f3f2ef` | iOS ignores the manifest icons |
| dark variant | 192/512 | `#0c0c0c` | used for the dark splash only (iOS has no dynamic icon tint) |

Icons are **static and identical for every client**. They never contain a business name, reference, QR or token. Source: the specimen `p=icon` in `boards/src/cf-access.js`, exported to PNG in Composer phase 5.

## Label

`short_name: MY FOUNDATION` (locked). `name: SITE 00 · MY FOUNDATION`. The iOS home-screen label comes from `apple-mobile-web-app-title`.

## Splash and launch

| Platform | Mechanism | Design |
|---|---|---|
| Android | Generated from `background_color` + icon + `name` | `#f3f2ef`, 96px icon, SITE 00 / MY FOUNDATION |
| iOS | `apple-touch-startup-image` per device size (optional), otherwise a white flash | Same composition. Dark variant `#0c0c0c` for `prefers-color-scheme: dark` |

After launch, the start route `/foundation/return?src=home` either restores the session (WELCOME BACK, then the portal) or shows CONFIRM IT'S YOU.

## Manifest (proposed)

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

`scope: /foundation/` includes `/foundation/review`, an internal design page. That is acceptable because it is noindex, but the founder may prefer to move it (OD-04).
