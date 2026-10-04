# ROUTE MATRIX — 40 Expression routes

All under the existing `/production/:projectSlug/expression/*` wildcard (no router change). `:id` = record id. `?entry=` carries the campaign entry.

| # | Family | Route | Kind | URL (under /production/ndxbook/expression/) | Authority | Data source |
|---|---|---|---|---|---|---|
| 01 | narrative | root | root | `narrative` | `01_Narrative/00_narrative-root` | Narrative momentum plan (engine plan when served, else canonical compile) |
| 02 | narrative | story | child | `narrative/story` | `01_Narrative/01_story` | Narrative momentum plan (engine plan when served, else canonical compile) |
| 03 | narrative | structure | child | `narrative/structure` | `01_Narrative/02_structure` | Narrative momentum plan (engine plan when served, else canonical compile) |
| 04 | narrative | momentum | child | `narrative/momentum` | `01_Narrative/03_momentum` | Narrative momentum plan (engine plan when served, else canonical compile) |
| 05 | narrative | proof | child | `narrative/proof` | `01_Narrative/04_proof` | Narrative momentum plan (engine plan when served, else canonical compile) |
| 06 | casting | root | root | `casting` | `02_Casting/00_casting-root` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 07 | casting | roles | child | `casting/roles` | `02_Casting/01_roles` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 08 | casting | actors | child | `casting/actors` | `02_Casting/02_actors` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 09 | casting | characters | child | `casting/characters` | `02_Casting/03_characters` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 10 | casting | continuity | child | `casting/continuity` | `02_Casting/04_continuity` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 11 | casting | role-detail | detail | `casting/roles/:id` | `02_Casting/05_role-detail` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 12 | casting | actor-profile | detail | `casting/actors/:id` | `02_Casting/06_actor-profile` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 13 | casting | character-profile | detail | `casting/characters/:id` | `02_Casting/07_character-profile` | cast.requirements (ROLE) · acting catalogue (ACTOR) · cast.characters (CHARACTER) · authority sheets |
| 14 | look | root | root | `wardrobe` | `03_Look_Wardrobe/00_look-wardrobe-root` | cast.looks · temporal looks · authority sheets · hub look node art |
| 15 | look | looks | child | `wardrobe/looks` | `03_Look_Wardrobe/01_looks` | cast.looks · temporal looks · authority sheets · hub look node art |
| 16 | look | outfits | child | `wardrobe/outfits` | `03_Look_Wardrobe/02_outfits` | cast.looks · temporal looks · authority sheets · hub look node art |
| 17 | look | hair | child | `wardrobe/hair` | `03_Look_Wardrobe/03_hair` | cast.looks · temporal looks · authority sheets · hub look node art |
| 18 | look | makeup | child | `wardrobe/makeup` | `03_Look_Wardrobe/04_makeup` | cast.looks · temporal looks · authority sheets · hub look node art |
| 19 | look | accessories | child | `wardrobe/accessories` | `03_Look_Wardrobe/05_accessories` | cast.looks · temporal looks · authority sheets · hub look node art |
| 20 | look | fittings | child | `wardrobe/fittings` | `03_Look_Wardrobe/06_fittings` | cast.looks · temporal looks · authority sheets · hub look node art |
| 21 | look | continuity | child | `wardrobe/continuity` | `03_Look_Wardrobe/07_continuity` | cast.looks · temporal looks · authority sheets · hub look node art |
| 22 | performance | root | root | `performance` | `04_Cast_Performance/00_performance-root` | cast.characters direction/beats · catalogue ranges · scenes · shotCastByShotId |
| 23 | performance | scenes | child | `performance/scenes` | `04_Cast_Performance/01_scenes` | cast.characters direction/beats · catalogue ranges · scenes · shotCastByShotId |
| 24 | performance | beats | child | `performance/beats` | `04_Cast_Performance/02_beats` | cast.characters direction/beats · catalogue ranges · scenes · shotCastByShotId |
| 25 | performance | takes | child | `performance/takes` | `04_Cast_Performance/03_takes` | cast.characters direction/beats · catalogue ranges · scenes · shotCastByShotId |
| 26 | sets | root | root | `sets` | `05_Sets_Scenes/00_sets-scenes-root` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 27 | sets | environments | child | `sets/environments` | `05_Sets_Scenes/01_environments` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 28 | sets | sets | child | `sets/sets` | `05_Sets_Scenes/02_sets` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 29 | sets | zones | child | `sets/zones` | `05_Sets_Scenes/03_zones` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 30 | sets | props | child | `sets/props` | `05_Sets_Scenes/04_props` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 31 | sets | graphics | child | `sets/graphics` | `05_Sets_Scenes/05_graphics` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 32 | sets | camera | child | `sets/camera` | `05_Sets_Scenes/06_camera` | package item SETS (NOT STARTED) · look props · proof visual forms · beat shot functions |
| 33 | storyboard | root | root | `storyboard` | `06_Storyboard/00_storyboard-root` | hub frames · scenes · graph storyboard/keyframes nodes · founder gate |
| 34 | storyboard | sequence-detail | detail | `storyboard/sequence/:id` | `06_Storyboard/01_sequence-detail` | hub frames · scenes · graph storyboard/keyframes nodes · founder gate |
| 35 | storyboard | keyframes | child | `storyboard/keyframes` | `06_Storyboard/02_keyframes` | hub frames · scenes · graph storyboard/keyframes nodes · founder gate |
| 36 | review | root | root | `review` | `07_Review_Handoff/00_review-handoff-root` | package checklist · cast gate · graph blockers/dependencies · founder gate |
| 37 | review | approval-detail | detail | `review/approval/:id` | `07_Review_Handoff/01_approval-detail` | package checklist · cast gate · graph blockers/dependencies · founder gate |
| 38 | format | root | root | `format-studio` | `08_Format_Studio/00_format-studio` | plan.formatAdaptations · keyframes node (master state) |
| 39 | package | root | root | `content-package` | `09_Content_Package/00_content-package` | deliverables derived from formatAdaptations (PLANNED) · checklist |
| 40 | campaign | root | root | `campaign-board` | `10_Campaign_Board/00_campaign-board` | completed packages (0) · plan.campaignHandoff |

Discovered before this sprint: 8 sub-routes (7 screens + character-fabrication) with no children / details and no Format / Package / Campaign routes. Implemented: 40 / 40. Route mismatches vs authority: 0 (route ids follow the authority file stems; family segments reuse the existing sub-workspace ids — `wardrobe` hosts LOOK + WARDROBE, `performance` hosts CAST + PERFORMANCE).
