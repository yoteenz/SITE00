/**
 * DESIGN UNIFIED WORKSPACE — content model (STRUCTURE2).
 * ALL user-visible strings are written in UPPERCASE here; the stylesheet also enforces it.
 * Seed content mirrors the approved authority pack (NDXBOOK). It is replaced by project data through the adapter
 * in `useDwsProject` — the shell, modes and expression states do not depend on where the content comes from.
 */

export const DWS_MODES = ['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'] as const;
export type DwsMode = (typeof DWS_MODES)[number];
/** The five boards-and-overlays modes. VIEWPORT is the final validation mode: a live-preview chamber, not a board stage. */
export type DwsArtMode = Exclude<DwsMode, 'viewport'>;

export const DWS_MODE_LABEL: Record<DwsMode, string> = {
  brand: 'BRAND',
  experience: 'EXPERIENCE',
  surfaces: 'SURFACES',
  compiler: 'COMPILER',
  assets: 'ASSETS',
  viewport: 'VIEWPORT',
};

export type DwsIconId = string;

/* ------------------------------------------------------------------ host: nav / projects */

export const DWS_NAV = [
  { id: 'hub', label: 'HUB', icon: 'hub' },
  { id: 'work', label: 'WORK', icon: 'work' },
  { id: 'library', label: 'LIBRARY', icon: 'library' },
  { id: 'activity', label: 'ACTIVITY', icon: 'activity' },
  { id: 'exit', label: 'EXIT', icon: 'exit' },
] as const;
export type DwsNavId = (typeof DWS_NAV)[number]['id'];

export const DWS_PROJECTS = [
  { slug: 'ndxbook', name: 'NDXBOOK' },
  { slug: 'frontal-slayer', name: 'FRONTAL SLAYER' },
  { slug: 'astral-world', name: 'ASTRAL WORLD' },
] as const;

/* ------------------------------------------------------------------ overlay vocabulary */

export type DwsDrawerId = 'brand-library' | 'journeys' | 'surface-families' | 'synthesis' | 'asset-library';
export type DwsInspectorId = 'asset-details' | 'interaction-select' | 'surface-details' | 'project-intelligence' | 'metadata-versions';
export type DwsModalId = 'brand-review' | 'path-review' | 'compare-surfaces' | 'authority-review' | 'asset-details' | 'export';

export const DWS_EXPRESSION: Record<DwsArtMode, { drawer: DwsDrawerId; inspector: DwsInspectorId; modal: DwsModalId }> = {
  brand: { drawer: 'brand-library', inspector: 'asset-details', modal: 'brand-review' },
  experience: { drawer: 'journeys', inspector: 'interaction-select', modal: 'path-review' },
  surfaces: { drawer: 'surface-families', inspector: 'surface-details', modal: 'compare-surfaces' },
  compiler: { drawer: 'synthesis', inspector: 'project-intelligence', modal: 'authority-review' },
  assets: { drawer: 'asset-library', inspector: 'metadata-versions', modal: 'asset-details' },
};

/* ------------------------------------------------------------------ BRAND library */

export type DwsStatus = 'PENDING REVIEW' | 'APPROVED' | 'CHANGES REQUESTED' | 'REJECTED' | 'IN REVIEW' | 'READY FOR REVIEW';

export type DwsAsset = {
  id: string;
  name: string;
  sub: string;
  version: string;
  group: string;
  tab: 'BRAND' | 'VISUALS' | 'TEMPLATES' | 'MEDIA';
  status: DwsStatus;
  type: string;
  file: string;
  created: string;
  modified: string;
  tags: string[];
  desc: string;
  usage: string;
};

const asset = (
  id: string,
  name: string,
  sub: string,
  group: string,
  tab: DwsAsset['tab'],
  status: DwsStatus = 'PENDING REVIEW',
): DwsAsset => ({
  id,
  name,
  sub,
  version: 'V2.1',
  group,
  tab,
  status,
  type: 'LOGO MARK',
  file: `NDXBOOK_${id.toUpperCase().replace(/-/g, '_')}_V2.1.SVG`,
  created: 'APR 12, 2024 · MAYA CHEN',
  modified: 'APR 14, 2024 · JORDAN PARK',
  tags: ['LOGO', 'BRAND', 'PRIMARY', 'IDENTITY', 'VECTOR'],
  desc: `${name} FOR NDXBOOK. USED ACROSS ALL CORE TOUCHPOINTS.`,
  usage: 'BRAND IDENTITY · ALL APPLICATIONS',
});

