# OPUS — VISUAL FORENSIC MAP
**Sprint:** `P0.SITE00.PUBLIC-REDESIGN.OPUS-CONVERGENCE1` · authority pack `SITE00_Public_Redesign_Authority_Pack_SONNET_LITE_v1` (37 active / 3 superseded excluded) · Sonnet HEAD `a86c8cd`.
## Method

- **Authority** numbers were read off each approved image at **390 CSS px wide** (941×1672 and 1080×1920 → 390×693; 850×1850 → 390×849) with a 10-px grid overlay.
- **SONNET** numbers were measured by `scripts/site00-public-redesign-geometry.mjs` against a worktree of `a86c8cd`, running on its own Vite server.
- **OPUS** numbers were measured by the same script against this branch.
- All numbers are page px at the authority frame (`x y w×h`; `y` = top edge).
- **Fonts:** Sonnet's proof captures rendered in a fallback monospace, because sandboxed Chromium could not reach Google Fonts. Every Opus measurement and capture uses the real production Martian Mono, served from a local cache (`scripts/site00-cache-proof-fonts.sh`, `scripts/lib/site00-proof-fonts.mjs`). The Sonnet "before" captures in `opus-proof/` were re-taken with that font.
- **Categories:**
  - A shell
  - B typography
  - C page geometry
  - D machine geometry
  - E panel geometry
  - F navigation
  - G spacing
  - H linework
  - I input/control presentation
  - J asset placeholders
  - K responsive behaviour
  - L material/lighting approximation

## Shared geometry — global findings (fixed once, cascades to every screen)

| # | Finding | Authority | Sonnet | Correction (Opus) |
|---|---|---|---|---|
| A1 | Viewport frame | Edge-to-edge plate / nav | Browser default `body { margin: 8px }` framed every page (all x positions +8, nav inset) | `body:has(.s00pr-shell) { margin: 0 }` (scoped) |
| A2 | Laptop "Mobile" preview artboard | Content starts under the header | Sticky plate used `margin-bottom: -100%` (resolves against **width**) → content pushed ≈420px down | Plate + content share one grid cell; plate sticky at artboard height |
| A3 | Header focus | No focus ring on load | `FastTravelPanel` focused the scan trigger on **every mount** → red focus box in the header, SR focus moved | Focus returns to the trigger only after the panel closes |
| B1 | Typeface width | Host semi-condensed Martian Mono | `.s00pr` forced `font-stretch: normal` (+7.7% glyph advance); buttons fell back to 100% | `font-stretch: var(--site00-font-stretch-default)`, inherited by buttons/fields |
| B2 | Type scale | Hero title ≈22px, question 9px, body 6px, panel title 8.2px, labels 5–6px | rem scale ≈1.3–1.4× (title 29.6px, question 12.8px, body 8px) | Authority-px unit system `calc(N * var(--u))`; every size re-measured |
| B3 | State numerals | Plain heavy zeros (00 01 02 03) | Martian Mono slashed zero | Live-SVG `StateNumeral` (also header / footer / ghost 00 marks) |
| C1 | Vertical rhythm | Whole IDNTY screen fits one 693 frame; panel ≈y362 | Panel ≈y428; CTA below the fold | Hero/stage/rail/panel registered per family (§ families below) |
| C2 | Tall phones (390×844) | 850-family: rail y410, panel y450, panel ≈1.26× | Same geometry as short frames, with empty space above the nav | `min-height:780px` branch: `--khv 1.24`, panel/rail/nav local unit ×1.16/×1.3/×1.22 |
| D1 | Machine placement | Machine sits **behind** the hero copy, axis x≈195–210, y≈30→300 | Machine stacked under the hero (negative margin), 15% small, overlapping copy | Stage = authority coordinate box (`viewBox 0 28 390 300`) behind the hero |
| E1 | Panel head | 55px head, code ≈31 tall, title 8.2px, divider inset 13px | 70–85px head, code 49.6px font | Rebuilt head grid; inset divider; family-specific third line |
| F1 | Bottom nav | 60px, 18px icons, ≈6px labels | 64px, 24–26px icons, 9px labels | 60u, 19u icons, 5.9u labels; tall ×1.22 |
| G1 | Gutters | Panel x18→372, hero copy x30 | Panel x22→368 (+8 body margin), copy x22 | `--u` gutters 18/30 |
| H1 | Hairlines | 0.5–0.8px technical rules, red signal 0.8px | 0.8–1px, denser beads | Machines redrawn with 0.45–0.8 strokes |
| I1 | Controls | Thin cells, radius 4, check Ø10, pills 24–25 tall | Rounded app cards, check Ø15, 42–46px buttons | Re-dimensioned to authority px |
| I2 | Touch zoom guard | (authority text ≈7px) | 16px textarea text (huge in the frame) | Real 16px font-size kept, drawn at 7.3px via `transform: scale()` |
| J1 | Asset slots | Plates/art occupy authority regions | Slots present, many at wrong size (stacked machine, 86px card art) | Slot boxes re-registered (see `OPUS-ASSET-SLOT-MANIFEST.json`) |
| L1 | Materials | Luminous white atrium, glossy red beads | Flat gradient plate, flat red circles | Plate placeholder carries the light structure (ceiling halo, floor band); beads/orb/star use radial/linear gradients; glass panels 0.8–0.84 white + 16px blur |

## Family registers (authority)

### `idnty-1080-foundation` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | y66→100 · DIAGNOSTIC 141px wide (≈22px, wt 800) |
| Rail | centre y331 · pitch 57 · active Ø20 / idle Ø16 |
| Panel / cards | x18→372 · y362→625 |
| Machine | axis x195 y30→292 · orb Ø38 centre y199 · egg 148×238 |
| Code | "00" 52×29 plain zeros |
| Question / title | 12px one line |
| Options / body | 5×2 tiles 62×51, gap 5 |
| Actions | y585→609 · BACK 68×24 · CONTINUE 120×25 |
| Nav / footer | y633→693 (60) · icons 18 · labels ≈6px |

### `idnty-1080-refine` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | y66→100 |
| Rail | centre y306 |
| Panel / cards | x16→374 · y340→624 |
| Machine | hex lattice x153→247 y118→252 · offset beaded line x162 · axis x200 |
| Code | "01" |
| Question / title | 10.9–12px one line (shrinks with length) |
| Options / body | assets 5×2 tiles · condition 3 cards 105×113 · gaps 3×2 cells 107×40 |
| Actions | y≈606 |
| Nav / footer | y633 |

### `idnty-1080-evolution` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | y66→100 |
| Rail | centre y340 |
| Panel / cards | x16→374 · y373→632 |
| Machine | waveform centre (195,224) · 5 nested ellipses ry 36→87 · lobes ±95 |
| Code | "02" |
| Question / title | 13px one line |
| Options / body | areas 3 cards 105×86 · timeline 2×3 rows 24 tall |
| Actions | y≈617 |
| Nav / footer | y633 |

### `idnty-1080-build` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | y66→100 |
| Rail | centre y321 |
| Panel / cards | x16→374 · y352→632 |
| Machine | four-point star 70×70 centre (195,185) · ring r67 · 5 domain nodes (verification flow only) |
| Code | "03" |
| Question / title | 10–12px one line |
| Options / body | 5 domain rows ≈26 tall · evidence rows ≈30 · review 5 tiles 62×94 |
| Actions | y≈606 |
| Nav / footer | y633 |

### `idnty-941-detail` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | y68→112 · DIAGNOSTIC 152px (≈8% larger than the 1080 family) |
| Rail | centre y356 |
| Panel / cards | x22→368 · y388→627 |
| Machine | orb centre (210,212) |
| Code | "00" 57×36 |
| Question / title | — |
| Options / body | WHAT THIS MEANS 6.8px · facts row · CTA 318×28 |
| Actions | CTA y587→615 |
| Nav / footer | y637 |

### `idnty-941-overview` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | y68→112 |
| Rail | centre y356 |
| Panel / cards | — (4 state cards y390→578, 86 wide) |
| Machine | orb centre (212,195) · tilted orbit 164×44 · capsule frame |
| Code | card codes 13px light grey |
| Question / title | — |
| Options / body | 4-up cards · CTA pills 20 tall |
| Actions | INVESTMENT row y600 |
| Nav / footer | y633 |

### `idnty-850-detail` — frame 390×849 (850×1850)
| Landmark | Authority |
|---|---|
| Hero / title | y85→125 · DIAGNOSTIC 148px |
| Rail | centre y410 · pitch 80 · Ø24/Ø20 |
| Panel / cards | x19→371 · y450→752 |
| Machine | centre y≈262–270, ≈1.3× the 1080 machine |
| Code | "01" 64×37 |
| Question / title | — |
| Options / body | detail body ≈7.6px |
| Actions | CTA 663×38 y703→741 |
| Nav / footer | y765→849 (84) |

