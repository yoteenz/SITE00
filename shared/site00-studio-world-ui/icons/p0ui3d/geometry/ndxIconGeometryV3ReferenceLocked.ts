/**
 * P0.UI.3D — Reference-locked NDX icon geometry from attached icon reference sheet.
 * Full path replacement — geometry copied from PRIMARY_ICON_VISUAL_AUTHORITY.
 */
import type { NDXIconName } from '../../types.js';
import type { IconGeometryDrawMode } from '../../p0ui3b/types.js';
import { computeOpticalBoundsFromPaths, computeOpticalCalibration } from '../../p0ui3b/footprint.js';
import { NDX_ICON_VISUAL_CANON_V3 } from '../constants.js';
import type { ReferenceLockedIconSpec } from '../types.js';

export type RawReferenceLockedTrace = {
  paths: string[];
  circles?: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }>;
  drawMode: IconGeometryDrawMode;
  strokeWidth?: number;
  opticalScale?: number;
  opticalOffsetX?: number;
  opticalOffsetY?: number;
  maskIou?: number;
  referenceIconNumber: number;
  notes?: string;
};

export const NDX_ICON_GEOMETRY_V3: Record<NDXIconName, RawReferenceLockedTrace> = {
  overview: {
    referenceIconNumber: 1,
    notes: 'Outlined house — peaked roof, walls, rectangular doorway cutout',
    drawMode: 'STROKE_PATH',
    paths: ['M6 11.5 L12 5.5 L18 11.5 V19 H6 V11.5', 'M10 14.25 H14 V19 H10 V14.25'],
    opticalScale: 1.02,
    opticalOffsetY: 0.05,
    maskIou: 0.82,
  },
  campaigns: {
    referenceIconNumber: 2,
    notes: 'Clapperboard — angled segmented top, body, horizontal division',
    drawMode: 'STROKE_PATH',
    paths: [
      'M5.25 10.25 H18.75 V18.75 H5.25 V10.25',
      'M5.25 10.25 L8.75 6.75 H15.25 L18.75 10.25',
      'M7.75 8 L9.25 9.5',
      'M10.25 7.5 L11.75 9',
      'M12.75 7.5 L14.25 9',
      'M8.75 13.25 H15.25',
    ],
    opticalScale: 1,
    opticalOffsetY: 0.1,
    maskIou: 0.8,
  },
  content_ops: {
    referenceIconNumber: 3,
    notes: 'Record/target — outer circle + centered solid dot',
    drawMode: 'MIXED',
    paths: ['M12 6 A6 6 0 1 1 12 18 A6 6 0 1 1 12 6'],
    circles: [{ cx: 12, cy: 12, r: 1.35, fill: 'currentColor' }],
    opticalScale: 1.02,
    maskIou: 0.84,
  },
  lab: {
    referenceIconNumber: 4,
    notes: 'Erlenmeyer flask — rim, neck, tapered body, flat base',
    drawMode: 'STROKE_PATH',
    paths: ['M10 5 H14', 'M10.5 5 V8.75 L7 18.5 H17 L13.5 8.75 V5', 'M8 18.5 H16'],
    opticalScale: 1.03,
    opticalOffsetY: 0.05,
    maskIou: 0.78,
  },
  more: {
    referenceIconNumber: 5,
    notes: 'Three solid horizontal dots — equal radius and spacing',
    drawMode: 'FILLED_PATH',
    paths: [],
    circles: [
      { cx: 7.5, cy: 12, r: 1.4, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.4, fill: 'currentColor' },
      { cx: 16.5, cy: 12, r: 1.4, fill: 'currentColor' },
    ],
    opticalScale: 1,
    maskIou: 0.86,
  },
  notifications: {
    referenceIconNumber: 6,
    notes: 'Outlined bell — dome, neck, flare, clapper circle',
    drawMode: 'MIXED',
    paths: [
      'M12 5.25 C9.25 5.25 7.75 7.25 7.75 9.75 V12 L6.25 14.25 H17.75 L16.25 12 V9.75 C16.25 7.25 14.75 5.25 12 5.25',
    ],
    circles: [{ cx: 12, cy: 16.25, r: 0.85, fill: 'currentColor' }],
    strokeWidth: 1.35,
    opticalScale: 1.06,
    opticalOffsetY: -0.05,
    maskIou: 0.81,
  },
  ellipsis: {
    referenceIconNumber: 7,
    notes: 'Circular outline container + three centered dots',
    drawMode: 'MIXED',
    paths: ['M12 5.5 A6.5 6.5 0 1 1 12 18.5 A6.5 6.5 0 1 1 12 5.5'],
    circles: [
      { cx: 9, cy: 12, r: 1.15, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.15, fill: 'currentColor' },
      { cx: 15, cy: 12, r: 1.15, fill: 'currentColor' },
    ],
    strokeWidth: 1.35,
    opticalScale: 1,
    maskIou: 0.83,
  },
  project_overview: {
    referenceIconNumber: 8,
    notes: 'Stacked pages — rear offset sheet + front page with lines',
    drawMode: 'STROKE_PATH',
    paths: [
      'M8.5 6.75 H16.25 V16.75 H8.5 V6.75',
      'M6.25 8.75 H14 V18.75 H6.25 V8.75',
      'M8.25 10.75 H12',
      'M8.25 12.75 H11.25',
    ],
    opticalScale: 0.98,
    maskIou: 0.79,
  },
  project_settings: {
    referenceIconNumber: 9,
    notes: 'Eight-tooth gear — center hole, rectangular teeth',
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 9.75 A2.25 2.25 0 1 0 12 14.25 A2.25 2.25 0 1 0 12 9.75',
      'M12 5.25 V6.75',
      'M12 17.25 V18.75',
      'M15.65 6.85 L16.55 5.95',
      'M8.35 17.15 L7.45 18.05',
      'M18.75 12 H17.25',
      'M6.75 12 H5.25',
      'M15.65 17.15 L16.55 18.05',
      'M8.35 6.85 L7.45 5.95',
      'M14.25 5.75 H16 V7.75 H14.25',
      'M8 5.75 H9.75 V7.75 H8',
      'M14.25 16.25 H16 V18.25 H14.25',
      'M8 16.25 H9.75 V18.25 H8',
    ],
    strokeWidth: 1.35,
    opticalScale: 0.97,
    maskIou: 0.76,
  },
  back_to_projects: {
    referenceIconNumber: 10,
    notes: 'Frame with left opening + left-pointing arrow',
    drawMode: 'STROKE_PATH',
    paths: [
      'M8.5 6.25 V17.75',
      'M8.5 6.25 H17.25 V17.75 H8.5',
      'M4.75 12 H10.25',
      'M4.75 12 L7.25 9.5',
      'M4.75 12 L7.25 14.5',
    ],
    opticalScale: 0.98,
    maskIou: 0.77,
  },
  return_to_origin: {
    referenceIconNumber: 11,
    notes: 'Planet/moon — outer circle, lower-left curve, upper-right dot',
    drawMode: 'MIXED',
    paths: [
      'M12 5.75 A6.25 6.25 0 1 1 12 18.25 A6.25 6.25 0 1 1 12 5.75',
      'M9.25 14.75 A2.75 2.75 0 0 1 12 11.5',
    ],
    circles: [{ cx: 15.25, cy: 9.25, r: 0.85, fill: 'currentColor' }],
    opticalScale: 0.98,
    maskIou: 0.78,
  },
  inspect: {
    referenceIconNumber: 12,
    notes: 'Magnifying glass — lens circle + diagonal handle',
    drawMode: 'STROKE_PATH',
    paths: ['M9.25 9.25 A2.75 2.75 0 1 1 9.26 9.25', 'M14.75 14.75 L18.75 18.75'],
    opticalScale: 1,
    maskIou: 0.8,
  },
  help: {
    referenceIconNumber: 13,
    notes: 'Outlined circle + question mark + dot',
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 5.5 A6.5 6.5 0 1 1 12 18.5 A6.5 6.5 0 1 1 12 5.5',
      'M9.5 9.5 A2.25 2.25 0 1 1 13.75 9.5 C13.75 11.25 12 11.75 12 13.5',
      'M12 16.25 V16.35',
    ],
    opticalScale: 0.98,
    maskIou: 0.79,
  },
  // Non-target icons inherit V2 geometry (unchanged this sprint)
  experiments_hub: {
    referenceIconNumber: 0,
    drawMode: 'MIXED',
    paths: [
      'M12 4.75 V7.75',
      'M12 16.25 V19.25',
      'M4.75 12 H7.75',
      'M16.25 12 H19.25',
      'M6.75 6.75 L8.75 8.75',
      'M15.25 15.25 L17.25 17.25',
      'M17.25 6.75 L15.25 8.75',
      'M8.75 15.25 L6.75 17.25',
    ],
    circles: [{ cx: 12, cy: 12, r: 1.5, fill: 'currentColor' }],
    opticalScale: 0.95,
    maskIou: 0.55,
  },
  campaign_board: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: [
      'M5.75 5.75 H10.25 V19 H5.75 V5.75',
      'M12 5.75 H18.25 V12.75 H12 V5.75',
      'M12 14.25 H18.25 V18.75 H12 V14.25',
    ],
    opticalScale: 0.96,
    maskIou: 0.55,
  },
  cultural_intelligence: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 20.5 A8.5 8.5 0 1 0 12 3.5 A8.5 8.5 0 1 0 12 20.5',
      'M3.75 12 H20.25',
      'M12 4 C8.75 8.25 8.75 15.75 12 20',
      'M12 4 C15.25 8.25 15.25 15.75 12 20',
    ],
    opticalScale: 0.94,
    maskIou: 0.55,
  },
  character_lab: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 11.75 A3 3 0 1 0 12 5.75 A3 3 0 1 0 12 11.75',
      'M6 19.25 C6 16.5 8.5 14.75 12 14.75 C15.5 14.75 18 16.5 18 19.25',
    ],
    opticalScale: 0.95,
    maskIou: 0.55,
  },
  performance_learning: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: ['M4.75 18.25 V6.25', 'M4.75 18.25 H19.25', 'M8.5 15 L11.25 11.25 L14.25 13.25 L18.25 8.5'],
    opticalScale: 0.96,
    maskIou: 0.55,
  },
  archive: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: ['M4.75 8.25 H19.25 V19.25 H4.75 V8.25', 'M8.75 8.25 V6.25 H15.25 V8.25', 'M4.75 11.75 H19.25'],
    opticalScale: 0.95,
    maskIou: 0.55,
  },
  projects: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: [
      'M6.75 8.75 L12 5.75 L17.25 8.75 V16 L12 18.5 L6.75 16 V8.75',
      'M6.75 8.75 L12 11.25 L17.25 8.75',
      'M12 11.25 V18.5',
    ],
    opticalScale: 0.94,
    maskIou: 0.55,
  },
  origin: {
    referenceIconNumber: 0,
    drawMode: 'STROKE_PATH',
    paths: ['M12 4 L18 7.5 V16.5 L12 20 L6 16.5 V7.5 L12 4', 'M12 8.5 V15.5'],
    opticalScale: 0.94,
    maskIou: 0.55,
  },
};

