# Reference-to-Production Asset Pipeline

**Status: PILOT_VALIDATED (v2 — Rendering Medium + Compositing Fidelity Pass)**

Internal methodology capture from the SITE 00 Intake Access email family sprint (Builder Intake
Access + Identity Intake Access, FAL-native visual production). This is a **PILOT** of a reusable
production methodology for turning a founder-approved visual reference into real, produced
artwork inside a shippable surface (initially: transactional email).

**Studio World has not adopted this methodology.** This document exists so it *can* be
incorporated into Studio World's canonical production methodology later, following the same
capture pattern used in [`STUDIO_WORLD_METHOD_CAPTURE.md`](./STUDIO_WORLD_METHOD_CAPTURE.md)
(CAPTURED → VALIDATED → PRODUCTIZATION_CANDIDATE). Do not modify Studio World runtime on the
strength of this document alone.

---

## The Central Rule

> **Approved produced artwork must not be downgraded into a code approximation.**

Once a visual reference establishes that an element is photographic, architectural, archival, or
otherwise "produced" material — CSS gradients, generic SVG geometry, placeholder rectangles,
emoji, or stock icon sets are not acceptable substitutes. If real generation is unavailable, the
correct response is to **block and report the dependency**, not to ship a fake.

Conversely: layout, typography, spacing, buttons, progress UI, and dynamic data are **not**
generation targets. Asking an image model to render readable UI text, logos, or dynamic values
baked into a raster is itself a pipeline violation — that content stays semantic HTML/CSS.

---

## Asset Classifications

Every visual element in a reference must be classified before any generation happens:

| Classification | Meaning | Examples |
|---|---|---|
| `CODE_NATIVE` | Represented with semantic HTML/CSS. Never generated. | rules, frames, typography, buttons, progress bars, metadata, responsive grids, coordinate marks, email-safe icons |
| `GENERATED_ASSET` | Produced imagery from a generation model. | architecture drawings, photography, paper/archival material, fingerprints, physical seals, collage components, textures |
| `EXISTING_ASSET` | A canonical asset already in the repo, reused as-is. | an existing vector wordmark/logomark |
| `HYBRID_COMPOSITION` | A generated component deterministically composited with a canonical/code element. | generated wax seal base + canonical brand mark composited in code |

## Fidelity Modes

| Mode | Meaning |
|---|---|
| `EXACT_RECONSTRUCTION` | The reference already establishes the desired asset. Generation reproduces its category, composition, lighting, material, perspective, density, crop and tonality — no new creative direction. |
| `DIRECTED_VARIATION` | The reference establishes a direction; generation is permitted controlled variation within it (not used in this pilot — every Intake Access asset used `EXACT_RECONSTRUCTION`). |
| `NET_NEW_GENERATION` | No reference exists; generation invents new creative direction under an approved brief (not used in this pilot). |

---

## Rendering Medium Decision

**v2 addition.** `classification` (above) answers "what kind of thing is this." It does not by
itself answer the sharper production question every element must answer before anything is built:

> Which medium reproduces the approved art direction most faithfully, deterministically,
> responsively and efficiently — not "can Sonnet build this with CSS," and not "can FAL generate
> this."

Neither code nor generation is the default. **CSS/SVG is not automatically preferred because it is
code-native. FAL is not automatically preferred because it can generate imagery.** The medium is
selected per element against the rules below, and the decision + reason is recorded in the
manifest (`renderingMedium` / `renderingMediumReason`) or, for fine-grained elements not tracked as
production assets, in a `RENDERING_MEDIUM_MATRIX` sitting alongside the manifest.

### Allowed rendering media

