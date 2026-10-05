/**
 * P0.VR.7 — Design reference decomposition engine.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { DESIGN_WORKSPACE_REFERENCE_CANVAS } from './constants.js';
import type {
  DesignReferenceDecomposition,
  ReferenceAssetManifestEntry,
  ReferenceComponentGeometry,
  ReferenceGeometryProfile,
  ReferenceSpacingProfile,
  ReferenceTypographyProfile,
  ReferenceVisualMaterialProfile,
} from './types.js';

function decompId(): string {
  return `decomp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildGeometryProfile(width: number, height: number): ReferenceGeometryProfile {
  const contentWidth = width - 32;
  const headerHeight = Math.round(height * 0.12);
  const heroHeight = Math.round(height * 0.14);
  const bottomNavHeight = Math.round(height * 0.09);
  const contentStartY = headerHeight + heroHeight + 48;
  const footerY = height - bottomNavHeight - 24;

  return {
    referenceWidth: width,
    referenceHeight: height,
    contentWidth,
    contentX: 16,
    contentY: contentStartY,
    topMargin: 12,
    bottomMargin: 12,
    leftMargin: 16,
    rightMargin: 16,
    headerHeight,
    heroHeight,
    primaryNavY: headerHeight + 8,
    contentStartY,
    footerY,
    bottomNavHeight,
    normalized: {
      contentWidthRatio: contentWidth / width,
      headerHeightRatio: headerHeight / height,
      heroHeightRatio: heroHeight / height,
      bottomNavHeightRatio: bottomNavHeight / height,
    },
  };
}

function buildComponentGeometry(geo: ReferenceGeometryProfile): ReferenceComponentGeometry[] {
  const w = geo.referenceWidth;
  const h = geo.referenceHeight;
  const roles: Array<{
    id: string;
    role: ReferenceComponentGeometry['semanticRole'];
    x: number;
    y: number;
    width: number;
    height: number;
    classification: ReferenceComponentGeometry['classification'];
    parentId: string | null;
    z: number;
  }> = [
    { id: 'header', role: 'HEADER', x: 0, y: 0, width: w, height: geo.headerHeight, classification: 'LIVE_DOM_UI', parentId: null, z: 10 },
    { id: 'project-switcher', role: 'PROJECT_SWITCHER', x: w - 140, y: geo.primaryNavY, width: 120, height: 28, classification: 'LIVE_DOM_UI', parentId: 'header', z: 11 },
    { id: 'page-title', role: 'PAGE_TITLE', x: 16, y: geo.headerHeight + 8, width: w - 100, height: 32, classification: 'LIVE_DOM_UI', parentId: null, z: 12 },
    { id: 'hero-object', role: 'HERO_OBJECT', x: w - 88, y: geo.headerHeight + 4, width: 72, height: 72, classification: 'IMAGE_LIKE_ASSET', parentId: null, z: 13 },
    { id: 'tab-bar', role: 'TAB_BAR', x: 0, y: geo.headerHeight + geo.heroHeight, width: w, height: 36, classification: 'LIVE_DOM_UI', parentId: null, z: 14 },
    { id: 'viewport-control', role: 'VIEWPORT_CONTROL', x: 16, y: geo.contentStartY - 40, width: 160, height: 28, classification: 'LIVE_DOM_UI', parentId: null, z: 15 },
    { id: 'stepper', role: 'STEPPER', x: 8, y: geo.contentStartY - 8, width: w - 16, height: 44, classification: 'LIVE_DOM_UI', parentId: null, z: 16 },
    { id: 'main-card', role: 'UPLOAD_CARD', x: 16, y: geo.contentStartY + 48, width: w - 32, height: Math.round(h * 0.35), classification: 'LIVE_DOM_UI', parentId: null, z: 17 },
    { id: 'activity-row', role: 'ACTIVITY_ROW', x: 16, y: geo.footerY - 40, width: w - 32, height: 36, classification: 'LIVE_DOM_UI', parentId: null, z: 18 },
    { id: 'bottom-nav', role: 'BOTTOM_NAV', x: 0, y: h - geo.bottomNavHeight, width: w, height: geo.bottomNavHeight, classification: 'LIVE_DOM_UI', parentId: null, z: 20 },
  ];

  return roles.map((r) => ({
    componentId: r.id,
    semanticRole: r.role,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    normalizedX: r.x / w,
    normalizedY: r.y / h,
    normalizedWidth: r.width / w,
    normalizedHeight: r.height / h,
    alignment: r.x <= 20 ? 'LEFT' : r.x + r.width >= w - 20 ? 'RIGHT' : 'CENTER',
    parentId: r.parentId,
    zOrder: r.z,
    classification: r.classification,
  }));
}

function buildTypographyProfile(): ReferenceTypographyProfile[] {
  return [
    { role: 'DISPLAY', fontFamilyCandidate: 'site00-heading', fontWeight: 700, fontSize: 18, lineHeight: 1.15, letterSpacing: 0.04, textTransform: 'UPPERCASE', alignment: 'LEFT', maxWidth: 220 },
    { role: 'SECTION_HEADING', fontFamilyCandidate: 'site00-heading', fontWeight: 600, fontSize: 11, lineHeight: 1.2, letterSpacing: 0.06, textTransform: 'UPPERCASE', alignment: 'LEFT', maxWidth: null },
    { role: 'LABEL', fontFamilyCandidate: 'site00-body', fontWeight: 600, fontSize: 8, lineHeight: 1.35, letterSpacing: 0.08, textTransform: 'UPPERCASE', alignment: 'LEFT', maxWidth: null },
    { role: 'BODY', fontFamilyCandidate: 'site00-body', fontWeight: 400, fontSize: 9, lineHeight: 1.4, letterSpacing: 0.05, textTransform: 'UPPERCASE', alignment: 'LEFT', maxWidth: null },
    { role: 'META', fontFamilyCandidate: 'site00-mono', fontWeight: 400, fontSize: 7, lineHeight: 1.35, letterSpacing: 0.06, textTransform: 'UPPERCASE', alignment: 'LEFT', maxWidth: null },
    { role: 'BUTTON', fontFamilyCandidate: 'site00-body', fontWeight: 600, fontSize: 9, lineHeight: 1, letterSpacing: 0.08, textTransform: 'UPPERCASE', alignment: 'CENTER', maxWidth: null },
    { role: 'STATUS', fontFamilyCandidate: 'site00-body', fontWeight: 600, fontSize: 7, lineHeight: 1.2, letterSpacing: 0.04, textTransform: 'UPPERCASE', alignment: 'CENTER', maxWidth: null },
  ];
}

function buildSpacingProfile(): ReferenceSpacingProfile {
  return {
    sectionGap: 10,
    cardGap: 8,
    internalPadding: 10,
    horizontalPadding: 16,
    verticalPadding: 8,
    controlGap: 6,
    tabGap: 0,
    gridGap: 8,
  };
}

function buildMaterialProfile(): ReferenceVisualMaterialProfile {
  return {
    backgroundColor: '#FFFFFF',
    surfaceColor: '#FFFFFF',
    borderColor: '#E8E4DC',
    borderWidth: 1,
    radius: 8,
    shadow: null,
    opacity: 1,
    accentColor: '#E8192C',
    dividerStyle: '1px solid #E8E4DC',
  };
}

function buildAssetManifest(
  components: ReferenceComponentGeometry[],
  referenceId: string,
): ReferenceAssetManifestEntry[] {
  return components
    .filter((c) => c.classification === 'IMAGE_LIKE_ASSET')
    .map((c) => ({
      assetSlotId: `slot-${c.componentId}`,
      semanticRole: c.semanticRole,
      assetType: c.semanticRole === 'HERO_OBJECT' ? 'HERO_ORB' : 'DECORATIVE_OBJECT',
      boundingBox: { x: c.x, y: c.y, width: c.width, height: c.height },
      crop: { x: c.x, y: c.y, width: c.width, height: c.height },
      transparencyExpected: true,
      sourceReference: referenceId,
      targetBinding: null,
      status: 'DETECTED' as const,
    }))
;
}

export function runDesignReferenceDecomposition(input: {
  contractId: string;
  referenceId: string;
  viewport: DesignViewportClass;
  referenceWidth?: number;
  referenceHeight?: number;
}): DesignReferenceDecomposition {
  const width = input.referenceWidth ?? DESIGN_WORKSPACE_REFERENCE_CANVAS.width;
  const height = input.referenceHeight ?? DESIGN_WORKSPACE_REFERENCE_CANVAS.height;
  const globalGeometry = buildGeometryProfile(width, height);
  const components = buildComponentGeometry(globalGeometry);
  const assetManifest = buildAssetManifest(components, input.referenceId);
  const liveUiRegionCount = components.filter((c) => c.classification === 'LIVE_DOM_UI').length;
  const imageAssetRegionCount = components.filter((c) => c.classification === 'IMAGE_LIKE_ASSET').length;

  return {
    decompositionId: decompId(),
    contractId: input.contractId,
    globalGeometry,
    components,
    typography: buildTypographyProfile(),
    spacing: buildSpacingProfile(),
    materials: buildMaterialProfile(),
    assetManifest,
    liveUiRegionCount,
    imageAssetRegionCount,
    analyzedAt: new Date().toISOString(),
  };
}

export function classifyLiveUiVsImage(
  components: ReferenceComponentGeometry[],
): { liveUi: ReferenceComponentGeometry[]; imageAssets: ReferenceComponentGeometry[] } {
  return {
    liveUi: components.filter((c) => c.classification === 'LIVE_DOM_UI'),
    imageAssets: components.filter((c) => c.classification === 'IMAGE_LIKE_ASSET'),
  };
}
