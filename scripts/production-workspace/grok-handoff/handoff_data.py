"""Audit decisions for P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1.

Everything here is a recorded decision with its evidence; build_handoff.py turns it into the six manifests,
the NOTES and the lite ZIP. Route tables, icon names and asset records are NOT copied here — they are read
from the runtime (runtime-model.tsx) so the manifests cannot drift from the code.
"""

SPRINT = 'P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1'
WORKSPACE_VERSION = 'site00-production-workspace@7ec5501d (tunnel cursor/studio-world-resident-geometry-complete-production-injection1)'
PROJECT_DEFAULT = 'ndxbook'

TABS = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY']
LEVELS = ['PARENT', 'CHILD', 'GRANDCHILD', 'STATE', 'DRAWER', 'MODAL', 'FULL_SCREEN', 'OVERLAY', 'INSPECTION', 'PREVIEW']
ASSET_ACTIONS = ['REUSE_EXISTING', 'REGENERATE_ENVIRONMENT', 'GENERATE_ISOLATED_OBJECT', 'GENERATE_BOTANICAL', 'GENERATE_MATERIAL', 'GENERATE_ICON', 'LIVE_CODE', 'NO_ACTION']
PRESETS = {'MOBILE': [393, 852], 'TABLET': [834, 1194], 'DESKTOP': [1440, 900]}

NAV = [
    ('hub', 'HUB', '/production'),
    ('inbox', 'INBOX', '/production/queue'),
    ('design', 'DESIGN', '/production/:slug/design'),
    ('experience', 'EXPERIENCE', '/production/:slug/experience/world'),
    ('expression', 'EXPRESSION', '/production/:slug/expression'),
    ('library', 'LIBRARY', '/production/libraries'),
    ('activity', 'ACTIVITY', '/production/activity'),
]

# Founder directives that decide authority (text authorities; recorded in the forensic lineage).
DIRECTIVES = {
    'D-SHELL-CANON': 'sonnet_production_authority_handoff_v2 / 07_DESKTOP_TABLET_SHELL_OVERRIDE — tablet/desktop host = full-width panel, left cluster, hamburger far right; nav icon-left. Image chrome in screen authorities is NOT literal.',
    'D-PARENT-NOSCROLL': 'PARENT_3VIEW README — HUB is the density benchmark; no Production parent/root page scrolls vertically; tablet and mobile are first-class compositions.',
    'D-ACTIVITY-FINAL': 'ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1 (FOUNDER AUTHORITY: FINAL) — DOMAIN × TIME project memory, timeline + inspector; giant hero retired; mobile fits one viewport, inspector is a slide-up drawer.',
    'D-INBOX-FINAL': 'INBOX.ONE-VIEWPORT-FAMILY-CONVERGENCE.OPUS1 (FOUNDER AUTHORITY: FINAL) — children = rail + rows + inspector; stacked v2 cards are stale presentation.',
    'D-INBOX-ROOT': 'MEMORY 2026-10-04 — NEEDS YOU root follows PARENT_3VIEW 01_INBOX.',
    'D-HUB-LEGACY': 'MEMORY 2026-10-03 — hub machine (/production?view=machine) is LEGACY_LOCKED.',
    'D-ROSTER': 'MEMORY 2026-10-04 RECOVERY4 — casting-thumbnails-v1 is the resident work look.',
    'D-EXPR-MEDIA': 'FULL-AUTHORITY OPUS2 — Expression media priority (character / actor / look / frame / environment / performance first); no strip collapse.',
    'D-NAV-MASTERS': 'MEMORY 2026-10-03 — founder wanted the founder master PNG bottom-nav icons (commits d3d060b0, 43611fd8).',
    'DWS-FIREWALL': 'DWS_SONNET_LITE README — STUDIO OS OWNS SHELL / NAVIGATION / CONTROLS / PIPELINE / REVIEW GRAMMAR. ACTIVE PROJECT OWNS PROJECT ARTIFACTS / IMAGERY / EXPRESSIVE CONTENT.',
    'DWS-ICON-RULE': 'DWS_SONNET_LITE README — USE 05_SYSTEM_PACKS AS VISUAL VOCABULARY. PREFER LIVE SVG FOR FUNCTIONAL ICONS. DO NOT INVENT A NEW ICON FAMILY.',
    'DWS-IMPLEMENTATION-RULE': 'DWS_SONNET_LITE README — LIVE REACT/CSS/SVG FOR NAVIGATION, TABS, PANELS, DRAWERS, MODALS, CARDS, FILTERS, SEARCH, PIPELINE, ON YOUR TABLE, INSPECTORS, STATUS AND INTERACTION STATES. DO NOT USE THE REFERENCE SCREENS AS FLATTENED FULL-PAGE BACKGROUNDS.',
}