export const DWS_BRAND_TREE = [
  { id: 'identity', label: 'IDENTITY', children: ['LOGOS', 'COLOR', 'TYPOGRAPHY', 'ICONOGRAPHY', 'GRAPHIC SYSTEM', 'IMAGERY', 'MOTION', '3D ELEMENTS'] },
  { id: 'tone', label: 'TONE & VOICE', children: [] },
  { id: 'campaigns', label: 'CAMPAIGNS', children: [] },
  { id: 'applications', label: 'APPLICATIONS', children: [] },
  { id: 'reference', label: 'REFERENCE', children: [] },
  { id: 'archive', label: 'ARCHIVE', children: [] },
] as const;

export const DWS_BRAND_ASSETS: DwsAsset[] = [
  asset('primary-logo', 'NDXBOOK', 'PRIMARY LOGO', 'LOGOS', 'BRAND'),
  asset('monogram', 'MONOGRAM', 'SYMBOL ONLY', 'LOGOS', 'BRAND', 'APPROVED'),
  asset('wordmark', 'WORDMARK', 'V1.0', 'LOGOS', 'BRAND', 'APPROVED'),
  asset('lockup-vertical', 'LOGO LOCKUP', 'VERTICAL', 'LOGOS', 'BRAND'),
  asset('lockup-horizontal', 'LOGO LOCKUP', 'HORIZONTAL', 'LOGOS', 'BRAND'),
  asset('app-icon', 'ICON', 'APP ICON', 'LOGOS', 'VISUALS'),
  asset('logo-on-dark', 'LOGO ON DARK', 'WHITE', 'LOGOS', 'BRAND', 'APPROVED'),
  asset('logo-on-light', 'LOGO ON LIGHT', 'BLACK', 'LOGOS', 'BRAND', 'APPROVED'),
  asset('animated-logo', 'ANIMATED LOGO', 'MOTION', 'LOGOS', 'MEDIA'),
  asset('typography-system', 'TYPOGRAPHY SYSTEM', 'TYPEFACES & HIERARCHY', 'TYPOGRAPHY', 'TEMPLATES'),
  asset('palette-v2', 'PALETTE DIRECTION', 'COLOR SYSTEM V2', 'COLOR', 'VISUALS'),
  asset('brand-film', 'BRAND FILM', 'VISUAL DIRECTION', 'MOTION', 'MEDIA'),
];

/* ------------------------------------------------------------------ EXPERIENCE map */

export const DWS_JOURNEYS = [
  { id: 'main', code: '01', name: 'MAIN USER JOURNEY', states: 12, flows: 4, active: true },
  { id: 'account', code: '02', name: 'ACCOUNT SETUP', states: 8, flows: 3, active: false },
  { id: 'content', code: '03', name: 'CONTENT CREATION', states: 14, flows: 6, active: false },
  { id: 'collab', code: '04', name: 'COLLABORATION', states: 9, flows: 4, active: false },
  { id: 'publish', code: '05', name: 'PUBLISH & SHARE', states: 11, flows: 5, active: false },
] as const;

export type DwsNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  kind: 'entry' | 'step' | 'key' | 'end';
  type: string;
  nodeId: string;
  desc: string;
  transition: string;
  duration: string;
  easing: string;
  trigger: string;
  haptic: boolean;
  interactions: { name: string; trigger: string }[];
};

const node = (id: string, label: string, sub: string, x: number, y: number, kind: DwsNode['kind']): DwsNode => ({
  id,
  label,
  sub,
  x,
  y,
  kind,
  type: 'SCREEN',
  nodeId: `ST_${id.toUpperCase()}_03`,
  desc: `${label} STATE — USER PREVIEWS THE SELECTED EXPERIENCE WITH DYNAMIC CONTENT AND REAL-TIME FEEDBACK.`,
  transition: 'FADE + PUSH UP',
  duration: '400 MS',
  easing: 'CUBIC BEZIER (0.4, 0, 0.2, 1)',
  trigger: 'ON TAP',
  haptic: true,
  interactions: [
    { name: 'PREVIEW MEDIA', trigger: 'ON TAP' },
    { name: 'SHOW METADATA', trigger: 'ON HOVER' },
    { name: 'ADD TO COLLECTION', trigger: 'ON TAP' },
  ],
});

