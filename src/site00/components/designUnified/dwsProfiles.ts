/**
 * DESIGN UNIFIED WORKSPACE — per-viewport content profiles (STRUCTURE2R1).
 * Every profile below is transcribed from its authority image; the family decides which authority applies:
 *   desktop  → 01_DESKTOP_AUTHORITIES (+ 04 interaction expressions)
 *   tabletL  → 02_TABLET_AUTHORITIES landscape (BRAND, EXPERIENCE, COMPILER, ASSETS, OVERVIEW)
 *   tabletP  → 02_TABLET_AUTHORITIES portrait (BRAND fan); other modes reuse the landscape content
 *   mobile   → 03_MOBILE_AUTHORITIES
 * All user-visible strings are UPPERCASE.
 */
import type { DwsMode } from './dwsModel';

export type DwsFamily = 'desktop' | 'tabletL' | 'tabletP' | 'mobile';

export type DwsDrawerKey = 'brand-library' | 'journeys' | 'surface-families' | 'synthesis' | 'asset-library';

export type DwsPBoard = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  rows: string[];
  tone: 'dark' | 'light';
  /** Overview boards are portals into a mode. */
  portal?: DwsMode;
};

export type DwsPFeatured = {
  id: string;
  /** Red lead text, e.g. BRAND / DESIGN. May be the whole title (ASSET LIBRARY). */
  lead: string;
  title?: string;
  intro?: string[];
  statement: string[];
  entries: string[];
};

export type DwsPStage = { code: string; label: string; sub?: string; form?: string };
export type DwsPCard = { title: string; sub: string; action: 'REVIEW' | 'APPROVE' | 'CHOOSE'; badge?: string };

export type DwsProfile = {
  boards: DwsPBoard[];
  featured: DwsPFeatured;
  tagline?: [string, string, string];
  pipeline: DwsPStage[];
  table: DwsPCard[];
  /** Short note on which authority this transcribes. */
  authority: string;
};

const b = (id: string, code: string, title: string, subtitle: string, rows: string[] = [], tone: 'dark' | 'light' = 'light', portal?: DwsMode): DwsPBoard => ({ id, code, title, subtitle, rows, tone, portal });
const st = (labels: (string | [string, string])[]): DwsPStage[] =>
  labels.map((l, i) => ({ code: String(i + 1).padStart(2, '0'), label: Array.isArray(l) ? l[0] : l, sub: Array.isArray(l) ? l[1] : undefined }));
const c = (title: string, sub: string, action: DwsPCard['action'], badge?: string): DwsPCard => ({ title, sub, action, badge });

/* ======================================================================= shared overview (workspace) */

const OVERVIEW_BOARDS = (mobile: boolean): DwsPBoard[] => [
  b('ov-brand', '01', 'BRAND', 'IDENTITY SYSTEMS', [], 'dark', 'brand'),
  b('ov-experience', '02', 'EXPERIENCE', 'JOURNEYS & SYSTEMS', mobile ? ['USER FLOWS', 'INTERACTIONS', 'TOUCHPOINTS', 'SYSTEM MAPS'] : ['USER JOURNEY', 'SYSTEM MAP', 'INTERACTIONS', 'EXPERIENCE FLOW'], 'light', 'experience'),
  b('ov-surfaces', '03', 'SURFACES', mobile ? '30 SPACES & PLATFORMS' : 'EXPRESSIONS & PLATFORMS', mobile ? ['SPATIAL', 'UI/UX', 'MOTION', 'MATERIALS', 'PLATFORMS'] : ['MOBILE', 'TABLET', 'DESKTOP', 'ENVIRONMENT', 'PLAN OUTPUTS'], 'dark', 'surfaces'),
  b('ov-compiler', '04', 'COMPILER', mobile ? 'SYSTEMS & INTELLIGENCE' : 'STRATEGY & INTELLIGENCE', [], 'dark', 'compiler'),
  b('ov-assets', '05', 'ASSETS', 'LIBRARY & COMPONENTS', mobile ? ['SPATIAL', 'MATERIALS', 'COMPONENTS', 'ENVIRONMENTS', 'TEMPLATES'] : ['ICON SETS', 'MATERIALS', 'COMPONENTS', 'ENVIRONMENTS', 'TEMPLATES'], 'light', 'assets'),
];
const OVERVIEW_FEATURED: DwsPFeatured = {
  id: 'ov-featured',
  lead: 'DESIGN',
  title: 'WORKSPACE OVERVIEW',
  intro: ['IDEAS', 'SYSTEMS', 'PEOPLE', 'TO PRODUCTS'],
  statement: ['A UNIFIED', 'DESIGN ECOSYSTEM', 'FROM IDEAS', 'TO INTERFACES'],
  entries: ['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPILER', 'ASSETS'],
};
const OVERVIEW_PIPELINE = st(['INTELLIGENCE', 'CONCEPT', 'EXPERIENCE', 'SURFACES', 'ASSETS', 'AUTHORITY', 'PRODUCTION']);

/* ======================================================================= DESKTOP */

