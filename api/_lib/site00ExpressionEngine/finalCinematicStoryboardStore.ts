/**
 * Sprint B4.9 — Final cinematic storyboard store.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

let storedRecord: FinalCinematicStoryboardRecord | null = null;

export function resetFinalCinematicStoryboardStore(): void {
  storedRecord = null;
}

export function getFinalCinematicStoryboardRecord(): FinalCinematicStoryboardRecord | null {
  return storedRecord;
}

export function saveFinalCinematicStoryboardRecord(record: FinalCinematicStoryboardRecord): FinalCinematicStoryboardRecord {
  storedRecord = record;
  return record;
}

export function hasGeneratedFinalCinematicStoryboard(): boolean {
  return storedRecord !== null && storedRecord.rendered === true;
}
