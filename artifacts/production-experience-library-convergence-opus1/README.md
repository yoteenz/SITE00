# EXPERIENCE + LIBRARY — responsive authority convergence (OPUS1)

Sprint `P0.STUDIOOS.PRODUCTION.EXPERIENCE-LIBRARY.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1`

**Branch.** `cursor/production-experience-library-responsive-convergence-opus1`, created from `cursor/production-openart-asset-forensics-mount1-0daf` at `433a7622`. That branch is PR #1310 merged with the tunnel branch through `ec6211f0`.

**Authority pack.** `STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE.zip` holds 242 images: Experience 46 mobile + 46 desktop/tablet, Library 75 + 75. The stem index is in `AUTHORITY_INDEX.json`.

## Phase 0 — forensic audit (before)

**Experience.** `/production/:slug/experience` rendered `ExperienceBody`: an AuthorityHero, seven "capsule" links with mismatched labels (PATHS→environments, INHABITANTS→simulations …), two status lines, and ENTER / PREVIEW.
- The 7 legacy sub-workspaces (`world`, `environments`, `modules`, `simulations`, `zones`, `assets`, `review`) rendered `ExperienceProductionShellPage`: a `PwScreenHead`, capsules, a world-plate crop, and "NO WORKSPACE SURFACE MOUNTED".
- They were wrapped in the legacy `PwFrame`, not the Production authority frame.
- There was no route model, no detail routes and no data binding. **8 routes STALE; 38 MISSING.**

**Library.** The exact route `/production/libraries` rendered `LibraryBody`: one page with in-memory tab state (lifecycle tabs + category grid + a hard-coded "CANONICAL ASSET" vault + 8 hand-authored collection cards).
- None of the 10 families or their children / details / lineage existed as routes.
- The lifecycle tabs only toggled an empty state. **1 route STALE; 74 MISSING.**

**Shell.** `ProductionAuthorityFrame` covers host, body and nav. Experience children were outside it. Neither screen had a frame scroll lock, and there was no `dvh` contract.

**Assets.** PR #1310's registry (`productionAssetRegistry.ts`) and manifests (`routeAssetManifests.ts`) were present, but the old trees read `AUTHORITY_ASSETS` paths only. Library cards reused `library.geometry.*` plates as stand-ins for categories they did not depict.

## Rebuild

**Route model.** `src/site00/components/productionAuthority/realm/realmRoutes.ts` defines 121 routes.
- Every route pairs with its authority stem.
- Legacy Experience ids resolve onto families.
- Library gains `/production/libraries/*`.

**Read model.** `realm/realmData.ts` binds every collection to a canonical source and labels it:
- the asset registry and manifests, including `variantOf` lineage;
- Studio World residents and their portraits;
- the Entry 002 plan (beats → journeys; formats → entry/exit paths, specs, formats);
- cast characters and actors, authority sheets (bibles) and shot blocking;
- the production graph (live state, conditions, triggers, issues);
- the design pack (swatches, devices, stages, plates, icons);
- the Experience pipeline (architecture layers) and the workspace registry (destinations).

Collections with no source stay honestly empty with the reason. Examples: zones, portals (manifest `MISSING_SOURCE_ASSET`), zone plates (`SOURCE_MATCH_UNCERTAIN`), video, audio, 3D, research, reports and archive.

**Screens.** `realm/ExperienceScreen.tsx` and `realm/LibraryScreen.tsx`, using shared primitives in `realm/RealmKit.tsx`. Styles are in `styles/site00-production-realm.css`.

**Frame.** A global `@supports (height:100dvh)` contract on `.pxa`, plus a frame-pane lock for the experience and library screens.

**Retired.** `ExperienceBody.tsx`, `LibraryBody.tsx`, and 123 dead rules in five stylesheets.

## QA

**Structural.** `QA_MATRIX.json` covers 121 routes × 14 viewports = **1694 states, all passing**. The 363 states at 390×844 / 820×1180 / 1440×900 are a subset. Each state checks:
- the route rendered as itself;
- page vertical, body vertical and page horizontal overflow ≤ 1px, and `scrollBy` moved 0;
- the frame pane does not scroll;
- nothing is clipped or off-screen outside declared scroll panes;
- the bottom nav is in view with EXPERIENCE / LIBRARY active;
- both authority files are present;
- minimum text size ≥ 8.5px.

**Mobile drawers.** Every child route with records was opened at 390×844 and 390×664: 116/116 pass (`drawer.json`).

**Visual.** `compare/<tab>-<family>.jpg` shows authority mobile | live 390 | authority desktop+tablet | live 820 | live 1440, for ROOT / CHILD / DETAIL of all 17 families.

