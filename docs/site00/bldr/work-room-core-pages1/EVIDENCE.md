# WORK room · CORE PAGES INCLUDED — evidence

The captures are real React output from `/bldr/studio/work`, reached by driving rooms 01–03 in Chromium. Software
WebGL renders the Build Object, which stays visible in every full-room capture. The harness is
`audits/work-capture.cjs` and its raw results are `audits/work-*.json`.

## Required screenshots

| # | File |
|---|---|
| 01 | `screens/01-work-390-panel-expanded.png` |
| 02 | `screens/02-work-390-panel-collapsed.png` |
| 03 | `screens/03-work-390-group-expanded.png` (FRONT DOOR and STORY & OFFER open in place) |
| 04 | `screens/04-work-834.png` |
| 05 | `screens/05-work-1440.png` |
| 06 | `screens/06-work-1920.png` |
| 07 | `screens/07-minimum-configuration-390.png` (SIMPLE · PAGES: 5 pages, 2 groups, 0 private) |
| 08 | `screens/08-shop-portal-configuration-panel-390.png` (PAGES + SHOP + PORTAL) |
| 09 | `screens/09-alternate-booking-member-blog-390.png` (PAGES + BLOG + BOOKING + MEMBER AREA) |
| 10 | `screens/10-blueprint-pages-same-configuration.png` (the Blueprint PAGES tab for 01's selection: 12 / 4 / 4) |
| close-ups | `screens/11-panel-closeup-390.png`, `screens/12-panel-closeup-groups-open-390.png` |
| more configs | `13` all capabilities, `14` pages + shop, `15` pages + portal, `16` minimum collapsed, `17` alternate at 834 |
| other widths | `responsive/work-320.png`, `-430`, `-768`, `-1024` |

## Configurations (read from the live panel)

| Configuration | Pages | Groups | Private | Features (outlined = brought in) |
|---|---|---|---|---|
| SIMPLE · PAGES (minimum) | 5 | 2 | 0 | EDIT IT YOURSELF |
| ADVANCED · PAGES + SHOP | 8 | 2 | 0 | EDIT IT YOURSELF · SELL · (TAKE PAYMENT) |
| ADVANCED · PAGES + PORTAL | 9 | 4 | 4 | EDIT IT YOURSELF · DATA / PORTAL · (ACCOUNTS) · (DASHBOARD) · (TEAM ROLES) |
| ADVANCED · PAGES + SHOP + PORTAL | 12 | 4 | 4 | EDIT IT YOURSELF · SELL · DATA / PORTAL · (TAKE PAYMENT) · (ACCOUNTS) · (DASHBOARD) · (TEAM ROLES) |
| ADVANCED · PAGES + BLOG + BOOKING + MEMBER AREA | 8 | 3 | 1 | EDIT IT YOURSELF · MEMBERSHIP · BOOK · (ACCOUNTS) |
| ADVANCED · all six | 14 | 4 | 4 | EDIT IT YOURSELF · SELL · MEMBERSHIP · BOOK · DATA / PORTAL · (TAKE PAYMENT) · (ACCOUNTS) · (DASHBOARD) · (TEAM ROLES) |

## Behaviour

| Check | Result |
|---|---|
| Toggle SHOP off, then on (PAGES + SHOP + PORTAL) | 12 → 9 → 12 pages; SELL and TAKE PAYMENT leave and return; no stale values |
| Toggle BOOKING off, then on (alternate) | 8 → 7 → 8 pages; BOOK leaves and returns |
| WORK and Blueprint PAGES, same selection | counts equal in 4 of 4 configurations (12/4/4, 5/2/0, 8/3/1, 14/4/4); group titles and page lists identical |
| Expanding a group / collapsing the panel | 0 network writes at every width |
| Stage canvas | same element before and after every interaction, at every width |
| Leaving to the Blueprint and coming back to WORK (resume) | panel metrics identical |
| Six capability controls, CONTINUE | unchanged (same markup and handlers; the harness drives them) |

## Responsive audit (320 · 390 · 430 · 768 · 834 · 1024 · 1440 · 1920)

| Check | Result |
|---|---|
| Horizontal page overflow | 0 |
| Panel elements off-screen (incl. chevrons) | 0 |
| Overlapping icon / title / pages / chevron in a group row | 0 |
| Lower-case visible text | 0 |
| Smallest rendered type in the panel | 7px (6.8px at 320) — the same floor as the room's existing microtype |

Below a 300px panel width (320 phones), a group's pages move under its title instead of being cut short.

## Visual parity with the approved image (manual)

No pixel regression test was run against the reference, which is a mock-up, not a render. A manual comparison:

| Element | Match |
|---|---|
| Panel header, title top-left, collapse control top-right | yes |
| Metrics strip: three counts, stronger divider, two delivery cells with hairline icons | yes. The values come from the build. |
| Four group rows: icon cell with divider, red hairline icon, black title, muted page list, chevron | yes |
| INCLUDED WITH THIS SELECTION tokens | yes, as rounded labels. Brought-in features are outlined, to separate them from chosen ones. |
| Footer strip: icon, vertical divider, one muted line | yes |
| Room, model, six controls, CONTINUE | unchanged |
| Differences | "&" vs "+" in two group names, private count 4 vs 3, FEATURES-tab names, MOBILE READY (all explained in README) |

## Tests

| | |
|---|---|
| New | `src/site00/builder-studio/coreIncluded.test.ts`, 7 tests. They cover counts against the Blueprint view for six configurations, grouping, private count, features (unique, chosen first, dependencies attributed), delivery wording, footer copy, upper case, a legacy draft, estimator invariance, and that the panel source no longer renders COMES_WITH notices and does not write on expand. |
| Builder + estimation + BLDR suites | 21 files, 211 passed |
| `tsc --noEmit` | pass |
| `vite build` | pass (`verify-production-dist: OK`) |

Founder visual approval is pending.