### `bldr-center` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | BUILDER y72→88 (≈20px) · COMMAND CENTER y93→110 (≈18px) |
| Rail | — |
| Panel / cards | CHOOSE row y356 · 4 cards x18→374, y370→570 (86×200) · NOT SURE bar y580→628 |
| Machine | tower x140→305 y55→300, axis x210, 4 flanking path panels |
| Code | card codes 9.5px |
| Question / title | — |
| Options / body | card art y390→450 · title 14px (EXTENSIONS fitted) · CTA pill 16 tall |
| Actions | NOT SURE CTA 118×20 |
| Nav / footer | y633 |

### `evolve-center` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | EVOLVE / y58 · INTERVENTION CENTER y72→110 |
| Rail | — |
| Panel / cards | CHOOSE row y356 · 3 cards y370→570 · NOT SURE bar y580→628 |
| Machine | property x160→300 y50→300 · layer labels x127 y125/185/245 |
| Code | card codes 9.5px |
| Question / title | — |
| Options / body | 3 cards 115×200 |
| Actions | NOT SURE CTA |
| Nav / footer | y633 |

### `bldr-path` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | SITE 00 y52 · BUILDER y61→75 (≈17px) |
| Rail | — |
| Panel / cards | glass x15→375 · y252→670 · r≈11 |
| Machine | panel art x205→305 y270→350 |
| Code | "02" 11px + red tick |
| Question / title | title ≈35px (EXTENSIONS ≈31) · tagline 9–10px red |
| Options / body | OVERVIEW 8.6px · body 6.6px · 4 WHAT WE BUILD cols · 5 framework cols (glyph 50) |
| Actions | footer y627→659 · BACK Ø32 · CTA pill 207×30 + red disc |
| Nav / footer | — (no bottom nav) |

### `evolve-path` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | SITE 00 · EVOLVE |
| Rail | — |
| Panel / cards | glass x15→375 · y318→665 |
| Machine | panel art x255→360 y345→445 |
| Code | "03.01" 11px |
| Question / title | title ≈33px · tagline 9.5px |
| Options / body | INCLUDES / IDEAL FOR / DELIVERABLES · TIMELINE / INVESTMENT facts |
| Actions | footer y640→672 · solid red CTA 199×34 |
| Nav / footer | — |

### `origin-main` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | WELCOME TO y52 · SITE 00 serif y66→88 (147 wide) · tagline y110 |
| Rail | — |
| Panel / cards | 3 cards x20→371, y457→573 (110×116) |
| Machine | double-zero landmark plate (Grok) |
| Code | card numbers 7.5px + red tick |
| Question / title | — |
| Options / body | margin notes y125→180 |
| Actions | SWIPE UP connector y585→600, label y633 |
| Nav / footer | footer 00 · rule · links y662→677 |

### `origin-expanded` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | corner hero y60→102 · left list y118→160 |
| Rail | — |
| Panel / cards | glass x12→378 · y220→657 |
| Machine | panel art x200→310 y230→345 (Grok) |
| Code | "01" 7.5px + tick |
| Question / title | title ≈26px · tagline 9px red |
| Options / body | OVERVIEW · WHAT WE DEFINE/BUILD 5/4 cols · FRAMEWORK 5 (EVOLVE: 3 path vignettes) |
| Actions | footer y618→650 |
| Nav / footer | footer 00 y672 |

### `locations` — frame 390×693 (941×1672 / 1080×1920)
| Landmark | Authority |
|---|---|
| Hero / title | SITE 00 ◆ y46 · LOCATIONS y66→96 (≈30px) |
| Rail | spine x40 with red nodes |
| Panel / cards | rows x57→353 · 63 tall · 71 pitch · y128→622 |
| Machine | arch plate (Grok) · row thumbnails right half (Grok) |
| Code | row index 5px |
| Question / title | — |
| Options / body | title 8.6px · desc 4.6px · arrow Ø18 |
| Actions | ghost 00 y625→645 · CONTINUE EXPLORING y676 |
| Nav / footer | — (directory) |

## Per-authority forensic record

### 1. `01_ORIGIN_MAIN` — `/`

Proof: `opus-proof/01_ORIGIN_MAIN/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y25 x22 35×26 | y13 x16 24×15 |
| Hero title | y88 x22 346×46 | y58 x18 354×28 |
| Card row | y380 x22 346×168 | y464 x16 358×116 |
| First card | y380 x22 109×168 | y464 x16 112×116 |
| Document height | 710 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y25 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: WELCOME TO y52 · SITE 00 serif y66→88 (147 wide) · tagline y110; question —. Sonnet hero title 46.4px (y88 x22 346×46). Opus 28.0px (y58 x18 354×28).
- **C. Page geometry** — Authority: 3 cards x20→371, y457→573 (110×116). Sonnet panel/cards y380 x22 346×168, doc height 710. Opus y464 x16 358×116, doc height 693.
- **D. Machine geometry** — Authority: double-zero landmark plate (Grok). Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code card numbers 7.5px + red tick. Sonnet code —; Opus —.
- **F. Navigation** — Authority nav footer 00 · rule · links y662→677. Sonnet —; Opus —.
- **G. Spacing** — Authority actions SWIPE UP connector y585→600, label y633. Sonnet —; Opus —.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: margin notes y125→180. Sonnet first option y380 x22 109×168; Opus y464 x16 112×116.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.ORIGIN.COLLAPSED`, `CARD.ORIGIN.IDNTY`, `CARD.ORIGIN.BLDR`, `CARD.ORIGIN.EVOLVE`.
- **K. Responsive** — No overflow at 360/390/430; whole page fits 390×693 (doc height 693).
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Header rebuilt at authority scale (00 mark 15px SVG, links 4.8px, SIGN IN pill 14px). Hero: serif SITE 00 46px → 28px; WELCOME/tagline tracking per authority. Margin notes moved from y≈210 to y≈124 at x 20 / right 20. Cards 109×168 → 112×116, landing at y≈464 (authority 457); arrow discs 38 → 22px. Swipe connector/label and footer re-spaced to authority rhythm; footer 00 mark as plain-zero SVG.

### 2. `02_ORIGIN_IDNTY_EXPANDED` — `/ (EXPAND IDNTY)`

Proof: `opus-proof/02_ORIGIN_IDNTY_EXPANDED/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y25 x22 35×26 | y13 x16 24×15 |
| Hero title | y80 x22 150×27 | y58 x28 120×18 |
| Working panel | y203 x22 346×567 | y217 x12 366×403 |
| Panel code | y230 x39 188×22 | y246 x35 182×8 |
| Actions / CTA | y710 x39 312×46 | y578 x35 326×31 |
| Document height | 834 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y25 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: corner hero y60→102 · left list y118→160; question title ≈26px · tagline 9px red. Sonnet hero title 27.2px (y80 x22 150×27). Opus 18.0px (y58 x28 120×18).
- **C. Page geometry** — Authority: glass x12→378 · y220→657. Sonnet panel/cards y203 x22 346×567, doc height 834. Opus y217 x12 366×403, doc height 693.
- **D. Machine geometry** — Authority: panel art x200→310 y230→345 (Grok). Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "01" 7.5px + tick. Sonnet code y230 x39 188×22; Opus y246 x35 182×8.
- **F. Navigation** — Authority nav footer 00 y672. Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y618→650. Sonnet y710 x39 312×46; Opus y578 x35 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW · WHAT WE DEFINE/BUILD 5/4 cols · FRAMEWORK 5 (EVOLVE: 3 path vignettes). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.IDENTITY`.
- **K. Responsive** — Panel fits 390×693 with footer 00 below; no overflow.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Corner hero scaled to authority (SITE 00 18px) and the left margin list kept under it (authority shows it). Glass panel x12→378 @ y≈218 (authority 220), radius 12; title 36.8 → 26px; tagline 13 → 8.4px. Right margin note now rendered inside the panel head under CLOSE (Sonnet hid it). OVERVIEW / WHAT WE DEFINE / FRAMEWORK type 5.6/4.9/4.4px; footer circle 31px + pill 30px.

### 3. `03_ORIGIN_BLDR_EXPANDED` — `/ (EXPAND BLDR)`

Proof: `opus-proof/03_ORIGIN_BLDR_EXPANDED/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y25 x22 35×26 | y13 x16 24×15 |
| Hero title | y80 x22 150×27 | y58 x28 120×18 |
| Working panel | y203 x22 346×715 | y217 x12 366×461 |
| Panel code | y230 x39 188×22 | y246 x35 182×8 |
| Actions / CTA | y858 x39 312×46 | y636 x35 326×31 |
| Document height | 982 | 709 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y25 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: corner hero y60→102 · left list y118→160; question title ≈26px · tagline 9px red. Sonnet hero title 27.2px (y80 x22 150×27). Opus 18.0px (y58 x28 120×18).
- **C. Page geometry** — Authority: glass x12→378 · y220→657. Sonnet panel/cards y203 x22 346×715, doc height 982. Opus y217 x12 366×461, doc height 709.
- **D. Machine geometry** — Authority: panel art x200→310 y230→345 (Grok). Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "01" 7.5px + tick. Sonnet code y230 x39 188×22; Opus y246 x35 182×8.
- **F. Navigation** — Authority nav footer 00 y672. Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y618→650. Sonnet y858 x39 312×46; Opus y636 x35 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW · WHAT WE DEFINE/BUILD 5/4 cols · FRAMEWORK 5 (EVOLVE: 3 path vignettes). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.BLDR`.
- **K. Responsive** — No overflow.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Same glass-panel geometry as IDENTITY; WHAT WE BUILD 4 columns at 4.9px with 01–04 heads.

