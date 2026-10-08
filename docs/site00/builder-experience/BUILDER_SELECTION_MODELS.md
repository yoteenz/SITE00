# Builder selection models

**Where the data lives:**
- The selection models (outputs 7–15) and their client copy are in `src/site00/builder-experience/registry.ts`.
- The identifiers are the estimator's own: `STRUCTURAL_ARCHETYPES`, `WORLD_ARCHETYPES` and `VISUAL_SYSTEMS` in `src/studioos/estimation/registries.ts`.
- How each choice maps onto the estimator is in `BUILDER_CLIENT_ESTIMATOR_MAPPING.md`.

## Structure vs style

This distinction is what makes the experience understandable. The Builder teaches it with layout:

- **Structure** is drawn as a **schematic in grey linework**. It shows boxes, paths and order: how people move. It has no colour and no type personality.
- **Expression** is shown as a **specimen**: real type, a colour relationship plate, named materials and a motion demo. It has no page layout.
- **Combining them.** When a structure and an expression are both chosen, the stage shows the expression *applied to* the structure's schematic. The client sees the same bones in different clothes.

The COMPARE primitive reinforces this:
- **Comparing two structures** keeps the expression fixed.
- **Comparing two expressions** keeps the structure fixed.

## 7. Structural template selection model

There are eight site grammars and nine world forms. Each card communicates five things, as the sprint requires:

| Field | Example (SERVICE) |
|---|---|
| Spatial / content behaviour | "A practice. What you offer, proof that it works, and a clear way to begin." |
| Navigation character | "Short and direct. Offer, proof, begin." |
| Ideal use cases | Consultants and agencies · Clinics and studios · Trades and professionals |
| Complexity | Scope hint LIGHTER / MIDDLE / DEEPER, from the estimator's `typicalClass` |
| Composition logic | "Promise → offer → proof → begin", drawn as the schematic `OFFER_PROOF_BEGIN` |

**Schematics:**

| Grammar | Schematic | What the drawing shows |
|---|---|---|
| EDITORIAL | COLUMN_OF_STORIES | A lead story block, an index column, a "read next" link |
| GALLERY | SEQUENCE_OF_ROOMS | Rooms in a row with previous / next arrows |
| COMMERCE | CATALOG_TO_CHECKOUT | A grid, then a product, a bag, a checkout path |
| SERVICE | OFFER_PROOF_BEGIN | Three stacked bands and one begin button |
| PORTAL | SIGNED_IN_WORKBENCH | A side navigation, a "needs you" list, a record panel |
| HOSPITALITY | PLACE_THEN_BOOK | Full-bleed place, offer strip, persistent BOOK |
| COMMUNITY | GATHERING_PLACE | Feed, member avatars, an events rail |
| HYBRID | TWO_WINGS | A primary grammar with a second wing |

**World forms:** GROUNDS_WITH_PAVILIONS, LINEAR_WALK, CENTER_AND_SPOKES, NEIGHBOURHOODS, ENCLOSED_GARDEN, OBJECTS_ON_PLINTHS, SHARED_PLAZA, CHAPTERS and JOINED_FORMS. Each is drawn as a plan view.

**Behaviour:**
- **Starter experiences.** Choosing a structure pre-assembles its starter experiences. Optional ones are offered but off.
- **Implied capabilities.** COMMERCE comes with SELL, PORTAL with ACCOUNTS and DATA / PORTAL, and COMMUNITY with COMMUNITY.
- **Unusual pairings.** An expression outside a structure's compatible list is allowed. It gets an UNUSUAL PAIRING note ("it can work; the creative team will check it at Blueprint").
- **Previews.** Preview slots (`mobile`, `desktop`, `spatial`) stay `null` until an approved authority exists.

## 8. Visual system (expression) selection model

There are six systems. Each is a complete grammar demonstrated across eight facets:

| Facet | EDITORIAL OBJECT | ARCHITECTURAL MINIMAL | CINEMATIC LUXURY | SOFT ORGANIC | INDUSTRIAL COMMAND | POP EDITORIAL |
|---|---|---|---|---|---|---|
| Composition | Type-led, one object focal | Grid and light | Wide frames, sequences | Soft shapes, layered planes | Panels, readouts | Editorial + big graphic moves |
| Typography | Serif headlines | Clean grotesk | Expressive display | Humanist sans | Mono / condensed | Condensed display |
| Imagery | Single objects | Spaces and light | Cinematic stills | Plants, hands, textures | Machines, diagrams | Collage, cut-outs |
| Materiality | Paper, ink | Concrete, glass | Shadow, metal | Linen, clay, wood | Steel, signal colour | Print, gloss |
| Spacing | Wide margins | Strict grid | Full-bleed + tight captions | Relaxed | Dense, ordered | Tight, energetic |
| Iconography | Almost none | Thin geometric | Minimal refined | Soft line | Functional | Bold graphic |
| Object language | One object per page | Planes and edges | The frame | Natural forms | Instruments | Cut-outs and stamps |
| Motion character | Editorial | Quiet | Cinematic | Quiet, soft | Kinetic | Kinetic |

