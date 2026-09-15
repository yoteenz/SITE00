import { FIGMA_STYLE_PACKAGE_KEYS } from './constants.js';
import type { FigmaStyleInterfaceTranslationPackage } from './types.js';

export function assertFigmaStylePackage(value: unknown): FigmaStyleInterfaceTranslationPackage {
  if (!value || typeof value !== 'object') {
    throw new Error('FIGMA_STYLE_PACKAGE_MISSING');
  }
  const pkg = value as Record<string, unknown>;
  for (const key of FIGMA_STYLE_PACKAGE_KEYS) {
    if (pkg[key] == null) {
      throw new Error(`FIGMA_STYLE_PACKAGE_INCOMPLETE:${key}`);
    }
  }
  const preview = pkg.visualInterfacePreview as { layers?: unknown; frameWidth?: unknown; frameHeight?: unknown };
  if (!Array.isArray(preview.layers) || preview.layers.length < 1) {
    throw new Error('VISUAL_INTERFACE_PREVIEW_EMPTY');
  }
  if (!Number(preview.frameWidth) || !Number(preview.frameHeight)) {
    throw new Error('VISUAL_INTERFACE_PREVIEW_FRAME_INVALID');
  }
  const components = pkg.componentTree;
  if (!Array.isArray(components) || components.length < 1) {
    throw new Error('COMPONENT_TREE_EMPTY');
  }
  const handoff = pkg.implementationHandoff as { title?: unknown; buildOrder?: unknown };
  if (!handoff?.title || !Array.isArray(handoff.buildOrder)) {
    throw new Error('IMPLEMENTATION_HANDOFF_INCOMPLETE');
  }
  const hierarchy = pkg.visualHierarchyMap as { firstVisualFocus?: unknown };
  if (!hierarchy?.firstVisualFocus) {
    throw new Error('VISUAL_HIERARCHY_MAP_INCOMPLETE');
  }
  return value as FigmaStyleInterfaceTranslationPackage;
}

export function packageContractPresence(pkg: FigmaStyleInterfaceTranslationPackage | null): Record<string, boolean> {
  return {
    visualTranslation: Boolean(pkg?.visualInterfacePreview?.layers?.length),
    figmaStylePackage: Boolean(pkg),
    sectionTree: Boolean(pkg?.sectionTree?.id),
    componentTree: Boolean(pkg?.componentTree?.length),
    typography: Boolean(pkg?.typographySystem?.hierarchy?.length),
    colors: Boolean(pkg?.colorSystem?.pageBackground),
    spacing: pkg?.spacingSystem?.outerMargin != null,
    surfaces: Boolean(pkg?.borderRadiusSurfaceSystem?.fills?.length),
    assetMap: Array.isArray(pkg?.assetPlacementMap),
    visualHierarchy: Boolean(pkg?.visualHierarchyMap?.firstVisualFocus),
    implementationHandoff: Boolean(pkg?.implementationHandoff?.title),
  };
}
