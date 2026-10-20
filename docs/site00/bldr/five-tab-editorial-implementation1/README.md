# SITE 00 Builder — five approved Blueprint tabs

Sprint `P0.SITE00.BUILDER.OPUS-FIVE-TAB-EDITORIAL-VISUAL-AUTHORITY-IMPLEMENTATION1` · branch
`claude/bldr-five-tab-editorial-authority-8d42xk` (from `main` `788e38a82`) · draft PR · not merged, not deployed.

## Product ownership

**SITE 00 customer-facing Digital Location Builder.** It is not IDNTY Digital Foundation and not its configurator, portal or review queue.

| | |
|---|---|
| Runtime route | `/bldr/studio/blueprint` (`SITE00_ROUTES.bldrSpatialStudio`), page `src/site00/pages/bldr/BldrSpatialStudioPage.tsx` |
| Shell | `src/site00/builder-studio/BuilderStudio.tsx` (unchanged) |
| Tabs | `src/site00/builder-studio/BlueprintRoom.tsx` (the five tab bodies) |
| Tab model | `src/site00/builder-studio/blueprintTabsModel.ts` (new, pure, tested) |
| Glyphs | `src/site00/builder-studio/icons.tsx` (hairline set extended) |
| Styles | `src/site00/styles/site00-builder-studio.css` (`05 BLUEPRINT · five tab layouts`) |
| Engine fix | `src/site00/builder-studio/buildObject/engine.ts` (`webglAvailable` probes once) |

