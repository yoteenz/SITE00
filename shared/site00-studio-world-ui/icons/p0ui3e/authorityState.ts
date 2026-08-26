import { P0_UI_3D_TARGET_ICONS } from '../p0ui3d/constants.js';
import type { NDXIconName } from '../types.js';
import type { IconGeometryAuthorityRecord, IconGeometryAuthorityState } from './types.js';

const SUPERSEDED: IconGeometryAuthorityState = 'SUPERSEDED';
const ACTIVE: IconGeometryAuthorityState = 'ACTIVE_CANONICAL';
const LEGACY: IconGeometryAuthorityState = 'LEGACY';

export const NDX_ICON_VISUAL_CANON_REFERENCE = {
  id: 'NDX_ICON_VISUAL_CANON_REFERENCE',
  source: 'visual-references/founder/ndxbook/ndx-icon-reference-sheet-p0ui3d.jpg',
  lineage: 'P0.UI.3D → P0.UI.3E',
} as const;

export function buildIconGeometryAuthorityState(): IconGeometryAuthorityRecord[] {
  return P0_UI_3D_TARGET_ICONS.map((iconName) => ({
    iconName: iconName as NDXIconName,
    v1: SUPERSEDED,
    v2: SUPERSEDED,
    v3: ACTIVE,
  }));
}

export function geometryAuthorityForIcon(name: NDXIconName): IconGeometryAuthorityState {
  if (P0_UI_3D_TARGET_ICONS.includes(name)) return ACTIVE;
  return LEGACY;
}

/** Old inline path signatures that must NOT appear in active target definitions. */
export const NDX_LEGACY_ACTIVE_PATH_SIGNATURES: Partial<Record<NDXIconName, string[]>> = {
  overview: ['M6.25 10.75 L12 4.25', 'h7v7'],
  ellipsis: ['cx: 7.25', 'cx:7.25'],
  project_overview: ['M6.25 10.75 L12 4.25'],
};

export function activeDefinitionContainsLegacySignature(
  name: NDXIconName,
  paths: string[],
): boolean {
  const sigs = NDX_LEGACY_ACTIVE_PATH_SIGNATURES[name];
  if (!sigs) return false;
  const joined = paths.join(' ');
  return sigs.some((s) => joined.includes(s));
}
