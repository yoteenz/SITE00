# Render-Layer Ownership Gate

**Sprint:** P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1
**Source of truth:** `shared/studioos-visual-authority/hybrid-authority.ts`. `RENDER_LAYER_OWNERSHIP_GATE.json` is generated.

> **AN IMAGE GENERATOR MAY CONTRIBUTE TO A PRODUCT AUTHORITY, BUT IT MAY NOT BE THE SOLE RENDERER OF PRECISION PRODUCT UI.**

Superseded: *IMAGE GENERATOR = SOLE RENDERER OF THE SCREEN.*

## The layer model

| Layer | Content |
|---|---|
| L0 | ENVIRONMENT |
| L1 | BRAND FRAME |
| L2 | PRIMARY PRODUCT SIGNAL |
| L3 | SIGNATURE PHYSICAL / GRAPHIC OBJECT |
| L4 | SECONDARY PRODUCT MODULE |
| L5 | ACTION / CTA |
| L6 | SYSTEM CHROME |
| L7 | NAVIGATION |
| L8 | OVERLAYS / SHEETS / TRANSIENT STATES |

Owners: `IMAGE_GENERATOR` · `DETERMINISTIC_UI` · `DETERMINISTIC_VECTOR` · `COMPOSITE` (names a generated part and a deterministic part) · `NO_RENDER`.

## Who renders what

**Precision product UI is always deterministic:**
- exact copy, numbers, financial values, status values and state labels
- logo geometry, icons, navigation, buttons and tab labels
- progress, the spacing grid and interaction chrome

**The image generator renders art-directed visual truth:** architecture, light, materials, paper objects, folders, envelopes, stone structures, branded physical metaphors, scene depth, shadow, foliage and tactile objects.

## Rules (`checkRenderOwnership`)

1. Every layer in the blueprint has exactly one owner.
2. L2, L4, L5, L6 and L7 are deterministic.
3. L1 is never generator-owned: the logo is the official asset.
4. A COMPOSITE layer states its `generated_part` and its `deterministic_part`.
5. No zone holding a precision slot sits on a generator-owned layer.
6. Owners stay inside the project's render-ownership profile.

Fail → `RENDER_LAYER_OWNERSHIP_REQUIRED`, and no generation may start.

## Project profiles

The profile constrains each layer. The territory's ownership map then decides within it.

| Project | Status | Stance |
|---|---|---|
| JURNL | READY | Generation heavy for the environment and objects; precision UI deterministic |
| AIO | draft (founder) | Mostly deterministic operational UI; selective cinematic imagery |
| FRONTAL SLAYER | draft (founder) | High generated environment and product imagery; deterministic commerce UI |
| ASTRAL WORLD | draft (founder) | World generation heavy; deterministic interaction overlay |
| NDXBOOK | draft (founder) | Editorial asset generation; deterministic workspace UI |
| SITE00 | draft (founder) | Host / operator UI deterministic; generation only for client-facing media |
