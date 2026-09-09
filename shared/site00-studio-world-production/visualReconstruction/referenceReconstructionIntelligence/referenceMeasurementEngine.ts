/**
 * Layer 1 — Reference Measurement Engine
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { AuthorityMode, FidelityMode } from '../p0vr7/types.js';
import { segmentReferenceFrame } from './referenceFrameSegmentation.js';
import type {
  ReferenceGeometrySpec,
  ReferenceLineBreakContract,
  ReferenceMeasurementSpec,
  ReferenceRegion,
  ReferenceSpacingSystem,
  ReferenceSurfaceSpec,
  ReferenceTypographySpec,
} from './types.js';

export type MeasureReferenceInput = {
  authorityId: string;
  referenceImageUrl: string;
  referenceNaturalWidth: number;
  referenceNaturalHeight: number;
  viewport: DesignViewportClass;
  authorityMode?: AuthorityMode;
  fidelityMode?: FidelityMode;
  liveCssViewportWidth?: number;
  liveCssViewportHeight?: number;
  devicePixelRatio?: number;
  /** Pre-defined regions (from authority-specific preset) */
  regionPreset?: ReferenceRegion[];
  spacingPreset?: Partial<ReferenceSpacingSystem>;
  typographyPreset?: ReferenceTypographySpec[];
  lineBreakPreset?: ReferenceLineBreakContract[];
};

export function measureReference(input: MeasureReferenceInput): ReferenceMeasurementSpec {
  const authorityMode = input.authorityMode ?? 'DESIGN_AUTHORITY';
  const fidelityMode = input.fidelityMode ?? 'EXACT';
  const frameSegmentation = segmentReferenceFrame({
    naturalWidth: input.referenceNaturalWidth,
    naturalHeight: input.referenceNaturalHeight,
    viewport: input.viewport,
  });

  const content = frameSegmentation.contentCanvasRegion;
  const regions = input.regionPreset ?? buildDefaultRegionTree(content, input.viewport);
  const geometrySpecs = regions.map((r) => geometryFromRegion(r));
  const spacingSystem = buildSpacingSystem(input.spacingPreset, content);
  const typographySpecs = input.typographyPreset ?? [];
  const lineBreakContracts = input.lineBreakPreset ?? [];

  const liveW = input.liveCssViewportWidth ?? (input.viewport === 'mobile' ? 390 : 1280);
  const liveH = input.liveCssViewportHeight ?? (input.viewport === 'mobile' ? 844 : 900);

  return {
    authorityId: input.authorityId,
    viewport: input.viewport,
    authorityMode,
    fidelityMode,
    referenceNaturalWidth: input.referenceNaturalWidth,
    referenceNaturalHeight: input.referenceNaturalHeight,
    contentCanvasX: content.x,
    contentCanvasY: content.y,
    contentCanvasWidth: content.width,
    contentCanvasHeight: content.height,
    devicePixelRatioContext: input.devicePixelRatio ?? 2,
    normalizedCoordinateMap: true,
    frameSegmentation,
    viewportCalibration: {
      referenceViewportWidth: content.width,
      referenceViewportHeight: content.height,
      liveCssViewportWidth: liveW,
      liveCssViewportHeight: liveH,
      devicePixelRatio: input.devicePixelRatio ?? 2,
      browserZoom: 1,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      scrollbarWidth: 0,
      captureScale: 1,
      contentCanvasScale: content.width / liveW,
      viewportMatch: Math.abs(content.width - liveW) <= 4,
    },
    regions,
    geometrySpecs,
    spacingSystem,
    typographySpecs,
    lineBreakContracts,
    opticalAlignmentHints: [],
    surfaceSpecs: buildDefaultSurfaces(regions),
    measurementSpecVersion: '1.0.0',
  };
}

