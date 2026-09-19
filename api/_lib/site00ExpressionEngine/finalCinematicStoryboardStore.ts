/**
 * Sprint B4.9 / B4.9R / B4.9R2 / B4.9R3 / B4.9R4 — Final cinematic storyboard store.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

let historicalRecord001: FinalCinematicStoryboardRecord | null = null;
let historicalRecord002: FinalCinematicStoryboardRecord | null = null;
let historicalRecord003: FinalCinematicStoryboardRecord | null = null;
let historicalRecord004: FinalCinematicStoryboardRecord | null = null;
let historicalRecord005: FinalCinematicStoryboardRecord | null = null;
let currentRecord: FinalCinematicStoryboardRecord | null = null;

export function resetFinalCinematicStoryboardStore(): void {
  historicalRecord001 = null;
  historicalRecord002 = null;
  historicalRecord003 = null;
  historicalRecord004 = null;
  historicalRecord005 = null;
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

export function saveStoryboard004HistoricalRecord(record: FinalCinematicStoryboardRecord): void {
  historicalRecord004 = record;
}

export function getStoryboard004HistoricalRecord(): FinalCinematicStoryboardRecord | null {
  return historicalRecord004;
}

export function saveStoryboard005HistoricalRecord(record: FinalCinematicStoryboardRecord): void {
  historicalRecord005 = record;
}

export function getStoryboard005HistoricalRecord(): FinalCinematicStoryboardRecord | null {
  return historicalRecord005;
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

/** Valid when generated QA passed OR founder-supplied import awaiting review. */
export function hasValidFinalCinematicStoryboard(): boolean {
  if (!currentRecord) return false;

  if (currentRecord.storyboardSource === 'FOUNDER_SUPPLIED') {
    return (
      currentRecord.storyboardId === ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID &&
      currentRecord.status === 'AWAITING_FOUNDER_APPROVAL' &&
      currentRecord.readinessState === 'VISUAL_REVIEW_READY' &&
      currentRecord.rendered === true
    );
  }

  return (
    currentRecord.storyboardId === ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID &&
    currentRecord.generationMode === 'REEL_FIRST_SINGLE_ARTIFACT' &&
    currentRecord.status === 'AWAITING_FOUNDER_APPROVAL' &&
    currentRecord.readinessState === 'VISUAL_REVIEW_READY' &&
    currentRecord.structuralQaStatus === 'PASS' &&
    currentRecord.continuityQaStatus === 'PASS' &&
    currentRecord.renderModeQaStatus === 'PASS' &&
    currentRecord.reelCoherenceQaStatus === 'PASS' &&
    currentRecord.boardTypeQaStatus === 'PASS' &&
    currentRecord.visualAuthorityFidelityQaStatus === 'PASS' &&
    currentRecord.telemetry.storyboardRenderCount === 1 &&
    currentRecord.telemetry.panelRenderCount === 0 &&
    (currentRecord.telemetry.providerAuthorityImageInputCount ?? 0) === 5
  );
}

export function isFounderReviewableStoryboard(record: FinalCinematicStoryboardRecord | null): boolean {
  if (!record) return false;
  if (record.storyboardSource === 'FOUNDER_SUPPLIED') {
    return record.status === 'AWAITING_FOUNDER_APPROVAL' && record.rendered;
  }
  return hasValidFinalCinematicStoryboard();
}

/** @deprecated */
export function hasGeneratedFinalCinematicStoryboard(): boolean {
  return hasValidFinalCinematicStoryboard();
}
