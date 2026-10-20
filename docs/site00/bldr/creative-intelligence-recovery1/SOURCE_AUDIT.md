# Creative intelligence recovery — source audit

## Blueprint UI (PR #1672)

| Surface | File | Role |
| --- | --- | --- |
| Five tabs shell | `BlueprintRoom.tsx` | Tab panel; STRUCTURE / PAGES copy |
| Tab aggregations | `blueprintTabsModel.ts` | Pages, features, structure, timeline views |
| Rooms 01–05 | `rooms.tsx`, `BuilderStudio.tsx`, `studioModel.ts` | Spatial intake → blueprint route |
| Styles | `site00-builder-studio.css` | Card geometry, disclosures |

## Design resolution path (before this sprint)

| Step | Location |
| --- | --- |
| Feel choice (Room 02) | `spatialStudio/mapping.ts` `FEEL_TO_SYSTEM` |
| Structure from place path | `mapping.ts` `structureForPlace` (ADVANCED → EDITORIAL) |
| Tunables default | `mapping.ts` `type/color` → `SYSTEM_DEFAULT` |
| Blueprint lines | `builder-experience/clientView.ts` `builderBlueprint()` |
| Structure tab display | `BlueprintRoom.tsx` filtered `snapshot.blueprint.lines` |
| 3D palette (builder chrome) | `buildObject/composition.ts` `FEEL_PALETTES` — not client brand |

**Root cause (design):** One visual system per feel with `SYSTEM_DEFAULT` tunables collapsing to the same typography / colour / image / motion labels for most spatial configs; structure and aesthetic were read from the same blueprint lines without provenance.

## Page depth path (before this sprint)

| Step | Location |
| --- | --- |
| Depth definitions | `builder-experience/registry.ts` `EXPERIENCE_DEPTHS` |
| Page list | `blueprintTabsModel.ts` `pagesView()` used `depth.plain` for every page |
| Estimator descendant counts | `toEstimateConfig.ts` (unchanged) |

**Root cause (pages):** Generic depth `plain` string repeated per page regardless of page type or selected capabilities.

## New layers (this sprint)

| Module | Role |
| --- | --- |
| `designResolution.ts` | Provenance-aware creative dimensions for STRUCTURE tab |
| `pageValueIntelligence.ts` | Page-type and capability-grounded PAGES tab copy |

Persistence, estimation, and `BuilderSelection` shape are unchanged.
