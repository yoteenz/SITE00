/**
 * P0.VR.8-SRF — ScreenReplicationKernel (extends DesignReconstructionKernel).
 */

import { runDesignReconstructionKernel } from '../../pageCompletionIntelligence/designReconstructionKernel.js';
import { DEFAULT_ASSET_DEFERRED_POLICY } from './assetDeferredPolicy.js';
import { runScreenReplicationConvergence, mobilePassGate, desktopIndependentAuthorityRequired } from './convergenceLoop.js';
import {
  buildNdxOverviewCompositionMap,
  buildNdxOverviewMobileAuthorityBlueprint,
  buildNdxOverviewMobileFidelityContract,
  buildNdxOverviewRebuildRegionMap,
} from './ndxOverviewMobileGoldenCase.js';
import type { PageExperienceInput } from '../../pageCompletionIntelligence/types.js';
import type { ScreenReplicationInspectorState } from './types.js';

export const NDX_OVERVIEW_MOBILE_LIVE_REGION_MAP: Record<string, boolean> = {
  'overview-hero': true,
  'overview-kpis': true,
  'production-head': true,
  'production-expr-link': true,
  'production-carousel': true,
  'production-card-art-1': true,
  'production-card-art-2': true,
  'radar-head': true,
  'radar-list': true,
};

export const NDX_OVERVIEW_MOBILE_DOM_MARKERS = [
  'site00-fws-mobile-shell-screen--overview',
  'site00-fws-mobile-overview__hero',
  'site00-fws-hub-kpis--mobile',
  'site00-fws-hub-carousel--mobile-row',
  'site00-fws-hub-list--radar',
] as const;

export const NDX_OVERVIEW_GENERIC_TEMPLATE_MARKERS = [
  'site00-pov',
  'site00-pov-hero',
  'site00-pov-signals',
] as const;

export function runScreenReplicationKernel(input: {
  workspace: 'SKINS' | 'PAGES' | 'ASSETS';
  pageExperience: PageExperienceInput;
  goldenCaseId?: 'NDX_OVERVIEW_MOBILE';
}) {
  const baseKernel = runDesignReconstructionKernel(input);
  const goldenCaseId = input.goldenCaseId ?? 'NDX_OVERVIEW_MOBILE';

  if (goldenCaseId !== 'NDX_OVERVIEW_MOBILE') {
    return { ...baseKernel, screenReplication: null };
  }

  const contract = buildNdxOverviewMobileFidelityContract();
  const blueprint = buildNdxOverviewMobileAuthorityBlueprint();
  const compositionMap = buildNdxOverviewCompositionMap();
  const rebuildMap = buildNdxOverviewRebuildRegionMap();
  const convergence = runScreenReplicationConvergence({
    contract,
    blueprint,
    liveDomMarkers: [...NDX_OVERVIEW_MOBILE_DOM_MARKERS],
    liveRegionPresence: NDX_OVERVIEW_MOBILE_LIVE_REGION_MAP,
    passCount: 1,
  });

  const inspector = buildScreenReplicationInspectorState(convergence);

  return {
    ...baseKernel,
    screenReplication: {
      lineage: 'P0.VR.8-SRF',
      contract,
      assetPolicy: DEFAULT_ASSET_DEFERRED_POLICY,
      blueprint,
      compositionMap,
      rebuildMap,
      convergence,
      inspector,
      mobilePass: mobilePassGate(convergence),
      desktopGated: !desktopIndependentAuthorityRequired(mobilePassGate(convergence)),
    },
  };
}

export function buildScreenReplicationInspectorState(
  convergence: ReturnType<typeof runScreenReplicationConvergence>,
): ScreenReplicationInspectorState {
  const scores = convergence.structuralQa?.scores ?? null;
  const differenceClasses = [
    ...new Set(convergence.structuralQa?.differences.map((d) => d.differenceClass) ?? []),
  ];

  return {
    authorityId: buildNdxOverviewMobileFidelityContract().authorityId,
    viewport: 'MOBILE',
    hostLockedPercent: buildNdxOverviewRebuildRegionMap().hostLockedPercent,
    authorityControlledPercent: buildNdxOverviewRebuildRegionMap().authorityControlledPercent,
    assetDeferredPercent: buildNdxOverviewRebuildRegionMap().assetDeferredPercent,
    hostBoundarySuspect: buildNdxOverviewRebuildRegionMap().hostBoundarySuspect,
    scores,
    structuralQaPassed: convergence.structuralQa?.passed ?? false,
    fullQaPassed: convergence.fullQa?.passed ?? false,
    assetPendingCount: convergence.assetPendingCount,
    convergencePassCount: convergence.passCount,
    differenceClasses,
    captures: convergence.captures,
    mobilePass: mobilePassGate(convergence),
    desktopStatus: mobilePassGate(convergence) ? 'NOT_STARTED' : 'GATED',
    statusLabel: convergence.status,
  };
}

export function screenAuthorityRoutesToReplicationNotAssets(purpose: string): boolean {
  return purpose === 'SCREEN_AUTHORITY';
}
