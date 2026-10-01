# Fabrication QA — GROK-SURGICAL-FABRICATION1

52 / 52 fabrication specs have a canonical file. Dimensions match `IMAGE_ASSET_MANIFEST.json`. Transparent rows are RGBA PNG with a cleared background (verified clear-pixel share above 5%).

Model: `grok-imagine-image-2`. Prompts kept `autoEnhancePrompt` false.

## Continuity

| Family | Same world | Same materials | Same camera | Same lighting | Same architectural DNA | Same icon language |
| --- | --- | --- | --- | --- | --- | --- |
| ORIGIN | YES | YES | YES | YES | YES | YES (red-line set only) |
| IDNTY | YES | YES | YES | YES | YES | n/a (no icons) |
| BLDR | YES | YES | YES | YES | YES | YES (red-line set only) |
| EVOLVE | YES | YES | YES | YES | YES | YES (red-line set only) |
| LOCATIONS | YES | PARTIAL | YES | YES | YES | n/a |

LOCATIONS material is PARTIAL: the arch is pale stone. The spec asked for warm marble. Cards stay in that same pale corridor. Do not mark the locations material contract closed until a founder REFINE.

BLDR systems subject is a module column, not a server-rack tower. World, camera, and materials still match the command atrium. Flag REFINE. Family world is not broken.

## Multi-surface

Every spec is `MOBILE_WEB` only. No separate tablet, desktop, or app world was generated.

- Origin expanded reveals more of the collapsed double-zero courtyard, including the skyline.
- BLDR overview is a crop of the command atrium.
- Cards are mobile masters classified `SAME_ASSET_DIFFERENT_CROP` for later surfaces.

## Transparency

Machines and illustrations were generated on flat chroma green and keyed locally. Background pixels are alpha 0. Glass machines were despilled so plates read as glass, not green screen. No checkerboard and no white bake.

Shadow ownership on transparent rows is `SHADOW_SEPARATE_ASSET`. No contact shadow was baked. No separate shadow asset was requested as its own spec, so Composer should not invent one unless a later spec adds it.

## Text, UI, SVG

Reviewed contact sheets show no headings, buttons, labels, or fake UI. Red-line PNGs are the asset-owned illustrations (facial wireframe, lattices, orbits). They are not copies of page chrome. Environment prompts excluded header, nav, cards, and live SVG linework.

## Safe zones and negative space

Reference-crop JPGs and safe-zone PNGs are paths inside the specs. Those pixel files are not in the repo (MAP2 stored metadata paths only). Environment masters were prompted with a quiet lower floor and an empty center where a machine is layered later. Overlay-pixel QA could not be run.

## Camera, light, material

Family masters share eye-level one-point views, bright white architecture, and restrained red inserts. IDNTY, BLDR command, and EVOLVE intervention are sibling atriums. Origin is the double-zero threshold. Locations is the arch corridor in the same daylight.

## Contact sheets

- `qa/contact-sheets/ORIGIN-FAMILY-CONTACT.jpg`
- `qa/contact-sheets/IDNTY-FAMILY-CONTACT.jpg`
- `qa/contact-sheets/BLDR-FAMILY-CONTACT.jpg`
- `qa/contact-sheets/EVOLVE-FAMILY-CONTACT.jpg`
- `qa/contact-sheets/LOCATIONS-FAMILY-CONTACT.jpg`
