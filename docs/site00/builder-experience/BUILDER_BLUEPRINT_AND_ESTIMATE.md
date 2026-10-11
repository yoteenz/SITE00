# Blueprint, estimate and confidence

Outputs 16 (Blueprint experience), 17 (estimate experience) and 18 (estimate confidence UX), plus the live-estimate, timeframe, delay and revision rules.

**Code:**
- `builderBlueprint()` and `builderEstimateView()` in `src/site00/builder-experience/clientView.ts`.
- Every figure comes from `estimateProject()` and `toClientBlueprintEstimate()`.

## 16. Blueprint experience: "the project has taken shape"

The Blueprint is the same sheet that filled in during the rooms. At the reveal it is redrawn full-size as a **project drawing**, not an order summary.

```
 PROJECT BLUEPRINT ─────────────────────────────────────────── SITE 00 / BLDR
 ┌───────────────────────────────┐   BUILD TYPE ....... SITE
 │  (the chosen structure        │   BUILD LEVEL ...... SIMPLE BUILD
 │   schematic, drawn in the     │   STRUCTURE ........ SERVICE
 │   chosen expression)          │   VISUAL SYSTEM .... ARCHITECTURAL MINIMAL · ESSENTIAL
 │                               │   TYPOGRAPHY ....... Modern grotesk  (from system)
 │   FRONT DOOR ─ SERVICES ─     │   COLOR ............ Neutral architectural  (from system)
 │   PROOF                       │   IMAGE WORLD ...... Architectural  (from system)
 └───────────────────────────────┘   MOTION ........... Quiet  (from system)
  EXPERIENCES                        FEATURES ......... EDIT IT YOURSELF
  FRONT DOOR   Home · About · Contact      ESSENTIAL
  WHAT YOU OFFER  Services · Proof         ESSENTIAL
  DELIVERY ........ Standard production
  SCOPE  ▮▯▯▯ LIGHT — a focused build
  NOTES FOR THE CREATIVE TEAM: the type of Editorial object
 ──────────────────────────────────────────────────────────────────────────────
  [ SEE THE ESTIMATE ]     [ CHANGE SOMETHING ]     [ SAVE BLUEPRINT ]
```

**Rules:**
1. **The drawing leads.** The left half is the client's structure schematic rendered in their expression specimen. This is the moment the client sees structure and style together: the bones in their clothes.
2. **Every required line is present.** BUILD TYPE, STRUCTURE (or WORLD FORM), VISUAL SYSTEM, TYPOGRAPHY, COLOR DIRECTION, IMAGE WORLD, MOTION, FEATURES, FAMILIES (experiences) and DELIVERY MODE. Lines inherited from the system say "from system".
3. **Nothing is hidden behind the reveal.** Open decisions (`NEEDS_DECISION`) sit above the drawing. **SEE THE ESTIMATE** stays disabled until `complete` is true, with the text "two decisions left". The client is never shown an estimate for an impossible project.
4. **Comes-with is visible.** Capabilities that came with another choice are marked "comes with SELL", so nothing appears out of nowhere.
5. **Reactions travel with it.** Notes for the creative team (liked parts, keeps, the custom note) are part of the Blueprint. They seed the three creative directions.
6. **No money on the drawing.** The estimate is one tap away, never on the drawing itself.

### The Blueprint is the precursor to the contract

The Blueprint is the bridge:

```
CLIENT SELECTIONS → BLUEPRINT (scope) → BLUEPRINT REVIEW → QUOTE → CREATIVE DIRECTION → PRODUCTION
```

Formally:

| Stage | Who acts | Estimator state | Client label |
|---|---|---|---|
| Self-serve Blueprint | Client | `confidenceLevel: EARLY`, `documentKind: ESTIMATE` | BLUEPRINT ESTIMATE · INITIAL RANGE |
| Reviewed Blueprint | Founder with the client | `BLUEPRINT`, `ESTIMATE` (founder overrides recorded with reason) | BLUEPRINT ESTIMATE · REFINED RANGE |
| Quote | Founder | `documentKind: QUOTE` (founder sets) | QUOTE |
| Scope locked | Founder + client acceptance | `LOCKED` | CONFIRMED RANGE |
| Production schedule | Founder | `documentKind: LOCKED_SCHEDULE` | PRODUCTION SCHEDULE |