function buildDefaultRegionTree(
  content: { x: number; y: number; width: number; height: number },
  viewport: DesignViewportClass,
): ReferenceRegion[] {
  const w = content.width;
  const h = content.height;
  const mk = (
    id: string,
    parent: string | null,
    role: ReferenceRegion['role'],
    nx: number,
    ny: number,
    nw: number,
    nh: number,
    z: number,
    layout: ReferenceRegion['expectedPositioning'] = 'FLEX',
  ): ReferenceRegion => ({
    regionId: id,
    parentRegionId: parent,
    role,
    bbox: { x: content.x + nx, y: content.y + ny, width: nw, height: nh },
    normalizedBbox: { x: nx / w, y: ny / h, width: nw / w, height: nh / h },
    zLayer: z,
    visibility: 'VISIBLE',
    expectedOverflow: role === 'CARD' ? 'HIDDEN' : 'VISIBLE',
    expectedPositioning: layout,
    confidence: 0.85,
  });

  if (viewport === 'desktop') {
    return [
      mk('root', null, 'ROOT', 0, 0, w, h, 0, 'NORMAL_FLOW'),
      mk('shell', 'root', 'SHELL', 0, 0, w, h, 1),
      mk('family-rail', 'shell', 'PANEL', 0, 0.12, 0.2, 0.75, 10, 'FLEX'),
      mk('screen-pack', 'shell', 'SECTION', 0.22, 0.12, 0.48, 0.75, 11, 'GRID'),
      mk('preview-panel', 'shell', 'PANEL', 0.72, 0.12, 0.26, 0.75, 12),
      mk('qa-strip', 'shell', 'FOOTER', 0, 0.88, w, h * 0.1, 20, 'FLEX'),
    ];
  }

  return [
    mk('root', null, 'ROOT', 0, 0, w, h, 0, 'NORMAL_FLOW'),
    mk('shell', 'root', 'SHELL', 0, 0, w, h, 1),
    mk('primary-tabs', 'shell', 'NAV', 0, 0.08, w, 36, 10, 'FLEX'),
    mk('experience-header', 'shell', 'HEADER', 0, 0.12, w, 48, 11),
    mk('family-row', 'shell', 'CARD', 0, 0.2, w, 100, 12, 'FLEX'),
    mk('screen-pack', 'shell', 'SECTION', 0, 0.35, w, 0.25 * h, 13, 'GRID'),
    mk('viewport-control', 'shell', 'CONTROL', 0, 0.62, w, 32, 14, 'FLEX'),
    mk('preview-card', 'shell', 'PANEL', 0, 0.68, w, 0.22 * h, 15),
    mk('status-line', 'shell', 'TEXT_BLOCK', 0, 0.92, w, 24, 16),
  ];
}

function geometryFromRegion(r: ReferenceRegion): ReferenceGeometrySpec {
  return {
    regionId: r.regionId,
    x: r.bbox.x,
    y: r.bbox.y,
    width: r.bbox.width,
    height: r.bbox.height,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    gap: r.role === 'CARD' ? 8 : null,
    alignmentAnchor: 'START',
    aspectRatio: r.bbox.width / Math.max(r.bbox.height, 1),
  };
}

function buildSpacingSystem(
  preset: Partial<ReferenceSpacingSystem> | undefined,
  _content: { width: number; height: number },
): ReferenceSpacingSystem {
  return {
    horizontalInset: preset?.horizontalInset ?? 16,
    verticalInset: preset?.verticalInset ?? 12,
    sectionGap: preset?.sectionGap ?? 10,
    panelGap: preset?.panelGap ?? 10,
    cardGap: preset?.cardGap ?? 8,
    internalPadding: preset?.internalPadding ?? 5,
    controlGap: preset?.controlGap ?? 8,
    labelGap: preset?.labelGap ?? 5,
    screenScopedTokens: preset?.screenScopedTokens ?? {
      '--ref-panel-gap': '10px',
      '--ref-card-radius': '8px',
      '--ref-title-size': '12px',
    },
  };
}

function buildDefaultSurfaces(regions: ReferenceRegion[]): ReferenceSurfaceSpec[] {
  return regions.map((r) => ({
    regionId: r.regionId,
    backgroundColor: r.role === 'SHELL' ? '#FFFFFF' : '#FAFAFA',
    borderColor: r.role === 'CARD' ? '#E0E0E0' : null,
    borderWidth: r.role === 'CARD' ? 1 : 0,
    borderStyle: 'solid',
    radius: r.role === 'CARD' ? 8 : 0,
    shadow: null,
    opacity: 1,
    dividerStyle: null,
    surfaceElevation: r.zLayer,
  }));
}