| Medium | Use for |
|---|---|
| `HTML_TEXT` | Exact/dynamic text: intake IDs, statuses, timestamps, percentages, CTA copy, headlines, body copy — anything that must never be baked into a raster |
| `CSS_NATIVE` | Simple geometry: dividers, borders, progress rails, flat rectangles, background fields, basic grid regions |
| `SVG_NATIVE` | Technical/vector geometry: coordinate marks, crosshairs, technical icons, drafting marks, canonical logo/mark geometry |
| `CODE_GENERATED_GRAPHIC` | Simple diagrams/marks that are code-drawn but not a literal `<svg>` primitive already covered above |
| `FAL_GENERATED_ASSET` | Physical visual phenomena requiring photographic/material realism the object doesn't need isolating from a background |
| `FAL_GENERATED_AND_ISOLATED_ASSET` | Same as above, but the object must be extracted from its generation background to composite as a physical fragment (paper, specimen cards, etc.) |
| `EXISTING_CANONICAL_ASSET` | An asset already canonical elsewhere in the repo (e.g. the shared wordmark helper) |
| `DETERMINISTIC_COMPOSITE` | A locked cluster of multiple approved layers flattened into one delivery raster for email-client reliability |
| `HYBRID_COMPOSITION` | Physical realism **and** exact deterministic branding must coexist on the same object — FAL supplies the material, SVG/code supplies the exact mark, composited precisely |

### Decision rules (apply in order, most specific first)

1. **Exact text / dynamic data →** `HTML_TEXT`. Never ask a generation model to render exact
   critical text (IDs, statuses, timestamps, percentages, CTA copy, canonical labels).
2. **Simple geometry →** `CSS_NATIVE`. Lines, borders, dividers, progress rails, flat rectangles,
   basic spacing/grid blocks.
3. **Technical / vector geometry →** `SVG_NATIVE` or `CODE_GENERATED_GRAPHIC`. Coordinate marks,
   crosshairs, technical icons, drafting marks, exact vector symbols, canonical logo geometry.
4. **Physical visual phenomena →** `FAL_GENERATED_ASSET` or `FAL_GENERATED_AND_ISOLATED_ASSET`.
   Realistic lighting, reflection, refraction, glass/acrylic/chrome/metal, paper texture, wax,
   skin, photographic grain, physical depth, irregular organic edges, realistic shadows, textile
   texture, surface imperfections, environmental light.
5. **Physical realism + exact brand precision together →** `HYBRID_COMPOSITION`. Example: a
   dimensional red wax seal (FAL) with the exact SITE 00 mark composited on top (SVG/code), never
   a FAL logo render.
6. **Complex static layer cluster needing a locked spatial relationship →** `DETERMINISTIC_COMPOSITE`.
   Preserve every source layer's isolated master, but ship one flattened composition derivative
   where email-client layering would otherwise be unreliable.

### Visual Physics override

**Visual physics overrides implementation convenience.** Do not replace dimensional, physically
realistic material behavior with a simplistic CSS approximation merely because CSS *can* mimic a
rough shape. A dimensional wax seal with an irregular edge, physical thickness, surface variation,
lighting, highlights and an embossed face must not become a red circle with `box-shadow`.

The inverse failure mode is equally invalid: a basic coordinate grid must not be rasterized, a
progress bar must not be an image, a simple divider must not be sent through FAL. Neither medium
is inherently superior — **the medium is chosen by the visual requirement of the specific
element**, not by which medium is more convenient to implement or more impressive to generate.

### Fidelity over technical cleverness

A 200-line CSS simulation of a physical object is not inherently superior to a production raster
asset. A FAL-generated image is not inherently superior to HTML/SVG for a simple UI element. Select
the medium with the strongest combination of: reference fidelity, determinism, responsiveness,
email/delivery-surface compatibility, accessibility, editability, production reuse, visual quality,
and dynamic-data safety. Implementation exists to serve the design; the design is never downgraded
to serve implementation convenience.

---

## Asset Treatment Doctrine

**v2 addition.** Once an element is routed to `FAL_GENERATED_ASSET`, `FAL_GENERATED_AND_ISOLATED_ASSET`,
or `HYBRID_COMPOSITION`, it receives a second layer of mandatory, explicit metadata governing how
the raw generation is treated before it is fit to composite.

### Compositing role

Every asset also declares `compositingRole` — how it functions in the final composition, not just
what it depicts: `BACKGROUND_FIELD`, `ATMOSPHERIC_LAYER`, `PRIMARY_SUBJECT`, `FOREGROUND_OVERLAY`,
`DOCUMENT_FRAGMENT`, `EVIDENCE_OBJECT`, `DECORATIVE_DETAIL`, `TECHNICAL_OVERLAY`,
`CONTENT_CONTAINER`, `STRUCTURAL_UI`.