**Editions:**
- **ESSENTIAL** (default for Simple). The system's grammar is used closely, and motion is capped at Editorial. Estimator visual complexity: `TEMPLATE_LED`, or `CUSTOMIZED_TEMPLATE` once anything is tuned.
- **FULL.** The system is developed for this project and uses the estimator registry's own complexity for that system. This requires an ADVANCED BUILD.

**Hybridisation:**
- **Primary + one secondary influence** is an ADVANCED BUILD with `BESPOKE_EDITORIAL` complexity.
- **More than that** turns into a custom direction. A second secondary, or two or more liked facets from a third system, means 3+ systems and a CUSTOM BUILD.
- **I LIKE PARTS OF THIS.** One facet is a note for the creative team. Two facets from one system count as an influence.

**What a system preview must eventually show:** the eight facets on one specimen, then the specimen applied to the chosen structure, in both PHONE and DESKTOP. Real approved authority previews replace the specimen as they exist.

## 9. Typography selection model

Type is never a font dropdown. Each direction is set **in context**: the client's own business name and a real headline from their structure ("Book a table", "Our work") are set in the direction's specimen.

There are seven directions:

| Direction | What it says |
|---|---|
| Editorial serif | Literate |
| Modern grotesk | Contemporary |
| Humanist sans | Warm |
| Condensed display | Graphic |
| Expressive display + restrained body | Dramatic |
| Mono / systemic | Precise |
| Hybrid pairing | Two voices |

**Behaviour:**
- **Defaults.** Each expression brings a default direction. The tuning screen opens on it, marked "FROM SYSTEM".
- **Approved type systems.** `approvedTypeSystem: null` on every direction is the slot for the real approved type system (licensed families and scales) once the founder approves one. Until then the specimen uses neutral stand-ins, labelled as such.
- **Scope.** Type alone never changes scope. Changing it counts toward tuning, which makes the edition a customized template.

## 10. Colour direction model

Colour is a complete relationship, never a single swatch. Each direction defines **background · surface · accent · text · material**, and the specimen plate shows all five in proportion:
- a large background field
- a surface card
- one accent mark
- text set on both the background and the surface
- a material strip

There are seven directions: neutral architectural, warm mineral, high-contrast monochrome, deep cinematic, soft organic, saturated editorial, and **your brand colours**.

**Rules:**
- **Specimen values.** These illustrate the direction and are labelled *"direction, not your palette"*.
- **Your brand colours.** This option is offered only when brand readiness is READY or IN PROGRESS. With NOT YET, it shows a decision: choose a direction for now, or wait for IDNTY.
- **Contrast.** Every plate shows text contrast pass / fail on both background and surface, so the client learns that colour is a system.

## 11. Image world model

| Image world | Who makes it | Scope effect | Visual-system fit |
|---|---|---|---|
| Photographic | Client / shoot / licensed | none | all |
| Product-led | Client product photography | none | Editorial object, Pop editorial, Cinematic |
| Architectural | Client spaces / commissioned | none | Architectural minimal, Industrial command |
| Editorial collage | SITE 00 from client material | some (≥ bespoke editorial, ADVANCED) | Pop editorial, Editorial object |
| Illustrative | Illustration set for the project | some (≥ bespoke editorial, ADVANCED) | Soft organic, Pop editorial |
| Mixed media | Combined art direction | some (≥ bespoke editorial, ADVANCED) | Pop editorial, Editorial object |
| Generative | Generated-image pipeline with review on each asset | more (generated asset system, ADVANCED) | any; strongest with Cinematic, Editorial object |
| 3D / spatial | 3D assets for the project | more (3D, ADVANCED; spatial in a world) | Cinematic, worlds |

Explicitly choosing an image world that SITE 00 has to make raises the level, because that is real production. Inheriting the system's default in the essential edition does not.

## 12. Motion model

| Character | Behaviour | Demo on the specimen | Scope |
|---|---|---|---|
| Quiet | Calm arrivals | Soft fade per section | none |
| Editorial | Follows reading | Headline settles, image rises | none |
| Kinetic | Snappy, graphic | Type slides and snaps | advanced motion · ADVANCED |
| Cinematic | Sequenced like film | Slow push-in before the title | advanced motion · cinematic · ADVANCED |
| Spatial | Moving through depth | Camera travels between rooms | advanced motion · spatial in worlds · ADVANCED |
| Custom | Invented for the project | Defined during direction | advanced motion + custom interactions · ADVANCED |

**Rules:**
- **Demos.** Each demo plays once on the specimen, with a replay button. Under reduced motion it becomes a still with a caption.
- **Essential edition.** A demanding system default (kinetic, cinematic) is delivered as Editorial motion, and the specimen says so: "motion simplified in the essential edition".

