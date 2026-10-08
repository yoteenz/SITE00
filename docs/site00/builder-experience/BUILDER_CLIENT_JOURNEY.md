# Builder client journey

The full journey, then the four paths: **SIMPLE**, **ADVANCED**, **CUSTOM** and **WORLD**. Each path is a working example in `src/site00/builder-experience/samples.ts`, and tests prove its behaviour (`builderExperience.test.ts`).

The client never picks a "build level" from a menu. They choose what they want. The Builder derives the lowest build level that honours every choice (`deriveBuildLevel`) and shows the reason for each step up. A client who said "keep it simple" sees those reasons as decisions to make, never as a silent upgrade.

## 1. Full journey

```
ENTRY ─ "WHAT ARE YOU BUILDING?"            (BLDR hub, existing entry)
  │
  ├─ I · THE PLACE
  │    01 BUILD ............ SITE · WORLD · SYSTEM · HYBRID · (NOT SURE → describe it)
  │    02 STRUCTURE ........ 8 site grammars  ─or─  WORLD FORM: 9 world forms
  │                          (HYBRID: both, one after the other)
  │
  ├─ II · THE FEEL
  │    BRAND ............... READY · IN PROGRESS · NOT YET (→ IDNTY, separate)
  │    03 EXPRESSION ....... 6 visual systems + NONE OF THESE
  │                          primary + one secondary influence; I LIKE PARTS OF THIS
  │    04–07 TUNE .......... type · colour · image world · motion
  │                          (Simple: hidden, "from system"; Advanced/Custom: open)
  │
  ├─ III · THE WORK
  │    08 FEATURES ......... capabilities as verbs; COMES WITH shown, never silent
  │    09 FAMILIES ......... experiences pre-assembled from structure + features; depth per experience
  │
  ├─ IV · THE PACE
  │    10 DELIVERY ......... STANDARD · PRIORITY (only where it helps) · A DATE I NEED
  │
  └─ REVEAL
       11 BLUEPRINT ........ "the project has taken shape"
       12 ESTIMATE ......... INITIAL RANGE → send to SITE 00 → REFINED RANGE after review
```

What the client sees at each moment:

| Moment | Visible | Hidden on purpose |
|---|---|---|
| Rooms I–IV | Options, schematics, specimens, the Blueprint sheet, scope words (LIGHT…EXPANSIVE), build level | Money, dates |
| Blueprint | Every choice, open decisions, scope, build level, what is included | Money, dates (one tap away) |
| Estimate | Window, investment, delivery comparison, inclusions, review structure, dependencies, assumptions, next steps | Family units, raw weeks, lanes, coefficients |
| After review | REFINED RANGE; live range deltas while editing | Same |

## 2. SIMPLE path

**Who it is for:** someone who wants a good site soon and does not want to make forty decisions.

**Example:** `SAMPLE_SIMPLE_SERVICE`, a practice site in the Service grammar with Architectural minimal (essential edition) and self-editing.

| # | Screen | What the client does |
|---|---|---|
| 1 | BUILD | Taps SITE. |
| 2 | STRUCTURE | Compares SERVICE with HOSPITALITY, chooses SERVICE. |
| 3 | BRAND | READY (or IN PROGRESS, which adds "the visual system follows your brand"). |
| 4 | EXPRESSION | Chooses ARCHITECTURAL MINIMAL. The edition stays ESSENTIAL. TYPE · COLOR · IMAGE · MOTION show "from system"; a quiet link reads "ADJUST TYPE, COLOUR, IMAGE OR MOTION". |
| 5 | FEATURES | Picks EDIT IT YOURSELF. Every SIMPLE-safe verb is visible. Verbs that need an Advanced build are marked "ADVANCED". |
| 6 | EXPERIENCES | Accepts the pre-assembled set: FRONT DOOR (home, about, contact) · SERVICES · PROOF. JOURNAL is offered but off. Depth is ESSENTIAL. |
| 7 | DELIVERY | STANDARD. PRIORITY is shown as not available: "your project already runs at full concurrency". |
| 8 | BLUEPRINT → ESTIMATE | Sees the Blueprint, then the INITIAL RANGE. |

That is eight screens, and a confident client can finish in under five minutes. The scope meter stays LIGHT and the level stays SIMPLE BUILD.

**Simple guard rails:**
- **Choices that raise the level.** If a keep-it-simple client chooses something that needs an Advanced build (SELL, MEMBERSHIP, a secondary influence, kinetic motion), the Builder shows a decision card. It reads: *"SELL is part of an advanced build. Keep it (ADVANCED BUILD) · Remove it · Ask SITE 00."* (With estimator 1.0.0 there is no simple way to take money: payments are advanced-only. See finding E8.)
- **Liked parts.** A single liked part ("the type of Editorial object") is noted for the creative team. It does not change scope.
- **Booking.** Booking is available at every level, so a simple restaurant site with booking stays SIMPLE BUILD (`SAMPLE_SIMPLE_HOSPITALITY`).

## 3. ADVANCED path

**Who it is for:** a client with a clear point of view who wants the system developed for them, and more of what the place does.

