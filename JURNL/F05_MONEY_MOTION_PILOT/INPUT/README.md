# JURNL / F05 MONEY — parent-only motion pilot (V0)

## Purpose
Test whether **SIDEKICK environment + movable collage elements + live, real-data-bound UI** is a technically and creatively viable method *before* authoring the Opus implementation sprint and before designing child pages.

## Source of truth
- `reference/approved_parent.png` is the founder-approved **static composition** for the F05 MONEY parent. It is the visual target, not a flattened runtime component.
- The original five-item global nav remains **HOME / MONEY / ADD / PLAN / CREDIT**. MONEY is active on all F05 routes.
- Plain non-cursive labels **UPPERCASE**. Handwritten/cursive copy **lowercase**.
- CASH ON HAND occupies two lines.
- Numerical data in the references is illustrative only.

## Included
| File | Status | Use |
| --- | --- | --- |
| `reference/approved_parent.png` | approved founder image | final visual target |
| `reference/asset_system_study.png` | generated reference board | segmentation / effects / overlay direction only |
| `assets/sidekick_preview_crop.png` | **LOW-RES preview extracted from generated study** | prototype environmental backdrop, text-free, not production authority |
| `prototype.html` | stand-alone interactive test | staged entrance, account selection, overlays, reduced motion, nav |
| `asset_manifest.json` | executable asset plan | what must be generated or reconstructed separately |
| `MOTION_AND_INTERACTION_SPEC.md` | implementation-ready design intent | states, timing, accessibility, event invariants |

## Crucial limitations
1. The generated board visually *depicts* isolated layers; **it does not provide authentic standalone transparent PNGs**. No transparent pack is claimed.
2. `sidekick_preview_crop.png` is a **cropped low-resolution approximation**, not a high-resolution, pixel-matched SIDEKICK. It contains no intentional text/UI, but must be regenerated/reconstructed at native resolution before production.
3. The HTML is a **motion and hierarchy prototype**, not a pixel-perfect rendition or a connected SITE00 implementation. Static illustrative balances must be replaced with repository selectors in the real application.
4. For a production match, extract/reconstruct the approved composition into (a) text-free environment, (b) independently moveable foreground with verified alpha, (c) noninteractive paper textures, (d) live UI. Compare a zero-motion composite against the approved authority. Do not claim fidelity until verified.
5. No actual account transfer, income, balance mutation, payment, navigation, or persistence is performed by the prototype.

## Run
Open `prototype.html` in a browser, or run `python -m http.server` from this directory and open `/prototype.html`. Buttons show states without mutating finances.

## Pilot acceptance gate
- Background contains no financial text, money amounts, or controls.
- All tappable text and values are actual DOM text.
- Five global nav items stay fixed; MONEY active.
- Account paper responds to keyboard and pointer; overlays are closable and understandable.
- Motion is optional and disabled by `prefers-reduced-motion`.
- No animation can make a pending transfer appear received.
- No accidental horizontal/vertical page scroll on target mobile; overlay may scroll internally.
- Every layered production asset has transparent alpha or is explicitly non-movable/background.
- Distinguish static resemblance from runtime functionality.