The saved Blueprint stores the `BuilderSelection`, the derived `ProjectEstimateConfig` and the estimator result with version `1.0.0`. This uses the estimator's existing `createEstimateRecord`, so a later coefficient change never rewrites what the client was shown.

In the Visual Authority Development Gate:
- The Blueprint's expression, type, colour, image, motion and creative notes are an **input** (brand DNA plus client reactions).
- They are **never** the authority. The three creative directions are the gate's three composition territories.

## 17. Estimate experience

The estimate is revealed on top of the Blueprint (desktop: side by side; mobile: the sheet turns over). Its order follows the sprint and is fixed:

```
 BLUEPRINT ESTIMATE · INITIAL RANGE
 Based on your choices before anyone from SITE 00 has reviewed them. The range is wide on purpose.

 PROJECTED PRODUCTION WINDOW            PROJECTED INVESTMENT
 7–12 WEEKS                             $5K–$8K

 BUILD LEVEL  SIMPLE BUILD     SCOPE  LIGHT      DELIVERY  Standard production

 ▸ WHAT IS INCLUDED
     Experiences: Home · About · Contact · Services · Proof
     Features: EDIT IT YOURSELF
     Direction: three creative directions developed from your choices, then one refined with you
     Reviews: 2 review rounds at each major approval point (creative direction, and the built
              experience before launch)
 ▸ DELIVERY
     Standard 7–12 weeks · $5K–$8K
     Priority: not available. Your project already runs at full concurrency, so reserving more
     capacity would not shorten it.
 ▸ MAJOR DEPENDENCIES
     Your brand is settled before the visual system is finalised.
     Each main experience is approved before its detail views are produced.
 ▸ ASSUMPTIONS
     Your window assumes each review comes back within 2 business days. When a review or content
     arrives later, the window moves by the same amount.
     Your copy and images are ready when production starts.
     Changes to scope after Blueprint review produce a new estimate.
 ▸ WHAT HAPPENS NEXT
     1 Send your Blueprint to SITE 00   2 Blueprint review refines scope and range
     3 Quote for the reviewed Blueprint   4 Creative direction begins   5 Production schedule at scope lock

 This is a projected estimate. It is not a quote and not a schedule.          Estimate reference v1.0.0
 [ SEND BLUEPRINT TO SITE 00 ]   [ CHANGE SOMETHING ]
```

(The figures above are the real estimator output for `SAMPLE_SIMPLE_SERVICE` at version 1.0.0.)

**Rules:**
- **Ranges only.** The window comes from the estimator's `formatProductionWindow` (whole weeks, or months once long) and the investment from `formatInvestmentRange` (thousands). A collapsed range ("$3K–$3K") reads "AROUND $3K".
- **No internal terms.** Family units, raw weeks, lanes, serial / parallel, coefficients and decimal weeks never appear. A test enforces this over every sample.
- **Allowed words:** PROJECTED PRODUCTION WINDOW, PROJECTED INVESTMENT, INITIAL / BLUEPRINT ESTIMATE.
- **Forbidden words:** FINAL PRICE, GUARANTEED COMPLETION DATE, any calendar date, "rush".
- **Delivery comparison.** Standard and priority (when available) are both shown with their own window and investment. When priority is unavailable, the selected delivery falls back to standard and the notice explains why.
- **Build level and scope are two different words.** Build level is SIMPLE / ADVANCED / CUSTOM BUILD, the public product language. Scope is LIGHT / MODERATE / DEEP / EXPANSIVE. DEEP was chosen rather than ADVANCED so the two never collide.
- **Editing after the reveal.** Once the range is shown, edits show the live range moving. The client is now evaluating, not exploring.

## 18. Estimate confidence UX

The estimator's confidence enum is never shown. The client sees the stage of their Blueprint:

