/**
 * Public redesign — asset slot registry (SONNET-STRUCTURE1).
 *
 * Every non-live-code visual requirement gets a STABLE slot id. The live page renders a neutral,
 * text-free placeholder (`AssetSlot`) and Grok later injects the real asset by registering a URL in
 * `PUBLIC_REDESIGN_ASSET_URLS` — no React edits, no layout guessing.
 *
 * Rules: never bake UI copy into a raster; never use authority screenshot crops as placeholders.
 */

export type AssetSlotType =
  | 'environment-plate'
  | 'machine-illustration'
  | 'card-thumbnail'
  | 'surface-material';

export type AssetSlotSpec = {
  id: string;
  routes: string[];
  authority: string[];
  role: string;
  assetType: AssetSlotType;
  dimensions: { w: number; h: number };
  aspect: string;
  crop: 'cover' | 'contain' | 'cover-top' | 'cover-bottom';
  transparentBackground: boolean;
  position: string;
  responsive: string;
  fallback: string;
  requiredForFidelity: boolean;
  grokRequired: boolean;
  svgCssCouldReplace: boolean;
};

const plate = (
  id: string,
  routes: string[],
  authority: string[],
  role: string,
  position: string,
  extra: Partial<AssetSlotSpec> = {},
): AssetSlotSpec => ({
  id,
  routes,
  authority,
  role,
  assetType: 'environment-plate',
  dimensions: { w: 1170, h: 2532 },
  aspect: '9:19.5',
  crop: 'cover',
  transparentBackground: false,
  position,
  responsive:
    'FULL-BLEED BEHIND CONTENT. OBJECT-FIT COVER, FOCAL POINT CENTER. ON WIDE VIEWPORTS THE PHONE ARTBOARD CROPS IT; NO TEXT, NO UI.',
  fallback: 'NEUTRAL LUMINOUS WHITE GRADIENT (CSS).',
  requiredForFidelity: true,
  grokRequired: true,
  svgCssCouldReplace: false,
  ...extra,
});

const machine = (
  id: string,
  routes: string[],
  authority: string[],
  role: string,
  position: string,
  dimensions: { w: number; h: number },
  extra: Partial<AssetSlotSpec> = {},
): AssetSlotSpec => ({
  id,
  routes,
  authority,
  role,
  assetType: 'machine-illustration',
  dimensions,
  aspect: `${dimensions.w}:${dimensions.h}`,
  crop: 'contain',
  transparentBackground: true,
  position,
  responsive: 'SCALES WITH ITS CONTAINER (CONTAIN). TRANSPARENT PNG/WEBP. NO TEXT BAKED IN.',
  fallback: 'LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).',
  requiredForFidelity: false,
  grokRequired: true,
  svgCssCouldReplace: true,
  ...extra,
});

const thumb = (
  id: string,
  routes: string[],
  authority: string[],
  role: string,
  position: string,
  dimensions = { w: 600, h: 400 },
): AssetSlotSpec => ({
  id,
  routes,
  authority,
  role,
  assetType: 'card-thumbnail',
  dimensions,
  aspect: `${dimensions.w}:${dimensions.h}`,
  crop: 'cover',
  transparentBackground: false,
  position,
  responsive: 'FILLS ITS CARD REGION (COVER). NO TEXT. EDGE FADES TO CARD SURFACE IN CSS, NOT IN THE ASSET.',
  fallback: 'NEUTRAL WARM-WHITE GRADIENT (CSS).',
  requiredForFidelity: true,
  grokRequired: true,
  svgCssCouldReplace: false,
});

