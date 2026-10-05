# 05_FOUNDATION_REVIEW

- **Authority:** `02_IDNTY/01_FOUNDATION/05_FOUNDATION_REVIEW.jpg` (1080×1920) — `authority.jpg` is the pack image resized to 390px wide.
- **Route:** `/idnty/starting-at-zero/review`  ·  **Component:** `IdentityDiagnosticFlow(mode=review)`
- **Render:** `render.jpg` (viewport) · `render-full.jpg` (full page)
- **Visual status:** **PARTIAL**  ·  **Structure:** complete

## Known mismatches
- Audience copy is the user's own text (authority shows a sample); small EDIT links added (authority has none) to preserve edit-from-review function.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

## Functional notes
- SUBMIT IDENTITY ASSESSMENT now submits via the existing endpoint; incomplete → routes to first missing question; failure stays on review.

Asset slots: `ENV.IDNTY.ATRIUM`
