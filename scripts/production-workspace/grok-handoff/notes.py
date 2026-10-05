"""README_FIRST + NOTES text for the Grok lite pack (P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1)."""
import handoff_data as H

RULE = '=' * 78


def readme(t, envs):
    new = [p['plate_id'] for e in envs for p in e['new_plates']]
    return f"""SITE 00 · PRODUCTION WORKSPACE · GROK LITE PACK
{RULE}
SPRINT      {H.SPRINT}
PIPELINE    01 SONNET (structure) → 02 OPUS (architecture + refinement) → [THIS HANDOFF] → 03 GROK (assets / environments / icons + injection) → 04 COMPOSER
WORKSPACE   {H.WORKSPACE_VERSION}
GENERATION  NONE in this pack. OpenArt was not accessed.

{RULE}
THIS PACK IS FOR
{RULE}
GROK CANONICAL ASSET / ENVIRONMENT / ICON PASS on the SITE 00 Production workspace —
7 tabs: HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY.

GROK MUST:
  KEEP THE FUNCTION
  REBUILD / CORRECT THE LOOK
  USE THE APPROVED AUTHORITIES AS STRICT REFERENCES
  GENERATE CLEAN ENVIRONMENT PLATES WHERE REQUIRED      → ENVIRONMENT_GROUPS (new_plate_required = true)
  GENERATE CLEAN ISOLATED ASSETS WHERE REQUIRED          → ENVIRONMENT_GROUPS isolated_assets
  GENERATE / CLEAN CANONICAL ICONS                       → ICON_INVENTORY grok_action
  MOUNT RESULTS INTO THE EXISTING RUNTIME                → existing resolvers, existing routes

GROK MUST NOT:
  REDESIGN WORKSPACE ARCHITECTURE
  CHANGE ROUTES
  CHANGE INFORMATION ARCHITECTURE
  REWRITE COPY
  REPLACE FUNCTIONAL COMPONENTS
  USE FULL SCREEN PNGS AS THE UI
  GENERATE ONE PLATE PER PAGE WHEN PAGES SHARE A WORLD (one master, many crops)
  HARD-CODE NDXBOOK VISUALS INTO GLOBAL WORKSPACE / HOST CHROME
  LEAK PROJECT ASSETS INTO HOST CHROME, OR OVERWRITE PROJECT VISUALS WITH SITE 00 HOST LANGUAGE
  GENERATE OR ALTER PEOPLE (residents, actors, characters are project / identity media)

{RULE}
IMAGE RULE — REFERENCE ONLY
{RULE}
Every image in AUTHORITIES/, ICONS/ and REFERENCE/ is a COMPRESSED COPY (about 1200–1600 px on the long
edge, JPEG / quantised PNG) made for inspecting composition, material and icon language.
THESE COPIES ARE REFERENCE ONLY. THEY ARE NOT RUNTIME ASSETS.
Never mount, crop, trace or upscale them into the product. Originals stay untouched in the repo / founder
asset library; every copy records its source in MANIFEST (authority id, upload pack path or git blob).

{RULE}
READ ORDER
{RULE}
  1  README_FIRST.txt
  2  NOTES/GROK_EXECUTION_RULES.txt
  3  MANIFEST/PRODUCTION_WORKSPACE_ENVIRONMENT_GROUPS.json   credit plan: what to generate, once
  4  MANIFEST/PRODUCTION_WORKSPACE_GROK_HANDOFF.json          per-surface execution map
  5  MANIFEST/PRODUCTION_WORKSPACE_SCREEN_TREE.json           parents → children → grandchildren → states / overlays
  6  MANIFEST/PRODUCTION_WORKSPACE_ICON_INVENTORY.json
  7  MANIFEST/PRODUCTION_WORKSPACE_RUNTIME_ROUTES.json        generate → mount → open route → compare → fix
  8  MANIFEST/PRODUCTION_WORKSPACE_RESPONSIVE_MAP.json
  9  NOTES/ASSET_PASS_SCOPE.txt · NOTES/SUPERSESSION_NOTES.txt

{RULE}
QUICK ANSWERS (no repo archaeology needed)
{RULE}
Canonical tabs ............ HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY (+ global host shell)
Parent pages .............. {t['parent']} — hub.root · inbox.root · design.brand|experience|surfaces|compiler|assets|viewport (six
                            parent-level Design modes) · experience.root · expression.floor · library.root · activity.root
Surfaces mapped ........... {t['surfaces']} ({t['child']} child · {t['grandchild']} grandchild · {t['interaction_overlay']} state / drawer / modal / overlay / inspection / preview / full-screen)
Distinct visual authorities  {t['distinct_visual_authorities']} surfaces carry their own authority; every other surface inherits (inherits_visual_from)
Shared environments ....... {t['environment_groups']} environment groups — see ENVIRONMENT_GROUPS.json
New plates (whole pass) ... {t['new_plates']}: {', '.join(new)}
Isolated assets ........... {t['isolated_asset_candidates']} objects / materials in {t['isolated_asset_sets']} sets
Canonical icon packs ...... ICONS/NAV__FOUNDER_MASTERS_AUTHORITY_SHEET.png (+ NAV_MASTERS/*) — bottom nav
                            ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg — functional / mode / pipeline / object / status / review / geometry
Routes that must work ..... all {t['surfaces']} entries in RUNTIME_ROUTES.json (must_remain_functional = true)
Superseded visuals ........ NOTES/SUPERSESSION_NOTES.txt (none of them is an authority; one DO-NOT-USE contrast sheet is in ICONS/)

{RULE}
FOLDERS
{RULE}
README_FIRST.txt
MANIFEST/     six JSON manifests (the execution map)
AUTHORITIES/  distinct parent / child / grandchild / interaction authorities, per tab (founder boards first; runtime
              captures only where a founder FINAL directive or no recovered image makes the runtime the authority)
ICONS/        canonical icon authority sheets + individual nav masters + current-source sheets + one DO-NOT-USE contrast sheet
REFERENCE/    global environment language board, DWS asset pack, host shell board, portrait-tablet board, current plates sheet
NOTES/        GROK_EXECUTION_RULES.txt · SUPERSESSION_NOTES.txt · ASSET_PASS_SCOPE.txt

{RULE}
CANONICAL DESIGN LANGUAGE (confirmed against the repo authorities)
{RULE}
Luminous white atrium · red ring illumination · suspended boards and screens · central red/black core on a pedestal ·
bright white production floor · white sci-fi fabrication chamber · dark obsidian canon vault band (LIBRARY only) ·
white paper panels with red rails, black line icons with red accents · spatial, world-like — NOT generic SaaS, NOT a flat
dashboard, NOT random card grids. See REFERENCE/GLOBAL__ENVIRONMENT_LANGUAGE_BOARD.jpg.

{RULE}
HOST / PROJECT FIREWALL
{RULE}
SITE00_HOST       {H.REGIONS['SITE00_HOST']}
PROJECT_BODY      {H.REGIONS['PROJECT_BODY']}
SHARED_WORKSPACE  {H.REGIONS['SHARED_WORKSPACE']}
Every surface lists its regions (visual_regions) and its class (HOST_VISUAL / PROJECT_VISUAL / GLOBAL_WORKSPACE_VISUAL).
Known runtime leak to NOT reproduce: FIREWALL-01 (host selector thumbnail hard-coded to the NDXBOOK cover).
"""


