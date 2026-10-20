# 24 — Approved Asset Manifest

| Asset | Source | Status | Used in |
|---|---|---|---|
| `DfCrownObject` (variant OVERVIEW) | `src/site00/foundation-client/objects.tsx` (SVG) | EXISTS: reused unchanged | hero object, email, access card palette |
| `DfCornerFragment` | same | EXISTS | system panels (errors, reentry) TP+ |
| `DfThresholdHero` | same | EXISTS | P01 (unchanged) |
| `DF_ARCHITECTURE_RENDERS` raster slots | same | null today (Grok renders not generated) | will swap in without layout change |
| 150 monoline glyphs | `foundation-client/icons/glyphs.ts` | EXISTS | every icon on every board |
| Fonts | `/site00-correspondence-studio/fndatn-01/fonts/*` via `site00-correspondence-fonts.css` | EXISTS | all |
| App icon 192 / 512 / maskable 512 / apple-touch 180 | **founder-approved master** (LOCK1 `02`), deployable derivatives D1/D2 | LOCKED (master) · derivatives need founder review | home screen |
| Launch image ("YOUR DIGITAL SPACE AWAITS.") | **founder-approved master** (LOCK1 `03`) | LOCKED | SITE 00 launch experience |
| ~~Access card artwork~~ | — | **RETIRED** (LOCK1) | — |
| ~~QR~~ | — | **RETIRED** with the access card | — |
| Web manifest | **new** static JSON | PROPOSED (G-13) | home screen |
| `/site00/favicon.svg` | referenced in `index.html`, **missing** | DEFECT (G-13) | — |

**Not used, by rule:**
- no new logo (the brand mark stays the text "SITE 00");
- no stock photography;
- no environment plates (`cs-env-*.webp` are correspondence-studio assets and not part of the client chamber grammar);
- no AIO or referral card art;
- no unrelated palettes.

No image-generation credits were spent.
