# Creative direction and page value — evidence

All captures are real React output from `/bldr/studio/blueprint`. Each configuration was reached by driving rooms
01–04 in Chromium, not with the frozen review sample. The harness is `audits/ci-capture.cjs`; raw results are in
`audits/ci-*.json` (390 · 834 · 1440) and `audits/audit-ci-*.json` (320 · 768 · 1024 · 1920).

## STRUCTURE · configurations A / B / C

All three are ADVANCED (editorial structure) with PAGES + SHOP · STANDARD; only the feel differs.

| | Mobile 390 | Tablet 834 | Desktop 1440 (screen / full column) | Rows with IN DETAIL open |
|---|---|---|---|---|
| A · IMMERSIVE | `screens/structure-config-A-390.png` | `-834` | `-1440`, `-1440-panel` | `structure-config-A-390-direction-in-detail.png` |
| B · BOLD | `screens/structure-config-B-390.png` | `-834` | `-1440`, `-1440-panel` | `structure-config-B-390-direction-in-detail.png` |
| C · EDITORIAL | `screens/structure-config-C-390.png` | `-834` | `-1440`, `-1440-panel` | `structure-config-C-390-direction-in-detail.png` |

Values read from the rendered rows:

| | A | B | C |
|---|---|---|---|
| TYPOGRAPHY | EXPRESSIVE DISPLAY + RESTRAINED BODY · OUR RECOMMENDATION | CONDENSED DISPLAY · OUR RECOMMENDATION | EDITORIAL SERIF · OUR RECOMMENDATION |
| COLOR DIRECTION | DEEP CINEMATIC · OUR RECOMMENDATION | SATURATED EDITORIAL · OUR RECOMMENDATION | WARM MINERAL · OUR RECOMMENDATION |
| IMAGE WORLD | 3D / SPATIAL · YOUR SELECTION | EDITORIAL COLLAGE · OUR RECOMMENDATION | PRODUCT-LED · OUR RECOMMENDATION |
| MOTION | CINEMATIC · YOUR SELECTION | KINETIC · OUR RECOMMENDATION | EDITORIAL · OUR RECOMMENDATION |
| COMPOSITION | WIDE FRAMES, SEQUENCES, ONE SUBJECT AT A TIME | EDITORIAL STRUCTURE WITH BIG GRAPHIC MOVES | TYPE-LED PAGES WITH ONE PHYSICAL OBJECT AS THE FOCAL POINT |

FROM YOUR BRAND and TO BE REFINED cannot be produced in the live rooms: brand is always IN PROGRESS there, and a
custom direction leaves the creative rows open. Both are covered by the source tests (D, E).

## PAGES · disclosures and capability variation

| Configuration | Full tab | Opened pages (390) |
|---|---|---|
| ADVANCED · PAGES + SHOP + PORTAL | `screens/pages-shop-portal-390.png`, `-834`, `-1440`, `-1440-panel` | `page-home-…`, `page-about-…`, `page-shop-…`, `page-account-…`, `page-dashboard-shop-portal-390.png` |
| ADVANCED · PAGES + BOOKING + MEMBER AREA | `screens/pages-booking-member-390.png`, `-834` | `page-home-…`, `page-about-…`, `page-booking-…`, `page-account-booking-member-390.png` |
| SIMPLE · PAGES (ESSENTIAL depth) | `screens/pages-simple-pages-only-390.png` | `page-home-simple-390.png` |

How the same pages change with the features:

| Page | SHOP + PORTAL | BOOKING + MEMBER AREA | SIMPLE · PAGES |
|---|---|---|---|
| HOME includes | … FEATURED PRODUCTS · … A SIGN-IN FOR PEOPLE WHO RETURN | … A WAY TO BOOK FROM THE FIRST SCREEN · … A SIGN-IN FOR PEOPLE WHO RETURN | AN OPENING THAT SAYS WHAT YOU DO · ONE CLEAR NEXT STEP |
| ACCOUNT includes | … ORDER HISTORY · LINKS INTO THEIR RECORDS | … THEIR BOOKINGS · THEIR MEMBERSHIP; scope note: ORDER HISTORY not in this build | — |
| CONTACT | scope note: BOOKING FROM THIS PAGE not in this build | includes A LINK STRAIGHT INTO BOOKING | ESSENTIAL: form and reply expectations |
| SHOP | scope note: SEARCH AND FILTERING not in this build | — | — |
| DASHBOARD | scope note: ANALYTICS not in this build | — | — |

## Audit across all runs (7 widths × 6 configurations)

| Check | Result |
|---|---|
| Horizontal page overflow | 0 |
| Panel text past the viewport / clipped text | 0 / 0 |
| Direction label overlapping its source or value | 0 (also with every IN DETAIL open) |
| Lower-case visible text | 0 |
| Stage canvas replaced during the run | never |
| Writes while switching all five tabs | 0, header unchanged |
| Reload (resume) | Blueprint restored, seven direction rows present |
| Page errors | 0 |

## Source tests (`designResolution.test.ts`)

| Sprint check | Test |
|---|---|
| A structure / aesthetic separate | `A — structure and aesthetic are separate` |
| B three editorial configurations differ | `B — …` (value and explanation per dimension, plus the live A/B/C) |
| C explicit choices override, F a tunable changes the Blueprint | `C / F — …` |
| D brand-sourced values labelled | `D — …` |
| E undecided not invented, no machine strings | `E — …` |
| G page purposes distinct, H depth page-specific | `G / H — …` (all 30 pages, all three depths) |
| I feature dependencies change copy, J no unsupported promises | `I / J — …` (search, order history, booking, analytics, documents) |
| K legacy configurations | `K — …` (seven legacy builder samples, a partial pre-feel draft) |
| L estimates source-grounded | `L — …` (estimator output identical; resolvers import nothing from it) |
| M no writes on tab switch | browser audit above |
| N upper case | `E — …` plus the existing tab-model test |
| O IDNTY unchanged | `git diff origin/main` touches only `src/site00/builder-studio/*`, the builder stylesheet and these docs |

## Visual parity

No pixel regression test was run. Manual comparison against the five approved tab references:

- **Unchanged:** shell, model, tab bar, part cards, AT A GLANCE, HOW IT FLOWS, page-group cards and the other three
  tabs.
- **STRUCTURE:** gains a CREATIVE DIRECTION section in the tab's own grammar: section heading, hairline rows,
  microlabels, no cards or badges.
- **PAGES:** each page row gains a muted purpose line, and its detail is labelled.

Founder visual approval is pending.