def execution_rules():
    lines = [f"GROK EXECUTION RULES · {H.SPRINT}", RULE, '',
             'LOOP (per asset): GENERATE → MOUNT → OPEN ROUTE → COMPARE → FIX',
             '  1. Pick the next item in ASSET_PASS_SCOPE.txt order (P0 first).',
             '  2. Generate ONE master per plate id; derive every crop from it (transformation_rules).',
             '  3. Mount through the existing resolver (below). Never add a new CDN URL; never inline a data URI.',
             '  4. Open every member route of the environment group (RUNTIME_ROUTES.json direct_route) at',
             '     393×852, 834×1194 and 1440×900 and compare with the pack authority.',
             '  5. Fix crop / light / scale. A route that breaks or starts scrolling = revert the mount.',
             '',
             'MOUNT POINTS (existing — do not invent new ones)',
             '  Workspace plates / objects   src/site00/productionAssets/productionAssetRegistry.ts (PRODUCTION_ASSETS, productionAssetPaths)',
             '                               + src/site00/productionAssets/routeAssetManifests.ts; files under public/site00/production-authority-assets/',
             '  Design pack objects / icons  src/site00/components/productionAuthority/designPackAssets.ts (+ design-pack/SOURCE.json hash lock: re-lock it)',
             '  Bottom nav glyphs            src/site00/components/productionHub/bottom-nav/masters/0N_*.png (ProductionNavIcon)',
             '  Functional line icons        live SVG in src/site00/components/productionAuthority/iaKit.tsx · HubBody.tsx (NodeIcon) · productionHub/icons.tsx',
             '  Character Fabrication        shared/site00-character-fabrication/assets.ts (slots + receipts)',
             '  PROJECT world art            project-keyed slots (project.ndxbook.world.*) — never the global registry (FIREWALL-02)',
             '',
             'OUTPUT NAMING',
             '  grok.site00.production.<plate_or_object_id lower-case>.v1  (e.g. grok.site00.production.plate-atrium-master.v1)',
             '  project art: grok.site00.project.ndxbook.<id>.v1',
             '  Record every output as a ProductionAssetRecord (sourceType, repoPath, publicPath, usedByRoutes, variantOf, confidence, notes = generation id).',
             '',
             'FORMATS + MINIMUM SIZES',
             '  Environment plates  JPG or WebP, sRGB, master ≥ the spec in ENVIRONMENT_GROUPS.json (no upscaled 1k plates)',
             '  Isolated objects    PNG with alpha, ≥1024 px (cores ≥2048 px)',
             '  Materials           JPG ≥1024 px square',
             '  Functional icons    SVG, currentColor stroke, 24/32 grid, round caps — matched to ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg',
             '  Bottom nav glyphs   transparent PNG at the master size (384 px class); notify dots stay outside the image',
             '',
             'HARD RULES',
             '  - Keep the function: every route in RUNTIME_ROUTES.json keeps working with the same query states.',
             '  - Rebuild the look only through assets and icons; layout, copy, IA and components stay as they are.',
             '  - Plates are CLEAN: no baked text, UI, pins, labels, route lines, logos, people in focal areas, or project media.',
             '  - Screens / boards inside plates stay BLANK — live media mounts into them.',
             '  - Never build UI from the pack images; they are REFERENCE ONLY.',
             '  - One master per shared world. Credit plan = ENVIRONMENT_GROUPS.json new_plates (8), not one per page.',
             '  - Host chrome (SITE00_HOST) never carries project art; PROJECT_BODY art is keyed to the project slug.',
             '  - Do not generate or alter people (residents, actors, characters) — identity media is out of scope (U-17).',
             '  - Do not touch LEGACY surfaces: hub.machine (+ overlays), design.section.* (legacy bench, U-10).',
             '  - Keep D-PARENT-NOSCROLL: 0 px page scroll on every parent at the three presets.',
             '  - DWS icon rule: use the pack vocabulary, prefer live SVG for functional icons, do not invent a new icon family.',
             '  - Activity verb chips stay TEXT (authority); no event glyphs.',
             '',
             'FOUNDER DIRECTIVES THAT DECIDE AUTHORITY']
    lines += [f'  {k:<24} {v}' for k, v in H.DIRECTIVES.items()]
    lines += ['', 'CONFLICTS — EXPLICIT PRIORITY (never two equal authorities)']
    for c in H.CONFLICTS:
        lines += [f"  {c['id']} · {c['surface']} · {c['status']}", f"     priority 1  {c['priority_1']}", f"     priority 2  {c['priority_2']}", f"     rule        {c['grok_rule']}"]
    return '\n'.join(lines) + '\n'