### 4. `04_ORIGIN_EVOLVE_EXPANDED` — `/ (EXPAND EVOLVE)`

Proof: `opus-proof/04_ORIGIN_EVOLVE_EXPANDED/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y25 x22 35×26 | y13 x16 24×15 |
| Hero title | y80 x22 150×27 | y58 x28 120×18 |
| Working panel | y203 x22 346×570 | y217 x12 366×405 |
| Panel code | y230 x39 188×22 | y246 x35 182×8 |
| Actions / CTA | y694 x39 312×46 | y569 x35 326×31 |
| Document height | 836 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y25 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: corner hero y60→102 · left list y118→160; question title ≈26px · tagline 9px red. Sonnet hero title 27.2px (y80 x22 150×27). Opus 18.0px (y58 x28 120×18).
- **C. Page geometry** — Authority: glass x12→378 · y220→657. Sonnet panel/cards y203 x22 346×570, doc height 836. Opus y217 x12 366×405, doc height 693.
- **D. Machine geometry** — Authority: panel art x200→310 y230→345 (Grok). Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "01" 7.5px + tick. Sonnet code y230 x39 188×22; Opus y246 x35 182×8.
- **F. Navigation** — Authority nav footer 00 y672. Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y618→650. Sonnet y694 x39 312×46; Opus y569 x35 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW · WHAT WE DEFINE/BUILD 5/4 cols · FRAMEWORK 5 (EVOLVE: 3 path vignettes). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.EVOLVE`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM`.
- **K. Responsive** — No overflow.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Same panel geometry; CHOOSE YOUR PATH 3 columns; HOW IT WORKS link kept small under the footer.

### 5. `01_IDNTY_DIAGNOSTIC_OVERVIEW` — `/idnty/state`

Proof: `opus-proof/01_IDNTY_DIAGNOSTIC_OVERVIEW/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y30 x0 390×320 |
| 00–03 rail | y372 x30 330×28 | y346 x81 228×20 |
| Card row | y428 x22 346×501 | y393 x16 358×201 |
| First card | y428 x22 169×246 | y393 x16 87×201 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1069 | 705 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y68→112; question —. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42).
- **C. Page geometry** — Authority: — (4 state cards y390→578, 86 wide). Sonnet panel/cards y428 x22 346×501, doc height 1069. Opus y393 x16 358×201, doc height 705. Rail centre: Sonnet y386 → Opus y356 (authority centre y356).
- **D. Machine geometry** — Authority: orb centre (212,195) · tilted orbit 164×44 · capsule frame. Sonnet machine box y130 x22 346×240. Opus y30 x0 390×320.
- **E. Panel geometry** — Authority code card codes 13px light grey. Sonnet code —; Opus —.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions INVESTMENT row y600. Sonnet —; Opus —.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 4-up cards · CTA pills 20 tall. Sonnet first option y428 x22 169×246; Opus y393 x16 87×201.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — 4-up row holds at 360 (cards 80px) with no clipping.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. State cards: 2×2 (cards cut by the nav) → ONE row of four 86×188 cards like the authority; codes as light plain-zero numerals; CTA pills 18px with outlined/filled arrow discs. Overview machine: orb + tilted orbit + capsule frame at (207,195). IDENTITY INVESTMENT row at y≈610 (authority 600).

### 6. `02_IDNTY_STATE_00_FOUNDATION` — `/idnty/starting-at-zero`

Proof: `opus-proof/02_IDNTY_STATE_00_FOUNDATION/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×376 | y363 x18 354×254 |
| Panel code | y452 x39 65×41 | y376 x33 50×31 |
| Actions / CTA | y744 x39 312×46 | y574 x33 324×28 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 888 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y68→112 · DIAGNOSTIC 152px (≈8% larger than the 1080 family); question —. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42).
- **C. Page geometry** — Authority: x22→368 · y388→627. Sonnet panel/cards y428 x22 346×376, doc height 888. Opus y363 x18 354×254, doc height 693. Rail centre: Sonnet y386 → Opus y331 (authority centre y356).
- **D. Machine geometry** — Authority: orb centre (210,212). Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "00" 57×36. Sonnet code y452 x39 65×41; Opus y376 x33 50×31.
- **F. Navigation** — Authority nav y637. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions CTA y587→615. Sonnet y744 x39 312×46; Opus y574 x33 324×28.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: WHAT THIS MEANS 6.8px · facts row · CTA 318×28. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits 390×693 completely (nav clear).
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). Detail body: WHAT THIS MEANS 6.6px, facts row, CTA 28px pill.

### 7. `03_IDNTY_STATE_01_REFINE` — `/idnty/some-pieces-exist`

Proof: `opus-proof/03_IDNTY_STATE_01_REFINE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y22 x30 59×10 |
| Hero title | y86 x22 200×57 | y76 x30 150×42 |
| Machine box | y130 x22 346×232 | y72 x-47 484×372 |
| 00–03 rail | y364 x30 330×28 | y394 x47 296×26 |
| Working panel | y420 x22 346×376 | y448 x18 354×297 |
| Panel code | y444 x39 65×41 | y465 x35 58×36 |
| Actions / CTA | y733 x39 312×46 | y695 x35 320×32 |
| Bottom nav | y785 x0 390×64 | y789 x0 390×60 |
| Document height | 880 | 849 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y22 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y85→125 · DIAGNOSTIC 148px; question —. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y76 x30 150×42).
- **C. Page geometry** — Authority: x19→371 · y450→752. Sonnet panel/cards y420 x22 346×376, doc height 880. Opus y448 x18 354×297, doc height 849. Rail centre: Sonnet y378 → Opus y407 (authority centre y410 · pitch 80 · Ø24/Ø20).
- **D. Machine geometry** — Authority: centre y≈262–270, ≈1.3× the 1080 machine. Sonnet machine box y130 x22 346×232. Opus y72 x-47 484×372.
- **E. Panel geometry** — Authority code "01" 64×37. Sonnet code y444 x39 65×41; Opus y465 x35 58×36.
- **F. Navigation** — Authority nav y765→849 (84). Sonnet y785 x0 390×64; Opus y789 x0 390×60.
- **G. Spacing** — Authority actions CTA 663×38 y703→741. Sonnet y733 x39 312×46; Opus y695 x35 320×32.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: detail body ≈7.6px. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — At 390×844 the panel + CTA sit above the nav exactly as the 850×1850 authority.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). Tall-phone (≥780px) branch reproduces the 850 family: rail at y≈410, panel at ≈447, panel ×1.16, rail pitch ×1.3, nav ×1.22, machine centred ≈268.

### 8. `04_IDNTY_STATE_02_EVOLUTION` — `/idnty/ready-for-evolution`

