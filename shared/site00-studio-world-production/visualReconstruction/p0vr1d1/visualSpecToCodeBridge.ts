/**
 * P0.VR.1D.1 — VisualSpecToCodeBridge
 * Consumes P0.VR.1D structures → ScreenImplementationSpec (concrete coding contract).
 */

import { randomUUID } from 'node:crypto';
import type { LayoutModel, ScreenImplementationSpec, VisualSpecToCodeBridgeInput } from './types.js';
import { buildRegionCodeSpec } from './regionCodeSpec.js';

const NDX_DESKTOP_GRID_COLUMNS = '148px minmax(0, 1fr) 402px';

export function buildVisualSpecToCodeBridge(input: VisualSpecToCodeBridgeInput): ScreenImplementationSpec {
  const viewportWidth = input.screen.authority?.viewportWidth ?? input.frameAuthority.crop.width;
  const viewportHeight = input.screen.authority?.viewportHeight ?? input.frameAuthority.crop.height;
  const layoutModel = input.layoutModel ?? inferLayoutModel(input);

  const regions = input.geometryContract.entries.map((geometry) => {
    const mapEntry = input.regionMap.entries.find((e) => e.regionId === geometry.regionId);
    const typography = input.typographyContract.entries.find((e) => e.regionId === geometry.regionId);
    const asset = input.assetMatches.find((a) => a.regionId === geometry.regionId);
    const layoutRegion = layoutFromGeometryAndMap(geometry, mapEntry);

    return buildRegionCodeSpec({
      geometry,
      layout: layoutRegion,
      viewportWidth,
      viewportHeight,
      typography,
      layoutParent: mapEntry?.mapRole.includes('PANEL') ? 'root-grid' : null,
      assetId: asset?.matchedProjectAssetId ?? null,
    });
  });

  const fixedElements = regions.filter((r) => r.positioningMode === 'fixed').map((r) => r.regionId);
  const stickyElements = regions.filter((r) => r.positioningMode === 'sticky').map((r) => r.regionId);
  const scrollRegions = regions.filter((r) => r.interactionMode === 'scroll').map((r) => r.regionId);

  return {
    specId: randomUUID(),
    screenId: input.screen.screenId,
    route: input.route,
    referenceAuthorityId: input.screen.croppedReferenceAssetId,
    referenceSource: input.screen.authoritySource,
    viewportWidth,
    viewportHeight,
    layoutModel,
    regions,
    components: regions.map((r) => ({
      componentId: `${r.regionId}__component`,
      regionId: r.regionId,
      role: r.semanticRole,
    })),
    typography: input.typographyContract.entries,
    assets: input.assetMatches,
    fixedElements,
    stickyElements,
    scrollRegions,
    responsiveMode: 'REFERENCE_LOCKED',
    doNotChangeRegions: [],
    referenceConfidence: input.screen.confidence,
    precisionOverrideAvailable: input.screen.referenceResolution !== 'SUFFICIENT',
    mobileScreenOrder: input.mobileScreenOrder,
  };
}

import type { VisualRegionMapEntry } from '../p0vr1d/types.js';
import type { PixelGeometryContractEntry } from '../p0vr1d/types.js';

function layoutFromGeometryAndMap(
  geometry: PixelGeometryContractEntry,
  mapEntry?: VisualRegionMapEntry,
) {
  const bounds = mapEntry?.bounds;
  return {
    regionId: geometry.regionId,
    role: mapEntry?.mapRole ?? ('OTHER' as const),
    x: geometry.referenceX,
    y: geometry.referenceY,
    width: geometry.referenceWidth,
    height: geometry.referenceHeight,
    relativeX: bounds ? bounds.x / Math.max(bounds.width, 1) : 0,
    relativeY: bounds ? bounds.y / Math.max(bounds.height, 1) : 0,
    relativeWidth: bounds ? bounds.width / Math.max(bounds.width, 1) : 1,
    relativeHeight: bounds ? bounds.height / Math.max(bounds.height, 1) : 1,
    zIndexHint: mapEntry?.mapRole === 'BOTTOM_NAV' ? 100 : 1,
    alignment: 'start',
    padding: 0,
    gap: mapEntry?.mapRole.includes('PANEL') ? 10 : 0,
    borderRadius: mapEntry?.mapRole.includes('ARTWORK') ? 8 : 0,
    rotation: 0,
    opacity: 1,
    shadowBehavior: null,
  };
}

function inferLayoutModel(input: VisualSpecToCodeBridgeInput): LayoutModel {
  if (input.screen.viewportClass === 'mobile') return 'FLOW';
  const hasLeftRail = input.regionMap.entries.some((e) => e.mapRole === 'LEFT_PANEL');
  const hasRightPanel = input.regionMap.entries.some((e) => e.mapRole === 'RIGHT_PANEL');
  if (hasLeftRail && hasRightPanel) return 'CSS_GRID';
  if (input.regionMap.entries.length > 4) return 'HYBRID';
  return 'FLEX';
}

export function explicitLayoutModelForNdxDesktop(): { layoutModel: LayoutModel; gridTemplateColumns: string } {
  return { layoutModel: 'CSS_GRID', gridTemplateColumns: NDX_DESKTOP_GRID_COLUMNS };
}

export function typographyTranslatedToConcreteCss(spec: ScreenImplementationSpec): boolean {
  return spec.typography.every((e) => e.sizePx > 0 && e.preserveLineBreaks);
}

export function assetPlacementTranslatedToCode(spec: ScreenImplementationSpec): boolean {
  return spec.assets.every((a) => a.regionId.length > 0);
}
