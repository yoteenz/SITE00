import type { PrecheckResult } from './types.js';

/** Human-readable production workspace labels — no internal debug dump. */
export function humanReadablePrecheckStatus(precheck: PrecheckResult): string {
  if (precheck.dispatchAllowed) {
    if (precheck.generationMode === 'TEXT_TO_IMAGE_NET_NEW') return 'NET-NEW GENERATION';
    if (precheck.referenceAttached) return 'REFERENCE-GUIDED';
    return 'REFERENCE READY';
  }
  if (precheck.blockedReason === 'REFERENCE_MISSING') return 'BLOCKED — REFERENCE REQUIRED';
  if (precheck.blockedReason === 'REFERENCE_BINDING_FAILURE_PREVENTED') return 'BLOCKED — REFERENCE NOT ATTACHED';
  return 'BLOCKED — REFERENCE GATE';
}
