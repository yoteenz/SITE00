/**
 * P0.VR.DESIGNBENCH.OPUS-DIRECT1 — live text content for the isolated Opus direct
 * reconstruction of the NDXBOOK DESIGN golden reference.
 *
 * Every string here is read off the golden reference. Copy, casing and punctuation
 * are part of the reference: do not "normalise" them.
 */

export const TWIN_OPUS_DIRECT_LINEAGE = 'P0.VR.DESIGNBENCH.OPUS-DIRECT1' as const;

/** Golden reference pixel dimensions (founder attachment). */
export const TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT = { width: 768, height: 1376 } as const;

/** Repo copy of the same golden, used for pixel QA. */
export const TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH =
  '/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';

export const TWIN_OPUS_DIRECT_PRIMARY_NAV = [
  'REFERENCES',
  'ASSETS',
  'PAGES',
  'SKINS',
  'HISTORY',
] as const;

export type TwinOpusDirectViewportId = 'MOBILE' | 'TABLET' | 'DESKTOP';

export const TWIN_OPUS_DIRECT_VIEWPORTS: readonly TwinOpusDirectViewportId[] = [
  'MOBILE',
  'TABLET',
  'DESKTOP',
];

export const TWIN_OPUS_DIRECT_TARGET = {
  label: 'TARGET',
  lines: ['ENTRY 001', 'ENTRY COVER', 'HOMEPAGE HERO'],
} as const;

export const TWIN_OPUS_DIRECT_STAGE = {
  stageLabel: 'STAGE',
  stageValue: 'REVIEW_ACTIVE_CONCEPT',
  authorityLabel: 'AUTHORITY',
  authorityValue: 'PAIR: UNLOCKED · V1.3',
} as const;

export const TWIN_OPUS_DIRECT_HERO = {
  eyebrowLeft: 'ENTRY 001',
  eyebrowCentre: 'CULTURAL RECEIPT',
  eyebrowRight: '001',
  headline: ['THE SIGNAL', 'IS THE', 'INDEX'],
  standfirst: ['CULTURE AS EVIDENCE.', 'IDEAS AS INDEX.', 'NDXBOOK.'],
  footerLeft: ['INDEX SIGNAL:', 'PAGE 001 INDEXED'],
  footerMid: ['ARCHIVAL EVIDENCE', 'ATTACHED'],
  chip: 'EVIDENCE',
  overflow: '+12',
} as const;

export type TwinOpusDirectRailAction = {
  readonly id: string;
  readonly label: string;
  readonly tone: 'lime' | 'ghost' | 'ink';
  readonly lines?: readonly string[];
  readonly lock?: boolean;
};

export const TWIN_OPUS_DIRECT_RAIL_ACTIONS: readonly TwinOpusDirectRailAction[] = [
  { id: 'promote-mobile', label: 'PROMOTE MOBILE', tone: 'lime' },
  { id: 'promote-desktop', label: 'PROMOTE DESKTOP', tone: 'ghost' },
  { id: 'pair-review', label: 'PAIR REVIEW', tone: 'ink' },
  { id: 'review-authority', label: 'REVIEW AUTHORITY', tone: 'ghost' },
  {
    id: 'lock-pair',
    label: 'LOCK MOBILE + DESKTOP AUTHORITY PAIR',
    tone: 'ink',
    lines: ['LOCK MOBILE + DESKTOP', 'AUTHORITY PAIR'],
    lock: true,
  },
];

export type TwinOpusDirectCandidateSurface = 'plate' | 'grain' | 'collage' | 'archive';

/**
 * Version-tag treatment differs per card in the golden: the selected concept
 * carries a lime outlined chip, the next two carry plain light labels, and the
 * archive card carries none at all.
 */
export type TwinOpusDirectVersionTag = 'chip' | 'plain' | 'none';

export type TwinOpusDirectCandidate = {
  readonly id: string;
  readonly version: string;
  readonly surface: TwinOpusDirectCandidateSurface;
  readonly versionTag: TwinOpusDirectVersionTag;
};

export const TWIN_OPUS_DIRECT_CANDIDATES: readonly TwinOpusDirectCandidate[] = [
  { id: 'v13', version: 'V1.3', surface: 'plate', versionTag: 'chip' },
  { id: 'v12', version: 'V1.2', surface: 'grain', versionTag: 'plain' },
  { id: 'v11', version: 'V1.1', surface: 'collage', versionTag: 'plain' },
  { id: 'v10', version: 'V1.0', surface: 'archive', versionTag: 'none' },
];