Proof: `opus-proof/04_IDNTY_STATE_02_EVOLUTION/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y22 x30 59×10 |
| Hero title | y86 x22 200×57 | y76 x30 150×42 |
| Machine box | y130 x22 346×240 | y25 x-47 484×372 |
| 00–03 rail | y372 x30 330×28 | y394 x47 296×26 |
| Working panel | y428 x22 346×376 | y448 x18 354×298 |
| Panel code | y452 x39 65×41 | y465 x35 58×36 |
| Actions / CTA | y744 x39 312×46 | y696 x35 320×32 |
| Bottom nav | y785 x0 390×64 | y789 x0 390×60 |
| Document height | 888 | 849 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y22 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y85→125 · DIAGNOSTIC 148px; question —. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y76 x30 150×42).
- **C. Page geometry** — Authority: x19→371 · y450→752. Sonnet panel/cards y428 x22 346×376, doc height 888. Opus y448 x18 354×298, doc height 849. Rail centre: Sonnet y386 → Opus y407 (authority centre y410 · pitch 80 · Ø24/Ø20).
- **D. Machine geometry** — Authority: centre y≈262–270, ≈1.3× the 1080 machine. Sonnet machine box y130 x22 346×240. Opus y25 x-47 484×372.
- **E. Panel geometry** — Authority code "01" 64×37. Sonnet code y452 x39 65×41; Opus y465 x35 58×36.
- **F. Navigation** — Authority nav y765→849 (84). Sonnet y785 x0 390×64; Opus y789 x0 390×60.
- **G. Spacing** — Authority actions CTA 663×38 y703→741. Sonnet y744 x39 312×46; Opus y696 x35 320×32.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: detail body ≈7.6px. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Tall branch; no overflow.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). Waveform registered lower in the tall family (centre ≈268). Head title READY FOR / EVOLUTION wraps at the authority width (≈100px column).

### 9. `05_IDNTY_STATE_03_BUILD_READY` — `/idnty/build-ready`

Proof: `opus-proof/05_IDNTY_STATE_03_BUILD_READY/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y22 x30 59×10 |
| Hero title | y86 x22 200×57 | y76 x30 150×42 |
| Machine box | y130 x22 346×232 | y67 x-47 484×372 |
| 00–03 rail | y364 x30 330×28 | y394 x47 296×26 |
| Working panel | y420 x22 346×410 | y448 x18 354×310 |
| Panel code | y444 x39 65×41 | y465 x35 58×36 |
| Actions / CTA | y768 x39 312×46 | y708 x35 320×32 |
| Bottom nav | y785 x0 390×64 | y789 x0 390×60 |
| Document height | 914 | 849 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y22 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y85→125 · DIAGNOSTIC 148px; question —. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y76 x30 150×42).
- **C. Page geometry** — Authority: x19→371 · y450→752. Sonnet panel/cards y420 x22 346×410, doc height 914. Opus y448 x18 354×310, doc height 849. Rail centre: Sonnet y378 → Opus y407 (authority centre y410 · pitch 80 · Ø24/Ø20).
- **D. Machine geometry** — Authority: centre y≈262–270, ≈1.3× the 1080 machine. Sonnet machine box y130 x22 346×232. Opus y67 x-47 484×372.
- **E. Panel geometry** — Authority code "01" 64×37. Sonnet code y444 x39 65×41; Opus y465 x35 58×36.
- **F. Navigation** — Authority nav y765→849 (84). Sonnet y785 x0 390×64; Opus y789 x0 390×60.
- **G. Spacing** — Authority actions CTA 663×38 y703→741. Sonnet y768 x39 312×46; Opus y708 x35 320×32.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: detail body ≈7.6px. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Tall branch; no overflow.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). Detail machine = star with concentric rings and crosshair beads (domain nodes appear only in the verification flow, as drawn). "NO IDNTY PURCHASE REQUIRED" set as a two-line statement (8.6px) instead of a 3-line price.

### 10. `01_FOUNDATION_PRIMARY_GOAL` — `/idnty/starting-at-zero/goal`

Proof: `opus-proof/01_FOUNDATION_PRIMARY_GOAL/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×446 | y363 x18 354×264 |
| Panel code | y459 x39 65×41 | y376 x33 50×31 |
| Question title | y561 x39 312×18 | y430 x33 324×14 |
| First option / row | y608 x39 58×84 | y465 x33 61×51 |
| Actions / CTA | y807 x23 344×67 | y574 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 959 | 697 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100 · DIAGNOSTIC 141px wide (≈22px, wt 800); question 12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x18→372 · y362→625. Sonnet panel/cards y428 x22 346×446, doc height 959. Opus y363 x18 354×264, doc height 697. Rail centre: Sonnet y386 → Opus y331 (authority centre y331 · pitch 57 · active Ø20 / idle Ø16).
- **D. Machine geometry** — Authority: axis x195 y30→292 · orb Ø38 centre y199 · egg 148×238. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "00" 52×29 plain zeros. Sonnet code y459 x39 65×41; Opus y376 x33 50×31.
- **F. Navigation** — Authority nav y633→693 (60) · icons 18 · labels ≈6px. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y585→609 · BACK 68×24 · CONTINUE 120×25. Sonnet y807 x23 344×67; Opus y574 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5×2 tiles 62×51, gap 5. Sonnet first option y608 x39 58×84; Opus y465 x33 61×51.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Whole working surface incl. CONTINUE above the nav at 390×693 (Sonnet: below the fold).
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). Head third line = QUESTION 01 (OF 04 visually hidden for AT); Sonnet's second QUESTION 01 OF 04 + segment row removed (authority has none for FOUNDATION). Question title 15.7 → 11.8px one line; tiles 58×84 → 61×51, 17px icons, 5.2px labels (two lines max). Footer: BACK 68×24 · ✓ SAVED · CONTINUE 120×25 pinned right.

### 11. `02_FOUNDATION_AUDIENCE` — `/idnty/starting-at-zero/audience`

Proof: `opus-proof/02_FOUNDATION_AUDIENCE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×425 | y363 x18 354×253 |
| Panel code | y459 x39 65×41 | y376 x33 50×31 |
| Question title | y561 x39 312×18 | y430 x33 324×14 |
| First option / row | y609 x39 312×164 | y465 x33 324×97 |
| Actions / CTA | y786 x23 344×67 | y564 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 938 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100 · DIAGNOSTIC 141px wide (≈22px, wt 800); question 12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x18→372 · y362→625. Sonnet panel/cards y428 x22 346×425, doc height 938. Opus y363 x18 354×253, doc height 693. Rail centre: Sonnet y386 → Opus y331 (authority centre y331 · pitch 57 · active Ø20 / idle Ø16).
- **D. Machine geometry** — Authority: axis x195 y30→292 · orb Ø38 centre y199 · egg 148×238. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "00" 52×29 plain zeros. Sonnet code y459 x39 65×41; Opus y376 x33 50×31.
- **F. Navigation** — Authority nav y633→693 (60) · icons 18 · labels ≈6px. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y585→609 · BACK 68×24 · CONTINUE 120×25. Sonnet y786 x23 344×67; Opus y564 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5×2 tiles 62×51, gap 5. Sonnet first option y609 x39 312×164; Opus y465 x33 324×97.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Field + footer above the nav at 390×693.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Textarea: red 1.5px left rule, YOUR RESPONSE label, 7.3px text; on touch the field keeps a real 16px font-size (no iOS zoom) and is drawn at authority size via transform.

### 12. `03_FOUNDATION_TIMELINE` — `/idnty/starting-at-zero/timeline`

Proof: `opus-proof/03_FOUNDATION_TIMELINE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×473 | y363 x18 354×256 |
| Panel code | y459 x39 65×41 | y376 x33 50×31 |
| Question title | y563 x39 312×18 | y430 x33 324×14 |
| First option / row | y594 x39 312×38 | y453 x33 324×19 |
| Actions / CTA | y833 x23 344×67 | y566 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 985 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100 · DIAGNOSTIC 141px wide (≈22px, wt 800); question 12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x18→372 · y362→625. Sonnet panel/cards y428 x22 346×473, doc height 985. Opus y363 x18 354×256, doc height 693. Rail centre: Sonnet y386 → Opus y331 (authority centre y331 · pitch 57 · active Ø20 / idle Ø16).
- **D. Machine geometry** — Authority: axis x195 y30→292 · orb Ø38 centre y199 · egg 148×238. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "00" 52×29 plain zeros. Sonnet code y459 x39 65×41; Opus y376 x33 50×31.
- **F. Navigation** — Authority nav y633→693 (60) · icons 18 · labels ≈6px. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y585→609 · BACK 68×24 · CONTINUE 120×25. Sonnet y833 x23 344×67; Opus y566 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5×2 tiles 62×51, gap 5. Sonnet first option y594 x39 312×38; Opus y453 x33 324×19.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Radio rows 18.5px pitch, 10px radios, 6.4px labels (authority 457→549).

### 13. `04_FOUNDATION_BUDGET` — `/idnty/starting-at-zero/budget`

Proof: `opus-proof/04_FOUNDATION_BUDGET/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×415 | y363 x18 354×261 |
| Panel code | y459 x39 65×41 | y376 x33 50×31 |
| Question title | y562 x39 312×18 | y430 x33 324×14 |
| First option / row | y610 x39 100×74 | y465 x33 105×50 |
| Actions / CTA | y776 x23 344×67 | y572 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 928 | 695 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100 · DIAGNOSTIC 141px wide (≈22px, wt 800); question 12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x18→372 · y362→625. Sonnet panel/cards y428 x22 346×415, doc height 928. Opus y363 x18 354×261, doc height 695. Rail centre: Sonnet y386 → Opus y331 (authority centre y331 · pitch 57 · active Ø20 / idle Ø16).
- **D. Machine geometry** — Authority: axis x195 y30→292 · orb Ø38 centre y199 · egg 148×238. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "00" 52×29 plain zeros. Sonnet code y459 x39 65×41; Opus y376 x33 50×31.
- **F. Navigation** — Authority nav y633→693 (60) · icons 18 · labels ≈6px. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y585→609 · BACK 68×24 · CONTINUE 120×25. Sonnet y776 x23 344×67; Opus y572 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5×2 tiles 62×51, gap 5. Sonnet first option y610 x39 100×74; Opus y465 x33 105×50.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Budget 3×2 cells 107×50, coin icons 17px.

### 14. `05_FOUNDATION_REVIEW` — `/idnty/starting-at-zero/review`