const D_BRAND: DwsProfile = {
  authority: '01_DESKTOP/01_BRAND',
  boards: [
    b('strategy', '01', 'STRATEGY', 'BRAND FOUNDATION', ['MARKET CONTEXT', 'AUDIENCE INSIGHTS', 'BRAND OPPORTUNITY', 'POSITIONING', 'GROWTH PLATFORMS'], 'dark'),
    b('visual', '02', 'VISUAL IDENTITY', 'LOGO MARKS & SYSTEMS', ['LOGO SYSTEM', 'TYPOGRAPHY', 'COLOR PALETTE', 'GRAPHIC SYSTEM', 'ICONOGRAPHY', 'IMAGERY STYLE']),
    b('voice', '03', 'VOICE & TONE', 'LANGUAGE & EXPRESSION', ['BRAND NARRATIVE', 'KEY MESSAGES', 'TONE OF VOICE', 'COPY EXAMPLES', 'TERMINOLOGY', 'CADENCE ADAPTATION']),
    b('values', '04', 'VALUES', 'BELIEFS & BEHAVIOURS', ['PEOPLE FIRST', 'CURIOUS ALWAYS', 'OPEN BY DESIGN'], 'dark'),
    b('principles', '05', 'EXPERIENCE PRINCIPLES', 'BRAND IN ACTION', ['UNIFIED EXPERIENCE', 'CONSISTENT ACROSS TOUCHPOINTS', 'MEMORABLE INTERACTIONS', 'SIMPLE & INTUITIVE', 'HUMAN AT SCALE']),
  ],
  featured: { id: 'featured', lead: 'BRAND', title: 'IDENTITY DIRECTION', statement: ['A BOLDER', 'HUMAN FUTURE'], entries: ['IDENTITY SYSTEM', 'VISUAL LANGUAGE', 'PHOTOGRAPHY', 'COLOR & TYPE', 'BRAND ASSETS', 'APPLICATIONS'] },
  pipeline: st(['INTELLIGENCE', 'STRATEGY', 'IDENTITY', 'VOICE', 'EXPERIENCE', 'AUTHORITY', 'PRODUCTION']),
  table: [c('VISUAL IDENTITY REVIEW', 'NDXBOOK BRAND SYSTEM', 'REVIEW', 'PAGE 014'), c('TYPOGRAPHY SYSTEM', 'TYPEFACES & HIERARCHY', 'APPROVE'), c('PALETTE DIRECTION', 'COLOR SYSTEM V2', 'CHOOSE'), c('BRAND AUTHORITY REVIEW', 'GUIDELINES & APPLICATIONS', 'REVIEW')],
};

const D_EXPERIENCE: DwsProfile = {
  authority: '01_DESKTOP/02_EXPERIENCE',
  boards: [
    b('journeys', '01', 'USER JOURNEYS', 'PEOPLE PATHS & NEEDS', ['DISCOVER', 'EXPLORE', 'CONSIDER', 'ENGAGE', 'CONVERT', 'RETAIN'], 'dark'),
    b('routes', '02', 'ROUTE MAPS', 'SYSTEM PATHWAYS', ['ENTRY POINTS', 'USER PATHS', 'TOUCHPOINTS', 'BRANCHES', 'CONVERSIONS', 'EXIT PATHS']),
    b('states', '03', 'STATE FLOWS', 'BEHAVIOR & LOGIC', ['STATES', 'TRANSITIONS', 'CONDITIONS', 'TRIGGERS', 'EXCEPTIONS', 'RECOVERY']),
    b('moments', '04', 'EXPERIENCE MOMENTS', 'KEY TOUCHPOINTS', ['DISCOVERY', 'ONBOARDING', 'ENGAGEMENT', 'COMPLETION', 'ADVOCACY', 'DELIGHT'], 'dark'),
    b('rules', '05', 'INTERACTION RULES', 'COMPONENTS & BEHAVIOR', ['PATTERNS', 'COMPONENTS', 'BEHAVIORS', 'FEEDBACK', 'ACCESSIBILITY', 'CONSTRAINTS']),
  ],
  featured: { id: 'featured', lead: 'EXPERIENCE', title: 'ARCHITECTURE', intro: ['A UNIFIED', 'EXPERIENCE', 'SYSTEM', 'FROM PEOPLE', 'TO OUTCOMES'], statement: ['JOURNEYS', 'FLOWS', 'ROUTE MAPS', 'TOUCHPOINTS', 'SYSTEMS', 'PEOPLE', 'TO OUTCOMES'], entries: ['PEOPLE', 'JOURNEYS', 'TOUCHPOINTS', 'FLOWS', 'STATES', 'INTERACTIONS', 'OUTCOMES'] },
  pipeline: st(['INTELLIGENCE', 'CONCEPT', 'ROUTES', 'STATES', 'INTERACTIONS', 'AUTHORITY', 'PRODUCTION']),
  table: [c('ROUTE REVIEW', 'MAIN USER JOURNEY', 'REVIEW', 'PAGE 012'), c('INTERACTION FLOW', 'CHECK STATES & LOGIC', 'APPROVE'), c('STATE FAMILY', 'EXPERIENCE / ENTRY 003', 'CHOOSE'), c('EXPERIENCE AUTHORITY', 'PATTERNS & GUIDELINES', 'REVIEW')],
};

