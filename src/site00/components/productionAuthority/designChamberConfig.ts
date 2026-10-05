import type { ProductionDesignMode } from '../../config/production-authority-registry';
import { PW_IMG } from '../production/productionImagery';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { DESIGN_PLATES, DESIGN_SWATCHES, type DesignDevice, type DesignPackIcon } from './designPackAssets';

export type ChamberVis = 'plates' | 'swatches' | 'type' | 'graph' | 'list' | 'globe' | 'icons' | 'devices';

export type ChamberPanel = {
  n: string;
  title: string;
  sub: string;
  vis: ChamberVis;
  items?: string[];
  plates?: string[];
  /** Board index rows (the authority's bullet column). */
  rows?: string[];
  /** Interior artwork for this mode. Live row copy stays in front of it. */
  art?: string;
  /** Canonical pack icon tiles (vis 'icons'). */
  icons?: DesignPackIcon[];
  /** Canonical pack device frames (vis 'devices'). */
  devices?: DesignDevice[];
};

export type DesignChamberConfig = {
  mode: ProductionDesignMode;
  label: string;
  overviewTitle: string;
  lede: string;
  list: string[];
  /** Light intro column beside the overview art (authority right column, above the dashed list). */
  intro?: string[];
  /** Caption under the overview thumbnail strip. */
  caption?: string;
  panels: ChamberPanel[];
  edgeLeft: string;
  edgeRight: string;
  pipeline: { title: string; sub: string }[];
  table: { title: string; sub: string; cta: string; plate: string }[];
};

const D = PW_IMG.designRows;
const X = PW_IMG.experienceRows;

