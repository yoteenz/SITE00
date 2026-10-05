/** Global + organization publishing fences — server-side enforcement */

import type { PublishingStatus } from './types.js';

export function isGlobalPublishingEnabled(): boolean {
  return process.env.EVOLVE_EXTERNAL_PUBLISHING_ENABLED === 'true';
}

export function assertPublishingAllowed(orgPublishingStatus: PublishingStatus): void {
  if (!isGlobalPublishingEnabled()) {
    throw new Error('PUBLISHING_DISABLED — global EVOLVE external publishing fence is disabled');
  }
  if (orgPublishingStatus !== 'PILOT_ENABLED' && orgPublishingStatus !== 'ENABLED') {
    throw new Error('ORGANIZATION_PUBLISHING_DISABLED — organization publishing is not enabled');
  }
}

export function publishingFenceState(orgPublishingStatus: PublishingStatus): {
  globalEnabled: boolean;
  orgEnabled: boolean;
  canPublish: boolean;
  reason: string | null;
} {
  const globalEnabled = isGlobalPublishingEnabled();
  const orgEnabled = orgPublishingStatus === 'PILOT_ENABLED' || orgPublishingStatus === 'ENABLED';
  const canPublish = globalEnabled && orgEnabled;
  let reason: string | null = null;
  if (!globalEnabled) reason = 'PUBLISHING_DISABLED';
  else if (!orgEnabled) reason = 'ORGANIZATION_PUBLISHING_DISABLED';
  return { globalEnabled, orgEnabled, canPublish, reason };
}

/** Blocked distribution transitions during Sprint 03 */
export const BLOCKED_DISTRIBUTION_STATES = new Set(['DISPATCHING', 'PUBLISHED']);

export function canTransitionDistributionState(from: string, to: string): { ok: boolean; error?: string } {
  if (BLOCKED_DISTRIBUTION_STATES.has(to)) {
    return { ok: false, error: `Distribution state ${to} requires publishing sprint — blocked` };
  }
  return { ok: true };
}