Proof: `opus-proof/05_FOUNDATION_REVIEW/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×465 | y363 x18 354×280 |
| Panel code | y461 x39 65×41 | y378 x33 50×31 |
| First option / row | y575 x39 312×53 | y451 x33 324×43 |
| Actions / CTA | y826 x23 344×67 | y591 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 978 | 714 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100 · DIAGNOSTIC 141px wide (≈22px, wt 800); question 12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42).
- **C. Page geometry** — Authority: x18→372 · y362→625. Sonnet panel/cards y428 x22 346×465, doc height 978. Opus y363 x18 354×280, doc height 714. Rail centre: Sonnet y386 → Opus y331 (authority centre y331 · pitch 57 · active Ø20 / idle Ø16).
- **D. Machine geometry** — Authority: axis x195 y30→292 · orb Ø38 centre y199 · egg 148×238. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "00" 52×29 plain zeros. Sonnet code y461 x39 65×41; Opus y378 x33 50×31.
- **F. Navigation** — Authority nav y633→693 (60) · icons 18 · labels ≈6px. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y585→609 · BACK 68×24 · CONTINUE 120×25. Sonnet y826 x23 344×67; Opus y591 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5×2 tiles 62×51, gap 5. Sonnet first option y575 x39 312×53; Opus y451 x33 324×43.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — SUBMIT reachable above the nav; scrolls 20px at 390×693.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Review rows 43px with 22px icons; TIMELINE | BUDGET pair with divider; review label muted grey (authority). EDIT links kept (function) but quiet (5.2px grey) — authority shows none.

### 15. `01_REFINE_EXISTING_ASSETS` — `/idnty/some-pieces-exist/assets`

Proof: `opus-proof/01_REFINE_EXISTING_ASSETS/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y296 x81 228×20 |
| Working panel | y420 x22 346×439 | y338 x18 354×279 |
| Panel code | y457 x39 65×41 | y353 x33 50×31 |
| Question title | y565 x39 312×18 | y420 x33 324×14 |
| First option / row | y612 x39 58×74 | y454 x33 61×51 |
| Actions / CTA | y791 x23 344×67 | y564 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 943 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10.9–12px one line (shrinks with length). Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y340→624. Sonnet panel/cards y420 x22 346×439, doc height 943. Opus y338 x18 354×279, doc height 693. Rail centre: Sonnet y378 → Opus y306 (authority centre y306).
- **D. Machine geometry** — Authority: hex lattice x153→247 y118→252 · offset beaded line x162 · axis x200. Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "01". Sonnet code y457 x39 65×41; Opus y353 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y791 x23 344×67; Opus y564 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: assets 5×2 tiles · condition 3 cards 105×113 · gaps 3×2 cells 107×40. Sonnet first option y612 x39 58×74; Opus y454 x33 61×51.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits 390×693.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). REFINE family rail at y306 / panel 340 (authority) — constant through detail → questions → review. Meta row: REFINE IDENTITY · QUESTION 01 OF 03 · 3 segments (authority keeps this one for REFINE). Partial machine: elongated hex lattice + offset beaded line at x162 (pieces not yet on one axis).

### 16. `02_REFINE_CONDITION` — `/idnty/some-pieces-exist/cohesion-diagnostic`

Proof: `opus-proof/02_REFINE_CONDITION/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y296 x81 228×20 |
| Working panel | y420 x22 346×458 | y338 x18 354×279 |
| Panel code | y457 x39 65×41 | y353 x33 50×31 |
| Question title | y565 x39 312×36 | y420 x33 324×12 |
| First option / row | y631 x39 99×166 | y452 x33 104×110 |
| Actions / CTA | y810 x23 344×67 | y564 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 962 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10.9–12px one line (shrinks with length). Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 10.1px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y340→624. Sonnet panel/cards y420 x22 346×458, doc height 962. Opus y338 x18 354×279, doc height 693. Rail centre: Sonnet y378 → Opus y306 (authority centre y306).
- **D. Machine geometry** — Authority: hex lattice x153→247 y118→252 · offset beaded line x162 · axis x200. Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "01". Sonnet code y457 x39 65×41; Opus y353 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y810 x23 344×67; Opus y564 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: assets 5×2 tiles · condition 3 cards 105×113 · gaps 3×2 cells 107×40. Sonnet first option y631 x39 99×166; Opus y452 x33 104×110.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Question set on one line (font shrinks with length: 10.9px). Condition cards 108px tall, 36px icons, radio top-right.

### 17. `03_REFINE_GAPS` — `/idnty/some-pieces-exist/gaps`

Proof: `opus-proof/03_REFINE_GAPS/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y296 x81 228×20 |
| Working panel | y420 x22 346×428 | y338 x18 354×272 |
| Panel code | y457 x39 65×41 | y353 x33 50×31 |
| Question title | y565 x39 312×18 | y420 x33 324×14 |
| First option / row | y612 x39 100×74 | y454 x33 105×52 |
| Actions / CTA | y781 x23 344×67 | y557 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 933 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10.9–12px one line (shrinks with length). Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y340→624. Sonnet panel/cards y420 x22 346×428, doc height 933. Opus y338 x18 354×272, doc height 693. Rail centre: Sonnet y378 → Opus y306 (authority centre y306).
- **D. Machine geometry** — Authority: hex lattice x153→247 y118→252 · offset beaded line x162 · axis x200. Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "01". Sonnet code y457 x39 65×41; Opus y353 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y781 x23 344×67; Opus y557 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: assets 5×2 tiles · condition 3 cards 105×113 · gaps 3×2 cells 107×40. Sonnet first option y612 x39 100×74; Opus y454 x33 105×52.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Gap cells 40px; selected gaps are now CALLED OUT on the lattice (authority annotation layer).

### 18. `04_REFINE_REVIEW` — `/idnty/some-pieces-exist/review`

Proof: `opus-proof/04_REFINE_REVIEW/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y296 x81 228×20 |
| Working panel | y420 x22 346×372 | y338 x18 354×266 |
| Panel code | y453 x39 65×41 | y353 x33 50×31 |
| First option / row | y564 x39 312×147 | y426 x33 324×123 |
| Actions / CTA | y725 x23 344×67 | y551 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 877 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10.9–12px one line (shrinks with length). Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42).
- **C. Page geometry** — Authority: x16→374 · y340→624. Sonnet panel/cards y420 x22 346×372, doc height 877. Opus y338 x18 354×266, doc height 693. Rail centre: Sonnet y378 → Opus y306 (authority centre y306).
- **D. Machine geometry** — Authority: hex lattice x153→247 y118→252 · offset beaded line x162 · axis x200. Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "01". Sonnet code y453 x39 65×41; Opus y353 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y725 x23 344×67; Opus y551 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: assets 5×2 tiles · condition 3 cards 105×113 · gaps 3×2 cells 107×40. Sonnet first option y564 x39 312×147; Opus y426 x33 324×123.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). EXISTING | CURRENT CONDITION + GAPS split with dark divider; REVIEW ASSESSMENT in red (REFINE tone).

### 19. `01_EVOLUTION_AREAS` — `/idnty/ready-for-evolution/pathways`

Proof: `opus-proof/01_EVOLUTION_AREAS/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y330 x81 228×20 |
| Working panel | y428 x22 346×418 | y372 x18 354×267 |
| Panel code | y459 x39 65×41 | y387 x33 50×31 |
| Question title | y561 x39 312×18 | y455 x33 324×14 |
| First option / row | y622 x39 99×143 | y489 x33 104×96 |
| Actions / CTA | y778 x23 344×67 | y587 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 930 | 710 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 13px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y373→632. Sonnet panel/cards y428 x22 346×418, doc height 930. Opus y372 x18 354×267, doc height 710. Rail centre: Sonnet y386 → Opus y340 (authority centre y340).
- **D. Machine geometry** — Authority: waveform centre (195,224) · 5 nested ellipses ry 36→87 · lobes ±95. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "02". Sonnet code y459 x39 65×41; Opus y387 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈617. Sonnet y778 x23 344×67; Opus y587 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: areas 3 cards 105×86 · timeline 2×3 rows 24 tall. Sonnet first option y622 x39 99×143; Opus y489 x33 104×96.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). EVOLUTION family rail at y340 / panel 373. Meta row EVOLVE IDENTITY · QUESTION 01 (no total) · segments; no head glyph (authority). Waveform: 5 nested ellipses + 10 lobes ±95 on the signal line.

### 20. `02_EVOLUTION_GOALS` — `/idnty/ready-for-evolution/goals`