| Estimator | Client label | One-line explanation | When |
|---|---|---|---|
| `EARLY` | **INITIAL RANGE** | Based on your choices before anyone from SITE 00 has reviewed them. The range is wide on purpose. | Self-serve Builder (default) |
| `BLUEPRINT` | **REFINED RANGE** | Based on a Blueprint SITE 00 has reviewed with you. The range is tighter. | After the Blueprint review |
| `LOCKED` | **CONFIRMED RANGE** | Scope is locked. The range is narrow. A production schedule is issued as its own document. | After scope lock |
| `documentKind: LOCKED_SCHEDULE` | **PRODUCTION SCHEDULE** | The agreed schedule. | Founder issues it |

**The `LOCKED` label.** The sprint's example labelled `LOCKED` as "PRODUCTION SCHEDULE". The estimator doctrine says *locked confidence is not a locked schedule; a locked schedule is an explicit document state*. So `LOCKED` reads **CONFIRMED RANGE**, and **PRODUCTION SCHEDULE** is reserved for the founder-issued document.

**Why self-serve shows `EARLY`.** A client's own Blueprint has not been reviewed. Showing the tighter `BLUEPRINT` spread would promise a precision nobody has checked. This is founder decision F6.

**Showing the width honestly.** A small range bar sits under the investment. Its width visibly narrows at REFINED, so the client sees the range tightening as the project becomes real.

## Live estimate behaviour (recommendation)

**Recommendation: B, a soft scope signal during configuration, then the real range at the Blueprint.**

| Phase | What moves live | Why |
|---|---|---|
| Rooms I–IV | Scope words (LIGHT · MODERATE · DEEP · EXPANSIVE), build level, COMES WITH and level notes, per-change impact in words (NONE / SMALL / MEDIUM / LARGE) | Clients explore creatively without price dominating, but no choice has an invisible consequence. |
| Reveal | Window + investment (INITIAL RANGE), delivery comparison | The whole picture arrives at once, attached to the drawing that justifies it. |
| After reveal | Live range when editing | The client is now trading off, and deserves the numbers. |

**Rejected options:**
- **A (no signal until Blueprint)** hides consequences. A client could build an EXPANSIVE project believing it is light, and the reveal becomes a shock.
- **C (live range throughout)** turns every creative choice into a price decision and anchors on the first number seen.

Every signal is computed by the estimator on each change. The Builder never estimates on its own.

## Timeframe presentation

- **Units.** Weeks and months exactly as the estimator formats them: "8–10 WEEKS", "15–19 WEEKS", "5–7 MONTHS". Never "37.09 WEEKS", and never a calendar date before a production schedule exists.
- **Finding E5.** The estimator switches to months when the high end reaches 20 weeks. One Blueprint can therefore read "3–5 MONTHS" as an initial range and "15–19 WEEKS" once refined. The proposal is a unit option on `formatProductionWindow`, so a project keeps the unit it was first shown in. Until then the Builder shows the estimator's string unchanged.

## Client delay UX

The copy, from `builderEstimateView().timelineNote`:

> **Your window assumes each review comes back within 2 business days. When a review or content arrives later, the window moves by the same amount.**

**Placement and tone:**
- The note sits beside the window, not in fine print. The 2 days comes from the estimator default `clientReviewSlaDays`.
- Content readiness changes the copy:
  - **PARTIAL / NOT YET:** "Some copy or images are still to come. The window starts counting from when they arrive."
  - **READY:** "Your copy and images are ready when production starts."
- The tone describes a shared timeline, not a penalty. There are no words like "delay fee", "late" or "you will be charged".

## Revision UX

> **2 review rounds at each major approval point: creative direction, and the built experience before launch.**

- **The count.** The 2 comes from the estimator's `defaultReviewRounds`. The estimator models two review milestones (`reviewMilestones: 2`).
- **Naming the milestones.** The names "creative direction" and "the built experience before launch" are proposed (founder decision F7).
- **Expectations.** The Blueprint and the estimate both list the review structure under WHAT IS INCLUDED. The word "unlimited" never appears.
- **Further changes.** Rounds beyond the included ones are a scope change, and a scope change produces a new estimate. The estimate's assumptions say so.