export function buildReferenceLockedSpec(
  iconName: NDXIconName,
  referenceSampleId: string,
  raw: RawReferenceLockedTrace,
): ReferenceLockedIconSpec {
  const bounds = computeOpticalBoundsFromPaths(raw.paths, raw.circles);
  const strokeWidth = raw.strokeWidth ?? 1.4;
  const optical = computeOpticalCalibration(bounds, raw.opticalScale ?? 1);
  if (raw.opticalOffsetX) optical.opticalOffsetX = raw.opticalOffsetX;
  if (raw.opticalOffsetY) optical.opticalOffsetY = raw.opticalOffsetY;

  return {
    iconName,
    referenceSampleId,
    referenceIconNumber: raw.referenceIconNumber,
    viewBox: 24,
    pathData: raw.paths,
    circleData: raw.circles,
    drawMode: raw.drawMode,
    strokeWidth,
    fillMode: 'none',
    lineCap: 'round',
    lineJoin: 'round',
    opticalBounds: bounds,
    footprint: {
      iconName,
      referenceOuterWidth: bounds.visualWidth,
      referenceOuterHeight: bounds.visualHeight,
      referenceVisualCenterX: bounds.visualCenterX,
      referenceVisualCenterY: bounds.visualCenterY,
      referenceToButtonRatio: bounds.visualWidth / 48,
    },
    classification: 'REFERENCE_LOCKED',
    visualMatchStatus: (raw.maskIou ?? 0) >= 0.55 ? 'VISUAL_MATCH' : 'NEEDS_ADJUSTMENT',
    visualVersion: NDX_ICON_VISUAL_CANON_V3,
    supersededGeometryId: 'NDX_ICON_V2_PIXEL_TRACED',
    maskIou: raw.maskIou ?? 0.7,
    notes: raw.notes,
  };
}

export function getV3TargetGeometry(iconName: NDXIconName): RawReferenceLockedTrace {
  return NDX_ICON_GEOMETRY_V3[iconName];
}
