# 02 — Approved Icon Asset

## Received and inspected (Gate A)

| Property | Value |
|---|---|
| Expected attachment name (per sprint) | `438D66D4-8B1D-4F29-927C-FC9016B2DA51.jpeg` |
| Name as received in the execution environment | `51d05a9b-image.png`. The upload channel renamed it, and it arrived as **PNG**, not JPEG |
| Repository master | `assets/master/SITE00_FOUNDATION_ICON_MASTER.png`, a **byte-identical** copy |
| Dimensions | **1254 × 1254**, RGB, 8-bit, sRGB chunk, 72 dpi |
| sha256 | `4dccf2ae9e5bd26220cb426b4e5a0d3ed53b4eeb7e5f22bb33fb66785b2f9b76` |
| Metadata | EXIF holds only resolution, orientation, colour space and pixel dimensions. There is no GPS, device or author data |
| Visual match to the sprint description | **Yes.** White rounded-square tile with subtle light material texture; large glossy black "00"; horizontal reflective red bar directly below; centred; no wordmark; no scene |

The renaming is reported, not hidden. The content matches the founder's description and the image visible in the sprint message. Whether this PNG is bit-identical to the founder's original `.jpeg` cannot be verified from here (see `12`).

## Measured composition (master pixels)

| Element | Box |
|---|---|
| Presentation background | light grey gradient, full canvas |
| Rounded tile | ≈ x193–1050, y193–1045; corner radius ≈ 145 px; drop shadow below and right |
| "00" | x390–859, y403–736 |
| Red bar | x388–862, y792–852 |
| Content ("00" + bar) | x388–862, y403–852; centre (625, 627.5), which is the canvas centre (627, 627) within 2 px |

## Visual master vs deployable artwork

The master is a **presentation mockup**: background, drop shadow, rounded tile with bevel. Platforms (iOS home screen, Android launchers) apply their **own** corner mask. Baking the mockup's tile, shadow and background into the icon would show a rounded tile inside a rounded mask, plus a shadow and grey corners. That is the "double-rounded" defect the sprint warns about.

| Derivative | Method | Change from master | Use |
|---|---|---|---|
| **D1 — face crop** | Crop the largest square lying entirely on the tile's flat face, centred on the content: box (263, 266, 987, 990) = 724 px; every corner ≥ 20 px inside the tile's corner arc. Then Lanczos resample | Removes background, shadow, tile edge and bevel. **Content unchanged.** Content-to-frame width ratio **55.3 % → 65.5 %**, so the mark reads ≈ 18 % larger relative to the icon edge | manifest `any` 192/512, `apple-touch-icon` 180 |
| **D2 — maskable** | D1 plus **reflect padding** of 47 px of blank face texture per side (to 819 px), so the content's half-diagonal (326 px) sits inside the 40 % safe circle. Then resample to 512 | Same as D1, plus mirrored blank texture at the edges. The nearest content is 125 px from the crop edge, so only empty face texture is mirrored; content-to-frame ≈ 58 % | manifest `maskable` 512 |

**Neither derivative is identical to the master. Both are materially altered in framing and need founder review (FR-01, FR-02 in `11`).** No pixel of the "00" or the red bar was repainted, recoloured, moved or regenerated. There is no flat vector recreation, no dark default icon, and nothing added (no SITE 00 text, client name, status, badge, symbol or colour).

Reproduce: `python3 -I assets/derive-icons.py assets`. Hashes are in `assets/derived/derivation.json` and `08`.

## Export specification

| File (canonical deploy path, Composer phase 7) | Size | Purpose | From |
|---|---|---|---|
| `public/site00/idnty/foundation/foundation-icon-192.png` | 192 × 192 | manifest `any` (Chrome install minimum) | D1 |
| `public/site00/idnty/foundation/foundation-icon-512.png` | 512 × 512 | manifest `any` (splash + store-quality) | D1 |
| `public/site00/idnty/foundation/foundation-icon-maskable-512.png` | 512 × 512 | manifest `maskable` (Android adaptive) | D2 |
| `public/site00/idnty/foundation/apple-touch-icon-foundation-180.png` | 180 × 180 | `<link rel="apple-touch-icon">` (iPhone home screen; iPad scales it) | D1 |

- All four are opaque RGB PNGs with no alpha. iOS fills transparency with black, so transparency must not be used.
- Metadata is stripped: PIL writes no EXIF or text chunks.
- The four files are **static and identical for every client**. They never carry a token, name or status.
- No notification badge is baked in. Any badge is the OS's own (and push is not offered).
- Additional sizes are not required by the PWA manifest contract. Optional favicons (32/48) may be derived from D1 later if the founder wants the "00" in browser tabs on `/foundation/*`; out of scope here.