# Visual regions (section 26). Every surface record lists which of these it contains.
REGIONS = {
    'SITE00_HOST': 'Host top strip (tab wordmark + SITE 00 / STUDIO WORLD, project selector chrome, ITEMS NEED YOU reticle + count, menu), bottom/host nav (7 glyphs, labels, notify dots), host menu panel. Same on every project.',
    'PROJECT_BODY': 'Active-project artifacts: entry/record thumbnails, characters, residents-as-cast, world art, decision objects, project core object, project copy. Changes with the project slug.',
    'SHARED_WORKSPACE': 'Studio OS workspace language: environments (atrium, production floor, chamber, corridor, vault band), panels/boards/rails, pipeline objects, status chips, functional icons, materials. Same for every project.',
}

# Known host/project leak in the current runtime (do not reproduce; Composer fixes it).
FIREWALL_FINDINGS = [
    {
        'id': 'FIREWALL-01',
        'region': 'SITE00_HOST',
        'finding': 'Host project selector thumbnail is hard-coded to the NDXBOOK cover (HubImage slotId="project.ndxbook.cover") while the label follows the route slug.',
        'evidence': ['src/site00/components/productionHub/chrome.tsx (ProductionWorkspaceHeader + ProductionHostTop)'],
        'rule_for_grok': 'Do not bake any project cover into host chrome art. The selector thumbnail is a PROJECT_BODY slot keyed project.<slug>.cover.',
        'owner': 'Composer (runtime fix) — not this sprint, not Grok.',
    },
    {
        'id': 'FIREWALL-02',
        'region': 'PROJECT_BODY',
        'finding': 'Experience plates are NDXBOOK world art (pyramid-core city, archipelago, spire). They are project visuals, but the runtime mounts experience.worldHero from the global production asset registry.',
        'evidence': ['src/site00/productionAssets/productionAssetRegistry.ts (experience.worldHero)', 'src/site00/components/productionAuthority/realm/realmData.ts (worldPlate)'],
        'rule_for_grok': 'Deliver Experience world plates as project-keyed assets (project=ndxbook). Never paint them into shared workspace chrome or other projects.',
        'owner': 'Grok (asset naming) + Composer (project-keyed resolver).',
    },
    {
        'id': 'FIREWALL-03',
        'region': 'SHARED_WORKSPACE / PROJECT_BODY',
        'finding': 'HUB and DESIGN atrium authorities bake the NDXBOOK core object (black-red pyramid / red-black shard) into the shared atrium.',
        'evidence': ['HUBREF d89b8fd6 / c77b4b50 / 0af8bf87', 'T12 design boards', 'production-hub-hero-*-v1.jpg (crops of the authority screenshot)'],
        'rule_for_grok': 'Generate the atrium as an EMPTY-PEDESTAL plate (SHARED_WORKSPACE) and the core as a separate transparent object keyed to the project (PROJECT_BODY).',
        'owner': 'Grok.',
    },
]

