import { NDX_ICON_REGISTRY } from '../registry.js';
import {
  BOTTOM_NAV_ICON_FAMILY_V1,
  BOTTOM_NAV_ICON_MEMBERS_PRE_SHEET,
  BOTTOM_NAV_ICON_MEMBERS_V1,
} from './bottomNavIconFamilyV1.js';
import type { VisualAssetMembership, VisualFamilySpec } from './types.js';

/**
 * NDX icons keep their geometry in NDX_ICON_REGISTRY.
 * This record only points at that registry so a second icon geometry source is not created.
 */
export const NDX_ICON_FAMILY_POINTER: VisualFamilySpec = {
  familyId: 'NDX_ICON_FAMILY',
  familyName: 'Studio World NDX icons',
  productOwner: 'STUDIO WORLD',
  surfaceScope: 'NDX workspace navigation and menus',
  assetClass: 'SYSTEM_ICON',
  semanticPurpose: 'Existing reference-locked NDX icon set.',
  visualGrammar: 'Defined by the NDX V3 geometry authority, not by this file.',
  geometricLanguage: 'See NDX_ICON_REGISTRY.',
  materialLanguage: 'currentColor stroke. Host supplies color.',
  strokeRules: 'NDX default stroke token.',
  cornerRules: 'Per NDX V3 traces.',
  depthRules: 'Flat.',
  lightingRules: 'None.',
  colorRules: 'currentColor. No hardcoded brand color in the SVG.',
  accentRules: 'Host canon.',
  negativeSpaceRules: 'Per icon trace.',
  boundingBoxRules: '24 viewBox.',
  opticalScaleRules: 'NDX optical calibration on each definition.',
  activeStateRules: 'NDX active behavior on the definition.',
  inactiveStateRules: 'Same drawing.',
  hoverStateRules: 'Host.',
  alertStateRules: 'Host.',
  backgroundRules: 'None.',
  transparencyRules: 'SVG.',
  motionRules: 'None in the registry.',
  referenceAssets: ['shared/site00-studio-world-ui/icons/registry.ts'],
  canonicalExamples: Object.keys(NDX_ICON_REGISTRY),
  antiExamples: [],
  version: 'V3',
  status: 'CANONICAL',
  owner: 'STUDIO WORLD',
  lastApprovedAt: null,
  lineage: {
    primaryAuthority: 'shared/site00-studio-world-ui/icons/p0ui3d/geometry/ndxIconGeometryV3ReferenceLocked.ts',
    secondaryAuthorities: ['shared/site00-studio-world-ui/icons/p0ui3e/v3AssetRegistry.generated.ts'],
    supersededExamples: ['V1 and V2 geometry marked SUPERSEDED inside the NDX authority records'],
    currentVersion: 'V3',
  },
  geometryRules: {
    strokeWidth: 1.5,
    linecap: 'round',
    linejoin: 'round',
    cornerMode: 'PER_ICON_TRACE',
    innerCoreRequired: false,
    bakedRed: false,
  },
  materialRules: ['currentColor'],
  colorRulesList: ['host tint'],
  stateRules: ['NDX active behavior'],
  qaRules: ['ndx icon system tests'],
};

export const VISUAL_FAMILY_REGISTRY: Record<string, VisualFamilySpec> = {
  [BOTTOM_NAV_ICON_FAMILY_V1.familyId]: BOTTOM_NAV_ICON_FAMILY_V1,
  [NDX_ICON_FAMILY_POINTER.familyId]: NDX_ICON_FAMILY_POINTER,
};

export const VISUAL_ASSET_MEMBERSHIP: VisualAssetMembership[] = [
  ...BOTTOM_NAV_ICON_MEMBERS_V1,
  ...BOTTOM_NAV_ICON_MEMBERS_PRE_SHEET,
];

export function visualFamily(familyId: string): VisualFamilySpec {
  const family = VISUAL_FAMILY_REGISTRY[familyId];
  if (!family) throw new Error(`Unknown visual family ${familyId}`);
  return family;
}

export function assetsInFamily(familyId: string, status?: VisualAssetMembership['canonStatus']): VisualAssetMembership[] {
  return VISUAL_ASSET_MEMBERSHIP.filter((row) => row.familyId === familyId && (status ? row.canonStatus === status : true));
}
