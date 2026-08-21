# Reference-to-Production Asset Pipeline

**Status: PILOT_VALIDATED**

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

**Recommended for Studio World canonical adoption: YES**, as a `PRODUCTIZATION_CANDIDATE` — this
document should inform, not yet replace, Studio World's own production/generation primitives. A
follow-up sprint should map this pipeline's stages onto Studio World's existing production request
lifecycle (see `docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`) before any runtime change is
made there.
