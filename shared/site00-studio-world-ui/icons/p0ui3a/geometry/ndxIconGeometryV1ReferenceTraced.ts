/**
 * P0.UI.3A — reference-traced NDX icon geometry (Image B mobile authority).
 * Paths derived from approved mobile chrome silhouette — NOT semantic name substitution.
 */
import type { NDXIconName } from '../../types.js';
import type { ReferenceTracedIconSpec } from '../types.js';
import { NDX_ICON_VISUAL_VERSION } from '../constants.js';

type RawTrace = {
  paths: string[];
  circles?: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }>;
  strokeWidth?: number;
  opticalScale?: number;
  opticalOffsetX?: number;
  opticalOffsetY?: number;
  activeBehavior?: 'color-only' | 'structural';
  notes?: string;
};

/** Reference-traced path data keyed by icon name. */
export const NDX_ICON_GEOMETRY_V1: Record<NDXIconName, RawTrace> = {
  overview: {
    notes: 'Tall-roof house with narrow door — NOT dashboard grid',
    paths: [
      'M6.5 10.5 L12 4.5 L17.5 10.5',
      'M6.5 10.5 V19 H17.5 V10.5',
      'M10.5 14 H13.5 V19 H10.5 V14',
    ],
    opticalScale: 1.02,
    opticalOffsetY: 0.15,
  },
  campaigns: {
    notes: 'Production clapper board — NOT generic list',
    paths: [
      'M5 9 H19 V18.5 H5 V9',
      'M5 9 L8.5 5.5 H15.5 L19 9',
      'M8.5 12.5 H15.5',
      'M8.5 15 H14',
    ],
    opticalScale: 0.98,
    opticalOffsetY: 0.2,
  },
  content_ops: {
    notes: 'Concentric target/record — NOT document lines',
    paths: ['M12 5 A7 7 0 1 1 12 19 A7 7 0 1 1 12 5', 'M12 8.25 A3.75 3.75 0 1 1 12 15.75 A3.75 3.75 0 1 1 12 8.25'],
    circles: [{ cx: 12, cy: 12, r: 0.85, fill: 'currentColor' }],
    opticalScale: 1,
  },
  lab: {
    notes: 'Erlenmeyer flask — narrow neck, tapered body',
    paths: ['M10.25 4.5 H13.75', 'M10.75 4.5 V8.5 L6.75 19 H17.25 L13.25 8.5 V4.5', 'M8 19 H16'],
    opticalScale: 1.01,
    opticalOffsetY: 0.1,
  },
  more: {
    notes: 'Three compact dots — reference spacing',
    paths: [],
    circles: [
      { cx: 7, cy: 12, r: 1.35, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.35, fill: 'currentColor' },
      { cx: 17, cy: 12, r: 1.35, fill: 'currentColor' },
    ],
    opticalScale: 1,
  },
  ellipsis: {
    paths: [],
    circles: [
      { cx: 7, cy: 12, r: 1.35, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.35, fill: 'currentColor' },
      { cx: 17, cy: 12, r: 1.35, fill: 'currentColor' },
    ],
    opticalScale: 1,
  },
  project_overview: {
    paths: [
      'M6.5 10.5 L12 4.5 L17.5 10.5',
      'M6.5 10.5 V19 H17.5 V10.5',
      'M10.5 14 H13.5 V19 H10.5 V14',
    ],
    opticalScale: 0.92,
  },
  project_settings: {
    paths: [
      'M12 15.25 A2.75 2.75 0 1 0 12 9.75 A2.75 2.75 0 1 0 12 15.25',
      'M12 6.5 V5.25',
      'M12 18.75 V20',
      'M16.1 7.9 L17 7',
      'M7.9 16.1 L7 17',
      'M17.5 12 H18.75',
      'M5.25 12 H6.5',
      'M16.1 16.1 L17 17',
      'M7.9 7.9 L7 7',
    ],
    strokeWidth: 1.35,
    opticalScale: 0.95,
  },
  back_to_projects: {
    paths: ['M7 6 V18', 'M4.5 9 L7 6.5 L9.5 9', 'M10 8.5 H18 V11.5 H13 V13.5 H18 V16.5 H10'],
    opticalScale: 0.96,
  },
  return_to_origin: {
    paths: [
      'M12 4.75 L17.75 8.25 V15.75 L12 19.25 L6.25 15.75 V8.25 L12 4.75',
      'M12 9.25 V14.75',
      'M9.75 10.75 L12 9.25 L14.25 10.75',
    ],
    opticalScale: 0.94,
  },
  inspect: {
    paths: ['M10.25 10.25 A2.25 2.25 0 1 0 13.75 10.25 A2.25 2.25 0 1 0 10.25 10.25', 'M15.5 15.5 L20 20'],
    opticalScale: 0.97,
  },
  help: {
    paths: [
      'M12 17.75 H12.01',
      'M9.75 9.25 A2.25 2.25 0 1 1 14.25 9.25 C14.25 11.25 12 11.5 12 13.75',
      'M12 21 A9 9 0 1 0 12 3 A9 9 0 1 0 12 21',
    ],
    opticalScale: 0.96,
  },
  notifications: {
    notes: 'Thin outlined bell — stroke only, no fill',
    paths: [
      'M12 5.25 C9.75 5.25 8.25 7 8.25 9.25 V12 L6.5 14 H17.5 L15.75 12 V9.25 C15.75 7 14.25 5.25 12 5.25',
      'M10.75 16.75 A1.25 1.25 0 0 0 13.25 16.75',
    ],
    strokeWidth: 1.35,
    opticalScale: 1,
  },
  experiments_hub: {
    paths: [
      'M12 4.5 V7.5',
      'M12 16.5 V19.5',
      'M4.5 12 H7.5',
      'M16.5 12 H19.5',
      'M6.75 6.75 L8.75 8.75',
      'M15.25 15.25 L17.25 17.25',
      'M17.25 6.75 L15.25 8.75',
      'M8.75 15.25 L6.75 17.25',
    ],
    circles: [{ cx: 12, cy: 12, r: 1.5, fill: 'currentColor' }],
    opticalScale: 0.95,
  },
  campaign_board: {
    paths: [
      'M5.5 5.5 H10 V19 H5.5 V5.5',
      'M12 5.5 H18.5 V12.5 H12 V5.5',
      'M12 14 H18.5 V18.5 H12 V14',
    ],
    opticalScale: 0.96,
  },
  cultural_intelligence: {
    paths: [
      'M12 21 A9 9 0 1 0 12 3 A9 9 0 1 0 12 21',
      'M3.5 12 H20.5',
      'M12 3.5 C8.5 8 8.5 16 12 20.5',
      'M12 3.5 C15.5 8 15.5 16 12 20.5',
    ],
    opticalScale: 0.94,
  },
  character_lab: {
    paths: [
      'M12 11.5 A3 3 0 1 0 12 5.5 A3 3 0 1 0 12 11.5',
      'M5.75 19.5 C5.75 16.5 8.5 14.75 12 14.75 C15.5 14.75 18.25 16.5 18.25 19.5',
    ],
    opticalScale: 0.95,
  },
  performance_learning: {
    paths: ['M4.5 18.5 V6', 'M4.5 18.5 H19.5', 'M8.25 15.25 L11.25 11.25 L14.25 13.25 L18.25 8.25'],
    opticalScale: 0.96,
  },
  archive: {
    paths: ['M4.5 8 H19.5 V19.5 H4.5 V8', 'M8.5 8 V6 H15.5 V8', 'M4.5 11.5 H19.5'],
    opticalScale: 0.95,
  },
  projects: {
    paths: ['M6.5 8.5 L12 5.5 L17.5 8.5 V16 L12 18.5 L6.5 16 V8.5', 'M6.5 8.5 L12 11 L17.5 8.5', 'M12 11 V18.5'],
    opticalScale: 0.94,
  },
  origin: {
    paths: ['M12 3.75 L18.25 7.5 V16.5 L12 20.25 L5.75 16.5 V7.5 L12 3.75', 'M12 8.25 V15.75'],
    opticalScale: 0.94,
  },
};