### Background mode — mandatory, never implicit

| Mode | Meaning |
|---|---|
| `KEEP` | Reference uses a rectangular photographic crop — no isolation needed (e.g. a portrait) |
| `REMOVE` | Strip the background with no further refinement |
| `GENERATE_TRANSPARENT` | Request transparency directly from the generation model — **must still be verified** (see forensic finding below; text-to-image models can paint the *symbol* of transparency, e.g. a checkerboard pattern, instead of a real alpha channel) |
| `REMOVE_AND_REFINE` | Background removal followed by edge refinement — the default for physical fragments that must float independently in a collage (paper, specimen cards) |
| `MASK_CUSTOM` | A hand-specified mask, not a model's automatic silhouette |
| `COMPOSITE_ONLY` | The asset's own background is designed to visually blend into the surrounding canvas and needs no isolation stage (e.g. a pale atmospheric drawing on an off-white background inside a white email canvas) |
| `NOT_APPLICABLE` | Not a raster/generation-backed element |

Do not indiscriminately remove backgrounds from everything, and do not leave background treatment
implicit — every generated asset declares one of the modes above.

### Edge policy

Every isolated asset declares an `edgePolicy` matched to its object physics — a torn archival note
cannot be extracted with the same assumptions as a wax seal: `HARD_OBJECT`, `SOFT_OBJECT`,
`PAPER_TORN`, `PHOTOGRAPHIC_CROP`, `HAIR_DETAIL`, `GLASS_TRANSLUCENT`, `SHADOW_PRESERVE`,
`SHADOW_REBUILD_IN_CODE`, `CUSTOM_MASK`, `NOT_APPLICABLE`.

### Shadow ownership

Every asset declares a `shadowPolicy`: `ASSET_INTRINSIC` (the object's own rendered
lighting/highlights carry its dimensionality — no code shadow added), `PRESERVE`, `REMOVE`,
`REBUILD_IN_CODE` (a deterministic composite-time drop shadow, not an arbitrary shadow baked in at
generation time), `COMPOSITION_MASTER` (the flattened composite owns the layered shadow
relationships as a whole), `NONE`. Default rule: an object's own intrinsic physical shadow may
remain if the reference requires it; a *layout* shadow (e.g. "this fragment floats above that one")
should prefer a deterministic, code-owned shadow rather than letting every FAL asset arrive with its
own arbitrary shadow.

### Background removal is a distinct production operation

`GENERATION → INSPECTION → BACKGROUND REMOVAL → EDGE INSPECTION → FINAL ISOLATION MASTER`. Do not
trust a prompt-only "transparent background" request without opening the result and checking its
actual alpha channel. This pipeline's own forensic audit (see Pilot Application below) found a text-to-image
generation that had been approved on the belief that it had a transparent background, when its
actual pixel data (`channels: 3`, `hasAlpha: false`) proved it had painted an opaque checkerboard
*pattern* as literal background pixels — a known text-to-image failure mode of drawing the *symbol*
of transparency rather than a true alpha channel. **Never approve `GENERATE_TRANSPARENT` on visual
appearance alone; verify the actual alpha channel, or route through an explicit background-removal
model (e.g. a dedicated image background-removal model) and re-verify.**

### Isolation QA

Every isolated asset is opened and inspected composited over three backgrounds — white, black, and
50% gray — before approval. Reject if any of the following are visible: white/gray matte residue,
halo, clipping, missing torn-paper fibers, lost edge detail, an accidental frame, unwanted
background, color fringe, artificial mask softness, or inconsistent shadow residue. **Do not hide
an extraction defect with CSS** (e.g. covering a visible box edge with an overlapping card) — fix
or regenerate the asset itself.

---

## Production Lineage

**v2 addition.** Never overwrite a production stage in place. Every asset's file lineage is
traceable through as many of these stages as apply (record `N/A` for stages that don't apply to a
given asset):