const D_SURFACES_OVERVIEW: DwsProfile = {
  authority: '01_DESKTOP/03_SURFACES_WORKSPACE_OVERVIEW',
  boards: OVERVIEW_BOARDS(false),
  featured: OVERVIEW_FEATURED,
  pipeline: OVERVIEW_PIPELINE,
  table: [c('VISUAL DIRECTION REVIEW', 'FRONTAL SLAYER', 'REVIEW', 'PAGE 014'), c('EXPERIENCE FLOW', 'ASTRAL WORLD', 'APPROVE'), c('SURFACE FAMILY', 'NDXBOOK / ENTRY 002', 'CHOOSE'), c('ASSET REVIEW', 'LIBRARY / COMPONENTS', 'REVIEW')],
};

/** Surfaces-specific pipeline + table while an expression is open (04 interaction authority). */
export const SURFACES_EXPRESSION = {
  pipeline: st(['INTELLIGENCE', 'CONCEPT', 'FAMILY', 'MOBILE', 'TABLET', 'DESKTOP', 'APP', 'AUTHORITY', 'PRODUCTION']),
  table: [c('DESKTOP EXPRESSION', 'MAIN INTERFACE SYSTEM', 'REVIEW', 'PAGE 021'), c('TABLET FAMILY', 'SURFACE SYSTEM V2', 'APPROVE'), c('MOBILE EXPRESSION', 'NDXBOOK APP INTERFACE', 'CHOOSE'), c('SURFACE COMPONENTS', 'LIBRARY / UI ELEMENTS', 'REVIEW')],
};

const D_COMPILER: DwsProfile = {
  authority: '01_DESKTOP/04_COMPILER',
  boards: [
    b('territories', '01', 'CONCEPT TERRITORIES', 'STRATEGIC DIRECTIONS', ['CULTURE', 'TECHNOLOGY', 'PEOPLE', 'ENVIRONMENTS', 'BEHAVIOR', 'OPPORTUNITIES'], 'dark'),
    b('graph', '02', 'EXPERIENCE GRAPH', 'SYSTEMS & RELATIONSHIPS', ['JOURNEYS', 'TOUCHPOINTS', 'SYSTEMS', 'INTERACTIONS', 'DATA FLOWS', 'EXPERIENCE MODEL']),
    b('families', '03', 'FAMILIES & EXPRESSIONS', 'COMPONENT SYSTEMS', ['UI COMPONENTS', 'SPATIAL ELEMENTS', 'CONTENT MODULES', 'INTERACTION PATTERNS', 'VISUAL EXPRESSIONS']),
    b('briefs', '04', 'AUTHORITY BRIEFS', 'GUIDELINES & STANDARDS', ['BRAND PRINCIPLES', 'EXPERIENCE PRINCIPLES', 'DESIGN RULES', 'COMPONENT STANDARDS', 'ACCESSIBILITY', 'IMPLEMENTATION'], 'dark'),
    b('intelligence', '05', 'PROJECT INTELLIGENCE', 'INSIGHTS & RECOMMENDATIONS', ['MARKET SIGNALS', 'USER INSIGHTS', 'TECH TRENDS', 'COMPETITIVE LANDSCAPE', 'OPPORTUNITIES', 'NEXT STEPS']),
  ],
  featured: { id: 'featured', lead: 'COMPILER', title: 'EXPERIENCE COMPILER', statement: ['A UNIFIED', 'SYNTHESIS FROM', 'STRATEGY TO', 'EXECUTION'], entries: ['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPONENTS', 'ENVIRONMENTS'] },
  pipeline: st(['INTELLIGENCE', 'CONCEPT', 'EXPERIENCE', 'FAMILIES', 'EXPRESSIONS', 'AUTHORITY', 'PRODUCTION']),
  table: [c('VISUAL DIRECTION REVIEW', 'FRONTAL SLAYER', 'REVIEW', 'PAGE 014'), c('EXPERIENCE FLOW', 'ASTRAL WORLD', 'APPROVE'), c('FAMILIES & EXPRESSIONS', 'NDXBOOK / ENTRY 002', 'CHOOSE'), c('AUTHORITY REVIEW', 'GUIDELINES & STANDARDS', 'REVIEW')],
};

