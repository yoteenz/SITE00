/**
 * P0.VR.1D.7 — Reclassify founder board extractions with explicit scope.
 */

import {
  ingestNdxProjectHubMoodBoards,
  NDX_DESKTOP_SCREEN_SPECS,
  NDX_MOBILE_SCREEN_SPECS,
} from '../../../site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
import { classifyVisualReferenceScope } from './classifyVisualReferenceScope.js';
import { resolveScopeTargetDefinition } from './scopeTargetRegistry.js';
import type { ReclassifiedFounderReference } from './types.js';

export function reclassifyFounderBoardReferences(input: {
  projectSlug?: string;
  desktopImageWidth?: number;
  desktopImageHeight?: number;
  mobileImageWidth?: number;
  mobileImageHeight?: number;
} = {}): ReclassifiedFounderReference[] {
  const projectSlug = input.projectSlug ?? 'ndxbook';
  const desktopW = input.desktopImageWidth ?? 1672;
  const desktopH = input.desktopImageHeight ?? 941;
  const mobileW = input.mobileImageWidth ?? 1672;
  const mobileH = input.mobileImageHeight ?? 941;

  const extraction = ingestNdxProjectHubMoodBoards({
    projectSlug,
    desktopImageWidth: desktopW,
    desktopImageHeight: desktopH,
    mobileImageWidth: mobileW,
    mobileImageHeight: mobileH,
  });

  const results: ReclassifiedFounderReference[] = [];

  for (const screen of extraction.desktop.screens) {
    const spec = NDX_DESKTOP_SCREEN_SPECS.find((s) => s.screenId === screen.screenId);
    const cropW = Math.round((spec?.width ?? screen.bounds.width) * desktopW);
    const cropH = Math.round((spec?.height ?? screen.bounds.height) * desktopH);
    const authority = classifyVisualReferenceScope({
      screenId: screen.screenId,
      viewportClass: 'desktop',
      cropWidth: cropW,
      cropHeight: cropH,
      boardWidth: desktopW,
      boardHeight: desktopH,
      surfaceType: screen.surfaceType,
      moduleLabel: screen.moduleLabel,
      route: screen.route,
      projectSlug,
      hasGlobalNavigation: screen.screenId === 'DESKTOP_COMPOSITE_OVERVIEW',
    });
    const registry = resolveScopeTargetDefinition(screen.screenId, projectSlug);
    results.push({
      screenId: screen.screenId,
      viewportClass: 'desktop',
      scope: authority.scope,
      scopeTargetId: authority.scopeTargetId,
      scopeTargetType: authority.scopeTargetType,
      route: authority.route,
      standaloneRoute: registry?.standaloneRoute ?? null,
      rootSelector: authority.rootSelector,
      comparisonMode: authority.comparisonMode,
      fullRouteReferenceStatus: authority.fullRouteReferenceStatus,
      referenceBounds: authority.referenceBounds,
    });
  }

  for (const screen of extraction.mobile.screens) {
    const spec = NDX_MOBILE_SCREEN_SPECS.find((s) => s.screenId === screen.screenId);
    const cropW = Math.round((spec?.width ?? screen.bounds.width) * mobileW);
    const cropH = Math.round((spec?.height ?? screen.bounds.height) * mobileH);
    const authority = classifyVisualReferenceScope({
      screenId: screen.screenId,
      viewportClass: 'mobile',
      cropWidth: cropW,
      cropHeight: cropH,
      boardWidth: mobileW,
      boardHeight: mobileH,
      surfaceType: screen.surfaceType,
      moduleLabel: screen.moduleLabel,
      route: screen.route,
      projectSlug,
      hasDeviceFrame: true,
    });
    results.push({
      screenId: screen.screenId,
      viewportClass: 'mobile',
      scope: authority.scope,
      scopeTargetId: authority.scopeTargetId,
      scopeTargetType: authority.scopeTargetType,
      route: authority.route,
      standaloneRoute: authority.standaloneRoute,
      rootSelector: authority.rootSelector,
      comparisonMode: authority.comparisonMode,
      fullRouteReferenceStatus: authority.fullRouteReferenceStatus,
      referenceBounds: authority.referenceBounds,
    });
  }

  return results;
}

export function desktopCompositeClassifiedAsFullScreen(reclassified: ReclassifiedFounderReference[]): boolean {
  const composite = reclassified.find((r) => r.screenId === 'DESKTOP_COMPOSITE_OVERVIEW');
  return composite?.scope === 'FULL_SCREEN_REFERENCE';
}

export function desktopPanelCropsClassifiedAsPanelOrModule(reclassified: ReclassifiedFounderReference[]): boolean {
  const panels = reclassified.filter(
    (r) => r.viewportClass === 'desktop' && r.screenId !== 'DESKTOP_COMPOSITE_OVERVIEW',
  );
  return panels.every(
    (p) => p.scope === 'WORKSPACE_PANEL_REFERENCE' || p.scope === 'MODULE_REFERENCE',
  );
}

export function mobilePhoneScreensClassifiedAsFullScreen(reclassified: ReclassifiedFounderReference[]): boolean {
  const mobile = reclassified.filter((r) => r.viewportClass === 'mobile');
  return mobile.length === 6 && mobile.every((m) => m.scope === 'FULL_SCREEN_REFERENCE');
}
