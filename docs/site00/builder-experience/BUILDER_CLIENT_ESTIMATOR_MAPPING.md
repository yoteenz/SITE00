# Client ↔ estimator data mapping

Output 21. The machine-readable version is `BUILDER_CLIENT_ESTIMATOR_MAPPING.json`, generated from code; a test keeps it in sync.

## Principle

```
BuilderSelection ──toEstimateConfig()──▶ ProjectEstimateConfig ──estimateProject()──▶ ProjectEstimateResult
   (client words)      (pure mapping onto          (canonical estimator,            │
                        estimator enums)            version 1.0.0)                  ▼
                                                            toClientBlueprintEstimate() ─▶ window · range
                                                                                           │
                                         builderScopeSignal() / builderBlueprint() /       ▼
                                         builderEstimateView()  ◀── words only ── client view
```

**Mapping rules:**
- **No calculation in the Builder.** It holds no weights, rates, calendars, lane logic or price multipliers.
- **Defaults come from the estimator.** Review rounds and the review SLA are read from `DEFAULT_ASSUMPTIONS`.
- **Allowed build levels come from the estimator.** Each feature's allowed build levels are read from the estimator registry (`allowedBuildTypes`).
- **Every figure is computed by the estimator.** This covers every window, range, scope band and priority effect.
- **Comparisons ask the estimator twice.** Where the Builder compares (standard vs priority, before vs after a change), it runs the estimator on both configurations and compares the outputs.
- **Nothing here changes estimator behaviour.** The estimator tests and the reference fixture outputs (e.g. STANDARD_EDITORIAL `15–19 WEEKS · $17K–$22K`) are asserted unchanged in `builderExperience.test.ts`.

## Field-by-field

| Estimator field | Builder source | Rule |
|---|---|---|
| `projectType` | 01 BUILD | SITE / WORLD / SYSTEM / HYBRID. A SITE that adds **A WORLD INSIDE** becomes HYBRID. |
| `buildLevel` | derived | The lowest SIMPLE / ADVANCED / CUSTOM that honours every choice (`deriveBuildLevel`). |
| `structuralArchetype` | 02 STRUCTURE | PORTAL when a SYSTEM build has no structure yet; `null` for a world-only build. |
| `visualSystemId` | 03 EXPRESSION primary | `null` for CUSTOM creative direction. |
| `visualComplexity` | derived | The highest of the triggers in the visual-complexity table below. |
| `families` | 09 FAMILIES (experiences) | Front-door experiences → **one** family. Every other experience → one family with its registry class. Depth → descendants. |
| `systems` | — | Always `[]`. Signed-in experiences are already families. |
| `featureIds` | 08 FEATURES + derived | Capability features + COMES WITH closure + motion / image / world features (feature table below). |
| `responsiveMode` | viewports | PHONE_FIRST → MOBILE_ONLY · PHONE_AND_DESKTOP → MOBILE_DESKTOP · PHONE_TABLET_DESKTOP → MOBILE_TABLET_DESKTOP · ADAPTIVE → MULTI_VIEWPORT_ADVANCED. Any world part → SPATIAL_RESPONSIVE. |
| `worldScopes` | WORLD | One scope through `WORLD_INPUT_MAP` (see the journey doc §5). An unshaped world uses `DEFAULT_WORLD_SELECTION` and the Blueprint marks it NOT CHOSEN. |
| `identityScope` | BRAND | NOT YET → SEPARATE (IDNTY outside the range); otherwise NONE. |
| `deliveryMode` | 10 DELIVERY | STANDARD / PRIORITY / CUSTOM_SCHEDULE. PRIORITY is offered only when the estimator reports `priorityFeasible` (F4). |
| `reviewRounds` | estimator default | `DEFAULT_ASSUMPTIONS.defaultReviewRounds` (2). |
| `clientReviewSlaDays` | estimator default | `DEFAULT_ASSUMPTIONS.clientReviewSlaDays` (2). |
| `confidenceLevel` | stage | SELF_SERVE → EARLY · FOUNDER_REVIEWED → BLUEPRINT · SCOPE_LOCKED → LOCKED. |
| `documentKind` | — | Always ESTIMATE from the Builder. QUOTE and LOCKED_SCHEDULE are founder actions. |
| `riskFlags` | BRAND, content readiness | BRAND_NOT_FINAL when the brand is not READY. CLIENT_CONTENT_PENDING when content is not READY. The estimator adds world, integration, migration, role and asset risks itself. |
| `manualModifiers` | — | Always `[]`. Overrides are founder actions in Studio OS. |

## Build-level triggers (`deriveBuildLevel`)

| Trigger | Level |
|---|---|
| Any WORLD part; any SYSTEM part; a HYBRID of parts; the HYBRID structure | ADVANCED |
| A feature whose estimator `allowedBuildTypes` excludes SIMPLE | ADVANCED (or CUSTOM if it also excludes ADVANCED, e.g. MARKETPLACE) |
| One secondary influence (a secondary system, or 2+ liked facets from one other system) | ADVANCED |
| Two or more influences (3+ systems), or NONE OF THESE / custom | CUSTOM |
| FULL edition | ADVANCED |
| Explicit KINETIC / CINEMATIC / SPATIAL / CUSTOM motion | ADVANCED |
| Explicit image world that SITE 00 makes (collage, illustrative, mixed, generative, 3D) | ADVANCED |
| ADAPTIVE viewports | ADVANCED |

## Visual complexity (`visualComplexityFor`)