const D_ASSETS: DwsProfile = {
  authority: '01_DESKTOP/05_ASSETS',
  boards: [
    b('authorities', '01', 'VISUAL AUTHORITIES', 'STYLEFRAMES & KEY ART', ['KEY VISUALS', 'STYLEFRAMES', 'MOOD BOARDS', 'COLOR SYSTEMS', 'TYPOGRAPHY', 'GRAPHIC ELEMENTS'], 'dark'),
    b('icons', '02', 'ICON FAMILIES', 'SYSTEM ICONS & UI SYMBOLS', ['CORE ICONS', 'UI ACTIONS', 'NAVIGATION', 'MEDIA & DEVICES', 'STATUS & ALERTS', 'SOCIAL & SHARING']),
    b('plates', '03', 'ENVIRONMENT PLATES', 'WORLDS & BACKGROUNDS', ['INTERIORS', 'CITIES', 'NATURAL', 'TECH SPACES', 'SKY & WEATHER', 'PLATES & HDRI']),
    b('materials', '04', 'MATERIALS & COMPONENTS', 'SURFACES, SHADERS & 3D ASSETS', ['MATERIALS', 'SHADERS', 'COMPONENTS', 'MODULAR', 'PARAMETRIC'], 'dark'),
    b('delivery', '05', 'DELIVERY PACKS', 'EXPORTS & TEMPLATES', ['LIBRARIES', 'TEMPLATES', 'EXPORT PRESETS', 'PLATFORM PACKS', 'DOCUMENTATION', 'VERSION HISTORY']),
  ],
  featured: { id: 'featured', lead: 'ASSET LIBRARY', statement: [], entries: ['VISUAL AUTHORITIES', 'ICON SETS', 'MATERIALS', 'COMPONENTS', 'ENVIRONMENT PLATES', 'TEMPLATES'] },
  pipeline: st(['SOURCES', 'REFERENCES', 'AUTHORITIES', 'COMPONENTS', 'LIBRARIES', 'REVIEWS', 'DELIVERY']),
  table: [c('ICON FAMILY REVIEW', 'CORE UI SYSTEM', 'REVIEW'), c('ENVIRONMENT PLATE', 'CITY_001 / SKYLINE', 'APPROVE'), c('COMPONENT ASSET', 'MODULAR / PANEL A', 'CHOOSE'), c('ASSET DELIVERY REVIEW', 'WEB + APP + 3D EXPORTS', 'REVIEW')],
};

/* ======================================================================= TABLET (landscape authorities) */

const T_BRAND: DwsProfile = {
  authority: '02_TABLET/874C (BRAND / COMMAND BOARD)',
  boards: [
    b('brand', '01', 'BRAND', 'IDENTITY SYSTEMS', [], 'dark'),
    b('strategy', '02', 'BRAND STRATEGY', 'POSITIONING & NARRATIVE', ['AUDIENCE', 'MARKET', 'POSITIONING', 'BRAND STORY', 'OPPORTUNITIES']),
    b('visual', '03', 'VISUAL IDENTITY', 'LOGO / TYPE / COLOR / IMAGERY', ['LOGO', 'TYPE', 'COLOR', 'IMAGERY'], 'dark'),
    b('voice', '04', 'VOICE & TONE', 'LANGUAGE & EXPRESSION', ['CLEAR', 'HUMAN', 'VISIONARY', 'CONFIDENT', 'INSPIRING']),
    b('values', '05', 'VALUES & PRINCIPLES', 'WHAT DRIVES US', ['HUMAN CENTRIC', 'BOLDER TOMORROW', 'INTELLIGENT PROGRESS'], 'dark'),
  ],
  featured: { id: 'featured', lead: 'BRAND', title: 'COMMAND BOARD', intro: ['A UNIFIED', 'BRAND FOR', 'A BRIGHTER', 'HUMAN FUTURE.'], statement: ['BRAND', 'IDEAS', 'PEOPLE', 'POTENTIAL'], entries: ['IDENTITY', 'STRATEGY', 'VISUAL SYSTEM', 'VOICE & TONE', 'VALUES', 'EXPERIENCE PRINCIPLES'] },
  pipeline: st(['BRAND INSIGHT', 'STRATEGY', 'IDENTITY', 'VISUAL SYSTEM', 'EXPRESSION', 'PRINCIPLES', 'ROLLOUT']),
  table: [c('VISUAL DIRECTION REVIEW', 'BRAND CAMPAIGN / NDX 2.0', 'REVIEW', 'PAGE 021'), c('TYPOGRAPHY SYSTEM', 'BRAND IDENTITY / CORE TYPE', 'CHOOSE'), c('PALETTE DIRECTION', 'BRAND SYSTEM / V1.2', 'APPROVE')],
};

const T_EXPERIENCE: DwsProfile = {
  authority: '02_TABLET/DB9D (EXPERIENCE / COMMAND BOARD)',
  boards: [
    b('journeys', '01', 'USER JOURNEYS', 'PEOPLE × TOUCHPOINTS', ['PERSONAS', 'JOURNEY MAPS', 'TOUCHPOINTS', 'MOMENTS', 'PAIN POINTS'], 'dark'),
    b('routes', '02', 'ROUTE MAPS', 'PATHS × EXPERIENCES', ['ENTRY POINTS', 'USER FLOWS', 'DECISION NODES', 'ALTERNATIVE PATHS', 'GOALS & OUTCOMES']),
    b('states', '03', 'STATE FLOWS', 'STATES × LOGIC', ['USER STATES', 'TRANSITIONS', 'CONDITIONS', 'SYSTEM RESPONSES', 'ERROR STATES']),
    b('interaction', '04', 'INTERACTION FLOWS', 'BEHAVIOR × INTERFACES', [], 'dark'),
    b('architecture', '05', 'EXPERIENCE ARCHITECTURE', 'SYSTEMS × ECOSYSTEM', ['EXPERIENCE LAYERS', 'INFORMATION FLOW', 'CONTENT SYSTEMS', 'INTEGRATIONS', 'SCALABILITY']),
  ],
  featured: { id: 'featured', lead: 'EXPERIENCE', title: 'COMMAND BOARD', statement: ['DESIGN', 'SEAMLESS', 'EXPERIENCES', 'ACROSS', 'PEOPLE', 'TOUCHPOINTS', 'AND SYSTEMS'], entries: ['USER JOURNEYS', 'ROUTE MAPS', 'STATE FLOWS', 'INTERACTION FLOWS', 'EXPERIENCE MOMENTS', 'EXPERIENCE ARCHITECTURE'] },
  pipeline: st(['RESEARCH', 'JOURNEYS', 'ROUTE MAPS', 'INTERACTION FLOWS', 'EXPERIENCE DESIGN', 'VALIDATION', 'DEPLOYMENT']),
  table: [c('ROUTE REVIEW', 'USER JOURNEY • CORE FLOW', 'REVIEW', 'PAGE 024'), c('INTERACTION FLOW', 'MOBILE APP • ENTRY 003', 'CHOOSE'), c('STATE FAMILY', 'SYSTEM STATES • NDXBOOK', 'APPROVE')],
};

