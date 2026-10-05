# No-scroll matrix

**Available workspace = viewport height − top host − Design mode bar − bottom Production nav** (`avail`).

**PASS** means the authority scroll area's `scrollHeight − clientHeight ≤ 1` and the document does not overflow.

The data is a live Playwright run on localhost: `NO_SCROLL_REPORT.json` (after) and `NO_SCROLL_REPORT_BEFORE.json` (base `37d19680`). Each cell shows:
- the result
- page overflow before → after
- DOCUMENT_SCROLL_HEIGHT / CLIENT_HEIGHT of the scroll area
- available height, and the chamber / pipeline / table heights

| mode | mobile 390×844 | mobile-short 360×640 | tablet 1024×768 | desktop 1440×810 | desktop-min 1280×720 |
|---|---|---|---|---|---|
| BRAND | PASS · before +0px → after +0px · 702/702 · avail 702 · chamber 340 / pipe 115 / table 164 | PASS · before +79px → after +0px · 506/506 · avail 506 · chamber 241 / pipe 89 / table 176 | PASS · before +0px → after +0px · 613/613 · avail 613 · chamber 340 / pipe 119 / table 106 | PASS · before +0px → after +0px · 645/645 · avail 645 · chamber 360 / pipe 125 / table 106 | PASS · before +12px → after +0px · 555/555 · avail 555 · chamber 334 / pipe 115 / table 106 |
| EXPERIENCE | PASS · before +0px → after +0px · 702/702 · avail 702 · chamber 340 / pipe 107 / table 164 | PASS · before +59px → after +0px · 506/506 · avail 506 · chamber 253 / pipe 89 / table 164 | PASS · before +0px → after +0px · 613/613 · avail 613 · chamber 340 / pipe 119 / table 106 | PASS · before +0px → after +0px · 645/645 · avail 645 · chamber 360 / pipe 125 / table 106 | PASS · before +12px → after +0px · 555/555 · avail 555 · chamber 334 / pipe 115 / table 106 |
| SURFACES | PASS · before +0px → after +0px · 702/702 · avail 702 · chamber 340 / pipe 107 / table 164 | PASS · before +59px → after +0px · 506/506 · avail 506 · chamber 253 / pipe 89 / table 164 | PASS · before +0px → after +0px · 613/613 · avail 613 · chamber 340 / pipe 119 / table 106 | PASS · before +0px → after +0px · 645/645 · avail 645 · chamber 360 / pipe 125 / table 106 | PASS · before +12px → after +0px · 555/555 · avail 555 · chamber 334 / pipe 115 / table 106 |
| COMPILER | PASS · before +0px → after +0px · 702/702 · avail 702 · chamber 340 / pipe 107 / table 176 | PASS · before +79px → after +0px · 506/506 · avail 506 · chamber 233 / pipe 97 / table 176 | PASS · before +3px → after +0px · 613/613 · avail 613 · chamber 340 / pipe 119 / table 123 | PASS · before +0px → after +0px · 645/645 · avail 645 · chamber 360 / pipe 125 / table 106 | PASS · before +12px → after +0px · 555/555 · avail 555 · chamber 334 / pipe 115 / table 106 |
| ASSETS | PASS · before +0px → after +0px · 702/702 · avail 702 · chamber 340 / pipe 107 / table 164 | PASS · before +59px → after +0px · 506/506 · avail 506 · chamber 253 / pipe 89 / table 164 | PASS · before +0px → after +0px · 613/613 · avail 613 · chamber 340 / pipe 119 / table 106 | PASS · before +0px → after +0px · 645/645 · avail 645 · chamber 360 / pipe 125 / table 106 | PASS · before +12px → after +0px · 555/555 · avail 555 · chamber 334 / pipe 115 / table 106 |
| VIEWPORT | PASS · before +0px → after +0px · 702/702 · avail 702 · chamber 340 / pipe 56 / table 172 | PASS · before +106px → after +0px · 506/506 · avail 506 · chamber 278 / pipe 56 / table 172 | PASS · before +0px → after +0px · 613/613 · avail 613 · chamber 340 / pipe 40 / table 129 | PASS · before +0px → after +0px · 645/645 · avail 645 · chamber 360 / pipe 40 / table 129 | PASS · before +18px → after +0px · 555/555 · avail 555 · chamber 360 / pipe 40 / table 129 |

**Before: 18/30 PASS.**
- Every mode failed at 360×640 (59–106px).
- Every mode failed at 1280×720 (12–18px).
- COMPILER failed on tablet (3px).

**After: 30/30 PASS.**

How it holds (`site00-production-design-pack.css`):
- The Design body fills the frame exactly (`.pxa[data-screen^='design-']`).
- `.pxa-design` is a column. Pipeline and On Your Table take their natural height, and the spatial chamber flexes (`flex: 1 1 var(--ch-h)`, `min-height: 0`) up to an authored ceiling (360 / 340 / 340).
- Short viewports compact the pipeline (stage renders 26px, no sub-captions) and table art instead of growing the page.
- No contained region scrolls on the parent modes. The only internal scroller is the VIEWPORT device stage, which scales to fit and does not scroll.

## Proportions (BRAND; the other content modes match)
| family | hero | pipeline | table |
|---|---|---|---|
| mobile (390×844) | 340px · 48% | 115px · 16% | 164px · 23% |
| tablet (1024×768) | 340px · 55% | 119px · 19% | 106px · 17% |
| desktop (1440×810) | 360px · 56% | 125px · 19% | 106px · 16% |
| desktop-min (1280×720) | 334px · 60% | 115px · 21% | 106px · 19% |
| mobile-short (360×640) | 241px · 48% | 89px · 18% | 176px · 35% |

Targets were hero 45–55%, pipeline 16–20% and table 18–24%. Measured:
- **Mobile 390×844:** within all three targets (48 / 16 / 23%).
- **Tablet:** hero 55% and pipeline 19% are on target; the table is 17%, one point under.
- **Desktop 1440×810:** hero 56%, one point over; pipeline 19%; the table is 16%, two points under.
- **1280×720:** hero 60%. The pipeline and table cannot shrink further without losing their labels.
- **360×640:** hero 48%. The table takes 35%, because three table cards keep a readable minimum.

All three regions are visible at first glance in every case. The deviations are the residual cost of a fixed table-card minimum.
- **VIEWPORT** is structurally different (its pipeline is a stage strip), as the brief allows.