# ── Environment groups (section 15: credit rationing) ───────────────────────────────────────────────
# new_plates = the number of generations Grok spends for the WHOLE group, never one per page.
ENV_GROUPS = [
    {
        'environment_group_id': 'ENV-ATRIUM',
        'name': 'PRODUCTION ATRIUM — luminous white rotunda, red ring illumination, suspended boards, central pedestal',
        'region': 'SHARED_WORKSPACE',
        'authority': ['AUTHORITIES/HUB/*__HUBREF.jpg (hub hero band)', 'AUTHORITIES/DESIGN/*__3VIEW__PAR3V.jpg (Design chamber)', 'REFERENCE/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg §08 ENVIRONMENT PLATES (main atrium + crops)'],
        'current_runtime_assets': ['hub.hero.mobile', 'hub.hero.tablet', 'hub.hero.desktop', 'design.atrium', 'design.pack.atrium', 'design-pack/plates/crop-01..04'],
        'current_assessment': 'hub.hero.* are crops of the authority SCREENSHOT (1296–2304 px wide bands, core + wall screens baked in); design.atrium is a GROK1 plate in review (U-12); design-pack plates are 90–278 px crops of the pack sheet.',
        'shared_environment': True,
        'new_plate_required': True,
        'new_plates': [
            {'plate_id': 'PLATE-ATRIUM-MASTER', 'spec': '16:9 master ≥ 4096×2304, EMPTY central pedestal (no core object), ring lights on, wall/suspended screens blank or neutral, no text, no UI, no people in the central third.'},
        ],
        'transformation_rules': [
            'HUB hero band = horizontal crop through the pedestal: mobile ≈3.55:1 (authority band 1296×365), tablet ≈5:1 (1792×358), desktop ≈6.5:1 (2304×355). Pedestal stays at 50% x.',
            'DESIGN chamber (BRAND / EXPERIENCE / SURFACES / COMPILER / ASSETS) = full master behind live suspended panels; mobile = 9:16 centre crop, tablet portrait = 3:4 centre crop.',
            'Pack plate crops 01–04 (ASSETS / SURFACES tables) are cut from the master — not new generations.',
            'Core object composited live (OBJ-NDX-CORE on HUB, OBJ-DESIGN-CORE in the Design chamber); suspended panels and pipeline are live code.',
        ],
        'isolated_objects': ['OBJ-NDX-CORE', 'OBJ-DESIGN-CORE'],
        'notes': 'One world, one master. HUB and the five atrium Design modes are the same space at different crops (credit rationing).',
    },
    {
        'environment_group_id': 'ENV-VIEWPORT-CORRIDOR',
        'name': 'DESIGN · VIEWPORT corridor — white corridor, red light lines, circular floor pedestal for the live device',
        'region': 'SHARED_WORKSPACE',
        'authority': ['AUTHORITIES/DESIGN/DESIGN__design.viewport__3VIEW__PAR3V.jpg', 'AUTHORITIES/DESIGN/DESIGN__design.viewport__MOBILE__T12.jpg'],
        'current_runtime_assets': ['design.viewportCorridor'],
        'current_assessment': 'GROK1 corridor (1600×900, in review) has no pedestal and weaker red saturation than T12.',
        'shared_environment': False,
        'new_plate_required': True,
        'new_plates': [{'plate_id': 'PLATE-VIEWPORT-CORRIDOR', 'spec': '16:9 ≥ 3200×1800, one-point corridor, red light lines, circular ring pedestal at centre floor, EMPTY (no device, no screen content).'}],
        'transformation_rules': [
            'The device is LIVE: CSS frame + iframe of the client app (/app/preview/fixture-app-ndxbook in dev, /app/projects/:slug in production). Never bake a phone or a screenshot.',
            'Mobile = 9:16 centre crop keeping the pedestal; tablet portrait = 3:4 centre crop.',
        ],
        'isolated_objects': [],
        'notes': 'Also the only environment of the PREVIEW surface (live runtime mount).',
    },
    {
        'environment_group_id': 'ENV-PRODUCTION-FLOOR',
        'name': 'EXPRESSION PRODUCTION FLOOR — bright white studio, red ring lights, suspended blank screens',
        'region': 'SHARED_WORKSPACE',
        'authority': ['AUTHORITIES/EXPRESSION/EXPRESSION__expression.floor__*__T12.jpg', 'AUTHORITIES/EXPRESSION/EXPRESSION__expression.<family>__DESKTOP-TABLET__EXPR2.jpg'],
        'current_runtime_assets': ['expression.stageHero'],
        'current_assessment': 'MISMATCH — production-expression-stage-hero-v1.jpg is a DARK red faceted stage with cameras; every authority shows a luminous WHITE production floor.',
        'shared_environment': True,
        'new_plate_required': True,
        'new_plates': [{'plate_id': 'PLATE-PRODUCTION-FLOOR', 'spec': '21:9 master ≥ 4096×1756, white studio, red ring lights, 3–5 suspended screens left BLANK (live project media mounts into them), no people, no text.'}],
        'transformation_rules': [
            'Floor hero and all 10 family heroes are band crops of the same master (authority bands ≈3.6:1 on mobile, ≈5:1 tablet, ≈6:1 desktop).',
            'Screen content (B&W subject media, cast, looks) is PROJECT_BODY media mounted live from the Expression media resolver — never baked.',
            'Floor tiles (PRODUCTION FLOORS row) keep project media; no plate per tile.',
        ],
        'isolated_objects': [],
        'notes': 'One plate replaces expression.stageHero for 41 Expression surfaces (floor + 40 family routes).',
    },
    {
        'environment_group_id': 'ENV-CF-CHAMBER',
        'name': 'CHARACTER FABRICATION chamber — white sci-fi chamber, glass pod, red rings, chrome machinery',
        'region': 'SHARED_WORKSPACE',
        'authority': ['AUTHORITIES/EXPRESSION/EXPRESSION__expression.character-fabrication__MOBILE__CF.jpg', 'AUTHORITIES/EXPRESSION/EXPRESSION__expression.character-fabrication.stations__MOBILE__CF_BOARD.jpg'],
        'current_runtime_assets': ['grok.site00.character-fabrication.fabrication.machine.chamber.v1', 'grok.site00.character-fabrication.fabrication.environments.simulation-volume.v1'],
        'current_assessment': 'Already a Grok family (received 2026-09-30) and refined to the 16 authority screens. 82 of 108 CF slots received.',
        'shared_environment': False,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['Reuse both chamber plates. The subject in the pod is a resident/actor receipt (PROJECT_BODY), never part of the plate.'],
        'isolated_objects': ['CF-RESIDUAL-SLOTS'],
        'notes': '24 CF slots still flagged grokRequired (13 wardrobe garments, 3 look-candidate layer sets, 8 simulation previews) — specified in shared/site00-character-fabrication/assets.ts; optional P3 in this pass.',
    },
    {
        'environment_group_id': 'ENV-EXPERIENCE-WORLD',
        'name': 'NDXBOOK WORLD — white-silver future city around a black-red pyramid core, red rings and paths (PROJECT world)',
        'region': 'PROJECT_BODY',
        'authority': ['AUTHORITIES/EXPERIENCE/*__EL.jpg', 'REFERENCE/GLOBAL__ENVIRONMENT_LANGUAGE_BOARD.jpg (T12 tab-root hero crop = plaza language; U-07 priority 2)'],
        'current_runtime_assets': ['experience.worldHero'],
        'current_assessment': 'One GROK1 city plate stands in for every family view (registry: "zone crops are SOURCE_MATCH_UNCERTAIN"). Authorities show five distinct views of one world.',
        'shared_environment': True,
        'new_plate_required': True,
        'new_plates': [
            {'plate_id': 'PLATE-WORLD-SPHERE', 'spec': 'Floating island world / sphere seen from above-oblique, transparent or white ground, pyramid core at the centre (WORLD root, tab root).'},
            {'plate_id': 'PLATE-WORLD-ARCHIPELAGO-MAP', 'spec': 'Isometric archipelago map of districts around the core, CLEAN — no pins, labels, route lines or rings baked (ZONES, PATHS, PRESENCE, OVERVIEW, DESTINATIONS overlays are live).'},
            {'plate_id': 'PLATE-WORLD-CENTRAL-PLAZA', 'spec': 'Eye-level central plaza with the pyramid core inside red rings, day light (STATES, INTERACTIONS, ACCESS, INHABITANTS heroes, ZONE DETAIL, T12 tab-root hero).'},
            {'plate_id': 'PLATE-WORLD-SPIRE', 'spec': 'Vertical floating spire world (WORLD · ARCHITECTURE).'},
            {'plate_id': 'PLATE-WORLD-AURORA-CITY', 'spec': 'AURORA floating city with red spires (WORLD · DETAIL, ENVIRONMENTS feature).'},
        ],
        'transformation_rules': [
            'Map plates are clean bases; pins, labels, route lines, rings, avatars and selection states stay live overlays.',
            'STATES (lighting / time / atmosphere / live) reuse PLATE-WORLD-CENTRAL-PLAZA; time-of-day variants (dusk, night) are optional P3 grades of the same plate, not new worlds.',
            'Inhabitant / character portraits are project cast media — no generation here.',
            'Record thumbnails (zone, district, destination, environment rows) are data-driven project records — keep them; no generation in this pass.',
            'Register every plate under the project (project.ndxbook.world.*), never in the global production registry (FIREWALL-02).',
        ],
        'isolated_objects': ['OBJ-PORTAL-GATE', 'OBJ-INTERACTION-OBJECT-SET'],
        'notes': '47 surfaces share 5 world plates (not 47).',
    },
    {
        'environment_group_id': 'ENV-CANON-VAULT',
        'name': 'LIBRARY CANON VAULT — dark obsidian landscape, red pyramid and beam (hero band); full-width white archive',
        'region': 'SHARED_WORKSPACE',
        'authority': ['REFERENCE/GLOBAL__ENVIRONMENT_LANGUAGE_BOARD.jpg (T12 canon-vault band crop; U-08 priority 2)', 'AUTHORITIES/LIBRARY/*__EL.jpg (archive language)'],
        'current_runtime_assets': ['library.canon', 'library.geometry.01', 'library.geometry.02', 'library.geometry.03'],
        'current_assessment': 'library.canon matches the T12 canon-vault band; geometry plates match the dark red record language.',
        'shared_environment': True,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['Reuse. Records show the real registry assets (live data) — do not replace them with generated thumbnails.', 'Archive chrome stays full-width white live code.'],
        'isolated_objects': ['MAT-SWATCH-SET'],
        'notes': 'Only the MATERIALS family needs new material swatches (shared with Design).',
    },
    {
        'environment_group_id': 'ENV-DESIGN-OBJECT-LIBRARY',
        'name': 'DESIGN SYSTEM OBJECTS — pipeline stage objects, device frames, material swatches, mode boards (isolated, no environment)',
        'region': 'SHARED_WORKSPACE',
        'authority': ['ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg §02/§03', 'REFERENCE/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg §06 §07 §09'],
        'current_runtime_assets': ['design-pack/stages/*.png (76×76)', 'design-pack/devices/*.png (≤225 px)', 'design-pack/swatches/*.jpg (≤83×41)', 'design.board.* (768×768, GROK1 in review)'],
        'current_assessment': 'Exact crops of the pack sheet at 41–225 px: correct objects, unusable resolution.',
        'shared_environment': True,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['Regenerate each object isolated on transparency at ≥1024 px, same silhouette and material as the pack cell.', 'Mode boards (design.board.*) are reused unless they clash with the regenerated atrium light (P3).'],
        'isolated_objects': ['OBJ-PIPELINE-STAGES', 'OBJ-DEVICE-FRAMES', 'MAT-SWATCH-SET'],
        'notes': 'Used by DESIGN (pipeline row on all six modes, panels) and LIBRARY (materials, references, icons records).',
    },
    {
        'environment_group_id': 'ENV-WORKSPACE-PAPER',
        'name': 'WORKSPACE PAPER — white live panels, red accents, rails, chips, inspectors (no environment plate)',
        'region': 'SHARED_WORKSPACE',
        'authority': ['AUTHORITIES/INBOX/*', 'AUTHORITIES/ACTIVITY/*', 'REFERENCE/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg §01–§05 §10'],
        'current_runtime_assets': [],
        'current_assessment': 'Founder FINAL directives (D-INBOX-FINAL, D-ACTIVITY-FINAL) define these compositions; the runtime implements them.',
        'shared_environment': True,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['LIVE_CODE only. Do not add hero plates (the Activity hero was retired by D-ACTIVITY-FINAL).'],
        'isolated_objects': [],
        'notes': 'Grok work here is icons only (IA line set → DWS pack style).',
    },
    {
        'environment_group_id': 'ENV-HOST-SHELL',
        'name': 'SITE 00 HOST SHELL — top host strip, bottom / host nav, menu panel',
        'region': 'SITE00_HOST',
        'authority': ['REFERENCE/HOST__SHELL_AUTHORITY_BOARD.jpg', 'ICONS/NAV__FOUNDER_MASTERS_AUTHORITY.png', 'D-SHELL-CANON'],
        'current_runtime_assets': ['nav.hub … nav.activity (bottom-nav/masters/*.png)'],
        'current_assessment': 'Live code. HUB nav glyph is a 48 px generic substitute (see ICON nav.hub).',
        'shared_environment': True,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['LIVE_CODE + icons. No project art in host chrome (FIREWALL-01).'],
        'isolated_objects': [],
        'notes': '',
    },
    {
        'environment_group_id': 'ENV-HUB-MACHINE-LEGACY',
        'name': 'HUB MACHINE (legacy chamber) — /production?view=machine',
        'region': 'SHARED_WORKSPACE',
        'authority': ['SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL 00–14 (not packed)'],
        'current_runtime_assets': [],
        'current_assessment': 'LEGACY_LOCKED (D-HUB-LEGACY). Reachable from the HUB world panel link.',
        'shared_environment': False,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['NO_ACTION. Do not restyle, do not remove the link.'],
        'isolated_objects': [],
        'notes': '',
    },
    {
        'environment_group_id': 'ENV-DESIGN-RECONSTRUCTION-BENCH',
        'name': 'DESIGN · WORKSPACE SECTIONS (legacy reconstruction bench) — design/workspace|references|assets|pages|skins|history|more',
        'region': 'SHARED_WORKSPACE',
        'authority': ['public/visual-references/founder/site00/* (founder calibration 2026-09-09, mobile; not packed)'],
        'current_runtime_assets': [],
        'current_assessment': 'Runtime mounts the legacy DesignWorkspaceCore bench (U-10). The DWS unified workspace successor lives on another branch and is not mounted.',
        'shared_environment': False,
        'new_plate_required': False,
        'new_plates': [],
        'transformation_rules': ['NO_ACTION in this pass. Composer mounts the DWS successor first.'],
        'isolated_objects': [],
        'notes': '',
    },
]