const T_COMPILER: DwsProfile = {
  authority: '02_TABLET/EC55 (EXPERIENCE COMPILER)',
  boards: [
    b('territories', '01', 'CONCEPT TERRITORIES', 'EXPERIENCE LANDSCAPES', ['IMMERSION', 'INTELLIGENCE', 'HUMANITY', 'MOBILITY', 'SOVEREIGNTY'], 'dark'),
    b('graph', '02', 'EXPERIENCE GRAPH', 'SYSTEMS & RELATIONSHIPS', ['TOUCHPOINTS', 'JOURNEYS', 'SYSTEMS', 'AUDIENCES', 'DEPENDENCIES']),
    b('families', '03', 'FAMILIES & EXPRESSIONS', 'EXPERIENCE SYSTEMS', ['CORE', 'EXTENSIONS', 'VARIATIONS']),
    b('briefs', '04', 'AUTHORITY BRIEFS', 'NARRATIVE & DIRECTION', ['VISION', 'PRINCIPLES', 'EXPERIENCE PILLARS', 'DESIGN INTENT', 'TONE & LANGUAGE', 'REFERENCE SYSTEM'], 'dark'),
    b('synthesis', '05', 'SYSTEM SYNTHESIS', 'INTEGRATED OUTPUT', ['EXPERIENCES', 'SURFACES', 'CONTENT', 'BEHAVIOURS', 'PLATFORMS', 'PRODUCTS']),
  ],
  featured: { id: 'featured', lead: 'EXPERIENCE COMPILER', statement: ['SYNTHESIZE', 'IDEAS', 'SYSTEMS', 'PEOPLE', 'COHERENT', 'EXPERIENCES'], entries: ['ANALYZE', 'SYNTHESIZE', 'STRUCTURE', 'VALIDATE', 'VISUALIZE', 'DEPLOY'] },
  pipeline: st(['INGEST', 'ANALYZE', 'SYNTHESIZE', 'STRUCTURE', 'VALIDATE', 'AUTHORITY', 'DEPLOY']),
  table: [c('VISUAL DIRECTION REVIEW', 'COMPILER / ENTRY 003', 'REVIEW', 'PAGE 027'), c('EXPERIENCE FLOW APPROVAL', 'NDXBOOK / EXPERIENCE SYSTEM', 'APPROVE'), c('FAMILIES & EXPRESSIONS', 'CONCEPT SYSTEMS', 'CHOOSE'), c('AUTHORITY REVIEW', 'BRAND / EXPERIENCE BRIEF', 'REVIEW', 'PAGE 028')],
};

const T_ASSETS: DwsProfile = {
  authority: '02_TABLET/0F4A (ASSETS / LIBRARY COMMAND)',
  boards: [
    b('authorities', '01', 'VISUAL AUTHORITIES', 'STYLES & DIRECTIONS', ['CHARACTERS', 'ENVIRONMENTS', 'PRODUCTS', 'STYLES', 'MOOD BOARDS'], 'dark'),
    b('icons', '02', 'ICON FAMILIES', 'SYSTEM ICONS & LANGUAGE', ['UI ICONS', 'SYSTEM ICONS', 'BRAND ICONS', '3D ICONS', 'ICON KITS']),
    b('plates', '03', 'ENVIRONMENT PLATES', 'WORLDS & LOCATIONS', ['WORLDS', 'LOCATIONS', 'SKYBOXES', 'PLATES', 'REFERENCE']),
    b('materials', '04', 'MATERIALS & COMPONENTS', 'SURFACES, SHADERS & KITS', [], 'dark'),
    b('templates', '05', 'TEMPLATES & LIBRARIES', 'SYSTEMS & TOOLKITS', ['UI TEMPLATES', 'SCENE TEMPLATES', 'COMPONENT KITS', 'LIBRARIES', 'REFERENCES']),
  ],
  featured: { id: 'featured', lead: 'ASSETS', title: 'LIBRARY COMMAND', statement: ['A UNIFIED', 'LIBRARY OF', 'DESIGN RESOURCES', 'TO BUILD', 'EXPERIENCES'], entries: ['VISUAL AUTHORITIES', 'ICON FAMILIES', 'ENVIRONMENT PLATES', 'MATERIALS', 'COMPONENTS', 'TEMPLATES', 'LIBRARIES', 'REFERENCES'] },
  pipeline: st(['SOURCING', 'CURATION', 'CLASSIFICATION', 'TAGGING', 'VERSIONING', 'DISTRIBUTION', 'INTEGRATION', 'DEPLOYMENT']),
  table: [c('ICON FAMILY REVIEW', 'UI SYSTEM / ICONS', 'REVIEW', 'PAGE 022'), c('ENVIRONMENT PLATE', 'ASTRAL WORLD / LOCATIONS', 'CHOOSE', 'PLATE 003'), c('COMPONENT ASSET', 'MODULAR KIT / 3D', 'APPROVE')],
};