export const PUBLIC_REDESIGN_ASSET_SLOTS: AssetSlotSpec[] = [
  /* ORIGIN */
  plate(
    'ENV.ORIGIN.COLLAPSED',
    ['/', '/origin'],
    ['01_ORIGIN_MAIN'],
    'DOUBLE-ZERO LANDMARK COURTYARD — COLLAPSED ORIGIN. EXISTING ORIGIN ENVIRONMENT ASSET STAYS MOUNTED UNTIL REPLACED.',
    'FULL-BLEED, BEHIND HEADER / HERO / CARDS',
    { requiredForFidelity: true },
  ),
  plate(
    'ENV.ORIGIN.EXPANDED',
    ['/', '/origin'],
    ['02_ORIGIN_IDNTY_EXPANDED', '03_ORIGIN_BLDR_EXPANDED', '04_ORIGIN_EVOLVE_EXPANDED'],
    'DOUBLE-ZERO LANDMARK WITH WATERFALL SKYLINE — EXPANDED PANEL STATE (CLEAN, NO BAKED PANELS).',
    'FULL-BLEED; LOWER 2/3 IS COVERED BY THE GLASS PANEL',
  ),
  thumb('CARD.ORIGIN.IDNTY', ['/', '/origin'], ['01_ORIGIN_MAIN'], 'IDNTY CARD ATRIUM VIGNETTE (TREE, WHITE ARCH).', 'ORIGIN CARD 01 — FILLS CARD BACKGROUND', { w: 400, h: 560 }),
  thumb('CARD.ORIGIN.BLDR', ['/', '/origin'], ['01_ORIGIN_MAIN'], 'BLDR CARD STUDIO VIGNETTE (GLASS DISPLAY, PLINTH).', 'ORIGIN CARD 02 — FILLS CARD BACKGROUND', { w: 400, h: 560 }),
  thumb('CARD.ORIGIN.EVOLVE', ['/', '/origin'], ['01_ORIGIN_MAIN'], 'EVOLVE CARD LANDSCAPE VIGNETTE (CLIFF ROAD, SKYLINE).', 'ORIGIN CARD 03 — FILLS CARD BACKGROUND', { w: 400, h: 560 }),
  machine('ILLUSTRATION.ORIGIN.IDENTITY', ['/', '/origin'], ['02_ORIGIN_IDNTY_EXPANDED'], 'RED-LINE FACIAL GEOMETRY WIREFRAME (IDENTITY PANEL HERO).', 'EXPANDED IDENTITY PANEL — RIGHT OF TITLE', { w: 560, h: 560 }),
  machine('ILLUSTRATION.ORIGIN.BLDR', ['/', '/origin'], ['03_ORIGIN_BLDR_EXPANDED'], 'RED-LINE ISOMETRIC BUILD LATTICE (BUILDER PANEL HERO).', 'EXPANDED BUILDER PANEL — RIGHT OF TITLE', { w: 560, h: 560 }),
  machine('ILLUSTRATION.ORIGIN.EVOLVE', ['/', '/origin'], ['04_ORIGIN_EVOLVE_EXPANDED'], 'RED-LINE EXPLODED PROPERTY LATTICE (EVOLVE PANEL HERO).', 'EXPANDED EVOLVE PANEL — RIGHT OF TITLE', { w: 560, h: 560 }),
  machine('ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE', ['/', '/origin'], ['04_ORIGIN_EVOLVE_EXPANDED'], 'REFINE PATH VIGNETTE (CONCENTRIC ORBIT).', 'EVOLVE PANEL — CHOOSE YOUR PATH COLUMN 01', { w: 400, h: 400 }),
  machine('ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL', ['/', '/origin'], ['04_ORIGIN_EVOLVE_EXPANDED'], 'INSTALL PATH VIGNETTE (LAYERED LATTICE).', 'EVOLVE PANEL — CHOOSE YOUR PATH COLUMN 02', { w: 400, h: 400 }),
  machine('ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM', ['/', '/origin'], ['04_ORIGIN_EVOLVE_EXPANDED'], 'TRANSFORM PATH VIGNETTE (STAR + ORBITS).', 'EVOLVE PANEL — CHOOSE YOUR PATH COLUMN 03', { w: 400, h: 400 }),

  /* IDNTY */
  plate(
    'ENV.IDNTY.ATRIUM',
    ['/idnty/state', '/idnty/:state', '/idnty/:state/:step', '/idnty/:state/review'],
    [
      '01_IDNTY_DIAGNOSTIC_OVERVIEW', '02_IDNTY_STATE_00_FOUNDATION', '03_IDNTY_STATE_01_REFINE',
      '04_IDNTY_STATE_02_EVOLUTION', '05_IDNTY_STATE_03_BUILD_READY',
      '01_FOUNDATION_PRIMARY_GOAL', '02_FOUNDATION_AUDIENCE', '03_FOUNDATION_TIMELINE', '04_FOUNDATION_BUDGET', '05_FOUNDATION_REVIEW',
      '01_REFINE_EXISTING_ASSETS', '02_REFINE_CONDITION', '03_REFINE_GAPS', '04_REFINE_REVIEW',
      '01_EVOLUTION_AREAS', '02_EVOLUTION_GOALS', '03_EVOLUTION_TIMELINE', '04_EVOLUTION_REVIEW',
      '01_BUILD_READY_VERIFICATION', '02_BUILD_READY_EVIDENCE', '03_BUILD_READY_AUTHORITY_CHECK', '04_BUILD_READY_REVIEW_VERIFICATION',
    ],
    'LUMINOUS WHITE ATRIUM — CIRCULAR DAIS, STEPS, PLANTERS, RING LIGHT. SHARED ACROSS EVERY IDNTY STATE AND STEP (CONTINUITY).',
    'FULL-BLEED BEHIND THE HERO + MACHINE; PANEL SITS OVER THE LOWER REGION',
  ),
  machine('MACHINE.IDNTY.FOUNDATION.ORB', ['/idnty/starting-at-zero'], ['02_IDNTY_STATE_00_FOUNDATION'], 'GLOSSY RED SPHERE (OPTIONAL MATERIAL UPGRADE OVER THE SVG ORB).', 'MACHINE STAGE CENTER', { w: 480, h: 480 }, { requiredForFidelity: false }),
  machine('MACHINE.IDNTY.PARTIAL.LATTICE', ['/idnty/some-pieces-exist'], ['03_IDNTY_STATE_01_REFINE'], 'TRANSLUCENT RED HEX LATTICE VOLUME (OPTIONAL MATERIAL UPGRADE OVER THE SVG).', 'MACHINE STAGE CENTER', { w: 520, h: 640 }, { requiredForFidelity: false }),
  machine('MACHINE.IDNTY.EVOLUTION.WAVES', ['/idnty/ready-for-evolution'], ['04_IDNTY_STATE_02_EVOLUTION'], 'CONCENTRIC ELLIPSE WAVEFORM (OPTIONAL MATERIAL UPGRADE OVER THE SVG).', 'MACHINE STAGE CENTER', { w: 640, h: 560 }, { requiredForFidelity: false }),
  machine('MACHINE.IDNTY.AUTHORITY.STAR', ['/idnty/build-ready'], ['05_IDNTY_STATE_03_BUILD_READY'], 'GLOSSY RED FOUR-POINT STAR (OPTIONAL MATERIAL UPGRADE OVER THE SVG).', 'MACHINE STAGE CENTER', { w: 560, h: 560 }, { requiredForFidelity: false }),

  /* BLDR */
  plate('ENV.BLDR.COMMAND_CENTER', ['/bldr/state'], ['01_BLDR_COMMAND_CENTER'], 'SAME WHITE ATRIUM FAMILY AS IDNTY, BUILD-DAIS VARIANT.', 'FULL-BLEED BEHIND HERO + MACHINE'),
  machine('MACHINE.BLDR.TOWER', ['/bldr/state'], ['01_BLDR_COMMAND_CENTER'], 'STACKED GLASS-SLAB ASSEMBLY TOWER WITH RED INSERTS AND FLOATING PATH PANELS.', 'MACHINE STAGE CENTER, ABOVE DAIS', { w: 760, h: 900 }, { requiredForFidelity: true, svgCssCouldReplace: false }),
  thumb('CARD.BLDR.PATH.SITE', ['/bldr/state'], ['01_BLDR_COMMAND_CENTER'], 'SITE PATH CARD ILLUSTRATION (SKYLINE TOWERS WITH RED PLANES).', 'COMMAND CENTER CARD 01 — TOP REGION', { w: 400, h: 360 }),
  thumb('CARD.BLDR.PATH.WORLD', ['/bldr/state'], ['01_BLDR_COMMAND_CENTER'], 'WORLD PATH CARD ILLUSTRATION (TERRACED PLATES WITH TREES).', 'COMMAND CENTER CARD 02 — TOP REGION', { w: 400, h: 360 }),
  thumb('CARD.BLDR.PATH.SYSTEMS', ['/bldr/state'], ['01_BLDR_COMMAND_CENTER'], 'SYSTEMS PATH CARD ILLUSTRATION (SERVER-RACK STACK).', 'COMMAND CENTER CARD 03 — TOP REGION', { w: 400, h: 360 }),
  thumb('CARD.BLDR.PATH.EXTENSIONS', ['/bldr/state'], ['01_BLDR_COMMAND_CENTER'], 'EXTENSIONS PATH CARD ILLUSTRATION (FLOATING RED CUBES).', 'COMMAND CENTER CARD 04 — TOP REGION', { w: 400, h: 360 }),
  plate('ENV.BLDR.PATH.OVERVIEW', ['/bldr/state?path=overview'], ['02_BLDR_OVERVIEW'], 'DAYLIGHT BUILDER ATRIUM — GLASS PATH PANELS OVER A ROUND TABLE.', 'UPPER 36% OF THE SCREEN; GLASS PANEL COVERS THE REST', { dimensions: { w: 1170, h: 1000 }, aspect: '1170:1000' }),
  plate('ENV.BLDR.PATH.SITE', ['/bldr/state?path=site'], ['03_BLDR_SITE'], 'RED-INSERT GLASS BUILDING OVER A WHITE TERRACE.', 'UPPER 36% OF THE SCREEN', { dimensions: { w: 1170, h: 1000 }, aspect: '1170:1000' }),
  plate('ENV.BLDR.PATH.WORLD', ['/bldr/state?path=world'], ['04_BLDR_WORLD'], 'RED GLOBE WITH TERRACED PLATES AND WATERFALL BACKDROP.', 'UPPER 36% OF THE SCREEN', { dimensions: { w: 1170, h: 1000 }, aspect: '1170:1000' }),
  plate('ENV.BLDR.PATH.SYSTEMS', ['/bldr/state?path=systems'], ['05_BLDR_SYSTEMS'], 'SERVER-STACK TOWER WITH SYSTEM ARCHITECTURE / FLOW PANELS.', 'UPPER 36% OF THE SCREEN', { dimensions: { w: 1170, h: 1000 }, aspect: '1170:1000' }),
  plate('ENV.BLDR.PATH.EXTENSIONS', ['/bldr/state?path=extensions'], ['06_BLDR_EXTENSIONS'], 'DISPLAY-CASE GALLERY WITH PLUG-IN / ADD-ON LIBRARY PANELS.', 'UPPER 36% OF THE SCREEN', { dimensions: { w: 1170, h: 1000 }, aspect: '1170:1000' }),
  machine('ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW', ['/bldr/state?path=overview'], ['02_BLDR_OVERVIEW'], 'RED-LINE CUBE LATTICE (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.BLDR.PATH.PANEL.SITE', ['/bldr/state?path=site'], ['03_BLDR_SITE'], 'RED-LINE BUILDING LATTICE (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.BLDR.PATH.PANEL.WORLD', ['/bldr/state?path=world'], ['04_BLDR_WORLD'], 'RED-LINE TERRACE LATTICE (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS', ['/bldr/state?path=systems'], ['05_BLDR_SYSTEMS'], 'RED-LINE SYSTEM-STACK LATTICE (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS', ['/bldr/state?path=extensions'], ['06_BLDR_EXTENSIONS'], 'RED-LINE LAYERED SLAB STACK (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.BLDR.FRAMEWORK.STEP', ['/bldr/state?path=*'], ['02_BLDR_OVERVIEW', '03_BLDR_SITE', '04_BLDR_WORLD', '05_BLDR_SYSTEMS', '06_BLDR_EXTENSIONS'], 'FIVE FRAMEWORK STEP ILLUSTRATIONS (ORBIT, LAYERS, RINGS, HEX, HELIX) — SHARED ACROSS PATHS.', 'FRAMEWORK ROW, 5 COLUMNS', { w: 240, h: 240 }, { requiredForFidelity: false }),

  /* EVOLVE */
  plate('ENV.EVOLVE.INTERVENTION_CENTER', ['/evolve/state'], ['01_EVOLVE_INTERVENTION_CENTER'], 'WHITE ATRIUM WITH LAYERED GLASS PROPERTY UNDER INTERVENTION.', 'FULL-BLEED BEHIND HERO + MACHINE'),
  machine('MACHINE.EVOLVE.PROPERTY_TOWER', ['/evolve/state'], ['01_EVOLVE_INTERVENTION_CENTER'], 'THREE-LAYER GLASS PROPERTY (SURFACE / SYSTEM / FOUNDATION) WITH RED INTERVENTION BLOCKS.', 'MACHINE STAGE CENTER', { w: 760, h: 900 }, { requiredForFidelity: true, svgCssCouldReplace: false }),
  thumb('CARD.EVOLVE.PATH.REFINE', ['/evolve/state'], ['01_EVOLVE_INTERVENTION_CENTER'], 'REFINE PATH CARD ILLUSTRATION (HALF-RED ORBIT TARGET).', 'PATH CARD 01 — TOP REGION', { w: 400, h: 360 }),
  thumb('CARD.EVOLVE.PATH.INSTALL', ['/evolve/state'], ['01_EVOLVE_INTERVENTION_CENTER'], 'INSTALL PATH CARD ILLUSTRATION (RED-INSERT SLAB STACK).', 'PATH CARD 02 — TOP REGION', { w: 400, h: 360 }),
  thumb('CARD.EVOLVE.PATH.TRANSFORM', ['/evolve/state'], ['01_EVOLVE_INTERVENTION_CENTER'], 'TRANSFORM PATH CARD ILLUSTRATION (EXPLODED CUBE ASSEMBLY).', 'PATH CARD 03 — TOP REGION', { w: 400, h: 360 }),
  plate('ENV.EVOLVE.PATH.REFINE', ['/evolve/state?path=refine'], ['02_EVOLVE_REFINE'], 'CURRENT-STATE / TARGET-STATE PANELS AROUND A GLASS CUBE ON A DAIS.', 'UPPER 45% OF THE SCREEN', { dimensions: { w: 1170, h: 1100 }, aspect: '1170:1100' }),
  plate('ENV.EVOLVE.PATH.INSTALL', ['/evolve/state?path=install'], ['03_EVOLVE_INSTALL'], 'SYSTEM MODULES / INTEGRATION LAYERS AROUND A MACHINE STACK.', 'UPPER 45% OF THE SCREEN', { dimensions: { w: 1170, h: 1100 }, aspect: '1170:1100' }),
  plate('ENV.EVOLVE.PATH.TRANSFORM', ['/evolve/state?path=transform'], ['04_EVOLVE_TRANSFORM'], 'EXISTING / TRANSFORMED PANELS AROUND AN EXPLODED GLASS ASSEMBLY.', 'UPPER 45% OF THE SCREEN', { dimensions: { w: 1170, h: 1100 }, aspect: '1170:1100' }),
  machine('ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE', ['/evolve/state?path=refine'], ['02_EVOLVE_REFINE'], 'CONCENTRIC TARGET (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL', ['/evolve/state?path=install'], ['03_EVOLVE_INSTALL'], 'LAYERED LATTICE (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),
  machine('ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM', ['/evolve/state?path=transform'], ['04_EVOLVE_TRANSFORM'], 'STAR + ORBITAL NET (PANEL HEADER).', 'PANEL HEADER RIGHT', { w: 420, h: 420 }, { requiredForFidelity: false }),

  /* LOCATIONS */
  plate('ENV.LOCATIONS.ARCH', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'WARM MARBLE ARCHWAY CORRIDOR WITH LIGHT SHAFTS; DOUBLE-ZERO LANDMARK AT THE BASE.', 'FULL-BLEED BEHIND THE DIRECTORY'),
  thumb('CARD.LOCATIONS.BLDR', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'BLDR ROW — STUDIO WITH GLASS DISPLAY.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
  thumb('CARD.LOCATIONS.EVOLVE', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'EVOLVE ROW — TERRACE WITH TREE AND SKYLINE.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
  thumb('CARD.LOCATIONS.SITES', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'SITES ROW — CLIFFSIDE SPIRE CITY.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
  thumb('CARD.LOCATIONS.SERVICES', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'SERVICES ROW — SHOWROOM WITH DISPLAY.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
  thumb('CARD.LOCATIONS.SYSTEM', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'SYSTEM ROW — GLASS CYLINDER MACHINERY.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
  thumb('CARD.LOCATIONS.ABOUT', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'ABOUT ROW — DOUBLE-ZERO WALL RELIEF WITH TREES.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
  thumb('CARD.LOCATIONS.JOURNAL', ['/origin/locations'], ['01_LOCATIONS_MAIN'], 'JOURNAL ROW — MOUNTAIN TERRACE WITH TABLE.', 'ROW RIGHT HALF', { w: 520, h: 300 }),
];

/** Grok registers final URLs here. Empty on purpose in this pass. */
export const PUBLIC_REDESIGN_ASSET_URLS: Partial<Record<string, string>> = {};

export function getAssetSlot(id: string): AssetSlotSpec | undefined {
  return PUBLIC_REDESIGN_ASSET_SLOTS.find((s) => s.id === id);
}