# ── Isolated assets (objects, materials) ───────────────────────────────────────────────────────────
ISOLATED_ASSETS = [
    {'asset_id': 'OBJ-NDX-CORE', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'PROJECT_BODY', 'count': 1, 'priority': 'P0', 'spec': 'NDXBOOK black-red crystal pyramid core on transparency, ≥2048 px, lit for the white atrium (red inner glow, chrome edges). Keyed project.ndxbook.core.', 'authority': 'AUTHORITIES/HUB/*__HUBREF.jpg (centre of the world panel)', 'current': 'baked into hub.hero.* crops', 'used_by': ['hub.root']},
    {'asset_id': 'OBJ-DESIGN-CORE', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'PROJECT_BODY', 'count': 1, 'priority': 'P0', 'spec': 'Red-black faceted crystal shard (project core of the Design chamber) on transparency, ≥2048 px tall.', 'authority': 'AUTHORITIES/DESIGN/*__3VIEW__PAR3V.jpg (chamber centre)', 'current': 'design.core — production-design-project-core-v1.png 324×720 (GROK1, in review)', 'used_by': ['design.brand', 'design.experience', 'design.surfaces', 'design.compiler', 'design.assets']},
    {'asset_id': 'OBJ-PIPELINE-STAGES', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'SHARED_WORKSPACE', 'count': 7, 'priority': 'P1', 'spec': 'INTELLIGENCE, CONCEPT, EXPERIENCE, SURFACES, ASSETS, AUTHORITY, PRODUCTION stage objects (chrome / glass / red), transparent, ≥1024 px, matching DWS icon pack §02/§03 cells.', 'authority': 'ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg §02 §03', 'current': 'design-pack/stages/0N-*.png at 76×76', 'used_by': ['design.brand', 'design.experience', 'design.surfaces', 'design.compiler', 'design.assets', 'design.viewport']},
    {'asset_id': 'OBJ-DEVICE-FRAMES', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'SHARED_WORKSPACE', 'count': 3, 'priority': 'P2', 'spec': 'DESKTOP 16:9 monitor, TABLET 4:3, MOBILE 9:19 frames with EMPTY transparent screens, ≥1600 px.', 'authority': 'REFERENCE/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg §07', 'current': 'design-pack/devices/*.png (67–225 px)', 'used_by': ['design.surfaces', 'design.experience', 'design.compiler', 'design.assets']},
    {'asset_id': 'MAT-SWATCH-SET', 'action': 'GENERATE_MATERIAL', 'region': 'SHARED_WORKSPACE', 'count': 8, 'priority': 'P2', 'spec': 'WHITE ACRYLIC, MATTE WHITE, CHROME, SMOKED GLASS, CLEAR GLASS, RED GLOW GLASS, GRAPHITE, NEUTRAL PAPER — square material spheres/swatches, ≥1024 px, studio white light.', 'authority': 'REFERENCE/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg §09', 'current': 'design-pack/swatches/*.jpg (≤83×41)', 'used_by': ['design.brand', 'design.assets', 'library.materials']},
    {'asset_id': 'OBJ-PORTAL-GATE', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'PROJECT_BODY', 'count': 1, 'priority': 'P2', 'spec': 'NDXBOOK access/portal gate (cube arch with red glowing portal), transparent, ≥1600 px. Keyed project.ndxbook.world.portal-gate.', 'authority': 'AUTHORITIES/EXPERIENCE/EXPERIENCE__experience.access.conditional__DESKTOP-TABLET__EL.jpg', 'current': 'none (registry missing slot PORTAL: MISSING_SOURCE_ASSET)', 'used_by': ['experience.access', 'experience.interactions']},
    {'asset_id': 'OBJ-INTERACTION-OBJECT-SET', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'PROJECT_BODY', 'count': 6, 'priority': 'P3', 'spec': 'Interactable world objects (kiosk, portal node, info totem, plinth, signal pole, planter) on transparency, ≥1024 px. Keyed project.ndxbook.world.objects.*.', 'authority': 'AUTHORITIES/EXPERIENCE/EXPERIENCE__experience.interactions__DESKTOP-TABLET__EL.jpg', 'current': 'none', 'used_by': ['experience.interactions']},
    {'asset_id': 'CF-RESIDUAL-SLOTS', 'action': 'GENERATE_ISOLATED_OBJECT', 'region': 'PROJECT_BODY', 'count': 24, 'priority': 'P3', 'spec': 'Character Fabrication slots still flagged grokRequired (garments, look-candidate layers, simulation previews) — exact slot ids, aspect ratios and destinations are in shared/site00-character-fabrication/assets.ts (buildCharacterAssetSlots).', 'authority': 'CF authority screens (AUTHORITIES/EXPRESSION/*CF*.jpg)', 'current': 'slot placeholders', 'used_by': ['expression.character-fabrication']},
]

