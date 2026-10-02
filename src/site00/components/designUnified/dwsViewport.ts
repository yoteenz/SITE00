import { createContext, useContext } from 'react';
import type { DwsFamily } from './dwsProfiles';

export type DwsViewport = 'desktop' | 'tablet' | 'mobile';
export type DwsOrientation = 'landscape' | 'portrait';

export type DwsViewportInfo = {
  viewport: DwsViewport;
  orientation: DwsOrientation;
  family: DwsFamily;
};

export const DWS_MOBILE_MAX = 700;
export const DWS_DESKTOP_MIN = 1100;
/** Touch tablets in landscape are wider than the desktop breakpoint; they stay "tablet" up to this width. */
export const DWS_TABLET_COARSE_MAX = 1500;

/**
 * mobile < 700 · tablet 700–1099 · desktop ≥ 1100, EXCEPT coarse-pointer (touch) devices up to 1500px wide,
 * which are landscape tablets (the tablet authorities are 4:3 landscape + one portrait).
 * `override` (?dws=desktop|tablet|mobile) exists for QA only.
 */
export function resolveDwsViewport(width: number, height: number, coarse: boolean, override?: string | null): DwsViewportInfo {
  let viewport: DwsViewport;
  if (override === 'desktop' || override === 'tablet' || override === 'mobile') viewport = override;
  else if (width < DWS_MOBILE_MAX) viewport = 'mobile';
  else if (width < DWS_DESKTOP_MIN) viewport = 'tablet';
  else viewport = coarse && width <= DWS_TABLET_COARSE_MAX ? 'tablet' : 'desktop';
  const orientation: DwsOrientation = width >= height ? 'landscape' : 'portrait';
  const family: DwsFamily = viewport === 'desktop' ? 'desktop' : viewport === 'mobile' ? 'mobile' : orientation === 'portrait' ? 'tabletP' : 'tabletL';
  return { viewport, orientation, family };
}

export const DwsViewportContext = createContext<DwsViewportInfo>({ viewport: 'desktop', orientation: 'landscape', family: 'desktop' });
export const useDwsViewport = () => useContext(DwsViewportContext);

export type DwsLayerKey = 'drawer' | 'inspector' | 'modal';

/**
 * Which overlay layers are rendered. Desktop + tablet render every open layer (tablet landscape like desktop,
 * tablet portrait as split drawer | inspector with the modal floating over). Phones render ONE sheet — the explicitly
 * selected layer, else the top-most (modal > inspector > drawer) — and expose a layer switch so nothing is unreachable.
 */
export function visibleLayers(viewport: DwsViewport, open: Record<DwsLayerKey, boolean>, layer: DwsLayerKey | null): { show: Record<DwsLayerKey, boolean>; top: DwsLayerKey | null } {
  const top: DwsLayerKey | null = layer && open[layer] ? layer : open.modal ? 'modal' : open.inspector ? 'inspector' : open.drawer ? 'drawer' : null;
  if (viewport === 'mobile') return { top, show: { drawer: top === 'drawer', inspector: top === 'inspector', modal: top === 'modal' } };
  return { top, show: { ...open } };
}