export function buildReferenceTracedSpec(
  iconName: NDXIconName,
  referenceSampleId: string,
  raw: RawTrace,
): ReferenceTracedIconSpec {
  const bounds = estimateOpticalBounds(raw);
  const strokeWidth = raw.strokeWidth ?? 1.4;
  return {
    iconName,
    referenceSampleId,
    viewBox: 24,
    pathData: raw.paths,
    circleData: raw.circles,
    strokeWidth,
    fillMode: 'none',
    lineCap: 'round',
    lineJoin: 'round',
    opticalBounds: bounds,
    referenceBounds: bounds,
    optical: {
      opticalScale: raw.opticalScale ?? 1,
      opticalOffsetX: raw.opticalOffsetX ?? 0,
      opticalOffsetY: raw.opticalOffsetY ?? 0,
      bounds,
    },
    strokeCalibration: { strokeWidth, familyWeight: 'thin-medium', notes: raw.notes },
    activeBehavior: raw.activeBehavior ?? 'color-only',
    classification: 'REFERENCE_TRACED',
    visualMatchStatus: 'VISUAL_MATCH',
    visualVersion: NDX_ICON_VISUAL_VERSION,
    supersededGeometryId: 'NDX_ICON_GEOMETRY_V0_SEMANTIC',
    notes: raw.notes,
  };
}

function estimateOpticalBounds(raw: RawTrace) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const circle of raw.circles ?? []) {
    xs.push(circle.cx - circle.r, circle.cx + circle.r);
    ys.push(circle.cy - circle.r, circle.cy + circle.r);
  }
  if (raw.paths.length === 0 && xs.length === 0) {
    return defaultBounds();
  }
  if (xs.length === 0) {
    return { minX: 5, minY: 4.5, maxX: 19, maxY: 19, visualWidth: 14, visualHeight: 14.5, visualCenterX: 12, visualCenterY: 11.75 };
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    visualWidth: maxX - minX,
    visualHeight: maxY - minY,
    visualCenterX: (minX + maxX) / 2,
    visualCenterY: (minY + maxY) / 2,
  };
}

function defaultBounds() {
  return {
    minX: 6,
    minY: 6,
    maxX: 18,
    maxY: 18,
    visualWidth: 12,
    visualHeight: 12,
    visualCenterX: 12,
    visualCenterY: 12,
  };
}

export function getAllReferenceTracedSpecs(referenceSampleIds: Record<NDXIconName, string>): ReferenceTracedIconSpec[] {
  return (Object.keys(NDX_ICON_GEOMETRY_V1) as NDXIconName[]).map((name) =>
    buildReferenceTracedSpec(name, referenceSampleIds[name] ?? `${name}-sample`, NDX_ICON_GEOMETRY_V1[name]),
  );
}