# Authority decisions for conflicts (section 12: explicit priority, never two equal authorities).
CONFLICTS = [
    {'id': 'U-07', 'surface': 'experience.root', 'status': 'UNRESOLVED — founder decision', 'priority_1': 'EL 01_WORLD_ROOT (route body; later, route-specific)', 'priority_2': 'T12/PAR3V 08 immersive landing (environment language for PLATE-WORLD-CENTRAL-PLAZA only)', 'grok_rule': 'Keep the runtime body (EL). Use T12 only as the look of the world hero.'},
    {'id': 'U-08', 'surface': 'library.root', 'status': 'UNRESOLVED — founder decision', 'priority_1': 'EL 01_AUTHORITIES_ROOT (route body)', 'priority_2': 'T12/PAR3V 10 canon-vault landing (hero band language; library.canon already matches)', 'grok_rule': 'No new plate; keep the runtime body.'},
    {'id': 'U-09', 'surface': 'shell.host-top', 'status': 'RESOLVED by D-SHELL-CANON', 'priority_1': 'D-SHELL-CANON text + runtime host', 'priority_2': 'screen-authority chrome (not literal)', 'grok_rule': 'Never copy host chrome out of a screen authority.'},
    {'id': 'INBOX-CHILDREN', 'surface': 'inbox.watching|resolved|all|messages|system', 'status': 'RESOLVED by D-INBOX-FINAL', 'priority_1': 'runtime (rail + rows + inspector, founder FINAL)', 'priority_2': 'IBX2 v2 mobile cards (model + copy only)', 'grok_rule': 'Do not rebuild the stacked v2 cards.'},
    {'id': 'ACTIVITY-HERO', 'surface': 'activity.root', 'status': 'RESOLVED by D-ACTIVITY-FINAL', 'priority_1': 'runtime one-viewport DOMAIN × TIME memory (founder FINAL)', 'priority_2': 'T12/PAR3V 11 (density + chip language only; its hero is retired)', 'grok_rule': 'No Activity hero plate.'},
    {'id': 'NAV-FAMILY', 'surface': 'shell.bottom-nav', 'status': 'RESOLVED by D-NAV-MASTERS', 'priority_1': 'founder master PNGs (architectural family, d3d060b0 / 43611fd8)', 'priority_2': 'BOTTOM_NAV_ICON_FAMILY_V1 line glyphs seen inside the screen authorities (superseded)', 'grok_rule': 'Use the master family; screen-authority nav glyphs are not literal.'},
    {'id': 'NAV-HUB-SUBSTITUTE', 'surface': 'shell.bottom-nav (HUB)', 'status': 'RESOLVED to the founder master — runtime regression flagged', 'priority_1': 'founder pavilion master 01_HUB.png (git blob e2a248e1 @ 43611fd8, 384×284)', 'priority_2': '48×48 design-pack house glyph that replaced it in 94831d12 (cherry-pick of afb22c27)', 'grok_rule': 'Restore/clean the pavilion master; do not draw a new house.'},
    {'id': 'U-17', 'surface': 'expression.casting.*', 'status': 'UNRESOLVED — founder decision (content)', 'priority_1': 'authority-board crops for CHARACTERS (dark-haired Entry 002 subject)', 'priority_2': 'actor receipts keep their own identity (SW-017 blonde)', 'grok_rule': 'Do not generate or alter people; identity media is out of scope.'},
]