**Example:** `SAMPLE_ADVANCED_EDITORIAL`, an editorial publication with Architectural minimal as primary, Editorial object as secondary influence, full edition, editorial serif type and membership.

**What opens:**
- **Edition.** A FULL edition toggle on the expression: "developed for your project".
- **Tuning.** TYPE, COLOR, IMAGE WORLD and MOTION become their own screens, each shown in context on the client's chosen structure.
- **Secondary influence.** "ADD AS INFLUENCE" on a second system.
- **Advanced capabilities.** MEMBERSHIP, COMMUNITY, DASHBOARD, TEAM ROLES and DOCUMENTS are available.
- **Experience depth.** FULL by default, with EXTENSIVE available per experience.
- **Viewports.** PHONE · TABLET · DESKTOP or ADAPTIVE, where layouts change role by device.

The Blueprint names the reason for the level: "A secondary influence blends two systems. Membership is part of an advanced build."

## 4. CUSTOM path

**Who it is for:** a client for whom none of the systems is right, or who keeps reaching across three or more of them.

**Ways in:**
1. **NONE OF THESE · BUILD SOMETHING CUSTOM** on the expression rail (`SAMPLE_CUSTOM_COMMERCE`).
2. **Three or more systems.** One secondary influence plus two or more liked facets from a third system leads to "You are drawing on three or more systems. That becomes a custom creative direction."
3. **A custom-only capability**, such as MARKETPLACE.

**What changes:**
- **The room heading.** It becomes **CUSTOM CREATIVE DIRECTION**, written as an invitation: *"Tell us what none of these got right. Bring references, words, anything."* A free-text note (`customDirectionNote`) is offered, along with a reference shelf: everything the client KEPT or LIKED PARTS OF so far.
- **Tuning.** All four layers stay open, and CUSTOM motion is available.
- **The estimate.** It says *"A custom creative direction, developed with you"* instead of "three directions from your choices".
- **Scope.** The scope meter carries a CUSTOM DIRECTION tag. Custom describes creative direction, not size, so a small custom site can still read LIGHT or MODERATE.

Custom is never framed as "you didn't fit". The copy treats it as the most personal path.

## 5. WORLD path

**Who it is for:** a client making a place to explore, not a set of pages.

**Example:** `SAMPLE_WORLD_SHOWROOM`.

When WORLD is chosen, the Builder changes shape. STRUCTURE is replaced by WORLD, and FAMILIES is replaced by the world's places. Every world dimension is asked in human words:

| Builder question | Choices | Maps to estimator |
|---|---|---|
| WHAT FORM IS IT? | Estate · Promenade · Hub · District · Sanctuary · Showroom · Social · Story · Hybrid world (map schematics) | `archetypeId` |
| HOW MANY PLACES? | A few · Several · Many | `zoneCount` 4 / 8 / 13 |
| HOW MANY MOMENTS? | A few · Many · Cinematic | `sceneCount` 4 / 10 / 20 |
| WHAT CAN PEOPLE DO? | Look · Touch · Play | `interactionCount` 3 / 10 / 24 |
| WHO LIVES THERE? | Nobody · Guides · Characters · Crowds | `inhabitantComplexity` NONE / LIGHT / STANDARD / HEAVY |
| DOES IT CHANGE? | Still · Time of day · Living | `stateCount` 1 / 3 / 8 |
| HOW DEEP? | Flat & illustrated · Layered · Dimensional · Fully 3D | `threeDAssetLoad` NONE / LIGHT / STANDARD / HEAVY |
| HOW DO PEOPLE FIND THEIR WAY? | Guided path · Free roam · Both | `navigationComplexity` SIMPLE / STANDARD / ADVANCED |

**Rules:**
- **Build level.** A world is at least an ADVANCED BUILD ("a world is designed as a place, not a set of pages").
- **Depth.** DIMENSIONAL or FULLY 3D adds 3D production. The visual system becomes spatial.
- **Preview.** The PREVIEW toggle gains SPACE. Until a spatial asset exists, the stage shows the world map schematic.
- **World estimates.** The estimate carries "World estimates are refined during Blueprint review", because the estimator marks world weights as calibration-needed.

**A world inside a site.** A site client can add **A WORLD INSIDE** as a capability. The build becomes HYBRID (SITE + WORLD) and the world questions open after the site's structure.

## 6. SYSTEM and HYBRID

- **SYSTEM** leads with the Portal grammar. Accounts and the data portal come with it, and the experiences start from ENTRY · DASHBOARD · RECORDS · ACCOUNT · SETTINGS (`SAMPLE_SYSTEM_PORTAL`). Industrial command is the usual expression, but any system can be chosen.
- **HYBRID** asks for the parts (two or three of SITE, WORLD, SYSTEM). The Builder then walks each part's room in turn. A HYBRID structure takes a primary and a secondary grammar (`SAMPLE_LARGE_HYBRID`: a practice site with a members platform).

## 7. NOT SURE

The existing BLDR "NOT SURE?" discovery stays as the entry for clients who want to describe instead of choose. Its result should land the client in Room I with BUILD and STRUCTURE pre-selected, so they continue visually. Wiring that is part of the implementation sprint.
