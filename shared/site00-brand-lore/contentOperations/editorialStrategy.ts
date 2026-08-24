/**
 * NDX Editorial Strategy — manage NDX as whole character over time.
 */

import { createHash } from 'node:crypto';
import type { NDXEditorialStrategy } from './types.js';

export function buildDefaultEditorialStrategy(projectId: string): NDXEditorialStrategy {
  return {
    id: `eds-${projectId}`,
    projectId,
    desiredRange: [
      'QUICK CATCHES',
      'RABBIT HOLES',
      'CULTURAL REASSESSMENTS',
      'FAILED PROMISES',
      'RECEIPTS',
      'SELF-CORRECTIONS',
      'CONNECTIONS',
      'SERIOUS INVESTIGATIONS',
      'USEFUL DISCOVERIES',
      'HISTORICAL CALLBACKS',
      'EVERYDAY ABSURDITIES',
      'GENUINE WONDER',
      'OPEN QUESTIONS',
      'PRACTICAL INTELLIGENCE',
      'CONVERSATIONS',
    ],
    balanceGuidance: [
      'Detect TOO_MUCH_SNARK, TOO_MUCH_FINANCE, TOO_MUCH_NOSTALGIA, TOO_MUCH_SERIOUSNESS',
      'Detect TOO_MUCH_SAME_FORMAT, TOO_MUCH_SAME_BEHAVIOR, TOO_MANY_CONCLUSIONS',
      'Preserve TOO_FEW_OPEN_QUESTIONS, TOO_FEW_SELF_CORRECTIONS, TOO_FEW_HUMAN_MOMENTS',
      'Flag TOO_MUCH_TREND_CHASING',
    ],
    avoidOverindexing: ['virality', 'engagement-chasing', 'nostalgia-only', 'snark-only'],
    fingerprint: createHash('sha256').update(projectId).digest('hex').slice(0, 16),
  };
}

export function editorialStrategyImplemented(): true {
  return true;
}