# Superseded / legacy authorities excluded from the pack (lineage kept in the manifest + NOTES).
SUPERSEDED = [
    ('SITE00_Mobile_Projects_and_Production_Reference_Pack (2026-09-29)', 'SUPERSEDED', 'all Production screens → T12 / PAR3V / EXPR2 / EL'),
    ('NDXBOOK_Narrative_Engine_Screen_Pack + screen recording (2026-09-29)', 'SUPERSEDED for Production', 'legacy NME widget only; video never packed'),
    ('DWS_SONNET_LITE 01–03 mode roots (2026-10-02)', 'SUPERSEDED', 'T12 design ×18 + PAR3V 02–07 (DWS 04 interaction expressions + 05 system packs stay CANONICAL)'),
    ('SITE00_VIEWPORT_TAB_SONNET_LITE (2026-10-02)', 'SUPERSEDED', 'T12 viewport'),
    ('STUDIOOS_INBOX_ACTIVITY_3VIEW_AUTHORITY_LITE_v1 (2026-10-03)', 'SUPERSEDED', 'lens model retired — D-INBOX-FINAL / D-ACTIVITY-FINAL'),
    ('SW_INBOX v2 children 01–05 (presentation only)', 'CONFLICTING → presentation superseded', 'D-INBOX-FINAL; model + copy still canonical'),
    ('STUDIOOS_EXPRESSION_AUTHORITY_LITE_v1', 'SUPERSEDED', 'EXPR2 (identical sampled route)'),
    ('T12 / PAR3V 11 ACTIVITY hero band', 'RETIRED', 'D-ACTIVITY-FINAL (giant hero removed)'),
    ('docs/site00/bottom-nav/GROK_ICON_PACK (2026-10-02)', 'SUPERSEDED', 'BOTTOM_NAV_ICON_FAMILY_V1, then the founder master PNGs'),
    ('docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1 line glyphs (2026-10-02)', 'SUPERSEDED', 'founder master PNGs (2026-10-03, D-NAV-MASTERS); kept as a DO-NOT-USE contrast sheet'),
    ('src/site00/components/productionHub/bottom-nav/0N_*.png (512 px keyed line set)', 'LEGACY (unreferenced)', 'bottom-nav/masters/*.png'),
    ('bottom-nav/masters/01_HUB.png 48×48 house (94831d12)', 'GENERIC SUBSTITUTE', 'founder pavilion master (git e2a248e1)'),
    ('production-hub-crystal-core-v1.jpg (hub.crystal)', 'UNUSED in runtime', 'registry note "Activity hero" is stale (hero retired)'),
    ('artifacts/production-authority-opus/{vp}/NN-*.jpg', 'NOT AUTHORITY (U-13)', 'OPUS1 live captures'),
    ('SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL 00–14', 'CANONICAL but LEGACY_LOCKED route', '/production?view=machine — no Grok action'),
]

