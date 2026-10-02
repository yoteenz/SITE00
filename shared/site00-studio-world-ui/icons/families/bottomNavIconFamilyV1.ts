import type { VisualAssetMembership, VisualFamilySpec } from './types.js';

const PACK = 'docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1';
const PRIOR = 'docs/site00/bottom-nav/GROK_ICON_PACK';

export const BOTTOM_NAV_ICON_ORDER = [
  'HUB',
  'INBOX',
  'DESIGN',
  'EXPERIENCE',
  'EXPRESSION',
  'LIBRARY',
  'ACTIVITY',
] as const;

export type BottomNavIconRole = (typeof BOTTOM_NAV_ICON_ORDER)[number];

const SEMANTICS: Record<BottomNavIconRole, string> = {
  HUB: 'Stacked diamonds from the sheet. Top diamond is solid. Two outlined diamonds sit under it.',
  INBOX: 'Rounded envelope from the sheet. The flap is the inner V. The red dot is a host accent.',
  DESIGN: 'Same diamond stack as HUB, with the top diamond left open.',
  EXPERIENCE: 'Ring and rounded play triangle from the sheet.',
  EXPRESSION: 'Rounded isometric cube from the sheet, with the front-edge notch.',
  LIBRARY: 'Three rounded volumes from the sheet. Center volume is tallest and carries the spine mark.',
  ACTIVITY: 'Pulse from the sheet: peak, valley, and level tails. The red dot is a host accent.',
};

export const BOTTOM_NAV_ICON_FAMILY_V1: VisualFamilySpec = {
  familyId: 'BOTTOM_NAV_ICON_FAMILY',
  familyName: 'Production bottom navigation icons',
  productOwner: 'STUDIO OS HOST CHROME',
  surfaceScope: 'PRODUCTION BOTTOM NAV',
  assetClass: 'NAV_ICON',
  semanticPurpose: 'Seven destinations for the production bottom nav, in fixed order.',
  visualGrammar: 'Outer geometry plus an inner functional core, one structural axis, optional host signal point.',
  geometricLanguage: 'Traced from the attached sheet. Shared 30px stroke on a 512 canvas. Diamond stacks, rounded envelope, play triangle, cube, volumes, pulse.',
  materialLanguage: 'Flat charcoal line. One solid core only where the role is the operating layer (HUB top slab).',
  strokeRules: 'One stroke weight for every outline. No mixed weights.',
  cornerRules: 'Sharp miters. LIBRARY volume caps are the only radius, and all three volumes share it.',
  depthRules: 'Depth is drawn as offset planes or an isometric wireframe, not as shading.',
  lightingRules: 'No lighting, gradients, or shadows.',
  colorRules: 'Base master is #141414 on transparency.',
  accentRules: 'SITE 00 red #e5231b is host-controlled. It is not baked into the master PNG.',
  negativeSpaceRules: 'Interiors stay open: envelope, portal, cube, and the gaps between layers and volumes.',
  boundingBoxRules: 'Every master is 512×512. Longest ink side is normalized to the same optical target.',
  opticalScaleRules: 'Must stay distinguishable at 20px and 26px.',
  activeStateRules: 'The host tints the same master. Active and inactive are not two drawings.',
  inactiveStateRules: 'Charcoal master, or currentColor when wired later.',
  hoverStateRules: 'Host may darken or tint. No separate hover drawing in V1.',
  alertStateRules: 'Host may place a red dot on INBOX and may tint the ACTIVITY terminal. Positions are documented on the master sheet only.',
  backgroundRules: 'No tiles, plates, or frames inside the icon file.',
  transparencyRules: 'Full transparency outside the glyph. Corner pixels are clear.',
  motionRules: 'No motion in the master. A future live state may pulse the ACTIVITY terminal without changing the drawing.',
  referenceAssets: [`${PACK}/authority/BOTTOM_NAV_ICON_PACK_SHEET.jpg`],
  canonicalExamples: BOTTOM_NAV_ICON_ORDER.map((role) => `${PACK}/outputs/${fileFor(role)}.png`),
  antiExamples: [
    'Generic house for HUB',
    'Lucide rounded envelope for INBOX',
    'Filled video play button for EXPERIENCE',
    'Bookshelf clipart for LIBRARY',
    'Medical ECG trace for ACTIVITY',
    'Unrelated corner radii and mixed stroke weights',
  ],
  version: 'V1',
  status: 'FOUNDER_REVIEW',
  owner: 'STUDIO OS HOST CHROME',
  lastApprovedAt: null,
  lineage: {
    primaryAuthority: `${PACK}/authority/BOTTOM_NAV_ICON_PACK_SHEET.jpg`,
    secondaryAuthorities: [
      'SITE 00 authority icon sheet line language, used as construction reference only',
      `${PRIOR}/README.md`,
    ],
    supersededExamples: [`${PRIOR}/outputs/`],
    currentVersion: 'V1',
  },
  geometryRules: {
    strokeWidth: 30,
    linecap: 'butt',
    linejoin: 'miter',
    cornerMode: 'SHARP_MITER',
    innerCoreRequired: true,
    bakedRed: false,
  },
  materialRules: ['charcoal line', 'single solid core on HUB only', 'no gradients', 'no shadows'],
  colorRulesList: ['#141414 default', 'transparent ground', 'red reserved for the host'],
  stateRules: ['BASE charcoal', 'ACTIVE host tint', 'ALERT host dot'],
  qaRules: [
    'stroke-weight',
    'visual-mass',
    'bounding-box',
    'center-of-gravity',
    'optical-size',
    'corner-treatment',
    'negative-space',
    'red-accent-usage',
    'semantic-clarity',
    'small-size-legibility',
    'family-resemblance',
    'generic-icon-drift',
  ],
};

