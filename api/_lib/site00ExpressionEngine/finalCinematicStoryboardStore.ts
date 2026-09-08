/**
 * Sprint B4.9 / B4.9R — Final cinematic storyboard store.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

let historicalRecord001: FinalCinematicStoryboardRecord | null = null;
let currentRecord: FinalCinematicStoryboardRecord | null = null;

export function resetFinalCinematicStoryboardStore(): void {
  historicalRecord001 = null;
  currentRecord = null;
}

export function saveStoryboard001HistoricalRecord(record: FinalCinematicStoryboardRecord): void {
  historicalRecord001 = record;
}

export function getStoryboard001HistoricalRecord(): FinalCinematicStoryboardRecord | null {
  return historicalRecord001;
}

export function getFinalCinematicStoryboardRecord(): FinalCinematicStoryboardRecord | null {
  return currentRecord;
}

export function saveFinalCinematicStoryboardRecord(
  record: FinalCinematicStoryboardRecord,
): FinalCinematicStoryboardRecord {
  currentRecord = record;
  return record;
}

/** Valid only when structural + continuity QA passed and status is reviewable. */
export function hasValidFinalCinematicStoryboard(): boolean {
  if (!currentRecord) return false;
  return (
    currentRecord.storyboardId === ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID &&
    currentRecord.status === 'AWAITING_FOUNDER_APPROVAL' &&
    currentRecord.structuralQaStatus === 'PASS' &&
    currentRecord.continuityQaStatus === 'PASS' &&
    currentRecord.telemetry.panelRenderCount >= currentRecord.panelCount
  );
}

/** @deprecated B4.9 — do not use for structure validation */
export function hasGeneratedFinalCinematicStoryboard(): boolean {
  return hasValidFinalCinematicStoryboard();
}
