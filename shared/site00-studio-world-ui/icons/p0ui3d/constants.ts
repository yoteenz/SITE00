import type { NDXIconName } from '../types.js';
import type { IconReferenceCrop, NdxIconReferenceAuthorityMapEntry } from './types.js';

export const NDX_ICON_VISUAL_CANON_V3 = 'NDX_ICON_VISUAL_CANON_V3' as const;

export const NDX_ICON_REFERENCE_SHEET_SOURCE_ID = 'ndxbook-icon-reference-sheet-p0ui3d' as const;

export const NDX_ICON_REFERENCE_SHEET_PATH =
  'visual-references/founder/ndxbook/ndx-icon-reference-sheet-p0ui3d.jpg' as const;

export const NDX_ICON_REFERENCE_SHEET_WIDTH = 1122;
export const NDX_ICON_REFERENCE_SHEET_HEIGHT = 1402;

export const NDX_ICON_V3_CROP_DIR = 'visual-references/founder/ndxbook/icon-crops-v3';

/** Primary visual authority — attached icon reference sheet (13 labeled icons). */
export const NDX_ICON_REFERENCE_AUTHORITY = {
  attachment: 'ndx-icon-reference-sheet-p0ui3d.jpg',
  iconCount: 13,
  scope: 'PRIMARY_ICON_VISUAL_AUTHORITY' as const,
  canonVersion: NDX_ICON_VISUAL_CANON_V3,
} as const;

export const NDXIconReferenceAuthorityMap: Record<string, NdxIconReferenceAuthorityMapEntry> = {
  overview: { registryName: 'overview', referenceIconNumber: 1, referenceLabel: 'OVERVIEW' },
  campaigns: { registryName: 'campaigns', referenceIconNumber: 2, referenceLabel: 'CAMPAIGNS' },
  content_ops: { registryName: 'content_ops', referenceIconNumber: 3, referenceLabel: 'CONTENT OPS' },
  lab: { registryName: 'lab', referenceIconNumber: 4, referenceLabel: 'LAB' },
  more: { registryName: 'more', referenceIconNumber: 5, referenceLabel: 'MORE' },
  notifications: { registryName: 'notifications', referenceIconNumber: 6, referenceLabel: 'NOTIFICATIONS' },
  project_menu: { registryName: 'ellipsis', referenceIconNumber: 7, referenceLabel: 'PROJECT MENU / ELLIPSIS' },
  project_overview: { registryName: 'project_overview', referenceIconNumber: 8, referenceLabel: 'PROJECT OVERVIEW' },
  project_settings: { registryName: 'project_settings', referenceIconNumber: 9, referenceLabel: 'PROJECT SETTINGS' },
  back_to_projects: { registryName: 'back_to_projects', referenceIconNumber: 10, referenceLabel: 'BACK TO PROJECTS' },
  return_to_origin: { registryName: 'return_to_origin', referenceIconNumber: 11, referenceLabel: 'RETURN TO ORIGIN' },
  inspect: { registryName: 'inspect', referenceIconNumber: 12, referenceLabel: 'INSPECT' },
  help: { registryName: 'help', referenceIconNumber: 13, referenceLabel: 'HELP' },
};

export const P0_UI_3D_TARGET_ICONS: NDXIconName[] = [
  'overview',
  'campaigns',
  'content_ops',
  'lab',
  'more',
  'notifications',
  'ellipsis',
  'project_overview',
  'project_settings',
  'back_to_projects',
  'return_to_origin',
  'inspect',
  'help',
];

function crop(
  iconName: NDXIconName,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { activeStateAvailable?: boolean; inactiveStateAvailable?: boolean } = {},
): IconReferenceCrop {
  return {
    iconName,
    referenceAssetId: `${NDX_ICON_REFERENCE_SHEET_SOURCE_ID}:${iconName}`,
    sourceReferenceId: NDX_ICON_REFERENCE_SHEET_SOURCE_ID,
    cropX: x,
    cropY: y,
    cropWidth: w,
    cropHeight: h,
    referenceWidth: w,
    referenceHeight: h,
    referenceScale: 1,
    activeState: 'inactive',
    activeStateAvailable: opts.activeStateAvailable ?? true,
    inactiveStateAvailable: opts.inactiveStateAvailable ?? true,
    foregroundColor: '#111111',
    backgroundColor: '#faf8f5',
  };
}

/** Icon-only crops from attached reference sheet (labels excluded). */
export const NDX_ICON_V3_CROPS: Record<string, IconReferenceCrop> = {
  overview: crop('overview', 92, 128, 88, 88, { activeStateAvailable: true }),
  campaigns: crop('campaigns', 317, 128, 88, 88, { activeStateAvailable: true }),
  content_ops: crop('content_ops', 538, 128, 88, 88, { activeStateAvailable: true }),
  lab: crop('lab', 783, 128, 68, 88, { activeStateAvailable: true }),
  more: crop('more', 988, 128, 58, 88, { activeStateAvailable: true }),
  notifications: crop('notifications', 54, 583, 88, 88),
  ellipsis: crop('ellipsis', 300, 583, 88, 88),
  project_overview: crop('project_overview', 35, 906, 88, 88),
  project_settings: crop('project_settings', 369, 906, 88, 88),
  back_to_projects: crop('back_to_projects', 748, 906, 88, 88),
  return_to_origin: crop('return_to_origin', 111, 998, 88, 88),
  inspect: crop('inspect', 475, 998, 88, 88),
  help: crop('help', 815, 998, 88, 88),
};

export const P0_UI_3D_FAILURE_TAXONOMY = [
  'FAIL_OLD_ICON_GEOMETRY_INCORRECTLY_PROTECTED',
  'FAIL_REFERENCE_ICON_NOT_USED',
  'FAIL_SEMANTIC_ICON_REINTERPRETATION',
  'FAIL_LIBRARY_ICON_SUBSTITUTION',
  'FAIL_ICON_PATH_NOT_REPLACED',
  'FAIL_ICON_SILHOUETTE_MISMATCH',
  'FAIL_ICON_OPTICAL_FOOTPRINT_MISMATCH',
  'FAIL_HEADER_ELLIPSIS_CONTAINER_MISSING',
  'FAIL_ACTIVE_ICON_GEOMETRY_VARIATION',
  'FAIL_PROJECT_MENU_ICON_REFERENCE_MISMATCH',
] as const;

export const NDX_ICON_V3_REFERENCE_SILHOUETTE: Partial<Record<NDXIconName, string>> = {
  overview: 'HOUSE',
  campaigns: 'CLAPPER',
  content_ops: 'CIRCLE_TARGET',
  lab: 'FLASK',
  more: 'DOTS',
  ellipsis: 'CIRCLE_DOTS',
  notifications: 'BELL',
  project_overview: 'STACKED_PAGES',
  project_settings: 'GEAR',
  back_to_projects: 'DOOR_ARROW',
  return_to_origin: 'PLANET',
  inspect: 'MAGNIFIER',
  help: 'QUESTION_CIRCLE',
};

/** V2 paths that must NOT appear in V3 for target icons. */
export const NDX_ICON_V2_SUPERSEDED_PATH_MARKERS: Partial<Record<NDXIconName, string[]>> = {
  ellipsis: ['cx: 7.25', 'cx:7.25'],
  project_overview: ['L12 4.25', 'M6.25 10.75'],
};