## 13. Feature-selection model

Features are verbs grouped by intent. Internal feature identifiers never appear.

| Group | Verbs |
|---|---|
| OFFER | SELL · BOOK · TAKE PAYMENT |
| PEOPLE | MEMBERSHIP · ACCOUNTS · COMMUNITY · TEAM ROLES |
| INFORMATION | DASHBOARD · DATA / PORTAL · UPLOAD FILES · DOCUMENTS · EDIT IT YOURSELF · SEARCH · LIVE UPDATES · BRING EXISTING DATA |
| REACH | NOTIFICATIONS · EMAIL · MULTILINGUAL · MEASURE |
| ADVANCED | MARKETPLACE · CONNECT YOUR TOOLS · AI · 3D · A WORLD INSIDE |

**Behaviour:**
- **COMES WITH.** This is always shown, never silent:
  - SELL comes with TAKE PAYMENT.
  - MEMBERSHIP and COMMUNITY come with ACCOUNTS.
  - DOCUMENTS comes with UPLOAD FILES and ACCOUNTS.
  - MARKETPLACE comes with TAKE PAYMENT, ACCOUNTS and TEAM ROLES.
  - DATA / PORTAL comes with ACCOUNTS, DASHBOARD and TEAM ROLES.
- **Level marks.** Verbs that need an Advanced or Custom build carry an ADVANCED or CUSTOM mark. These come from the estimator's `allowedBuildTypes`, so they cannot drift.
- **Impossible configurations are surfaced as decisions:**
  - TAKE PAYMENT alone: "What will people pay for?"
  - CHECKOUT without SELL: "Checkout needs SELL. Add it, or remove the experience."
  - Brand colours without a brand.
  - A world inside a site: "this becomes a hybrid build".
- **Scope impact.** Each verb shows its effect in words (NONE · SMALL · MEDIUM · LARGE) when toggled, from `scopeImpact()`.

## 14. Family-selection model ("experiences")

The client never sees the word "family". They see **experiences**, grouped by where they sit in the place:

| Group | Experiences |
|---|---|
| FRONT DOOR | Home · Entry / sign in · About · Contact · The place · Visit |
| WHAT YOU OFFER | Services · Proof · Stories · Story · Archive · Work rooms · Piece · Menu / stays / offer · Journal · Events |
| DOING THINGS | Shop · Product · Bag and checkout · Care · Booking · Membership · Community · Marketplace |
| SIGNED IN | Account · Dashboard · Records · Files |
| BEHIND THE SCENES | People and roles · Settings |

**Behaviour:**
- **Pre-assembly.** The structure's starter experiences plus every experience a capability adds are pre-assembled. Optional experiences are offered but off.
- **Reactive availability.**
  - A **capability-gated experience** (Checkout, Booking, Dashboard, …) only appears when its capability is on. Adding it by hand surfaces the dependency.
  - A **world-only build** has no experiences step. Places replace it.
- **Depth per experience.** Shown in words:
  - ESSENTIAL: "the core views"
  - FULL: "every state and sub-view"
  - EXTENSIVE: "a large family of views"
  - The view counts behind these words are internal.
- **Front door.** All front-door experiences share one production family, because a family is not a page. That is why home, about and contact cost what one light family costs.
- **Layout.** The groups are shown as a map of the place (front door at the top, signed-in areas behind a line), not as a checklist.

## 15. Delivery-selection model

There are three cards:

**STANDARD PRODUCTION.** "Your project moves through production at the normal pace, with work running in parallel wherever the plan allows."

**PRIORITY PRODUCTION.** Shown with its effect, computed by the estimator for *this* configuration:
- **What the client gets:** reserved capacity, more work in parallel, priority scheduling, a tighter review cadence, and dependency-aware acceleration.
- **The comparison:** STANDARD `10–19 MONTHS` · PRIORITY `7–13 MONTHS` · "ABOUT 30% SOONER" (example: `SAMPLE_LARGE_HYBRID`).
- **Why not half:** "Some work has to happen in order (blueprint, brand lock, integration, final checks, launch). Priority speeds up the parts that can run side by side, so it shortens the window without halving it."
- **Not available.** When the estimator reports that the extra capacity cannot be used (`priorityFeasible: false`), the card reads: *"Your project already runs at full concurrency, so reserving more capacity would not shorten it. Standard production is the fastest route for this scope."* Nothing is charged. This is founder decision F4.

**A DATE YOU NEED TO HIT.** "Tell us the date. SITE 00 reviews whether the scope can meet it." This maps to the estimator's `CUSTOM_SCHEDULE`, and a founder confirms it.

During Room IV the cards show only the relative effect: "ABOUT 30% SOONER", or "not available for this scope", plus the words "priority adds a capacity premium". They show no windows and no figures. Both windows and both investments appear side by side at the Estimate. This keeps price and dates out of creative exploration.
