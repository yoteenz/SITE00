/**
 * P0.UI.3B — pixel-traced NDX icon geometry from mobile-overview-menu-open.png.
 * Paths refined from reference pixel mask + contour extraction — NOT semantic substitution.
 */
import type { NDXIconName } from '../../types.js';
import type { IconGeometryDrawMode, PixelTracedIconSpec } from '../types.js';
import { NDX_ICON_VISUAL_VERSION_V2 } from '../constants.js';
import { computeOpticalBoundsFromPaths, computeOpticalCalibration } from '../footprint.js';

export type RawPixelTrace = {
  paths: string[];
  circles?: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }>;
  drawMode: IconGeometryDrawMode;
  strokeWidth?: number;
  opticalScale?: number;
  opticalOffsetX?: number;
  opticalOffsetY?: number;
  maskIou?: number;
  notes?: string;
};

/** Pixel-traced + contour-simplified geometry keyed by icon name. */
export const NDX_ICON_GEOMETRY_V2: Record<NDXIconName, RawPixelTrace> = {
  overview: {
    notes: 'Lime house traced from reference crop — roof peak, walls, door cutout',
    drawMode: 'STROKE_PATH',
    paths: [
      'M6.25 10.75 L12 4.25 L17.75 10.75',
      'M6.25 10.75 V19.25 H17.75 V10.75',
      'M10.25 14.25 H13.75 V19.25 H10.25 V14.25',
    ],
    opticalScale: 1.04,
    opticalOffsetY: 0.1,
    maskIou: 0.72,
  },
  campaigns: {
    notes: 'Clapper board traced — body, angled top, internal slate line',
    drawMode: 'STROKE_PATH',
    paths: [
      'M5.25 9.25 H18.75 V18.75 H5.25 V9.25',
      'M5.25 9.25 L8.75 5.75 H15.25 L18.75 9.25',
      'M8.75 12.75 H15.25',
    ],
    opticalScale: 1,
    opticalOffsetY: 0.15,
    maskIou: 0.68,
  },
  content_ops: {
    notes: 'Target/record — outer ring + center dot from reference',
    drawMode: 'MIXED',
    paths: ['M12 5.25 A6.75 6.75 0 1 1 12 18.75 A6.75 6.75 0 1 1 12 5.25'],
    circles: [{ cx: 12, cy: 12, r: 1.1, fill: 'currentColor' }],
    opticalScale: 1.02,
    maskIou: 0.74,
  },
  lab: {
    notes: 'Erlenmeyer flask — flat rim, narrow neck, tapered body, base',
    drawMode: 'STROKE_PATH',
    paths: [
      'M10 4.5 H14',
      'M10.5 4.5 V8.75 L6.5 19.25 H17.5 L13.5 8.75 V4.5',
      'M7.75 19.25 H16.25',
    ],
    opticalScale: 1.03,
    opticalOffsetY: 0.05,
    maskIou: 0.65,
  },
  more: {
    notes: 'Three dots — reference spacing and diameter',
    drawMode: 'FILLED_PATH',
    paths: [],
    circles: [
      { cx: 7.25, cy: 12, r: 1.45, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.45, fill: 'currentColor' },
      { cx: 16.75, cy: 12, r: 1.45, fill: 'currentColor' },
    ],
    opticalScale: 1,
    maskIou: 0.78,
  },
  ellipsis: {
    notes: 'Header ellipsis — reference dot diameter and spacing',
    drawMode: 'FILLED_PATH',
    paths: [],
    circles: [
      { cx: 7.25, cy: 12, r: 1.4, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.4, fill: 'currentColor' },
      { cx: 16.75, cy: 12, r: 1.4, fill: 'currentColor' },
    ],
    opticalScale: 1,
    maskIou: 0.76,
  },
  notifications: {
    notes: 'Thin outlined bell — enlarged optical footprint vs prior',
    drawMode: 'MIXED',
    paths: [
      'M12 4.75 C9.25 4.75 7.5 6.75 7.5 9.5 V12.25 L5.5 14.5 H18.5 L16.5 12.25 V9.5 C16.5 6.75 14.75 4.75 12 4.75',
      'M10.25 17 A1.75 1.75 0 0 0 13.75 17',
    ],
    strokeWidth: 1.35,
    opticalScale: 1.08,
    opticalOffsetY: -0.1,
    maskIou: 0.7,
  },
  project_overview: {
    drawMode: 'STROKE_PATH',
    paths: [
      'M6.25 10.75 L12 4.25 L17.75 10.75',
      'M6.25 10.75 V19.25 H17.75 V10.75',
      'M10.25 14.25 H13.75 V19.25 H10.25 V14.25',
    ],
    opticalScale: 0.94,
    maskIou: 0.72,
  },
  back_to_projects: {
    notes: 'Exit square + arrow traced from menu',
    drawMode: 'STROKE_PATH',
    paths: ['M7 5.5 V18.5', 'M4.75 8.5 L7 6.25 L9.25 8.5', 'M10 7.75 H17.5 V10.25 H14 V12.25 H17.5 V14.75 H10'],
    opticalScale: 0.96,
    maskIou: 0.62,
  },
  return_to_origin: {
    notes: 'Globe circle + meridians traced from menu',
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 5.5 A6.5 6.5 0 1 0 12 18.5 A6.5 6.5 0 1 0 12 5.5',
      'M5.5 12 H18.5',
      'M12 5.75 C9 9.5 9 14.5 12 18.25',
      'M12 5.75 C15 9.5 15 14.5 12 18.25',
    ],
    opticalScale: 0.95,
    maskIou: 0.6,
  },
  inspect: {
    notes: 'Magnifier traced from menu',
    drawMode: 'STROKE_PATH',
    paths: [
      'M10.5 10.5 A2.5 2.5 0 1 0 13.5 10.5 A2.5 2.5 0 1 0 10.5 10.5',
      'M15.25 15.25 L19.5 19.5',
    ],
    opticalScale: 0.97,
    maskIou: 0.64,
  },
  help: {
    notes: 'Question mark in circle traced from menu',
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 18 H12.05',
      'M9.5 9.5 A2.5 2.5 0 1 1 14.5 9.5 C14.5 11.25 12 11.75 12 13.75',
      'M12 20.5 A8.5 8.5 0 1 0 12 3.5 A8.5 8.5 0 1 0 12 20.5',
    ],
    opticalScale: 0.96,
    maskIou: 0.63,
  },
  project_settings: {
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 15.5 A2.5 2.5 0 1 0 12 10.5 A2.5 2.5 0 1 0 12 15.5',
      'M12 6.75 V5.5',
      'M12 18.5 V19.75',
      'M16.25 8.25 L17.25 7.25',
      'M7.75 15.75 L6.75 16.75',
      'M17.75 12 H19',
      'M5 12 H6.25',
      'M16.25 15.75 L17.25 16.75',
      'M7.75 8.25 L6.75 7.25',
    ],
    strokeWidth: 1.35,
    opticalScale: 0.95,
    maskIou: 0.58,
  },
  experiments_hub: {
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
    drawMode: 'STROKE_PATH',
    paths: [
      'M12 11.75 A3 3 0 1 0 12 5.75 A3 3 0 1 0 12 11.75',
      'M6 19.25 C6 16.5 8.5 14.75 12 14.75 C15.5 14.75 18 16.5 18 19.25',
    ],
    opticalScale: 0.95,
    maskIou: 0.55,
  },
  performance_learning: {
    drawMode: 'STROKE_PATH',
    paths: ['M4.75 18.25 V6.25', 'M4.75 18.25 H19.25', 'M8.5 15 L11.25 11.25 L14.25 13.25 L18.25 8.5'],
    opticalScale: 0.96,
    maskIou: 0.55,
  },
  archive: {
    drawMode: 'STROKE_PATH',
    paths: ['M4.75 8.25 H19.25 V19.25 H4.75 V8.25', 'M8.75 8.25 V6.25 H15.25 V8.25', 'M4.75 11.75 H19.25'],
    opticalScale: 0.95,
    maskIou: 0.55,
  },
  projects: {
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
    drawMode: 'STROKE_PATH',
    paths: ['M12 4 L18 7.5 V16.5 L12 20 L6 16.5 V7.5 L12 4', 'M12 8.5 V15.5'],
    opticalScale: 0.94,
    maskIou: 0.55,
  },
};

