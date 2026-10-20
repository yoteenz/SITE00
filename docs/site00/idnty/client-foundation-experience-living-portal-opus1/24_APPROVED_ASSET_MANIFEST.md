# 24 — Approved Asset Manifest

| Asset | Source | Status | Used in |
|---|---|---|---|
| `DfCrownObject` (variant OVERVIEW) | `src/site00/foundation-client/objects.tsx` (SVG) | EXISTS: reused unchanged | hero object, email, access card palette |
| `DfCornerFragment` | same | EXISTS | system panels (errors, reentry) TP+ |
| `DfThresholdHero` | same | EXISTS | P01 (unchanged) |
| `DF_ARCHITECTURE_RENDERS` raster slots | same | null today (Grok renders not generated) | will swap in without layout change |
| 150 monoline glyphs | `foundation-client/icons/glyphs.ts` | EXISTS | every icon on every board |
| Fonts | `/site00-correspondence-studio/fndatn-01/fonts/*` via `site00-correspondence-fonts.css` | EXISTS | all |
| App icon 192 / 512 / maskable 512 / apple-touch 180 | **new**, composed from the existing display face + glass gradient + period (`10`) | PROPOSED: export in Composer phase 5 | home screen |
| Splash (light / dark) | composed, no new artwork | PROPOSED | iOS startup images (optional) |
| Access card artwork | composed from the same primitives | PROPOSED | `11` |
| QR | generated at runtime (repo dependency `qrcode@^1.5.4`) | EXISTS (dependency) | access card |
| Web manifest | **new** static JSON | PROPOSED (G-13) | home screen |
| `/site00/favicon.svg` | referenced in `index.html`, **missing** | DEFECT (G-13) | — |

**Not used, by rule:**
- no new logo (the brand mark stays the text "SITE 00");
- no stock photography;
- no environment plates (`cs-env-*.webp` are correspondence-studio assets and not part of the client chamber grammar);
- no AIO or referral card art;
- no unrelated palettes.

No image-generation credits were spent.
