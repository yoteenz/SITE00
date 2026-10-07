# Hybrid Authority Rendering Method

**Sprint:** P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1
**Source of truth:** `shared/studioos-visual-authority/hybrid-authority.ts`. `HYBRID_AUTHORITY_RENDERING_METHOD.json` is generated.

Generated art supplies the art-directed visual truth. Deterministic assembly renders the product truth. The **composite** combines the two, and it is the authority the founder reviews.

## Correction: authored, not assembled (P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1)

The first F09 executions of this method were founder-rejected. They read as sparse scene plates with UI cards on top: blank brass plates, empty mockup zones, a debug border, device chrome and glitched type were all visible. The method stands, but its execution standard is now explicit:

- The scene is a **finished world** at the project's richness benchmark, and the signature object is **fully realised** by the generator. Nothing blank is ever visible.
- The product layer is **set in the scene's light**: multiply-blended ink on plaster and stone, frosted material panels, shadows from the scene's light direction, and one grain over the whole page.
- **No device chrome** inside an authority view.
- Composites pass the **finish audit** (`FINISH_QA`) and the founder verdict before they count. See [COMPOSITE_AUTHORITY_QA.md](COMPOSITE_AUTHORITY_QA.md).
- Proofs, plates and previews never reach the founder board.

## Pipeline

```
STRUCTURAL TERRITORY → CREATIVE DIRECTION → BRAND EXPRESSION
→ PAGE COMPOSITION BLUEPRINT → RENDER-LAYER OWNERSHIP
→ IMAGE-GENERATED ART LAYERS → DETERMINISTIC UI / BRAND ASSEMBLY
→ COMPOSITE AUTHORITY → FOUNDER REVIEW
```

## Steps

| # | Step | Gate |
|---|---|---|
| 1 | Lock the composition blueprint | `checkCompositionBlueprint` → BLUEPRINT_READY |
| 2 | Lock render ownership | `checkRenderOwnership` → OWNERSHIP_READY |
| 3 | Generate art layers | Raw generation contract. Plates show only the environment, the signature object and materials. The contamination guard is locked first (prompt, reference and blueprint hashes). |
| 4 | QA the art layers | Generator QA + [baked-UI guard](BAKED_UI_GUARD.md) + contamination scan → plate accepted or rejected |
| 5 | Assemble the deterministic UI | Assembly contract: official logo, type system, nav, icons, exact copy and data, components |
| 6 | QA the exact product truth | [Composite QA](COMPOSITE_AUTHORITY_QA.md) |
| 7 | Create the composite authority | `checkCompositeAuthority` → AUTHORITY_READY (including the richness audit, density and 2-second clarity) |
| 8 | Founder review | The board shows composites. Raw plates appear only as provenance. |

## Plates

The usual plate is a **SCENE_PLATE**: the environment and the signature object generated together, so they share one light and nothing looks pasted on. Other kinds are ENVIRONMENT_PLATE, SIGNATURE_OBJECT_PLATE, MATERIAL_OBJECT_ASSET and BACKGROUND_DEPTH_LAYER.

A plate never contains:
- final nav or final button copy
- exact financial text
- a final logo or system icons
- any legible text
- device chrome or UI controls

Blank surfaces (plates, paper, tags, seals) are left empty for the deterministic layer. When an object's proportions are data, the plate guide draws them true. The assembly re-cuts the plate if the generator drifts.

The plate prompt names no product, zone, copy or brand, because a text-to-image model paints the words it reads. Ids, guide paths and hashes live in the contract around the prompt.

## Gate integration

In `evaluateAuthorityGate`, for every non-grandfathered material family, after creative direction and brand expression:
- `PAGE_COMPOSITION_BLUEPRINT_REQUIRED` and `RENDER_LAYER_OWNERSHIP_REQUIRED` stop the line before references.
- References count only when every territory's composite is AUTHORITY_READY (otherwise `COMPOSITE_AUTHORITY_REQUIRED`) and the creative directions are distinct.

`evaluateHybridGate(territories, hybrid)` returns the hybrid status on its own.

AIO IFTA stays grandfathered, as it was for the creative-direction layer.