```
GENERATION MASTER  → the raw model output, at generation resolution
       ↓
ISOLATION MASTER    → the background-removed / alpha-verified version (N/A if BACKGROUND_MODE is KEEP or COMPOSITE_ONLY)
       ↓
COMPOSITION MASTER   → a flattened multi-layer composite at full resolution (only for DETERMINISTIC_COMPOSITE assets)
       ↓
DESKTOP DERIVATIVE   → breakpoint-specific crop/resize/tone-adjustment for the desktop delivery surface
       ↓
MOBILE DERIVATIVE    → an independently art-directed breakpoint-specific derivative — never a scaled copy of the desktop derivative
       ↓
EMAIL OPTIMIZED DERIVATIVE → the final compressed, explicitly-dimensioned asset referenced by the shipped template
```

The manifest records each stage's URL (or `null`/`N/A`) so every asset's history stays
independently inspectable — production truth lives in the manifest, not only in a memory/changelog
document.

---

## Composite Mapping

**v2 addition.** Every visual asset receives a **measured** composite map before implementation —
no asset is simply "placed where it looks good." For every asset and every breakpoint that applies,
record: `parentRegion`, `anchorTarget`, `anchorPoint`, `x`/`y`, `width`/`height` (or `aspectRatio`),
`rotation`, `cropMode`, `objectPosition`, `zIndex`, `opacity`, `blendBehavior`, `overlapTarget`,
`overlapAmount`, `safeBounds`, `responsiveBehavior`, and a `fidelityLock`:

| Fidelity lock | Meaning |
|---|---|
| `LOCKED` | Coordinates are measured from the reference and must not drift |
| `BREAKPOINT_SPECIFIC` | A different, independently measured map applies at another breakpoint |
| `RESPONSIVE` | The element is allowed to reflow fluidly |
| `DECORATIVE_FLEX` | Non-critical decorative placement with looser tolerance |