function fileFor(role: BottomNavIconRole): string {
  const index = BOTTOM_NAV_ICON_ORDER.indexOf(role) + 1;
  return `${String(index).padStart(2, '0')}_${role}`;
}

const PRIOR_ROLES: BottomNavIconRole[] = [...BOTTOM_NAV_ICON_ORDER];

export const BOTTOM_NAV_ICON_MEMBERS_V1: VisualAssetMembership[] = BOTTOM_NAV_ICON_ORDER.map((role) => ({
  assetId: `bottom-nav.v1.${role.toLowerCase()}`,
  assetName: role,
  assetClass: 'NAV_ICON',
  familyId: BOTTOM_NAV_ICON_FAMILY_V1.familyId,
  semanticRole: role,
  owner: 'STUDIO OS HOST CHROME',
  source: 'FABRICATED_FROM_BOTTOM_NAV_ICON_PACK_SHEET',
  authorityReference: BOTTOM_NAV_ICON_FAMILY_V1.lineage.primaryAuthority,
  derivedFrom: 'BOTTOM_NAV_ICON_PACK_SHEET',
  variantOf: null,
  state: 'BASE',
  viewportUsage: '20-26px production bottom nav, masters at 512',
  surfaceUsage: 'PRODUCTION BOTTOM NAV',
  colorMode: 'CHARCOAL_MASTER',
  canonStatus: 'FOUNDER_REVIEW',
  version: 'V1',
  supersedes: `bottom-nav.pre-sheet.${role.toLowerCase()}`,
  supersededBy: null,
  file: `${PACK}/outputs/${fileFor(role)}.png`,
  notes: SEMANTICS[role],
}));

export const BOTTOM_NAV_ICON_MEMBERS_PRE_SHEET: VisualAssetMembership[] = PRIOR_ROLES.map((role) => ({
  assetId: `bottom-nav.pre-sheet.${role.toLowerCase()}`,
  assetName: `${role} pre-sheet`,
  assetClass: 'NAV_ICON',
  familyId: BOTTOM_NAV_ICON_FAMILY_V1.familyId,
  semanticRole: role,
  owner: 'STUDIO OS HOST CHROME',
  source: 'GROK_ICON_PACK',
  authorityReference: `${PRIOR}/README.md`,
  derivedFrom: null,
  variantOf: null,
  state: 'BASE',
  viewportUsage: '512 master',
  surfaceUsage: 'PRODUCTION BOTTOM NAV',
  colorMode: 'CHARCOAL_MASTER',
  canonStatus: 'SUPERSEDED',
  version: 'PRE_SHEET',
  supersedes: null,
  supersededBy: `bottom-nav.v1.${role.toLowerCase()}`,
  file: `${PRIOR}/outputs/${fileFor(role)}.png`,
  notes: 'Earlier fabrication from a different authority reading. Kept for lineage. Not the V1 drawing.',
}));

export function bottomNavMember(role: BottomNavIconRole): VisualAssetMembership {
  const member = BOTTOM_NAV_ICON_MEMBERS_V1.find((row) => row.semanticRole === role);
  if (!member) throw new Error(`Missing bottom nav member ${role}`);
  return member;
}
