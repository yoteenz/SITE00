# RESPONSIVE MATRIX

Each viewport family is its own composition: panels declare a span per family, so nothing is a scaled-down desktop. There is no zoom and no transform scale.

| Family | Width | Grid | Hero | Typical composition |
|---|---|---|---|---|
| Desktop | ≥ 1120 | 12 columns; rows `--exf-rows-d` (2 fractional rows) | 150px (120px when height ≤ 760) | Main panels at 7–8 columns, with a 4–5 column inspector or overview column (authority left half) |
| Tablet | 700–1119 | 12 columns; rows `--exf-rows-t` (2–3 rows) | 150px (120px when height ≤ 760) | Two columns of 5–7 + 5–7, with full-width strips for curves, frames and flows (authority right half) |
| Mobile | < 700 | 6 columns; rows `--exf-rows-m` (3–4 rows) | 112px (74px and copy hidden when height ≤ 700) | Stacked full-width panels, plus half-width pairs (3 + 3) as in the mobile authority |

## Shared across all routes
- One host header (shared `ProductionWorkspaceHeader`).
- Hero band: breadcrumb, EXPRESSION, FAMILY / ROUTE (or record name on detail routes), tagline, and the project side list.
- Shared live status strip.
- Family tabs: child routes, or the downstream flow for 08–10.
- Panel grid.
- Bottom nav with EXPRESSION active.

## Per-viewport hides (explicit, never accidental)
| Panel `data-testid` | Hidden at | Reason / where the content lives instead |
|---|---|---|
| `casting-status-strip` | desktop, tablet | Desktop and tablet show the same counts in the Casting Overview |
| `casting-character-assets` | tablet, mobile | Authority asset ids. Tablet and mobile show continuity notes instead. |
| `look-root-variations` | mobile | All looks are listed on `/wardrobe/looks` |
| `performance-art` | mobile | Hub node art. The gate moves to `performance-gate`. |
| `performance-gate` | desktop, tablet | The gate actions sit inside `performance-art` |
| `sets-root-details` | tablet, mobile | Set details live on `/sets/sets` |
| `storyboard-sequence-approval` | desktop, tablet | Mobile-only "next sequence" control |

Measured at 390×844, 360×640, 1024×768, 1440×810 and 1280×720; see `NO_SCROLL_MATRIX.md`.