const T_OVERVIEW: DwsProfile = {
  authority: '02_TABLET/CC27 (DESIGN / WORKSPACE OVERVIEW)',
  boards: OVERVIEW_BOARDS(true),
  featured: OVERVIEW_FEATURED,
  pipeline: OVERVIEW_PIPELINE,
  table: [c('DESIGN REVIEW', 'FRONTAL SLAYER', 'REVIEW', 'PAGE 014'), c('VISUAL AUTHORITY', 'NDXBOOK / ENTRY 002', 'CHOOSE'), c('EXPERIENCE FLOW', 'ASTRAL WORLD', 'APPROVE')],
};

/* ======================================================================= MOBILE */

const M_TAG = (a: string, c3: string): [string, string, string] => [a, 'SCROLL TO EXPLORE', c3];

const M_BRAND: DwsProfile = {
  authority: '03_MOBILE/01_BRAND_REFERENCE (DESIGN / WORKSPACE OVERVIEW)',
  boards: [
    b('ov-brand', '01', 'BRAND', 'IDENTITY SYSTEMS', [], 'dark', 'brand'),
    b('ov-experience', '02', 'EXPERIENCE', 'JOURNEYS & SYSTEMS', ['USER FLOWS', 'INTERACTIONS', 'TOUCHPOINTS', 'SYSTEM MAPS'], 'light', 'experience'),
    b('ov-surfaces', '03', 'SURFACES', '30 SPACES & PLATFORMS', ['SPATIAL', 'UI/UX', 'MOTION', 'MATERIALS', 'PLATFORMS'], 'dark', 'surfaces'),
    b('ov-compiler', '04', 'COMPILER', 'SYSTEMS & INTELLIGENCE', [], 'dark', 'compiler'),
    b('ov-assets', '05', 'ASSETS', 'LIBRARY & COMPONENTS', ['SPATIAL', 'MATERIALS', 'COMPONENTS', 'ENVIRONMENTS', 'TEMPLATES'], 'light', 'assets'),
  ],
  featured: { ...OVERVIEW_FEATURED },
  tagline: M_TAG('FROM IDEAS TO INTERFACES', 'PAGES SYSTEMS WORLDS IN MOTION'),
  pipeline: st(['INTELLIGENCE', 'CONCEPT', 'EXPERIENCE', 'SURFACES', 'ASSETS']),
  table: [c('DESIGN REVIEW', 'FRONTAL SLAYER', 'REVIEW', 'PAGE 014'), c('VISUAL AUTHORITY', 'NDXBOOK / ENTRY 002', 'CHOOSE'), c('EXPERIENCE FLOW', 'ASTRAL WORLD', 'APPROVE')],
};

const M_EXPERIENCE: DwsProfile = {
  authority: '03_MOBILE/04 (EXPERIENCE / WORKSPACE OVERVIEW)',
  boards: [
    b('journeys', '01', 'USER JOURNEYS', 'PEOPLE TO POSSIBILITIES', ['DISCOVER', 'EXPLORE', 'ENGAGE', 'CONVERT', 'RETAIN'], 'dark'),
    b('routes', '02', 'ROUTE MAPS', 'PATHS & TOUCHPOINTS', ['AWARENESS', 'CONSIDERATION', 'EXPERIENCE', 'CONVERSION', 'LOYALTY']),
    b('states', '03', 'EXPERIENCE STATES', 'SCREENS & INTERACTIONS', ['IDLE', 'FOCUS', 'FEEDBACK', 'SUCCESS', 'ERROR']),
    b('flows', '04', 'EXPERIENCE FLOWS', 'SYSTEMS & LOGIC', []),
    b('moments', '05', 'MOMENTS', 'KEY SCENARIOS', ['DISCOVERY', 'ONBOARDING', 'CORE FLOW', 'ADVOCACY'], 'dark'),
  ],
  featured: { id: 'featured', lead: 'EXPERIENCE', title: 'WORKSPACE OVERVIEW', intro: ['JOURNEYS', 'TOUCHPOINTS', 'FLOWS', 'STATES', 'ARCHITECTURE'], statement: ['A UNIFIED', 'EXPERIENCE DESIGN', 'SYSTEM FROM', 'PEOPLE TO IMPACT'], entries: ['PEOPLE', 'JOURNEYS', 'TOUCHPOINTS', 'FLOWS', 'STATES', 'ARCHITECTURE'] },
  tagline: M_TAG('FROM PEOPLE TO IMPACT', 'PAGES JOURNEYS EXPERIENCES IN MOTION'),
  pipeline: st(['RESEARCH', 'JOURNEY', 'INTERACTION', 'FLOW', 'VALIDATION']),
  table: [c('ROUTE REVIEW', 'CUSTOMER JOURNEY', 'REVIEW', 'PAGE 021'), c('INTERACTION FLOW', 'CORE EXPERIENCE', 'CHOOSE'), c('STATE FAMILY', 'SCREENS & BEHAVIORS', 'APPROVE')],
};