export const DWS_NODES: DwsNode[] = [
  node('entry', 'ENTRY', 'LANDING', 8, 76, 'entry'),
  node('learn', 'LEARN', 'GUIDANCE', 28, 64, 'step'),
  node('explore', 'EXPLORE', 'BROWSE', 30, 30, 'key'),
  node('select', 'SELECT', 'PREVIEW', 50, 44, 'key'),
  node('customize', 'CUSTOMIZE', 'CONFIGURE', 66, 24, 'step'),
  node('confirm', 'CONFIRM', 'REVIEW', 72, 56, 'key'),
  node('save', 'SAVE', 'DRAFT', 48, 84, 'step'),
  node('complete', 'COMPLETE', 'SUCCESS', 90, 76, 'end'),
];

export const DWS_EDGES: [string, string][] = [
  ['entry', 'learn'],
  ['learn', 'explore'],
  ['explore', 'select'],
  ['select', 'customize'],
  ['customize', 'confirm'],
  ['confirm', 'complete'],
  ['select', 'save'],
  ['learn', 'save'],
];

export const DWS_PATH = ['MAIN USER JOURNEY', 'EXPLORE', 'SELECT', 'CUSTOMIZE', 'CONFIRM'] as const;
export const DWS_EXP_FILTERS = ['PEOPLE', 'JOURNEYS', 'FLOWS', 'ROUTE MAPS', 'TOUCHPOINTS', 'STATES', 'INTERACTIONS', 'OUTCOMES'] as const;

/* ------------------------------------------------------------------ SURFACES */

export const DWS_SURFACE_FAMILIES = [
  { id: 'all', label: 'ALL SURFACES', count: 134, icon: 'layers' },
  { id: 'desktop', label: 'DESKTOP', count: 28, icon: 'monitor' },
  { id: 'tablet', label: 'TABLET', count: 24, icon: 'tablet' },
  { id: 'mobile', label: 'MOBILE', count: 32, icon: 'phone' },
  { id: 'app', label: 'APP', count: 18, icon: 'grid' },
  { id: 'environment', label: 'ENVIRONMENT', count: 12, icon: 'cube' },
  { id: 'components', label: 'COMPONENTS', count: 42, icon: 'layers' },
  { id: 'states', label: 'STATES', count: 26, icon: 'sliders' },
  { id: 'layouts', label: 'LAYOUTS', count: 20, icon: 'layout' },
  { id: 'motion', label: 'MOTION', count: 14, icon: 'wave' },
] as const;

export const DWS_SURFACES = [
  { id: 'desktop', label: 'DESKTOP', res: '1920 × 1080', platform: 'DESKTOP', category: 'CORE EXPERIENCE', version: 'V1.4.0', updated: 'FEB 14, 2024', owner: 'DESIGN SYSTEMS', tags: ['DESKTOP', 'EXPRESSION', 'CORE', 'UI SYSTEM', 'NDXBOOK'] },
  { id: 'tablet', label: 'TABLET', res: '1024 × 768', platform: 'TABLET', category: 'CORE EXPERIENCE', version: 'V1.2.0', updated: 'FEB 12, 2024', owner: 'DESIGN SYSTEMS', tags: ['TABLET', 'EXPRESSION', 'CORE'] },
  { id: 'mobile', label: 'MOBILE', res: '390 × 844', platform: 'MOBILE', category: 'CORE EXPERIENCE', version: 'V1.1.0', updated: 'FEB 10, 2024', owner: 'DESIGN SYSTEMS', tags: ['MOBILE', 'EXPRESSION', 'CORE'] },
  { id: 'app', label: 'APP', res: 'APP MODULES', platform: 'APP', category: 'MODULES', version: 'V1.0.0', updated: 'FEB 02, 2024', owner: 'DESIGN SYSTEMS', tags: ['APP', 'MODULES'] },
] as const;

