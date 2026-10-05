/**
 * P0.VR.REBUILD.1 — Classify legacy patch twins vs authority-first builds.
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { P0_VR_REBUILD_1_BUILD } from './constants.js';
import { resolveReconstructionStrategy } from './reconstructionStrategyResolver.js';
import { evaluateAuthorityCompositionCoverage } from './authorityCompositionCoverage.js';
import { runLegacyStructureRetentionCheck } from './legacyStructureRetentionCheck.js';
import { evaluateVisualAuthorityAcceptanceGate } from './visualAuthorityAcceptanceGate.js';
import { buildFidelityScoreProvenance } from './fidelityScoreProvenance.js';
import { twinFunctionalQaPassed } from '../p0vrUpgrade2/twinFidelityQa.js';
import type { ReconstructionStrategy, TwinRenderMode, VisualAuthorityStatus } from './types.js';
import { resolvePageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';

export function isNdxbookOverviewMobileSession(session: ReconstructionTwinSession): boolean {
  return (
    session.viewport === 'mobile' &&
    (session.pageId.includes('ndxbook') ||
      session.canonicalRoute.includes('/projects/ndxbook/overview') ||
      session.canonicalRoute.includes('/overview'))
  );
}

/** Patch-only twins built before REBUILD.1 should read as failed visual authority. */
export function inferLegacyPatchTwinStatus(session: ReconstructionTwinSession): VisualAuthorityStatus | null {
  if (session.visualAuthorityStatus) return session.visualAuthorityStatus;
  if (!session.twinVersionId || session.status === 'PLANNED' || session.status === 'BUILDING') return null;
  if (session.reconstructionStrategy === 'REBUILD_FROM_AUTHORITY') return null;
  if (!isNdxbookOverviewMobileSession(session)) return null;
  const { strategy } = resolveReconstructionStrategy({
    pageId: session.pageId,
    viewport: session.viewport,
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });
  if (strategy !== 'REBUILD_FROM_AUTHORITY') return null;
  return 'FAILED_VISUAL_AUTHORITY';
}

export function resolveTwinRenderMode(session: ReconstructionTwinSession): TwinRenderMode {
  if (session.twinRenderMode) return session.twinRenderMode;
  if (session.reconstructionStrategy === 'REBUILD_FROM_AUTHORITY') return 'AUTHORITY_FIRST_NDX_OVERVIEW';
  if (session.legacyTwinLabel === 'LEGACY_PATCH_TWIN') return 'LEGACY_PATCH';
  if (inferLegacyPatchTwinStatus(session) === 'FAILED_VISUAL_AUTHORITY') return 'LEGACY_PATCH';
  return 'LEGACY_PATCH';
}

export function enrichSessionVisualAuthority(session: ReconstructionTwinSession): ReconstructionTwinSession {
  const legacyStatus = inferLegacyPatchTwinStatus(session);
  const visualAuthorityStatus: VisualAuthorityStatus =
    session.visualAuthorityStatus ??
    legacyStatus ??
    (session.reconstructionStrategy === 'REBUILD_FROM_AUTHORITY' ? 'AUTHORITY_FIRST_BUILT' : 'PENDING');

  const twinRenderMode = resolveTwinRenderMode(session);
  const strategy: ReconstructionStrategy | undefined =
    session.reconstructionStrategy ??
    (legacyStatus === 'FAILED_VISUAL_AUTHORITY'
      ? 'PATCH_EXISTING'
      : resolveReconstructionStrategy({
          pageId: session.pageId,
          viewport: session.viewport,
          pageArchetype: 'ndxbook-overview-mobile',
          screenId: 'overview',
        }).strategy);

  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });
  const authorityRegionOrder = session.authorityRegionOrder ?? profile.stackOrder;
  const compositionCoverage =
    session.authorityCompositionCoverage ??
    (isNdxbookOverviewMobileSession(session)
      ? evaluateAuthorityCompositionCoverage({
          blueprint: {
            blueprintId: 'inferred',
            pageId: session.pageId,
            viewport: session.viewport,
            authorityVersionId: session.authorityVersionId,
            canvas: { width: 390, height: 844 },
            regions: [],
            regionOrder: authorityRegionOrder,
            globalGrid: '',
            gutterProfile: '',
            verticalRhythm: '',
            typographyHierarchy: [],
            persistentControls: [],
            assetSlots: [],
            interactionSlots: [],
            confidence: 'LOW',
            status: 'READY',
          },
          twinRegionOrder:
            twinRenderMode === 'AUTHORITY_FIRST_NDX_OVERVIEW'
              ? authorityRegionOrder
              : ['legacy-hero-copy', 'legacy-kpi-grid', 'legacy-production-cards', 'legacy-radar-list'],
          strategy: strategy ?? 'PATCH_EXISTING',
        })
      : null);

  const legacyCheck =
    session.legacyStructureRetentionCheck ??
    runLegacyStructureRetentionCheck({
      strategy: strategy ?? 'PATCH_EXISTING',
      twinSurface: twinRenderMode === 'AUTHORITY_FIRST_NDX_OVERVIEW' ? 'AUTHORITY_FIRST' : 'LEGACY_OVERVIEW',
    });

  const functionQaPass = twinFunctionalQaPassed(session.fidelityQa ?? []);
  const visualAuthorityAcceptanceGate =
    session.visualAuthorityAcceptanceGate ??
    (compositionCoverage
      ? evaluateVisualAuthorityAcceptanceGate({
          visualAuthorityStatus,
          compositionCoverage,
          legacyCheck,
          functionQaPass,
          founderApproved: session.promotionReadiness?.founderApproved ?? false,
        })
      : null);

  const fidelityScoreProvenance =
    session.fidelityScoreProvenance ??
    buildFidelityScoreProvenance({
      convergenceBefore: session.convergenceBefore,
      convergenceAfter: session.convergenceAfter,
      compositionCoveragePass: compositionCoverage?.status === 'PASS',
    });

  let promotionReadiness = session.promotionReadiness;
  if (
    promotionReadiness &&
    (visualAuthorityStatus === 'FAILED_VISUAL_AUTHORITY' || visualAuthorityStatus === 'VISUAL_AUTHORITY_FAILED')
  ) {
    const blockingIssues = [...promotionReadiness.blockingIssues];
    if (!blockingIssues.includes('VISUAL_AUTHORITY_FAILED')) blockingIssues.push('VISUAL_AUTHORITY_FAILED');
    promotionReadiness = { ...promotionReadiness, visualReady: false, blockingIssues };
  }

  const legacyTwinLabel =
    session.legacyTwinLabel ??
    (legacyStatus === 'FAILED_VISUAL_AUTHORITY' ? ('LEGACY_PATCH_TWIN' as const) : null);

  return {
    ...session,
    legacyTwinLabel,
    visualAuthorityStatus,
    twinRenderMode,
    reconstructionStrategy: strategy,
    authorityCompositionCoverage: compositionCoverage,
    legacyStructureRetentionCheck: legacyCheck,
    visualAuthorityAcceptanceGate,
    fidelityScoreProvenance,
    promotionReadiness,
  };
}

export function isAuthorityFirstBuildRef(buildRef: string | undefined | null): boolean {
  return buildRef === P0_VR_REBUILD_1_BUILD;
}