def supersession():
    lines = [f'SUPERSESSION NOTES · {H.SPRINT}', RULE, '',
             'Status vocabulary: CANONICAL · SUPERSEDED · LEGACY · REFERENCE_ONLY · RUNTIME_ACTIVE.',
             'Source of record: artifacts/production-full-authority-forensics/ (605 visual authorities over every git ref + founder upload;',
             '430 canonical, 53 superseded, 109 duplicates, 13 conflicting).', '',
             'EXCLUDED FROM THIS PACK (not authorities for Grok)']
    for item, status, by in H.SUPERSEDED:
        lines += [f'  - {item}', f'      {status} → {by}']
    lines += ['', 'KEPT AS CONTRAST ONLY', '  - ICONS/NAV__SUPERSEDED_CONTRAST__DO_NOT_USE.jpg — the V1 line glyphs that appear inside the screen authorities\' nav bars, and the',
              '    48 px house substitute now mounted for HUB. Both are superseded by the founder master family.', '',
              'CONFLICTS (explicit priority)']
    for c in H.CONFLICTS:
        lines += [f"  - {c['id']} {c['surface']}: {c['status']} — 1) {c['priority_1']} · 2) {c['priority_2']}"]
    lines += ['', 'NAMED IN THE BRIEF BUT NOT CANONICAL (do not create)']
    for n in H.NOT_CANONICAL:
        lines += [f"  - {n['name']}: {n['finding']} → {n['grok_rule']}"]
    lines += ['', 'NOT RETRIEVABLE IN THIS CONTAINER (recorded, not needed for the pass)',
              '  - U-01 eight Inbox v2 desktop/tablet boards exist only as OpenArt CDN URLs (OpenArt not accessed by policy) — runtime governs.',
              '  - U-02 Experience/Library master ZIPs (LITE copies used; identical compositions).',
              '  - U-03 Expression LITE v1 (EXPR2 governs).']
    return '\n'.join(lines) + '\n'


