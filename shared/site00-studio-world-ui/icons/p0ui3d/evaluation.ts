import type { NDXIconName } from '../types.js';
import { P0_UI_3D_TARGET_ICONS, NDX_ICON_V3_REFERENCE_SILHOUETTE } from './constants.js';
import { NDX_ICON_GEOMETRY_V2 } from '../p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';
import { NDX_ICON_GEOMETRY_V3 } from './geometry/ndxIconGeometryV3ReferenceLocked.js';
import type { P0UI3DFailureCode } from './types.js';

export function iconPathWasReplaced(name: NDXIconName): boolean {
  if (!P0_UI_3D_TARGET_ICONS.includes(name)) return false;
  const prev = JSON.stringify(NDX_ICON_GEOMETRY_V2[name].paths);
  const next = JSON.stringify(NDX_ICON_GEOMETRY_V3[name].paths);
  return prev !== next;
}

export function ellipsisHasCircularContainer(paths: string[]): boolean {
  return paths.some((p) => p.includes('A6.5 6.5') || p.includes('A6.5'));
}

export function projectOverviewUsesStackedPages(paths: string[]): boolean {
  return paths.some((p) => p.includes('H16.25 V16.75')) && !paths.some((p) => p.includes('L12 5.5'));
}

export function detectLibraryIconSubstitution(source: string): boolean {
  return /lucide|heroicons|material-icons|fontawesome|bootstrap-icons/i.test(source);
}

export function auditReferenceLockedIcon(name: NDXIconName): {
  passed: boolean;
  failureCodes: P0UI3DFailureCode[];
} {
  const failures: P0UI3DFailureCode[] = [];
  if (!P0_UI_3D_TARGET_ICONS.includes(name)) {
    return { passed: true, failureCodes: [] };
  }
  const paths = NDX_ICON_GEOMETRY_V3[name].paths;
  const silhouette = NDX_ICON_V3_REFERENCE_SILHOUETTE[name];

  if (!iconPathWasReplaced(name) && name !== 'more') {
    failures.push('FAIL_ICON_PATH_NOT_REPLACED');
  }
  if (name === 'ellipsis' && !ellipsisHasCircularContainer(paths)) {
    failures.push('FAIL_HEADER_ELLIPSIS_CONTAINER_MISSING');
  }
  if (name === 'project_overview' && !projectOverviewUsesStackedPages(paths)) {
    failures.push('FAIL_PROJECT_MENU_ICON_REFERENCE_MISMATCH');
    failures.push('FAIL_SEMANTIC_ICON_REINTERPRETATION');
  }
  if (silhouette === 'HOUSE' && name === 'overview' && !paths.some((p) => p.includes('L12 5.5'))) {
    failures.push('FAIL_ICON_SILHOUETTE_MISMATCH');
  }
  if (failures.length === 0 && !NDX_ICON_GEOMETRY_V3[name].referenceIconNumber) {
    failures.push('FAIL_REFERENCE_ICON_NOT_USED');
  }
  return { passed: failures.length === 0, failureCodes: failures };
}

export function auditAllReferenceLockedIcons(): ReturnType<typeof auditReferenceLockedIcon>[] {
  return P0_UI_3D_TARGET_ICONS.map((name) => auditReferenceLockedIcon(name));
}