**Branch choice.** No open builder PR existed. Every other `bldr-*` branch was either already merged (#1633) or 12–17 commits behind `main` with no tab work. PR #1671 (IDNTY living portal) is untouched.

**Review harness.** On `main`, `/foundation/review` still frames this builder through `/bldr/studio/…?reviewRoom=…`, so it resolves to the correct source. This sprint does not change that adapter.

## Reference mapping

Each tab is identified by its visible active tab, not by upload order.

| Tab | Reference composition | Implemented from source |
|---|---|---|
| 01 OVERVIEW | Intro · 4 metric cards · YOUR CONFIGURATION (4) · AT A GLANCE (4) | Build type, estimate window and investment, main experience (the contract's structure), config cards, pages/features/experience/pace. |
| 02 STRUCTURE | Intro · 4 part cards with glyph · AT A GLANCE · HOW IT FLOWS | FRONT DOOR / OFFER & ACTION / CLIENT SPACE / OPERATIONS LAYER from the chosen pages and capabilities. Each glyph is the Build Object with that part's real geometry lit (Blueprint anatomy). A part the build lacks says so. Build type, visual system, access model, production pace. The flow shows only the steps the build has. |
| 03 PAGES | Intro · stat strip · 4 grouped page cards · page notes | The contract's experiences grouped by purpose, with total, groups and private pages. Each page opens in place (what it is, its depth). |
| 04 FEATURES | Intro · stat strip · capability cards · how features work together | Effective capabilities, with what brought each one in. Payments and public + private come from the selection. Platform usage disclosure is kept. |
| 05 TIMELINE | Intro · standard / expedited · 5 phases · what affects timing | Estimator windows and investment. EXPEDITED appears only when the estimator offers it, otherwise its stated reason. The estimator's own nine phases are grouped into five, with who acts and whether they run alongside other work read from the engine. Then timing factors, ordering, next steps and the not-a-quote note. |

**Shared shell, kept as is:** header, saved status, menu, Build Object, model controls, tab indicator, tab bar, CONFIRM & SUBMIT / SAVE FOR LATER.

**Deliberate deviation.** The references show a per-tab "REVIEW SELECTIONS / REVIEW STRUCTURE …" button. The builder's existing CTA (CONFIRM & SUBMIT FOR REVIEW) is the functional source of truth, so it stays, shared under every tab, and no second CTA was added.

## Values are the builder's, not the image's

The references were drawn from the frozen review sample (ADVANCED · MODERN · PAGES + SHOP + PORTAL · STANDARD), and the builder reproduces their figures from source: 12 pages, 7 features, 6 – 14 months, $38,000 – $76,000, expedited 6 – 12 months. Other configurations, driven through the real rooms (not the sample), produce their own values:

| Configuration | Pages | Features | Window | Investment | Client space | Expedited |
|---|---|---|---|---|---|---|
| SIMPLE · EDITORIAL · PAGES + BLOG · FLEXIBLE | 5 | 1 | 8 – 14 weeks | $4,500 – $9,500 | not part of this build | not offered (estimator reason shown) |
| ADVANCED · BOLD · PAGES + BOOKING + MEMBER AREA · STANDARD | 8 | 4 | 4 – 6 months | $17,000 – $34,000 | yes | not offered |

Nothing shown is fabricated. One reference value was not available from source:

- **"WORKING STYLE: CONTENT-LED, OPERATIONALLY STRUCTURED"** (structure summary). Shown instead as **PRODUCTION PACE**, a real value.

## Client copy changelog

| Before | After |
|---|---|
| Structure: "ARCHITECTURAL MINIMAL · FULL EDITION", "MODERN GROTESK FROM SYSTEM" | Visual system name only. Typography, colour, imagery and motion are in a DESIGN DETAILS disclosure, with one plain line: they follow your direction unless changed at review. |
| Structure lead: raw level reasons | WHY THIS IS AN ADVANCED BUILD disclosure |
| Pages: every page labelled "FULL" | Depth shown only inside each page's detail, with its meaning ("EVERY STATE AND SUB-VIEW PEOPLE MEET.") |
| Features: "COMES WITH YOUR CHOICES" | "INCLUDED WITH SELL", "INCLUDED WITH DATA / PORTAL", etc. |
| Features: "CORE INCLUDED" list | "IN EVERY BUILD WEBSITE · MOBILE"; platform usage stays as a disclosure |
| Timeline: STANDARD / EXPEDITED / RANGE lines | Two cadence cards (the second only when offered), the client's choice marked |
| Timeline: dependency and next-step bullets | WHAT AFFECTS TIMING cards, plus WHAT HAS TO HAPPEN IN ORDER and AFTER YOU SUBMIT disclosures |

## Uppercase audit

- `.bs-root` was already `text-transform: uppercase`.
- All new static copy is authored in upper case. Contract strings (experience, capability, depth, dependency copy) are upper-cased at render.
- Inputs, textareas and the client's own typed note keep their case (`.bs-usertext`), so emails and notes are not altered.
- A browser audit of 35 captures found no visible lower-case text in the builder.
- A unit test checks every string the tab model hands to the screen, for four configurations.

## Assets

- **Build Object stills:** the stills on STRUCTURE and PAGES are the existing Build Object, rendered by the existing thumbnail renderer and lit by the existing Blueprint anatomy.
- **Icons:** new glyphs extend `icons.tsx` in its own hairline grammar (24-unit grid, 1.4 stroke).
- **No new artwork:** no generated imagery, photography or new 3D environment.

## Responsive

The tab panel is a size container, so modules reflow by the width the tab actually has:

- **Below 440px:** 2 × 2 metrics, single-column parts, pages and factors.
- **440px and up:** 4 metrics, 2-column parts and pages, side-by-side cadences.
- **560px and up:** 3-column features, 4-step flow, single-row phases.

Measured at 320, 390, 768, 834, 1024, 1440 and 1920: no document overflow, no overflowing panel text, one header.

## Model invariance and non-regression

- **Stage composition:** `compose(room, spec)` does not depend on the active tab.
- **Canvas kept:** in 35 captures across 7 widths, the same stage canvas element survived all five tab switches.
- **Tab switches cause no writes:** in the two real-flow runs, switching tabs sent zero save requests and left the header (saved status) unchanged.
- **Resume:** reloading restored the Blueprint for both real-flow configurations.
- **Context-loss fix:** at 1920px, switching tabs used to make the browser drop WebGL contexts. `webglAvailable()` opened a new, never-released context for every thumbnail, and browsers drop the oldest context beyond 16, which can be the stage. It now probes once per page and releases the probe.

## Evidence

- **Five tabs, three tiers:** `screens/` holds `01-overview` … `05-timeline` at `-390` (mobile), `-834` (tablet) and `-1440` (desktop).
- **Desktop panels:** at desktop the shell is one fixed screen with a scrolling tab column. `-1440.png` is that screen; `-1440-panel.png` is the column's full content, stitched from its own scroll.
- **Before:** `before/` holds the same five tabs at 390 on `main`.
- **Audits:** `audit-*.json` (overflow, lower-case, canvas identity, errors) and `flow-*.json` (real-flow runs, tab text, writes during tab switches, resume).

## Gates

| Gate | Result |
|---|---|
| Typecheck (`tsc --noEmit`) | pass |
| Builder + estimation + BLDR suites | 19 files, 193 passed, 1 skipped (pre-existing skip) |
| New tests | `blueprintTabsModel.test.ts` (14), `webglProbe.test.ts` (1) |
| Browser audit | 35 captures, 0 problems |

Founder visual approval is pending.
