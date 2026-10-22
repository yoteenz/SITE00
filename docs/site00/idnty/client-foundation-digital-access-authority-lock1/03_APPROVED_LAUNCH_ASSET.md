# 03 — Approved Launch Asset

## Received and inspected (Gate A)

| Property | Value |
|---|---|
| Expected attachment name (per sprint) | `E0CFD505-452F-4D76-A812-3AD9EC27C751.jpeg` |
| Name as received | `355e1d31-image.png`. The upload channel renamed it, and it arrived as **PNG** |
| Repository master | `assets/master/SITE00_FOUNDATION_LAUNCH_MASTER.png`, a **byte-identical** copy |
| Dimensions | **941 × 1672** (aspect 0.5628 ≈ 9 : 16), RGB, sRGB chunk, 72 dpi |
| sha256 | `f88555656a347835e1f071cb1bd2a19243c833282ab1e242b36bbde84646b249` |
| Metadata | EXIF holds only resolution, orientation, colour space and dimensions |
| Visual match | **Yes.** Bright white marble architectural interior; daylight; open perspective to a city view with a lone figure; controlled red architectural feature on the right; wordmark "SITE" (black) "00" (red) with the DIGITAL FOUNDATION descriptor at top; central black "00" with red underline; headline "YOUR DIGITAL / SPACE AWAITS." |

## Safe zones (measured on master pixels)

| Zone | Pixels | Fraction of width | Fraction of height |
|---|---|---|---|
| Wordmark + descriptor | x215–731, y155–254 | 22.8 % – 77.7 % | 9.3 % – 15.2 % |
| Central "00" + red underline | x392–551, y1159–1313 | 41.7 % – 58.6 % | 69.3 % – 78.5 % |
| Headline "YOUR DIGITAL SPACE AWAITS." | x222–729, y1386–1493 | 23.6 % – 77.5 % | 82.9 % – 89.3 % |
| **Union (must always be fully visible)** | | **22.8 % – 77.7 %** | **9.3 % – 89.3 %** |

The red architectural feature (x ≈ 619–940 from y ≈ 290) and the figure and doorway (centre) are composition, not text. They may be partially cropped at the sides on phones, as measured in `07`.

## Rules

- Show the approved image **exactly**: no regeneration, no repainting, no replacement world, no added tagline, no overlay text inside the safe zones.
- Never stretch. The aspect ratio is always 941 : 1672.
- The copy is part of the image. The `alt` text repeats it for assistive technology: "SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS."
- Not dark, not moody: the field around the image is `--df-bg` `#f3f2ef`, never black.
- The earlier dark and placeholder splash specimens (OPUS1 AH05) are superseded and archived.

## Resolution limitation (reported, not worked around)

The master is 941 × 1672. On 3× phones the cover crop is drawn at 1.26–1.67× its native pixels (measured in `12`), so it is **slightly soft** on high-density phones. On desktop panels it is at or below 1:1. Founder action: if a higher-resolution original exists (≥ 1290 × 2292), supply it, and it drops into the same path with the same safe-zone fractions. It was **not** upscaled, sharpened or regenerated here.