Proof: `opus-proof/02_EVOLUTION_GOALS/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y330 x81 228×20 |
| Working panel | y428 x22 346×443 | y372 x18 354×259 |
| Panel code | y459 x39 65×41 | y387 x33 50×31 |
| Question title | y560 x39 312×36 | y455 x33 324×14 |
| First option / row | y639 x39 312×150 | y489 x33 324×87 |
| Actions / CTA | y803 x23 344×67 | y578 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 955 | 701 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 13px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y373→632. Sonnet panel/cards y428 x22 346×443, doc height 955. Opus y372 x18 354×259, doc height 701. Rail centre: Sonnet y386 → Opus y340 (authority centre y340).
- **D. Machine geometry** — Authority: waveform centre (195,224) · 5 nested ellipses ry 36→87 · lobes ±95. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "02". Sonnet code y459 x39 65×41; Opus y387 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈617. Sonnet y803 x23 344×67; Opus y578 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: areas 3 cards 105×86 · timeline 2×3 rows 24 tall. Sonnet first option y639 x39 312×150; Opus y489 x33 324×87.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Textarea as Foundation audience.

### 21. `03_EVOLUTION_TIMELINE` — `/idnty/ready-for-evolution/timeline`

Proof: `opus-proof/03_EVOLUTION_TIMELINE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y330 x81 228×20 |
| Working panel | y428 x22 346×387 | y372 x18 354×254 |
| Panel code | y459 x39 65×41 | y387 x33 50×31 |
| Question title | y562 x39 312×18 | y455 x33 324×14 |
| First option / row | y609 x39 153×38 | y489 x33 159×24 |
| Actions / CTA | y748 x23 344×67 | y573 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 900 | 696 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 13px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y373→632. Sonnet panel/cards y428 x22 346×387, doc height 900. Opus y372 x18 354×254, doc height 696. Rail centre: Sonnet y386 → Opus y340 (authority centre y340).
- **D. Machine geometry** — Authority: waveform centre (195,224) · 5 nested ellipses ry 36→87 · lobes ±95. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "02". Sonnet code y459 x39 65×41; Opus y387 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈617. Sonnet y748 x23 344×67; Opus y573 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: areas 3 cards 105×86 · timeline 2×3 rows 24 tall. Sonnet first option y609 x39 153×38; Opus y489 x33 159×24.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Timeline 2×3 rows 24px tall with icons and radios.

### 22. `04_EVOLUTION_REVIEW` — `/idnty/ready-for-evolution/review`

Proof: `opus-proof/04_EVOLUTION_REVIEW/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y330 x81 228×20 |
| Working panel | y428 x22 346×422 | y372 x18 354×281 |
| Panel code | y461 x39 65×41 | y392 x33 50×31 |
| First option / row | y572 x39 312×53 | y470 x33 324×43 |
| Actions / CTA | y782 x23 344×67 | y601 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 934 | 724 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 13px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42).
- **C. Page geometry** — Authority: x16→374 · y373→632. Sonnet panel/cards y428 x22 346×422, doc height 934. Opus y372 x18 354×281, doc height 724. Rail centre: Sonnet y386 → Opus y340 (authority centre y340).
- **D. Machine geometry** — Authority: waveform centre (195,224) · 5 nested ellipses ry 36→87 · lobes ±95. Sonnet machine box y130 x22 346×240. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "02". Sonnet code y461 x39 65×41; Opus y392 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈617. Sonnet y782 x23 344×67; Opus y601 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: areas 3 cards 105×86 · timeline 2×3 rows 24 tall. Sonnet first option y572 x39 312×53; Opus y470 x33 324×43.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Selected areas bracketed on the waveform (authority annotation layer).

### 23. `01_BUILD_READY_VERIFICATION` — `/idnty/build-ready/verification`

Proof: `opus-proof/01_BUILD_READY_VERIFICATION/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×537 | y353 x18 354×295 |
| Panel code | y450 x39 65×41 | y366 x33 50×31 |
| Question title | y550 x39 312×36 | y420 x33 324×14 |
| First option / row | y630 x39 312×48 | y463 x33 324×25 |
| Actions / CTA | y889 x23 344×67 | y595 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1041 | 718 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10–12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y352→632. Sonnet panel/cards y420 x22 346×537, doc height 1041. Opus y353 x18 354×295, doc height 718. Rail centre: Sonnet y378 → Opus y321 (authority centre y321).
- **D. Machine geometry** — Authority: four-point star 70×70 centre (195,185) · ring r67 · 5 domain nodes (verification flow only). Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "03". Sonnet code y450 x39 65×41; Opus y366 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y889 x23 344×67; Opus y595 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5 domain rows ≈26 tall · evidence rows ≈30 · review 5 tiles 62×94. Sonnet first option y630 x39 312×48; Opus y463 x33 324×25.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits 390×693 incl. footer.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame). BUILD READY rail at y321 / panel 352; head: IDENTITY AUTHORITY VERIFICATION, no counter row (authority). Star machine with five identity-domain nodes; node fill = what the PERSON supplied (provisional), never verification. Domain rows 25px: icon · name · mark · status · node glyph · chevron.

### 24. `02_BUILD_READY_EVIDENCE` — `/idnty/build-ready/evidence`

Proof: `opus-proof/02_BUILD_READY_EVIDENCE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×737 | y353 x18 354×330 |
| Panel code | y450 x39 65×41 | y366 x33 50×31 |
| Question title | y554 x39 312×36 | y420 x33 324×14 |
| First option / row | y634 x39 312×96 | y463 x33 324×30 |
| Actions / CTA | y1089 x23 344×67 | y631 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1241 | 754 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10–12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y352→632. Sonnet panel/cards y420 x22 346×737, doc height 1241. Opus y353 x18 354×330, doc height 754. Rail centre: Sonnet y378 → Opus y321 (authority centre y321).
- **D. Machine geometry** — Authority: four-point star 70×70 centre (195,185) · ring r67 · 5 domain nodes (verification flow only). Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "03". Sonnet code y450 x39 65×41; Opus y366 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y1089 x23 344×67; Opus y631 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5 domain rows ≈26 tall · evidence rows ≈30 · review 5 tiles 62×94. Sonnet first option y634 x39 312×96; Opus y463 x33 324×30.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Scrolls; nav clear at the end.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). Evidence rows 29px, quiet chips (4.3px).

### 25. `03_BUILD_READY_AUTHORITY_CHECK` — `/idnty/build-ready/authority-check`

Proof: `opus-proof/03_BUILD_READY_AUTHORITY_CHECK/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×570 | y353 x18 354×321 |
| Panel code | y458 x39 65×41 | y368 x33 50×31 |
| Question title | y567 x39 312×18 | y424 x33 324×14 |
| First option / row | y629 x39 312×48 | y467 x33 324×25 |
| Actions / CTA | y922 x23 344×67 | y621 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1074 | 744 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10–12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42). Question title Sonnet 15.7px → Opus 11.8px (one line, length-fitted).
- **C. Page geometry** — Authority: x16→374 · y352→632. Sonnet panel/cards y420 x22 346×570, doc height 1074. Opus y353 x18 354×321, doc height 744. Rail centre: Sonnet y378 → Opus y321 (authority centre y321).
- **D. Machine geometry** — Authority: four-point star 70×70 centre (195,185) · ring r67 · 5 domain nodes (verification flow only). Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "03". Sonnet code y458 x39 65×41; Opus y368 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y922 x23 344×67; Opus y621 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5 domain rows ≈26 tall · evidence rows ≈30 · review 5 tiles 62×94. Sonnet first option y629 x39 312×48; Opus y467 x33 324×25.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Disclaimer adds ≈18px; scrolls clear of the nav.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). AUTHORITY CHECK 03 line; statuses PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED + provisional disclaimer.

### 26. `04_BUILD_READY_REVIEW_VERIFICATION` — `/idnty/build-ready/review`

