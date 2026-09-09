/**
 * P0.VR.6R8 — Founder action UX repackaging tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  syncFounderActionsFromJob,
  resolveFounderActionsByGate,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderActionRouter.js';
import {
  buildSkinsMobileMultiAssetReconstructionJob,
  approveAllCrops,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import {
  createInitialWorkflowState,
  approveAllCropsInWorkflow,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import { prepareAllCropReviewsForApproval } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import {
  dedupeFounderActionsForNotifications,
  getAssetsAlertActions,
  syncFounderActionNotifications,
  founderActionNotificationTitle,
  founderActionNotificationBody,
  buildFounderActionDeepLinkHref,
  markFounderActionNotificationRead,
  resetFounderActionReadStateForTest,
  countUnreadFounderActionNotifications,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderActionNotifications.js';
import { resetReconstructionWorkflowForTest } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';
import { R8_FAILURE_CODES } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderAction.js';

function blockedCropJob() {
  return buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  })!;
}

describe('P0.VR.6R8 — Founder action UX repackaging', () => {
  beforeEach(() => {
    resetReconstructionWorkflowForTest();
    resetFounderActionReadStateForTest();
  });

  it('1. blocked crop job creates DesignFounderAction', () => {
    const job = blockedCropJob();
    const actions = syncFounderActionsFromJob(job);
    expect(actions.some((a) => a.actionType === 'REVIEW_CROPS' && a.status === 'PENDING')).toBe(true);
  });

  it('2. assets alert actions render set', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const alerts = getAssetsAlertActions(actions);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]!.workspace).toBe('ASSETS');
  });

  it('3. assets tab badge count source', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const pending = actions.filter((a) => a.workspace === 'ASSETS' && a.status === 'PENDING' && a.blocking);
    expect(pending.length).toBeGreaterThan(0);
  });

  it('4. bell badge unread count', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    expect(countUnreadFounderActionNotifications(actions, {})).toBe(1);
  });

  it('5. bell popover notification list', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const notifs = syncFounderActionNotifications(actions, {});
    expect(notifs.length).toBe(1);
    expect(notifs[0]!.type).toBe('FOUNDER_RECONSTRUCTION_ACTION');
  });

  it('6. notification uses light-theme metadata (not dark panel)', () => {
    const notif = syncFounderActionNotifications(syncFounderActionsFromJob(blockedCropJob()), {})[0]!;
    expect(notif.category).toBe('APPROVAL_REQUIRED');
    expect(notif.sourceSystem).toBe('REFERENCE_RECONSTRUCTION');
  });

  it('7. notification copy is founder-friendly', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const action = dedupeFounderActionsForNotifications(actions)[0]!;
    expect(founderActionNotificationTitle(action.actionType)).toBe('CROP REVIEW REQUIRED');
    expect(founderActionNotificationBody(action)).toMatch(/assets detected/i);
    expect(founderActionNotificationBody(action)).not.toMatch(/cropApprovalStatus/i);
  });

  it('8. one multi-asset job = one crop notification', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const deduped = dedupeFounderActionsForNotifications(actions);
    const cropNotifs = deduped.filter((a) => a.actionType === 'REVIEW_CROPS');
    expect(cropNotifs.length).toBe(1);
  });

  it('9. action deep-link opens correct project', () => {
    const action = dedupeFounderActionsForNotifications(syncFounderActionsFromJob(blockedCropJob()))[0]!;
    const href = buildFounderActionDeepLinkHref(action.projectId, action.deepLink);
    expect(href).toContain('/projects/site00/design');
    expect(href).toContain('project=site00');
  });

  it('10. action deep-link opens Assets + crop stage', () => {
    const action = getAssetsAlertActions(syncFounderActionsFromJob(blockedCropJob()))[0]!;
    const href = buildFounderActionDeepLinkHref(action.projectId, action.deepLink);
    expect(href).toContain('tab=assets');
    expect(href).toContain('rriAction=review-crops');
    expect(href).toContain('jobId=');
  });

  it('11. reading notification does not resolve action', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const action = dedupeFounderActionsForNotifications(actions)[0]!;
    markFounderActionNotificationRead(action.actionId);
    expect(actions.find((a) => a.actionId === action.actionId)!.status).toBe('PENDING');
  });

  it('12. crop completion resolves crop action', () => {
    let actions = syncFounderActionsFromJob(blockedCropJob());
    const job = approveAllCrops(blockedCropJob());
    actions = resolveFounderActionsByGate(actions, job.jobId, 'REVIEW_CROPS');
    expect(actions.filter((a) => a.actionType === 'REVIEW_CROPS' && a.status === 'PENDING')).toHaveLength(0);
  });

  it('13. generation action follows crop action', () => {
    let state = createInitialWorkflowState()!;
    state = { ...state, cropReviews: prepareAllCropReviewsForApproval(state.cropReviews) };
    const next = approveAllCropsInWorkflow(state);
    const pending = next.actions.filter((a) => a.status === 'PENDING');
    expect(pending.some((a) => a.actionType === 'APPROVE_GENERATION')).toBe(true);
    expect(pending.some((a) => a.actionType === 'REVIEW_CROPS')).toBe(false);
  });

  it('14. no duplicate notifications by dedupe key', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    const notifs = syncFounderActionNotifications(actions, {});
    const keys = notifs.map((n) => n.dedupeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('15. stale resolved notifications suppressed', () => {
    let actions = syncFounderActionsFromJob(blockedCropJob());
    const job = blockedCropJob();
    actions = resolveFounderActionsByGate(actions, job.jobId, 'REVIEW_CROPS');
    const notifs = syncFounderActionNotifications(actions, {});
    expect(notifs.some((n) => n.dedupeKey?.includes('REVIEW_CROPS'))).toBe(false);
  });

  it('16. skins contextual action exists in job sync', () => {
    const actions = syncFounderActionsFromJob(blockedCropJob());
    expect(actions.some((a) => a.workspace === 'SKINS' && a.actionType === 'REVIEW_CROPS')).toBe(true);
  });

  it('17. current blocked job migrates on init', () => {
    const state = createInitialWorkflowState();
    expect(state?.actions.length).toBeGreaterThan(0);
    expect(getAssetsAlertActions(state!.actions).length).toBeGreaterThan(0);
  });

  it('18. mobile-friendly alert context fields', () => {
    const action = getAssetsAlertActions(syncFounderActionsFromJob(blockedCropJob()))[0]!;
    expect(action.context.screenLabel).toBe('SKINS MOBILE');
    expect(action.context.projectLabel).toBe('NDXBOOK');
  });

  it('19. desktop deep link includes viewport', () => {
    const job = blockedCropJob();
    const action = getAssetsAlertActions(syncFounderActionsFromJob(job))[0]!;
    expect(action.deepLink).toContain('viewport=MOBILE');
  });

  it('20. R8 failure codes registered', () => {
    expect(R8_FAILURE_CODES).toContain('FOUNDER_ACTION_NOTIFICATION_DUPLICATE');
    expect(R8_FAILURE_CODES.length).toBeGreaterThanOrEqual(9);
  });
});
