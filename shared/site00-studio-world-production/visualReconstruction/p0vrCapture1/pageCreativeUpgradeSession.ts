/**
 * P0.VR.CAPTURE.1 — Page creative upgrade session (wizard state).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { buildPageCreativeDiagnosis } from './pageCreativeDiagnosis.js';
import { buildPageCreativeDirectionPlan } from './pageCreativeDirectionPlan.js';
import { getForensicReport } from '../p0vrDiag1/forensicReportRegistry.js';
import {
  buildForensicUpgradeBundle,
  recomputeForensicScoringFromReport,
  runRegionEvidenceRecoveryForUpgrade,
  type ForensicUpgradeBundle,
} from '../p0vrDiag1/upgradeDiagnosisBridge.js';
import type { RegionEvidenceRecoveryReceipt } from '../p0vrDiag1R4/types.js';
import { P0_VR_DIAG_1R5B_BUILD } from '../p0vrDiag1/constants.js';
import { analyzeSingleRegionStructure } from '../p0vrDiag1R5/analyzeSingleRegionStructure.js';
import { resolvePageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { AuthorityRelativeForensicsInput } from '../p0vrDiag1/types.js';
import { recordForensicsVersion } from '../p0vrDiag1/forensicsVersion.js';
import { createTwinSessionFromApprovedDirection } from '../p0vrUpgrade2/reconstructionTwinSession.js';
import type { PageCreativeUpgradeSession, PageCreativeUpgradeStatus } from './types.js';
import type { DomRegionMeasurement } from '../p0vrDiag1/types.js';

const sessions = new Map<string, PageCreativeUpgradeSession>();

function sessionKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}::${pageId}::${viewport}`;
}

export function openPageCreativeUpgradeSession(options: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  captureId: string;
  parentAuthorityId?: string | null;
  childArchetype?: string | null;
  pagePurpose: string;
  parentAuthorityLabel: string;
  route: string;
  isChildPage?: boolean;
  isRoot?: boolean;
  designAuthorityVersionId?: string | null;
  designAuthorityAssetRef?: string | null;
  captureAssetRef?: string | null;
  captureWidth?: number;
  captureHeight?: number;
  authorityWidth?: number;
  authorityHeight?: number;
  domMeasurements?: DomRegionMeasurement[];
  cssSnapshot?: Record<string, string | number>;
  visualShellSpec?: {
    headerHeightPx: number;
    headerPaddingX: number;
    contentPaddingX: number;
    sectionGap: number;
    bottomNavHeightPx: number;
    viewportWidth: number;
    viewportHeight: number;
  } | null;
  screenId?: string;
}): PageCreativeUpgradeSession {
  const isRoot = options.isRoot ?? false;
  const hasCapture = Boolean(options.captureAssetRef);
  const hasAuthority = Boolean(options.designAuthorityAssetRef);
  const captureWidth = options.captureWidth ?? 390;
  const captureHeight = options.captureHeight ?? 844;
  const authorityWidth = options.authorityWidth ?? captureWidth;
  const authorityHeight = options.authorityHeight ?? captureHeight;

  const forensicBundle = buildForensicUpgradeBundle({
    pageId: options.pageId,
    viewport: options.viewport,
    pageArchetype: isRoot ? 'ndxbook-overview-mobile' : options.childArchetype ?? 'generic-mobile-page',
    screenId: options.screenId,
    route: options.route,
    pagePurpose: options.pagePurpose,
    isRootPage: isRoot,
    currentCapture: {
      captureId: options.captureId,
      width: captureWidth,
      height: captureHeight,
      imageRef: options.captureAssetRef,
      domMeasurements: options.domMeasurements,
      cssSnapshot: options.cssSnapshot,
    },
    designAuthority: {
      authorityVersionId: options.designAuthorityVersionId ?? null,
      width: authorityWidth,
      height: authorityHeight,
      assetRef: options.designAuthorityAssetRef,
      referenceType: 'VIEWPORT_SCREENSHOT',
      visualShellSpec: options.visualShellSpec ?? null,
    },
    domMeasurements: options.domMeasurements,
  });
  const visualDiagnosis = forensicBundle.visualDiagnosis;
  const reconstructionPlan = forensicBundle.reconstructionPlan;
  const forensicsVersion = recordForensicsVersion({
    authorityVersionId: options.designAuthorityVersionId ?? null,
    captureId: options.captureId,
    reportId: forensicBundle.report.reportId,
    specId: forensicBundle.measuredSpec.specId,
  });
  const diagnosis = buildPageCreativeDiagnosis({
    isChildPage: !isRoot && (options.isChildPage ?? true),
    isRootPage: isRoot,
    viewport: options.viewport,
    missingParentGrammar: !isRoot,
    pagePurpose: options.pagePurpose,
  });
  const plan = buildPageCreativeDirectionPlan({
    pagePurpose: options.pagePurpose,
    parentAuthorityLabel: isRoot ? options.pagePurpose : options.parentAuthorityLabel,
    childArchetype: options.childArchetype,
    route: options.route,
    isRootPage: isRoot,
  });
  let status: PageCreativeUpgradeStatus = 'AWAITING_CAPTURE';
  if (hasCapture && hasAuthority) {
    status = 'COMPARE_READY';
  } else if (!hasCapture) {
    status = 'AWAITING_CAPTURE';
  }
  const session: PageCreativeUpgradeSession = {
    sessionId: `upgrade_${options.projectId}_${Date.now()}`,
    projectId: options.projectId,
    pageId: options.pageId,
    viewport: options.viewport,
    captureId: options.captureId,
    parentAuthorityId: isRoot ? null : (options.parentAuthorityId ?? null),
    childArchetype: options.childArchetype ?? null,
    isRoot,
    route: options.route,
    pagePurpose: options.pagePurpose,
    founderNote: null,
    currentDiagnosis: diagnosis,
    visualDiagnosis,
    reconstructionPlan,
    creativeDirectionPlan: plan,
    status: hasCapture && hasAuthority ? 'DIRECTION_READY' : status,
    approvedAt: null,
    afterCaptureId: null,
    designAuthorityVersionId: options.designAuthorityVersionId ?? null,
    designAuthorityAssetRef: options.designAuthorityAssetRef ?? null,
    captureAssetRef: options.captureAssetRef ?? null,
    beforeImageRenderable: hasCapture,
    referenceImageRenderable: hasAuthority,
    forensicsReportId: forensicBundle.report.reportId,
    measuredSpecId: forensicBundle.measuredSpec.specId,
    forensicsVersionId: forensicsVersion.versionId,
  };
  sessions.set(sessionKey(options.projectId, options.pageId, options.viewport), session);
  return session;
}

export function getPageCreativeUpgradeSession(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageCreativeUpgradeSession | null {
  return sessions.get(sessionKey(projectId, pageId, viewport)) ?? null;
}

export function approvePageCreativeDirection(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated: PageCreativeUpgradeSession = {
    ...session,
    status: 'DIRECTION_APPROVED',
    reconstructionPlan: session.reconstructionPlan
      ? { ...session.reconstructionPlan, status: 'APPROVED' }
      : null,
    approvedAt: new Date().toISOString(),
  };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  if (updated.reconstructionPlan && updated.designAuthorityVersionId) {
    createTwinSessionFromApprovedDirection({
      projectId,
      pageId,
      viewport,
      canonicalRoute: updated.route,
      authorityVersionId: updated.designAuthorityVersionId,
      beforeCaptureId: updated.captureId,
      captureAssetRef: updated.captureAssetRef ?? null,
      designAuthorityAssetRef: updated.designAuthorityAssetRef ?? null,
      plan: updated.reconstructionPlan,
      measuredSpecId: updated.measuredSpecId ?? updated.reconstructionPlan.measuredSpecId ?? null,
      forensicsReportId: updated.forensicsReportId ?? updated.reconstructionPlan.forensicsReportId ?? null,
      isRootPage: updated.isRoot,
    });
  }
  return updated;
}

export function setPageCreativeUpgradeFounderNote(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  note: string,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated = { ...session, founderNote: note.trim() || null };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

export function markPageCreativeUpgradeStatus(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  status: PageCreativeUpgradeStatus,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated = { ...session, status };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

export function attachAfterCaptureToSession(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  afterCaptureId: string,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated: PageCreativeUpgradeSession = {
    ...session,
    afterCaptureId,
    status: 'COMPLETE',
  };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

export function applyForensicUpgradeBundleToSession(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  bundle: ForensicUpgradeBundle,
  options?: {
    recalculatedAt?: string | null;
    evidenceRecoveryAt?: string | null;
    recoveryReceipt?: RegionEvidenceRecoveryReceipt | null;
  },
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const receipt = options?.recoveryReceipt;
  const updated: PageCreativeUpgradeSession = {
    ...session,
    visualDiagnosis: bundle.visualDiagnosis,
    reconstructionPlan: bundle.reconstructionPlan,
    forensicsReportId: bundle.report.reportId,
    measuredSpecId: bundle.measuredSpec.specId,
    forensicsRecalculatedAt: options?.recalculatedAt ?? session.forensicsRecalculatedAt ?? null,
    forensicsEvidenceRecoveryAt:
      options?.evidenceRecoveryAt ?? receipt?.createdAt ?? session.forensicsEvidenceRecoveryAt ?? null,
    lastEvidenceRecoverySummary: receipt
      ? {
          status: receipt.status,
          depthBeforePct: receipt.depthBefore.pct,
          depthAfterPct: receipt.depthAfter.pct,
          regionsImproved: receipt.regionsImproved,
          regionsStillBlocked: receipt.regionsStillBlocked,
          rootCauseSummary: receipt.rootCauseSummary ?? null,
          structureTraceCount: receipt.structureTraces?.length ?? 0,
          structureToDepthTraces: receipt.structureToDepthTraces ?? [],
        }
      : session.lastEvidenceRecoverySummary ?? null,
  };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

/** Rescore stored forensics (1R3) or full re-run when no cached report. */
export function recalculatePageCreativeUpgradeForensics(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  fullInput: AuthorityRelativeForensicsInput & {
    pagePurpose: string;
    route: string;
    isRootPage?: boolean;
  },
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;

  const stored = getForensicReport(session.forensicsReportId);
  const bundle = stored
    ? recomputeForensicScoringFromReport(stored, {
        pageArchetype: fullInput.pageArchetype,
        screenId: fullInput.screenId,
        isRootPage: fullInput.isRootPage,
        pagePurpose: fullInput.pagePurpose,
        route: fullInput.route,
      })
    : buildForensicUpgradeBundle(fullInput);

  const recalculatedAt = new Date().toISOString();
  return applyForensicUpgradeBundleToSession(projectId, pageId, viewport, bundle, { recalculatedAt });
}