**Known divergence.** The Experience authorities paint route lines, zone callouts and live counts (e.g. "287K INHABITANTS", "SKY CITIES") onto the world plate. Those are generated copy with no canonical coordinates or records. The plate is shown in the hero, and the real records render as bounded lists, route maps and layer stacks instead.

**Regression.** Inbox (40/40) and Activity (12/12) live checks pass on this branch.

## Route matrix
| # | TAB | FAMILY | ROUTE | KIND | AUTHORITY | BEFORE | NOW | PAGE V-SCROLL | PAGE H-OVERFLOW | QA (14 viewports) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | EXPERIENCE | WORLD | `/production/ndxbook/experience/world` | ROOT | FOUND · `01_World__01_WORLD_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 2 | EXPERIENCE | WORLD | `/production/ndxbook/experience/world/overview` | CHILD | FOUND · `01_World__02_WORLD_OVERVIEW` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 3 | EXPERIENCE | WORLD | `/production/ndxbook/experience/world/architecture` | CHILD | FOUND · `01_World__03_ARCHITECTURE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 4 | EXPERIENCE | WORLD | `/production/ndxbook/experience/world/environments` | CHILD | FOUND · `01_World__04_ENVIRONMENTS` | STALE | MATCHING | PASS | PASS | 14/14 |
| 5 | EXPERIENCE | WORLD | `/production/ndxbook/experience/world/destinations` | CHILD | FOUND · `01_World__05_DESTINATIONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 6 | EXPERIENCE | WORLD | `/production/ndxbook/experience/world/detail` | DETAIL | FOUND · `01_World__06_WORLD_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 7 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones` | ROOT | FOUND · `02_Zones__01_ZONES_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 8 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones/index` | CHILD | FOUND · `02_Zones__02_ZONE_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 9 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones/rooms` | CHILD | FOUND · `02_Zones__03_ROOMS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 10 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones/districts` | CHILD | FOUND · `02_Zones__04_DISTRICTS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 11 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones/portals` | CHILD | FOUND · `02_Zones__05_PORTALS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 12 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones/thresholds` | CHILD | FOUND · `02_Zones__06_THRESHOLDS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 13 | EXPERIENCE | ZONES | `/production/ndxbook/experience/zones/detail` | DETAIL | FOUND · `02_Zones__07_ZONE_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 14 | EXPERIENCE | PATHS | `/production/ndxbook/experience/paths` | ROOT | FOUND · `03_Paths__01_PATHS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 15 | EXPERIENCE | PATHS | `/production/ndxbook/experience/paths/pathways` | CHILD | FOUND · `03_Paths__02_PATHWAYS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 16 | EXPERIENCE | PATHS | `/production/ndxbook/experience/paths/route-map` | CHILD | FOUND · `03_Paths__03_ROUTE_MAP` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 17 | EXPERIENCE | PATHS | `/production/ndxbook/experience/paths/entry` | CHILD | FOUND · `03_Paths__04_ENTRY_PATHS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 18 | EXPERIENCE | PATHS | `/production/ndxbook/experience/paths/exit` | CHILD | FOUND · `03_Paths__05_EXIT_PATHS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 19 | EXPERIENCE | PATHS | `/production/ndxbook/experience/paths/journey` | DETAIL | FOUND · `03_Paths__06_JOURNEY_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 20 | EXPERIENCE | INTERACTIONS | `/production/ndxbook/experience/interactions` | ROOT | FOUND · `04_Interactions__01_INTERACTIONS_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 21 | EXPERIENCE | INTERACTIONS | `/production/ndxbook/experience/interactions/index` | CHILD | FOUND · `04_Interactions__02_INTERACTION_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 22 | EXPERIENCE | INTERACTIONS | `/production/ndxbook/experience/interactions/objects` | CHILD | FOUND · `04_Interactions__03_OBJECT_INTERACTIONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 23 | EXPERIENCE | INTERACTIONS | `/production/ndxbook/experience/interactions/spatial` | CHILD | FOUND · `04_Interactions__04_SPATIAL_ACTIONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 24 | EXPERIENCE | INTERACTIONS | `/production/ndxbook/experience/interactions/triggers` | CHILD | FOUND · `04_Interactions__05_TRIGGERS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 25 | EXPERIENCE | INTERACTIONS | `/production/ndxbook/experience/interactions/detail` | DETAIL | FOUND · `04_Interactions__06_INTERACTION_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 26 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants` | ROOT | FOUND · `05_Inhabitants__01_INHABITANTS_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 27 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants/index` | CHILD | FOUND · `05_Inhabitants__02_INHABITANT_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 28 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants/residents` | CHILD | FOUND · `05_Inhabitants__03_RESIDENTS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 29 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants/characters` | CHILD | FOUND · `05_Inhabitants__04_CHARACTERS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 30 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants/presence` | CHILD | FOUND · `05_Inhabitants__05_PRESENCE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 31 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants/relationships` | CHILD | FOUND · `05_Inhabitants__06_RELATIONSHIPS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 32 | EXPERIENCE | INHABITANTS | `/production/ndxbook/experience/inhabitants/detail` | DETAIL | FOUND · `05_Inhabitants__07_INHABITANT_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 33 | EXPERIENCE | STATES | `/production/ndxbook/experience/states` | ROOT | FOUND · `06_States__01_STATES_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 34 | EXPERIENCE | STATES | `/production/ndxbook/experience/states/scenes` | CHILD | FOUND · `06_States__02_SCENE_STATES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 35 | EXPERIENCE | STATES | `/production/ndxbook/experience/states/lighting` | CHILD | FOUND · `06_States__03_LIGHTING` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 36 | EXPERIENCE | STATES | `/production/ndxbook/experience/states/atmosphere` | CHILD | FOUND · `06_States__04_ATMOSPHERE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 37 | EXPERIENCE | STATES | `/production/ndxbook/experience/states/time` | CHILD | FOUND · `06_States__05_TIME_CONDITION` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 38 | EXPERIENCE | STATES | `/production/ndxbook/experience/states/live` | CHILD | FOUND · `06_States__06_LIVE_STATE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 39 | EXPERIENCE | STATES | `/production/ndxbook/experience/states/detail` | DETAIL | FOUND · `06_States__07_STATE_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 40 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access` | ROOT | FOUND · `07_Access__01_ACCESS_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 41 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access/rules` | CHILD | FOUND · `07_Access__02_ACCESS_RULES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 42 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access/roles` | CHILD | FOUND · `07_Access__03_ROLES_PERMISSIONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 43 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access/zones` | CHILD | FOUND · `07_Access__04_ZONE_ACCESS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 44 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access/conditional` | CHILD | FOUND · `07_Access__05_CONDITIONAL_ACCESS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 45 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access/privacy` | CHILD | FOUND · `07_Access__06_PRIVACY_PRESENCE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 46 | EXPERIENCE | ACCESS | `/production/ndxbook/experience/access/detail` | DETAIL | FOUND · `07_Access__07_ACCESS_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 47 | LIBRARY | AUTHORITIES | `/production/libraries/authorities` | ROOT | FOUND · `01_Authorities__01_AUTHORITIES_ROOT` | STALE | MATCHING | PASS | PASS | 14/14 |
| 48 | LIBRARY | AUTHORITIES | `/production/libraries/authorities/index` | CHILD | FOUND · `01_Authorities__03_AUTHORITY_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 49 | LIBRARY | AUTHORITIES | `/production/libraries/authorities/canonical` | CHILD | FOUND · `01_Authorities__04_CANONICAL_AUTHORITIES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 50 | LIBRARY | AUTHORITIES | `/production/libraries/authorities/in-review` | CHILD | FOUND · `01_Authorities__05_IN_REVIEW_AUTHORITIES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 51 | LIBRARY | AUTHORITIES | `/production/libraries/authorities/superseded` | CHILD | FOUND · `01_Authorities__07_SUPERSEDED_AUTHORITIES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 52 | LIBRARY | AUTHORITIES | `/production/libraries/authorities/detail` | DETAIL | FOUND · `01_Authorities__02_AUTHORITY_DETAIL_FOR_A_SELECTED_AUTHORITY` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 53 | LIBRARY | AUTHORITIES | `/production/libraries/authorities/lineage` | LINEAGE | FOUND · `01_Authorities__06_LINEAGE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 54 | LIBRARY | ASSETS | `/production/libraries/assets` | ROOT | FOUND · `02_Assets__01_ASSETS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 55 | LIBRARY | ASSETS | `/production/libraries/assets/index` | CHILD | FOUND · `02_Assets__04_ASSET_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 56 | LIBRARY | ASSETS | `/production/libraries/assets/images` | CHILD | FOUND · `02_Assets__06_IMAGES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 57 | LIBRARY | ASSETS | `/production/libraries/assets/video` | CHILD | FOUND · `02_Assets__08_VIDEO` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 58 | LIBRARY | ASSETS | `/production/libraries/assets/audio` | CHILD | FOUND · `02_Assets__05_AUDIO` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 59 | LIBRARY | ASSETS | `/production/libraries/assets/spatial` | CHILD | FOUND · `02_Assets__02_3D_SPATIAL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 60 | LIBRARY | ASSETS | `/production/libraries/assets/detail` | DETAIL | FOUND · `02_Assets__03_ASSET_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 61 | LIBRARY | ASSETS | `/production/libraries/assets/usage` | CHILD | FOUND · `02_Assets__07_USAGE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 62 | LIBRARY | CHARACTERS | `/production/libraries/characters` | ROOT | FOUND · `03_Characters__01_CHARACTERS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 63 | LIBRARY | CHARACTERS | `/production/libraries/characters/index` | CHILD | FOUND · `03_Characters__03_CHARACTER_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 64 | LIBRARY | CHARACTERS | `/production/libraries/characters/residents` | CHILD | FOUND · `03_Characters__07_RESIDENTS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 65 | LIBRARY | CHARACTERS | `/production/libraries/characters/project` | CHILD | FOUND · `03_Characters__06_PROJECT_CHARACTERS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 66 | LIBRARY | CHARACTERS | `/production/libraries/characters/talent` | CHILD | FOUND · `03_Characters__05_EXTERNAL_TALENT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 67 | LIBRARY | CHARACTERS | `/production/libraries/characters/detail` | DETAIL | FOUND · `03_Characters__02_CHARACTER_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 68 | LIBRARY | CHARACTERS | `/production/libraries/characters/lineage` | LINEAGE | FOUND · `03_Characters__04_CHARACTER_LINEAGE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 69 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments` | ROOT | FOUND · `04_Environments__01_ENVIRONMENTS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 70 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/index` | CHILD | FOUND · `04_Environments__03_ENVIRONMENT_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 71 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/worlds` | CHILD | FOUND · `04_Environments__07_WORLDS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 72 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/zones` | CHILD | FOUND · `04_Environments__08_ZONES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 73 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/sets` | CHILD | FOUND · `04_Environments__06_SETS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 74 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/plates` | CHILD | FOUND · `04_Environments__05_PLATES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 75 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/detail` | DETAIL | FOUND · `04_Environments__02_ENVIRONMENT_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 76 | LIBRARY | ENVIRONMENTS | `/production/libraries/environments/lineage` | LINEAGE | FOUND · `04_Environments__04_ENVIRONMENT_LINEAGE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 77 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions` | ROOT | FOUND · `05_Expressions__01_EXPRESSIONS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 78 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/index` | CHILD | FOUND · `05_Expressions__05_EXPRESSION_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 79 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/entries` | CHILD | FOUND · `05_Expressions__03_ENTRIES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 80 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/campaigns` | CHILD | FOUND · `05_Expressions__02_CAMPAIGNS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 81 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/formats` | CHILD | FOUND · `05_Expressions__07_FORMATS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 82 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/packages` | CHILD | FOUND · `05_Expressions__08_PACKAGES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 83 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/detail` | DETAIL | FOUND · `05_Expressions__04_EXPRESSION_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 84 | LIBRARY | EXPRESSIONS | `/production/libraries/expressions/lineage` | LINEAGE | FOUND · `05_Expressions__06_EXPRESSION_LINEAGE` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 85 | LIBRARY | REFERENCES | `/production/libraries/references` | ROOT | FOUND · `06_References__01_REFERENCES_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 86 | LIBRARY | REFERENCES | `/production/libraries/references/index` | CHILD | FOUND · `06_References__03_REFERENCE_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 87 | LIBRARY | REFERENCES | `/production/libraries/references/visual` | CHILD | FOUND · `06_References__07_VISUAL_REFERENCES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 88 | LIBRARY | REFERENCES | `/production/libraries/references/research` | CHILD | FOUND · `06_References__04_RESEARCH_REFERENCES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 89 | LIBRARY | REFERENCES | `/production/libraries/references/style` | CHILD | FOUND · `06_References__06_STYLE_REFERENCES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 90 | LIBRARY | REFERENCES | `/production/libraries/references/source` | CHILD | FOUND · `06_References__05_SOURCE_REFERENCES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 91 | LIBRARY | REFERENCES | `/production/libraries/references/detail` | DETAIL | FOUND · `06_References__02_REFERENCE_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 92 | LIBRARY | ICONS | `/production/libraries/icons` | ROOT | FOUND · `07_Icons__01_ICONS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 93 | LIBRARY | ICONS | `/production/libraries/icons/index` | CHILD | FOUND · `07_Icons__05_ICON_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 94 | LIBRARY | ICONS | `/production/libraries/icons/families` | CHILD | FOUND · `07_Icons__04_ICON_FAMILIES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 95 | LIBRARY | ICONS | `/production/libraries/icons/navigation` | CHILD | FOUND · `07_Icons__06_NAVIGATION_ICONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 96 | LIBRARY | ICONS | `/production/libraries/icons/functional` | CHILD | FOUND · `07_Icons__02_FUNCTIONAL_ICONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 97 | LIBRARY | ICONS | `/production/libraries/icons/project` | CHILD | FOUND · `07_Icons__07_PROJECT_ICONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 98 | LIBRARY | ICONS | `/production/libraries/icons/detail` | DETAIL | FOUND · `07_Icons__03_ICON_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 99 | LIBRARY | MATERIALS | `/production/libraries/materials` | ROOT | FOUND · `08_Materials__01_MATERIALS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 100 | LIBRARY | MATERIALS | `/production/libraries/materials/index` | CHILD | FOUND · `08_Materials__04_MATERIAL_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 101 | LIBRARY | MATERIALS | `/production/libraries/materials/surfaces` | CHILD | FOUND · `08_Materials__05_SURFACES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 102 | LIBRARY | MATERIALS | `/production/libraries/materials/components` | CHILD | FOUND · `08_Materials__02_COMPONENTS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 103 | LIBRARY | MATERIALS | `/production/libraries/materials/textures` | CHILD | FOUND · `08_Materials__06_TEXTURES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 104 | LIBRARY | MATERIALS | `/production/libraries/materials/ui` | CHILD | FOUND · `08_Materials__07_UI_MATERIALS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 105 | LIBRARY | MATERIALS | `/production/libraries/materials/detail` | DETAIL | FOUND · `08_Materials__03_MATERIAL_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 106 | LIBRARY | DOCUMENTS | `/production/libraries/documents` | ROOT | FOUND · `09_Documents__01_DOCUMENTS_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 107 | LIBRARY | DOCUMENTS | `/production/libraries/documents/index` | CHILD | FOUND · `09_Documents__05_DOCUMENT_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 108 | LIBRARY | DOCUMENTS | `/production/libraries/documents/briefs` | CHILD | FOUND · `09_Documents__03_BRIEFS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 109 | LIBRARY | DOCUMENTS | `/production/libraries/documents/bibles` | CHILD | FOUND · `09_Documents__02_BIBLES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 110 | LIBRARY | DOCUMENTS | `/production/libraries/documents/specs` | CHILD | FOUND · `09_Documents__08_SPECS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 111 | LIBRARY | DOCUMENTS | `/production/libraries/documents/reports` | CHILD | FOUND · `09_Documents__07_REPORTS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 112 | LIBRARY | DOCUMENTS | `/production/libraries/documents/notes` | CHILD | FOUND · `09_Documents__06_NOTES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 113 | LIBRARY | DOCUMENTS | `/production/libraries/documents/detail` | DETAIL | FOUND · `09_Documents__04_DOCUMENT_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 114 | LIBRARY | ARCHIVE | `/production/libraries/archive` | ROOT | FOUND · `10_Archive__01_ARCHIVE_ROOT` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 115 | LIBRARY | ARCHIVE | `/production/libraries/archive/index` | CHILD | FOUND · `10_Archive__03_ARCHIVE_INDEX` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 116 | LIBRARY | ARCHIVE | `/production/libraries/archive/assets` | CHILD | FOUND · `10_Archive__04_ARCHIVED_ASSETS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 117 | LIBRARY | ARCHIVE | `/production/libraries/archive/authorities` | CHILD | FOUND · `10_Archive__05_ARCHIVED_AUTHORITIES` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 118 | LIBRARY | ARCHIVE | `/production/libraries/archive/characters` | CHILD | FOUND · `10_Archive__06_ARCHIVED_CHARACTERS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 119 | LIBRARY | ARCHIVE | `/production/libraries/archive/environments` | CHILD | FOUND · `10_Archive__07_ARCHIVED_ENVIRONMENTS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 120 | LIBRARY | ARCHIVE | `/production/libraries/archive/expressions` | CHILD | FOUND · `10_Archive__08_ARCHIVED_EXPRESSIONS` | MISSING | MATCHING | PASS | PASS | 14/14 |
| 121 | LIBRARY | ARCHIVE | `/production/libraries/archive/detail` | DETAIL | FOUND · `10_Archive__02_ARCHIVE_DETAIL` | MISSING | MATCHING | PASS | PASS | 14/14 |