Primary reference geometry (the elements that carry the composition's visual identity) is generally
`LOCKED` or `BREAKPOINT_SPECIFIC` — never `DECORATIVE_FLEX`.

### Relational anchors, z-order and overlap

Complex clusters (e.g. an evidence file made of a portrait, a note, a seal and a fingerprint) are
**relational**, not four independent cards laid out beside each other. Map the actual overlaps from
the reference: which asset anchors the cluster (`PRIMARY_SUBJECT`), which assets overlap which
region of it, and by how much. A cluster fails review if the pieces "do not physically/visually
interact" — i.e. if they could be rearranged without visually changing anything, they were not
actually mapped from the reference.

### Breakpoint-specific maps — do not scale desktop down for mobile

Desktop and mobile compositions can, and often must, use materially different derivatives and
different composite maps when the reference composition differs materially between breakpoints.
**Do not shrink desktop geometry to produce mobile geometry.** Measure the mobile reference
independently and build its own locked map. The goal is visual continuity between breakpoints, not
implementation sameness.

### Static pre-composition vs. dynamic HTML separation

For each complex visual area, choose: (A) independent live layers, (B) a deterministic static
composite, or (C) a hybrid — a static composite for the physical/material cluster plus live HTML
for everything dynamic. For email specifically, prefer whichever option gives the strongest
combination of reference fidelity, email-client compatibility, determinism, and dynamic-data
safety. **Isolated production masters are preserved even when the delivery asset is flattened** —
flattening is a delivery-format decision, not a reason to discard the individually approved layers.
Dynamic data (IDs, statuses, timestamps, percentages, CTA copy) is never rasterized into a static
composite, regardless of which composition strategy is chosen for the surrounding artwork.

---

## Reference-Conditioned Generation

**v2 addition.** When an approved reference image is available, use it directly as generation
input wherever the provider supports reference-conditioned/image-to-image generation — text-only
generation is the fallback, not the default, whenever a clear approved source region exists. Crop
the reference into per-element reference regions (e.g. a builder-desktop crop, a portrait-region
crop, a seal-region crop) so each generation call is conditioned on the smallest relevant source
material rather than the whole board. Default every asset's `fidelityMode` to `EXACT_RECONSTRUCTION`
when a founder-approved reference already establishes the desired result — reproduce its category,
composition, lighting, material, crop and tonality; do not invent an "inspired by" alternative
unless the source truly cannot be reconstructed.

### FAL model selection

Do not reuse a generation/processing model simply because a previous sprint used it. Select the
model actually integrated into the codebase based on the *capability* the asset needs:
reference-conditioning support, realism requirements, object isolation, image-editing fidelity,
background-removal capability, material rendering, detail retention. A text-to-image model and a
dedicated background-removal/segmentation model are different tools for different pipeline stages —
using the text-to-image model's own "transparent background" instruction as a substitute for a real
background-removal pass is the exact failure mode documented under Background Removal above.

---

## Rejection Loops

**v2 addition.** Every generated or processed asset passes through: `GENERATE → OPEN → COMPARE →
APPROVE OR REJECT → REPROMPT / REPROCESS → OPEN AGAIN`. Record, per iteration: the rejection reason,
the corrective change made, and the final state (`APPROVED` / `REJECTED` / `SUPERSEDED`). Valid
rejection reasons include: wrong subject, wrong perspective, wrong scale, wrong crop, wrong
material, wrong lighting, wrong edge, background residue, generic AI look, hallucinated text,
hallucinated logo, wrong whitespace, wrong compositing role, wrong tonality, reference mismatch. **Do
not approve an asset merely because it is attractive** — approve it because it matches the reference
and its compositing role.

## Runtime Visual Approval Gate

**v2 addition — the single most important gate in this pipeline.** Tests passing, asset URLs
resolving, and HTML containing the right `<img>` src are necessary but explicitly **not
sufficient**. After implementation:

1. Render the real artifact (not a mockup) at every target breakpoint.
2. Actually open and inspect the render at each breakpoint — macro composition, asset scale, x/y
   placement, crop, rotation, overlap, z-order, visual center of gravity, negative space, headline
   relationship, record-card relationship, CTA placement, assurance rail, edge quality, background
   residue, tonal unity, mobile composition.
3. Directly compare the smallest and largest target breakpoints against the corresponding approved
   reference (side-by-side or overlay).
4. Iterate composite coordinates/derivatives until the render reads as the reference, not merely
   "similar."

A composition fails review if: generated rectangles remain visibly pasted onto the layout;
background residue is visible; evidence pieces do not physically/visually interact; an atmospheric
asset behaves as a standalone dropped-in picture; the mobile map is simply the desktop map scaled
down; the wrong crop persists; reference overlaps are missing; AI-generated shadows conflict with
composite shadows; hallucinated branding survived into the final asset; dynamic data was
rasterized; the CTA wraps; mobile loses its typographic hierarchy; the layout is merely "similar"
despite measurable reference geometry being available; or the runtime render was never actually
opened and visually inspected — a PASS based on automated tests alone is not a visual approval.

---

## Brand / Text Ownership

**v2 addition.** A generation provider never owns exact brand information. It generates
physical/visual *material*. HTML/SVG/code owns: the SITE 00 name, the canonical mark, intake
reference numbers, status, dates, completion percentages, CTA copy, exact technical labels, and all
critical typography. If exact branding must appear physically rendered on a generated object (e.g.
a mark embossed into a wax seal), that object is `HYBRID_COMPOSITION` by definition — the provider
supplies the physical substrate, code supplies the exact mark, composited deterministically.

---

## Pipeline Stages

```
01 CREATIVE DIRECTION        founder/brand intent behind the surface being built
02 APPROVED REFERENCE        a concept board or comp is the visual authority — not a suggestion
03 VISUAL DECOMPOSITION       separate the reference into CODE_NATIVE vs produced-artwork regions
04 ASSET CLASSIFICATION       assign CODE_NATIVE / GENERATED_ASSET / EXISTING_ASSET / HYBRID_COMPOSITION
05 ASSET MANIFEST             write a machine-readable manifest (typed TS/JSON) before generating anything
06 REFERENCE CROPPING         isolate clean crops of only the produced-artwork regions as generation inputs
07 GENERATION PROMPT          write EXACT/RECONSTRUCTION prompts + explicit negative constraints per asset
08 FAL PRODUCTION             call the generation provider; gate hard on provider-key availability
09 ASSET INSPECTION           open every result and compare against the reference before use
10 REGENERATION / REFINEMENT  reject and re-prompt on hallucination, wrong perspective, wrong density, etc.
11 ASSET APPROVAL             record APPROVED/REJECTED per asset in the manifest — never implement unapproved generations
12 MASTER STORAGE             persist full-resolution masters separately from delivery derivatives
13 DERIVATIVE PRODUCTION      resize/compress/optimize per-surface derivatives (desktop, mobile, retina)
14 IMPLEMENTATION             wire derivatives + dynamic data into the real template/composition code
15 RUNTIME RENDER             render the real artifact (e.g. real email HTML) — not a mockup
16 REFERENCE COMPARISON       screenshot the render at target breakpoints and compare against the reference
17 FIDELITY REFINEMENT        adjust composition/positioning/derivatives until the render reads as the reference
18 FINAL QA                   full regression (types, tests, build) + visual acceptance sign-off
```

Stages 09–11 and 16–17 are explicitly loops, not single passes. This pilot required multiple
generation rejections (Identity portrait, fingerprint, and archival-note assets each needed at
least one re-prompt to remove hallucinated background/props/text) and two structural refinement
passes on the Identity evidence collage (I05) compositing before approval.

---

## Manifest Shape

A production manifest is a typed array of entries, one per visual element, decomposed **before**
any generation call is made. See the reference implementation:
[`shared/site00-email/production/intake-access-manifest.ts`](../../shared/site00-email/production/intake-access-manifest.ts).

Each entry records, at minimum: `assetId`, owning family, `visualRole`, `referenceRegion`,
`classification`, `fidelityLevel`, `generationMethod`, `aspectRatio`, background/alpha
requirements, desktop/mobile usage, the full `prompt` and `negativeConstraints` used, output
filenames (master + derivatives), `generationResult`, a human-readable `inspectionResult`, and
`approvalStatus`. `CODE_NATIVE` entries are documented for completeness of the decomposition but
carry `generationMethod: 'NONE_CODE_ONLY'` — they are never sent to a generation provider.

**v2 addition** — every entry additionally records the full rendering-medium/asset-treatment/lineage/
composite-mapping metadata described in the sections below: `renderingMedium`,
`renderingMediumReason`, `sourceReference`, `concept`, the `requires*` physical/geometry/dynamic-data
booleans, `compositingRole`, `backgroundMode`, `backgroundRemovalRequired`, `edgePolicy`,
`shadowPolicy`, the five-stage lineage fields (`generationMaster` → `isolationMaster` →
`compositionMaster` → `desktopDerivative`/`mobileDerivative` → `emailDerivative`),
`compositeMapDesktop`, `compositeMapMobile`, `processingHistory` (the rejection-loop record),
`generationModel`, `processingModel`, `iterationCount`, and `deliveryStrategy`. Fine-grained
HTML/CSS/SVG elements that don't carry independent production lineage (a headline, a divider, a
progress rail) are documented in a companion `RENDERING_MEDIUM_MATRIX` array in the same file rather
than as full manifest entries, so the manifest itself stays scoped to assets with real production
lineage.

