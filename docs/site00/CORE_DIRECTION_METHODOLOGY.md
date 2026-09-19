# SITE 00 / Studio World — Core Direction Formation + Controlled Expansion Methodology

Canonical, brand-agnostic methodology governing **when** and **how much** of a brand world Sonnet is allowed to build at each point in a Creative Direction engagement. This is the layer *above* `docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md` (which governs asset production, once a direction is being produced) — this document governs **sequencing and gating**: what may exist before founder approval, and what may exist only after it. First formalized by the founder as a standing directive after the NDX BOOK three-direction sprint, using NDX BOOK as the validation example. Adopt this for **every** future SITE 00 Identity, Creative Direction, EVOLVE, Studio World, campaign, or content-franchise engagement — the deliverable changes, the principle does not.

## Canonical principle

**Do not design the entire brand world before the core creative idea has been proven.**

Creative Direction proceeds through two stages that may never be collapsed into one another:

- **Stage A — Direction Formation** (low structure freedom, small surface area, deep concept)
- **Stage B — Direction Expansion** (high creative freedom, wide surface area, strict lineage back to the approved core)

## 01. Brand context classification

Before any territory is produced, classify how the brand actually exists in the world: `BRAND_TYPE`, `PRIMARY_EXPRESSION_CONTEXT`, `PRIMARY_AUDIENCE`, `PRIMARY_CHANNELS`, `CULTURAL_CONTEXT`, `FUNCTIONAL_PURPOSE`, `EMOTIONAL_PURPOSE`, `CONTENT/PRODUCT/SERVICE_MODEL`, known founder preferences/anti-preferences, existing canon, relevant references. `PRIMARY_EXPRESSION_CONTEXT` is `BrandExpressionContext` in `api/_lib/site00Evolve/creativeDirection/types.ts` (`SOCIAL_FIRST_EDITORIAL | ECOMMERCE_FIRST | SERVICE_BUSINESS | PRODUCT_PLATFORM | CREATOR_BRAND | ENTERTAINMENT_MEDIA | HOSPITALITY | PHYSICAL_RETAIL | HYBRID`), set once per `CreativeBrief`. Do not default to a website concept for every brand — the proof must reflect the brand's dominant expression.

## 02–03. Three core creative territories + Core Direction Board (Stage A)

Default exploration produces three **conceptually distinct** territories (`CreativeTerritory[]`, `api/_lib/site00Evolve/creativeDirection/territories.ts`) — never three palettes/typefaces/layouts of one idea. Each territory carries a `CoreDirectionDefinition` (`coreDirection` field on `CreativeTerritory`):

`directionName · bigIdea · oneLineThesis · brandConnection · culturalReference · emotionalPromise · visualMetaphor · governingBehavior · materialImageryLanguage · typographicAttitude · coreColorLogic · signatureDevices · primaryBrandArtifact · proprietaryQuality · antiDirection`

`culturalReference` is the conceptual ancestor (a behavior, ritual, system, medium — not aesthetic inspiration). `governingBehavior` is the system's fundamental verb (annotation, scanning, movement, collection, revelation, assembly, transformation, indexing, collision, documentation...). `antiDirection` is mandatory and explicit — what the concept must never become.

The **Core Direction Board** for each territory is produced via the canonical Reference-to-Production Asset Pipeline (`docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md`) and must prove concept, atmosphere, metaphor, materiality, imagery, typography attitude, palette behavior, signature device, and primary artifact — depth over quantity. Do not prematurely build every branch, every template, or every channel at this stage.

## 04. Core Direction visual production

Same pipeline as `CREATIVE_DIRECTION_METHODOLOGY.md` §2–6: per-component `CODE_NATIVE | GENERATED_ASSET | EXISTING_ASSET | HYBRID_COMPOSITION` classification, fidelity mode, background treatment, composite mapping, reject-and-regenerate as normal production.

## 05. Founder Core-Direction Gate

**Stop. Do not expand a direction until it is approved.** Founder-facing gate states (`CoreDirectionGateStatus` in `types.ts`):

`CORE_DIRECTION_PENDING · CORE_DIRECTION_REVISION_REQUESTED · CORE_DIRECTION_APPROVED · CORE_DIRECTION_REJECTED`

These are derived from the existing `CreativeDirectionLifecycle` enum via `coreDirectionGateStatus()` — additive only, the underlying lifecycle values are not renamed (many consumers/tests depend on them):

| `CreativeDirectionLifecycle` | Gate status |
|---|---|
| `PROPOSED`, `UNDER_REVIEW` | `CORE_DIRECTION_PENDING` |
| `SELECTED` (a `HYBRIDIZE` outcome) | `CORE_DIRECTION_PENDING` — DNA stays `PROPOSED`, not locked |
| `REVISION_REQUESTED` | `CORE_DIRECTION_REVISION_REQUESTED` |
| `APPROVED` | `CORE_DIRECTION_APPROVED` |

A direction cannot enter Stage B until `CORE_DIRECTION_APPROVED`. The founder decision UI (`CreativeDirectionExperience.tsx` → `APPROVE / REFINE / HYBRIDIZE / REJECT`) is the real implementation of this gate; only `APPROVE` reaches `CORE_DIRECTION_APPROVED` and locks Visual DNA. Approval locks concept, thesis, visual metaphor, governing behavior, primary palette logic, signature visual language, and primary artifact — it does **not** mean every future composition must look identical to the Core Board.

## 06. Direction DNA extraction

