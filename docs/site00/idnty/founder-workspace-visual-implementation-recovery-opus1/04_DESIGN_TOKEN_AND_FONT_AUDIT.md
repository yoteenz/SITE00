# 04 · Design token and font audit

## Fonts
| Check | Before (b446db3f) | After (ba4012d59) |
| --- | --- | --- |
| Font files | `public/site00-correspondence-studio/fndatn-01/fonts/*` (existing) | Same |
| @font-face | `src/site00/styles/site00-correspondence-fonts.css`, imported by the shell | Same import, kept |
| Faces actually used | Display 900 for the title only. Controls fell back to browser `<button>` defaults (Saira **400 16 px**, colour from the UA) | Display 900 (titles, numerals); Saira 500 / 600 / 700 in labels, buttons and meta; measured loaded faces: Display 600 + 900, Saira 400–700 |
| Conclusion | **Not a loading failure.** The faces were mounted but the generic controls never requested the approved weights and sizes | Approved mapping in use |

## Type scale (OPUS2 tokens, measured in the live DOM)
| Viewport | Title (`--ws-fs-title`) | Buttons |
| --- | --- | --- |
| 320 | 42.6 px (clamp 13.3vw) | 11 px / 600 |
| 375–430 | 50 px | 11 px / 600 |
| 834 | 48 px | 11 px / 600 |
| 1194 × 834 (short) | 44 px | 11 px / 600 |
| 1440 | 52 px | 12 px / 600 |
| ≥ 1920 | 60 px | 12 px / 600 |

## Colour
| Token | Value |
| --- | --- |
| page / surface / chamber | #fbfaf8 / #ffffff / #f3f2ef |
| ink / ink-2 / muted / faint | #0c0c0c / #2f2f2e / #6f6d68 / #8f8d88 |
| hair / rule / rule-strong | #eeede9 / #dcdad5 / #c9c7c2 |
| red / red-ink / red-tint | #ce1017 / #b30f17 / #fff5f5 |
| ok / warn | #2e7a4b / #a65208 |

## Bright blue controls — root cause
`idnty-founder-workspace.css` styled shell buttons with `font: inherit` and borders but **no `color`**, and the workspace had no anchor reset. iOS Safari paints `<button>` text with the system tint (blue), and `<a href>` is blue and underlined everywhere. The founder's screenshots show exactly this.

**Fix (component layer, not a global override):**
- `:where(.ws) button { color: inherit; … }`, which is the authority's own reset;
- plus `:where(.ws) a { color: inherit; text-decoration: none; }`, needed because the specimens used href-less anchors.

Zero-specificity `:where()` keeps every component colour in charge. **Measured blue controls after the fix: 0** at every viewport.

## Scoping
- Authority tokens moved from `:root` to `.ws`, so they never leak into the rest of SITE 00.
- The specimen `html, body` rule was removed.
- The generic `.ws svg` stroke rule was narrowed to `svg.ws-ic`, so page SVGs keep their own paint.
