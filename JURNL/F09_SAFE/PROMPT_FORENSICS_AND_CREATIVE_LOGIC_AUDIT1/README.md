# JURNL F09 SAFE TO SPEND — Prompt Forensics and Creative-Logic Audit 1

**Sprint:** `P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1` · 2026-10-06
**Mode:** analysis only. No image was generated, no screen was implemented, no concept round was started, and no territory was chosen. **F09 visual generation is paused** until a new brief is written against the architecture below.

## The finding

The renderer was never shown the JURNL world.

1. Every approved JURNL screen is image-to-image from one approved image: `JURNL/F01_ENTRY/PARENT/REFERENCE_F01.00_WELCOME_APPROVED.jpg` (the cliff-villa loggia). The F03 text-only attempt was invalidated for exactly this reason (`REFERENCE_BINDING_FAILURE_F02_F03_2026`).
2. F09 never attached it. The first brief firewalled prior JURNL backgrounds and materials and named “pretty background + text + cards” as the failure. The contamination guard later forbade F01 references outright.
3. The words that could have recovered the world were banned: arches, sea-view balconies, more than one plant, depth. The distinctness gate also demanded three different worlds.
4. From round 3 the only image the renderer saw was the agent’s own tonal guide, declared “the ONLY geometry authority”. Image-to-image copied it, so the plates are photographs of diagrams with blank placeholders.
5. Product truth was laid on top as flat app components, with an OS status bar, in an identical stack for all three concepts.
6. Each correction added methodology and negatives instead of restoring the reference. The same agent certified its own checklists, so every round passed QA and failed the founder.

**Sunburst is not the bottleneck.** It produced every approved JURNL image.

## Addendum: the regen run as evidence

THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1 is now part of the audit: lineage L06b, contradiction C21, root causes RC13–RC15. It is covered in report §49–51, `F09_REGEN_ADDENDUM.json` and `ASSET_QUALITY_GATING.json`.

- **Degraded asset promoted (RC14).** 144×256 previews were upscaled about 10× into 1179×2556 layout proofs, a board headed THREE CONCEPT CANDIDATES and a zip sent to the founder.
  - The missing rule is the no-degraded-asset rule, enforced by an asset quality gate that blocks before compositing.
  - The network block explains the missing files, not the continuation.
- **Three backgrounds + one product design (RC13).** Deterministic ownership grew from exact strings into fixed rectangles. Logo, CTA, purchase module and nav sit at the same coordinates on all three pages.
  - Fix: lock strings and the nav; free everything else per concept (`F09_ELEMENT_FREEDOM_MATRIX`).
- **Mediterranean as vocabulary, not JURNL grammar (RC15).** The scenes had arches, plaster, olive, sea and stone, but not the JURNL place, viewpoint, type column, arcade view, still life or counter-colour.
- **Blocked-run behaviour.** No founder-facing visual. Report, don't render.

## Read in this order

| File | What it holds |
|---|---|
| `F09_PROMPT_FORENSICS_REPORT.md` | The full audit: sections 1–48 (ending with the final report), plus addendum sections 49–51 |
| `F09_ROOT_CAUSES.json` | 15 ranked root causes with failure class, evidence and confidence; failure map; synthesis |
| `F09_CONTRADICTIONS.json` | 21 contradictions (2 critical, 13 high, 5 medium, 1 low); over-constraint; under-specified words |
| `F09_PROMPT_FORENSICS_TABLE.json` | One row per prompt / sprint (section 41) |
| `F09_RULE_DISPOSITIONS_AND_MISSING_LOGIC.json` | Survival verdicts, keep / rewrite / remove, missing logic, next-sprint spec, founder decisions |
| `F09_PROMPT_ARCHITECTURE.json` | Prompt layers, priority tiers, generator budget, freedom budget, mandatory evidence, tests, device-chrome rule, delivery contract |
| `F09_REFERENCE_AUDIT.json` | Every reference: its role, whether it was attached, its effect; comparison with the approved world |
| `F09_CREATIVE_LOGIC_AUDIT.json` | Mediterranean, richness, role collapse, distinctness, product truth, UI ownership, coherence, order, device chrome, typography |
| `F09_INSTRUCTION_INVENTORY.json` | Every instruction line from the 4 founder briefs and 12 generator prompts, classified into 21 categories |
| `PROMPT_DENSITY_MEASUREMENT.json` | Words by bucket, line and clause polarity, with the method and bucket tables |
| `F09_PROMPT_LINEAGE.json` | Lineage (15 entries, 6 sprints) and pipeline |
| `F09_REGEN_ADDENDUM.json` | Addendum: degraded asset, shared geometry, deterministic scope, element freedom matrix, JURNL world grammar, blocked-run audit, root-cause map for the regen run |
| `ASSET_QUALITY_GATING.json` | The asset quality gate, JURNL thresholds, and the real assets run through it |
| `F09_FORENSICS_VERDICT.json` | Verdict and the generation pause |
| `SOURCES/` | The founder briefs, verbatim (01, 02, 03, 06; 07 is this audit’s own brief) |

The two Composer sprints (HYBRID-COMPOSITE-AUTHORITY-EXECUTION1 and THREE-DISTINCT-COMPOSITE-AUTHORITY-RERUN1) have no brief in the repository. They are reconstructed from their commits, ledgers, reports and scripts, and marked `reconstructed`.

## Before the next generation round

Three founder decisions are needed:

- **D-F09-COMPOSITION-MODE.** May F09 leave CENTER_STAGE for an edge-led editorial composition like the approved world? Or must it stay centre-stage with the world framing all four edges?
- **D-F09-WORLD-AUTHORITY.** Is F01.00 WELCOME APPROVED the world authority? The last round named the F03 parent, which is still IN_REVIEW.
- **D-F09-AVAILABLE-DATE-FORMULA.** AVAILABLE THROUGH OCT 18 has no formula in `computeSafeToSpend`. Is it a sample only, or should the horizon be defined?

There is also a render-route preflight to pass. In the environment that will run the sprint, confirm image-to-image + 4K + file retrieval.

The next brief must follow `F09_NEXT_SPRINT_SPEC` and the generic method in `docs/studioos/visual-authority-development/PROMPT_FORENSICS_METHOD.md`.

## Regenerate

```
npx tsx scripts/studioos/jurnl-f09-prompt-forensics-export.ts
```

Every file here except this README and `SOURCES/` is generated from:

- `shared/studioos-visual-authority/prompt-forensics.ts` (the method)
- `shared/studioos-visual-authority/projects/jurnl/f09-prompt-forensics.ts` (the findings)
- the source files themselves

`tests/jurnlF09PromptForensicsAudit1.test.ts` fails if they drift.
