# SITE 00 Builder — WORK room · CORE PAGES INCLUDED

Sprint `P0.SITE00.BUILDER.WORK-ROOM.CORE-PAGES-INCLUDED-OPUS-VISUAL-AUTHORITY-IMPLEMENTATION1` · branch
`claude/bldr-five-tab-editorial-authority-8d42xk` · draft PR · not merged, not deployed.

## Branch state verified before editing

| | |
|---|---|
| #1672 (Opus five tabs) | merged into `main` (`e87366155`) before these sprints. This branch continues it. |
| #1674 (Composer intelligence) | squash `44c0c7b44` plus a provenance merge of its original head `7e5df340c` (`82437cb87`), both on this branch. The integration was not repeated. |
| Branch head before this sprint | `c7c0697a6`, which contains the creative-direction / page-value sprint |
| Other builder work | no other open builder PR; the only open PR in the repo is #1670 (IDNTY, untouched) |

## Source

| What | Where |
|---|---|
| Room 03 controls (panel lives here) | `src/site00/builder-studio/rooms.tsx` → `WorkControls` |
| Six capability controls (unchanged) | `rooms.tsx` → `WorkStageToggles`, `studioModel.ts` → `WORK_MODULES` |
| Page catalogue | `builder-experience/registry.ts` `EXPERIENCES` via `chosenExperiences()` |
| Grouping and private classification | `blueprintTabsModel.ts` `PAGE_GROUPS` / `pagesView()`: the contract's experience groups; SIGNED IN and BEHIND THE SCENES are the private ones |
| Features and what brings them in | `effectiveCapabilities()` → `featuresView()` (`includedWith`) |
| Delivery | `selection.build` and `selection.viewports` |
| New panel view | `blueprintTabsModel.ts` → `coreIncludedView()` |

`coreIncludedView()` is composed from `pagesView()` and `featuresView()`, the same views the Blueprint PAGES and
FEATURES tabs render. The WORK room and the Blueprint therefore cannot disagree on counts, groups or features. A
test asserts `coreIncludedView(s).pages` equals `pagesView(s)`.

## What changed in the panel

| Before | After |
|---|---|
| Two fixed tiles, WEBSITE and MOBILE, the same for every build | Metrics strip: pages, groups, private, then delivery from the selection (WEBSITE · MOBILE READY for a phone + desktop site). The contract has no native app, so nothing claims one. |
| "PAGES HOME · ABOUT · …", one long string | Four purpose rows: red hairline icon, title, the pages in that group. Each opens in place to list every page with its one-line purpose (from the page-value engine). |
| "ADDED PAGES · SHOP · PORTAL" | INCLUDED WITH THIS SELECTION: every feature once, by its FEATURES-tab name. Chosen ones are filled; the ones they bring in are outlined, and their label and title say what brings them in. |
| "+ TAKE PAYMENT · + ACCOUNTS · + DASHBOARD · + TEAM ROLES" | One footer line, e.g. "EACH CAPABILITY ADDS ITS OWN PAGES. OUTLINED FEATURES COME WITH SELL AND DATA / PORTAL." |

The dependency rules themselves are untouched; only their presentation changed. `builderNotices()` still produces
COMES_WITH notices for the rest of the builder.

The panel opens expanded, as the reference shows it, and collapses to a one-line summary (for example
"12 PAGES · 4 GROUPS · 7 FEATURES"). Opening the panel or a group is local state: no write, no reload of the Build
Object.

## Deliberate differences from the reference image

- **Group names: "STORY & OFFER", "TEAM & ACCESS".** The reference shows "+". The founder-approved Blueprint PAGES tab
  uses "&", and both surfaces read one `PAGE_GROUPS` source, so they use one spelling. Choosing "+" everywhere is a
  one-line change to `PAGE_GROUPS`, and it is the founder's call.
- **PRIVATE count.** The reference shows 3 for this build. The canonical classification counts the CLIENT SPACE pages
  (records, account, dashboard) and PEOPLE AND ROLES, so the build reads 4. The reference values are illustrative.
- **Feature names.** The reference tokens read SHOP · PORTAL · PAYMENTS · ACCOUNTS · DASHBOARD · TEAM ACCESS. The panel
  uses the names the FEATURES tab already shows: EDIT IT YOURSELF · SELL · DATA / PORTAL · TAKE PAYMENT · ACCOUNTS ·
  DASHBOARD · TEAM ROLES. EDIT IT YOURSELF is real (it comes with PAGES), so it is shown.
- **MOBILE becomes MOBILE READY.** The build is one website laid out for phones, as the sprint asks to state.

## Evidence

See `EVIDENCE.md`.