Proof: `opus-proof/04_BUILD_READY_REVIEW_VERIFICATION/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×437 | y353 x18 354×286 |
| Panel code | y465 x39 65×41 | y369 x33 50×31 |
| First option / row | y599 x39 58×107 | y451 x33 61×86 |
| Actions / CTA | y790 x23 344×67 | y587 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 942 | 710 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: y66→100; question 10–12px one line. Sonnet hero title 29.6px (y86 x22 200×57). Opus 22.0px (y65 x30 150×42).
- **C. Page geometry** — Authority: x16→374 · y352→632. Sonnet panel/cards y420 x22 346×437, doc height 942. Opus y353 x18 354×286, doc height 710. Rail centre: Sonnet y378 → Opus y321 (authority centre y321).
- **D. Machine geometry** — Authority: four-point star 70×70 centre (195,185) · ring r67 · 5 domain nodes (verification flow only). Sonnet machine box y130 x22 346×232. Opus y28 x0 390×300.
- **E. Panel geometry** — Authority code "03". Sonnet code y465 x39 65×41; Opus y369 x33 50×31.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions y≈606. Sonnet y790 x23 344×67; Opus y587 x19 352×52.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 5 domain rows ≈26 tall · evidence rows ≈30 · review 5 tiles 62×94. Sonnet first option y599 x39 58×107; Opus y451 x33 61×86.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.IDNTY.ATRIUM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width). Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y. Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it. 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height. Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero). 5 domain tiles 62×86; EVIDENCE STATUS with the star glyph (authority) instead of a node glyph; REVIEW VERIFICATION in strong black.

### 27. `01_BLDR_COMMAND_CENTER` — `/bldr/state`

Proof: `opus-proof/01_BLDR_COMMAND_CENTER/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 346×51 | y64 x23 351×43 |
| Machine box | y278 x22 346×256 | y50 x130 190×260 |
| Card row | y564 x22 346×549 | y368 x16 358×205 |
| First card | y564 x22 169×270 | y368 x16 87×205 |
| NOT SURE bar | y1123 x22 346×130 | y582 x16 358×56 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1337 | 708 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: BUILDER y72→88 (≈20px) · COMMAND CENTER y93→110 (≈18px); question —. Sonnet hero title 25.9px (y86 x22 346×51). Opus 18.0px (y64 x23 351×43).
- **C. Page geometry** — Authority: CHOOSE row y356 · 4 cards x18→374, y370→570 (86×200) · NOT SURE bar y580→628. Sonnet panel/cards y564 x22 346×549, doc height 1337. Opus y368 x16 358×205, doc height 708.
- **D. Machine geometry** — Authority: tower x140→305 y55→300, axis x210, 4 flanking path panels. Sonnet machine box y278 x22 346×256. Opus y50 x130 190×260.
- **E. Panel geometry** — Authority code card codes 9.5px. Sonnet code —; Opus —.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions NOT SURE CTA 118×20. Sonnet —; Opus —.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: card art y390→450 · title 14px (EXTENSIONS fitted) · CTA pill 16 tall. Sonnet first option y564 x22 169×270; Opus y368 x16 87×205.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.BLDR.COMMAND_CENTER`, `MACHINE.BLDR.TOWER`, `CARD.BLDR.PATH.SITE`, `CARD.BLDR.PATH.WORLD`, `CARD.BLDR.PATH.SYSTEMS`, `CARD.BLDR.PATH.EXTENSIONS`.
- **K. Responsive** — 4-up cards hold at 360 (titles shrink-to-fit).
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Page was 1337px tall (machine 256px stacked under the hero, 2×2 cards 270px tall) → fits 390×693 like the authority. Header carries the existing primary links (EXPLORE · BUILD · EVOLVE · ABOUT) at 4.6px. Tower re-drawn in page coordinates x130→320, y50→310 with the four path panels hugging it. ONE row of four 87×205 cards; titles fitted to one line (EXTENSIONS 11px); CTA pills 16px. NOT SURE bar: glyph · copy · divider · outlined CTA pill (authority).

### 28. `02_BLDR_OVERVIEW` — `/bldr/state?path=overview`

Proof: `opus-proof/02_BLDR_OVERVIEW/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×724 | y250 x15 360×457 |
| Panel code | y299 x39 248×18 | y269 x34 266×11 |
| Actions / CTA | y925 x39 312×46 | y665 x34 326×31 |
| Document height | 1008 | 721 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 y52 · BUILDER y61→75 (≈17px); question title ≈35px (EXTENSIONS ≈31) · tagline 9–10px red. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y252→670 · r≈11. Sonnet panel/cards y262 x22 346×724, doc height 1008. Opus y250 x15 360×457, doc height 721.
- **D. Machine geometry** — Authority: panel art x205→305 y270→350. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "02" 11px + red tick. Sonnet code y299 x39 248×18; Opus y269 x34 266×11.
- **F. Navigation** — Authority nav — (no bottom nav). Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y627→659 · BACK Ø32 · CTA pill 207×30 + red disc. Sonnet y925 x39 312×46; Opus y665 x34 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW 8.6px · body 6.6px · 4 WHAT WE BUILD cols · 5 framework cols (glyph 50). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.BLDR.PATH.OVERVIEW`, `ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW`.
- **K. Responsive** — Scrolls ≈30px at 390×693; no overflow.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Hero (SITE 00 / BUILDER / list with red node) at authority scale; panel x15→375 @ y≈250. Pager: BUILDER PATH 1/4 + dots with the active as a red diamond; section index right column. Title fitted (OVERVIEW 35px), body 5.9px, framework 5 columns with 50px glyphs.

### 29. `03_BLDR_SITE` — `/bldr/state?path=site`

Proof: `opus-proof/03_BLDR_SITE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y267 x22 346×686 | y250 x15 360×429 |
| Panel code | y304 x39 248×18 | y269 x34 266×11 |
| Actions / CTA | y893 x39 312×46 | y637 x34 326×31 |
| Document height | 970 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 y52 · BUILDER y61→75 (≈17px); question title ≈35px (EXTENSIONS ≈31) · tagline 9–10px red. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y252→670 · r≈11. Sonnet panel/cards y267 x22 346×686, doc height 970. Opus y250 x15 360×429, doc height 693.
- **D. Machine geometry** — Authority: panel art x205→305 y270→350. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "02" 11px + red tick. Sonnet code y304 x39 248×18; Opus y269 x34 266×11.
- **F. Navigation** — Authority nav — (no bottom nav). Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y627→659 · BACK Ø32 · CTA pill 207×30 + red disc. Sonnet y893 x39 312×46; Opus y637 x34 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW 8.6px · body 6.6px · 4 WHAT WE BUILD cols · 5 framework cols (glyph 50). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.BLDR.PATH.SITE`, `ILLUSTRATION.BLDR.PATH.PANEL.SITE`.
- **K. Responsive** — Fits 390×693.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** As OVERVIEW; CLOSE + X at the top right (authority).

### 30. `04_BLDR_WORLD` — `/bldr/state?path=world`

Proof: `opus-proof/04_BLDR_WORLD/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×720 | y250 x15 360×463 |
| Panel code | y299 x39 248×18 | y269 x34 266×11 |
| Actions / CTA | y921 x39 312×46 | y671 x34 326×31 |
| Document height | 1004 | 727 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 y52 · BUILDER y61→75 (≈17px); question title ≈35px (EXTENSIONS ≈31) · tagline 9–10px red. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y252→670 · r≈11. Sonnet panel/cards y262 x22 346×720, doc height 1004. Opus y250 x15 360×463, doc height 727.
- **D. Machine geometry** — Authority: panel art x205→305 y270→350. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "02" 11px + red tick. Sonnet code y299 x39 248×18; Opus y269 x34 266×11.
- **F. Navigation** — Authority nav — (no bottom nav). Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y627→659 · BACK Ø32 · CTA pill 207×30 + red disc. Sonnet y921 x39 312×46; Opus y671 x34 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW 8.6px · body 6.6px · 4 WHAT WE BUILD cols · 5 framework cols (glyph 50). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.BLDR.PATH.WORLD`, `ILLUSTRATION.BLDR.PATH.PANEL.WORLD`.
- **K. Responsive** — Scrolls ≈35px.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** As OVERVIEW.

### 31. `05_BLDR_SYSTEMS` — `/bldr/state?path=systems`

Proof: `opus-proof/05_BLDR_SYSTEMS/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×689 | y250 x15 360×429 |
| Panel code | y299 x39 248×18 | y269 x34 266×11 |
| Actions / CTA | y890 x39 312×46 | y637 x34 326×31 |
| Document height | 973 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 y52 · BUILDER y61→75 (≈17px); question title ≈35px (EXTENSIONS ≈31) · tagline 9–10px red. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y252→670 · r≈11. Sonnet panel/cards y262 x22 346×689, doc height 973. Opus y250 x15 360×429, doc height 693.
- **D. Machine geometry** — Authority: panel art x205→305 y270→350. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "02" 11px + red tick. Sonnet code y299 x39 248×18; Opus y269 x34 266×11.
- **F. Navigation** — Authority nav — (no bottom nav). Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y627→659 · BACK Ø32 · CTA pill 207×30 + red disc. Sonnet y890 x39 312×46; Opus y637 x34 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW 8.6px · body 6.6px · 4 WHAT WE BUILD cols · 5 framework cols (glyph 50). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.BLDR.PATH.SYSTEMS`, `ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** As OVERVIEW. SYSTEMS still maps to the ENTERPRISE build class (unchanged).

### 32. `06_BLDR_EXTENSIONS` — `/bldr/state?path=extensions`

Proof: `opus-proof/06_BLDR_EXTENSIONS/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×692 | y250 x15 360×444 |
| Panel code | y299 x39 248×18 | y269 x34 266×11 |
| Actions / CTA | y861 x39 312×46 | y638 x34 326×31 |
| Document height | 976 | 708 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 y52 · BUILDER y61→75 (≈17px); question title ≈35px (EXTENSIONS ≈31) · tagline 9–10px red. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y252→670 · r≈11. Sonnet panel/cards y262 x22 346×692, doc height 976. Opus y250 x15 360×444, doc height 708.
- **D. Machine geometry** — Authority: panel art x205→305 y270→350. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "02" 11px + red tick. Sonnet code y299 x39 248×18; Opus y269 x34 266×11.
- **F. Navigation** — Authority nav — (no bottom nav). Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y627→659 · BACK Ø32 · CTA pill 207×30 + red disc. Sonnet y861 x39 312×46; Opus y638 x34 326×31.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: OVERVIEW 8.6px · body 6.6px · 4 WHAT WE BUILD cols · 5 framework cols (glyph 50). Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.BLDR.PATH.EXTENSIONS`, `ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS`.
- **K. Responsive** — Fits + discovery note.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Title fitted so EXTENSIONS ends before the art (31px).

### 33. `01_EVOLVE_INTERVENTION_CENTER` — `/evolve/state`

