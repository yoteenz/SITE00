/**
 * P0.VR.1D.7 — Desktop composite scope revalidation report builder.
 */

import { randomUUID } from 'node:crypto';
import type { LiveScreenRunResult } from '../p0vr1d2/types.js';
import { classifyVisualReferenceScope } from './classifyVisualReferenceScope.js';
import { scopeVisualScoreLabel } from './scopedImplementationSpec.js';
import { panelReferenceUsedAsFullRouteAuthority } from './scopedReferenceDomRegionMap.js';
import { P0_VR_1D7_LINEAGE } from './constants.js';
import type { DesktopCompositeRevalidationReport, ScopedRevalidationSummary } from './types.js';

function toSummary(screen: LiveScreenRunResult, boardW = 1672, boardH = 941): ScopedRevalidationSummary {
  const scopeAuthority =
    screen.scopeAuthority ??
    classifyVisualReferenceScope({
      screenId: screen.screenId,
      viewportClass: screen.viewportClass,
      cropWidth: screen.geometry.cropWidth,
      cropHeight: screen.geometry.cropHeight,
      boardWidth: boardW,
      boardHeight: boardH,
      route: screen.route,
    });

  const mappedRegions =
    screen.domDelta && 'mappedRegionCount' in screen.domDelta
      ? Number((screen.domDelta as { mappedRegionCount: number }).mappedRegionCount)
      : 0;

  const scorePct = screen.visualScore <= 1 ? screen.visualScore * 100 : screen.visualScore;

  return {
    screenId: screen.screenId,
    scope: scopeAuthority.scope,
    scopeTargetId: scopeAuthority.scopeTargetId,
    scopeVisualScore: scorePct,
    scopeVisualScoreLabel: scopeVisualScoreLabel(scopeAuthority),
    mappedRegions,
    status: screen.status,
    previousComparisonInvalid: panelReferenceUsedAsFullRouteAuthority(scopeAuthority, screen.route),
    pixelPassEligible: scopeAuthority.pixelPassEligible,
  };
}

export function buildDesktopCompositeScopeRevalidationReport(input: {
  desktopScreens: LiveScreenRunResult[];
  mobileScreens: LiveScreenRunResult[];
  invalidHistoricalMarked?: number;
}): DesktopCompositeRevalidationReport {
  const desktopSummaries = input.desktopScreens.map((s) => toSummary(s));
  const fullWorkspace = desktopSummaries.find((s) => s.screenId === 'DESKTOP_COMPOSITE_OVERVIEW') ?? null;
  const embeddedPanels = desktopSummaries.filter((s) => s.screenId !== 'DESKTOP_COMPOSITE_OVERVIEW');
  const mobileFullScreens = input.mobileScreens.map((s) => toSummary(s));

  return {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    lineage: P0_VR_1D7_LINEAGE,
    fullWorkspace,
    embeddedPanels,
    mobileFullScreens,
    invalidHistoricalMarked: input.invalidHistoricalMarked ?? 0,
  };
}