export const TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS = [
  { id: 'refine', label: 'REFINE CONCEPT', icon: 'sliders' },
  { id: 'regenerate', label: 'REGENERATE CONCEPT', icon: 'cycle' },
  { id: 'inspect', label: 'INSPECT CANDIDATE', icon: 'inspect' },
  { id: 'fullscreen', label: 'VIEW FULLSCREEN', icon: 'expand' },
] as const;

export type TwinOpusDirectOutputColumn = {
  readonly id: string;
  readonly label: string;
  readonly lines: readonly [string, string];
  readonly source: string;
  readonly preview: 'manifest' | 'blueprint' | 'overlay' | 'evidence' | 'functions';
  readonly functions?: readonly string[];
};

export const TWIN_OPUS_DIRECT_OUTPUT_COLUMNS: readonly TwinOpusDirectOutputColumn[] = [
  {
    id: 'grounding',
    label: 'GROUNDING',
    lines: ['INDEX SIGNAL', 'MANIFEST'],
    source: 'SOURCE: APP.ASSET',
    preview: 'manifest',
  },
  {
    id: 'blueprint',
    label: 'BLUEPRINT',
    lines: ['LAYOUT + TYPE', 'SYSTEM'],
    source: 'NDXBOOK_GRID_V2',
    preview: 'blueprint',
  },
  {
    id: 'overlay',
    label: 'OVERLAY',
    lines: ['ANNOTATION LAYER', 'ON'],
    source: 'ANNOTATION_LAYER_v1',
    preview: 'overlay',
  },
  {
    id: 'assets',
    label: 'ASSETS',
    lines: ['EVIDENCE PACK', '12 ITEMS'],
    source: 'ASSET_PACK_ENTRY001',
    preview: 'evidence',
  },
  {
    id: 'function',
    label: 'FUNCTION',
    lines: ['MAPPING', '6 FUNCTIONS'],
    source: 'FUNCTION_MAP_v1',
    preview: 'functions',
    functions: [
      'F01_INDEX_SIGNAL',
      'F02_CROSS_REFERENCE',
      'F03_ARCHIVAL_LINK',
      'F04_CONTEXT_THREAD',
      'F05_SOURCE_TRACE',
      'F06_VERIFICATION',
    ],
  },
];

export const TWIN_OPUS_DIRECT_CHECKS = [
  { id: 'layout', label: 'LAYOUT SYSTEM', state: 'pass' as const },
  { id: 'type', label: 'TYPE SCALE', state: 'pass' as const },
  { id: 'assets', label: 'ASSET LINKS', state: 'pass' as const },
  { id: 'function', label: 'FUNCTION MAP', state: 'warn' as const },
  { id: 'a11y', label: 'ACCESSIBILITY', state: 'pass' as const },
];

export const TWIN_OPUS_DIRECT_STATUS_ROWS = [
  { id: 'approved', label: 'APPROVED ELEMENTS', value: '18' },
  { id: 'pending', label: 'PENDING DECISIONS', value: '2' },
  { id: 'blockers', label: 'BLOCKERS', value: '0' },
  { id: 'warnings', label: 'WARNINGS', value: '1' },
] as const;

export const TWIN_OPUS_DIRECT_NEXT_ACTION = {
  label: 'NEXT ACTION',
  lines: ['PROMOTE MOBILE MASTER', 'TO AUTHORITY PAIR'],
  primary: 'PRIMARY ACTION',
  secondary: ['MOVE TO BUILD WHEN READY', 'VIEW TECHNICAL DETAILS'],
} as const;

export const TWIN_OPUS_DIRECT_READINESS = {
  label: 'READINESS',
  percent: 82,
  state: 'READY',
  compiler: 'COMPILER:',
  compilerState: 'READY',
  checksLabel: 'CHECKS',
  statusLabel: 'STATUS',
  viewDetails: 'VIEW DETAILS',
} as const;

export const TWIN_OPUS_DIRECT_CONCEPT_TABS = [
  'CONCEPT DATA',
  'VERSION HISTORY',
  'CHANGE HISTORY',
  'MASTER UPDATE',
  'AMENDMENT',
] as const;

