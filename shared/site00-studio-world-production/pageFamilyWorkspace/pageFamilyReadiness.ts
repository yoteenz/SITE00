/**
 * P0.PCI.3 — PageFamilyReadiness + project progress from real row data.
 */

import type {
  PageFamily,
  PageFamilyReadiness,
  PageFamilyRowInput,
  ProjectProgressSummary,
} from './types.js';
import { getFamilyApprovals } from './pageFamilyStore.js';

function countStatus(rows: PageFamilyRowInput[], predicate: (row: PageFamilyRowInput) => boolean): number | null {
  if (!rows.length) return null;
  return rows.filter(predicate).length;
}

export function buildProjectProgressSummary(rows: PageFamilyRowInput[]): ProjectProgressSummary {
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

  const chips: ProjectProgressSummary['chips'] = [];
  if (totalPages != null) chips.push({ label: 'PAGES', value: totalPages, tone: 'neutral' });
  if (current != null && current > 0) chips.push({ label: 'CURRENT', value: current, tone: 'ready' });
  if (needReview != null && needReview > 0) chips.push({ label: 'NEED REVIEW', value: needReview, tone: 'attention' });
  if (notCaptured != null && notCaptured > 0) chips.push({ label: 'NOT CAPTURED', value: notCaptured, tone: 'attention' });
  if (stale != null && stale > 0) chips.push({ label: 'NEEDS REFRESH', value: stale, tone: 'neutral' });

  return { totalPages: totalPages ?? 0, current, needReview, notCaptured, stale, chips };
}

export function derivePageFamilyReadiness(family: PageFamily): PageFamilyReadiness {
  const approvals = getFamilyApprovals(family.familyId);
  const approvedIds = new Set(approvals.filter((a) => a.designApproved).map((a) => a.nodeId));

  const derivatives = family.nodes.filter((n) => n.level > 0);
  const approvedCount = derivatives.filter((n) => approvedIds.has(n.nodeId) || n.designStatus === 'APPROVED').length;
  const needsDesignCount = derivatives.filter(
    (n) => !approvedIds.has(n.nodeId) && (n.designStatus === 'PROPOSED' || n.designStatus === 'DESIGN_PENDING'),
  ).length;
  const wiringIssueCount = family.edges.filter((e) => e.linkageStatus !== 'WIRED').length;

  const structureConfirmed = family.status === 'STRUCTURE_CONFIRMED' || family.status === 'DESIGN_IN_PROGRESS';
  const capturePending = derivatives.some((n) => n.captureStatus === 'CAPTURE_PENDING');

  let completionPct: number | null = null;
  if (derivatives.length > 0) completionPct = Math.round((approvedCount / derivatives.length) * 100);

  return {
    structureStatus: structureConfirmed ? 'READY' : 'NEEDS_CONFIRMATION',
    designStatus: needsDesignCount > 0 ? 'IN_PROGRESS' : approvedCount === derivatives.length ? 'READY' : 'IN_PROGRESS',
    buildStatus: derivatives.every((n) => n.buildStatus === 'BUILT' || n.existing) ? 'READY' : 'IN_PROGRESS',
    linkageStatus: wiringIssueCount > 0 ? 'ISSUES' : 'READY',
    captureStatus: capturePending ? 'PENDING' : 'READY',
    approvedCount,
    needsDesignCount,
    wiringIssueCount,
    completionPct,
    attentionCount: needsDesignCount + wiringIssueCount,
    summaryLabel:
      wiringIssueCount > 0
        ? `${wiringIssueCount} WIRING ISSUE${wiringIssueCount === 1 ? '' : 'S'}`
        : needsDesignCount > 0
          ? `${needsDesignCount} NEED DESIGN`
          : 'FAMILY READY',
  };
}
