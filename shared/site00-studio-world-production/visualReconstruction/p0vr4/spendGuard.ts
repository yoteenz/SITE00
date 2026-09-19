/**
 * P0.VR.4 — Generation spend guard.
 */

import { MAX_PRIMARY_GENERATION_DISPATCHES, MAX_TARGETED_REVISION_PASSES } from './constants.js';

export function canDispatchPrimaryGeneration(dispatchCount: number): boolean {
  return dispatchCount < MAX_PRIMARY_GENERATION_DISPATCHES;
}

export function recordDispatch(dispatchCount: number): number {
  return dispatchCount + 1;
}

export function explicitFounderActionRequired(dispatchCount: number, revisionCount: number): boolean {
  return (
    dispatchCount >= MAX_PRIMARY_GENERATION_DISPATCHES ||
    revisionCount >= MAX_TARGETED_REVISION_PASSES
  );
}

export function bulkQueueAutoDispatchOnPageLoad(): boolean {
  return false;
}

export function providerDispatchOnGet(): boolean {
  return false;
}

export function providerDispatchOnRefresh(): boolean {
  return false;
}

export function providerDispatchOnOpenPage(): boolean {
  return false;
}

export function providerDispatchOnSelectScreenshot(): boolean {
  return false;
}

export function requiresExplicitFounderDispatch(): boolean {
  return true;
}
