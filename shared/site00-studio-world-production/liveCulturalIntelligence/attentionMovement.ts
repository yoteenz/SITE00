/**
 * P0.5D.2 — Attention movement signal (honest NOT_CONNECTED when unavailable).
 */

import type { AttentionMovementSignal } from './types.js';

export function buildAttentionMovementNotConnected(): AttentionMovementSignal {
  return {
    query: '',
    baseline: null,
    currentLevel: null,
    relativeMovement: null,
    movementDirection: 'UNKNOWN',
    captureWindow: '',
    region: '',
    source: 'SEARCH_TRENDS',
    confidence: 0,
    status: 'NOT_CONNECTED',
  };
}

export function searchAttentionNotInvented(signal: AttentionMovementSignal): boolean {
  return signal.status === 'NOT_CONNECTED' ? signal.currentLevel === null : true;
}