After approval, extract the expansion grammar as `CoreDNA` (`types.ts`): `conceptRules · visualRules · compositionRules · imageRules · materialRules · typographyRules · colorRules · motionRules · contentBehavior · signatureDevices · prohibitedDrift`. `extractCoreDna()` (`coreDirection.ts`) is a pure function of the territory's `coreDirection` + lineage-tested `branchLineage`; the one canonical, gated call site is `promoteVisualDnaToApproved()` (`visualDnaContract.ts`), invoked only on a founder `APPROVE` decision (`engagementService.ts`). `VisualDnaContract.conceptDna` is `null` until then — never populated speculatively.

## 07–08. Controlled branch expansion + lineage test (Stage B)

Once approved, Sonnet receives real creative freedom — not to copy the Core Board repeatedly, but to ask "if this thesis is true, what else naturally exists in this world?" Every branch is declared as `BranchLineageDeclaration` (`types.ts`): `branchName · specimenType · branchPurpose · coreLineage · conceptualTranslation · visualLineage · differentiation · primaryBehavior · assetRequirements · motionBehavior? · channelApplicability`, each carrying a `BranchLineageTest` — the seven questions from §8 of the founder's directive, encoded as explicit booleans + notes rather than inferred:

1. Could this branch logically exist because of the Core Concept?
2. Can its relationship to the Core Concept be explained without referencing color alone?
3. Does it preserve recognizable Core DNA?
4. Does it introduce meaningful visual or behavioral variation?
5. Does it serve an actual brand/content/product purpose?
6. Would removing the brand name still leave evidence it belongs to the same creative universe?
7. Is it distinct enough from sibling branches to justify existing?

`branchPassesLineageTest()` requires all seven `true`. Reject or rework a branch that fails any of them.

## 09. Variety requirement

Branches must show family resemblance, not identical twins: `CORE DNA → EXPRESSION A/B/C/D`, each genetically related but behaviorally distinct — never `CORE DESIGN → copy → copy → copy`.

## 10. Channel translation

Only after branch logic exists should branches translate into channels, and channel proof must follow the Brand Context classification from §01 (e.g. `SOCIAL_FIRST_EDITORIAL` → feed / carousel / stories / reels / campaign moments / editorial franchises — never a forced website deliverable).

## 11. Production expansion pipeline

`CREATIVE DIRECTION → APPROVED CORE → CORE DNA → BRANCH → REFERENCE → DECOMPOSITION → ASSET CLASSIFICATION → GENERATION SPEC → GENERATION → TREATMENT → BACKGROUND REMOVAL/MASKING → ASSET QA → COMPOSITE MAP → IMPLEMENTATION → RENDER → VISUAL COMPARISON → REFINE → APPROVAL`

## 12. Creative freedom model

`expansionFreedomFor(lifecycleState)` (`types.ts`) implements this exactly: **before** `CORE_DIRECTION_APPROVED`, expansion freedom is `LOW`; **after**, it flips to `HIGH`, while concept-drift tolerance stays `LOW` always. High structure at the core, high freedom in the branches, strict lineage between them — never micromanagement into indefinitely reproducing founder-designed templates, but never freedom before conceptual alignment either.

## 13. NDX BOOK validation example

NDX BOOK's three territories (`api/_lib/site00Evolve/creativeDirection/coreDirectionDefinitions.ts`) demonstrate the full schema:

- **Editorial Utility** — governing behavior `ANNOTATION`, cultural ancestor the Burn Book's opinion/evidence/insertion behavior matured into an independent-magazine system. 9 branches (`NDXBOOK_BRANCH_LINEAGE.editorial_utility`): THE BURN PAGE, THE RECEIPTS, MARGIN NOTES, THE LIST, THE FILE, THE INSERT, REDACTION, THE CENTERFOLD, THE BACK PAGE.
- **Index Signal** — governing behavior `SCANNING`, cultural ancestor scientific/signal-processing instrumentation reinterpreted as editorial voice. 9 branches of its own logical structure (not a copy of Editorial Utility's): THE PULSE, THE READOUT, THE PATTERN, THE SCAN, THE FORECAST, THE ALERT, THE TRANSMISSION, THE COORDINATE, THE PROJECTION.
- **Kinetic Field** — governing behavior `MOVEMENT`, cultural ancestor physics/motion visualization (orbit, collision, momentum, drag, ripple). 10 branches of its own structure: THE PUSH, THE PULL, THE RIPPLE, THE COLLISION, THE CURRENT, THE TRAJECTORY, THE BUILD, THE BREAK, THE AFTERMATH, THE MOMENTUM.

All three currently sit at `CORE_DIRECTION_PENDING` — none has been founder-approved, so `conceptDna` is `null` for all three and expansion freedom is `LOW`. Every one of the 28 branches above passes `branchPassesLineageTest()` (see `api/_lib/site00Evolve/creativeDirection/coreDirectionMethodology.test.ts`), so the branch universes already built are validated as legitimate Stage B lineage even though formal Stage A approval has not yet occurred — this is flagged as a process note, not silently corrected: **going forward, no new branch should be added to a direction until that direction reaches `CORE_DIRECTION_APPROVED`.**

## 14. Universal application

Adopt this methodology for all future SITE 00 Identity work, Creative Direction, EVOLVE campaigns, Studio World, brand identities, social systems, campaign systems, email families, web experiences, graphic systems, logo explorations, photography direction, motion systems, video concepts, content franchises, and physical brand experiences. The deliverable changes; the principle does not:

**First find the world. Then prove the world. Then lock its DNA. Then let the world expand.**