export const TWIN_OPUS_DIRECT_CONCEPT_FIELDS = [
  { label: 'CONCEPT ID:', value: 'ENTRY001_V1.3' },
  { label: 'CREATED:', value: '2026-05-16' },
  { label: 'UPDATED:', value: '2026-05-18' },
  { label: 'AUTHOR:', value: 'DESIGN SYSTEM' },
  { label: 'ARTIFACT TYPE:', value: 'ENTRY COVER' },
  { label: 'SOURCE:', value: 'ENTRY001-CAMPAIGN-ARCHIVE' },
] as const;

export const TWIN_OPUS_DIRECT_AMENDMENT = {
  title: 'MAA-RSF1-AUTHORITY-SELECTION-V1',
  chip: 'ACTIVE',
  fields: [
    { label: 'AMENDMENT TYPE:', value: 'AUTHORITY SELECTION' },
    { label: 'EFFECTIVE:', value: '2026-05-15' },
    { label: 'SCOPE:', value: 'DESIGN WORKSPACE' },
    { label: 'AUTHORITY WORKFLOW:', value: 'ENABLED' },
  ],
  action: 'VIEW AMENDMENT',
} as const;

export const TWIN_OPUS_DIRECT_BOTTOM_NAV = [
  { id: 'workspace', icon: 'grid', lines: ['WORKSPACE'] },
  { id: 'design-history', icon: 'history', lines: ['DESIGN HISTORY'] },
  { id: 'feature-change', icon: 'doc', lines: ['FEATURE CHANGE', 'HISTORY'] },
  { id: 'master-amendment', icon: 'shield', lines: ['MASTER AMENDMENT', 'STATUS'] },
  { id: 'next-action', icon: 'bolt', lines: ['CONTEXTUAL NEXT', 'ACTION'] },
] as const;

export const TWIN_OPUS_DIRECT_AUTHORITY_PAIR = {
  title: 'AUTHORITY PAIR',
  mobile: { label: 'MOBILE MASTER', version: 'V1.3', state: 'SELECTED' },
  desktop: { label: 'DESKTOP MASTER', version: 'V1.1', action: 'REPLACE' },
} as const;

export const TWIN_OPUS_DIRECT_SELECT_ACTIONS = {
  mobile: { label: 'SELECT FOR MOBILE', state: 'SELECTED' },
  desktop: { label: 'SELECT FOR DESKTOP' },
} as const;

export const TWIN_OPUS_DIRECT_HEADER = {
  brand: 'SITE 00',
  project: 'PROJECT: NDXBOOK',
  page: 'DESIGN',
  compiler: 'COMPILER: READY',
} as const;

export const TWIN_OPUS_DIRECT_CONTEXT = {
  chip: 'NDXBOOK',
  stream: 'CULTURAL_INTELLIGENCE_EDITORIAL',
  right: 'PROJECT CREATIVE CONTEXT',
} as const;

export const TWIN_OPUS_DIRECT_GALLERY = {
  title: 'CONCEPT CANDIDATE GALLERY',
  compare: 'COMPARE CONCEPTS',
} as const;

export const TWIN_OPUS_DIRECT_OUTPUT_TITLE = 'STRUCTURED OUTPUT REVIEW';
export const TWIN_OPUS_DIRECT_PIPELINE_TITLE = 'PIPELINE / READINESS';

/**
 * Closest available repo texture for the archival plates. The golden's exact
 * archival pointing-hand photograph is not a standalone repo asset, so the paper
 * scan is composited with an inline ink silhouette to preserve the composition.
 */
export const TWIN_OPUS_DIRECT_PAPER_TEXTURE =
  '/site00/creative-direction/ndxbook/eu-branch-receipts-isolated.webp';

/**
 * Grok-owned raster plates for P0.VR.DESIGNBENCH.GROK-ASSET-OPUS1.
 * Paths only — live copy above stays Opus-owned and must not change.
 */
export const TWIN_OPUS_DIRECT_ASSETS = {
  hand: '/site00/twin-opus-direct/tod-hand-plate.jpg',
  form: '/site00/twin-opus-direct/tod-form.png',
  overlay: '/site00/twin-opus-direct/tod-overlay-001.png',
  portrait: '/site00/twin-opus-direct/tod-portrait.png',
  blueprint: '/site00/twin-opus-direct/tod-blueprint.jpg',
  split001: '/site00/twin-opus-direct/tod-001-split.jpg',
  collage: '/site00/twin-opus-direct/tod-collage-plate.jpg',
  evidence: '/site00/twin-opus-direct/tod-evidence-pack.jpg',
  grain: '/site00/twin-opus-direct/tod-grain-plate.jpg',
} as const;
