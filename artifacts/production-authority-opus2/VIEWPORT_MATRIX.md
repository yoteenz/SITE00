# VIEWPORT — HOST × TARGET MATRIX (OPUS2)

Live browser flow: DESIGN → VIEWPORT, select MOBILE → MOBILE XL → TABLET → DESKTOP on four hosts. The client app iframe is laid out at the exact target logical size (`viewportTargets.ts`) and only then scaled to the stage, so its own breakpoints apply (DESKTOP renders the client's sidebar desktop layout).

Screenshots: `viewport/<host>-<TARGET>.jpg`, `viewport/<host>-DESKTOP-zoom100.jpg` (100% inspection scroll). Raw: `viewport/viewport-matrix.json`.

| HOST | TARGET | FRAME | TARGET W×H | CLIENT innerWidth×innerHeight | ON-STAGE SIZE | ORIENTATION CONTROL | FITS STAGE | PAGE OVERFLOW-X | RESULT |
|---|---|---|---|---|---|---|---|---|---|
| mobile 390×844 | MOBILE | phone | 390×844 | 390×844 | 119×257 | enabled | yes | no | PASS |
| mobile 390×844 | MOBILE XL | phone | 430×932 | 430×932 | 119×257 | enabled | yes | no | PASS |
| mobile 390×844 | TABLET | tablet | 834×1194 | 834×1194 | 169×242 | enabled | yes | no | PASS |
| mobile 390×844 | DESKTOP | desktop | 1440×900 | 1440×900 | 358×224 | locked (landscape) | yes | no | PASS |
| tablet 1024×768 | MOBILE | phone | 390×844 | 390×844 | 130×280 | enabled | yes | no | PASS |
| tablet 1024×768 | MOBILE XL | phone | 430×932 | 430×932 | 129×280 | enabled | yes | no | PASS |
| tablet 1024×768 | TABLET | tablet | 834×1194 | 834×1194 | 196×280 | enabled | yes | no | PASS |
| tablet 1024×768 | DESKTOP | desktop | 1440×900 | 1440×900 | 408×255 | locked (landscape) | yes | no | PASS |
| laptop 1280×720 | MOBILE | phone | 390×844 | 390×844 | 119×259 | enabled | yes | no | PASS |
| laptop 1280×720 | MOBILE XL | phone | 430×932 | 430×932 | 119×259 | enabled | yes | no | PASS |
| laptop 1280×720 | TABLET | tablet | 834×1194 | 834×1194 | 181×259 | enabled | yes | no | PASS |
| laptop 1280×720 | DESKTOP | desktop | 1440×900 | 1440×900 | 372×233 | locked (landscape) | yes | no | PASS |
| desktop 1440×900 | MOBILE | phone | 390×844 | 390×844 | 169×365 | enabled | yes | no | PASS |
| desktop 1440×900 | MOBILE XL | phone | 430×932 | 430×932 | 168×365 | enabled | yes | no | PASS |
| desktop 1440×900 | TABLET | tablet | 834×1194 | 834×1194 | 255×365 | enabled | yes | no | PASS |
| desktop 1440×900 | DESKTOP | desktop | 1440×900 | 1440×900 | 545×341 | locked (landscape) | yes | no | PASS |

| HOST | DESKTOP @100% INSPECTION | STAGE SCROLLS | PAGE OVERFLOW-X | RESULT |
|---|---|---|---|---|
| mobile 390×844 | DESKTOP @100% | True (auto) | False | PASS |
| tablet 1024×768 | DESKTOP @100% | True (auto) | False | PASS |
| laptop 1280×720 | DESKTOP @100% | True (auto) | False | PASS |
| desktop 1440×900 | DESKTOP @100% | True (auto) | False | PASS |

**16/16 host×target PASS, 4/4 100%-inspection PASS.** DESKTOP is a landscape browser frame on every host, never a phone.

Root cause fixed: the old chamber applied the ORIENTATION control (default PORTRAIT) to every preset, so DESKTOP 1440×900 was swapped to 900×1440 and drawn in the phone bezel (see `before-after/01-viewport-desktop-preset.jpg`).
