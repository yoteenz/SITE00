# 08 — Asset Manifest

Repository source of truth: `docs/site00/idnty/client-foundation-digital-access-authority-lock1/assets/`. **Masters are byte-identical copies of the founder attachments.** Derivatives come from `assets/derive-icons.py` (crop + Lanczos resample only).

Deploy paths are where **Composer** copies the files in phases 7–9. This authority sprint does not write to `public/`, so nothing ships in a production bundle from here.

| Asset (under `assets/`) | Size | Role | Canonical deploy path | sha256 |
|---|---|---|---|---|
| `master/SITE00_FOUNDATION_ICON_MASTER.png` | 1254 × 1254 | Approved icon visual master (founder attachment 01). Never deployed directly | `—` | `4dccf2ae9e5bd26220cb426b4e5a0d3ed53b4eeb7e5f22bb33fb66785b2f9b76` |
| `master/SITE00_FOUNDATION_LAUNCH_MASTER.png` | 941 × 1672 | Approved launch image (founder attachment 02). Deployed as is | `public/site00/idnty/foundation/foundation-launch.png` | `f88555656a347835e1f071cb1bd2a19243c833282ab1e242b36bbde84646b249` |
| `derived/foundation-icon-512.png` | 512 × 512 | D1 face crop · manifest any | `public/site00/idnty/foundation/foundation-icon-512.png` | `fc26dddb268b31e2378040e6e26f579e3510a443d92efb0cdf4fe41d98baac60` |
| `derived/foundation-icon-192.png` | 192 × 192 | D1 face crop · manifest any | `public/site00/idnty/foundation/foundation-icon-192.png` | `150323881db019018d7ad96744b4a0c092b9cf9be7cd4aec2b7cb5abd4314148` |
| `derived/apple-touch-icon-foundation-180.png` | 180 × 180 | D1 face crop · apple-touch-icon | `public/site00/idnty/foundation/apple-touch-icon-foundation-180.png` | `8ff5f458507387e470be07da42767750dbf2461dc414252dcfc54f284558dacf` |
| `derived/foundation-icon-maskable-512.png` | 512 × 512 | D2 reflect-padded · manifest maskable | `public/site00/idnty/foundation/foundation-icon-maskable-512.png` | `a02ca77b70102b1395b963065ef736ac48a077e6cab49202f404650fc9bf469b` |
| `derived/foundation-icon-face-crop-724.png` | 724 × 724 | D1 at native crop size (founder review) | `— (review reference only)` | `872dcc9888cc84afb8fc9dbe61c6cd9826dc2794751dee97d1d3fef17bba0ea8` |

## Derivation record

- D1 face-crop box on the master: `(263, 266, 987, 990)` (724 px square).
- Content-to-frame width: master tile 55.3 % → D1 65.5 %.
- D2: reflect padding of blank face texture, 47 px per side → 819 px canvas.
- Output PNGs carry no EXIF or text chunks.

## Launch file

The launch master is deployed **unchanged** as `public/site00/idnty/foundation/foundation-launch.png`.
- An optional WebP/AVIF re-encode for transfer size is acceptable **only** if it is visually lossless (SSIM ≥ 0.99 against the master) and keeps 941 × 1672.
- Composer records the encode settings and hash next to this table.

## Not assets of this product

- Referral card art, referral QR codes and referral card studio files (product B).
- SITE 00 business card files (product C).
- The retired access-card art (archived, `04`).
- The OPUS1 placeholder icon and splash (archived).
