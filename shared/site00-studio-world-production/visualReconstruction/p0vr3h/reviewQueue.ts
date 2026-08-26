/**
 * P0.VR.3H — Composer review queue.
 */

import { isInformationFamilyConfirmed, isAuthFamilyConfirmed } from '../p0vr3g/experiencePageRegistry.js';
import { allowsBatchApproval, requiresIndividualReview } from './classifier.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from './constants.js';
import { getActiveMissingPageCompletionPlan } from './repoScopedPlan.js';
import type { ComposerReviewQueueEntry, ComposerReviewSet } from './types.js';

export function buildComposerReviewQueue(): ComposerReviewQueueEntry[] {
  const plan = getActiveMissingPageCompletionPlan();
  return plan.entries
    .filter((e) => e.authorType === 'COMPOSER' && e.implementationStatus === 'IMPLEMENTED_DRAFT')
    .map((entry) => ({
      queueId: `composer-review:${entry.screenId}`,
      pageId: entry.screenId.replace(/^missing-/, ''),
      projectId: entry.projectId,
      route: entry.route,
      family: entry.family,
      completionMode: entry.completionMode,
      authorType: entry.authorType,
      contentProvenance: [...entry.contentProvenance],
      reviewStatus: entry.reviewStatus,
      reviewDimensions: [...entry.reviewDimensions],
      screenshots: { mobile: null, tablet: null, desktop: null },
      snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
      readyForApproval: !entry.creativeDirectionRequired && !entry.functionalReviewRequired,
    }));
}

export function buildComposerReviewSets(): ComposerReviewSet[] {
  const plan = getActiveMissingPageCompletionPlan();
  const sets: ComposerReviewSet[] = [];

  if (isInformationFamilyConfirmed()) {
    const infoPages = plan.entries.filter(
      (e) =>
        e.projectId === 'SITE00' &&
        e.family === 'INFORMATION' &&
        e.implementationStatus === 'IMPLEMENTED_DRAFT',
    );
    if (infoPages.length) {
      sets.push({
        setId: 'site00-information-pages',
        label: 'SITE 00 INFORMATION PAGES',
        projectId: 'SITE00',
        familyConfirmed: true,
        pageIds: infoPages.map((p) => p.screenId.replace(/^missing-/, '')),
        batchApprovalAllowed: infoPages.every((p) => allowsBatchApproval(p.completionMode)),
      });
    }
  }

  if (isAuthFamilyConfirmed()) {
    const authPages = plan.entries.filter(
      (e) =>
        e.projectId === 'SITE00' &&
        e.family === 'AUTH' &&
        e.implementationStatus === 'IMPLEMENTED_DRAFT',
    );
    if (authPages.length) {
      sets.push({
        setId: 'site00-auth-utilities',
        label: 'SITE 00 AUTH UTILITIES',
        projectId: 'SITE00',
        familyConfirmed: true,
        pageIds: authPages.map((p) => p.screenId.replace(/^missing-/, '')),
        batchApprovalAllowed: authPages.every((p) => allowsBatchApproval(p.completionMode)),
      });
    }
  }

  const ndxGaps = plan.entries.filter((e) => e.projectId === 'NDXBOOK');
  if (ndxGaps.length) {
    sets.push({
      setId: 'ndxbook-design-pilot-gaps',
      label: 'NDXBOOK DESIGN PILOT GAPS',
      projectId: 'NDXBOOK',
      familyConfirmed: false,
      pageIds: ndxGaps.map((p) => p.screenId),
      batchApprovalAllowed: false,
    });
  }

  return sets;
}

export function canBatchApproveReviewSet(setId: string): boolean {
  const set = buildComposerReviewSets().find((s) => s.setId === setId);
  if (!set) return false;
  if (!set.batchApprovalAllowed) return false;
  const plan = getActiveMissingPageCompletionPlan();
  const entries = plan.entries.filter((e) => set.pageIds.includes(e.screenId.replace(/^missing-/, '')) || set.pageIds.includes(e.screenId));
  return entries.every((e) => !requiresIndividualReview(e.completionMode) || allowsBatchApproval(e.completionMode));
}

export function blockComplexPageBulkApproval(pageIds: string[]): boolean {
  const plan = getActiveMissingPageCompletionPlan();
  return pageIds.some((id) => {
    const entry = plan.entries.find((e) => e.screenId.includes(id) || e.screenId.replace(/^missing-/, '') === id);
    return entry ? requiresIndividualReview(entry.completionMode) : false;
  });
}
