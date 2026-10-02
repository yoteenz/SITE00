# 01_IDNTY_DIAGNOSTIC_OVERVIEW

- **Authority:** `02_IDNTY/00_DIAGNOSTIC/01_IDNTY_DIAGNOSTIC_OVERVIEW.jpg` (941×1672) — `authority.jpg` is the pack image resized to 390px wide.
- **Route:** `/idnty/state`  ·  **Component:** `IdentityDiagnosticOverview`
- **Render:** `render.jpg` (viewport) · `render-full.jpg` (full page)
- **Visual status:** **PARTIAL**  ·  **Structure:** complete

## Known mismatches
- State cards render 2×2 below 560px (authority: 4-up row, which is unreadable at 390px); 4-up from 560px.
- Card glyphs are simplified SVGs; authority cards carry richer line art.
- Overview machine is the 00 orb scaffold; authority adds node rings and a dais halo.
- INVESTMENT detail expands inline (VIEW DETAILS) — authority shows only the label.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).

## Structural questions
- Is a 2×2 mobile grid acceptable, or should the four cards scroll horizontally to keep one row?

## Functional notes
- Default highlight is 00 (visual only; context stays unselected until a tap). Resume banner preserved.

Asset slots: `ENV.IDNTY.ATRIUM`
