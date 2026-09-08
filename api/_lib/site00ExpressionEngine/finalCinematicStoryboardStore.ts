/**
 * Sprint B4.9 / B4.9R / B4.9R2 / B4.9R3 — Final cinematic storyboard store.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

let historicalRecord001: FinalCinematicStoryboardRecord | null = null;
let historicalRecord002: FinalCinematicStoryboardRecord | null = null;
let historicalRecord003: FinalCinematicStoryboardRecord | null = null;
let currentRecord: FinalCinematicStoryboardRecord | null = null;

export function resetFinalCinematicStoryboardStore(): void {
  historicalRecord001 = null;
  historicalRecord002 = null;
  historicalRecord003 = null;
  currentRecord = null;
}

export function saveStoryboard001HistoricalRecord(record: FinalCinematicStoryboardRecord): void {
  historicalRecord001 = record;
}

export function getStoryboard001HistoricalRecord(): FinalCinematicStoryboardRecord | null {
  return historicalRecord001;
}

export function saveStoryboard002HistoricalRecord(record: FinalCinematicStoryboardRecord): void {
  historicalRecord002 = record;
}

export function getStoryboard002HistoricalRecord(): FinalCinematicStoryboardRecord | null {
  return historicalRecord002;
}

export function saveStoryboard003HistoricalRecord(record: FinalCinematicStoryboardRecord): void {
  historicalRecord003 = record;
}

export function getStoryboard003HistoricalRecord(): FinalCinematicStoryboardRecord | null {
  return historicalRecord003;
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

/** Valid only when reel-first QA passed and status is reviewable. */
export function hasValidFinalCinematicStoryboard(): boolean {
  if (!currentRecord) return false;
  return (
    currentRecord.storyboardId === ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID &&
    currentRecord.generationMode === 'REEL_FIRST_SINGLE_ARTIFACT' &&
    currentRecord.status === 'AWAITING_FOUNDER_APPROVAL' &&
    currentRecord.structuralQaStatus === 'PASS' &&
    currentRecord.continuityQaStatus === 'PASS' &&
    currentRecord.renderModeQaStatus === 'PASS' &&
    currentRecord.reelCoherenceQaStatus === 'PASS' &&
    currentRecord.boardTypeQaStatus === 'PASS' &&
    currentRecord.telemetry.storyboardRenderCount === 1 &&
    currentRecord.telemetry.panelRenderCount === 0
  );
}

/** @deprecated */
export function hasGeneratedFinalCinematicStoryboard(): boolean {
  return hasValidFinalCinematicStoryboard();
}
