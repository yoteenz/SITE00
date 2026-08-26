/**
 * Origin panel + background state derivation (P0.ORIGIN.1).
 */

import type { HomeMode } from '../state/types';
import {
  originBackgroundRole,
  resolveOriginBackgroundByViewport,
  resolveOriginBackgroundAsset,
  originBackgroundPresentation,
  type OriginBackgroundVariant,
  type OriginViewportAssetKind,
} from './origin-background-assets';

export type OriginExpandedPanel = 'NONE' | 'IDENTITY' | 'BLDR' | 'EVOLVE';

export type OriginPanelState = {
  expandedPanel: OriginExpandedPanel;
  backgroundVariant: OriginBackgroundVariant;
};

export function deriveOriginExpandedPanel(homeMode: HomeMode): OriginExpandedPanel {
  switch (homeMode) {
    case 'idnty-expanded':
      return 'IDENTITY';
    case 'bldr-expanded':
      return 'BLDR';
    case 'evolve-expanded':
      return 'EVOLVE';
    default:
      return 'NONE';
  }
}

export function deriveOriginBackgroundVariant(homeMode: HomeMode): OriginBackgroundVariant {
  return deriveOriginExpandedPanel(homeMode) === 'NONE' ? 'WITH_PANELS' : 'CLEAN';
}

export function deriveOriginPanelState(homeMode: HomeMode): OriginPanelState {
  const expandedPanel = deriveOriginExpandedPanel(homeMode);
  return {
    expandedPanel,
    backgroundVariant: expandedPanel === 'NONE' ? 'WITH_PANELS' : 'CLEAN',
  };
}

export function resolveOriginPanelBackgroundUrl(
  homeMode: HomeMode,
  viewport: OriginViewportAssetKind,
): string {
  const variant = deriveOriginBackgroundVariant(homeMode);
  return resolveOriginBackgroundByViewport(viewport, variant);
}

export function resolveOriginPanelBackgroundPresentation(
  homeMode: HomeMode,
  viewport: OriginViewportAssetKind,
): { url: string; position: string; size: 'cover' | 'contain' } {
  const variant = deriveOriginBackgroundVariant(homeMode);
  const role = originBackgroundRole(viewport, variant);
  const presentation = originBackgroundPresentation(role);
  return {
    url: resolveOriginBackgroundAsset(role),
    position: presentation.position,
    size: presentation.size,
  };
}

/** Preload both viewport assets for the current panel state. */
export function originBackgroundPreloadUrls(
  homeMode: HomeMode,
  viewport: OriginViewportAssetKind,
): [string, string] {
  const variant = deriveOriginBackgroundVariant(homeMode);
  const withPanels = resolveOriginBackgroundByViewport(viewport, 'WITH_PANELS');
  const clean = resolveOriginBackgroundByViewport(viewport, 'CLEAN');
  return variant === 'WITH_PANELS' ? [withPanels, clean] : [clean, withPanels];
}
