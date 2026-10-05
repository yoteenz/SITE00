/**
 * P0.VR.CAPTURE.1 — Founder next action for page upgrade workflow.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { derivePageViewportCaptureStatus, getPageViewportCapture } from './pageViewportCapture.js';
import { getPageCreativeUpgradeSession } from './pageCreativeUpgradeSession.js';
import {
  resolvePageViewportAuthority,
  resolveRootUpgradePrimaryAction,
} from '../../pageFamilyWorkspace/pageViewportAuthority.js';
import type { PageUpgradeNextActionReceipt } from './types.js';

export function resolvePageUpgradeNextAction(options: {
  projectId: string;
  pageId: string;
  screenId?: string;
  viewport: DesignViewportClass;
  captureServiceAvailable: boolean;
  isRoot?: boolean;
  routeMapped?: boolean;
}): PageUpgradeNextActionReceipt {
  if (!options.captureServiceAvailable) {
    return {
      action: 'FIX_CAPTURE_SERVICE',
      label: 'FIX CAPTURE SERVICE',
      reason: 'Capture worker unavailable — page family work remains open.',
    };
  }

  const capture = getPageViewportCapture(options.projectId, options.pageId, options.viewport);
  const captureStatus = derivePageViewportCaptureStatus(capture);
  const session = getPageCreativeUpgradeSession(options.projectId, options.pageId, options.viewport);

  if (captureStatus === 'NO_LIVE_CAPTURE' || captureStatus === 'CAPTURE_OUTDATED') {
    return {
      action: captureStatus === 'CAPTURE_OUTDATED' ? 'RECAPTURE' : 'CAPTURE_THIS_PAGE',
      label: captureStatus === 'CAPTURE_OUTDATED' ? 'RECAPTURE' : 'CAPTURE NOW',
      reason: 'Live capture required before creative-directed upgrade.',
    };
  }

  if (captureStatus === 'CAPTURE_FAILED') {
    return { action: 'RECAPTURE', label: 'RETRY', reason: 'Last capture failed.' };
  }

  if (options.screenId) {
    const authority = resolvePageViewportAuthority({
      projectId: options.projectId,
      pageId: options.pageId,
      screenId: options.screenId,
      viewport: options.viewport,
      routeMapped: options.routeMapped,
      isRoot: options.isRoot,
    });
    if (resolveRootUpgradePrimaryAction(authority) === 'SET_DESIGN_AUTHORITY') {
      return {
        action: 'REVIEW_CREATIVE_DIRECTION',
        label: 'SET DESIGN AUTHORITY',
        reason: 'Approved design reference required before upgrade.',
      };
    }
  }

  if (!session || session.status === 'AWAITING_CAPTURE') {
    return {
      action: 'REVIEW_CREATIVE_DIRECTION',
      label: 'UPGRADE THIS PAGE',
      reason: 'Capture ready — open creative direction.',
    };
  }

  if (session.status === 'DIRECTION_READY') {
    return {
      action: 'APPROVE_PAGE',
      label: 'APPROVE DIRECTION',
      reason: 'Review current vs proposed before build.',
    };
  }

  if (
    session.status === 'APPROVED' ||
    session.status === 'DIRECTION_APPROVED' ||
    session.status === 'BUILDING' ||
    session.status === 'BUILD_COMPLETE'
  ) {
    return { action: 'VERIFY_BUILD', label: 'VERIFY BUILD', reason: 'Build should preserve function.' };
  }

  if (session.status === 'COMPLETE') {
    return { action: 'MOVE_TO_NEXT_PAGE', label: 'NEXT PAGE', reason: 'Page upgrade verified.' };
  }

  return {
    action: 'CAPTURE_THIS_PAGE',
    label: 'CAPTURE NOW',
    reason: 'Start page-scoped capture.',
  };
}
