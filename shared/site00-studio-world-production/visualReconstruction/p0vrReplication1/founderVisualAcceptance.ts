/**
 * P0.VR.REPLICATION.1 — Founder visual acceptance (ACCEPT / REFINE / REJECT).
 */

import type { FounderVisualAcceptance, FounderVisualAcceptanceStatus } from './types.js';

export function createFounderVisualAcceptance(
  status: FounderVisualAcceptanceStatus,
  note: string | null = null,
): FounderVisualAcceptance {
  return {
    status,
    note,
    updatedAt: new Date().toISOString(),
  };
}

export function founderAcceptanceAllowsPromotion(acceptance: FounderVisualAcceptance | null | undefined): boolean {
  return acceptance?.status === 'ACCEPT';
}
