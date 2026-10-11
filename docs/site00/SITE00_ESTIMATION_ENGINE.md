# SITE 00 estimation engine

Version `1.0.0`. Code: `src/studioos/estimation/`.

This is the internal production-estimation engine for SITE, WORLD, SYSTEMS, and EXTENSIONS. A client configuration produces a **projected estimate**. It does not produce a quote, a locked schedule, or an approval.

Public product language stays as it is. SIMPLE BUILD, CUSTOM BUILD, and IDENTITY are not renamed. ADVANCED is a production level between those two offers.

## Family Unit

1 Family Unit (FU) is about 2 weeks of raw production capacity for a standard family, before lanes compress the calendar.

FU is an internal metric. The client view does not say “family units.”

`RAW PRODUCTION WEEKS = TOTAL FU × familyUnitWeeks`

`familyUnitWeeks` defaults to 2 and lives in `assumptions.ts`.

## What is summed

A family is not a page.

```
FAMILY TOTAL =
  class weight
  + descendant modifier
  + responsive fraction of the class weight
  + visual fraction of the class weight

PROJECT FU =
  sum of family totals
  + feature modifiers
  + world scope
  + extra system surfaces
```

Class weights:

| Class | FU |
| --- | --- |
| LIGHT | 1.0 |
| STANDARD | 1.5 |
| ADVANCED | 2.0 |
| SYSTEM | 2.75 (band 2.5–3.0) |
| WORLD | 3.5 (band 3.0–4.0, open above that) |

Descendant modifiers, on top of the class:

| Descendants | FU |
| --- | --- |
| 0–5 | 0 |
| 6–10 | 0.25 |
| 11–20 | 0.50 |
| 21–35 | 1.00 |
| 36+ | 1.50 and custom scope |

## Build levels

- **SIMPLE** — approved structure, approved visual system, limited custom behavior.
- **ADVANCED** — the structure is a start. Deeper composition, custom interaction, more systems.
- **CUSTOM** — the chassis is internal. The authority is bespoke.

## Structural grammars and worlds

SITE grammars: Editorial, Gallery, Commerce, Service, Portal, Hospitality, Community, Hybrid.

WORLD grammars: Estate, Promenade, Hub, District, Sanctuary, Showroom, Social, Story, Hybrid world.

A grammar is not a theme and does not add FU by itself. Families, systems, and world scopes do.

World scope uses zone, scene, interaction, inhabitant, state, 3D load, and navigation. Those weights are marked calibration-needed. They are not a published world price.

## Visual systems

The registry holds Editorial Object, Architectural Minimal, Cinematic Luxury, Soft Organic, Industrial Command, and Pop Editorial.

No sample images are invented. Preview fields are empty until a real authority exists.

Visual complexity (template-led through spatial world) changes authority, asset, QA, and responsive effort. The fractions are in `assumptions.ts`.

## Lanes, serial work, and the calendar

Raw weeks are not the calendar.

Standard delivery uses up to 2 lanes. Priority uses up to 4 when the dependency graph allows it. A small project, or a project waiting on an integration, cannot fill every lane.

About 22% of raw production is serial (inception, blueprint, brand lock, integration, final QA, launch). The rest can split across lanes. Client review sits outside the lanes.

```
STUDIO ELAPSED = SERIAL WEEKS + PARALLEL WEEKS / EFFECTIVE LANES
CALENDAR = STUDIO ELAPSED + REVIEW BUFFER
```

Review buffer = review rounds × SLA days × milestone count / 5.

Default SLA is 2 business days. Default rounds are 2. A late client review moves the calendar. That is written on the estimate.

The result is a range. Early confidence is wide. Blueprint is tighter. Locked confidence is tight. Locked confidence is not a locked schedule. A locked schedule is an explicit document state.

## Priority production

Canonical language is **priority production**, not rush.

Default price multiplier is 1.85 (allowed band 1.75–2.0). Extra lanes compress the parallel portion only. Serial work stays. The engine does not treat double price as half time. If the graph cannot take more lanes, the founder can mark priority infeasible and the estimate stays on standard lanes. The price multiplier still applies when priority was requested, because reserved capacity is the commercial term. The timeline states whether the compression actually fit.

## Investment

The engine returns low, expected, and high.

Known floors, which are starting territories and not caps:

- Simple: $3,000
- Custom: $10,000
- Advanced: $6,000, a calibration midpoint between those two published starts

Extra family units above a small included base use $1,800 per FU. That rate is marked calibration-needed. It is not a rate card.

Identity as a separate pre-site offer is not folded into the site range. Hybrid Option D can add a calibration amount. Large products are not forced back down to the $3K or $10K floors.

Client-facing ranges pass through presentation policy `1.1.0` (`presentation.ts`). Week and month windows both use even endpoints. An odd endpoint moves up to the next even number. The superseded 1.0.0 rule, “months are rounded outward and are not forced even,” no longer applies. Investment bands use a scale-appropriate increment ($500, $1,000, $2,000, or $5,000) and must cover the calculated dollars. The display is not an input to costing. Internal numbers stay more precise. A fixture is a project estimate, not a starting price and not an agreed contract.

## Estimate, quote, schedule

- **Estimate** — a projected range. This is the default.
- **Quote** — a commercial offer after an approved blueprint. The engine can label that state only when a founder sets it. It is still not auto-approved.
- **Locked schedule** — set only when a founder sets the document kind. Calculator use never infers foundation approval, quote approval, timeline lock, or client acceptance.

## Overrides and versioning

A founder override of family class, FU, timeline, risk, price, or priority feasibility requires a reason, an author, and a timestamp. The calculated value stays on the result.

Every result records estimator version `1.0.0`. A saved record stores the version, the time, the config, and the result. Later coefficient changes do not rewrite that record.

Calibration records can store estimated versus actual FU, weeks, cost, revision count, and delay causes. Saving a calibration record does not change the coefficients.

## Risk and dependencies

Risk flags widen the high side of the range more than the low side. Some flags are added by the config itself (a huge descendant tree, a world, a third-party integration).

Dependencies include brand lock before the visual system, auth before account, database before dashboards, parent before descendants, and world master before zones. Those edges cap how many lanes the calendar may use.

## Where it lives

Internal surface: `/admin/site00/estimator`.

Flags:

- `VITE_SITE00_SCOPE_ESTIMATOR_V1` — internal surface, on by default
- `VITE_SITE00_TEMPLATE_SYSTEM_V1` — off
- `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` — off

The public builder is not redesigned in this version. `toClientBlueprintEstimate` is the contract it will render later.