/** Targeted blocker recovery (1R4) using stored report + live DOM — no new capture by default. */
export function analyzeMissingPageCreativeUpgradeEvidence(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  fullInput: AuthorityRelativeForensicsInput & {
    pagePurpose: string;
    route: string;
    isRootPage?: boolean;
    forensicsVersion?: string;
  },
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;

  const stored =
    getForensicReport(session.forensicsReportId) ??
    buildForensicUpgradeBundle(fullInput).report;

  const shell = fullInput.designAuthority.visualShellSpec;
  const { bundle, receipt } = runRegionEvidenceRecoveryForUpgrade({
    report: stored,
    forensicsVersion: fullInput.forensicsVersion ?? session.forensicsVersionId ?? P0_VR_DIAG_1R5B_BUILD,
    pageArchetype: fullInput.pageArchetype,
    screenId: fullInput.screenId,
    isRootPage: fullInput.isRootPage,
    pagePurpose: fullInput.pagePurpose,
    route: fullInput.route,
    domMeasurements: fullInput.domMeasurements ?? fullInput.currentCapture.domMeasurements,
    cssSnapshot: fullInput.currentCapture.cssSnapshot,
    shell: shell
      ? {
          headerPaddingX: shell.headerPaddingX,
          contentPaddingX: shell.contentPaddingX,
          sectionGap: shell.sectionGap,
        }
      : null,
    viewportWidth: fullInput.currentCapture.width,
    viewportHeight: fullInput.currentCapture.height,
  });

  return applyForensicUpgradeBundleToSession(projectId, pageId, viewport, bundle, {
    evidenceRecoveryAt: receipt.createdAt,
    recoveryReceipt: receipt,
  });
}