Proof: `opus-proof/01_EVOLVE_INTERVENTION_CENTER/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 346×51 | y64 x23 351×40 |
| Machine box | y282 x22 346×270 | y74 x139 230×276 |
| Card row | y582 x22 346×259 | y368 x16 358×200 |
| First card | y582 x22 110×259 | y368 x16 115×200 |
| NOT SURE bar | y851 x22 346×130 | y577 x16 358×56 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1065 | 703 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y32 x22 82×17 (+8px body margin). Opus: y14 x30 59×10. Correction: §A1–A3.
- **B. Typography** — Authority: EVOLVE / y58 · INTERVENTION CENTER y72→110; question —. Sonnet hero title 25.9px (y86 x22 346×51). Opus 18.0px (y64 x23 351×40).
- **C. Page geometry** — Authority: CHOOSE row y356 · 3 cards y370→570 · NOT SURE bar y580→628. Sonnet panel/cards y582 x22 346×259, doc height 1065. Opus y368 x16 358×200, doc height 703.
- **D. Machine geometry** — Authority: property x160→300 y50→300 · layer labels x127 y125/185/245. Sonnet machine box y282 x22 346×270. Opus y74 x139 230×276.
- **E. Panel geometry** — Authority code card codes 9.5px. Sonnet code —; Opus —.
- **F. Navigation** — Authority nav y633. Sonnet y629 x0 390×64; Opus y633 x0 390×60.
- **G. Spacing** — Authority actions NOT SURE CTA. Sonnet —; Opus —.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: 3 cards 115×200. Sonnet first option y582 x22 110×259; Opus y368 x16 115×200.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.EVOLVE.INTERVENTION_CENTER`, `MACHINE.EVOLVE.PROPERTY_TOWER`, `CARD.EVOLVE.PATH.REFINE`, `CARD.EVOLVE.PATH.INSTALL`, `CARD.EVOLVE.PATH.TRANSFORM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Page 1010px → fits 390×693; layer labels 01/02/03 run down the left of the property (x≈127) instead of inside the machine. Three 115×205 cards in one row; NOT SURE bar as BLDR.

### 34. `02_EVOLVE_REFINE` — `/evolve/state?path=refine`

Proof: `opus-proof/02_EVOLVE_REFINE/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×627 | y314 x15 360×357 |
| Panel code | y299 x39 248×18 | y333 x34 266×11 |
| Actions / CTA | y828 x39 312×46 | y627 x34 326×33 |
| Document height | 911 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 · EVOLVE; question title ≈33px · tagline 9.5px. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y318→665. Sonnet panel/cards y262 x22 346×627, doc height 911. Opus y314 x15 360×357, doc height 693.
- **D. Machine geometry** — Authority: panel art x255→360 y345→445. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "03.01" 11px. Sonnet code y299 x39 248×18; Opus y333 x34 266×11.
- **F. Navigation** — Authority nav —. Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y640→672 · solid red CTA 199×34. Sonnet y828 x39 312×46; Opus y627 x34 326×33.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: INCLUDES / IDEAL FOR / DELIVERABLES · TIMELINE / INVESTMENT facts. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.EVOLVE.PATH.REFINE`, `ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE`.
- **K. Responsive** — Fits 390×693.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Panel at y≈318 (authority 318); 03.01 code; title 33px; triple columns 5.2px; facts row; SOLID red CHOOSE REFINE pill (authority) vs BLDR light pill.

### 35. `03_EVOLVE_INSTALL` — `/evolve/state?path=install`

Proof: `opus-proof/03_EVOLVE_INSTALL/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×601 | y314 x15 360×357 |
| Panel code | y299 x39 248×18 | y333 x34 266×11 |
| Actions / CTA | y802 x39 312×46 | y627 x34 326×33 |
| Document height | 885 | 693 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 · EVOLVE; question title ≈33px · tagline 9.5px. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y318→665. Sonnet panel/cards y262 x22 346×601, doc height 885. Opus y314 x15 360×357, doc height 693.
- **D. Machine geometry** — Authority: panel art x255→360 y345→445. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "03.01" 11px. Sonnet code y299 x39 248×18; Opus y333 x34 266×11.
- **F. Navigation** — Authority nav —. Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y640→672 · solid red CTA 199×34. Sonnet y802 x39 312×46; Opus y627 x34 326×33.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: INCLUDES / IDEAL FOR / DELIVERABLES · TIMELINE / INVESTMENT facts. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.EVOLVE.PATH.INSTALL`, `ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** As REFINE.

### 36. `04_EVOLVE_TRANSFORM` — `/evolve/state?path=transform`

Proof: `opus-proof/04_EVOLVE_TRANSFORM/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y27 x22 35×26 | y13 x16 24×15 |
| Hero title | y84 x22 346×27 | y56 x26 348×18 |
| Working panel | y262 x22 346×627 | y314 x15 360×373 |
| Panel code | y299 x39 248×18 | y333 x34 266×11 |
| Actions / CTA | y828 x39 312×46 | y643 x34 326×33 |
| Document height | 911 | 701 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y27 x22 35×26 (+8px body margin). Opus: y13 x16 24×15. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 · EVOLVE; question title ≈33px · tagline 9.5px. Sonnet hero title 27.2px (y84 x22 346×27). Opus 17.0px (y56 x26 348×18).
- **C. Page geometry** — Authority: glass x15→375 · y318→665. Sonnet panel/cards y262 x22 346×627, doc height 911. Opus y314 x15 360×373, doc height 701.
- **D. Machine geometry** — Authority: panel art x255→360 y345→445. Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code "03.01" 11px. Sonnet code y299 x39 248×18; Opus y333 x34 266×11.
- **F. Navigation** — Authority nav —. Sonnet —; Opus —.
- **G. Spacing** — Authority actions footer y640→672 · solid red CTA 199×34. Sonnet y828 x39 312×46; Opus y643 x34 326×33.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: INCLUDES / IDEAL FOR / DELIVERABLES · TIMELINE / INVESTMENT facts. Sonnet first option —; Opus —.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.EVOLVE.PATH.TRANSFORM`, `ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM`.
- **K. Responsive** — Fits.
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** As REFINE.

### 37. `01_LOCATIONS_MAIN` — `/origin/locations`

Proof: `opus-proof/01_LOCATIONS_MAIN/comparison.jpg` (AUTHORITY | SONNET | OPUS)

| Landmark | SONNET (measured) | OPUS (measured) |
|---|---|---|
| Header wordmark | y22 x22 82×17 | y40 x28 48×7 |
| Hero title | y63 x22 346×37 | y64 x28 325×31 |
| Card row | y138 x22 346×636 | y122 x28 325×489 |
| First card | y138 x52 316×84 | y122 x57 296×63 |
| Document height | 1337 | 986 |

- **A. Shell** — Authority header/frame per family. Sonnet: wordmark y22 x22 82×17 (+8px body margin). Opus: y40 x28 48×7. Correction: §A1–A3.
- **B. Typography** — Authority: SITE 00 ◆ y46 · LOCATIONS y66→96 (≈30px); question —. Sonnet hero title 36.8px (y63 x22 346×37). Opus 30.5px (y64 x28 325×31).
- **C. Page geometry** — Authority: rows x57→353 · 63 tall · 71 pitch · y128→622. Sonnet panel/cards y138 x22 346×636, doc height 1337. Opus y122 x28 325×489, doc height 986.
- **D. Machine geometry** — Authority: arch plate (Grok) · row thumbnails right half (Grok). Sonnet machine box —. Opus —.
- **E. Panel geometry** — Authority code row index 5px. Sonnet code —; Opus —.
- **F. Navigation** — Authority nav — (directory). Sonnet —; Opus —.
- **G. Spacing** — Authority actions ghost 00 y625→645 · CONTINUE EXPLORING y676. Sonnet —; Opus —.
- **H. Linework** — Sonnet: 0.8–1px strokes, uniform bead size. Opus: 0.45–0.8px technical strokes, graded beads (authority).
- **I. Input / control presentation** — Authority options: title 8.6px · desc 4.6px · arrow Ø18. Sonnet first option y138 x52 316×84; Opus y122 x57 296×63.
- **J. Asset placeholders** — Grok slots on this screen: `ENV.LOCATIONS.ARCH`, `CARD.LOCATIONS.BLDR`, `CARD.LOCATIONS.EVOLVE`, `CARD.LOCATIONS.SITES`, `CARD.LOCATIONS.SERVICES`, `CARD.LOCATIONS.SYSTEM`, `CARD.LOCATIONS.ABOUT`, `CARD.LOCATIONS.JOURNAL`.
- **K. Responsive** — Public rows end at y≈611 (authority 622).
- **L. Material / lighting** — Placeholder plate carries the authority light structure; glossy red rendered with SVG gradients; glass panels translucent white + blur. Final materials: Grok.
- **Correction applied:** Header y46; LOCATIONS 36.8 → 30.5px; rows 316×84 → 296×63 at x57, 71px pitch; spine x40 with 4.5px nodes; arrow discs 18px. Ghost 00 as plain-zero SVG + CONTINUE EXPLORING.

