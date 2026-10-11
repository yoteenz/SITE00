import type { CalibrationRecord, ProjectEstimateConfig, ProjectEstimateResult, SavedEstimateRecord } from './types';
import { ESTIMATOR_VERSION } from './version';

export function createEstimateRecord(
  config: ProjectEstimateConfig,
  result: ProjectEstimateResult,
  savedAt: string = new Date().toISOString(),
): SavedEstimateRecord {
  return {
    estimatorVersion: ESTIMATOR_VERSION,
    savedAt,
    config: structuredClone(config),
    result: structuredClone(result),
  };
}

export function appendCalibration(store: CalibrationRecord[], record: CalibrationRecord): CalibrationRecord[] {
  return [...store, record];
}

const STORAGE_PREFIX = 'site00.estimator.v1.';

export function saveEstimateLocally(projectKey: string, record: SavedEstimateRecord): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + projectKey, JSON.stringify(record));
}

export function loadEstimateLocally(projectKey: string): SavedEstimateRecord | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_PREFIX + projectKey);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as SavedEstimateRecord;
  if (!parsed.estimatorVersion || !parsed.config || !parsed.result) return null;
  return parsed;
}
