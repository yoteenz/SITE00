import {
  ASSTS_LOADER_REFERENCE_CANVAS,
  ASSTS_LOADER_REGIONS,
  ASSTS_LOADER_TYPOGRAPHY,
  loaderRegionStyleVars,
  type LoaderRegionId,
  type LoaderRegionRect,
} from './loader-composition-map';
import {
  ASSTS_LOADER_DESKTOP_REFERENCE_CANVAS,
  ASSTS_LOADER_DESKTOP_REGIONS,
  ASSTS_LOADER_DESKTOP_TYPOGRAPHY,
  loaderDesktopRegionStyleVars,
  type LoaderDesktopRegionId,
} from './loader-composition-map-desktop';

export type LoaderPresentation = 'mobile' | 'desktop';

export type LoaderCompositionBundle = {
  presentation: LoaderPresentation;
  compositionId: string;
  canvas: { width: number; height: number };
  typography: typeof ASSTS_LOADER_TYPOGRAPHY | typeof ASSTS_LOADER_DESKTOP_TYPOGRAPHY;
  regionStyleVars: (id: LoaderRegionId) => Record<string, string>;
  regions: Record<LoaderRegionId, LoaderRegionRect>;
};

export function resolveLoaderComposition(presentation: LoaderPresentation): LoaderCompositionBundle {
  if (presentation === 'desktop') {
    return {
      presentation: 'desktop',
      compositionId: 'assts-loader-desktop-v1',
      canvas: ASSTS_LOADER_DESKTOP_REFERENCE_CANVAS,
      typography: ASSTS_LOADER_DESKTOP_TYPOGRAPHY,
      regionStyleVars: (id) => loaderDesktopRegionStyleVars(id as LoaderDesktopRegionId),
      regions: ASSTS_LOADER_DESKTOP_REGIONS as unknown as Record<LoaderRegionId, LoaderRegionRect>,
    };
  }

  return {
    presentation: 'mobile',
    compositionId: 'assts-loader-mobile-v2',
    canvas: ASSTS_LOADER_REFERENCE_CANVAS,
    typography: ASSTS_LOADER_TYPOGRAPHY,
    regionStyleVars: loaderRegionStyleVars,
    regions: ASSTS_LOADER_REGIONS,
  };
}