/** Single-region structure analysis (1R5A) — no full-page re-segment. */
export function analyzeSingleRegionStructureForUpgrade(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  regionId: string,
  fullInput: AuthorityRelativeForensicsInput & {
    pagePurpose: string;
    route: string;
    isRootPage?: boolean;
  },
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;

  const stored =
    getForensicReport(session.forensicsReportId) ??
    buildForensicUpgradeBundle(fullInput).report;

  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: fullInput.pageArchetype,
    screenId: fullInput.screenId,
    isRootPage: fullInput.isRootPage,
  });

  const result = analyzeSingleRegionStructure({
    report: stored,
    profile,
    regionId,
    domMeasurements: fullInput.domMeasurements ?? fullInput.currentCapture.domMeasurements,
  });
  if (!result) return null;

  const bundle = recomputeForensicScoringFromReport(result.report, {
    pageArchetype: fullInput.pageArchetype,
    screenId: fullInput.screenId,
    isRootPage: fullInput.isRootPage,
    pagePurpose: fullInput.pagePurpose,
    route: fullInput.route,
    domMeasurements: fullInput.domMeasurements ?? fullInput.currentCapture.domMeasurements,
    structureToDepthTraces: [result.depthTrace],
  });

  return applyForensicUpgradeBundleToSession(projectId, pageId, viewport, bundle, {
    evidenceRecoveryAt: new Date().toISOString(),
  });
}

export function resetPageCreativeUpgradeSessionsForTest(): void {
  sessions.clear();
}