The highest of these applies:

| Trigger | Estimator visual complexity |
|---|---|
| Nothing tuned, essential edition | TEMPLATE_LED |
| Anything tuned, or any liked part | CUSTOMIZED_TEMPLATE |
| FULL edition | The estimator registry complexity of the primary system |
| Secondary influence, or custom direction | BESPOKE_EDITORIAL |
| Explicit collage / illustrative / mixed image world | BESPOKE_EDITORIAL |
| Cinematic motion | CINEMATIC |
| Spatial motion or 3D image world | CINEMATIC (site) · SPATIAL_WORLD (world) |
| Generative image world | GENERATIVE_ASSET_HEAVY |
| World depth FLAT / LAYERED / DIMENSIONAL+ | BESPOKE_EDITORIAL / CINEMATIC / SPATIAL_WORLD |

## Features added by expression choices

| Choice | Estimator features |
|---|---|
| Effective motion KINETIC / CINEMATIC / SPATIAL | ADVANCED_MOTION |
| Effective motion CUSTOM | ADVANCED_MOTION + CUSTOM_INTERACTIONS |
| Image world GENERATIVE (explicit) | GENERATED_ASSET_SYSTEM |
| Image world 3D / SPATIAL (explicit) | 3D |
| Any world part | WORLD_SPATIAL; + 3D when depth is DIMENSIONAL or FULLY 3D |

"Effective motion" means the following:
- **An explicit motion choice** is used as chosen.
- **FULL edition with no explicit choice:** the system's own motion. For example, Industrial command's FULL edition brings kinetic motion and therefore ADVANCED_MOTION.
- **ESSENTIAL edition with no explicit choice:** the system's motion capped at Editorial.

## Capabilities → features

| Verb | Features | Comes with |
|---|---|---|
| SELL | ECOMMERCE | TAKE PAYMENT |
| BOOK | BOOKING | — |
| TAKE PAYMENT | PAYMENTS | — |
| MEMBERSHIP | MEMBERSHIP | ACCOUNTS |
| ACCOUNTS | AUTH_ACCOUNT | — |
| COMMUNITY | COMMUNITY | ACCOUNTS |
| TEAM ROLES | USER_ROLES | ACCOUNTS |
| MARKETPLACE | MARKETPLACE | TAKE PAYMENT · ACCOUNTS · TEAM ROLES |
| DASHBOARD | DASHBOARDS + DATABASE | — |
| DATA / PORTAL | DATABASE | ACCOUNTS · DASHBOARD · TEAM ROLES |
| UPLOAD FILES | FILE_UPLOADS | — |
| DOCUMENTS | DOCUMENT_MANAGEMENT | UPLOAD FILES · ACCOUNTS |
| EDIT IT YOURSELF | CMS | — |
| SEARCH | CUSTOM_SEARCH | — |
| LIVE UPDATES | REAL_TIME | — |
| BRING EXISTING DATA | DATA_MIGRATION | — |
| NOTIFICATIONS | NOTIFICATIONS | — |
| EMAIL | EMAIL_ENGINE | — |
| MULTILINGUAL | MULTILINGUAL | — |
| MEASURE | ANALYTICS | — |
| CONNECT YOUR TOOLS | THIRD_PARTY_INTEGRATION | — |
| AI | AI_ASSISTED_FEATURES | — |
| 3D | 3D | — |
| A WORLD INSIDE | WORLD_SPATIAL | (opens the world steps; build becomes HYBRID) |

Structures also bring capabilities:
- COMMERCE → SELL
- PORTAL → ACCOUNTS, DATA / PORTAL
- COMMUNITY → COMMUNITY

## Experiences → families

| Depth | Descendants (internal) | Front-door views (internal) |
|---|---|---|
| ESSENTIAL | 3 | 1 per front-door experience |
| FULL | 8 | 2 |
| EXTENSIVE | 16 | 4 (and the front-door family becomes STANDARD) |

The class of each experience comes from the registry. For example:
- Home and Services: LIGHT
- Story, Shop and Booking: STANDARD
- Product and Community: ADVANCED
- Dashboard, Records, Files and Marketplace: SYSTEM

Those classes are a proposal for founder review (F9). They choose among the estimator's existing classes and add no weight.

## Client outputs from the estimator

| Client sees | Source |
|---|---|
| PROJECTED PRODUCTION WINDOW | `toClientBlueprintEstimate().productionWindow` |
| PROJECTED INVESTMENT | `toClientBlueprintEstimate().investmentRange`, with "$nK–$nK" collapsed to "AROUND $nK" |
| SCOPE (LIGHT / MODERATE / DEEP / EXPANSIVE) | `result.complexityBand` mapped to words |
| BUILD LEVEL | `config.buildLevel` → SIMPLE / ADVANCED / CUSTOM BUILD |
| PRIORITY available / window / investment / "ABOUT n% SOONER" | A second estimator run with `deliveryMode: PRIORITY`: `priorityFeasible`, window, range, and `expectedWeeks` relative to standard, rounded down to 5% |
| CONFIDENCE label | `result.confidence` → INITIAL / REFINED / CONFIRMED RANGE |
| MAJOR DEPENDENCIES | `result.dependencies`, rephrased in client words |
| Review structure, SLA note | `config.reviewRounds`, `config.clientReviewSlaDays` |
| Scope impact of one change | Two estimator runs; relative change in the estimator's own total, shown only as NONE / SMALL / MEDIUM / LARGE |