## Generated Asset Governance

For every `GENERATED_ASSET` / `HYBRID_COMPOSITION` entry, persist (never in source-controlled
base64, never with provider secrets or signed URLs):

- `assetId`, family, purpose
- generation model + prompt version
- reference source
- generation timestamp, dimensions, mime type
- source/master path and derived path(s)
- approval status

Masters are optimized into small delivery derivatives before use in any production surface;
masters are never shipped directly.

---

## Pilot Application: SITE 00 Intake Access Email Family

This methodology was piloted end-to-end producing:

- **Builder Intake Access** — `S00-EMAIL-INTAKE-BLD-B01` (architectural build blueprint), generated
  via FAL text-to-image, `EXACT_RECONSTRUCTION` fidelity, approved after prompt refinement.
- **Identity Intake Access** — `S00-EMAIL-INTAKE-ID-I01`–`I04` (portrait fragment, archival note,
  fingerprint specimen, evidence seal), each generated via FAL text-to-image and individually
  inspected/re-prompted, then `I05` (the evidence collage) assembled as a `DETERMINISTIC_COMPOSITE`
  from the four approved assets rather than re-generated as a single image — avoiding logo/text
  hallucination and portrait drift risk in a full-collage generation.

Full manifest: [`shared/site00-email/production/intake-access-manifest.ts`](../../shared/site00-email/production/intake-access-manifest.ts).
Implementation: [`shared/site00-email/design/compositions/lifecycle.ts`](../../shared/site00-email/design/compositions/lifecycle.ts) (`composeIntakeAccess`).
Tests: [`shared/site00-email/design/compositions/intakeAccess.test.ts`](../../shared/site00-email/design/compositions/intakeAccess.test.ts).

