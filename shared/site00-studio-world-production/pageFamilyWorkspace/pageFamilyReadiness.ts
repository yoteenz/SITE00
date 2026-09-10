/**
 * P0.PCI.3 / P0.PCI.3R1 — PageFamilyReadiness + project progress (capture decoupled).
 */

import type {
  PageFamily,
  PageFamilyReadiness,
  PageFamilyRowInput,
  ProjectProgressSummary,
} from './types.js';
import { getFamilyApprovals } from './pageFamilyStore.js';
import {
  captureStatusLabel,
  derivePageFamilyDependencySnapshot,
  type CaptureServiceInput,
} from './pageFamilyDependencyPolicy.js';
import { buildPageFamilyFromRows } from './pageFamilyBuilder.js';

function countStatus(rows: PageFamilyRowInput[], predicate: (row: PageFamilyRowInput) => boolean): number | null {
  if (!rows.length) return null;
  return rows.filter(predicate).length;
}

export function buildProjectProgressSummary(rows: PageFamilyRowInput[], projectId?: string): ProjectProgressSummary {
  const totalPages = rows.length || null;

  const current = countStatus(rows, (r) => {
    const s = (r.resolvedCaptureState ?? r.pageCaptureStatus ?? r.mobile?.status ?? '').toUpperCase();
    return s === 'CURRENT';
  });

  const needReview = countStatus(rows, (r) => {
    const s = (r.resolvedCaptureState ?? r.pageCaptureStatus ?? '').toUpperCase();
    return s === 'FAILED' || s === 'CAPTURE_FAILED';
  });

  const notCaptured = countStatus(rows, (r) => {
    const s = (r.resolvedCaptureState ?? r.pageCaptureStatus ?? '').toUpperCase();
    return r.neverCaptured || s === 'NEVER_CAPTURED' || !r.mobile?.publicUrl;
  });

  const stale = countStatus(rows, (r) => r.isStale === true);

  let familyCount: number | null = null;
  let needDesignReview: number | null = null;
  let wiringIssues: number | null = null;

  if (projectId && rows.length) {
    const family = buildPageFamilyFromRows({ projectId, rows });
    familyCount = 1;
    const readiness = derivePageFamilyReadiness(family);
    needDesignReview = readiness.needsDesignCount;
    wiringIssues = readiness.wiringIssueCount > 0 ? readiness.wiringIssueCount : null;
  }

  const chips: ProjectProgressSummary['chips'] = [];
  if (totalPages != null) chips.push({ label: 'PAGES', value: totalPages, tone: 'neutral' });
  if (familyCount != null) chips.push({ label: 'FAMILIES', value: familyCount, tone: 'neutral' });
  if (needDesignReview != null && needDesignReview > 0) {
    chips.push({ label: 'NEED DESIGN REVIEW', value: needDesignReview, tone: 'attention' });
  }
  if (wiringIssues != null && wiringIssues > 0) {
    chips.push({ label: 'WIRING ISSUES', value: wiringIssues, tone: 'attention' });
  }
  if (notCaptured != null && notCaptured > 0) {
    chips.push({ label: 'CAPTURE PENDING', value: notCaptured, tone: 'neutral' });
  }
  if (current != null && current > 0) chips.push({ label: 'CURRENT', value: current, tone: 'ready' });
  if (needReview != null && needReview > 0) chips.push({ label: 'NEED REVIEW', value: needReview, tone: 'attention' });
  if (stale != null && stale > 0) chips.push({ label: 'NEEDS REFRESH', value: stale, tone: 'neutral' });

  return {
    totalPages: totalPages ?? 0,
    familyCount,
    current,
    needReview,
    needDesignReview,
    wiringIssues,
    notCaptured,
    stale,
    chips,
  };
}

export function derivePageFamilyReadiness(
  family: PageFamily,
  captureService?: CaptureServiceInput,
): PageFamilyReadiness {
  const approvals = getFamilyApprovals(family.familyId);
  const approvedIds = new Set(approvals.filter((a) => a.designApproved).map((a) => a.nodeId));

  const derivatives = family.nodes.filter((n) => n.level > 0);
  const approvedCount = derivatives.filter((n) => approvedIds.has(n.nodeId) || n.designStatus === 'APPROVED').length;
  const needsDesignCount = derivatives.filter(
    (n) => !approvedIds.has(n.nodeId) && (n.designStatus === 'PROPOSED' || n.designStatus === 'DESIGN_PENDING'),
  ).length;
  const wiringIssueCount = family.edges.filter((e) => e.linkageStatus !== 'WIRED').length;
  const capturePendingCount = derivatives.filter((n) => n.captureStatus === 'CAPTURE_PENDING').length;

  const structureConfirmed = family.status === 'STRUCTURE_CONFIRMED' || family.status === 'DESIGN_IN_PROGRESS';

  const serviceInput: CaptureServiceInput = captureService ?? {
    apiConnected: true,
    workerHealthy: true,
    browserReady: true,
    contractValid: true,
  };

  const dimensions = derivePageFamilyDependencySnapshot({
    structureConfirmed,
    approvedCount,
    derivativeCount: derivatives.length,
    wiringIssueCount,
    captureService: serviceInput,
    capturePendingCount,
  });

  let completionPct: number | null = null;
  if (derivatives.length > 0) completionPct = Math.round((approvedCount / derivatives.length) * 100);

  const summaryLabel =
    wiringIssueCount > 0
      ? `${wiringIssueCount} WIRING ISSUE${wiringIssueCount === 1 ? '' : 'S'}`
      : needsDesignCount > 0
        ? `${needsDesignCount} NEED DESIGN`
        : structureConfirmed
          ? 'READY FOR REVIEW'
          : 'DESIGN IN PROGRESS';

  return {
    structureStatus: structureConfirmed ? 'READY' : 'NEEDS_CONFIRMATION',
    designStatus: needsDesignCount > 0 ? 'IN_PROGRESS' : approvedCount === derivatives.length && derivatives.length > 0 ? 'READY' : 'PENDING',
    wiringStatus: wiringIssueCount > 0 ? 'ISSUES' : structureConfirmed ? 'READY' : 'IN_PROGRESS',
    buildStatus: derivatives.every((n) => n.buildStatus === 'BUILT' || n.existing) ? 'READY' : 'IN_PROGRESS',
    linkageStatus: wiringIssueCount > 0 ? 'ISSUES' : 'READY',
    captureStatus: dimensions.capture === 'UNAVAILABLE' ? 'UNAVAILABLE' : capturePendingCount > 0 ? 'PENDING' : 'READY',
    approvedCount,
    needsDesignCount,
    wiringIssueCount,
    capturePendingCount,
    completionPct,
    attentionCount: needsDesignCount + wiringIssueCount,
    summaryLabel,
    dimensions: {
      structure: captureStatusLabel(dimensions.structure),
      design: captureStatusLabel(dimensions.design),
      wiring: captureStatusLabel(dimensions.wiring),
      capture: captureStatusLabel(dimensions.capture),
    },
  };
}