export const DWS_SURFACE_TABS = ['DESKTOP', 'TABLET', 'MOBILE', 'APP', 'RESPONSIVE', 'COMPONENTS'] as const;
export const DWS_VARIANTS = ['01 PRIMARY', '02 ALTERNATE', '03 DARK', '04 MINIMAL'] as const;

/* ------------------------------------------------------------------ COMPILER */

export const DWS_COMPILER_FAMILIES = [
  { id: 'ui', label: 'UI COMPONENTS', count: 12, icon: 'frame' },
  { id: 'spatial', label: 'SPATIAL ELEMENTS', count: 8, icon: 'cube' },
  { id: 'content', label: 'CONTENT MODULES', count: 16, icon: 'layers' },
  { id: 'interaction', label: 'INTERACTION PATTERNS', count: 24, icon: 'lattice' },
  { id: 'visual', label: 'VISUAL EXPRESSIONS', count: 11, icon: 'eye' },
  { id: 'behavioral', label: 'BEHAVIORAL LOGIC', count: 9, icon: 'settings' },
] as const;

export const DWS_COMPILER_INPUTS = [
  { id: 'in-1', label: 'DATA' },
  { id: 'in-2', label: 'RULES' },
  { id: 'in-3', label: 'REFERENCES' },
] as const;

export const DWS_EXPRESSION_RECORD = {
  id: 'G-EX-027',
  name: 'ADAPTIVE HOVER TRANSITION',
  type: 'INTERACTION PATTERN',
  family: 'MICRO INTERACTIONS',
  status: 'READY FOR REVIEW' as DwsStatus,
  version: 'V3.2',
  modified: 'TODAY 10:42 AM',
  author: 'STUDIO SYSTEM',
};

/* ------------------------------------------------------------------ ASSETS */

export const DWS_ASSET_GROUPS = [
  { id: 'all', label: 'ALL ASSETS', count: '1,248', icon: 'layers' },
  { id: 'authorities', label: 'VISUAL AUTHORITIES', count: '124', icon: 'frame' },
  { id: 'icons', label: 'ICON SETS', count: '86', icon: 'hexagon' },
  { id: 'materials', label: 'MATERIALS', count: '142', icon: 'sphere' },
  { id: 'components', label: 'COMPONENTS', count: '210', icon: 'cube' },
  { id: 'plates', label: 'ENVIRONMENT PLATES', count: '98', icon: 'plate' },
  { id: 'templates', label: 'TEMPLATES', count: '76', icon: 'doc' },
  { id: 'exports', label: 'EXPORT PACKS', count: '62', icon: 'download' },
  { id: 'favorites', label: 'FAVORITES', count: '24', icon: 'heart' },
] as const;

export const DWS_ICON_SET_ITEMS = Array.from({ length: 20 }, (_, i) => ({
  id: `icon-core-${String(i + 1).padStart(3, '0')}`,
  name: `ICON / CORE / ${String(i + 1).padStart(3, '0')}`,
  starred: i % 4 === 0,
}));

export const DWS_EXPORT_FORMATS = [
  { id: 'png', label: 'PNG', hint: '1X, 2X, 4X' },
  { id: 'jpg', label: 'JPG', hint: '' },
  { id: 'webp', label: 'WEBP', hint: '' },
  { id: 'svg', label: 'SVG', hint: '' },
  { id: 'usdz', label: 'USDZ', hint: '' },
] as const;
export type DwsExportFormat = (typeof DWS_EXPORT_FORMATS)[number]['id'];

export const DWS_VERSIONS = [
  { v: 'V2.1', note: 'PRIMARY MARK REFINED', date: 'APR 14, 2024' },
  { v: 'V2.0', note: 'COLOR SYSTEM UPDATE', date: 'MAR 28, 2024' },
  { v: 'V1.2', note: 'INITIAL APPROVED', date: 'FEB 20, 2024' },
] as const;

export const DWS_ACTIVITY_SEED = [
  { id: 'a1', text: 'VISUAL IDENTITY SENT FOR REVIEW', when: 'TODAY 10:42' },
  { id: 'a2', text: 'PALETTE DIRECTION UPDATED TO V2', when: 'TODAY 09:15' },
  { id: 'a3', text: 'TYPOGRAPHY SYSTEM COMMENTED', when: 'YESTERDAY' },
];