const M_SURFACES: DwsProfile = {
  authority: '03_MOBILE/02 (SURFACES / WORKSPACE OVERVIEW)',
  boards: [
    b('mobile', '01', 'MOBILE SURFACES', 'APPS & MOBILE EXPERIENCES', ['IOS', 'ANDROID', 'RESPONSIVE', 'COMPONENTS', 'UI KITS'], 'dark'),
    b('tablet', '02', 'TABLET SURFACES', 'IMMERSIVE & PRODUCTIVITY', ['IPADOS', 'ANDROID TABLET', 'SPLIT VIEWS', 'PEN & TOUCH', 'CONTENT SYSTEMS'], 'dark'),
    b('desktop', '03', 'DESKTOP SURFACES', 'SUITES & WORKPLATFORMS', ['WINDOWS', 'MACOS', 'WEB APPS', 'PRODUCTIVITY', 'ENTERPRISE'], 'dark'),
    b('app', '04', 'APP SURFACES', 'PLATFORMS & EXPERIENCES', ['NATIVE APPS', 'HYBRID APPS', 'FEATURE SETS', 'UI COMPONENTS', 'STORE OUTPUTS']),
    b('environment', '05', 'ENVIRONMENT SURFACES', 'SPACES & SPECIALIZED', ['PHYSICAL SPACES', 'LARGE DISPLAYS', 'KIOSK SYSTEMS', 'VEHICLE UI', 'XR/AR SURFACES']),
  ],
  featured: { id: 'featured', lead: 'SURFACES', title: 'WORKSPACE OVERVIEW', intro: ['SYSTEMS', 'UI FAMILIES', 'DEVICE EXPRESSIONS', 'PLATFORM OUTPUTS'], statement: ['A UNIFIED', 'SURFACE ECOSYSTEM', 'ACROSS DEVICES', 'AND ENVIRONMENTS'], entries: ['MOBILE', 'TABLET', 'DESKTOP', 'APPS', 'ENVIRONMENTS'] },
  tagline: M_TAG('FROM SYSTEMS TO EXPERIENCES', 'SURFACES ACROSS DEVICES WORLDS IN MOTION'),
  pipeline: st([['FOUNDATION', 'DESIGN TOKENS'], ['COMPONENTS', 'UI SYSTEMS'], ['EXTENSIONS', 'DEVICE VARIANTS'], ['PLATFORMS', 'APP & WEB OUTPUT'], ['DEPLOYMENT', 'ENVIRONMENTS']]),
  table: [c('MOBILE EXPRESSION', 'APP UI / NDXBOOK', 'REVIEW', 'PAGE 007'), c('TABLET AUTHORITY', 'SURFACE FAMILY', 'CHOOSE'), c('DESKTOP SURFACES', 'SYSTEMS & VARIANTS', 'APPROVE')],
};

const M_COMPILER: DwsProfile = {
  authority: '03_MOBILE/03 (COMPILER / EXPERIENCE OVERVIEW)',
  boards: [
    b('territories', '01', 'CONCEPT TERRITORIES', 'WORLDS & DIRECTIONS', ['CORE', 'EXPAND', 'ALTERNATE'], 'dark'),
    b('graph', '02', 'EXPERIENCE GRAPH', 'JOURNEYS & CONNECTIONS', ['TOUCHPOINTS', 'USER FLOWS', 'SYSTEM LINKS', 'DATA LAYERS', 'EXPERIENCE NODES']),
    b('intelligence', '03', 'PROJECT INTELLIGENCE', 'DATA / INSIGHTS / SIGNALS', ['USAGE SIGNALS', 'BEHAVIOR TRENDS', 'OPPORTUNITIES', 'RISK ANALYSIS', 'RECOMMENDATIONS'], 'dark'),
    b('families', '04', 'FAMILIES & EXPRESSIONS', 'SYSTEMS & VARIATIONS', ['CORE FAMILY', 'EXPRESSION SETS', 'VARIATIONS', 'COMPONENT MAP', 'VISUAL LANGUAGE']),
    b('briefs', '05', 'AUTHORITY BRIEFS', 'GUIDELINES & DEPLOYMENT', []),
  ],
  featured: { id: 'featured', lead: 'COMPILER', title: 'EXPERIENCE OVERVIEW', intro: ['SYNTHESIZE', 'SYSTEMS', 'PEOPLE', 'EXPERIENCES', 'INTO COHERENT', 'WORLDS'], statement: ['UNIFIED', 'EXPERIENCE COMPILER', 'FROM CONCEPT', 'TO DEPLOYMENT'], entries: ['CONCEPTS', 'EXPERIENCE', 'INTELLIGENCE', 'FAMILIES', 'AUTHORITY', 'ORCHESTRATION'] },
  tagline: M_TAG('FROM CONCEPT TO WORLDS', 'PAGES SYSTEMS WORLDS IN MOTION'),
  pipeline: st(['INGEST & ANALYZE', 'SYNTHESIZE', 'COMPILE', 'SYSTEMATIZE', 'DEPLOY']),
  table: [c('VISUAL DIRECTION REVIEW', 'COMPILER / CONCEPTS', 'REVIEW', 'PAGE 023'), c('EXPERIENCE FLOW APPROVAL', 'SYSTEM MAP / NDXBOOK', 'APPROVE'), c('FAMILIES & EXPRESSIONS', 'VARIATIONS / COMPILER', 'CHOOSE')],
};