**Pilot result: PILOT_VALIDATED.** The pipeline stages above were exercised in full — including
the rejection/re-prompt loop and the deterministic-composite decision for I05 — and produced a
shippable, tested, reference-faithful email family.

### v2 forensic fidelity pass — what the runtime visual approval gate actually caught

A follow-up sprint re-audited this pilot against the founder-approved reference under the stricter
doctrine above (rendering-medium decisions, background-mode declarations, isolation QA, composite
mapping) instead of trusting the prior manifest's approval notes. Direct pixel/metadata inspection —
not visual approximation — found three real production defects the original PILOT_VALIDATED pass
had missed:

1. **The archival note (`I02`) and fingerprint specimen (`I03`)** had each been generated as a
   "flat-lay on white" *photograph*, not a true alpha-transparent isolation master. Composited onto
   the collage's pure-white canvas, each carried its own soft photographic vignette that produced a
   visible rectangular halo — exactly the "generated rectangles remain visibly pasted onto the
   composition" rejection condition. **Fix:** ran both through a dedicated image
   background-removal model to produce true alpha-transparent isolation masters; re-verified with
   white/black/gray isolation QA.
2. **The evidence seal (`I04`)** had been approved on the belief that its background was
   transparent. Direct `sharp` metadata inspection (`channels: 3`, `hasAlpha: false`) proved the
   model had painted a literal opaque checkerboard *pattern* as background pixels instead of a real
   alpha channel — the exact "model draws the symbol of transparency" failure mode this document's
   Background Removal section now warns about. **Fix:** ran the seal through the same
   background-removal model; the corrected isolation master carries true alpha and passed isolation
   QA.
3. **The mobile evidence strip (`I05-MOBILE`)**, once rebuilt from the corrected isolation masters,
   initially read as disconnected fragments — the prior photographs' vignettes had been (accidentally)
   visually bridging the gap between assets, masking a layout that was never actually measured to
   overlap. **Fix:** retightened the fingerprint/paper/seal composite-map offsets so the seal
   directly bridges the note and the portrait, matching the reference's overlapping evidence-strip
   geometry.

A fourth, additive change closed a gap between the reference and the implementation rather than
correcting a defect: the header row's small crosshair/coordinate marks (present in the reference
flanking the wordmark) had no implementation — added as `SVG_NATIVE` (Rendering Medium Rule 3:
exact vector geometry), not FAL-generated and not a raster asset.

The full per-asset rendering-medium/background/edge/shadow/lineage/composite-map metadata produced
by this pass now lives directly in the manifest
(`shared/site00-email/production/intake-access-manifest.ts`) and in a companion
`INTAKE_ACCESS_RENDERING_MEDIUM_MATRIX` in the same file covering the fine-grained HTML/CSS/SVG
elements the manifest's `CODE_NATIVE` entries summarize at a coarse grain. Production truth for
this email family is asserted by tests, not only narrated in a memory/changelog document — see
`shared/site00-email/design/compositions/intakeAccess.test.ts`.

**Lesson for future applications of this methodology:** "the model generated it and it looks
approved in the manifest" is not evidence of correctness. The **Runtime Visual Approval Gate**
above — actually opening the rendered composite and, for transparency claims, actually checking the
alpha channel — is what catches this class of defect. A generation that is *visually plausible in
isolation* can still fail once composited, and a prior "APPROVED" note in a manifest is not a
substitute for re-verifying it under stricter inspection.

Full manifest: [`shared/site00-email/production/intake-access-manifest.ts`](../../shared/site00-email/production/intake-access-manifest.ts).
Implementation: [`shared/site00-email/design/compositions/lifecycle.ts`](../../shared/site00-email/design/compositions/lifecycle.ts) (`composeIntakeAccess`).
Tests: [`shared/site00-email/design/compositions/intakeAccess.test.ts`](../../shared/site00-email/design/compositions/intakeAccess.test.ts).