def asset_scope(envs, t):
    lines = [f'ASSET PASS SCOPE · {H.SPRINT}', RULE, '',
             f"Credit plan: {t['new_plates']} new environment plates + {t['isolated_asset_candidates']} isolated objects / materials ({t['isolated_asset_sets']} sets) + icon cleanup.",
             f"{t['surfaces_new_plate']} surfaces get a new plate (as crops of those {t['new_plates']} masters); {t['surfaces_reuse_environment']} surfaces reuse an existing environment as-is.", '',
             'ENVIRONMENT GROUPS']
    for e in envs:
        lines += [f"  {e['environment_group_id']} · {e['name']}", f"    region {e['region']} · members {e['member_count']} · new plate required: {'YES' if e['new_plate_required'] else 'NO'}",
                  f"    current: {', '.join(e['current_runtime_assets']) or '—'}", f"    assessment: {e['current_assessment']}"]
        for p in e['new_plates']:
            lines += [f"    NEW  {p['plate_id']}: {p['spec']}"]
        for r in e['transformation_rules']:
            lines += [f'    rule {r}']
        lines += ['']
    lines += ['ISOLATED ASSETS']
    for x in H.ISOLATED_ASSETS:
        lines += [f"  {x['priority']} {x['asset_id']} ×{x['count']} · {x['action']} · {x['region']}", f"     {x['spec']}", f"     authority: {x['authority']} · current: {x['current']}"]
    lines += ['', 'ICONS (see ICON_INVENTORY.json for every record)',
              '  P0  nav.hub — restore the founder pavilion master (git 43611fd8) in place of the 48 px substitute',
              '  P0  host.menu · host.dropdown · host.reticle — clean live SVG to DWS §01 / HOSTREF',
              '  P0  design.stage.* — 7 pipeline stage objects (also OBJ-PIPELINE-STAGES)',
              '  P1  ia.* functional line icons (Inbox / Experience / Library / Activity) — DWS §05–§07 vocabulary, SVG',
              '  P1  hub.node.* project-component glyphs — match HUBREF tiles, keep runtime node ids',
              '  P2  design.pack.* nav + object icons — clean ≥512 px from the pack cells',
              '  P2  cf.line.* Character Fabrication generic line set — DWS vocabulary, SVG',
              '  NO_ACTION  activity.verb.* (text chips by authority) · status chips (live CSS) · legacy machine icons · provider marks',
              '', 'OUT OF SCOPE FOR THIS PASS',
              '  - layout, routes, IA, copy, components, viewport presets, project context',
              '  - people / identity media (residents, actors, characters, Entry 002 subject)',
              '  - LEGACY: hub.machine and its overlays; design.section.* legacy bench (until Composer mounts the DWS successor)',
              '  - Design interaction states that are canonical in DWS 04 but not mounted (drawer / inspector / review / compare / export)',
              '  - Library records (they render the real asset registry)']
    return '\n'.join(lines) + '\n'