const M_ASSETS: DwsProfile = {
  authority: '03_MOBILE/05 (ASSETS / LIBRARY OVERVIEW)',
  boards: [
    b('authorities', '01', 'VISUAL AUTHORITIES', 'STYLES & REFERENCES', ['MOOD', 'STYLE', 'COLOR', 'LIGHTING', 'COMPOSITION'], 'dark'),
    b('icons', '02', 'ICON FAMILIES', 'SYSTEMS & LIBRARIES', ['CORE', 'UI', 'SYSTEM', 'MEDIA', 'NAVIGATION']),
    b('plates', '03', 'ENVIRONMENT PLATES', 'WORLDS & LOCATIONS', ['WORLDS', 'LOCATIONS', 'SKYBOXES', 'PLATES', 'VARIATIONS']),
    b('materials', '04', 'MATERIALS & COMPONENTS', 'SURFACES & BUILDING BLOCKS', ['MATERIALS', 'TEXTURES', 'COMPONENTS', 'MODULAR', 'PARAMETRIC']),
    b('templates', '05', 'TEMPLATES', 'SYSTEMS & DELIVERABLES', ['UI TEMPLATES', 'SCENES', 'PRESENTATIONS', 'EXPORTS', 'GUIDELINES']),
  ],
  featured: { id: 'featured', lead: 'ASSETS', title: 'LIBRARY OVERVIEW', intro: ['A UNIFIED', 'ASSET LIBRARY', 'FROM CONCEPTS', 'TO INTERFACES'], statement: [], entries: ['TEMPLATES', 'COMPONENTS', 'ENVIRONMENTS', 'ICON SYSTEMS', 'MATERIALS', 'VISUAL AUTHORITIES'] },
  tagline: M_TAG('FROM ASSETS TO WORLDS', 'PAGES COMPONENTS WORLDS IN MOTION'),
  pipeline: st(['SOURCE', 'PROCESS', 'COMPONENTS', 'LIBRARY', 'DELIVER']),
  table: [c('ICON FAMILY REVIEW', 'CORE SYSTEM / NDXBOOK', 'REVIEW', 'PAGE 023'), c('ENVIRONMENT PLATES', 'WORLDS / ENTRY 007', 'CHOOSE'), c('COMPONENT ASSETS', 'UI SYSTEM / LIBRARY', 'APPROVE')],
};

/* ======================================================================= resolution */

const DESKTOP: Record<DwsMode, DwsProfile> = { brand: D_BRAND, experience: D_EXPERIENCE, surfaces: D_SURFACES_OVERVIEW, compiler: D_COMPILER, assets: D_ASSETS };
const TABLET: Record<DwsMode, DwsProfile> = { brand: T_BRAND, experience: T_EXPERIENCE, surfaces: T_OVERVIEW, compiler: T_COMPILER, assets: T_ASSETS };
const MOBILE: Record<DwsMode, DwsProfile> = { brand: M_BRAND, experience: M_EXPERIENCE, surfaces: M_SURFACES, compiler: M_COMPILER, assets: M_ASSETS };

export const DWS_PROFILES = { desktop: DESKTOP, tabletL: TABLET, tabletP: { ...TABLET, brand: D_BRAND } as Record<DwsMode, DwsProfile>, mobile: MOBILE } as const;

export function getDwsProfile(mode: DwsMode, family: DwsFamily): DwsProfile {
  return DWS_PROFILES[family][mode];
}

/** All profiles, for validation + the slot registry. */
export function allDwsProfiles(): { family: DwsFamily; mode: DwsMode; profile: DwsProfile }[] {
  const out: { family: DwsFamily; mode: DwsMode; profile: DwsProfile }[] = [];
  for (const family of Object.keys(DWS_PROFILES) as DwsFamily[]) for (const mode of Object.keys(DWS_PROFILES[family]) as DwsMode[]) out.push({ family, mode, profile: DWS_PROFILES[family][mode] });
  return out;
}

export const DWS_DEFAULT_DRAWER: Record<DwsMode, DwsDrawerKey> = {
  brand: 'brand-library',
  experience: 'journeys',
  surfaces: 'surface-families',
  compiler: 'synthesis',
  assets: 'asset-library',
};