export const DESIGN_CHAMBER: Record<ProductionDesignMode, DesignChamberConfig> = {
  brand: {
    mode: 'brand',
    label: 'BRAND',
    overviewTitle: 'BRAND / WORKSPACE OVERVIEW',
    lede: 'A UNIFIED BRAND SYSTEM FOR A BRIGHTER HUMAN FUTURE',
    list: ['IDENTITY', 'VISUAL LANGUAGE', 'TYPOGRAPHY', 'COLOR SYSTEM', 'APPLICATIONS', 'GUIDELINES'],
    intro: ['IDENTITY', 'VISUAL LANGUAGE', 'TYPOGRAPHY', 'COLOR SYSTEM', 'APPLICATIONS', 'GUIDELINES'],
    caption: 'CONSISTENT EXPERIENCES / PEOPLE TO IMPACT',
    panels: [
      { n: '01', title: 'BRAND ESSENCE', sub: 'PURPOSE & POSITIONING', vis: 'plates', plates: [D.work!, D.framework!, D.history!], rows: ['PURPOSE', 'VISION', 'AUDIENCE', 'DIFFERENTIATION', 'BRAND STORY'] },
      { n: '02', title: 'VISUAL LANGUAGE', sub: 'KEY ELEMENTS & STYLE', vis: 'icons', icons: ['object-cube-system', 'object-concentric-rings', 'object-geometric-lattice'], rows: ['LOGO SYSTEM', 'ICONOGRAPHY', 'GRAPHIC ELEMENTS', 'IMAGERY STYLE', 'MOTION LANGUAGE'] },
      { n: '03', title: 'TYPOGRAPHY SYSTEM', sub: 'TYPE RULES & HIERARCHY', vis: 'type', items: ['Aa', 'NDX GROTESK'], rows: ['PRIMARY', 'SECONDARY', 'NUMERALS', 'SPACING', 'USAGE'] },
      { n: '04', title: 'COLOR & MATERIAL', sub: 'PALETTE & SURFACES', vis: 'swatches', rows: ['PRIMARY PALETTE', 'SECONDARY PALETTE', 'MATERIAL LOGIC', 'LIGHT & SURFACE', 'DIGITAL APPLICATION'] },
      { n: '05', title: 'BRAND APPLICATIONS', sub: 'SYSTEM IN PRACTICE', vis: 'plates', plates: [D.family!, D.interactions!, D.assets!], rows: ['ENVIRONMENTS', 'DIGITAL PRODUCTS', 'PRINT & COLLATERAL', 'MERCHANDISE', 'BRAND EXPERIENCE'] },
    ],
    edgeLeft: 'FROM IDENTITY TO IMPACT',
    edgeRight: 'BRAND SYSTEMS / REAL-WORLD IMPACT',
    pipeline: [
      { title: 'RESEARCH', sub: 'INSIGHTS & AUDIENCE' },
      { title: 'IDENTITY', sub: 'STRATEGY & STORY' },
      { title: 'VISUAL SYSTEM', sub: 'ELEMENTS & GUIDELINES' },
      { title: 'APPLICATION', sub: 'TOUCHPOINTS & MEDIA' },
      { title: 'EVOLUTION', sub: 'MEASURE & REFINE' },
    ],
    table: [
      { title: 'BRAND IDENTITY REVIEW', sub: 'VISUAL DIRECTION', cta: 'REVIEW', plate: D.work! },
      { title: 'COLOR SYSTEM FINAL', sub: 'PALETTE & MATERIALS', cta: 'CHOOSE', plate: D.framework! },
      { title: 'BRAND APPLICATIONS', sub: 'ENVIRONMENTS & COLLATERAL', cta: 'APPROVE', plate: D.family! },
    ],
  },
  experience: {
    mode: 'experience',
    label: 'EXPERIENCE',
    overviewTitle: 'EXPERIENCE / WORKSPACE OVERVIEW',
    lede: 'A UNIFIED EXPERIENCE DESIGN SYSTEM FROM PEOPLE TO IMPACT',
    list: ['PEOPLE', 'JOURNEYS', 'TOUCHPOINTS', 'FLOWS', 'STATES', 'ARCHITECTURE'],
    intro: ['JOURNEYS', 'TOUCHPOINTS', 'FLOWS', 'STATES', 'ARCHITECTURE'],
    panels: [
      { n: '01', title: 'USER JOURNEYS', sub: 'PEOPLE TO POSSIBILITIES', vis: 'graph', rows: ['DISCOVER', 'EXPLORE', 'ENGAGE', 'CONVERT', 'RETAIN'] },
      { n: '02', title: 'ROUTE MAPS', sub: 'PATHS & TOUCHPOINTS', vis: 'graph', rows: ['AWARENESS', 'CONSIDERATION', 'EXPERIENCE', 'CONVERSIONS', 'LOYALTY'] },
      { n: '03', title: 'EXPERIENCE STATES', sub: 'SCREENS & INTERACTIONS', vis: 'devices', devices: ['mobile', 'tablet', 'desktop'], rows: ['IDLE', 'FOCUS', 'ENGAGED', 'ACCESS', 'ERROR'] },
      { n: '04', title: 'EXPERIENCE FLOWS', sub: 'SYSTEMS & LOGIC', vis: 'graph' },
      { n: '05', title: 'MOMENTS', sub: 'KEY SCENARIOS', vis: 'list', items: ['DISCOVERY', 'ONBOARDING', 'CORE FLOW', 'ADVOCACY'] },
    ],
    edgeLeft: 'FROM PEOPLE TO IMPACT',
    edgeRight: 'PAGES / JOURNEYS / EXPERIENCES IN MOTION',
    pipeline: [
      { title: 'RESEARCH', sub: 'AUDIENCE & CONTEXT' },
      { title: 'JOURNEY', sub: 'PATHS & MOMENTS' },
      { title: 'INTERACTION', sub: 'STATES & BEHAVIOR' },
      { title: 'FLOW', sub: 'SYSTEMS & LOGIC' },
      { title: 'VALIDATION', sub: 'TEST & REFINE' },
    ],
    table: [
      { title: 'ROUTE REVIEW', sub: 'CUSTOMER JOURNEY', cta: 'REVIEW', plate: X.world! },
      { title: 'INTERACTION FLOW', sub: 'CORE EXPERIENCE', cta: 'CHOOSE', plate: D.interactions! },
      { title: 'STATE FAMILY', sub: 'SCREENS & BEHAVIORS', cta: 'APPROVE', plate: D.family! },
    ],
  },
  surfaces: {
    mode: 'surfaces',
    label: 'SURFACES',
    overviewTitle: 'SURFACES / WORKSPACE OVERVIEW',
    lede: 'A UNIFIED SURFACE ECOSYSTEM ACROSS DEVICES AND ENVIRONMENTS',
    list: ['MOBILE', 'TABLET', 'DESKTOP', 'APPS', 'ENVIRONMENTS'],
    intro: ['SYSTEMS', 'UI FAMILIES', 'DEVICE EXPRESSIONS', 'PLATFORM OUTPUTS'],
    panels: [
      { n: '01', title: 'MOBILE SURFACES', sub: 'APPS & MOBILE EXPERIENCES', vis: 'devices', devices: ['mobile'], rows: ['IOS', 'ANDROID', 'RESPONSIVE', 'COMPONENTS', 'UI KITS'] },
      { n: '02', title: 'TABLET SURFACES', sub: 'IMMERSIVE & PRODUCTIVITY', vis: 'devices', devices: ['tablet'], rows: ['IPADOS', 'ANDROID TABLET', 'SPLIT VIEWS', 'PEN & TOUCH', 'CONTENT SYSTEMS'] },
      { n: '03', title: 'DESKTOP SURFACES', sub: 'SUITES & WORKPLATFORMS', vis: 'devices', devices: ['desktop'], rows: ['WINDOWS', 'MACOS', 'WEB APPS', 'PRODUCTIVITY', 'ENTERPRISE'] },
      { n: '04', title: 'APP SURFACES', sub: 'PLATFORMS & EXPERIENCES', vis: 'icons', icons: ['object-ui-frame', 'object-stack-layers', 'object-cloud'], rows: ['NATIVE APPS', 'HYBRID APPS', 'FEATURE SETS', 'UI COMPONENTS', 'STORE OUTPUTS'] },
      { n: '05', title: 'ENVIRONMENT SURFACES', sub: 'SPACES & SPECIALIZED', vis: 'plates', plates: [DESIGN_PLATES.crop03, DESIGN_PLATES.crop04], rows: ['PHYSICAL SPACES', 'LARGE DISPLAYS', 'KIOSK SYSTEMS', 'VEHICLE UI', 'XR/AR SURFACES'] },
    ],
    edgeLeft: 'FROM SYSTEMS TO EXPERIENCES',
    edgeRight: 'SURFACES ACROSS DEVICES / WORLDS IN MOTION',
    pipeline: [
      { title: 'FOUNDATION', sub: 'DESIGN TOKENS' },
      { title: 'COMPONENTS', sub: 'UI SYSTEMS' },
      { title: 'EXTENSIONS', sub: 'DEVICE VARIANTS' },
      { title: 'PLATFORMS', sub: 'APP & WEB OUTPUT' },
      { title: 'DEPLOYMENT', sub: 'ENVIRONMENTS' },
    ],
    table: [
      { title: 'MOBILE EXPRESSION', sub: 'MOBILE SURFACES', cta: 'REVIEW', plate: D.family! },
      { title: 'TABLET AUTHORITY', sub: 'TABLET SURFACES', cta: 'CHOOSE', plate: D.interactions! },
      { title: 'DESKTOP SURFACES', sub: 'DESKTOP SUITE', cta: 'APPROVE', plate: DESIGN_PLATES.crop01 },
    ],
  },
  compiler: {
    mode: 'compiler',
    label: 'COMPILER',
    overviewTitle: 'COMPILER / EXPERIENCE OVERVIEW',
    lede: 'UNIFIED EXPERIENCE COMPILER FROM CONCEPT TO DEPLOYMENT',
    list: ['CONCEPTS', 'EXPERIENCE', 'INTELLIGENCE', 'FAMILIES', 'AUTHORITY', 'ORCHESTRATION'],
    intro: ['SYNTHESIZE', 'SYSTEMS', 'PEOPLE', 'EXPERIENCES', 'INTO COHERENT', 'WORLDS'],
    panels: [
      { n: '01', title: 'CONCEPT TERRITORIES', sub: 'WORLDS & DIRECTIONS', vis: 'plates', plates: [D.work!, D.history!, D.framework!, D.assets!], rows: ['01 CORE', '02 EXPAND', '03 ALTERNATE'] },
      { n: '02', title: 'EXPERIENCE GRAPH', sub: 'JOURNEYS & CONNECTIONS', vis: 'graph', rows: ['TOUCHPOINTS', 'USER FLOWS', 'SYSTEM LINKS', 'DATA LAYERS', 'EXPERIENCE NODES'] },
      { n: '03', title: 'PROJECT INTELLIGENCE', sub: 'DATA / INSIGHTS / SIGNALS', vis: 'globe', items: ['USAGE SIGNALS', 'RISK ANALYSIS'], rows: ['USAGE SIGNALS', 'BEHAVIOR TRENDS', 'OPPORTUNITIES', 'RISK ANALYSIS', 'RECOMMENDATIONS'] },
      { n: '04', title: 'FAMILIES & EXPRESSIONS', sub: 'SYSTEMS & VARIATIONS', vis: 'devices', devices: ['desktop', 'tablet', 'mobile'], rows: ['CORE FAMILY', 'EXPRESSION SETS', 'VARIATIONS MAP', 'VISUAL LANGUAGE'] },
      { n: '05', title: 'AUTHORITY BRIEF', sub: 'GUIDELINES & DEPLOYMENT', vis: 'list', items: ['BRIEF', 'GUIDELINES', 'HANDOFF'], rows: ['STANDARDS', 'DEPLOYMENT', 'GOVERNANCE', 'APPROVAL FLOW', 'DISTRIBUTION'] },
    ],
    edgeLeft: 'FROM CONCEPT TO WORLDS',
    edgeRight: 'PAGES / SYSTEMS / WORLDS IN MOTION',
    pipeline: [
      { title: 'INGEST & ANALYZE', sub: 'SOURCES' },
      { title: 'SYNTHESIZE', sub: 'DIRECTION' },
      { title: 'COMPILE', sub: 'EXPERIENCE' },
      { title: 'SYSTEMATIZE', sub: 'FAMILIES' },
      { title: 'DEPLOY', sub: 'RELEASE' },
    ],
    table: [
      { title: 'VISUAL DIRECTION REVIEW', sub: 'CONCEPT TERRITORIES', cta: 'REVIEW', plate: D.work! },
      { title: 'EXPERIENCE FLOW APPROVAL', sub: 'EXPERIENCE GRAPH', cta: 'APPROVE', plate: D.interactions! },
      { title: 'FAMILIES & EXPRESSIONS', sub: 'SYSTEM VARIATIONS', cta: 'CHOOSE', plate: D.family! },
    ],
  },
  assets: {
    mode: 'assets',
    label: 'ASSETS',
    overviewTitle: 'ASSETS / LIBRARY OVERVIEW',
    lede: 'A UNIFIED ASSET LIBRARY FOR EVERY SURFACE AND WORLD.',
    list: ['TEMPLATES', 'COMPONENTS', 'ENVIRONMENTS', 'ICON SYSTEMS', 'MATERIALS', 'VISUAL AUTHORITIES'],
    intro: ['A UNIFIED', 'ASSET LIBRARY', 'FROM', 'CONCEPTS', 'TO INTERFACES'],
    panels: [
      { n: '01', title: 'VISUAL AUTHORITIES', sub: 'STYLES & REFERENCES', vis: 'plates', plates: [D.work!, D.framework!, D.history!, D.assets!], rows: ['MOOD', 'STYLE', 'COLOR', 'LIGHTING', 'COMPOSITION'] },
      { n: '02', title: 'ICON FAMILIES', sub: 'SYSTEMS & LIBRARIES', vis: 'icons', icons: ['nav-hub', 'nav-work', 'nav-library', 'object-cube-system', 'object-network', 'object-route-map'], rows: ['CORE', 'UI', 'SYSTEM', 'MEDIA', 'NAVIGATION'] },
      { n: '03', title: 'ENVIRONMENT PLATES', sub: 'WORLDS & LOCATIONS', vis: 'plates', plates: [DESIGN_PLATES.crop01, DESIGN_PLATES.crop02, DESIGN_PLATES.crop03, DESIGN_PLATES.crop04], rows: ['WORLDS', 'LOCATIONS', 'SKYBOXES', 'PLATES', 'VARIATIONS'] },
      { n: '04', title: 'MATERIALS & COMPONENTS', sub: 'SURFACES & BUILDING BLOCKS', vis: 'swatches', rows: ['MATERIALS', 'TEXTURES', 'COMPONENTS', 'MODULAR', 'PARAMETRIC'] },
      { n: '05', title: 'TEMPLATES', sub: 'SYSTEMS & DELIVERABLES', vis: 'devices', devices: ['desktop', 'tablet', 'mobile'], rows: ['UI TEMPLATES', 'SCENES', 'PRESENTATIONS', 'EXPORTS', 'GUIDELINES'] },
    ],
    edgeLeft: 'FROM SOURCES TO LIBRARY',
    edgeRight: 'ASSETS ACROSS WORLDS',
    pipeline: [
      { title: 'SOURCE', sub: 'REFERENCES' },
      { title: 'PROCESS', sub: 'GENERATION' },
      { title: 'COMPONENTS', sub: 'PARTS' },
      { title: 'LIBRARY', sub: 'CANON' },
      { title: 'DELIVER', sub: 'HANDOFF' },
    ],
    table: [
      { title: 'ICON FAMILY REVIEW', sub: 'ICON FAMILIES', cta: 'REVIEW', plate: D.assets! },
      { title: 'ENVIRONMENT PLATES', sub: 'WORLDS & LOCATIONS', cta: 'CHOOSE', plate: DESIGN_PLATES.mainAtrium },
      { title: 'COMPONENT ASSETS', sub: 'MATERIALS & COMPONENTS', cta: 'APPROVE', plate: DESIGN_SWATCHES[5]!.src },
    ],
  },
  viewport: {
    mode: 'viewport',
    label: 'VIEWPORT',
    overviewTitle: 'VIEWPORT / DEVICE CHAMBER',
    lede: 'PREVIEW THE LIVE CLIENT APP ON ANY DEVICE.',
    list: [],
    panels: [],
    edgeLeft: 'FROM SURFACES TO SCREENS',
    edgeRight: 'DEVICES IN MOTION',
    pipeline: [
      { title: 'RESEARCH', sub: '' },
      { title: 'CONCEPT', sub: '' },
      { title: 'AUTHORITY', sub: '' },
      { title: 'PAGE FAMILY', sub: '' },
      { title: 'COMPONENTS', sub: '' },
      { title: 'VIEWPORT', sub: '' },
      { title: 'PRODUCTION', sub: '' },
    ],
    table: [
      { title: 'VIEWPORT REVIEW', sub: 'DEVICE PREVIEW', cta: 'REVIEW', plate: D.interactions! },
      { title: 'SAFE AREA CHECK', sub: 'INSETS & NOTCHES', cta: 'VALIDATE', plate: D.family! },
      { title: 'RESPONSIVE STATES', sub: 'BREAKPOINTS', cta: 'CHECK', plate: D.work! },
      { title: 'ASSET PREVIEW', sub: 'PLATES IN CONTEXT', cta: 'OPEN', plate: D.assets! },
    ],
  },
};