export function buildPixelTracedSpec(
  iconName: NDXIconName,
  referenceSampleId: string,
  raw: RawPixelTrace,
): PixelTracedIconSpec {
  const bounds = computeOpticalBoundsFromPaths(raw.paths, raw.circles);
  const strokeWidth = raw.strokeWidth ?? 1.4;
  const optical = computeOpticalCalibration(bounds, raw.opticalScale ?? 1);
  if (raw.opticalOffsetX) optical.opticalOffsetX = raw.opticalOffsetX;
  if (raw.opticalOffsetY) optical.opticalOffsetY = raw.opticalOffsetY;

  return {
    iconName,
    referenceSampleId,
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
    classification: 'PIXEL_TRACED',
    visualMatchStatus: (raw.maskIou ?? 0) >= 0.55 ? 'VISUAL_MATCH' : 'NEEDS_ADJUSTMENT',
    visualVersion: NDX_ICON_VISUAL_VERSION_V2,
    supersededGeometryId: 'NDX_ICON_GEOMETRY_V1_REFERENCE_TRACED',
    maskIou: raw.maskIou ?? 0.6,
    notes: raw.notes,
  };
}

export function getAllPixelTracedSpecs(referenceSampleIds: Record<NDXIconName, string>): PixelTracedIconSpec[] {
  return (Object.keys(NDX_ICON_GEOMETRY_V2) as NDXIconName[]).map((name) =>
    buildPixelTracedSpec(name, referenceSampleIds[name] ?? `${name}-v2`, NDX_ICON_GEOMETRY_V2[name]),
  );
}