# Surfaces that the brief names but the canonical system does not have (recorded so Grok does not invent them).
NOT_CANONICAL = [
    {'name': 'INBOX NEAR / MID / FAR', 'finding': 'Not present in any recovered authority (T12, IBX2, PAR3V, IA3V), the runtime model (inboxModel.ts) or git history.', 'grok_rule': 'Do not create.'},
    {'name': 'EXPRESSION WORK / WORLD / CONTINUITY / FORMATS / PRODUCTION / HISTORY', 'finding': 'Canonical successors are the 10 EXPR2 families (NARRATIVE, CASTING, LOOK + WARDROBE, CAST + PERFORMANCE, SETS + SCENES, STORYBOARD, REVIEW + HANDOFF, FORMAT STUDIO, CONTENT PACKAGE, CAMPAIGN BOARD) behind the Production Floor; continuity lives inside CASTING and LOOK.', 'grok_rule': 'Use the 10 families; do not add the old six.'},
    {'name': 'DESIGN family selector / screen-state selector / grid / bounds / reference mode / asset + component inspection', 'finding': 'Canonical in DWS 04 interaction expressions, but the unified DWS workspace is not mounted on the tunnel line (U-10). Mounted today: project selector (host), six mode tabs, VIEWPORT preset / safe area / orientation / zoom controls, live client mount, validation sheet link.', 'grok_rule': 'No visuals for unmounted states in this pass.'},
]