/**
 * Canonical pack assets always win (ASSET-AUTHORITY-CONVERGENCE.OPUS3). The loops below used to overwrite every
 * panel plate and every table plate with generated board art after the config was declared, which is why supplied
 * pack files never reached the screen. They now only replace legacy row imagery, and never a design-pack file.
 */
export const isDesignPackAsset = (u: string | undefined) => !!u && u.includes('/design-pack/');
const PACK_VIS = new Set(['icons', 'devices', 'swatches']);
for (const cfg of Object.values(DESIGN_CHAMBER)) {
  const art = AUTHORITY_ASSETS.boards[cfg.mode];
  for (const panel of cfg.panels) {
    if (!PACK_VIS.has(panel.vis)) panel.art = art;
    if (panel.plates?.length) panel.plates = panel.plates.map((u) => (isDesignPackAsset(u) ? u : art));
  }
}

/**
 * "ON YOUR TABLE" cards: one distinct authority plate per decision (OPUS2). Grok1 slotted the mode's
 * board art into every card, so each mode's table read as one image repeated three or four times.
 */
const B = AUTHORITY_ASSETS.boards;
const TABLE_ART: Record<ProductionDesignMode, string[]> = {
  brand: [B.brand, B.assets, AUTHORITY_ASSETS.designAtrium],
  experience: [AUTHORITY_ASSETS.experienceWorld, B.experience, B.compiler],
  surfaces: [B.surfaces, B.viewport, AUTHORITY_ASSETS.designAtrium],
  compiler: [B.compiler, B.experience, B.surfaces],
  assets: [B.assets, AUTHORITY_ASSETS.experienceWorld, AUTHORITY_ASSETS.libraryPlates[0]!],
  viewport: [B.viewport, AUTHORITY_ASSETS.viewportCorridor, B.surfaces, B.assets],
};
for (const cfg of Object.values(DESIGN_CHAMBER)) {
  cfg.table.forEach((card, i) => {
    if (!isDesignPackAsset(card.plate)) card.plate = TABLE_ART[cfg.mode][i] ?? AUTHORITY_ASSETS.boards[cfg.mode];
  });
}