**Recommended for Studio World canonical adoption: YES**, as a `PRODUCTIZATION_CANDIDATE` — this
document should inform, not yet replace, Studio World's own production/generation primitives. A
follow-up sprint should map this pipeline's stages onto Studio World's existing production request
lifecycle (see `docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`) before any runtime change is
made there. This pilot's production engine is not duplicated inside Studio World; Studio World's own
production-request architecture remains the only pipeline Studio World runtime executes.

---

## Universal Production Scope

**v2 addition.** This methodology is documented generally enough to eventually apply beyond
transactional email to: websites, UI compositions, logos, brand identity, brand assets, social
content, campaigns, advertising, product visuals, editorial assets, launch systems, motion
graphics, video keyframes, title sequences, and Studio World production requests. **This sprint
does not implement any of those surfaces** — the rendering-medium doctrine, asset-treatment
doctrine, production lineage, and composite-mapping sections above are written surface-agnostically
specifically so a future sprint can adopt them for a different surface without rewriting the
doctrine, only the manifest schema's surface-specific fields (e.g. `desktopUsage`/`mobileUsage` for
email becomes viewport/breakpoint fields for a website, or frame/shot fields for motion — see
below).

---

## Motion / Video Future Extension (documentation only — not implemented)

**v2 addition.** Studio World's eventual motion/video production needs the same rendering-medium
and composite-mapping discipline extended across time. This section documents the concepts a future
motion extension of this pipeline would need; **none of it is implemented, and Studio World runtime
is not modified by this document**:

- **Start frame / end frame** — the two locked compositions a shot interpolates between, each with
  its own composite map (this pipeline's existing `compositeMapDesktop`/`compositeMapMobile`
  concept generalizes to a per-keyframe map).
- **Object identity** — a tracked subject/asset must resolve to the same production lineage across
  every frame it appears in (no silent asset substitution mid-shot).
- **Foreground layers / background plate** — the same `compositingRole` vocabulary
  (`PRIMARY_SUBJECT`, `ATMOSPHERIC_LAYER`, `BACKGROUND_FIELD`) generalizes directly to motion
  layers.
- **Alpha assets / depth layers** — this pipeline's isolation-master concept generalizes to
  per-layer alpha mattes with declared depth ordering across the whole shot, not just one frame.
- **Camera lock** — whether camera parameters are locked (`LOCKED`) or intentionally animated
  (`BREAKPOINT_SPECIFIC`-equivalent per shot) must be declared, mirroring this pipeline's
  `fidelityLock` vocabulary.
- **Motion ownership / transition ownership** — which medium owns motion (code-driven animation vs.
  a generated video asset) mirrors this pipeline's Brand/Text Ownership doctrine: code owns exact,
  deterministic motion of brand/UI elements; generation owns physically realistic motion of
  material.
- **Material continuity / object permanence** — tonal/material cohesion (already required across
  independently generated static assets in this pipeline) extends across a shot's full frame range.
- **Frame-by-frame composite map / temporal anchors** — this pipeline's per-breakpoint composite map
  generalizes to a per-frame (or per-keyframe, with interpolation) composite map with explicit
  temporal anchor points.
- **Lighting continuity** — tonal cohesion rules (white point, black point, contrast, grain,
  warmth) must hold not just across independently generated assets but across time within one shot.
- **Motion QA** — the Runtime Visual Approval Gate generalizes to reviewing the actual rendered
  motion output at representative frames/timecodes, not approving a start/end frame pair in
  isolation and assuming correct interpolation.

This section exists so a future motion-extension sprint has a documented starting vocabulary; it
does not authorize implementing any of it, and it does not change Studio World's current production
request architecture.

---

## Studio World Boundary

This methodology remains a `PRODUCTIZATION_CANDIDATE` for Studio World. This document and its v2
additions:

- do **not** modify Studio World runtime;
- do **not** create a second production engine;
- do **not** duplicate Studio World's existing production-request architecture;
- only update this methodology-capture document and preserve the candidate status for a future,
  explicit integration sprint.
