# NDX BOOK — Three-Direction Creative Direction — Reference Decomposition Manifest

**Status:** Production planning artifact, authored BEFORE implementation, per SITE 00 reference-to-production methodology (see `docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md`).

**Approved references (founder-attached, this sprint):**

| Direction | Reference identity | Proprietary signal |
|---|---|---|
| 01 — EDITORIAL UTILITY | "THE BOOK ON EVERYTHING." modern publication board | SIGNAL LIME |
| 02 — INDEX SIGNAL | Electric-cobalt intelligence/signal board | ELECTRIC COBALT |
| 03 — KINETIC FIELD | Motion-principle energy board | ROSE / ORANGE / DEEP PURPLE kinetic field |

**Reading note:** These reference boards were supplied as founder-attached images (not files on disk). Colors below were read visually from the rendered board and are documented as **APPROXIMATED, REFERENCE-LOCKED HEX** — close enough to drive production now, but should be re-sampled against the founder's raw source file with a color picker before these are treated as pixel-exact brand constants. This is flagged explicitly rather than silently asserted as exact.

---

## DIRECTION 01 — EDITORIAL UTILITY

| Field | Value |
|---|---|
| Foundation palette | Paper white `#F7F5F0` · Black `#0B0B0B` · Neutral gray `#6B6B6B` |
| Accent | SIGNAL LIME `#D6FF3B` (marker/highlight/annotation use only — never a flood fill) |
| Typography | Contemporary editorial sans display + monospace metadata label (matches board's "Aa" system) |

### Component decomposition

| ASSET_ID | REFERENCE_REGION | PURPOSE | CLASSIFICATION | GENERATION_METHOD | BACKGROUND_TREATMENT | COMPOSITE_BEHAVIOR | RESPONSIVE_BEHAVIOR | FIDELITY_MODE |
|---|---|---|---|---|---|---|---|---|
| EU-01 wordmark/brand mark | Top-right "NDX BOOK" mark box | Brand identity anchor | CODE_NATIVE | Typeset in code (exact wordmark control required) | KEEP_BACKGROUND (solid black tile) | Fixed corner mark, never composited over imagery | Shrinks proportionally, never truncates | EXACT_RECONSTRUCTION (typographic, not generated) |
| EU-02 core concept / why-it-works / brand personality / the-feel panels | Four top black info-cards | Strategic framing text, exact wording must be editable | CODE_NATIVE | Real DOM text, lime underline/marker via CSS | N/A | Grid row above feed proof | Stacks to 1-col under 640px | EXACT_RECONSTRUCTION |
| EU-03 "THE BURN PAGE" tile | Branch 01 — torn annotated paper, opinionated commentary | Prove opinionated/annotated editorial voice | HYBRID_COMPOSITION | FAL photoreal torn/annotated paper fragment + code-native lime marker line + headline text | REMOVE_BACKGROUND (paper fragment isolated so it can sit on the feed tile's own background, not carry a studio backdrop) | Paper asset anchored bottom-left, rotated -3°, headline text sits on codenative tile background above it | Mobile: paper fragment recomposed to top 60% of tile (not shrunk in place) | DIRECTED_VARIATION |
| EU-04 "THE RECEIPTS" tile | Branch 02 — receipt/evidence stack | Prove documentation/evidence behavior | HYBRID_COMPOSITION | FAL photoreal thermal receipt paper, isolated | REMOVE_BACKGROUND | Receipt overlaps tile edge by ~12%, lime "FACTS" stamp code-native on top | Mobile: receipt recomposed smaller, centered, stamp moves to top-right | DIRECTED_VARIATION |
| EU-05 "MARGIN NOTES" tile | Branch 03 — short handwritten observation | Prove short-thought editorial behavior | CODE_NATIVE | Typeset quote + lime underline rule | N/A | Full-bleed tile, generous whitespace | Font scales via clamp() | EXACT_RECONSTRUCTION |
| EU-06 "THE LIST" tile | Branch 04 — ranked framework | Prove list/ranking behavior | CODE_NATIVE | Numbered list, code-native rules | N/A | Full-bleed tile | Reflows to single column | EXACT_RECONSTRUCTION |
| EU-07 "THE FILE" tile | Branch 05 — deep-dive investigation cover, skyline photo | Prove investigative depth behavior | GENERATED_ASSET | FAL photoreal architectural/skyline photograph | KEEP_BACKGROUND (full-bleed photographic cover, no isolation needed) | Full-bleed background image, code-native headline + case-file number overlaid | Mobile: image crop repositioned (object-position), not just scaled | DIRECTED_VARIATION |
| EU-08 "THE INSERT" tile | Branch 06 — museum-ticket-style inserted artifact | Prove found-material/artifact behavior | HYBRID_COMPOSITION | FAL photoreal printed insert/ticket stock, isolated | REMOVE_BACKGROUND | Insert asset rotated +2°, taped at one corner (code-native tape graphic) | Mobile: insert recomposed centered, tape removed to reduce visual noise | DIRECTED_VARIATION |
| EU-09 "REDACTION" tile | Branch 07 — redacted document | Prove tension/withholding behavior | CODE_NATIVE | Black bar rules over code-native text blocks | N/A | Full-bleed tile | Bars keep proportional width | EXACT_RECONSTRUCTION |
| EU-10 "THE CENTERFOLD" tile | Branch 08 — large dramatic editorial photograph | Prove large visual-moment behavior | GENERATED_ASSET | FAL photoreal editorial portrait/figure photography (documentary, not stock-smile) | KEEP_BACKGROUND (full-bleed, no isolation needed) | Full-bleed, spans 2 grid cells on desktop | Mobile: spans full width, crop repositioned to preserve subject | DIRECTED_VARIATION |
| EU-11 "THE BACK PAGE" tile | Branch 09 — participatory prompt/quiz | Prove community/participation behavior | CODE_NATIVE | Typeset question + code-native checkbox list | N/A | Full-bleed tile | Stacks vertically | EXACT_RECONSTRUCTION |
| EU-12 carousel proof (5-slide) | "Content formats" carousel row | Prove multi-slide unfolding | CODE_NATIVE shell + HYBRID slide art | Reuses EU-03/EU-04 asset language at smaller scale | Per-slide, matches parent asset | Horizontal scroll strip | Snap-scroll on mobile | DIRECTED_VARIATION |
| EU-13 story sequence (5-frame) | Story example row | Prove sequential story states | CODE_NATIVE | Typographic progression (dot → connect → pattern → advantage) | N/A | Vertical 9:16 frame strip | Frame width scales, never crops text | EXACT_RECONSTRUCTION |
| EU-14 reel storyboard | Reel example row | Prove short-form video language | CODE_NATIVE spec table | Entry/motion/peak/exit documented, not rendered video | N/A | Horizontal frame strip | Scrolls on mobile | NET_NEW_GENERATION (spec only) |

**Negative constraints (all Editorial Utility generated assets):** NO antique parchment, NO medieval manuscript, NO sepia wash, NO cottage-core scrapbook, NO fake readable AI paragraphs, NO excessive distressing, NO school-project aesthetic, NO generic Pinterest collage, NO pink, NO ecommerce layout, NO website UI, NO vintage nostalgia treatment.

---

## DIRECTION 02 — INDEX SIGNAL

| Field | Value |
|---|---|
| Foundation palette | Graphite `#14151A` · Terminal black `#0A0A0C` · Instrument white `#F5F7FA` · Ice `#EAF4FF` |
| Accent | ELECTRIC COBALT `#2457F7` (proprietary signal — distinct from Editorial's lime) |
| Typography | Geometric sans display + monospace data/coordinate labels |

### Component decomposition

| ASSET_ID | REFERENCE_REGION | PURPOSE | CLASSIFICATION | GENERATION_METHOD | BACKGROUND_TREATMENT | COMPOSITE_BEHAVIOR | RESPONSIVE_BEHAVIOR | FIDELITY_MODE |
|---|---|---|---|---|---|---|---|---|
| IS-01 wordmark / crosshair mark | Top-right bracketed "NDX BOOK" mark | Brand identity anchor | CODE_NATIVE | SVG crosshair + typeset wordmark | N/A | Fixed corner | Scales proportionally | EXACT_RECONSTRUCTION |
| IS-02 "THE PULSE" tile | Branch 01 — live waveform, sparse typographic | Prove sparse/typographic range | CODE_NATIVE | Animated SVG waveform (static frame for stills) | N/A | Full-bleed dark tile | Waveform width scales | EXACT_RECONSTRUCTION |
| IS-03 "THE READOUT" tile | Branch 02 — huge stat number (68.4%) | Prove "huge number" behavior | CODE_NATIVE | Large tabular-nums typography | N/A | Full-bleed dark tile | Font scales via clamp() | EXACT_RECONSTRUCTION |
| IS-04 "THE PATTERN" tile | Branch 03 — real-world photograph interrupted by cobalt connection-line overlay | Prove photographed-object-under-analysis behavior | HYBRID_COMPOSITION | FAL photoreal documentary street/object photo + code-native cobalt SVG connection-line overlay | KEEP_BACKGROUND (full-bleed photo base) | Cobalt vector overlay sits above photo at fixed anchor points defined in composite map | Mobile: overlay anchor points recomputed to new crop, not stretched | DIRECTED_VARIATION |
| IS-05 "THE SCAN" tile | Branch 04 — library/shelving scanning shot | Prove scanning-result behavior | GENERATED_ASSET | FAL photoreal library/archive interior, cool cobalt-graded light | KEEP_BACKGROUND | Full-bleed background, code-native scan-line graphic animates over it | Mobile: crop repositioned to keep shelving vanishing point centered | DIRECTED_VARIATION |
| IS-06 "THE FORECAST" tile | Branch 05 — line/trend diagram | Prove diagram-first behavior | CODE_NATIVE | SVG line chart, no real data fabricated (illustrative axis only) | N/A | Full-bleed dark tile | Chart scales via viewBox | EXACT_RECONSTRUCTION |
| IS-07 "THE ALERT" tile | Branch 06 — signal alert card (0047) | Prove urgent/alert behavior | CODE_NATIVE | Typeset alert card, cobalt fill block | N/A | Full-bleed cobalt-fill tile | Stacks vertically | EXACT_RECONSTRUCTION |
| IS-08 "THE TRANSMISSION" tile | Branch 07 — direct message / opinion card | Prove editorial-voice-inside-signal behavior | CODE_NATIVE | Typeset message-bubble device | N/A | Full-bleed dark tile | Bubble width scales | EXACT_RECONSTRUCTION |
| IS-09 "THE COORDINATE" tile | Branch 08 — radar/location ping graphic | Prove mapping/indexing behavior | CODE_NATIVE | SVG radar rings + ping dot | N/A | Full-bleed dark tile | Radar scales via viewBox | EXACT_RECONSTRUCTION |
| IS-10 "THE PROJECTION" tile | Branch 09 — trajectory path diagram | Prove cause/effect projection behavior | CODE_NATIVE | SVG dotted path + node markers | N/A | Full-bleed dark tile | Path scales via viewBox | EXACT_RECONSTRUCTION |
| IS-11 indexed photographic sequence | "Story example" vertical flow (scan→lock→connect→understand→move) | Prove sequential signal narrative | HYBRID_COMPOSITION | One FAL macro object photo (isolated, background-removed) reused across frames with escalating cobalt overlay density | REMOVE_BACKGROUND | Same isolated object, re-composited per frame at different scale/rotation per composite map | Frames stack vertically on narrow viewports | DIRECTED_VARIATION |
| IS-12 reel storyboard | Reel example row (lock→connect→understand→move) | Prove short-form video language | CODE_NATIVE spec table | Entry/motion/peak/exit documented, not rendered video | N/A | Horizontal frame strip | Scrolls on mobile | NET_NEW_GENERATION (spec only) |

**Negative constraints (all Index Signal generated assets):** NO generic SaaS dashboard, NO fintech app UI, NO cyan-on-navy cliché, NO random stock chart, NO generic HUD, NO gamer interface, NO Matrix aesthetic, NO meaningless numbers.

---

## DIRECTION 03 — KINETIC FIELD

| Field | Value |
|---|---|
| Foundation | Terminal black `#0A0A0C` · Deep smoke `#26232A` · Off-white `#F2F0EC` |
| Accents (multi-hue kinetic spectrum, not a single flat gradient) | Rose `#FF2E7E` · Orange `#FF7A2E` · Deep purple `#5B21B6` |
| Typography | Bold condensed display sans, high-contrast on dark |

### Component decomposition

| ASSET_ID | REFERENCE_REGION | PURPOSE | CLASSIFICATION | GENERATION_METHOD | BACKGROUND_TREATMENT | COMPOSITE_BEHAVIOR | RESPONSIVE_BEHAVIOR | FIDELITY_MODE |
|---|---|---|---|---|---|---|---|---|
| KF-01 wordmark | Bottom-center "NDX BOOK" mark | Brand identity anchor | CODE_NATIVE | Typeset wordmark on black tile | N/A | Fixed footer mark | Scales proportionally | EXACT_RECONSTRUCTION |
| KF-02 "THE PUSH" tile | Branch 01 — figure mid-sprint, motion-blur | Prove "momentum starts with a decision" (attraction/acceleration) | GENERATED_ASSET | FAL stylized dimensional render — figure silhouette with directional motion-blur streaks | KEEP_BACKGROUND (full-bleed) | Full-bleed dark tile, code-native "YOU PUSH FIRST" callout | Mobile: crop repositioned to keep motion vector reading left-to-right | DIRECTED_VARIATION |
| KF-03 "THE PULL" tile | Branch 02 — converging particle trails (attraction) | Prove attraction/gravity principle | HYBRID_COMPOSITION | FAL sculptural light-trail render, isolated on black | MASK_AND_COMPOSITE (trails masked to remove any residual flat backdrop seam) | Composited over code-native radial gradient field so edges blend | Mobile: recomposed to vertical orientation, not rotated | DIRECTED_VARIATION |
| KF-04 "THE RIPPLE" tile | Branch 03 — concentric ripple rings | Prove ripple/propagation principle | CODE_NATIVE | SVG concentric rings, animated | N/A | Full-bleed dark tile | Rings scale via viewBox | EXACT_RECONSTRUCTION |
| KF-05 "THE COLLISION" tile | Branch 04 — two vectors meeting at impact point | Prove collision principle | CODE_NATIVE | SVG vector convergence diagram | N/A | Full-bleed dark tile | Diagram scales via viewBox | EXACT_RECONSTRUCTION |
| KF-06 "THE CURRENT" tile | Branch 05 — flowing directional lines | Prove flow principle | CODE_NATIVE | SVG flow-line field | N/A | Full-bleed dark tile | Lines scale via viewBox | EXACT_RECONSTRUCTION |
| KF-07 "THE TRAJECTORY" tile | Branch 06 — single directional arc | Prove trajectory principle | CODE_NATIVE | SVG arc + velocity marker | N/A | Full-bleed dark tile | Arc scales via viewBox | EXACT_RECONSTRUCTION |
| KF-08 "THE BUILD" tile | Branch 07 — ascending stacked bars ("stack it") | Prove compounding/expansion principle | CODE_NATIVE | SVG ascending bar stack | N/A | Full-bleed dark tile | Bars scale via viewBox | EXACT_RECONSTRUCTION |
| KF-09 "THE BREAK" tile | Branch 08 — fracture/shatter moment | Prove compression→break principle | GENERATED_ASSET | FAL stylized dimensional fracture render (glass-like shard field, no literal glass cliché — sculptural break plane) | KEEP_BACKGROUND (full-bleed) | Full-bleed dark tile | Mobile: crop centered on fracture origin | DIRECTED_VARIATION |
| KF-10 "THE AFTERMATH" tile | Branch 09 — dispersing particle field settling | Prove settling/exit-state principle | CODE_NATIVE | SVG particle-settle diagram | N/A | Full-bleed dark tile | Field scales via viewBox | EXACT_RECONSTRUCTION |
| KF-11 "THE MOMENTUM" tile | Branch 10 — directional arrow field, decision path highlighted | Prove convergence-to-decision principle | HYBRID_COMPOSITION | FAL sculptural numeral/arrow object render, isolated | REMOVE_BACKGROUND | Object anchored at 60%/40% per composite map, code-native path line drawn to it | Mobile: object recomposed to top-third, path redrawn shorter | DIRECTED_VARIATION |
| KF-12 story sequence (5-frame spark→accelerate→peak→trajectory) | Story example vertical flow | Prove sequential motion narrative | CODE_NATIVE + one shared GENERATED_ASSET | Reuses KF-02 asset at different crops/rotations per frame | Per composite map | Frames stack vertically on narrow viewports | DIRECTED_VARIATION |
| KF-13 reel storyboard | Reel example row (force→resistance→collision→breakpoint→new trajectory) | Prove short-form motion language + document future animation | CODE_NATIVE spec table | ENTRY_STATE / MOTION_PRINCIPLE / PEAK_STATE / EXIT_BEHAVIOR documented per frame (see `visualAssetStrategy.ts`) | N/A | Horizontal frame strip | Scrolls on mobile | NET_NEW_GENERATION (spec only) |

**Negative constraints (all Kinetic Field generated assets):** NO generic purple gradient wallpaper, NO screensaver, NO gaming wallpaper, NO random neon ribbons, NO cyberpunk city, NO generic particle-burst wallpaper, NO static decorative glow without a named motion principle behind it.

---

## Production priority for this sprint

Given production-cleanup scope, this pass generates real FAL imagery for the highest-fidelity-risk assets first (the ones most likely to still read as "wireframe" rather than "brand"):

1. **EU-04** (THE RECEIPTS — needs isolation) — GENERATED + REMOVE_BACKGROUND
2. **EU-10** (THE CENTERFOLD — full-bleed editorial photography) — GENERATED, no isolation
3. **IS-05** (THE SCAN — full-bleed archive photography) — GENERATED, no isolation
4. **IS-11** source object (needs isolation) — GENERATED + REMOVE_BACKGROUND
5. **KF-02** (THE PUSH — full-bleed dimensional render) — GENERATED, no isolation
6. **KF-11** source object (needs isolation) — GENERATED + REMOVE_BACKGROUND

Remaining assets in this manifest are CODE_NATIVE and are implemented directly as part of this pass (they do not require a FAL generation/QA cycle). Remaining GENERATED_ASSET / HYBRID_COMPOSITION rows not in the priority-6 list above are documented here as the **production backlog** for the next asset-generation pass — see KNOWN GAPS in the sprint conclusion.
